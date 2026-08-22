export type UserRole = 'traveler' | 'admin';

export type Currency = 'USD' | 'EUR' | 'INR' | 'GBP' | 'JPY' | 'AUD' | 'CAD';

export type TransportMode = 'flight' | 'train' | 'bus' | 'car' | 'boat';

export type ActivityCategory = 
  | 'Sightseeing'
  | 'Food'
  | 'Adventure'
  | 'Culture'
  | 'Nightlife'
  | 'Relax'
  | 'Transport';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  country?: string;
  phone_code?: string;
  phone_number?: string;
  role: UserRole;
  home_currency: Currency;
  preferences: string[];
  is_verified: number;
  trip_count?: number;
  total_budget?: number;
  wishlist_count?: number;
}

export interface StopActivity {
  id: string;
  stop_id: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  image_url?: string;
  cost: number;
  duration_hours: number;
  scheduled_time?: string;
  day_number: number;
  order_index: number;
}

export interface TripStop {
  id: string;
  trip_id: string;
  city_name: string;
  country: string;
  continent?: string;
  lat: number;
  lng: number;
  order_index: number;
  arrival_date?: string;
  departure_date?: string;
  transport_mode: TransportMode;
  transport_cost: number;
  stay_cost: number;
  notes?: string;
  activities?: StopActivity[];
}

export interface TripMetrics {
  total_budget: number;
  total_estimated_cost: number;
  total_transport_cost: number;
  total_stay_cost: number;
  total_activities_cost: number;
  remaining_budget: number;
  is_overbudget: boolean;
  categoryBreakdown: Record<string, number>;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_image?: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  currency: Currency;
  is_public: boolean;
  share_slug: string;
  created_at: string;
  stop_count?: number;
  calculated_cost?: number;
  status?: 'upcoming' | 'ongoing' | 'completed';
  stops?: TripStop[];
  metrics?: TripMetrics;
  creator_name?: string;
  creator_avatar?: string;
}

export interface MasterActivity {
  id: string;
  destination_id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  cost: number;
  duration_hours: number;
  image_url: string;
  rating: number;
  destination_name?: string;
  destination_country?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  cost_index: '$' | '$$' | '$$$' | '$$$$';
  popularity_score: number;
  hero_image: string;
  description: string;
  best_season?: string;
  lat: number;
  lng: number;
  tags: string[];
  activities?: MasterActivity[];
  saved_at?: string;
}

export interface AdminAnalyticsData {
  kpis: {
    totalUsers: number;
    totalTrips: number;
    totalBudget: number;
    totalStops: number;
    totalActivities: number;
  };
  topDestinations: Array<{ city_name: string; country: string; visit_count: number }>;
  categoryStats: Array<{ category: string; count: number; total_spent: number }>;
  recentUsers: User[];
  recentTrips: Array<{
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    total_budget: number;
    created_at: string;
    creator_name: string;
  }>;
}
