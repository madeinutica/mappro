-- Setup subscription plans for Mapro
-- Run this in your Supabase SQL Editor

-- First, check if subscription_plans table exists
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  features JSONB,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert or update subscription plans
INSERT INTO subscription_plans (id, name, description, price_monthly, features, stripe_price_id_monthly)
VALUES
  ('free', 'Free', 'Basic features for getting started', 0,
   '{"max_projects": 5, "basic_customization": true, "standard_support": true}', NULL),
  ('pro', 'Pro', 'Full access to all features', 29.99,
   '{"max_projects": -1, "advanced_customization": true, "priority_support": true, "export_data": true, "custom_branding": true}',
   'price_1SNCw4J17KVc8UXY74qnJ02sj0NToQH5NKIAXgDpe9oiWV3Hl4Ce32K3KlIPdpbUxytkiwmF0dOHGdEcy6gsUeDR00qgHUlK3q')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  features = EXCLUDED.features,
  stripe_price_id_monthly = EXCLUDED.stripe_price_id_monthly;

-- Check if subscription_events table exists
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  stripe_event_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add subscription columns to clients table if they don't exist
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Verify the setup
SELECT 'Subscription plans:' as info;
SELECT * FROM subscription_plans;

SELECT 'Client subscription columns exist:' as info;
SELECT column_name FROM information_schema.columns
WHERE table_name = 'clients' AND column_name LIKE 'subscription_%';