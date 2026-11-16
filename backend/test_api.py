import asyncio
import sys
from pathlib import Path
import httpx

# Ensure app package is in path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from app.main import app
from app.config import settings

async def run_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Root
        res = await client.get("/")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        assert data["status"] == "online"
        print("✓ Root endpoint passed")

        # 2. Health
        res = await client.get("/api/chat/health")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        health_data = res.json()
        assert "status" in health_data
        print(f"✓ Health endpoint passed (status: {health_data['status']}, active: {health_data['active_provider']})")

        # 3. Create conversation
        create_res = await client.post("/api/conversations", json={"title": "Test Chat Automation"})
        assert create_res.status_code == 201, f"Expected 201, got {create_res.status_code}: {create_res.text}"
        conv = create_res.json()
        conv_id = conv["id"]
        assert conv["title"] == "Test Chat Automation"
        print(f"✓ Created conversation: {conv_id}")

        # 4. List conversations
        list_res = await client.get("/api/conversations")
        assert list_res.status_code == 200
        convs = list_res.json()
        assert any(c["id"] == conv_id for c in convs)
        print(f"✓ Listed {len(convs)} conversations successfully")

        # 5. Get conversation details
        get_res = await client.get(f"/api/conversations/{conv_id}")
        assert get_res.status_code == 200
        assert get_res.json()["title"] == "Test Chat Automation"
        print("✓ Get conversation details passed")

        # 6. Rename conversation
        patch_res = await client.patch(f"/api/conversations/{conv_id}", json={"title": "Updated Title"})
        assert patch_res.status_code == 200
        assert patch_res.json()["title"] == "Updated Title"
        print("✓ Rename conversation passed")

        # 7. Clear messages
        clear_res = await client.post(f"/api/conversations/{conv_id}/clear")
        assert clear_res.status_code == 200
        print("✓ Clear conversation passed")

        # 8. Delete conversation
        del_res = await client.delete(f"/api/conversations/{conv_id}")
        assert del_res.status_code == 200
        print("✓ Delete conversation passed")

        # 9. Verify deletion (404)
        ver_res = await client.get(f"/api/conversations/{conv_id}")
        assert ver_res.status_code == 404
        print("✓ Verified deletion returns 404")

        # 10. Test chat validation with missing API key
        empty_res = await client.post("/api/chat", json={"message": "   "})
        assert empty_res.status_code == 400
        print("✓ Empty message rejected with 400")

        if not settings.is_api_key_configured():
            chat_res = await client.post("/api/chat", json={"message": "Hello"})
            assert chat_res.status_code == 400
            detail = chat_res.json()["detail"]
            assert "API Key not found" in detail or "api key" in detail.lower()
            print("✓ Missing API key returns clear setup guidance message as required")

        print("\n🎉 ALL BACKEND API TESTS COMPLETED AND VERIFIED!")

if __name__ == "__main__":
    asyncio.run(run_tests())
