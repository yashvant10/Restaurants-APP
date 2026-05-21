from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.restaurant import Restaurant
from models.order import Order
from auth.dependencies import get_current_user
from typing import List

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"]
)

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required."
        )
    return current_user

@router.get("/stats")
def get_platform_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_users = db.query(User).count()
    total_restaurants = db.query(Restaurant).count()
    total_orders = db.query(Order).count()
    
    # Calculate total revenue
    orders = db.query(Order).all()
    total_revenue = sum(o.total_amount for o in orders)
    
    return {
        "total_users": total_users,
        "total_restaurants": total_restaurants,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2)
    }

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "is_suspended": u.is_suspended,
            "created_at": u.created_at
        } for u in users
    ]

@router.post("/users/{user_id}/toggle-suspension")
def toggle_user_suspension(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot suspend your own administrator account."
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    user.is_suspended = not user.is_suspended
    db.commit()
    db.refresh(user)
    
    status_str = "suspended" if user.is_suspended else "activated"
    return {
        "success": True,
        "message": f"User {user.full_name} has been successfully {status_str}.",
        "is_suspended": user.is_suspended
    }
