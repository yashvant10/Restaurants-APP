from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), index=True)
    items = Column(JSON, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="Pending", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
