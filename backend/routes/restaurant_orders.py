from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.order import Order
from models.order_status_history import OrderStatusHistory
from models.restaurant import Restaurant
from models.user import User
from schemas.order_schema import RestaurantOrderResponse
from auth.dependencies import get_current_user

router = APIRouter(
    tags=["restaurant_orders"]
)

def get_restaurant_for_user(user: User, db: Session) -> Restaurant:
    # 1. Fetch restaurant owned by this user
    restaurant = db.query(Restaurant).filter(Restaurant.owner_id == user.id).first()
    
    if not restaurant:
        # 2. Check if there is any unowned seeded restaurant (ID 1-6) they can claim
        unowned_seeded = db.query(Restaurant).filter(
            Restaurant.id <= 6,
            Restaurant.owner_id == None
        ).order_by(Restaurant.id.asc()).first()
        
        if unowned_seeded:
            unowned_seeded.owner_id = user.id
            db.commit()
            db.refresh(unowned_seeded)
            restaurant = unowned_seeded
        else:
            # 3. Otherwise, create a brand new restaurant for this user
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

def check_restaurant_access(user: User, restaurant_id: int, db: Session) -> bool:
    if user.role != 'restaurant':
        return False
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        return False
    # Owners can strictly only manage their own restaurant
    return restaurant.owner_id == user.id

@router.get("/api/restaurant/me")
def get_my_restaurant(restaurant_id: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'restaurant':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can access this endpoint."
        )
    if restaurant_id:
        restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
        if not restaurant or not check_restaurant_access(current_user, restaurant_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to manage this restaurant."
            )
    else:
        restaurant = get_restaurant_for_user(current_user, db)
    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "cuisine": restaurant.cuisine,
        "rating": restaurant.rating,
        "delivery_time": restaurant.delivery_time,
        "image_url": restaurant.image_url
    }

@router.get("/api/restaurant/list")
def list_my_restaurants(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'restaurant':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can view restaurants."
        )
    # Return strictly the restaurant owned by this user
    restaurants = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).all()
    
    return [{
        "id": r.id,
        "name": r.name,
        "cuisine": r.cuisine,
        "rating": r.rating,
        "delivery_time": r.delivery_time,
        "image_url": r.image_url
    } for r in restaurants]

@router.get("/api/restaurant/orders", response_model=List[RestaurantOrderResponse])
def get_restaurant_orders(restaurant_id: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'restaurant':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can view these orders."
        )
    
    if restaurant_id:
        restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
        if not restaurant or not check_restaurant_access(current_user, restaurant_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to manage this restaurant."
            )
    else:
        restaurant = get_restaurant_for_user(current_user, db)
    
    # Fetch all orders for this restaurant sorted by newest
    orders = db.query(Order).filter(
        Order.restaurant_id == restaurant.id
    ).order_by(Order.created_at.desc()).all()
    
    response_orders = []
    for order in orders:
        # Lookup customer by customer_id (new) or user_id (legacy fallback)
        cid = order.customer_id or order.user_id
        customer = db.query(User).filter(User.id == cid).first()
        customer_name = customer.full_name if customer else "VIP Customer"
        
        response_orders.append(
            RestaurantOrderResponse(
                id=order.id,
                customer_name=customer_name,
                items=order.items_json,
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
        
    if not check_restaurant_access(current_user, order.restaurant_id, db):
        raise HTTPException(status_code=403, detail="Not authorized to manage this order")
    
    order.status = "Preparing"
    db.add(OrderStatusHistory(order_id=order.id, status="Preparing"))
    db.commit()
    
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
        
    if not check_restaurant_access(current_user, order.restaurant_id, db):
        raise HTTPException(status_code=403, detail="Not authorized to manage this order")
    
    order.status = "Rejected"
    db.add(OrderStatusHistory(order_id=order.id, status="Rejected"))
    db.commit()
    
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
        
    if not check_restaurant_access(current_user, order.restaurant_id, db):
        raise HTTPException(status_code=403, detail="Not authorized to manage this order")
    
    order.status = "Delivering"
    db.add(OrderStatusHistory(order_id=order.id, status="Delivering"))
    db.commit()
    
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
        
    if not check_restaurant_access(current_user, order.restaurant_id, db):
        raise HTTPException(status_code=403, detail="Not authorized to manage this order")
    
    order.status = "Delivered"
    db.add(OrderStatusHistory(order_id=order.id, status="Delivered"))
    db.commit()
    
    await manager.broadcast_to_channel(f"order_{order.id}", {
        "type": "status_update",
        "order_id": order.id,
        "status": order.status,
        "message": "Order arrived! Bon Appetit!"
    })
    
    return {"message": "Order marked as delivered successfully"}
