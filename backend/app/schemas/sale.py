from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.sale import PaymentMethod

# Sale Item Schemas
class SaleItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    discount: float = 0.0

class SaleItemCreate(SaleItemBase):
    pass

class SaleItemInDB(BaseModel):
    id: int
    sale_id: int
    product_id: int
    product_name: str
    barcode: str
    quantity: int
    unit_price: float
    discount: float
    tax_rate: float
    tax_amount: float
    line_total: float
    
    class Config:
        from_attributes = True

class SaleItem(SaleItemInDB):
    pass

# Sale Schemas
class SaleBase(BaseModel):
    customer_id: Optional[int] = None
    payment_method: PaymentMethod = PaymentMethod.CASH
    notes: Optional[str] = None

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]

class SaleInDB(BaseModel):
    id: int
    invoice_number: str
    user_id: int
    customer_id: Optional[int]
    subtotal: float
    discount_amount: float
    tax_amount: float
    total_amount: float
    payment_method: PaymentMethod
    payment_status: str
    notes: Optional[str]
    sale_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class Sale(SaleInDB):
    items: List[SaleItem] = []
