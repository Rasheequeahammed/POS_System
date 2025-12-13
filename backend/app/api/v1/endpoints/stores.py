from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.store import Store
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Pydantic schemas
class StoreCreate(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    manager_id: Optional[int] = None

class StoreUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    manager_id: Optional[int] = None
    is_active: Optional[bool] = None

class StoreResponse(BaseModel):
    id: int
    name: str
    code: str
    address: Optional[str]
    city: Optional[str]
    country: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    manager_id: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Endpoints
@router.get("/", response_model=List[StoreResponse])
def get_stores(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all stores"""
    query = db.query(Store)
    if is_active is not None:
        query = query.filter(Store.is_active == is_active)
    stores = query.offset(skip).limit(limit).all()
    return stores

@router.get("/{store_id}", response_model=StoreResponse)
def get_store(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific store by ID"""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store

@router.post("/", response_model=StoreResponse)
def create_store(
    store: StoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new store (Admin only)"""
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can create stores")
    
    # Check if store code or name already exists
    existing = db.query(Store).filter(
        (Store.code == store.code) | (Store.name == store.name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Store code or name already exists")
    
    db_store = Store(**store.dict())
    db.add(db_store)
    db.commit()
    db.refresh(db_store)
    return db_store

@router.put("/{store_id}", response_model=StoreResponse)
def update_store(
    store_id: int,
    store: StoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a store (Admin/Manager)"""
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    db_store = db.query(Store).filter(Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    update_data = store.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_store, field, value)
    
    db.commit()
    db.refresh(db_store)
    return db_store

@router.delete("/{store_id}")
def delete_store(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deactivate a store (Admin only)"""
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can delete stores")
    
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    store.is_active = False
    db.commit()
    return {"message": "Store deactivated successfully"}

@router.get("/stats/summary")
def get_store_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get store statistics summary"""
    total_stores = db.query(Store).count()
    active_stores = db.query(Store).filter(Store.is_active == True).count()
    inactive_stores = total_stores - active_stores
    
    return {
        "total_stores": total_stores,
        "active_stores": active_stores,
        "inactive_stores": inactive_stores
    }
