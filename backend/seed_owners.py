import sys
import os

# Adjust path so we can import from database and models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
# Import ALL models so SQLAlchemy initializes the mappers correctly
from models.user import User
from models.restaurant import Restaurant
from models.menu_item import MenuItem
from models.order import Order
from models.order_item import OrderItem
from models.order_status_history import OrderStatusHistory
from models.cart_item import CartItem
from models.review import Review

from auth.password_utils import hash_password

def seed_demo_owners():
    db = SessionLocal()
    try:
        demo_accounts = [
            {
                "email": "spicegarden@restaurant.com",
                "full_name": "Chef Rajesh - Spice Garden",
                "password": "password123",
                "restaurant_id": 1
            },
            {
                "email": "pizzapalace@restaurant.com",
                "full_name": "Chef Mario - Pizza Palace",
                "password": "password123",
                "restaurant_id": 2
            },
            {
                "email": "dragonbowl@restaurant.com",
                "full_name": "Chef Chen - Dragon Bowl",
                "password": "password123",
                "restaurant_id": 3
            },
            {
                "email": "burgerhub@restaurant.com",
                "full_name": "Manager John - Burger Hub",
                "password": "password123",
                "restaurant_id": 4
            },
            {
                "email": "tandooritreats@restaurant.com",
                "full_name": "Chef Ahmed - Tandoori Treats",
                "password": "password123",
                "restaurant_id": 5
            }
        ]

        print("Seeding demo restaurant owner accounts...")
        for acc in demo_accounts:
            # Check if user already exists
            user = db.query(User).filter(User.email == acc["email"]).first()
            if not user:
                user = User(
                    full_name=acc["full_name"],
                    email=acc["email"],
                    password=hash_password(acc["password"]),
                    role="restaurant"
                )
                db.add(user)
                db.flush()
                print(f"Created owner account: {acc['email']}")
            else:
                # Update password just in case to be password123
                user.password = hash_password(acc["password"])
                db.flush()
                print(f"Owner account already exists: {acc['email']}. Reset password to password123.")

            # Assign to the corresponding restaurant
            restaurant = db.query(Restaurant).filter(Restaurant.id == acc["restaurant_id"]).first()
            if restaurant:
                restaurant.owner_id = user.id
                db.flush()
                print(f"Assigned {acc['email']} as owner of restaurant ID {restaurant.id} ({restaurant.restaurant_name})")
            else:
                print(f"Warning: Restaurant with ID {acc['restaurant_id']} not found.")

        db.commit()
        print("Demo accounts seeding complete successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_owners()
