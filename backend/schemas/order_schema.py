from pydantic import BaseModel, ConfigDict
from typing import List
from datetime import datetime

class OrderItemSchema(BaseModel):
    id: int
    name: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    user_id: int
    restaurant_id: int
    items: List[OrderItemSchema]
    total_amount: float

class OrderResponse(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    items: List[OrderItemSchema]
    total_amount: float
    status: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class RestaurantOrderResponse(BaseModel):
    id: int
    customer_name: str
    items: List[OrderItemSchema]
    total_amount: float
    status: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class OrderTrackerResponse(BaseModel):
    id: int
    restaurant_name: str
    status: str
    estimated_time: str
    items: List[OrderItemSchema]
    total_amount: float
    
    model_config = ConfigDict(from_attributes=True)
