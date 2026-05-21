import os
import pymysql
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environmental variables from .env
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_DATABASE = os.getenv("DB_DATABASE", "food_delivery_platform")

# Support both MySQL and SQLite fallback
# Try connecting to MySQL. If it fails or is disabled, fall back gracefully to SQLite
USE_MYSQL = os.getenv("USE_MYSQL", "true").lower() == "true"

# Attempt to create the database if it doesn't exist
if USE_MYSQL:
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=int(DB_PORT),
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_DATABASE}")
        cursor.close()
        conn.close()
        print(f"MySQL Database schema '{DB_DATABASE}' verified/created.")
    except Exception as e:
        print(f"Could not verify/create MySQL database schema: {e}")

if USE_MYSQL:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DATABASE}"
else:
    DATABASE_URL = "sqlite:///./food_delivery_platform.db"

try:
    if USE_MYSQL:
        # Create MySQL engine with connection pooling and recycle time to prevent timeouts
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600
        )
        # Test connection
        conn = engine.connect()
        conn.close()
        print("Successfully connected to MySQL database using PyMySQL!")
    else:
        raise ValueError("MySQL disabled, using SQLite")
except Exception as e:
    print(f"MySQL connection failed: {e}. Falling back to SQLite.")
    DATABASE_URL = "sqlite:///./food_delivery_platform.db"
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
