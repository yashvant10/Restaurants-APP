from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # customer_id is the canonical FK; user_id is kept as an alias for backward compat
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)  # legacy alias — same value as customer_id
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="Placed", nullable=False)
    estimated_delivery_time = Column(String(50), nullable=True)
    # Legacy JSON blob kept for seamless SQLite fallback compatibility
    items = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to normalized order items
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    @property
    def items_json(self):
        """
        Returns a serializable list of items.
        Tries relational order_items first, then falls back to legacy JSON column.
        """
        try:
            if self.order_items:
                result = []
                for oi in self.order_items:
                    try:
                        item_name = oi.menu_item.name if oi.menu_item else f"Item #{oi.menu_item_id}"
                    except Exception:
                        item_name = f"Item #{oi.menu_item_id}"
                    result.append({
                        "id": oi.menu_item_id,
                        "name": item_name,
                        "quantity": oi.quantity,
                        "price": float(oi.item_price),
                    })
                if result:
                    return result
        except Exception:
            pass
        # Legacy fallback — JSON blob stored at order creation time
        if self.items:
            if isinstance(self.items, list):
                return self.items
            try:
                import json
                return json.loads(self.items)
            except Exception:
                pass
        return []
