from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class MessageBase(BaseModel):
    role: str
    content: str

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, description="Message text from user")

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    title: Optional[str] = Field("New Chat", max_length=255)

class ConversationUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Updated conversation title")

class ConversationSummary(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int

    class Config:
        from_attributes = True

class ConversationDetail(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID or None for new chat")
    message: str = Field(..., min_length=1, description="User prompt")

class ChatResponse(BaseModel):
    conversation_id: str
    user_message: MessageResponse
    assistant_message: MessageResponse
    title: Optional[str] = None

class RegenerateRequest(BaseModel):
    conversation_id: str = Field(..., description="Conversation ID to regenerate the last AI response for")

class HealthResponse(BaseModel):
    status: str
    gemini_configured: bool
    openai_configured: bool
    active_provider: Optional[str]
    message: str
