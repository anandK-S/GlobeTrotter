import { getDb } from '../config/db.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
}

/**
 * Get all trips for logged in user with enriched aggregated metrics
 */
export async function getMyTrips(req, res) {
  try {
    const db = await getDb();
    const userId = req.user.id;

    const trips = await db.all(`
      SELECT 
        t.*,
        COUNT(DISTINCT s.id) as stop_count,
        COALESCE(SUM(s.transport_cost + s.stay_cost), 0) as stops_total_cost,
        (
          SELECT COALESCE(SUM(a.cost), 0)
          FROM stop_activities a
          JOIN trip_stops ts ON ts.id = a.stop_id
          WHERE ts.trip_id = t.id
        ) as activities_total_cost
      FROM trips t
      LEFT JOIN trip_stops s ON s.trip_id = t.id
      WHERE t.user_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, [userId]);

    const todayStr = new Date().toISOString().split('T')[0];

    const formattedTrips = trips.map(trip => {
      const calculatedCost = (trip.stops_total_cost || 0) + (trip.activities_total_cost || 0);
      let status = 'upcoming';
      if (trip.end_date < todayStr) {
        status = 'completed';
      } else if (trip.start_date <= todayStr && trip.end_date >= todayStr) {
        status = 'ongoing';
      }

      return {
        ...trip,
        is_public: Boolean(trip.is_public),
        calculated_cost: calculatedCost,
        status
      };
    });

    return res.json({
      success: true,
      trips: formattedTrips
    });
  } catch (error) {
    console.error('Get My Trips Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving trips.' });
  }
}

/**
 * Get full details of a specific trip including all stops and activities
 */
export async function getTripById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const trip = await db.get('SELECT * FROM trips WHERE id = ?', [id]);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    // Check ownership if not public and user not owner
    if (!trip.is_public && (!req.user || req.user.id !== trip.user_id)) {
      return res.status(403).json({ success: false, message: 'Access denied to this private itinerary.' });
    }

    // Get stops ordered
    const stops = await db.all(`
      SELECT * FROM trip_stops 
      WHERE trip_id = ? 
      ORDER BY order_index ASC, arrival_date ASC
    `, [id]);

    // For each stop, get activities
    for (let stop of stops) {
      const activities = await db.all(`
        SELECT * FROM stop_activities 
        WHERE stop_id = ? 
        ORDER BY day_number ASC, scheduled_time ASC, order_index ASC
      `, [stop.id]);
      stop.activities = activities;
    }

    // Calculate total costs
    let totalTransportCost = 0;
    let totalStayCost = 0;
    let totalActivitiesCost = 0;
    let categoryBreakdown = {
      Transport: 0,
      Stay: 0,
      Activities: 0,
      Food: 0,
      Sightseeing: 0,
      Adventure: 0,
      Culture: 0,
      Nightlife: 0,
      Relax: 0,
      Misc: 0
    };

    stops.forEach(s => {
      totalTransportCost += (s.transport_cost || 0);
      totalStayCost += (s.stay_cost || 0);
      categoryBreakdown.Transport += (s.transport_cost || 0);
      categoryBreakdown.Stay += (s.stay_cost || 0);

      s.activities.forEach(a => {
        totalActivitiesCost += (a.cost || 0);
        const cat = a.category || 'Sightseeing';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (a.cost || 0);
      });
    });

    const totalEstimatedCost = totalTransportCost + totalStayCost + totalActivitiesCost;

    return res.json({
      success: true,
      trip: {
        ...trip,
        is_public: Boolean(trip.is_public),
        stops,
        metrics: {
          total_budget: trip.total_budget || 0,
          total_estimated_cost: totalEstimatedCost,
          total_transport_cost: totalTransportCost,
          total_stay_cost: totalStayCost,
          total_activities_cost: totalActivitiesCost,
          remaining_budget: (trip.total_budget || 0) - totalEstimatedCost,
          is_overbudget: totalEstimatedCost > (trip.total_budget || 0) && trip.total_budget > 0,
          categoryBreakdown
        }
      }
    });
  } catch (error) {
    console.error('Get Trip By ID Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving trip details.' });
  }
}

/**
 * Create a new trip
 */
export async function createTrip(req, res) {
  try {
    const { title, description, cover_image, start_date, end_date, total_budget, currency, is_public } = req.body;

    // Strict Validation
    if (!title || title.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Trip title must be at least 2 characters long.' });
    }
    if (!start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required.' });
    }
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
    }

    const db = await getDb();
    const tripId = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const shareSlug = slugify(title);
    const defaultCover = cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

    await db.run(`
      INSERT INTO trips (id, user_id, title, description, cover_image, start_date, end_date, total_budget, currency, is_public, share_slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tripId,
      req.user.id,
      title.trim(),
      description || '',
      defaultCover,
      start_date,
      end_date,
      parseFloat(total_budget) || 0,
      currency || 'USD',
      is_public ? 1 : 0,
      shareSlug
    ]);

    return res.status(201).json({
      success: true,
      message: 'Trip created successfully!',
      tripId,
      shareSlug
    });
  } catch (error) {
    console.error('Create Trip Error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating trip.' });
  }
}

