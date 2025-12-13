from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)  # LOGIN, LOGOUT, CREATE_SALE, UPDATE_PRODUCT, etc.
    entity_type = Column(String(50), nullable=True)  # SALE, PRODUCT, USER, etc.
    entity_id = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    extra_data = Column(JSON, nullable=True)  # Additional data (renamed from metadata to avoid SQLAlchemy conflict)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User")
