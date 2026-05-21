from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.order import Order
from models.restaurant import Restaurant
from models.user import User
from schemas.order_schema import RestaurantOrderResponse
from auth.dependencies import get_current_user

router = APIRouter(
    tags=["restaurant_orders"]
)

def get_restaurant_for_user(user: User, db: Session) -> Restaurant:
    # See if there's an existing Restaurant owned by this user
    restaurant = db.query(Restaurant).filter(Restaurant.owner_id == user.id).first()
    if not restaurant:
        # If user is the first owner or Spice Garden is unowned, let's claim it
        restaurant = db.query(Restaurant).filter(Restaurant.id == 1).first()
        if restaurant and restaurant.owner_id is None:
            restaurant.owner_id = user.id
            db.commit()
            db.refresh(restaurant)
        else:
            # Create a brand new restaurant for this user
            restaurant = Restaurant(
                owner_id=user.id,
                name=f"{user.full_name}'s Gourmet Kitchen",
                cuisine="Gourmet • Continental • Fusion",
                rating=4.8,
                delivery_time="20-30 Mins",
                image_url="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=60"
            )
            db.add(restaurant)
            db.commit()
            db.refresh(restaurant)
    return restaurant

@router.get("/api/restaurant/me")
def get_my_restaurant(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'restaurant':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can access this endpoint."
        )
    restaurant = get_restaurant_for_user(current_user, db)
    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "cuisine": restaurant.cuisine,
        "rating": restaurant.rating,
        "delivery_time": restaurant.delivery_time,
        "image_url": restaurant.image_url
    }

@router.get("/api/restaurant/orders", response_model=List[RestaurantOrderResponse])
def get_restaurant_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'restaurant':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can view these orders."
        )
    
    restaurant = get_restaurant_for_user(current_user, db)
    
    # Fetch all orders for this restaurant sorted by newest
    orders = db.query(Order).filter(
        Order.restaurant_id == restaurant.id
    ).order_by(Order.created_at.desc()).all()
    
    response_orders = []
    for order in orders:
        customer = db.query(User).filter(User.id == order.user_id).first()
        customer_name = customer.full_name if customer else "VIP Customer"
        
        response_orders.append(
            RestaurantOrderResponse(
                id=order.id,
                customer_name=customer_name,
                items=order.items,
                total_amount=order.total_amount,
                status=order.status,
                created_at=order.created_at
            )
        )
    return response_orders

from websocket import manager

@router.put("/api/orders/{order_id}/accept")
async def accept_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'restaurant':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    restaurant = get_restaurant_for_user(current_user, db)
    if order.restaurant_id != restaurant.id:
        raise HTTPException(status_code=403, detail="Not authorized to manage this order")
    
    order.status = "Preparing"  # Advance directly to Preparing state
    db.commit()
    
    # Broadcast status change to order tracker channel
    await manager.broadcast_to_channel(f"order_{order.id}", {
        "type": "status_update",
        "order_id": order.id,
        "status": order.status,
        "message": "Kitchen accepted your ticket and started food preparation!"
    })
    
    return {"message": "Order accepted & preparation started"}

@router.put("/api/orders/{order_id}/reject")
async def reject_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'restaurant':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    restaurant = get_restaurant_for_user(current_user, db)
    if order.restaurant_id != restaurant.id:
        raise HTTPException(status_code=403, detail="Not authorized to manage this order")
    
    order.status = "Rejected"
    db.commit()
    
    # Broadcast status change to order tracker channel
    await manager.broadcast_to_channel(f"order_{order.id}", {
        "type": "status_update",
        "order_id": order.id,
        "status": order.status,
        "message": "We are sorry, but the kitchen has rejected your order."
    })
    
    return {"message": "Order rejected"}

@router.put("/api/orders/{order_id}/deliver")
async def dispatch_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'restaurant':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    restaurant = get_restaurant_for_user(current_user, db)
    if order.restaurant_id != restaurant.id:
        raise HTTPException(status_code=403, detail="Not authorized to manage this order")
    
    order.status = "Delivering"
    db.commit()
    
    # Broadcast status change to order tracker channel
    await manager.broadcast_to_channel(f"order_{order.id}", {
        "type": "status_update",
        "order_id": order.id,
        "status": order.status,
        "message": "Your gourmet culinary dishes are out for delivery!"
    })
    
    return {"message": "Order is out for delivery"}

@router.put("/api/orders/{order_id}/complete")
async def complete_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'restaurant':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    restaurant = get_restaurant_for_user(current_user, db)
    if order.restaurant_id != restaurant.id:
        raise HTTPException(status_code=403, detail="Not authorized to manage this order")
    
    order.status = "Delivered"
    db.commit()
    
    # Broadcast status change to order tracker channel
    await manager.broadcast_to_channel(f"order_{order.id}", {
        "type": "status_update",
        "order_id": order.id,
        "status": order.status,
        "message": "Order arrived! Bon Appetit!"
    })
    
    return {"message": "Order marked as delivered successfully"}
