from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from pydantic import BaseModel
from datetime import datetime, date
from app.database.session import get_db
from app.models.customer import Customer
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

# Schemas
class CustomerBase(BaseModel):
    phone: str
    name: str | None = None
    email: str | None = None
    address: str | None = None
    date_of_birth: date | None = None

class CustomerCreate(CustomerBase):
    pass

class SaleInfo(BaseModel):
    id: int
    invoice_number: str
    sale_date: datetime
    total_amount: float
    
    class Config:
        from_attributes = True

class CustomerSchema(CustomerBase):
    id: int
    first_purchase_date: datetime
    last_purchase_date: datetime
    total_purchases: int
    total_spent: int
    created_at: datetime
    sales: List[SaleInfo] = []
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[CustomerSchema])
async def get_customers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all customers"""
    customers = db.query(Customer).offset(skip).limit(limit).all()
    return customers

@router.post("/", response_model=CustomerSchema, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new customer"""
    existing = db.query(Customer).filter(Customer.phone == customer_data.phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer with this phone number already exists"
        )
    
    customer = Customer(**customer_data.dict())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/{customer_id}", response_model=CustomerSchema)
async def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get customer by ID with sales history"""
    customer = db.query(Customer).options(
        joinedload(Customer.sales)
    ).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer

@router.put("/{customer_id}", response_model=CustomerSchema)
async def update_customer(
    customer_id: int,
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update customer information"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Check if phone number is being changed to one that already exists
    if customer_data.phone != customer.phone:
        existing = db.query(Customer).filter(
            Customer.phone == customer_data.phone,
            Customer.id != customer_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Customer with this phone number already exists"
            )
    
    # Update customer fields
    for key, value in customer_data.dict().items():
        setattr(customer, key, value)
    
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a customer"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    db.delete(customer)
    db.commit()
    return None
