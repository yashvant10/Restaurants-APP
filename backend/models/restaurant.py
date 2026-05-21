from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    restaurant_name = Column(String(255), nullable=False)  # canonical column name
    cuisine = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    address = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    rating = Column(Float, default=0.0, nullable=False)
    is_open = Column(Boolean, default=True, nullable=False)
    # Kept for backward compat with frontend delivery_time display
    delivery_time = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")

    # -------------------------------------------------------
    # Backward-compatibility property: existing code uses
    # restaurant.name  ->  maps to  restaurant_name column
    # -------------------------------------------------------
    @property
    def name(self):
        return self.restaurant_name

    @name.setter
    def name(self, value):
        self.restaurant_name = value
