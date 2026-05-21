from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.order import Order
from models.order_item import OrderItem
from models.order_status_history import OrderStatusHistory
from models.menu_item import MenuItem
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
        # Build items JSON snapshot for legacy fallback
        items_snapshot = [{"id": item.id, "name": item.name, "quantity": item.quantity, "price": item.price} for item in order_data.items]

        new_order = Order(
            customer_id=current_user.id,
            user_id=current_user.id,           # legacy alias
            restaurant_id=order_data.restaurant_id,
            total_amount=order_data.total_amount,
            status="Placed",
            estimated_delivery_time="25-35 Mins",
            items=items_snapshot,               # JSON fallback + relational order_items below
        )
        db.add(new_order)
        db.flush()  # get new_order.id without full commit

        # ---------------------------------------------------
        # 2. Insert normalized OrderItem rows
        # ---------------------------------------------------
        for item in order_data.items:
            # Look up the menu item to get the canonical price snapshot
            menu_item = db.query(MenuItem).filter(MenuItem.id == item.id).first()
            price_snapshot = menu_item.price if menu_item else item.price

            order_item = OrderItem(
                order_id=new_order.id,
                menu_item_id=item.id,
                quantity=item.quantity,
                item_price=price_snapshot,
            )
            db.add(order_item)

        # ---------------------------------------------------
        # 3. Append initial status history entry
        # ---------------------------------------------------
        history_entry = OrderStatusHistory(
            order_id=new_order.id,
            status="Placed",
        )
        db.add(history_entry)

        db.commit()
        db.refresh(new_order)

        # ---------------------------------------------------
        # 4. Broadcast real-time order alert to restaurant WS channel
        # ---------------------------------------------------
        await manager.broadcast_to_channel(f"restaurant_{new_order.restaurant_id}", {
            "type": "new_order",
            "order_id": new_order.id,
            "restaurant_id": new_order.restaurant_id,
            "total_amount": new_order.total_amount,
            "message": "A new order ticket has arrived!"
        })

        return {
            "message": "Order placed successfully",
            "order_id": new_order.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to place order: {str(e)}")

from typing import List
from sqlalchemy import or_

@router.get("/my", response_model=List[OrderTrackerResponse])
def get_user_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch past orders for the logged-in customer."""
    try:
        orders = db.query(Order).filter(
            or_(Order.user_id == current_user.id, Order.customer_id == current_user.id)
        ).order_by(Order.created_at.desc()).all()

        response_orders = []
        for order in orders:
            restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
            restaurant_name = restaurant.name if restaurant else "Gourmet Kitchen"

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
                "items": order.items_json,
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

    # Access control: customers see only their own orders
    if current_user.role == 'customer' and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
    restaurant_name = restaurant.name if restaurant else "Gourmet Kitchen"

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
        "items": order.items_json,
        "total_amount": order.total_amount
    }
