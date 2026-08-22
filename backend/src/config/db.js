import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../globetrotter.db');

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await dbInstance.run('PRAGMA foreign_keys = ON');

  await initTables(dbInstance);
  return dbInstance;
}

async function initTables(db) {
  // Users Table with Country & Phone support
  await db.exec(`
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
      role TEXT DEFAULT 'traveler',
      home_currency TEXT DEFAULT 'USD',
      preferences TEXT DEFAULT '[]',
      is_verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // OTP and Verification Tokens
  await db.exec(`
    CREATE TABLE IF NOT EXISTS email_verifications (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      purpose TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Trips Table
  await db.exec(`
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
  `);

  // Trip Stops
  await db.exec(`
    CREATE TABLE IF NOT EXISTS trip_stops (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      city_name TEXT NOT NULL,
      country TEXT NOT NULL,
      continent TEXT,
      lat REAL,
      lng REAL,
      order_index INTEGER DEFAULT 0,
      arrival_date TEXT,
      departure_date TEXT,
      transport_mode TEXT DEFAULT 'flight',
      transport_cost REAL DEFAULT 0,
      stay_cost REAL DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );
  `);

  // Stop Activities
  await db.exec(`
    CREATE TABLE IF NOT EXISTS stop_activities (
      id TEXT PRIMARY KEY,
      stop_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'Sightseeing',
      image_url TEXT,
      cost REAL DEFAULT 0,
      duration_hours REAL DEFAULT 2,
      scheduled_time TEXT,
      day_number INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE
    );
  `);

  // Global Destinations Catalog
  await db.exec(`
    CREATE TABLE IF NOT EXISTS destinations_master (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      continent TEXT NOT NULL,
      cost_index TEXT DEFAULT '$$',
      popularity_score REAL DEFAULT 4.8,
      hero_image TEXT NOT NULL,
      description TEXT NOT NULL,
      best_season TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      tags TEXT DEFAULT '[]'
    );
  `);

  // Destination Activities Catalog
  await db.exec(`
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
  `);

  // Saved Wishlist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS saved_wishlist (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      destination_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (destination_id) REFERENCES destinations_master(id) ON DELETE CASCADE,
      UNIQUE(user_id, destination_id)
    );
  `);

  console.log('✅ Relational Database Initialized with Country & Phone support');
}
