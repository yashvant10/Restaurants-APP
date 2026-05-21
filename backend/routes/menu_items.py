from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.menu_item import MenuItem
from models.user import User
from schemas.menu_item_schema import MenuItemCreate, MenuItemResponse
from auth.dependencies import get_current_user
from routes.restaurant_orders import get_restaurant_for_user

router = APIRouter(
    prefix="/api/menu-items",
    tags=["menu_items"]
)

@router.get("/", response_model=List[MenuItemResponse])
def get_menu_items(restaurant_id: int, db: Session = Depends(get_db)):
    items = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant_id).all()
    return items

@router.post("/", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(item_data: MenuItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'restaurant':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can add menu items"
        )
    restaurant = get_restaurant_for_user(current_user, db)
    
    new_item = MenuItem(
        restaurant_id=restaurant.id,
        name=item_data.name,
        description=item_data.description,
        price=item_data.price,
        image_url=item_data.image_url,
        is_veg=item_data.is_veg,
        is_available=item_data.is_available,
        category=item_data.category
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(item_id: int, item_data: MenuItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'restaurant':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit items"
        )
    
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
        
    restaurant = get_restaurant_for_user(current_user, db)
    if item.restaurant_id != restaurant.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this item"
        )
    
    update_data = item_data.model_dump()
    for key, value in update_data.items():
        if key != 'restaurant_id':  # Bind to secure owner restaurant
            setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.patch("/{item_id}/toggle-availability", response_model=MenuItemResponse)
def toggle_item_availability(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != 'restaurant':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit items"
        )
    
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
        
    restaurant = get_restaurant_for_user(current_user, db)
    if item.restaurant_id != restaurant.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this item"
        )
    
    item.is_available = not item.is_available
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'restaurant':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete items"
        )
    
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
        
    restaurant = get_restaurant_for_user(current_user, db)
    if item.restaurant_id != restaurant.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this item"
        )
    
    db.delete(item)
    db.commit()
    return None
