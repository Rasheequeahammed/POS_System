# Import all models to ensure they're registered with SQLAlchemy
from app.models.user import User
from app.models.product import Product
from app.models.sale import Sale
from app.models.customer import Customer
from app.models.supplier import Supplier
from app.models.purchase import Purchase
from app.models.activity_log import ActivityLog
from app.models.store import Store
from app.models.inventory_transfer import InventoryTransfer
from app.models.backup import Backup

__all__ = [
    "User",
    "Product", 
    "Sale",
    "Customer",
    "Supplier",
    "Purchase",
    "ActivityLog",
    "Store",
    "InventoryTransfer",
    "Backup"
]
