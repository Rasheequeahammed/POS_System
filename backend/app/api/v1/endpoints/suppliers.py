from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from app.database.session import get_db
from app.models.supplier import Supplier
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

class SupplierSchema(SupplierBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
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

@router.get("/{supplier_id}", response_model=SupplierSchema)
async def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get supplier by ID"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    return supplier
