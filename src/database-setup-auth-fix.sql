-- DevTrack Africa Database Setup - Auth Integration Fix
-- Copy and paste this entire script into your Supabase SQL Editor

-- 1. Update Users table to properly handle Auth integration
-- First, check if we need to alter the existing table
DO $
BEGIN
  -- Remove default UUID generation if it exists and make id match auth.uid()
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    -- Remove the default value so we can use auth.uid()
    ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
  END IF;
END $;

-- Create users table with proper auth integration
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, -- Will be set to auth.uid(), no default generation
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  title TEXT,
  country TEXT,
  phone TEXT,
  tech_stack TEXT[],
  bio TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create function to handle new user signup and profile creation
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $
BEGIN
  -- Insert a new user profile when a user signs up
  INSERT INTO public.users (id, email, full_name, country, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Enable Row Level Security on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Update user policies to work with auth integration
DROP POLICY IF EXISTS "Public users can view all users" ON users;
CREATE POLICY "Public users can view all users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Create function to check if email already exists
CREATE OR REPLACE FUNCTION check_email_exists(email_to_check text)
RETURNS boolean AS $
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = email_to_check
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON auth.users TO postgres, service_role;
GRANT SELECT ON auth.users TO authenticated;

-- Auth integration setup complete!
-- Users will now be automatically created in the users table when they sign up
-- Their auth.uid() will be used as the primary key, ensuring proper integration