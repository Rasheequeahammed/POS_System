from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    
    # For marketing and loyalty
    date_of_birth = Column(Date, nullable=True)
    
    # Metadata
    first_purchase_date = Column(DateTime, default=datetime.utcnow)
    last_purchase_date = Column(DateTime, default=datetime.utcnow)
    total_purchases = Column(Integer, default=0)
    total_spent = Column(Integer, default=0)  # In currency (e.g., rupees)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sales = relationship("Sale", back_populates="customer")
