from pydantic import BaseModel, computed_field
from datetime import datetime
from typing import Optional

class MenuItemBase(BaseModel):
    name: str
    description: str
    price: float
    image_url: str
    is_veg: bool = True
    is_available: bool = True
    category: str

class MenuItemCreate(MenuItemBase):
    restaurant_id: int

class MenuItemResponse(MenuItemBase):
    id: int
    restaurant_id: int
    created_at: Optional[datetime] = None

    @computed_field
    @property
    def image(self) -> str:
        return self.image_url

    class Config:
        from_attributes = True
        populate_by_name = True
