import { getDb } from '../config/db.js';

/**
 * Get Platform Analytics and KPI metrics
 */
export async function getPlatformAnalytics(req, res) {
  try {
    const db = await getDb();

    const userCount = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'traveler'");
    const tripCount = await db.get('SELECT COUNT(*) as count FROM trips');
    const budgetSum = await db.get('SELECT COALESCE(SUM(total_budget), 0) as total FROM trips');
    const stopCount = await db.get('SELECT COUNT(*) as count FROM trip_stops');
    const activityCount = await db.get('SELECT COUNT(*) as count FROM stop_activities');

    // Top destinations in trips
    const topDestinations = await db.all(`
      SELECT city_name, country, COUNT(*) as visit_count
      FROM trip_stops
      GROUP BY city_name, country
      ORDER BY visit_count DESC
      LIMIT 5
    `);

    // Top categories
    const categoryStats = await db.all(`
      SELECT category, COUNT(*) as count, COALESCE(SUM(cost), 0) as total_spent
      FROM stop_activities
      GROUP BY category
      ORDER BY count DESC
    `);

    // Recent user signups
    const recentUsers = await db.all(`
      SELECT id, name, email, avatar_url, role, home_currency, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 6
    `);

    // Recent created trips
    const recentTrips = await db.all(`
      SELECT t.id, t.title, t.start_date, t.end_date, t.total_budget, t.created_at, u.name as creator_name
      FROM trips t
      JOIN users u ON u.id = t.user_id
      ORDER BY t.created_at DESC
      LIMIT 5
    `);

    return res.json({
      success: true,
      analytics: {
        kpis: {
          totalUsers: userCount.count,
          totalTrips: tripCount.count,
          totalBudget: budgetSum.total,
          totalStops: stopCount.count,
          totalActivities: activityCount.count
        },
        topDestinations,
        categoryStats,
        recentUsers,
        recentTrips
      }
    });
  } catch (error) {
    console.error('Admin Analytics Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving analytics.' });
  }
}

/**
 * Get all users for admin management table
 */
export async function getAllUsers(req, res) {
  try {
    const db = await getDb();

    const users = await db.all(`
      SELECT 
        u.id, u.name, u.email, u.avatar_url, u.role, u.home_currency, u.is_verified, u.created_at,
        COUNT(DISTINCT t.id) as trips_created
      FROM users u
      LEFT JOIN trips t ON t.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    return res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading users.' });
  }
}

/**
 * Update user role or verification status
 */
export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { role, is_verified } = req.body;
    const db = await getDb();

    await db.run(`
      UPDATE users
      SET role = COALESCE(?, role),
          is_verified = COALESCE(?, is_verified),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [role, is_verified, id]);

    return res.json({ success: true, message: 'User status updated successfully.' });
  } catch (error) {
    console.error('Update User Status Error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating user.' });
  }
}

/**
 * Delete a user by admin
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete User Error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting user.' });
  }
}
