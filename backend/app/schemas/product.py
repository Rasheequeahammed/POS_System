from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    barcode: str
    name: str
    description: Optional[str] = None
    category: str
    cost_price: float
    selling_price: float
    mrp: Optional[float] = None
    current_stock: int = 0
    minimum_stock: int = 5
    hsn_code: Optional[str] = None
    gst_rate: float = 0.0
    supplier_id: Optional[int] = None
    is_active: int = 1

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    barcode: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    mrp: Optional[float] = None
    current_stock: Optional[int] = None
    minimum_stock: Optional[int] = None
    hsn_code: Optional[str] = None
    gst_rate: Optional[float] = None
    supplier_id: Optional[int] = None
    is_active: Optional[int] = None

class ProductInDB(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Product(ProductInDB):
    pass
