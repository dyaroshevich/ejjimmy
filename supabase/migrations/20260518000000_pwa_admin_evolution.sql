-- PWA Admin Evolution Migration
-- Upgrade Leads table and setup Web Push infrastructure

-- 1. Upgrade Leads Table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS unread BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Create Push Subscriptions Table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Leads: Public can INSERT, only Authenticated (Admins) can SELECT/UPDATE/DELETE
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Public can insert leads') THEN
        CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Admins can manage leads') THEN
        CREATE POLICY "Admins can manage leads" ON public.leads FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Solar Products: Public can SELECT, only Authenticated can ALL
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'solar_products' AND policyname = 'Public can view products') THEN
        CREATE POLICY "Public can view products" ON public.solar_products FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'solar_products' AND policyname = 'Admins can manage products') THEN
        CREATE POLICY "Admins can manage products" ON public.solar_products FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Knowledge: Public can SELECT (for RAG), only Authenticated can ALL
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'knowledge' AND policyname = 'Public can view knowledge') THEN
        CREATE POLICY "Public can view knowledge" ON public.knowledge FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'knowledge' AND policyname = 'Admins can manage knowledge') THEN
        CREATE POLICY "Admins can manage knowledge" ON public.knowledge FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Push Subscriptions: Only owner can manage their subscriptions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'Owners can manage their subscriptions') THEN
        CREATE POLICY "Owners can manage their subscriptions" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Realtime (using DO block to handle errors if already present)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'leads'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
    END IF;
END $$;
