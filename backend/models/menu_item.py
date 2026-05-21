from sqlalchemy import Column, Integer, String, Float, Text, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    image_url = Column(Text, nullable=False)
    is_veg = Column(Boolean, default=True, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    category = Column(String(100), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationship to parent restaurant
    restaurant = relationship("Restaurant", back_populates="menu_items")
