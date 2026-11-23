-- Create solar_products table for storing solar energy packages and products
CREATE TABLE IF NOT EXISTS public.solar_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    type TEXT NOT NULL CHECK (type IN ('package', 'panel', 'inverter', 'battery', 'mounting', 'charger', 'system')),
    power_kw INTEGER,
    price_thb INTEGER,
    specifications JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for this table
alter publication supabase_realtime add table solar_products;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_solar_products_type ON solar_products(type);
CREATE INDEX IF NOT EXISTS idx_solar_products_brand ON solar_products(brand);
CREATE INDEX IF NOT EXISTS idx_solar_products_power_kw ON solar_products(power_kw);
CREATE INDEX IF NOT EXISTS idx_solar_products_price_thb ON solar_products(price_thb);

-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enable row level security (optional, can be configured later)
ALTER TABLE solar_products ENABLE ROW LEVEL SECURITY;

-- Create a trigger to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS update_solar_products_updated_at ON solar_products;
CREATE TRIGGER update_solar_products_updated_at
    BEFORE UPDATE ON solar_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();