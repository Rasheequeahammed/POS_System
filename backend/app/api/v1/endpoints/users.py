from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, timedelta
from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.activity_log import ActivityLog
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from app.core.security import get_password_hash
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all users (Admin only)
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.post("/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new user (Admin only)
    """
    # Check if username or email already exists
    existing = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role,
        is_active=user_data.is_active,
        hashed_password=get_password_hash(user_data.password)
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user by ID
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user (Admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_data.dict(exclude_unset=True)
    
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete user (Admin only) - Actually deactivates the user
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Soft delete by deactivating
    user.is_active = False
    db.commit()
    
    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        action="DEACTIVATE_USER",
        entity_type="USER",
        entity_id=user_id,
        description=f"Deactivated user {user.username}",
    )
    db.add(log)
    db.commit()
    
    return None


@router.get("/stats/performance")
async def get_user_performance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get performance statistics for all users
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Manager or Admin access required")
    
    # Default to last 30 days
    if not start_date:
        start = datetime.now() - timedelta(days=30)
    else:
        start = datetime.fromisoformat(start_date)
    
    if not end_date:
        end = datetime.now()
    else:
        end = datetime.fromisoformat(end_date)
    
    from app.models.sale import Sale
    
    # Get sales stats by user
    user_stats = (
        db.query(
            User.id,
            User.username,
            User.full_name,
            User.role,
            func.count(Sale.id).label("total_sales"),
            func.sum(Sale.total_amount).label("total_revenue"),
            func.avg(Sale.total_amount).label("average_sale"),
        )
        .outerjoin(Sale, User.id == Sale.user_id)
        .filter(User.is_active == True)
        .filter((Sale.sale_date >= start) & (Sale.sale_date <= end) | (Sale.id == None))
        .group_by(User.id, User.username, User.full_name, User.role)
        .all()
    )
    
    return {
        "period": {
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
        },
        "users": [
            {
                "id": stat.id,
                "username": stat.username,
                "full_name": stat.full_name,
                "role": stat.role,
                "total_sales": stat.total_sales or 0,
                "total_revenue": round(stat.total_revenue or 0, 2),
                "average_sale": round(stat.average_sale or 0, 2),
            }
            for stat in user_stats
        ],
    }


@router.get("/activity-logs")
async def get_activity_logs(
    skip: int = 0,
    limit: int = 50,
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get activity logs (Admin/Manager only)
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Manager or Admin access required")
    
    query = db.query(ActivityLog).join(User)
    
    # Filters
    if user_id:
        query = query.filter(ActivityLog.user_id == user_id)
    
    if action:
        query = query.filter(ActivityLog.action == action)
    
    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(ActivityLog.created_at >= start)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")
    
    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(ActivityLog.created_at <= end)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format")
    
    total = query.count()
    logs = query.order_by(desc(ActivityLog.created_at)).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "logs": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "username": log.user.username,
                "full_name": log.user.full_name,
                "action": log.action,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "description": log.description,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ],
    }


@router.post("/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reset user password (Admin only)
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        action="RESET_PASSWORD",
        entity_type="USER",
        entity_id=user_id,
        description=f"Reset password for user {user.username}",
    )
    db.add(log)
    db.commit()
    
    return {"message": "Password reset successfully"}


@router.get("/roles/list")
async def get_roles(
    current_user: User = Depends(get_current_user)
):
    """
    Get list of available user roles
    """
    return {
        "roles": [
            {"value": UserRole.ADMIN, "label": "Administrator", "description": "Full system access"},
            {"value": UserRole.MANAGER, "label": "Manager", "description": "Manage inventory, view reports"},
            {"value": UserRole.CASHIER, "label": "Cashier", "description": "Process sales only"},
        ]
    }
