from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database.base import Base

class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    UPI = "upi"
    MIXED = "mixed"

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    
    # References
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Cashier
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    
    # Financial Details
    subtotal = Column(Float, nullable=False)  # Before tax and discount
    discount_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)  # Total GST
    total_amount = Column(Float, nullable=False)  # Final amount paid
    
    # Payment Information
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.CASH)
    payment_status = Column(String(20), default="completed")  # completed, pending, refunded
    
    # Additional Info
    notes = Column(Text, nullable=True)
    
    # Timestamps
    sale_date = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="sales")
    customer = relationship("Customer", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Product snapshot at time of sale (in case product details change later)
    product_name = Column(String(200), nullable=False)
    barcode = Column(String(100), nullable=False)
    
    # Pricing & Quantity
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)  # Price per unit at time of sale
    discount = Column(Float, default=0.0)  # Discount on this line item
    tax_rate = Column(Float, default=0.0)  # GST rate for this item
    tax_amount = Column(Float, default=0.0)  # GST amount for this line
    line_total = Column(Float, nullable=False)  # Total for this line item
    
    # Relationships
    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")
