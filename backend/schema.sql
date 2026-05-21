-- Create Database
CREATE DATABASE IF NOT EXISTS food_delivery_platform;
USE food_delivery_platform;

-- Disable foreign key checks for clean drops
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'restaurant', 'admin') NOT NULL,
    phone VARCHAR(20),
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. RESTAURANTS TABLE
CREATE TABLE restaurants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NULL,
    restaurant_name VARCHAR(255) NOT NULL,
    cuisine VARCHAR(255),
    description TEXT,
    address TEXT,
    image_url TEXT,
    rating FLOAT DEFAULT 0,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. MENU ITEMS TABLE
CREATE TABLE menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CART TABLE
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ORDERS TABLE
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM(
        'Placed',
        'Preparing',
        'Accepted',
        'Delivering',
        'Delivered',
        'Rejected'
    ) DEFAULT 'Placed',
    estimated_delivery_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ORDER ITEMS TABLE
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT DEFAULT 1,
    item_price DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ORDER STATUS TRACKING TABLE
CREATE TABLE order_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    status VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. REVIEWS TABLE
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seeding Basic Users
-- Password hash for 'password123'
INSERT INTO users (id, full_name, email, password, role, phone) VALUES
(1, 'Platform Administrator', 'admin@velocitibites.com', '$2b$12$R9hZqgLpA2l./2gqyvH.pujlXh2p3hW/1hK2cE.dG1E5yWkHw5P.q', 'admin', '1234567890'),
(2, 'Krisha Patel', 'yashwanthrao498@gmail.com', '$2b$12$R9hZqgLpA2l./2gqyvH.pujlXh2p3hW/1hK2cE.dG1E5yWkHw5P.q', 'restaurant', '2345678901'),
(3, 'Friend Pizza Owner', 'pizza_owner@example.com', '$2b$12$R9hZqgLpA2l./2gqyvH.pujlXh2p3hW/1hK2cE.dG1E5yWkHw5P.q', 'restaurant', '3456789012'),
(4, 'Friend Chinese Owner', 'chinese_owner@example.com', '$2b$12$R9hZqgLpA2l./2gqyvH.pujlXh2p3hW/1hK2cE.dG1E5yWkHw5P.q', 'restaurant', '4567890123'),
(5, 'Friend Burger Owner', 'burger_owner@example.com', '$2b$12$R9hZqgLpA2l./2gqyvH.pujlXh2p3hW/1hK2cE.dG1E5yWkHw5P.q', 'restaurant', '5678901234'),
(6, 'Friend Sushi Owner', 'sushi_owner@example.com', '$2b$12$R9hZqgLpA2l./2gqyvH.pujlXh2p3hW/1hK2cE.dG1E5yWkHw5P.q', 'restaurant', '6789012345'),
(7, 'Yash Rao', 'raos10001yash@gmail.com', '$2b$12$R9hZqgLpA2l./2gqyvH.pujlXh2p3hW/1hK2cE.dG1E5yWkHw5P.q', 'customer', '7890123456');

-- Seeding Sample Restaurants (IDs 1-6)
INSERT INTO restaurants (id, owner_id, restaurant_name, cuisine, description, address, image_url, rating, is_open) VALUES
(1, 2, 'Spice Garden', 'Indian', 'Authentic Indian Curry, Tandoori dishes, and delicious Biryani.', '12 Main St, Gourmet District', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60', 4.5, TRUE),
(2, 3, 'Pizza Palace', 'Italian', 'Wood-fired oven pizzas, gourmet handmade pasta, and fresh garlic bread.', '45 Olive Rd, Bella Vista', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60', 4.3, TRUE),
(3, 4, 'Dragon Bowl', 'Chinese', 'Hand-pulled Noodles, Cantonese style Dim Sum, and spicy Sichuan bowls.', '88 Dragon Alley, Chinatown', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60', 4.7, TRUE),
(4, 5, 'Burger Hub', 'Fast Food', 'Gourmet smashed beef patties, double cheese slices, and seasoned fries.', '102 Grill Ave, Midtown', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60', 4.2, TRUE),
(5, 6, 'Sushi World', 'Japanese', 'Traditional Edo-style Nigiri, gourmet maki rolls, and hot shoyu ramen.', '3 Tokyo Blvd, Sakura Plaza', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60', 4.8, TRUE);

-- Seeding Menu Items for Restaurants
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url, is_available) VALUES
-- Spice Garden (ID 1)
(1, 'Butter Chicken', 'Tender tandoori chicken simmered in a rich tomato, butter, and cream sauce.', 'Mains', 16.99, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60', TRUE),
(1, 'Garlic Naan', 'Freshly baked leavened flatbread topped with chopped garlic and butter.', 'Sides', 3.99, 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60', TRUE),
-- Pizza Palace (ID 2)
(2, 'Margherita Pizza', 'Classic neapolitan style pizza with fresh mozzarella, basil, and tomato sauce.', 'Pizza', 12.99, 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&auto=format&fit=crop&q=60', TRUE),
(2, 'Truffle Mushroom Pasta', 'Penne tossed with cremini mushrooms in a creamy white truffle oil reduction.', 'Pasta', 15.99, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop&q=60', TRUE),
-- Dragon Bowl (ID 3)
(3, 'Kung Pao Chicken', 'Spicy stir-fried chicken with peanuts, bell peppers, and scallions in soy chili sauce.', 'Mains', 14.50, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60', TRUE),
(3, 'Steamed Pork Dumplings', 'Handmade pork and scallion dumplings served with a ginger vinegar dip.', 'Starters', 8.99, 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=60', TRUE),
-- Burger Hub (ID 4)
(4, 'Classic Double Smashed', 'Two premium smashed beef patties, cheddar cheese, pickles, and signature house sauce.', 'Burgers', 11.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60', TRUE),
(4, 'Curly Seasoned Fries', 'Crispy golden curly spiral cut potatoes dusted with cajun spices.', 'Sides', 4.50, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60', TRUE),
-- Sushi World (ID 5)
(5, 'Dragon Specialty Roll', 'Spicy tuna and cucumber topped with fresh avocado slices, unagi eel sauce, and spicy mayo.', 'Sushi', 16.50, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60', TRUE),
(5, 'Tonkotsu Ramen', 'Rich pork bone broth served with tender chashu pork, soft egg, bamboo shoots, and green onion.', 'Ramen', 15.00, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60', TRUE);
