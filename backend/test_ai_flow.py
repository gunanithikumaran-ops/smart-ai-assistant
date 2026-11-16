import sys
from pathlib import Path
from unittest.mock import patch

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from app.database import SessionLocal, init_db
from app.routers.chat import send_chat, regenerate_response
from app.routers.conversations import get_conversation
from app.schemas import ChatRequest, RegenerateRequest
from app.config import settings

def test_ai_flow():
    init_db()
    db = SessionLocal()
    settings.GEMINI_API_KEY = "test_key_gemini"

    # 1. Send first prompt
    mock_reply_1 = (
        "Here is the Python code:\n"
        "```python\n"
        "def greet(name: str):\n"
        "    return f'Hello, {name}!'\n"
        "```\n"
        "This function formats a greeting string."
    )

    with patch("app.services.ai_service.AIService.validate_api_key", return_value=None), \
         patch("app.services.ai_service.AIService._call_gemini", return_value=mock_reply_1):
        res1 = send_chat(ChatRequest(conversation_id=None, message="Explain python functions"), db=db)
        conv_id = res1.conversation_id
        assert conv_id is not None
        assert res1.user_message.content == "Explain python functions"
        assert "def greet" in res1.assistant_message.content
        print(f"✓ Chat prompt sent and stored in DB (Conv ID: {conv_id})")

    # 2. Check conversation history in DB
    conv_details = get_conversation(conv_id, db=db)
    assert len(conv_details.messages) == 2
    print(f"✓ Stored 2 messages in SQLite (user + assistant)")

    # 3. Test multi-turn conversational context
    mock_reply_2 = "Sure! You can also support default arguments in Python."
    captured_history = []

    def mock_call_with_history(prompt, history):
        captured_history.extend(history)
        return mock_reply_2

    with patch("app.services.ai_service.AIService.validate_api_key", return_value=None), \
         patch("app.services.ai_service.AIService._call_gemini", side_effect=mock_call_with_history):
        res2 = send_chat(ChatRequest(conversation_id=conv_id, message="What about default arguments?"), db=db)
        assert res2.assistant_message.content == mock_reply_2
        assert len(captured_history) >= 2
        print(f"✓ Conversation context verified: {len(captured_history)} previous messages passed to LLM")

    # 4. Test regenerate response
    mock_reply_regenerated = (
        "Regenerated explanation in தமிழ்:\n"
        "பைத்தான் செயற்கூறுகளில் இயல்புநிலை மதிப்பு (default arguments) கொடுக்கலாம்."
    )

    with patch("app.services.ai_service.AIService.validate_api_key", return_value=None), \
         patch("app.services.ai_service.AIService._call_gemini", return_value=mock_reply_regenerated):
        regen_res = regenerate_response(RegenerateRequest(conversation_id=conv_id), db=db)
        assert regen_res.assistant_message.content == mock_reply_regenerated
        print("✓ Regenerate response succeeded and replaced previous reply")

    # 5. Verify final messages count in DB
    final_conv = get_conversation(conv_id, db=db)
    assert len(final_conv.messages) == 4  # (user1, asst1, user2, asst2_regenerated)
    print(f"✓ Total {len(final_conv.messages)} messages confirmed in SQLite")

    db.close()
    print("\n🎉 ALL AI FLOW & CONTEXT TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_ai_flow()
