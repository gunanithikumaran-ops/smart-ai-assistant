from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.schemas import (
    ChatRequest,
    ChatResponse,
    RegenerateRequest,
    HealthResponse,
    MessageResponse,
)
from app.services.chat_service import ChatService
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])

@router.get("/health", response_model=HealthResponse, summary="Check AI service status")
def check_health():
    """Returns AI service connection status and configured providers."""
    settings.reload()
    active = AIService.get_active_provider()
    has_gemini = bool(settings.GEMINI_API_KEY)
    has_openai = bool(settings.OPENAI_API_KEY)

    if active:
        msg = f"AI Provider '{active}' is connected and ready."
    else:
        msg = "No AI API key found. Please configure GEMINI_API_KEY or OPENAI_API_KEY in backend/.env."

    return HealthResponse(
        status="ready" if active else "configuration_needed",
        gemini_configured=has_gemini,
        openai_configured=has_openai,
        active_provider=active,
        message=msg,
    )

@router.post("", response_model=ChatResponse, summary="Send message and get AI response")
def send_chat(payload: ChatRequest, db: Session = Depends(get_db)):
    """
    Send a user message:
    - Maintains conversation context by loading previous turns.
    - Automatically creates a new conversation and smart title if not provided.
    - Stores both user and AI messages in SQLite database.
    """
    conversation_id = payload.conversation_id
    prompt = payload.message.strip()

    if not prompt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message cannot be empty.")

    # 1. Ensure conversation exists or create one
    is_new_conversation = False
    new_title = None

    if not conversation_id:
        conv = ChatService.create_conversation(db, title="New Chat")
        conversation_id = conv.id
        is_new_conversation = True
    else:
        conv = ChatService.get_conversation(db, conversation_id)
        if not conv:
            conv = ChatService.create_conversation(db, title="New Chat")
            conversation_id = conv.id
            is_new_conversation = True

    # 2. Retrieve conversation history for context (limit to last 20 messages)
    existing_messages = ChatService.get_messages(db, conversation_id, limit=20)
    history = [
        {"role": msg.role, "content": msg.content}
        for msg in existing_messages
    ]

    # 3. Store user message in DB
    user_msg = ChatService.add_message(db, conversation_id, role="user", content=prompt)

    # 4. Generate AI response with context
    try:
        ai_reply = AIService.generate_response(prompt=prompt, history=history)
    except HTTPException:
        # Re-raise HTTPException (e.g. missing API key with setup guidance)
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating AI response: {str(e)}"
        )

    # 5. Store AI assistant message in DB
    assistant_msg = ChatService.add_message(db, conversation_id, role="assistant", content=ai_reply)

    # 6. If this was a new chat, auto-generate a smart title
    if is_new_conversation or conv.title == "New Chat":
        try:
            generated_title = AIService.generate_title(prompt)
            ChatService.update_conversation_title(db, conversation_id, generated_title)
            new_title = generated_title
        except Exception:
            new_title = conv.title

    return ChatResponse(
        conversation_id=conversation_id,
        user_message=MessageResponse.from_orm(user_msg),
        assistant_message=MessageResponse.from_orm(assistant_msg),
        title=new_title,
    )

@router.post("/regenerate", response_model=ChatResponse, summary="Regenerate last AI response")
def regenerate_response(payload: RegenerateRequest, db: Session = Depends(get_db)):
    """
    Regenerate the last AI response:
    - Finds the last user prompt.
    - Removes the previous assistant response.
    - Calls AI service with context to produce a fresh response.
    - Saves the new response in SQLite.
    """
    conversation_id = payload.conversation_id
    conv = ChatService.get_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    last_user_msg = ChatService.get_last_user_message(db, conversation_id)
    if not last_user_msg:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No user message found to regenerate.")

    # Remove the last assistant message
    ChatService.remove_last_assistant_message(db, conversation_id)

    # Load history up to but excluding the deleted response
    all_msgs = ChatService.get_messages(db, conversation_id, limit=20)
    history = [
        {"role": m.role, "content": m.content}
        for m in all_msgs if m.id != last_user_msg.id
    ]

    # Generate new response
    ai_reply = AIService.generate_response(prompt=last_user_msg.content, history=history)

    # Store new assistant message
    assistant_msg = ChatService.add_message(db, conversation_id, role="assistant", content=ai_reply)

    return ChatResponse(
        conversation_id=conversation_id,
        user_message=MessageResponse.from_orm(last_user_msg),
        assistant_message=MessageResponse.from_orm(assistant_msg),
        title=conv.title,
    )
