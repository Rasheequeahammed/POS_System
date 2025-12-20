from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.database.session import get_db
from app.models.purchase import Purchase, PurchaseItem
from app.models.product import Product
from app.models.supplier import Supplier
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

# Schemas
class PurchaseItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_cost: float

class PurchaseCreate(BaseModel):
    supplier_id: int
    items: List[PurchaseItemCreate]
    payment_status: str = "pending"
    notes: Optional[str] = None

class PurchaseItemSchema(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_cost: float
    line_total: float
    
    class Config:
        from_attributes = True

class SupplierInfo(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

class PurchaseSchema(BaseModel):
    id: int
    purchase_order_number: str
    supplier_id: int
    total_amount: float
    payment_status: str
    purchase_date: datetime
    notes: Optional[str]
    supplier: Optional[SupplierInfo] = None
    items: List[PurchaseItemSchema] = []
    
    class Config:
        from_attributes = True

def generate_po_number(db: Session) -> str:
    """Generate unique purchase order number"""
    today = datetime.now().strftime("%Y%m%d")
    count = db.query(Purchase).filter(
        Purchase.purchase_order_number.like(f"PO-{today}%")
    ).count()
    return f"PO-{today}-{str(count + 1).zfill(4)}"

@router.get("/", response_model=List[PurchaseSchema])
async def get_purchases(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all purchases"""
    purchases = db.query(Purchase).options(
        joinedload(Purchase.supplier),
        joinedload(Purchase.items)
    ).order_by(Purchase.purchase_date.desc()).offset(skip).limit(limit).all()
    return purchases

@router.post("/", response_model=PurchaseSchema, status_code=status.HTTP_201_CREATED)
async def create_purchase(
    purchase_data: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new purchase and update product stock"""
    try:
        # Generate PO number
        po_number = generate_po_number(db)
        
        # Calculate total
        total_amount = 0.0
        purchase_items_data = []
        
        for item_data in purchase_data.items:
            # Get product
            product = db.query(Product).filter(Product.id == item_data.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product ID {item_data.product_id} not found"
                )
            
            line_total = item_data.unit_cost * item_data.quantity
            total_amount += line_total
            
            purchase_items_data.append({
                "product": product,
                "quantity": item_data.quantity,
                "unit_cost": item_data.unit_cost,
                "line_total": line_total
            })
        
        # Create purchase record
        purchase = Purchase(
            purchase_order_number=po_number,
            supplier_id=purchase_data.supplier_id,
            total_amount=total_amount,
            payment_status=purchase_data.payment_status,
            notes=purchase_data.notes
        )
        
        db.add(purchase)
        db.flush()
        
        # Create purchase items and update stock
        for item_data in purchase_items_data:
            purchase_item = PurchaseItem(
                purchase_id=purchase.id,
                product_id=item_data["product"].id,
                quantity=item_data["quantity"],
                unit_cost=item_data["unit_cost"],
                line_total=item_data["line_total"]
            )
            db.add(purchase_item)
            
            # Update product stock
            product = item_data["product"]
            product.current_stock += item_data["quantity"]
        
        db.commit()
        db.refresh(purchase)
        
        # Reload with relationships
        purchase = db.query(Purchase).options(
            joinedload(Purchase.supplier),
            joinedload(Purchase.items)
        ).filter(Purchase.id == purchase.id).first()
        
        return purchase
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create purchase: {str(e)}"
        )

@router.get("/{purchase_id}", response_model=PurchaseSchema)
async def get_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get purchase by ID"""
    purchase = db.query(Purchase).options(
        joinedload(Purchase.supplier),
        joinedload(Purchase.items)
    ).filter(Purchase.id == purchase_id).first()
    
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found"
        )
    return purchase
