from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.order import Order
from models.restaurant import Restaurant
from models.user import User
from schemas.order_schema import OrderCreate, OrderTrackerResponse
from auth.dependencies import get_current_user

router = APIRouter(
    prefix="/api/orders",
    tags=["orders"]
)

from websocket import manager

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # Convert Pydantic items list to dict/JSON for SQLAlchemy
        items_json = [item.model_dump() for item in order_data.items]
        
        new_order = Order(
            user_id=current_user.id,  # Securely set from the authenticated JWT user
            restaurant_id=order_data.restaurant_id,
            items=items_json,
            total_amount=order_data.total_amount,
            status="Pending"
        )
        
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        
        # Broadcast real-time order alert to restaurant channel
        await manager.broadcast_to_channel(f"restaurant_{new_order.restaurant_id}", {
            "type": "new_order",
            "order_id": new_order.id,
            "restaurant_id": new_order.restaurant_id,
            "total_amount": new_order.total_amount,
            "message": "A new gourmet culinary ticket has been requested!"
        })
        
        return {
            "message": "Order placed successfully",
            "order_id": new_order.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to place order: {str(e)}")

from typing import List

@router.get("/my", response_model=List[OrderTrackerResponse])
def get_user_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch past orders for the logged-in customer."""
    try:
        orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
        response_orders = []
        for order in orders:
            restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
            restaurant_name = restaurant.name if restaurant else "Gourmet Kitchen"
            
            # Dynamic est time
            status_lower = order.status.lower()
            if status_lower in ["pending", "placed"]:
                est_time = "25-35 Mins"
            elif status_lower in ["preparing", "accepted"]:
                est_time = "15-25 Mins"
            elif status_lower in ["delivering", "dispatched", "out for delivery"]:
                est_time = "5-15 Mins"
            elif status_lower == "delivered":
                est_time = "Arrived"
            else:
                est_time = "Unavailable"
                
            response_orders.append({
                "id": order.id,
                "restaurant_name": restaurant_name,
                "status": order.status,
                "estimated_time": est_time,
                "items": order.items,
                "total_amount": order.total_amount
            })
        return response_orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch order history: {str(e)}")

@router.get("/{order_id}", response_model=OrderTrackerResponse)
def get_order_tracking(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Authorized access control check:
    # Customers can only view their own orders. Restaurants can view any order placed with them.
    if current_user.role == 'customer' and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
        
    restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
    restaurant_name = restaurant.name if restaurant else "Gourmet Kitchen"
    
    # Dynamic Estimated Delivery Time
    status_lower = order.status.lower()
    if status_lower in ["pending", "placed"]:
        est_time = "25-35 Mins"
    elif status_lower in ["preparing", "accepted"]:
        est_time = "15-25 Mins"
    elif status_lower in ["delivering", "dispatched", "out for delivery"]:
        est_time = "5-15 Mins"
    elif status_lower == "delivered":
        est_time = "Arrived"
    else:
        est_time = "Unavailable"
        
    return {
        "id": order.id,
        "restaurant_name": restaurant_name,
        "status": order.status,
        "estimated_time": est_time,
        "items": order.items,
        "total_amount": order.total_amount
    }
