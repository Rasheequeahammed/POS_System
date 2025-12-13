from sqlalchemy import Column, Integer, String, DateTime, Text, BigInteger
from datetime import datetime
from app.database.base import Base

class Backup(Base):
    __tablename__ = "backups"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger, nullable=False)  # Size in bytes
    backup_type = Column(String(50), default="manual")  # manual, scheduled, auto
    description = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Status info
    status = Column(String(50), default="completed")  # completed, failed, in_progress
    error_message = Column(Text, nullable=True)
