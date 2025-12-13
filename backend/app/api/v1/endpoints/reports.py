from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import Optional
from datetime import datetime, timedelta
from io import BytesIO, StringIO
import csv

from app.database.session import get_db
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.customer import Customer
from app.models.user import User
from app.models.purchase import Purchase, PurchaseItem
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.get("/sales-report")
def get_sales_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    group_by: str = "day",  # day, week, month
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate sales report with grouping options"""
    
    # Default to last 30 days if no dates provided
    if not start_date:
        start = datetime.now() - timedelta(days=30)
    else:
        try:
            start = datetime.fromisoformat(start_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")
    
    if not end_date:
        end = datetime.now()
    else:
        try:
            end = datetime.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format")
    
    # Get sales within date range
    sales = (
        db.query(Sale)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .order_by(Sale.sale_date)
        .all()
    )
    
    # Calculate statistics
    total_sales = len(sales)
    total_revenue = sum(sale.total_amount for sale in sales)
    total_tax = sum(sale.tax_amount for sale in sales)
    total_discount = sum(sale.discount_amount or 0 for sale in sales)
    
    # Get payment method breakdown
    payment_methods = {}
    for sale in sales:
        method = getattr(sale, 'payment_method', 'Cash')  # Default to Cash if not set
        payment_methods[method] = payment_methods.get(method, 0) + sale.total_amount
    
    # Get top selling products
    top_products = (
        db.query(
            Product.name,
            func.sum(SaleItem.quantity).label("total_quantity"),
            func.sum(SaleItem.line_total).label("total_revenue"),
        )
        .join(SaleItem, Product.id == SaleItem.product_id)
        .join(Sale, SaleItem.sale_id == Sale.id)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .group_by(Product.name)
        .order_by(desc("total_revenue"))
        .limit(10)
        .all()
    )
    
    # Get sales by user
    sales_by_user = (
        db.query(
            User.username,
            func.count(Sale.id).label("sales_count"),
            func.sum(Sale.total_amount).label("total_revenue"),
        )
        .join(User, Sale.user_id == User.id)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .group_by(User.username)
        .all()
    )
    
    return {
        "period": {
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
        },
        "summary": {
            "total_sales": total_sales,
            "total_revenue": round(total_revenue, 2),
            "total_tax": round(total_tax, 2),
            "total_discount": round(total_discount, 2),
            "average_sale": round(total_revenue / total_sales if total_sales > 0 else 0, 2),
        },
        "payment_methods": [
            {"method": method, "amount": round(amount, 2)}
            for method, amount in payment_methods.items()
        ],
        "top_products": [
            {
                "product_name": p.name,
                "quantity_sold": p.total_quantity,
                "revenue": round(p.total_revenue, 2),
            }
            for p in top_products
        ],
        "sales_by_user": [
            {
                "username": u.username,
                "sales_count": u.sales_count,
                "revenue": round(u.total_revenue, 2),
            }
            for u in sales_by_user
        ],
    }


@router.get("/inventory-report")
def get_inventory_report(
    category: Optional[str] = None,
    low_stock_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate inventory stock report"""
    
    query = db.query(Product).filter(Product.is_active == 1)
    
    if category:
        query = query.filter(Product.category == category)
    
    if low_stock_only:
        query = query.filter(Product.current_stock <= Product.minimum_stock)
    
    products = query.order_by(Product.category, Product.name).all()
    
    # Calculate totals
    total_products = len(products)
    total_stock_value = sum(p.current_stock * p.cost_price for p in products)
    total_potential_revenue = sum(p.current_stock * p.selling_price for p in products)
    low_stock_count = sum(1 for p in products if p.current_stock <= p.minimum_stock)
    out_of_stock_count = sum(1 for p in products if p.current_stock == 0)
    
    # Group by category
    categories = {}
    for product in products:
        cat = product.category
        if cat not in categories:
            categories[cat] = {
                "category": cat,
                "product_count": 0,
                "total_stock": 0,
                "stock_value": 0,
                "products": [],
            }
        
        categories[cat]["product_count"] += 1
        categories[cat]["total_stock"] += product.current_stock
        categories[cat]["stock_value"] += product.current_stock * product.cost_price
        categories[cat]["products"].append({
            "barcode": product.barcode,
            "name": product.name,
            "current_stock": product.current_stock,
            "minimum_stock": product.minimum_stock,
            "cost_price": round(product.cost_price, 2),
            "selling_price": round(product.selling_price, 2),
            "stock_value": round(product.current_stock * product.cost_price, 2),
            "status": "out_of_stock" if product.current_stock == 0 
                     else "low_stock" if product.current_stock <= product.minimum_stock 
                     else "in_stock",
        })
    
    return {
        "summary": {
            "total_products": total_products,
            "total_stock_value": round(total_stock_value, 2),
            "total_potential_revenue": round(total_potential_revenue, 2),
            "potential_profit": round(total_potential_revenue - total_stock_value, 2),
            "low_stock_count": low_stock_count,
            "out_of_stock_count": out_of_stock_count,
        },
        "categories": list(categories.values()),
    }


