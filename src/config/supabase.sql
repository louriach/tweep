-- Supabase Schema for LinkShare App
-- Run these SQL commands in your Supabase SQL editor

-- MIGRATION: Add 'social' and 'music' types to existing links table (run this if you already have the table)
-- ALTER TABLE links DROP CONSTRAINT IF EXISTS links_type_check;
-- ALTER TABLE links ADD CONSTRAINT links_type_check CHECK (type IN ('article', 'video', 'podcast', 'social', 'music', 'other'));

-- Drop existing tables and triggers to start fresh (with CASCADE to handle dependencies)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS links CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table first
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create links table
CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('article', 'video', 'podcast', 'social', 'music', 'other')),
  shared_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friendships table
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create recommendations table
CREATE TABLE recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  message TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id, link_id)
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for links table
CREATE POLICY "links_select_policy" ON links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "links_insert_policy" ON links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "links_update_policy" ON links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "links_delete_policy" ON links
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for friendships table
CREATE POLICY "friendships_select_policy" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "friendships_insert_policy" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "friendships_delete_policy" ON friendships
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for recommendations table
CREATE POLICY "recommendations_select_policy" ON recommendations
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "recommendations_insert_policy" ON recommendations
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "recommendations_update_policy" ON recommendations
  FOR UPDATE USING (auth.uid() = to_user_id);

-- Create indexes for better performance
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_created_at ON links(created_at DESC);
CREATE INDEX idx_links_type ON links(type);
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_recommendations_to_user ON recommendations(to_user_id);
CREATE INDEX idx_recommendations_from_user ON recommendations(from_user_id);

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Create trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 