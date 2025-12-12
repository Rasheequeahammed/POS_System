from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    
    # Pricing
    cost_price = Column(Float, nullable=False)  # Purchase price
    selling_price = Column(Float, nullable=False)  # Retail price
    mrp = Column(Float, nullable=True)  # Maximum Retail Price
    
    # Stock Management
    current_stock = Column(Integer, default=0, nullable=False)
    minimum_stock = Column(Integer, default=5)  # Alert threshold
    
    # Tax Information
    hsn_code = Column(String(20), nullable=True)  # For GST
    gst_rate = Column(Float, default=0.0)  # GST percentage (e.g., 18.0 for 18%)
    
    # Supplier Reference
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    
    # Metadata
    is_active = Column(Integer, default=1)  # 1 = Active, 0 = Discontinued
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    sale_items = relationship("SaleItem", back_populates="product")
    purchase_items = relationship("PurchaseItem", back_populates="product")