/**
 * Update trip metadata
 */
export async function updateTrip(req, res) {
  try {
    const { id } = req.params;
    const { title, description, cover_image, start_date, end_date, total_budget, currency, is_public } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT user_id FROM trips WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }
    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this trip.' });
    }

    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
    }

    await db.run(`
      UPDATE trips 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          cover_image = COALESCE(?, cover_image),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          total_budget = COALESCE(?, total_budget),
          currency = COALESCE(?, currency),
          is_public = COALESCE(?, is_public),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title,
      description,
      cover_image,
      start_date,
      end_date,
      total_budget !== undefined ? parseFloat(total_budget) : null,
      currency,
      is_public !== undefined ? (is_public ? 1 : 0) : null,
      id
    ]);

    return res.json({ success: true, message: 'Trip updated successfully.' });
  } catch (error) {
    console.error('Update Trip Error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating trip.' });
  }
}

/**
 * Delete a trip
 */
export async function deleteTrip(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const existing = await db.get('SELECT user_id FROM trips WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }
    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this trip.' });
    }

    await db.run('DELETE FROM trips WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Trip and all its stops deleted successfully.' });
  } catch (error) {
    console.error('Delete Trip Error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting trip.' });
  }
}

/**
 * Duplicate a Trip
 */
export async function duplicateTrip(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const trip = await db.get('SELECT * FROM trips WHERE id = ?', [id]);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const newTripId = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newTitle = `Copy of ${trip.title}`;
    const newSlug = slugify(newTitle);

    await db.run(`
      INSERT INTO trips (id, user_id, title, description, cover_image, start_date, end_date, total_budget, currency, is_public, share_slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `, [
      newTripId,
      req.user.id,
      newTitle,
      trip.description,
      trip.cover_image,
      trip.start_date,
      trip.end_date,
      trip.total_budget,
      trip.currency,
      newSlug
    ]);

    // Copy stops & activities
    const stops = await db.all('SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY order_index ASC', [id]);
    for (const stop of stops) {
      const newStopId = `stop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await db.run(`
        INSERT INTO trip_stops (id, trip_id, city_name, country, continent, lat, lng, order_index, arrival_date, departure_date, transport_mode, transport_cost, stay_cost, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        newStopId,
        newTripId,
        stop.city_name,
        stop.country,
        stop.continent,
        stop.lat,
        stop.lng,
        stop.order_index,
        stop.arrival_date,
        stop.departure_date,
        stop.transport_mode,
        stop.transport_cost,
        stop.stay_cost,
        stop.notes
      ]);

      const activities = await db.all('SELECT * FROM stop_activities WHERE stop_id = ?', [stop.id]);
      for (const act of activities) {
        await db.run(`
          INSERT INTO stop_activities (id, stop_id, title, description, category, cost, duration_hours, scheduled_time, day_number, order_index, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          newStopId,
          act.title,
          act.description,
          act.category,
          act.cost,
          act.duration_hours,
          act.scheduled_time,
          act.day_number,
          act.order_index,
          act.image_url
        ]);
      }
    }

    return res.json({
      success: true,
      message: 'Trip duplicated successfully!',
      tripId: newTripId
    });
  } catch (error) {
    console.error('Duplicate Trip Error:', error);
    return res.status(500).json({ success: false, message: 'Server error duplicating trip.' });
  }
}

