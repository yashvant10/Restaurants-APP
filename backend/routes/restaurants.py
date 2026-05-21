from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.restaurant import Restaurant
from models.menu_item import MenuItem
from schemas.restaurant_schema import RestaurantResponse
from schemas.menu_item_schema import MenuItemResponse

router = APIRouter(
    prefix="/api/restaurants",
    tags=["restaurants"]
)

@router.get("", response_model=List[RestaurantResponse], status_code=status.HTTP_200_OK)
def get_restaurants(db: Session = Depends(get_db)):
    """
    Fetch all restaurants from the database.
    """
    try:
        restaurants = db.query(Restaurant).all()
        return restaurants
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching restaurants: {str(e)}"
        )

@router.get("/{restaurant_id}", response_model=RestaurantResponse, status_code=status.HTTP_200_OK)
def get_restaurant_by_id(restaurant_id: int, db: Session = Depends(get_db)):
    """
    Fetch a single restaurant details by its ID.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Restaurant with ID {restaurant_id} not found."
        )
    return restaurant

@router.get("/{restaurant_id}/menu", response_model=List[MenuItemResponse], status_code=status.HTTP_200_OK)
def get_restaurant_menu(restaurant_id: int, db: Session = Depends(get_db)):
    """
    Fetch all menu items belonging to a specific restaurant.
    """
    # Verify first if the restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Restaurant with ID {restaurant_id} not found."
        )
    
    try:
        menu_items = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant_id).all()
        return menu_items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching the menu: {str(e)}"
        )
