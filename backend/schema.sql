-- =========================================================================
-- GlobeTrotter - Relational Database Schema & Data Definition Language (DDL)
-- Custom Architecture for Odoo Hackathon 2026
-- =========================================================================

PRAGMA foreign_keys = ON;

-- 1. Users Table (Core Identity & Regional Configuration)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  country TEXT DEFAULT 'India',
  phone_code TEXT DEFAULT '+91',
  phone_number TEXT DEFAULT '',
  role TEXT DEFAULT 'traveler' CHECK(role IN ('traveler', 'admin')),
  home_currency TEXT DEFAULT 'USD' CHECK(home_currency IN ('USD', 'EUR', 'INR', 'GBP', 'JPY', 'AUD', 'CAD')),
  preferences TEXT DEFAULT '[]',
  is_verified INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Email Verifications & Transactional OTP Tokens
CREATE TABLE IF NOT EXISTS email_verifications (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK(purpose IN ('signup', 'forgot_password')),
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Trips Table (Multi-City Travel Blueprints)
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_budget REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  is_public INTEGER DEFAULT 0,
  share_slug TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Trip Stops Table (Sequential City Destinations on Itinerary)
CREATE TABLE IF NOT EXISTS trip_stops (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  city_name TEXT NOT NULL,
  country TEXT NOT NULL,
  continent TEXT DEFAULT 'World',
  lat REAL,
  lng REAL,
  order_index INTEGER DEFAULT 0,
  arrival_date TEXT,
  departure_date TEXT,
  transport_mode TEXT DEFAULT 'flight' CHECK(transport_mode IN ('flight', 'train', 'bus', 'car', 'boat')),
  transport_cost REAL DEFAULT 0,
  stay_cost REAL DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- 5. Stop Activities Table (Day-by-Day Agenda & Experiences)
CREATE TABLE IF NOT EXISTS stop_activities (
  id TEXT PRIMARY KEY,
  stop_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Sightseeing' CHECK(category IN ('Sightseeing', 'Food', 'Adventure', 'Culture', 'Nightlife', 'Relax', 'Transport')),
  image_url TEXT,
  cost REAL DEFAULT 0,
  duration_hours REAL DEFAULT 2,
  scheduled_time TEXT,
  day_number INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE
);

-- 6. Destinations Master Catalog (Global Curated Cities)
CREATE TABLE IF NOT EXISTS destinations_master (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  continent TEXT NOT NULL,
  cost_index TEXT DEFAULT '$$' CHECK(cost_index IN ('$', '$$', '$$$', '$$$$')),
  popularity_score REAL DEFAULT 4.8,
  hero_image TEXT NOT NULL,
  description TEXT NOT NULL,
  best_season TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  tags TEXT DEFAULT '[]'
);

-- 7. Destination Activities Master Catalog
CREATE TABLE IF NOT EXISTS destination_activities_master (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  cost REAL DEFAULT 0,
  duration_hours REAL DEFAULT 2,
  image_url TEXT NOT NULL,
  rating REAL DEFAULT 4.8,
  FOREIGN KEY (destination_id) REFERENCES destinations_master(id) ON DELETE CASCADE
);

-- 8. Saved Wishlist Table (User Bookmarked Destinations)
CREATE TABLE IF NOT EXISTS saved_wishlist (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  destination_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations_master(id) ON DELETE CASCADE,
  UNIQUE(user_id, destination_id)
);

-- =========================================================================
-- Performance Indexes
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_stops_trip ON trip_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_stop ON stop_activities(stop_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON saved_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_master_activities_dest ON destination_activities_master(destination_id);
