from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True, unique=True, index=True)
    name = Column(String(255), nullable=False)
    cuisine = Column(String(255), nullable=False)
    rating = Column(Float, nullable=False)
    delivery_time = Column(String(50), nullable=False)
    image_url = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationship to menu items
    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")
