from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Conversation, Message

class ChatService:
    @staticmethod
    def create_conversation(db: Session, title: str = "New Chat") -> Conversation:
        """Create a new conversation."""
        conversation = Conversation(title=title)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    @staticmethod
    def get_conversation(db: Session, conversation_id: str) -> Optional[Conversation]:
        """Fetch conversation by ID."""
        return db.query(Conversation).filter(Conversation.id == conversation_id).first()

    @staticmethod
    def list_conversations(db: Session) -> List[dict]:
        """List all conversations ordered by updated_at descending, with message count."""
        results = (
            db.query(
                Conversation.id,
                Conversation.title,
                Conversation.created_at,
                Conversation.updated_at,
                func.count(Message.id).label("message_count"),
            )
            .outerjoin(Message, Conversation.id == Message.conversation_id)
            .group_by(Conversation.id)
            .order_by(Conversation.updated_at.desc())
            .all()
        )

        return [
            {
                "id": row.id,
                "title": row.title,
                "created_at": row.created_at,
                "updated_at": row.updated_at,
                "message_count": row.message_count,
            }
            for row in results
        ]

    @staticmethod
    def update_conversation_title(db: Session, conversation_id: str, new_title: str) -> Optional[Conversation]:
        """Update the title of a conversation."""
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conv:
            conv.title = new_title
            conv.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(conv)
        return conv

    @staticmethod
    def delete_conversation(db: Session, conversation_id: str) -> bool:
        """Delete conversation and all its messages."""
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            return False
        db.delete(conv)
        db.commit()
        return True

    @staticmethod
    def clear_conversation_messages(db: Session, conversation_id: str) -> bool:
        """Delete all messages inside a conversation while keeping the conversation."""
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            return False
        db.query(Message).filter(Message.conversation_id == conversation_id).delete()
        conv.updated_at = datetime.utcnow()
        db.commit()
        return True

    @staticmethod
    def add_message(db: Session, conversation_id: str, role: str, content: str) -> Message:
        """Add a new message and touch conversation updated_at."""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            created_at=datetime.utcnow()
        )
        db.add(message)

        # Update conversation updated_at
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conv:
            conv.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def get_messages(db: Session, conversation_id: str, limit: int = 50) -> List[Message]:
        """Get chronological messages for a conversation."""
        return (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def remove_last_assistant_message(db: Session, conversation_id: str) -> Optional[Message]:
        """Delete the last assistant message in a conversation (used for regenerate)."""
        last_msg = (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id, Message.role == "assistant")
            .order_by(Message.created_at.desc())
            .first()
        )
        if last_msg:
            db.delete(last_msg)
            db.commit()
            return last_msg
        return None

    @staticmethod
    def get_last_user_message(db: Session, conversation_id: str) -> Optional[Message]:
        """Get the last user prompt in a conversation."""
        return (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id, Message.role == "user")
            .order_by(Message.created_at.desc())
            .first()
        )
