from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database.session import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import Product as ProductSchema, ProductCreate, ProductUpdate
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ProductSchema])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all products with optional filtering
    """
    query = db.query(Product)
    
    if active_only:
        query = query.filter(Product.is_active == 1)
    
    if category:
        query = query.filter(Product.category == category)
    
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.barcode.ilike(f"%{search}%")
            )
        )
    
    products = query.offset(skip).limit(limit).all()
    return products


@router.get("/barcode/{barcode}", response_model=ProductSchema)
async def get_product_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get product by barcode (for POS scanning)
    """
    product = db.query(Product).filter(Product.barcode == barcode).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with barcode {barcode} not found"
        )
    
    if product.is_active == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is discontinued"
        )
    
    return product


@router.get("/low-stock", response_model=List[ProductSchema])
async def get_low_stock_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get products with stock below minimum threshold
    """
    products = db.query(Product).filter(
        Product.current_stock <= Product.minimum_stock,
        Product.is_active == 1
    ).all()
    return products


@router.post("/", response_model=ProductSchema, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new product
    """
    # Check if barcode already exists
    existing = db.query(Product).filter(Product.barcode == product_data.barcode).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this barcode already exists"
        )
    
    product = Product(**product_data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductSchema)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get product by ID
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.put("/{product_id}", response_model=ProductSchema)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update product
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    update_data = product_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Soft delete product (mark as inactive)
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product.is_active = 0
    db.commit()
    return None
