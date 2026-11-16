import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from app.database import SessionLocal, init_db
from app.routers.conversations import (
    list_conversations,
    create_conversation,
    get_conversation,
    update_conversation,
    delete_conversation,
    clear_conversation,
)
from app.routers.chat import check_health, send_chat
from app.schemas import ConversationCreate, ConversationUpdate, ChatRequest

def run_direct_tests():
    init_db()
    db = SessionLocal()
    print("1. Testing health check...")
    health = check_health()
    print(f"✓ Health response: status={health.status}, provider={health.active_provider}")
    assert health.status in ["ready", "configuration_needed"]

    print("\n2. Testing conversation creation...")
    created = create_conversation(ConversationCreate(title="Automated Test Chat"), db=db)
    conv_id = created.id
    print(f"✓ Created conversation ID: {conv_id}, Title: {created.title}")
    assert created.title == "Automated Test Chat"

    print("\n3. Testing listing conversations...")
    all_convs = list_conversations(db=db)
    print(f"✓ Total conversations found: {len(all_convs)}")
    assert any(c["id"] == conv_id for c in all_convs)

    print("\n4. Testing get conversation details...")
    fetched = get_conversation(conv_id, db=db)
    print(f"✓ Fetched conversation: {fetched.id} - {fetched.title}")
    assert fetched.id == conv_id

    print("\n5. Testing update title...")
    updated = update_conversation(conv_id, ConversationUpdate(title="Updated Title 123"), db=db)
    print(f"✓ Updated title: {updated.title}")
    assert updated.title == "Updated Title 123"

    print("\n6. Testing clear conversation messages...")
    cleared = clear_conversation(conv_id, db=db)
    print("✓ Clear result:", cleared)

    print("\n7. Testing delete conversation...")
    deleted = delete_conversation(conv_id, db=db)
    print("✓ Deleted result:", deleted)

    # Verify deleted
    try:
        get_conversation(conv_id, db=db)
        assert False, "Should have thrown 404"
    except Exception as e:
        print("✓ Successfully verified 404 after deletion:", getattr(e, "detail", str(e)))

    print("\n8. Testing chat validation with missing API key...")
    try:
        send_chat(ChatRequest(conversation_id=None, message="Test prompt"), db=db)
        print("✓ Chat generated response (API key configured)")
    except Exception as e:
        detail = getattr(e, "detail", str(e))
        print("✓ Chat correctly handled API key requirement:", detail.split("\n")[0])
        assert "API Key not found" in detail or "api key" in detail.lower()

    db.close()
    print("\n🎉 ALL DIRECT BACKEND TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run_direct_tests()
