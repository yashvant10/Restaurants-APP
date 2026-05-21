-- Create Database
CREATE DATABASE IF NOT EXISTS food_delivery_app;
USE food_delivery_app;

-- Create Restaurants Table
CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cuisine VARCHAR(255) NOT NULL,
    rating FLOAT NOT NULL,
    delivery_time VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Sample Data (6 Restaurants)
INSERT INTO restaurants (name, cuisine, rating, delivery_time, image_url) VALUES
('Spice Garden', 'Indian • Curry • Tandoori', 4.8, '20-30 Mins', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
('Pizza Palace', 'Italian • Pizza • Pasta', 4.6, '15-25 Mins', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
('Dragon Bowl', 'Chinese • Noodles • Dim Sum', 4.4, '25-35 Mins', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
('Burger Hub', 'American • Burgers • Fries', 4.7, '10-20 Mins', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
('Tandoori Treats', 'Indian • Kebabs • Biryani', 4.5, '20-30 Mins', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
('Sushi World', 'Japanese • Sushi • Ramen', 4.9, '15-30 Mins', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3');
