from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.database.session import get_db
from app.models.inventory_transfer import InventoryTransfer, TransferStatus
from app.models.store import Store
from app.models.product import Product
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime
import random
import string

router = APIRouter()

# Pydantic schemas
class TransferCreate(BaseModel):
    from_store_id: int
    to_store_id: int
    product_id: int
    quantity: int
    notes: Optional[str] = None

class TransferUpdate(BaseModel):
    status: TransferStatus
    notes: Optional[str] = None

class TransferResponse(BaseModel):
    id: int
    transfer_number: str
    from_store_id: int
    to_store_id: int
    product_id: int
    quantity: int
    status: TransferStatus
    requested_by: int
    approved_by: Optional[int]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

def generate_transfer_number():
    """Generate unique transfer number"""
    prefix = "TRF"
    timestamp = datetime.now().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.digits, k=4))
    return f"{prefix}-{timestamp}-{random_str}"

# Endpoints
@router.get("/", response_model=List[TransferResponse])
def get_transfers(
    skip: int = 0,
    limit: int = 100,
    status: Optional[TransferStatus] = None,
    from_store_id: Optional[int] = None,
    to_store_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all inventory transfers with filters"""
    query = db.query(InventoryTransfer)
    
    if status:
        query = query.filter(InventoryTransfer.status == status)
    if from_store_id:
        query = query.filter(InventoryTransfer.from_store_id == from_store_id)
    if to_store_id:
        query = query.filter(InventoryTransfer.to_store_id == to_store_id)
    
    transfers = query.order_by(desc(InventoryTransfer.created_at)).offset(skip).limit(limit).all()
    return transfers

@router.get("/{transfer_id}", response_model=TransferResponse)
def get_transfer(
    transfer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific transfer by ID"""
    transfer = db.query(InventoryTransfer).filter(InventoryTransfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    return transfer

@router.post("/", response_model=TransferResponse)
def create_transfer(
    transfer: TransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new inventory transfer request"""
    # Validate stores exist
    from_store = db.query(Store).filter(Store.id == transfer.from_store_id).first()
    to_store = db.query(Store).filter(Store.id == transfer.to_store_id).first()
    
    if not from_store or not to_store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    if transfer.from_store_id == transfer.to_store_id:
        raise HTTPException(status_code=400, detail="Cannot transfer to the same store")
    
    # Validate product exists
    product = db.query(Product).filter(Product.id == transfer.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if sufficient quantity available (assuming current_stock is total across all stores for now)
    # In a real implementation, you'd have store-specific inventory
    if product.current_stock < transfer.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {product.current_stock}"
        )
    
    # Create transfer
    db_transfer = InventoryTransfer(
        transfer_number=generate_transfer_number(),
        from_store_id=transfer.from_store_id,
        to_store_id=transfer.to_store_id,
        product_id=transfer.product_id,
        quantity=transfer.quantity,
        status=TransferStatus.PENDING,
        requested_by=current_user.id,
        notes=transfer.notes
    )
    
    db.add(db_transfer)
    db.commit()
    db.refresh(db_transfer)
    return db_transfer

@router.put("/{transfer_id}/approve", response_model=TransferResponse)
def approve_transfer(
    transfer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve a transfer request (Manager/Admin only)"""
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    transfer = db.query(InventoryTransfer).filter(InventoryTransfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    if transfer.status != TransferStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending transfers can be approved")
    
    transfer.status = TransferStatus.APPROVED
    transfer.approved_by = current_user.id
    
    db.commit()
    db.refresh(transfer)
    return transfer

@router.put("/{transfer_id}/complete", response_model=TransferResponse)
def complete_transfer(
    transfer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark transfer as completed"""
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    transfer = db.query(InventoryTransfer).filter(InventoryTransfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    if transfer.status != TransferStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Only approved transfers can be completed")
    
    transfer.status = TransferStatus.COMPLETED
    transfer.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(transfer)
    return transfer

@router.put("/{transfer_id}/reject", response_model=TransferResponse)
def reject_transfer(
    transfer_id: int,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reject a transfer request (Manager/Admin only)"""
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    transfer = db.query(InventoryTransfer).filter(InventoryTransfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    if transfer.status not in [TransferStatus.PENDING, TransferStatus.APPROVED]:
        raise HTTPException(status_code=400, detail="Cannot reject this transfer")
    
    transfer.status = TransferStatus.REJECTED
    if notes:
        transfer.notes = f"{transfer.notes}\nRejection reason: {notes}" if transfer.notes else f"Rejection reason: {notes}"
    
    db.commit()
    db.refresh(transfer)
    return transfer

@router.get("/stats/summary")
def get_transfer_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transfer statistics"""
    total = db.query(InventoryTransfer).count()
    pending = db.query(InventoryTransfer).filter(InventoryTransfer.status == TransferStatus.PENDING).count()
    approved = db.query(InventoryTransfer).filter(InventoryTransfer.status == TransferStatus.APPROVED).count()
    completed = db.query(InventoryTransfer).filter(InventoryTransfer.status == TransferStatus.COMPLETED).count()
    rejected = db.query(InventoryTransfer).filter(InventoryTransfer.status == TransferStatus.REJECTED).count()
    
    return {
        "total_transfers": total,
        "pending": pending,
        "approved": approved,
        "completed": completed,
        "rejected": rejected
    }