/**
 * Get Public / Shared Trip by Slug or ID
 */
export async function getPublicTrip(req, res) {
  try {
    const { slug } = req.params;
    const db = await getDb();

    const trip = await db.get(`
      SELECT t.*, u.name as creator_name, u.avatar_url as creator_avatar
      FROM trips t
      JOIN users u ON u.id = t.user_id
      WHERE t.share_slug = ? OR t.id = ?
    `, [slug, slug]);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Shared itinerary not found.' });
    }

    const stops = await db.all(`
      SELECT * FROM trip_stops 
      WHERE trip_id = ? 
      ORDER BY order_index ASC, arrival_date ASC
    `, [trip.id]);

    for (let stop of stops) {
      const activities = await db.all(`
        SELECT * FROM stop_activities 
        WHERE stop_id = ? 
        ORDER BY day_number ASC, scheduled_time ASC, order_index ASC
      `, [stop.id]);
      stop.activities = activities;
    }

    return res.json({
      success: true,
      trip: {
        ...trip,
        stops
      }
    });
  } catch (error) {
    console.error('Get Public Trip Error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading shared itinerary.' });
  }
}

/**
 * Add a stop to a trip
 */
export async function addStop(req, res) {
  try {
    const { id } = req.params; // trip_id
    const { city_name, country, continent, lat, lng, arrival_date, departure_date, transport_mode, transport_cost, stay_cost, notes } = req.body;

    if (!city_name || !country) {
      return res.status(400).json({ success: false, message: 'City and country are required.' });
    }

    const db = await getDb();

    // Verify trip ownership
    const trip = await db.get('SELECT user_id FROM trips WHERE id = ?', [id]);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }
    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to add stops to this trip.' });
    }

    // Get max order index
    const maxOrder = await db.get('SELECT COALESCE(MAX(order_index), -1) as max_idx FROM trip_stops WHERE trip_id = ?', [id]);
    const nextOrder = maxOrder.max_idx + 1;

    const stopId = `stop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await db.run(`
      INSERT INTO trip_stops (id, trip_id, city_name, country, continent, lat, lng, order_index, arrival_date, departure_date, transport_mode, transport_cost, stay_cost, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      stopId,
      id,
      city_name.trim(),
      country.trim(),
      continent || 'World',
      lat ? parseFloat(lat) : 0,
      lng ? parseFloat(lng) : 0,
      nextOrder,
      arrival_date || null,
      departure_date || null,
      transport_mode || 'flight',
      parseFloat(transport_cost) || 0,
      parseFloat(stay_cost) || 0,
      notes || ''
    ]);

    return res.status(201).json({
      success: true,
      message: 'Stop added successfully.',
      stopId
    });
  } catch (error) {
    console.error('Add Stop Error:', error);
    return res.status(500).json({ success: false, message: 'Server error adding stop.' });
  }
}

/**
 * Update stop details
 */
export async function updateStop(req, res) {
  try {
    const { stopId } = req.params;
    const { arrival_date, departure_date, transport_mode, transport_cost, stay_cost, notes } = req.body;

    const db = await getDb();
    await db.run(`
      UPDATE trip_stops
      SET arrival_date = COALESCE(?, arrival_date),
          departure_date = COALESCE(?, departure_date),
          transport_mode = COALESCE(?, transport_mode),
          transport_cost = COALESCE(?, transport_cost),
          stay_cost = COALESCE(?, stay_cost),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `, [arrival_date, departure_date, transport_mode, transport_cost, stay_cost, notes, stopId]);

    return res.json({ success: true, message: 'Stop updated successfully.' });
  } catch (error) {
    console.error('Update Stop Error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating stop.' });
  }
}

