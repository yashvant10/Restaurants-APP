import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environmental variables from .env
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_DATABASE = os.getenv("DB_DATABASE", "food_delivery_app")

# Construct SQLAlchemy connection URL using SQLite
DATABASE_URL = "sqlite:///./food_delivery_app.db"

# Create SQLAlchemy engine
# pool_pre_ping=True automatically validates stale/dropped connections
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} # Needed for SQLite with FastAPI
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class for ORM models
Base = declarative_base()

# Reusable database session generator dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
