from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Optional
from app.database.session import get_db
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.customer import Customer
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/sales-trends")
def get_sales_trends(
    start_date: str,
    end_date: str,
    interval: str = "daily",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get sales trends over time"""
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    # Get sales data
    sales = (
        db.query(
            func.date(Sale.sale_date).label("date"),
            func.sum(Sale.total_amount).label("revenue"),
            func.count(Sale.id).label("transactions"),
        )
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .group_by(func.date(Sale.sale_date))
        .order_by(func.date(Sale.sale_date))
        .all()
    )

    data = [
        {
            "date": str(item.date),
            "revenue": float(item.revenue or 0),
            "transactions": item.transactions,
        }
        for item in sales
    ]

    # Calculate comparison with previous period
    period_days = (end - start).days
    prev_start = start - timedelta(days=period_days)
    prev_end = start

    current_total = sum(item["revenue"] for item in data)
    
    prev_sales = (
        db.query(func.sum(Sale.total_amount))
        .filter(Sale.sale_date >= prev_start, Sale.sale_date < prev_end)
        .scalar()
    ) or 0

    growth = 0
    if prev_sales > 0:
        growth = ((current_total - prev_sales) / prev_sales) * 100

    return {
        "data": data,
        "comparison": {
            "current": current_total,
            "previous": float(prev_sales),
            "difference": current_total - float(prev_sales),
        },
        "growth": growth,
    }


@router.get("/profit-analysis")
def get_profit_analysis(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get profit analysis"""
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    # Get sales with product details
    sales_items = (
        db.query(
            SaleItem.product_id,
            Product.name.label("product_name"),
            Product.category,
            func.sum(SaleItem.quantity).label("quantity"),
            func.sum(SaleItem.line_total).label("revenue"),
            func.sum(SaleItem.quantity * Product.cost_price).label("cost"),
        )
        .join(Sale, SaleItem.sale_id == Sale.id)
        .join(Product, SaleItem.product_id == Product.id)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .group_by(SaleItem.product_id, Product.name, Product.category)
        .all()
    )

    # Calculate totals
    total_revenue = sum(float(item.revenue or 0) for item in sales_items)
    total_cost = sum(float(item.cost or 0) for item in sales_items)
    gross_profit = total_revenue - total_cost
    profit_margin = (gross_profit / total_revenue * 100) if total_revenue > 0 else 0

    # Group by category
    category_profits = {}
    for item in sales_items:
        category = item.category or "Uncategorized"
        if category not in category_profits:
            category_profits[category] = {"revenue": 0, "cost": 0}
        category_profits[category]["revenue"] += float(item.revenue or 0)
        category_profits[category]["cost"] += float(item.cost or 0)

    by_category = [
        {
            "category": cat,
            "profit": data["revenue"] - data["cost"],
            "revenue": data["revenue"],
        }
        for cat, data in category_profits.items()
    ]

    # Top products by profit
    by_product = [
        {
            "product_name": item.product_name,
            "revenue": float(item.revenue or 0),
            "cost": float(item.cost or 0),
            "profit": float(item.revenue or 0) - float(item.cost or 0),
            "margin": (
                ((float(item.revenue or 0) - float(item.cost or 0)) / float(item.revenue or 0) * 100)
                if item.revenue > 0
                else 0
            ),
        }
        for item in sorted(
            sales_items,
            key=lambda x: float(x.revenue or 0) - float(x.cost or 0),
            reverse=True,
        )[:10]
    ]

    return {
        "gross_profit": gross_profit,
        "net_profit": gross_profit,  # Simplified, you can add expenses later
        "profit_margin": profit_margin,
        "by_category": by_category,
        "by_product": by_product,
    }


@router.get("/top-products")
def get_top_products(
    start_date: str,
    end_date: str,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get top selling products"""
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    top_products = (
        db.query(
            Product.id,
            Product.name.label("product_name"),
            Product.category,
            Product.barcode,
            func.sum(SaleItem.quantity).label("quantity_sold"),
            func.sum(SaleItem.line_total).label("revenue"),
        )
        .join(SaleItem, Product.id == SaleItem.product_id)
        .join(Sale, SaleItem.sale_id == Sale.id)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .group_by(Product.id, Product.name, Product.category, Product.barcode)
        .order_by(desc(func.sum(SaleItem.line_total)))
        .limit(limit)
        .all()
    )

    return [
        {
            "product_name": item.product_name,
            "category": item.category,
            "barcode": item.barcode,
            "quantity_sold": item.quantity_sold,
            "revenue": float(item.revenue or 0),
        }
        for item in top_products
    ]


@router.get("/customer-insights")
def get_customer_insights(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get customer insights"""
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    # Total customers
    total_customers = db.query(func.count(Customer.id)).scalar() or 0

    # New customers in period
    new_customers = (
        db.query(func.count(Customer.id))
        .filter(Customer.created_at >= start, Customer.created_at <= end)
        .scalar()
        or 0
    )

    # Customers with multiple purchases (returning)
    returning_customers = (
        db.query(func.count(func.distinct(Sale.customer_id)))
        .filter(
            Sale.customer_id.isnot(None),
            Sale.sale_date >= start,
            Sale.sale_date <= end,
        )
        .having(func.count(Sale.id) > 1)
        .scalar()
        or 0
    )

    # Average purchase value
    avg_purchase = (
        db.query(func.avg(Sale.total_amount))
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .scalar()
        or 0
    )

    # Purchase frequency
    total_purchases = (
        db.query(func.count(Sale.id))
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .scalar()
        or 0
    )
    
    purchase_frequency = (
        total_purchases / total_customers if total_customers > 0 else 0
    )

    # Customer lifetime value (simplified)
    customer_lifetime_value = float(avg_purchase) * purchase_frequency

    return {
        "total_customers": total_customers,
        "new_customers": new_customers,
        "returning_customers": returning_customers,
        "average_purchase_value": float(avg_purchase),
        "purchase_frequency": purchase_frequency,
        "customer_lifetime_value": customer_lifetime_value,
    }


@router.get("/revenue-by-category")
def get_revenue_by_category(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get revenue breakdown by category"""
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    category_revenue = (
        db.query(
            Product.category,
            func.sum(SaleItem.line_total).label("revenue"),
            func.sum(SaleItem.quantity).label("quantity"),
        )
        .join(SaleItem, Product.id == SaleItem.product_id)
        .join(Sale, SaleItem.sale_id == Sale.id)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .group_by(Product.category)
        .order_by(desc(func.sum(SaleItem.line_total)))
        .all()
    )

    return [
        {
            "category": item.category or "Uncategorized",
            "revenue": float(item.revenue or 0),
            "quantity": item.quantity,
        }
        for item in category_revenue
    ]


@router.get("/dashboard")
def get_analytics_dashboard(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get comprehensive analytics dashboard data"""
    return {
        "sales_trends": get_sales_trends(start_date, end_date, "daily", db, current_user),
        "profit_analysis": get_profit_analysis(start_date, end_date, db, current_user),
        "top_products": get_top_products(start_date, end_date, 10, db, current_user),
        "customer_insights": get_customer_insights(start_date, end_date, db, current_user),
        "revenue_by_category": get_revenue_by_category(start_date, end_date, db, current_user),
    }
