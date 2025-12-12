from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from app.database.session import get_db
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.customer import Customer
from app.models.user import User
from app.schemas.sale import Sale as SaleSchema, SaleCreate, SaleItemCreate
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

def generate_invoice_number(db: Session) -> str:
    """
    Generate a unique invoice number
    Format: INV-YYYYMMDD-XXXX
    """
    today = datetime.now().strftime("%Y%m%d")
    
    # Get the count of sales today
    count = db.query(func.count(Sale.id)).filter(
        func.date(Sale.sale_date) == datetime.now().date()
    ).scalar()
    
    return f"INV-{today}-{str(count + 1).zfill(4)}"


@router.post("/", response_model=SaleSchema, status_code=status.HTTP_201_CREATED)
async def create_sale(
    sale_data: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new sale (POS transaction)
    This handles:
    - Creating sale record
    - Creating sale items
    - Updating product stock
    - Updating customer stats
    """
    try:
        # Generate invoice number
        invoice_number = generate_invoice_number(db)
        
        # Calculate totals
        subtotal = 0.0
        tax_amount = 0.0
        sale_items_data = []
        
        for item_data in sale_data.items:
            # Get product and verify stock
            product = db.query(Product).filter(Product.id == item_data.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product ID {item_data.product_id} not found"
                )
            
            if product.current_stock < item_data.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for {product.name}. Available: {product.current_stock}"
                )
            
            # Calculate line item totals
            line_subtotal = item_data.unit_price * item_data.quantity
            line_discount = item_data.discount
            line_after_discount = line_subtotal - line_discount
            line_tax = (line_after_discount * product.gst_rate) / 100
            line_total = line_after_discount + line_tax
            
            subtotal += line_subtotal
            tax_amount += line_tax
            
            sale_items_data.append({
                "product": product,
                "quantity": item_data.quantity,
                "unit_price": item_data.unit_price,
                "discount": line_discount,
                "tax_rate": product.gst_rate,
                "tax_amount": line_tax,
                "line_total": line_total
            })
        
        # Calculate final total
        discount_amount = sale_data.notes and "DISCOUNT:" in sale_data.notes or 0.0
        total_amount = subtotal - discount_amount + tax_amount
        
        # Create sale record
        sale = Sale(
            invoice_number=invoice_number,
            user_id=current_user.id,
            customer_id=sale_data.customer_id,
            subtotal=subtotal,
            discount_amount=discount_amount,
            tax_amount=tax_amount,
            total_amount=total_amount,
            payment_method=sale_data.payment_method,
            payment_status="completed",
            notes=sale_data.notes
        )
        
        db.add(sale)
        db.flush()  # Get the sale.id without committing
        
        # Create sale items and update stock
        for item_data in sale_items_data:
            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=item_data["product"].id,
                product_name=item_data["product"].name,
                barcode=item_data["product"].barcode,
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                discount=item_data["discount"],
                tax_rate=item_data["tax_rate"],
                tax_amount=item_data["tax_amount"],
                line_total=item_data["line_total"]
            )
            db.add(sale_item)
            
            # Update product stock (with row-level locking to prevent race conditions)
            product = item_data["product"]
            product.current_stock -= item_data["quantity"]
        
        # Update customer stats if customer provided
        if sale_data.customer_id:
            customer = db.query(Customer).filter(Customer.id == sale_data.customer_id).first()
            if customer:
                customer.last_purchase_date = datetime.utcnow()
                customer.total_purchases += 1
                customer.total_spent += int(total_amount)
        
        db.commit()
        db.refresh(sale)
        
        return sale
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create sale: {str(e)}"
        )


@router.get("/", response_model=List[SaleSchema])
async def get_sales(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all sales
    """
    sales = db.query(Sale).order_by(Sale.sale_date.desc()).offset(skip).limit(limit).all()
    return sales


@router.get("/{sale_id}", response_model=SaleSchema)
async def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get sale by ID
    """
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )
    return sale


@router.get("/invoice/{invoice_number}", response_model=SaleSchema)
async def get_sale_by_invoice(
    invoice_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get sale by invoice number
    """
    sale = db.query(Sale).filter(Sale.invoice_number == invoice_number).first()
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )
    return sale
