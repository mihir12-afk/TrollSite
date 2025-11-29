CREATE DATABASE IF NOT EXISTS mihir_troll_db;
USE mihir_troll_db;

-- 1. Users (The Victims)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_meme VARCHAR(100) DEFAULT 'default_troll',
    wallet_balance DECIMAL(10, 2) DEFAULT 420.69, -- Nice start balance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Achievements (The Clout)
CREATE TABLE achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(100),
    meme_url VARCHAR(255),
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. Transactions (The Receipts)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    vehicle VARCHAR(50),
    amount DECIMAL(10, 2),
    meme_tax DECIMAL(10, 2),
    receipt_ascii TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);