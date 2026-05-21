from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models.restaurant import Restaurant
from models.menu_item import MenuItem
from models.order import Order
from models.user import User
from routes.restaurants import router as restaurants_router
from routes.orders import router as orders_router
from routes.menu_items import router as menu_items_router
from routes.restaurant_orders import router as restaurant_orders_router
from routes.auth import router as auth_router
from routes.admin import router as admin_router
from middleware.security import SecurityMiddleware
from contextlib import asynccontextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Database Initialization
    logger.info("Initializing database...")
    try:
        # Create tables if not exist
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created.")
        
        # Alter SQLite tables dynamically if columns are missing
        from sqlalchemy import text
        db_conn = SessionLocal()
        try:
            try:
                db_conn.execute(text("ALTER TABLE users ADD COLUMN is_suspended BOOLEAN DEFAULT 0 NOT NULL"))
                db_conn.commit()
                logger.info("Successfully added is_suspended column to users table.")
            except Exception as e:
                db_conn.rollback()
                logger.info(f"is_suspended column already exists or couldn't be added: {e}")

            try:
                db_conn.execute(text("ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL"))
                db_conn.commit()
                logger.info("Successfully added avatar column to users table.")
            except Exception as e:
                db_conn.rollback()
                logger.info(f"avatar column already exists or couldn't be added: {e}")

            try:
                db_conn.execute(text("ALTER TABLE users ADD COLUMN addresses JSON NULL"))
                db_conn.commit()
                logger.info("Successfully added addresses column to users table.")
            except Exception as e:
                db_conn.rollback()
                logger.info(f"addresses column already exists or couldn't be added: {e}")

            try:
                db_conn.execute(text("ALTER TABLE menu_items ADD COLUMN is_available BOOLEAN DEFAULT 1 NOT NULL"))
                db_conn.commit()
                logger.info("Successfully added is_available column to menu_items table.")
            except Exception as e:
                db_conn.rollback()
                logger.info(f"is_available column already exists or couldn't be added: {e}")
        finally:
            db_conn.close()
        
        # Check if database is empty to seed sample data
        db = SessionLocal()
        try:
            # Seed Default Admin User
            from auth.password_utils import hash_password
            admin_user = db.query(User).filter(User.role == 'admin').first()
            if not admin_user:
                logger.info("Seeding default platform admin...")
                default_admin = User(
                    full_name="Platform Administrator",
                    email="admin@velocitibites.com",
                    password=hash_password("AdminPassword2026!"),
                    role="admin",
                    avatar="🧑‍🍳",
                    is_suspended=False
                )
                db.add(default_admin)
                db.commit()
                logger.info("Successfully seeded default platform admin!")
            # Seed Restaurants first
            if db.query(Restaurant).count() == 0:
                logger.info("No restaurants found in database. Seeding default gourmet restaurants...")
                seed_restaurants = [
                    Restaurant(
                        name="Spice Garden",
                        cuisine="Indian • Curry • Tandoori",
                        rating=4.8,
                        delivery_time="20-30 Mins",
                        image_url="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    ),
                    Restaurant(
                        name="Pizza Palace",
                        cuisine="Italian • Pizza • Pasta",
                        rating=4.6,
                        delivery_time="15-25 Mins",
                        image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    ),
                    Restaurant(
                        name="Dragon Bowl",
                        cuisine="Chinese • Noodles • Dim Sum",
                        rating=4.4,
                        delivery_time="25-35 Mins",
                        image_url="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    ),
                    Restaurant(
                        name="Burger Hub",
                        cuisine="American • Burgers • Fries",
                        rating=4.7,
                        delivery_time="10-20 Mins",
                        image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    ),
                    Restaurant(
                        name="Tandoori Treats",
                        cuisine="Indian • Kebabs • Biryani",
                        rating=4.5,
                        delivery_time="20-30 Mins",
                        image_url="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    ),
                    Restaurant(
                        name="Sushi World",
                        cuisine="Japanese • Sushi • Ramen",
                        rating=4.9,
                        delivery_time="15-30 Mins",
                        image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    )
                ]
                db.add_all(seed_restaurants)
                db.commit()
                logger.info("Successfully seeded 6 gourmet restaurants!")
            else:
                logger.info("Database already contains restaurant data. Seeding skipped.")
            
            # Seed Menu Items
            if db.query(MenuItem).count() == 0:
                logger.info("No menu items found. Seeding premium menus...")
                seed_menu_items = [
                    # Restaurant 1: Spice Garden (Indian)
                    MenuItem(
                        restaurant_id=1,
                        name="Chicken Tikka Masala",
                        description="Tender grilled chicken pieces simmered in a rich, creamy, spiced tomato gravy.",
                        price=14.99,
                        image_url="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60",
                        is_veg=False,
                        category="Mains"
                    ),
                    MenuItem(
                        restaurant_id=1,
                        name="Butter Naan",
                        description="Soft, fluffy flatbread baked in a traditional clay tandoor oven and brushed with fresh butter.",
                        price=3.49,
                        image_url="https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Sides"
                    ),
                    MenuItem(
                        restaurant_id=1,
                        name="Garlic Naan",
                        description="Leavened clay-oven flatbread topped with fresh garlic shreds and chopped coriander leaves.",
                        price=3.99,
                        image_url="https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Sides"
                    ),
                    MenuItem(
                        restaurant_id=1,
                        name="Vegetable Samosas (2 pcs)",
                        description="Crispy golden pastry triangles stuffed with seasoned potatoes, green peas, and fresh spices.",
                        price=5.99,
                        image_url="https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Starters"
                    ),
                    MenuItem(
                        restaurant_id=1,
                        name="Mango Lassi",
                        description="Traditional sweet yogurt drink blended with delicious, premium ripe Alphonso mangoes.",
                        price=4.49,
                        image_url="https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Drinks"
                    ),

                    # Restaurant 2: Pizza Palace (Italian)
                    MenuItem(
                        restaurant_id=2,
                        name="Margherita Pizza",
                        description="Classic thin crust with organic tomato sauce, fresh buffalo mozzarella, virgin olive oil, and sweet basil leaves.",
                        price=12.99,
                        image_url="https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Mains"
                    ),
                    MenuItem(
                        restaurant_id=2,
                        name="Truffle Tagliatelle",
                        description="Exquisite house-made ribbon pasta tossed in a velvety, premium white truffle cream sauce with parmesan.",
                        price=18.99,
                        image_url="https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Mains"
                    ),
                    MenuItem(
                        restaurant_id=2,
                        name="Pepperoni Feast Pizza",
                        description="Gourmet double- pepperoni slices, melted whole-milk mozzarella cheese, and signature savory tomato marinara.",
                        price=15.99,
                        image_url="https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60",
                        is_veg=False,
                        category="Mains"
                    ),
                    MenuItem(
                        restaurant_id=2,
                        name="Aromatic Tiramisu",
                        description="Delicate sponge fingers soaked in dark espresso, layered with luxurious vanilla-bean mascarpone cream.",
                        price=7.99,
                        image_url="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Desserts"
                    ),

                    # Restaurant 3: Dragon Bowl (Chinese)
                    MenuItem(
                        restaurant_id=3,
                        name="Sichuan Chili Noodles",
                        description="Spicy hand-pulled wheat noodles tossed in roasted Sichuan chili paste, aged dark soy, garlic, and scallions.",
                        price=11.49,
                        image_url="https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Mains"
                    ),
                    MenuItem(
                        restaurant_id=3,
                        name="Shrimp Dim Sum (4 pcs)",
                        description="Delicate, steamed crystal-skin purses packed with sweet minced wild shrimp and fresh ginger shoots.",
                        price=8.99,
                        image_url="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60",
                        is_veg=False,
                        category="Starters"
                    ),
                    MenuItem(
                        restaurant_id=3,
                        name="Sweet & Sour Chicken",
                        description="Crispy golden tempura chicken bites tossed with tricolor sweet peppers and pineapples in a tangy glaze.",
                        price=13.99,
                        image_url="https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60",
                        is_veg=False,
                        category="Mains"
                    ),
                    MenuItem(
                        restaurant_id=3,
                        name="Crispy Veg Spring Rolls",
                        description="Flaky gold fried shells rolled with hand-shredded white cabbage, sweet carrots, and woodland mushrooms.",
                        price=6.49,
                        image_url="https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Starters"
                    ),

                    # Restaurant 4: Burger Hub (American)
                    MenuItem(
                        restaurant_id=4,
                        name="Classic Truffle Burger",
                        description="Flame-grilled grass-fed Angus beef patty, caramelized sweet onions, melted Swiss cheese, and house white truffle aioli.",
                        price=13.99,
                        image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60",
                        is_veg=False,
                        category="Mains"
                    ),
                    MenuItem(
                        restaurant_id=4,
                        name="Double Smashed Cheese",
                        description="Two crispy-edged smashed prime beef patties, double sliced Wisconsin cheddar, pickles, and signature burger sauce.",
                        price=15.99,
                        image_url="https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60",
                        is_veg=False,
                        category="Mains"
                    ),
                    MenuItem(
                        restaurant_id=4,
                        name="Hand-Cut Truffle Fries",
                        description="Double-fried Idaho russet potatoes sprinkled with aromatic truffle oil, coarse sea salt, and aged parmesan.",
                        price=6.99,
                        image_url="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Sides"
                    ),
                    MenuItem(
                        restaurant_id=4,
                        name="Fudge Chocolate Shake",
                        description="Decadent cream shake churned with double chocolate fudge pieces and topped with Madagascar whipped cream.",
                        price=5.99,
                        image_url="https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Drinks"
                    ),

                    # Restaurant 5: Tandoori Treats (Indian)
                    MenuItem(
                        restaurant_id=5,
                        name="Special Mutton Biryani",
                        description="Fragrant long-grain aged Basmati rice steamed with saffron, rosewater, and exceptionally tender spiced lamb ribs.",
                        price=17.99,
                        image_url="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60",
                        is_veg=False,
                        category="Mains"
                    ),
                    MenuItem(
                        restaurant_id=5,
                        name="Clay-Oven Paneer Tikka",
                        description="Grilled marinated organic cottage cheese chunks skewers loaded with colorful peppers, tomatoes, and spiced yogurt glaze.",
                        price=10.99,
                        image_url="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Starters"
                    ),
                    MenuItem(
                        restaurant_id=5,
                        name="Slow-Simmered Dal Makhani",
                        description="Creamy black lentils slow-cooked overnight with fresh cream, unsalted butter, vine tomatoes, and mild garden herbs.",
                        price=11.99,
                        image_url="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Mains"
                    ),
                    MenuItem(
                        restaurant_id=5,
                        name="Warm Gulab Jamuns",
                        description="Delectable fried milk-solid balls soaked in warm rosewater and green cardamom syrup.",
                        price=4.99,
                        image_url="https://images.unsplash.com/photo-1589135304905-6f2691b683d6?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Desserts"
                    ),

                    # Restaurant 6: Sushi World (Japanese)
                    MenuItem(
                        restaurant_id=6,
                        name="Deluxe Sushi Platter",
                        description="Master chef selection of fresh yellowfin tuna, Atlantic salmon, sea bass nigiri, and a classic California roll.",
                        price=24.99,
                        image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60",
                        is_veg=False,
                        category="Mains"
                    ),
                    MenuItem(
                        restaurant_id=6,
                        name="Tonkotsu Shoyu Ramen",
                        description="Slow-simmered rich pork bone broth topped with sliced chashu pork belly, marinated soft-boiled egg, and nori sheets.",
                        price=16.49,
                        image_url="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60",
                        is_veg=False,
                        category="Mains"
                    ),
                    MenuItem(
                        restaurant_id=6,
                        name="Spicy Salmon Maki Roll",
                        description="Fresh chopped raw salmon, crisp cucumber, and fire spicy mayo rolled in dry seaweed and vinegared rice.",
                        price=10.99,
                        image_url="https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500&auto=format&fit=crop&q=60",
                        is_veg=False,
                        category="Starters"
                    ),
                    MenuItem(
                        restaurant_id=6,
                        name="Matcha Green Tea Gelato",
                        description="Velvety home-spun organic green tea ice cream topped with sweet azuki red bean paste and mochi cubes.",
                        price=5.99,
                        image_url="https://images.unsplash.com/photo-1505394033-41a830947ba0?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Desserts"
                    ),
                    MenuItem(
                        restaurant_id=6,
                        name="Sea Salt Edamame",
                        description="Steamed fresh soybean pods sprinkled with flaky Maldon sea salt crystals. Simple and highly addictive.",
                        price=4.99,
                        image_url="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60",
                        is_veg=True,
                        category="Starters"
                    )
                ]
                db.add_all(seed_menu_items)
                db.commit()
                logger.info("Successfully seeded 25 gourmet menu items!")
            else:
                logger.info("Database already contains menu items. Seeding skipped.")
        except Exception as seed_err:
            db.rollback()
            logger.error(f"Error during seeding: {seed_err}")
        finally:
            db.close()
    except Exception as db_err:
        logger.error(f"Database initialization/connection failed: {db_err}")
        logger.warning("FastAPI app will start, but database endpoints might fail until MySQL is up.")

    yield
    # Shutdown operations (if any)
    logger.info("Shutting down backend...")

app = FastAPI(
    title="VelocitiBites Gourmet API",
    description="Backend API for VelocitiBites Food Delivery Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware Configuration
# Allows React frontend access on port 5173 or other local routes
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SecurityMiddleware, rate_limit_requests=120, rate_limit_period=60)

from fastapi import WebSocket, WebSocketDisconnect
from websocket import manager

@app.websocket("/ws/{channel_id}")
async def websocket_endpoint(websocket: WebSocket, channel_id: str):
    await manager.connect(websocket, channel_id)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "echo", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel_id)
    except Exception as e:
        logger.error(f"WebSocket error in channel {channel_id}: {e}")
        manager.disconnect(websocket, channel_id)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to VelocitiBites Gourmet REST API Portal",
        "endpoints": {
            "restaurants": "/api/restaurants"
        }
    }

# Register Routers
app.include_router(auth_router)
app.include_router(restaurants_router)
app.include_router(orders_router)
app.include_router(menu_items_router)
app.include_router(restaurant_orders_router)
app.include_router(admin_router)

