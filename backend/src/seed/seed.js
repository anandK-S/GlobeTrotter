import bcrypt from 'bcryptjs';
import { getDb } from '../config/db.js';
import { seedDestinations } from './seedData.js';

export async function runSeed() {
  console.log('🌱 Starting GlobeTrotter Database Seeding...');
  const db = await getDb();

  // Clean existing data
  await db.run('DELETE FROM stop_activities');
  await db.run('DELETE FROM trip_stops');
  await db.run('DELETE FROM trips');
  await db.run('DELETE FROM destination_activities_master');
  await db.run('DELETE FROM destinations_master');
  await db.run('DELETE FROM saved_wishlist');
  await db.run('DELETE FROM email_verifications');
  await db.run('DELETE FROM users');

  // Create Users
  const salt = await bcrypt.genSalt(10);
  const passwordHashTraveler = await bcrypt.hash('Traveler@123', salt);
  const passwordHashAdmin = await bcrypt.hash('Admin@123', salt);

  const travelerId = 'user-traveler-101';
  const adminId = 'user-admin-001';

  await db.run(`
    INSERT INTO users (id, name, email, password, avatar_url, bio, country, phone_code, phone_number, role, home_currency, preferences, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    travelerId,
    'Traveler User',
    'traveler.user@example.com',
    passwordHashTraveler,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'Passionate wanderer exploring the world with GlobeTrotter.',
    'India',
    '+91',
    '9876543210',
    'traveler',
    'INR',
    JSON.stringify(['Foodie', 'Photography', 'Solo Travel', 'Cultural Heritage', 'Adventure']),
    1
  ]);

  await db.run(`
    INSERT INTO users (id, name, email, password, avatar_url, bio, country, phone_code, phone_number, role, home_currency, preferences, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    adminId,
    'GlobeTrotter Admin',
    'admin@globetrotter.com',
    passwordHashAdmin,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'System administrator for GlobeTrotter platform operations and analytics.',
    'India',
    '+91',
    '9988776655',
    'admin',
    'USD',
    JSON.stringify(['Analytics', 'Operations']),
    1
  ]);

  console.log('✅ Users Seeded: Traveler (traveler.user@example.com) & Admin (admin@globetrotter.com)');

  // Seed Destinations & Activities
  for (const dest of seedDestinations) {
    await db.run(`
      INSERT INTO destinations_master (id, name, country, continent, cost_index, popularity_score, hero_image, description, best_season, lat, lng, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      dest.id,
      dest.name,
      dest.country,
      dest.continent,
      dest.cost_index,
      dest.popularity_score,
      dest.hero_image,
      dest.description,
      dest.best_season,
      dest.lat,
      dest.lng,
      dest.tags
    ]);

    if (dest.activities && dest.activities.length > 0) {
      for (let i = 0; i < dest.activities.length; i++) {
        const act = dest.activities[i];
        await db.run(`
          INSERT INTO destination_activities_master (id, destination_id, title, description, category, cost, duration_hours, image_url, rating)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          `act-m-${dest.id}-${i + 1}`,
          dest.id,
          act.title,
          act.description,
          act.category,
          act.cost,
          act.duration_hours,
          act.image_url,
          act.rating || 4.8
        ]);
      }
    }
  }
  console.log(`✅ Seeded ${seedDestinations.length} Global Destinations & Curated Master Activities`);

  // Seed Wishlist
  await db.run(`
    INSERT INTO saved_wishlist (id, user_id, destination_id)
    VALUES ('wish-1', ?, 'dest-santorini'), ('wish-2', ?, 'dest-swissalps'), ('wish-3', ?, 'dest-bali')
  `, [travelerId, travelerId, travelerId]);

  // Seed Trip 1: Grand European Journey (Paris -> Rome -> Barcelona)
  const trip1Id = 'trip-europe-2026';
  await db.run(`
    INSERT INTO trips (id, user_id, title, description, cover_image, start_date, end_date, total_budget, currency, is_public, share_slug)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    trip1Id,
    travelerId,
    'Grand European Adventure: Paris, Rome & Barcelona',
    'A 10-day scenic voyage through historic capitals, Gaudí architecture, romantic rivers, and Michelin-starred culinary gems.',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    '2026-09-10',
    '2026-09-20',
    3500,
    'USD',
    1,
    'grand-european-journey-2026'
  ]);

  // Stop 1: Paris
  const stop1Id = 'stop-paris-01';
  await db.run(`
    INSERT INTO trip_stops (id, trip_id, city_name, country, continent, lat, lng, order_index, arrival_date, departure_date, transport_mode, transport_cost, stay_cost, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    stop1Id,
    trip1Id,
    'Paris',
    'France',
    'Europe',
    48.8566,
    2.3522,
    0,
    '2026-09-10',
    '2026-09-13',
    'flight',
    450,
    420,
    'Boutique hotel in Le Marais near Saint-Paul metro.'
  ]);

  await db.run(`
    INSERT INTO stop_activities (id, stop_id, title, description, category, cost, duration_hours, scheduled_time, day_number, order_index, image_url)
    VALUES 
    ('act-p1', ?, 'Eiffel Tower Summit Sunset', 'Ascend to the summit for breathtaking golden hour views.', 'Sightseeing', 38, 2.5, '18:00', 1, 0, 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80'),
    ('act-p2', ?, 'Louvre Guided Tour & Mona Lisa', 'Priority access tour of legendary art treasures.', 'Culture', 55, 3, '10:00', 2, 0, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80'),
    ('act-p3', ?, 'Seine River Gourmet Dinner Cruise', '3-course classic French dinner while sailing by Notre-Dame.', 'Food', 95, 2.5, '20:00', 2, 1, 'https://images.unsplash.com/photo-1508050919630-b135583b29ab?auto=format&fit=crop&w=600&q=80')
  `, [stop1Id, stop1Id, stop1Id]);

  // Stop 2: Rome
  const stop2Id = 'stop-rome-02';
  await db.run(`
    INSERT INTO trip_stops (id, trip_id, city_name, country, continent, lat, lng, order_index, arrival_date, departure_date, transport_mode, transport_cost, stay_cost, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    stop2Id,
    trip1Id,
    'Rome',
    'Italy',
    'Europe',
    41.9028,
    12.4964,
    1,
    '2026-09-13',
    '2026-09-17',
    'flight',
    120,
    380,
    'Stay near Piazza Navona. Try Da Enzo in Trastevere for Cacio e Pepe!'
  ]);

  await db.run(`
    INSERT INTO stop_activities (id, stop_id, title, description, category, cost, duration_hours, scheduled_time, day_number, order_index, image_url)
    VALUES 
    ('act-r1', ?, 'Colosseum & Roman Forum VIP', 'Walk through the ancient gladiatorial arena.', 'Sightseeing', 48, 3, '09:30', 4, 0, 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=600&q=80'),
    ('act-r2', ?, 'Handmade Pasta Masterclass', 'Cook authentic fettuccine and tiramisu with local chef.', 'Food', 70, 3, '17:00', 5, 0, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80')
  `, [stop2Id, stop2Id]);

  // Stop 3: Barcelona
  const stop3Id = 'stop-bcn-03';
  await db.run(`
    INSERT INTO trip_stops (id, trip_id, city_name, country, continent, lat, lng, order_index, arrival_date, departure_date, transport_mode, transport_cost, stay_cost, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    stop3Id,
    trip1Id,
    'Barcelona',
    'Spain',
    'Europe',
    41.3879,
    2.1699,
    2,
    '2026-09-17',
    '2026-09-20',
    'flight',
    95,
    340,
    'Hotel near Passeig de Gràcia. Sunset drinks at Barceloneta.'
  ]);

  await db.run(`
    INSERT INTO stop_activities (id, stop_id, title, description, category, cost, duration_hours, scheduled_time, day_number, order_index, image_url)
    VALUES 
    ('act-b1', ?, 'Sagrada Família Tower Tour', 'Gaudí architectural masterpiece with interior light show.', 'Sightseeing', 40, 2, '11:00', 8, 0, 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=600&q=80'),
    ('act-b2', ?, 'Gothic Quarter Tapas Crawl', 'Taste patatas bravas, jamón ibérico, and sangria.', 'Food', 50, 3, '19:30', 9, 0, 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=600&q=80')
  `, [stop3Id, stop3Id]);

  console.log('✅ Demo Multi-City Trips Seeded Successfully');
  console.log('🎉 Database Seeding Complete!');
}

if (process.argv[1]?.endsWith('seed.js')) {
  runSeed().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}
