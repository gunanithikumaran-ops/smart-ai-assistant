from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    ConversationSummary,
    ConversationDetail,
    ConversationCreate,
    ConversationUpdate,
    MessageResponse,
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])

@router.get("", response_model=List[ConversationSummary], summary="List all conversations")
def list_conversations(db: Session = Depends(get_db)):
    """Retrieve all conversations with their message counts ordered by most recently active."""
    return ChatService.list_conversations(db)

@router.post("", response_model=ConversationDetail, status_code=status.HTTP_201_CREATED, summary="Create a new conversation")
def create_conversation(payload: ConversationCreate, db: Session = Depends(get_db)):
    """Create an empty conversation with an optional custom title."""
    conv = ChatService.create_conversation(db, title=payload.title or "New Chat")
    return conv

@router.get("/{conversation_id}", response_model=ConversationDetail, summary="Get conversation details and messages")
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Retrieve a conversation by ID with all its messages in chronological order."""
    conv = ChatService.get_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conv

@router.patch("/{conversation_id}", response_model=ConversationDetail, summary="Rename conversation")
def update_conversation(conversation_id: str, payload: ConversationUpdate, db: Session = Depends(get_db)):
    """Rename an existing conversation."""
    conv = ChatService.update_conversation_title(db, conversation_id, payload.title.strip())
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conv

@router.delete("/{conversation_id}", status_code=status.HTTP_200_OK, summary="Delete conversation")
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Delete a conversation and all its messages."""
    success = ChatService.delete_conversation(db, conversation_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return {"message": "Conversation deleted successfully", "id": conversation_id}

@router.post("/{conversation_id}/clear", status_code=status.HTTP_200_OK, summary="Clear messages in conversation")
def clear_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Clear all messages in a conversation while retaining the conversation thread."""
    success = ChatService.clear_conversation_messages(db, conversation_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return {"message": "Conversation cleared successfully", "id": conversation_id}