/**
 * Delete a Stop
 */
export async function deleteStop(req, res) {
  try {
    const { stopId } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM trip_stops WHERE id = ?', [stopId]);
    return res.json({ success: true, message: 'Stop deleted successfully.' });
  } catch (error) {
    console.error('Delete Stop Error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting stop.' });
  }
}

/**
 * Reorder Stops
 */
export async function reorderStops(req, res) {
  try {
    const { stopIds } = req.body; // Array of stop IDs in order
    if (!Array.isArray(stopIds)) {
      return res.status(400).json({ success: false, message: 'stopIds array is required.' });
    }

    const db = await getDb();
    for (let i = 0; i < stopIds.length; i++) {
      await db.run('UPDATE trip_stops SET order_index = ? WHERE id = ?', [i, stopIds[i]]);
    }

    return res.json({ success: true, message: 'Stops reordered successfully.' });
  } catch (error) {
    console.error('Reorder Stops Error:', error);
    return res.status(500).json({ success: false, message: 'Server error reordering stops.' });
  }
}

/**
 * Add Activity to a Stop
 */
export async function addActivity(req, res) {
  try {
    const { stopId } = req.params;
    const { title, description, category, cost, duration_hours, scheduled_time, day_number, image_url } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Activity title is required.' });
    }

    const db = await getDb();
    const actId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await db.run(`
      INSERT INTO stop_activities (id, stop_id, title, description, category, cost, duration_hours, scheduled_time, day_number, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      actId,
      stopId,
      title.trim(),
      description || '',
      category || 'Sightseeing',
      parseFloat(cost) || 0,
      parseFloat(duration_hours) || 2,
      scheduled_time || '10:00',
      parseInt(day_number) || 1,
      image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
    ]);

    return res.status(201).json({
      success: true,
      message: 'Activity added successfully!',
      actId
    });
  } catch (error) {
    console.error('Add Activity Error:', error);
    return res.status(500).json({ success: false, message: 'Server error adding activity.' });
  }
}

/**
 * Delete Activity
 */
export async function deleteActivity(req, res) {
  try {
    const { actId } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM stop_activities WHERE id = ?', [actId]);
    return res.json({ success: true, message: 'Activity removed.' });
  } catch (error) {
    console.error('Delete Activity Error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting activity.' });
  }
}

/**
 * Get Community Public Trips Feed
 */
export async function getCommunityTrips(req, res) {
  try {
    const db = await getDb();
    const trips = await db.all(`
      SELECT 
        t.*,
        u.name as creator_name,
        u.avatar_url as creator_avatar,
        u.country as creator_country,
        COUNT(DISTINCT s.id) as stop_count,
        COALESCE(SUM(s.transport_cost + s.stay_cost), 0) as stops_total_cost,
        (
          SELECT COALESCE(SUM(a.cost), 0)
          FROM stop_activities a
          JOIN trip_stops ts ON ts.id = a.stop_id
          WHERE ts.trip_id = t.id
        ) as activities_total_cost
      FROM trips t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN trip_stops s ON s.trip_id = t.id
      WHERE t.is_public = 1
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT 50
    `);

    const todayStr = new Date().toISOString().split('T')[0];

    const formattedTrips = trips.map(trip => {
      const calculatedCost = (trip.stops_total_cost || 0) + (trip.activities_total_cost || 0);
      let status = 'upcoming';
      if (trip.end_date < todayStr) status = 'completed';
      else if (trip.start_date <= todayStr && trip.end_date >= todayStr) status = 'ongoing';

      return {
        ...trip,
        is_public: true,
        status,
        calculated_total_cost: calculatedCost,
        stop_count: trip.stop_count || 0
      };
    });

    return res.json({ success: true, trips: formattedTrips });
  } catch (error) {
    console.error('Error fetching community trips:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving community trips' });
  }
}
