-- ==========================================================
-- GlobeTrotter Supabase PostgreSQL Schema & Security Policies
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio TEXT DEFAULT 'Passionate traveler exploring the world with GlobeTrotter.',
  country TEXT DEFAULT 'India',
  phone_code TEXT DEFAULT '+91',
  phone_number TEXT,
  home_currency TEXT DEFAULT 'INR',
  role TEXT DEFAULT 'traveler',
  preferences JSONB DEFAULT '["Foodie", "Photography", "Cultural Heritage"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  is_public BOOLEAN DEFAULT false,
  share_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Trip Stops (Multi-city itinerary stops)
CREATE TABLE IF NOT EXISTS public.trip_stops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  city_name TEXT NOT NULL,
  country TEXT NOT NULL,
  continent TEXT DEFAULT 'World',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  order_index INTEGER DEFAULT 0,
  arrival_date DATE,
  departure_date DATE,
  transport_mode TEXT DEFAULT 'flight',
  transport_cost NUMERIC DEFAULT 0,
  stay_cost NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Stop Activities
CREATE TABLE IF NOT EXISTS public.stop_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stop_id UUID REFERENCES public.trip_stops(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Sightseeing',
  image_url TEXT,
  cost NUMERIC DEFAULT 0,
  duration_hours NUMERIC DEFAULT 2,
  scheduled_time TIME,
  day_number INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Destinations Master Catalog
CREATE TABLE IF NOT EXISTS public.destinations_master (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  continent TEXT NOT NULL,
  cost_index TEXT DEFAULT '$$',
  popularity_score NUMERIC DEFAULT 4.8,
  hero_image TEXT NOT NULL,
  description TEXT NOT NULL,
  best_season TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb
);

-- 6. Destination Master Activities Catalog
CREATE TABLE IF NOT EXISTS public.destination_activities_master (
  id TEXT PRIMARY KEY,
  destination_id TEXT REFERENCES public.destinations_master(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  cost NUMERIC DEFAULT 0,
  duration_hours NUMERIC DEFAULT 2,
  image_url TEXT NOT NULL,
  rating NUMERIC DEFAULT 4.8
);

-- 7. Saved Wishlist
CREATE TABLE IF NOT EXISTS public.saved_wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destination_id TEXT REFERENCES public.destinations_master(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, destination_id)
);

-- ==========================================================
-- Row-Level Security (RLS) Policies
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stop_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_activities_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_wishlist ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trips: View if public OR owner
CREATE POLICY "Trips viewable by owner or if public" ON public.trips FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create trips" ON public.trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON public.trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON public.trips FOR DELETE USING (auth.uid() = user_id);

-- Stops: Viewable if parent trip is accessible
CREATE POLICY "Stops viewable by trip access" ON public.trip_stops FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_stops.trip_id AND (trips.is_public = true OR trips.user_id = auth.uid()))
);
CREATE POLICY "Users can manage stops of own trips" ON public.trip_stops FOR ALL USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_stops.trip_id AND trips.user_id = auth.uid())
);

-- Master Catalog: Viewable by all
CREATE POLICY "Master destinations viewable by all" ON public.destinations_master FOR SELECT USING (true);
CREATE POLICY "Master activities viewable by all" ON public.destination_activities_master FOR SELECT USING (true);

-- Wishlist: Owner only
CREATE POLICY "Wishlist viewable by owner" ON public.saved_wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Wishlist manageable by owner" ON public.saved_wishlist FOR ALL USING (auth.uid() = user_id);

-- Trigger: Sync profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, country, phone_code, phone_number, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Traveler User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'),
    COALESCE(NEW.raw_user_meta_data->>'country', 'India'),
    COALESCE(NEW.raw_user_meta_data->>'phone_code', '+91'),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'traveler')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
