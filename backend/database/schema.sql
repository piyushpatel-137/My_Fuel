CREATE DATABASE IF NOT EXISTS myfuel
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE myfuel;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  dob DATE NOT NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  purpose ENUM('signup', 'reset') NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otps_email_purpose (email, purpose),
  INDEX idx_otps_expires_at (expires_at)
);

CREATE TABLE IF NOT EXISTS bikes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  number VARCHAR(50) NOT NULL,
  fuel_type ENUM('Petrol', 'Diesel', 'CNG', 'Electric', 'Other') NOT NULL DEFAULT 'Petrol',
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bikes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_bike_number (user_id, number)
);

CREATE TABLE IF NOT EXISTS fuel_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bike_id INT NOT NULL,
  liters DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  odometer INT NOT NULL,
  mileage DECIMAL(10,2) NULL,
  filled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fuel_entries_bike FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE,
  INDEX idx_fuel_entries_bike_date (bike_id, filled_at),
  INDEX idx_fuel_entries_bike_odometer (bike_id, odometer)
);

