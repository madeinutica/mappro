-- Add subscription fields to clients table
ALTER TABLE clients ADD COLUMN subscription_status TEXT DEFAULT 'free';
ALTER TABLE clients ADD COLUMN subscription_id TEXT;
ALTER TABLE clients ADD COLUMN subscription_plan TEXT DEFAULT 'free';
ALTER TABLE clients ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN stripe_customer_id TEXT;

-- Create subscription_plans table for plan definitions
CREATE TABLE subscription_plans (
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

-- Insert default plans
INSERT INTO subscription_plans (id, name, description, price_monthly, features, stripe_price_id_monthly) VALUES
('free', 'Free', 'Basic features for getting started', 0, '{"max_projects": 5, "basic_customization": true, "standard_support": true}', NULL),
('pro', 'Pro', 'Full access to all features', 29.99, '{"max_projects": -1, "advanced_customization": true, "priority_support": true, "export_data": true, "custom_branding": true}', 'price_pro_monthly_placeholder');

-- Create subscription_events table for webhook tracking
CREATE TABLE subscription_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  stripe_event_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);