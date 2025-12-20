from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from pydantic import BaseModel
from datetime import datetime
from app.database.session import get_db
from app.models.supplier import Supplier
from app.models.purchase import Purchase
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

# Schemas
class SupplierBase(BaseModel):
    name: str
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    gstin: str | None = None

class SupplierCreate(SupplierBase):
    pass

class PurchaseInfo(BaseModel):
    id: int
    purchase_order_number: str
    total_amount: float
    payment_status: str
    purchase_date: datetime
    
    class Config:
        from_attributes = True

class SupplierSchema(SupplierBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SupplierDetailSchema(SupplierBase):
    id: int
    created_at: datetime
    updated_at: datetime
    purchases: List[PurchaseInfo] = []
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[SupplierSchema])
async def get_suppliers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all suppliers"""
    suppliers = db.query(Supplier).offset(skip).limit(limit).all()
    return suppliers

@router.post("/", response_model=SupplierSchema, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new supplier"""
    supplier = Supplier(**supplier_data.dict())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

@router.get("/{supplier_id}", response_model=SupplierDetailSchema)
async def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get supplier by ID with purchase history"""
    supplier = db.query(Supplier).options(
        joinedload(Supplier.purchases)
    ).filter(Supplier.id == supplier_id).first()
    
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    return supplier

@router.put("/{supplier_id}", response_model=SupplierSchema)
async def update_supplier(
    supplier_id: int,
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update supplier by ID"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    
    for field, value in supplier_data.dict().items():
        setattr(supplier, field, value)
    
    db.commit()
    db.refresh(supplier)
    return supplier

@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete supplier by ID"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    
    # Check if supplier has associated purchases
    purchase_count = db.query(Purchase).filter(Purchase.supplier_id == supplier_id).count()
    if purchase_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete supplier with {purchase_count} associated purchase(s)"
        )
    
    db.delete(supplier)
    db.commit()
    return None
