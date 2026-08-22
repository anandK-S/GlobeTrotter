import { getDb } from '../config/db.js';

/**
 * Get all destinations with search & filters
 */
export async function getDestinations(req, res) {
  try {
    const { search, continent, cost_index, limit = 50 } = req.query;
    const db = await getDb();

    let query = 'SELECT * FROM destinations_master WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(country) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (continent && continent !== 'All') {
      query += ' AND continent = ?';
      params.push(continent);
    }

    if (cost_index && cost_index !== 'All') {
      query += ' AND cost_index = ?';
      params.push(cost_index);
    }

    query += ' ORDER BY popularity_score DESC LIMIT ?';
    params.push(parseInt(limit));

    const destinations = await db.all(query, params);

    // Parse tags JSON
    const formatted = destinations.map(d => {
      let tags = [];
      try {
        tags = JSON.parse(d.tags || '[]');
      } catch {
        tags = [];
      }
      return { ...d, tags };
    });

    return res.json({
      success: true,
      destinations: formatted
    });
  } catch (error) {
    console.error('Get Destinations Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving destinations.' });
  }
}

/**
 * Get destination by ID with all master activities
 */
export async function getDestinationById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const destination = await db.get('SELECT * FROM destinations_master WHERE id = ?', [id]);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }

    const activities = await db.all('SELECT * FROM destination_activities_master WHERE destination_id = ? ORDER BY rating DESC', [id]);

    let tags = [];
    try {
      tags = JSON.parse(destination.tags || '[]');
    } catch {
      tags = [];
    }

    return res.json({
      success: true,
      destination: {
        ...destination,
        tags,
        activities
      }
    });
  } catch (error) {
    console.error('Get Destination By ID Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving destination.' });
  }
}

/**
 * Browse master activities catalog with filters
 */
export async function getAllActivities(req, res) {
  try {
    const { search, category, maxCost, destinationId } = req.query;
    const db = await getDb();

    let query = `
      SELECT a.*, d.name as destination_name, d.country as destination_country
      FROM destination_activities_master a
      JOIN destinations_master d ON d.id = a.destination_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (LOWER(a.title) LIKE LOWER(?) OR LOWER(a.description) LIKE LOWER(?))';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    if (category && category !== 'All') {
      query += ' AND a.category = ?';
      params.push(category);
    }

    if (maxCost) {
      query += ' AND a.cost <= ?';
      params.push(parseFloat(maxCost));
    }

    if (destinationId) {
      query += ' AND a.destination_id = ?';
      params.push(destinationId);
    }

    query += ' ORDER BY a.rating DESC LIMIT 100';

    const activities = await db.all(query, params);
    return res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get All Activities Error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading activities.' });
  }
}

/**
 * Toggle Wishlist for Destination
 */
export async function toggleWishlist(req, res) {
  try {
    const { destinationId } = req.body;
    const userId = req.user.id;
    const db = await getDb();

    const existing = await db.get('SELECT id FROM saved_wishlist WHERE user_id = ? AND destination_id = ?', [userId, destinationId]);

    if (existing) {
      await db.run('DELETE FROM saved_wishlist WHERE id = ?', [existing.id]);
      return res.json({ success: true, saved: false, message: 'Removed from saved wishlist.' });
    } else {
      await db.run('INSERT INTO saved_wishlist (id, user_id, destination_id) VALUES (?, ?, ?)', [
        `wish-${Date.now()}`,
        userId,
        destinationId
      ]);
      return res.json({ success: true, saved: true, message: 'Added to your saved wishlist!' });
    }
  } catch (error) {
    console.error('Toggle Wishlist Error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating wishlist.' });
  }
}

/**
 * Get Saved Wishlist for Logged-In User
 */
export async function getWishlist(req, res) {
  try {
    const userId = req.user.id;
    const db = await getDb();

    const items = await db.all(`
      SELECT d.*, w.created_at as saved_at
      FROM saved_wishlist w
      JOIN destinations_master d ON d.id = w.destination_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId]);

    const formatted = items.map(d => {
      let tags = [];
      try {
        tags = JSON.parse(d.tags || '[]');
      } catch {
        tags = [];
      }
      return { ...d, tags };
    });

    return res.json({
      success: true,
      wishlist: formatted
    });
  } catch (error) {
    console.error('Get Wishlist Error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading wishlist.' });
  }
}
