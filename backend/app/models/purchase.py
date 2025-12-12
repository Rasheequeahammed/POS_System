from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    purchase_order_number = Column(String(50), unique=True, nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    
    # Financial
    total_amount = Column(Float, nullable=False)
    payment_status = Column(String(20), default="pending")  # pending, partial, completed
    
    # Dates
    purchase_date = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    expected_delivery = Column(DateTime, nullable=True)
    
    # Additional Info
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    supplier = relationship("Supplier", back_populates="purchases")
    items = relationship("PurchaseItem", back_populates="purchase", cascade="all, delete-orphan")


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Quantity & Pricing
    quantity = Column(Integer, nullable=False)
    unit_cost = Column(Float, nullable=False)  # Purchase cost per unit
    line_total = Column(Float, nullable=False)
    
    # Relationships
    purchase = relationship("Purchase", back_populates="items")
    product = relationship("Product", back_populates="purchase_items")
