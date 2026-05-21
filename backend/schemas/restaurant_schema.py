from pydantic import BaseModel, computed_field
from datetime import datetime
from typing import Optional

class RestaurantBase(BaseModel):
    name: str
    cuisine: str
    rating: float
    delivery_time: str
    image_url: str

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantResponse(RestaurantBase):
    id: int
    created_at: Optional[datetime] = None

    @computed_field
    @property
    def image(self) -> str:
        return self.image_url

    @computed_field
    @property
    def deliveryTime(self) -> str:
        return self.delivery_time

    class Config:
        from_attributes = True
        populate_by_name = True
