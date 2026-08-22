import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb } from './config/db.js';
import { runSeed } from './seed/seed.js';
import { authenticateToken, optionalAuth, requireAdmin } from './middleware/authMiddleware.js';
import * as authController from './controllers/authController.js';
import * as tripController from './controllers/tripController.js';
import * as destinationsController from './controllers/destinationsController.js';
import * as adminController from './controllers/adminController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GlobeTrotter Relational Backend',
    brevoIntegrated: true,
    timestamp: new Date().toISOString()
  });
});

// ================= AUTH ROUTES =================
app.post('/api/auth/register', authController.register);
app.post('/api/auth/verify-email-otp', authController.verifyEmailOtp);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/forgot-password', authController.forgotPassword);
app.post('/api/auth/reset-password', authController.resetPassword);
app.get('/api/auth/profile', authenticateToken, authController.getProfile);
app.put('/api/auth/profile', authenticateToken, authController.updateProfile);
app.delete('/api/auth/account', authenticateToken, authController.deleteAccount);

// ================= TRIPS & ITINERARY ROUTES =================
app.get('/api/trips', authenticateToken, tripController.getMyTrips);
app.post('/api/trips', authenticateToken, tripController.createTrip);
app.get('/api/trips/share/:slug', optionalAuth, tripController.getPublicTrip);
app.get('/api/trips/:id', optionalAuth, tripController.getTripById);
app.put('/api/trips/:id', authenticateToken, tripController.updateTrip);
app.delete('/api/trips/:id', authenticateToken, tripController.deleteTrip);
app.post('/api/trips/:id/duplicate', authenticateToken, tripController.duplicateTrip);

// Stops
app.post('/api/trips/:id/stops', authenticateToken, tripController.addStop);
app.put('/api/stops/:stopId', authenticateToken, tripController.updateStop);
app.delete('/api/stops/:stopId', authenticateToken, tripController.deleteStop);
app.post('/api/stops/reorder', authenticateToken, tripController.reorderStops);

// Activities
app.post('/api/stops/:stopId/activities', authenticateToken, tripController.addActivity);
app.delete('/api/activities/:actId', authenticateToken, tripController.deleteActivity);

// ================= DESTINATIONS & ACTIVITIES CATALOG =================
app.get('/api/destinations', destinationsController.getDestinations);
app.get('/api/destinations/:id', destinationsController.getDestinationById);
app.get('/api/activities/catalog', destinationsController.getAllActivities);

// Wishlist
app.get('/api/wishlist', authenticateToken, destinationsController.getWishlist);
app.post('/api/wishlist/toggle', authenticateToken, destinationsController.toggleWishlist);

// ================= ADMIN & ANALYTICS ROUTES =================
app.get('/api/admin/analytics', authenticateToken, requireAdmin, adminController.getPlatformAnalytics);
app.get('/api/admin/users', authenticateToken, requireAdmin, adminController.getAllUsers);
app.put('/api/admin/users/:id/status', authenticateToken, requireAdmin, adminController.updateUserStatus);
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, adminController.deleteUser);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Initialize DB and start server
async function startServer() {
  try {
    const db = await getDb();
    
    // Check if destinations exist, if not run auto-seed
    const destCount = await db.get('SELECT COUNT(*) as count FROM destinations_master');
    if (!destCount || destCount.count === 0) {
      console.log('⚡ Initializing database with seed data...');
      await runSeed();
    }

    app.listen(PORT, () => {
      console.log(`\nGlobeTrotter Backend API running at: http://localhost:${PORT}`);
      console.log(`Brevo Transactional Email Service: Active`);
      console.log(`Demo User: traveler.user@example.com / Traveler@123`);
      console.log(`Admin User: admin@globetrotter.com / Admin@123\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
