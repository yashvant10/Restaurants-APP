from pydantic import BaseModel, computed_field, model_validator
from datetime import datetime
from typing import Optional

class RestaurantBase(BaseModel):
    name: Optional[str] = None
    cuisine: Optional[str] = None
    rating: Optional[float] = 0.0
    delivery_time: Optional[str] = None
    image_url: Optional[str] = None

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantResponse(BaseModel):
    id: int
    # Support both 'name' (legacy property) and 'restaurant_name' (canonical column)
    name: Optional[str] = None
    cuisine: Optional[str] = None
    rating: Optional[float] = 0.0
    delivery_time: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    is_open: Optional[bool] = True
    created_at: Optional[datetime] = None

    @model_validator(mode="before")
    @classmethod
    def resolve_name(cls, values):
        # If values is an ORM object, work with its __dict__ representation
        if hasattr(values, "__dict__"):
            data = {k: v for k, v in vars(values).items() if not k.startswith("_")}
            # Resolve name: use restaurant_name if name is None
            if not data.get("name") and data.get("restaurant_name"):
                data["name"] = data["restaurant_name"]
            return data
        # Plain dict
        if isinstance(values, dict):
            if not values.get("name") and values.get("restaurant_name"):
                values["name"] = values["restaurant_name"]
        return values

    @computed_field
    @property
    def image(self) -> str:
        return self.image_url or ""

    @computed_field
    @property
    def deliveryTime(self) -> str:
        return self.delivery_time or "20-30 Mins"

    class Config:
        from_attributes = True
        populate_by_name = True
