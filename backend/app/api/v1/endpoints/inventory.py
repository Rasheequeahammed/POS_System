from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from typing import List, Optional
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.product import Product
from app.models.stock_adjustment import StockAdjustment
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.get("/")
def get_inventory(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
    low_stock_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get inventory list with stock levels"""
    
    query = db.query(Product).filter(Product.is_active == 1)
    
    # Filters
    if category:
        query = query.filter(Product.category == category)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.barcode.ilike(search_term),
                Product.description.ilike(search_term),
            )
        )
    
    if low_stock_only:
        query = query.filter(Product.current_stock <= Product.minimum_stock)
    
    total = query.count()
    products = query.offset(skip).limit(limit).all()
    
    # Calculate stock status for each product
    inventory_items = []
    for product in products:
        stock_status = "ok"
        if product.current_stock == 0:
            stock_status = "out_of_stock"
        elif product.current_stock <= product.minimum_stock:
            stock_status = "low_stock"
        
        inventory_items.append({
            "id": product.id,
            "barcode": product.barcode,
            "name": product.name,
            "category": product.category,
            "current_stock": product.current_stock,
            "minimum_stock": product.minimum_stock,
            "cost_price": product.cost_price,
            "selling_price": product.selling_price,
            "stock_status": stock_status,
            "stock_value": product.current_stock * product.cost_price,
        })
    
    return {
        "total": total,
        "items": inventory_items,
    }


@router.get("/low-stock-alerts")
def get_low_stock_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get products with low or zero stock"""
    
    low_stock_products = (
        db.query(Product)
        .filter(Product.is_active == 1)
        .filter(Product.current_stock <= Product.minimum_stock)
        .order_by(Product.current_stock)
        .all()
    )
    
    alerts = []
    for product in low_stock_products:
        alert_level = "critical" if product.current_stock == 0 else "warning"
        
        alerts.append({
            "id": product.id,
            "barcode": product.barcode,
            "name": product.name,
            "category": product.category,
            "current_stock": product.current_stock,
            "minimum_stock": product.minimum_stock,
            "alert_level": alert_level,
            "reorder_quantity": max(product.minimum_stock * 3 - product.current_stock, 0),
        })
    
    return {
        "total_alerts": len(alerts),
        "critical_count": sum(1 for a in alerts if a["alert_level"] == "critical"),
        "warning_count": sum(1 for a in alerts if a["alert_level"] == "warning"),
        "alerts": alerts,
    }


@router.get("/summary")
def get_inventory_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get overall inventory statistics"""
    
    total_products = db.query(Product).filter(Product.is_active == 1).count()
    
    low_stock_count = (
        db.query(Product)
        .filter(Product.is_active == 1)
        .filter(Product.current_stock <= Product.minimum_stock)
        .filter(Product.current_stock > 0)
        .count()
    )
    
    out_of_stock_count = (
        db.query(Product)
        .filter(Product.is_active == 1)
        .filter(Product.current_stock == 0)
        .count()
    )
    
    # Calculate total inventory value
    inventory_value = (
        db.query(func.sum(Product.current_stock * Product.cost_price))
        .filter(Product.is_active == 1)
        .scalar()
    ) or 0
    
    # Get total stock units
    total_units = (
        db.query(func.sum(Product.current_stock))
        .filter(Product.is_active == 1)
        .scalar()
    ) or 0
    
    # Get categories with stock counts
    categories = (
        db.query(
            Product.category,
            func.count(Product.id).label("product_count"),
            func.sum(Product.current_stock).label("total_stock"),
        )
        .filter(Product.is_active == 1)
        .group_by(Product.category)
        .all()
    )
    
    return {
        "total_products": total_products,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "total_inventory_value": round(inventory_value, 2),
        "total_units": total_units,
        "categories": [
            {
                "category": cat.category,
                "product_count": cat.product_count,
                "total_stock": cat.total_stock or 0,
            }
            for cat in categories
        ],
    }


@router.post("/adjust-stock/{product_id}")
def adjust_stock(
    product_id: int,
    adjustment_type: str,
    quantity_change: int,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually adjust stock levels"""
    
    # Validate adjustment type
    valid_types = ["RESTOCK", "DAMAGE", "CORRECTION", "RETURN", "LOSS", "TRANSFER"]
    if adjustment_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid adjustment type. Must be one of: {', '.join(valid_types)}",
        )
    
    # Get product
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Calculate new stock
    previous_stock = product.current_stock
    new_stock = previous_stock + quantity_change
    
    if new_stock < 0:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Current: {previous_stock}, Requested change: {quantity_change}",
        )
    
    # Calculate cost impact
    cost_impact = quantity_change * product.cost_price
    
    # Create stock adjustment record
    adjustment = StockAdjustment(
        product_id=product_id,
        user_id=current_user.id,
        adjustment_type=adjustment_type,
        quantity_change=quantity_change,
        previous_stock=previous_stock,
        new_stock=new_stock,
        reference_type="MANUAL",
        reason=reason,
        cost_impact=cost_impact,
    )
    
    # Update product stock
    product.current_stock = new_stock
    
    db.add(adjustment)
    db.commit()
    db.refresh(product)
    db.refresh(adjustment)
    
    return {
        "message": "Stock adjusted successfully",
        "product_id": product_id,
        "product_name": product.name,
        "previous_stock": previous_stock,
        "new_stock": new_stock,
        "adjustment_id": adjustment.id,
    }


@router.put("/reorder-point/{product_id}")
def update_reorder_point(
    product_id: int,
    minimum_stock: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update minimum stock level (reorder point)"""
    
    if minimum_stock < 0:
        raise HTTPException(status_code=400, detail="Minimum stock cannot be negative")
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    old_minimum = product.minimum_stock
    product.minimum_stock = minimum_stock
    
    db.commit()
    db.refresh(product)
    
    return {
        "message": "Reorder point updated successfully",
        "product_id": product_id,
        "product_name": product.name,
        "old_minimum_stock": old_minimum,
        "new_minimum_stock": minimum_stock,
    }


@router.get("/adjustments")
def get_stock_adjustments(
    skip: int = 0,
    limit: int = 50,
    product_id: Optional[int] = None,
    adjustment_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get stock adjustment history"""
    
    query = db.query(StockAdjustment).join(Product).join(User)
    
    # Filters
    if product_id:
        query = query.filter(StockAdjustment.product_id == product_id)
    
    if adjustment_type:
        query = query.filter(StockAdjustment.adjustment_type == adjustment_type)
    
    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(StockAdjustment.created_at >= start)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")
    
    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(StockAdjustment.created_at <= end)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format")
    
    total = query.count()
    adjustments = query.order_by(desc(StockAdjustment.created_at)).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "adjustments": [
            {
                "id": adj.id,
                "product_id": adj.product_id,
                "product_name": adj.product.name,
                "product_barcode": adj.product.barcode,
                "adjustment_type": adj.adjustment_type,
                "quantity_change": adj.quantity_change,
                "previous_stock": adj.previous_stock,
                "new_stock": adj.new_stock,
                "reason": adj.reason,
                "cost_impact": adj.cost_impact,
                "user_name": adj.user.username,
                "created_at": adj.created_at.isoformat(),
            }
            for adj in adjustments
        ],
    }


@router.get("/categories")
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all product categories"""
    
    categories = (
        db.query(Product.category)
        .filter(Product.is_active == 1)
        .distinct()
        .order_by(Product.category)
        .all()
    )
    
    return {"categories": [cat[0] for cat in categories]}
