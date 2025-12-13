from fastapi import APIRouter
from app.api.v1.endpoints import auth, products, sales, users, customers, suppliers, analytics, inventory, reports, stores, transfers

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(sales.router, prefix="/sales", tags=["Sales"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["Suppliers"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(stores.router, prefix="/stores", tags=["Stores"])
api_router.include_router(transfers.router, prefix="/transfers", tags=["Inventory Transfers"])