@router.get("/purchase-report")
def get_purchase_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    supplier_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate purchase report"""
    
    # Default to last 30 days
    if not start_date:
        start = datetime.now() - timedelta(days=30)
    else:
        try:
            start = datetime.fromisoformat(start_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")
    
    if not end_date:
        end = datetime.now()
    else:
        try:
            end = datetime.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format")
    
    query = db.query(Purchase).filter(
        Purchase.purchase_date >= start,
        Purchase.purchase_date <= end
    )
    
    if supplier_id:
        query = query.filter(Purchase.supplier_id == supplier_id)
    
    purchases = query.order_by(Purchase.purchase_date).all()
    
    # Calculate statistics
    total_purchases = len(purchases)
    total_amount = sum(p.total_amount for p in purchases)
    total_paid = sum(p.paid_amount for p in purchases)
    total_pending = total_amount - total_paid
    
    # Group by supplier
    from app.models.supplier import Supplier
    suppliers_data = (
        db.query(
            Supplier.name,
            func.count(Purchase.id).label("purchase_count"),
            func.sum(Purchase.total_amount).label("total_amount"),
            func.sum(Purchase.paid_amount).label("paid_amount"),
        )
        .join(Supplier, Purchase.supplier_id == Supplier.id)
        .filter(Purchase.purchase_date >= start, Purchase.purchase_date <= end)
        .group_by(Supplier.name)
        .all()
    )
    
    # Most purchased products
    top_purchases = (
        db.query(
            Product.name,
            func.sum(PurchaseItem.quantity).label("total_quantity"),
            func.sum(PurchaseItem.total_price).label("total_cost"),
        )
        .join(PurchaseItem, Product.id == PurchaseItem.product_id)
        .join(Purchase, PurchaseItem.purchase_id == Purchase.id)
        .filter(Purchase.purchase_date >= start, Purchase.purchase_date <= end)
        .group_by(Product.name)
        .order_by(desc("total_cost"))
        .limit(10)
        .all()
    )
    
    return {
        "period": {
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
        },
        "summary": {
            "total_purchases": total_purchases,
            "total_amount": round(total_amount, 2),
            "total_paid": round(total_paid, 2),
            "total_pending": round(total_pending, 2),
            "average_purchase": round(total_amount / total_purchases if total_purchases > 0 else 0, 2),
        },
        "by_supplier": [
            {
                "supplier_name": s.name,
                "purchase_count": s.purchase_count,
                "total_amount": round(s.total_amount, 2),
                "paid_amount": round(s.paid_amount, 2),
                "pending": round(s.total_amount - s.paid_amount, 2),
            }
            for s in suppliers_data
        ],
        "top_purchases": [
            {
                "product_name": p.name,
                "quantity": p.total_quantity,
                "cost": round(p.total_cost, 2),
            }
            for p in top_purchases
        ],
    }


@router.get("/tax-report")
def get_tax_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate tax report"""
    
    # Default to current month
    if not start_date:
        start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        try:
            start = datetime.fromisoformat(start_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")
    
    if not end_date:
        end = datetime.now()
    else:
        try:
            end = datetime.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format")
    
    # Get sales tax data
    sales = (
        db.query(Sale)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .all()
    )
    
    total_sales_amount = sum(s.total_amount for s in sales)
    total_tax_collected = sum(s.tax_amount for s in sales)
    taxable_amount = sum(s.subtotal for s in sales)
    
    # Group by tax rate
    tax_by_rate = {}
    sale_items = (
        db.query(SaleItem)
        .join(Sale)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .all()
    )
    
    for item in sale_items:
        rate = item.tax_rate or 0
        if rate not in tax_by_rate:
            tax_by_rate[rate] = {
                "tax_rate": rate,
                "taxable_amount": 0,
                "tax_amount": 0,
            }
        tax_by_rate[rate]["taxable_amount"] += (item.quantity * item.unit_price - item.discount)
        tax_by_rate[rate]["tax_amount"] += item.tax_amount
    
    return {
        "period": {
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
        },
        "summary": {
            "total_sales": len(sales),
            "total_sales_amount": round(total_sales_amount, 2),
            "taxable_amount": round(taxable_amount, 2),
            "total_tax_collected": round(total_tax_collected, 2),
            "average_tax_per_sale": round(total_tax_collected / len(sales) if sales else 0, 2),
        },
        "by_tax_rate": [
            {
                "tax_rate": rate,
                "taxable_amount": round(data["taxable_amount"], 2),
                "tax_amount": round(data["tax_amount"], 2),
            }
            for rate, data in sorted(tax_by_rate.items())
        ],
    }


@router.get("/export/sales-csv")
def export_sales_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export sales data as CSV"""
    
    if not start_date:
        start = datetime.now() - timedelta(days=30)
    else:
        start = datetime.fromisoformat(start_date)
    
    if not end_date:
        end = datetime.now()
    else:
        end = datetime.fromisoformat(end_date)
    
    sales = (
        db.query(Sale)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .order_by(Sale.sale_date)
        .all()
    )
    
    # Create CSV
    output = StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Invoice Number",
        "Date",
        "Customer",
        "User",
        "Subtotal",
        "Discount",
        "Tax",
        "Total",
        "Payment Method",
    ])
    
    # Data rows
    for sale in sales:
        customer_name = sale.customer.name if sale.customer else "Walk-in"
        user_name = sale.user.username if sale.user else "N/A"
        
        writer.writerow([
            sale.invoice_number,
            sale.sale_date.strftime("%Y-%m-%d %H:%M"),
            customer_name,
            user_name,
            f"{sale.subtotal:.2f}",
            f"{sale.discount_amount or 0:.2f}",
            f"{sale.tax_amount:.2f}",
            f"{sale.total_amount:.2f}",
            getattr(sale, 'payment_method', 'Cash'),
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=sales_report_{start.strftime('%Y%m%d')}_{end.strftime('%Y%m%d')}.csv"
        },
    )


@router.get("/export/inventory-csv")
def export_inventory_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export inventory data as CSV"""
    
    products = (
        db.query(Product)
        .filter(Product.is_active == 1)
        .order_by(Product.category, Product.name)
        .all()
    )
    
    # Create CSV
    output = StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Barcode",
        "Name",
        "Category",
        "Current Stock",
        "Minimum Stock",
        "Cost Price",
        "Selling Price",
        "Stock Value",
        "Status",
    ])
    
    # Data rows
    for product in products:
        status = "Out of Stock" if product.current_stock == 0 \
                 else "Low Stock" if product.current_stock <= product.minimum_stock \
                 else "In Stock"
        
        writer.writerow([
            product.barcode,
            product.name,
            product.category,
            product.current_stock,
            product.minimum_stock,
            f"{product.cost_price:.2f}",
            f"{product.selling_price:.2f}",
            f"{product.current_stock * product.cost_price:.2f}",
            status,
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=inventory_report.csv"
        },
    )
