from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class StockAdjustment(Base):
    __tablename__ = "stock_adjustments"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Adjustment Details
    adjustment_type = Column(String(50), nullable=False)  # "RESTOCK", "SALE", "DAMAGE", "CORRECTION", "RETURN"
    quantity_change = Column(Integer, nullable=False)  # Positive for increase, negative for decrease
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)
    
    # Reference Information
    reference_type = Column(String(50), nullable=True)  # "SALE", "PURCHASE", "MANUAL"
    reference_id = Column(Integer, nullable=True)  # ID of related sale/purchase
    
    # Additional Info
    reason = Column(Text, nullable=True)
    cost_impact = Column(Float, default=0.0)  # Financial impact of adjustment
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    product = relationship("Product")
    user = relationship("User")
