-- Ejjimmy Solar: Initial schema with ejjimmy_ table prefix
-- Run on shared Supabase project (gfdbmxhtvhivoztgckit)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- LEADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ejjimmy_leads (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL DEFAULT 'ลูกค้าใหม่',
    phone TEXT,
    line_id TEXT,
    email TEXT,
    location TEXT,
    bill_amount NUMERIC DEFAULT 0,
    system_size NUMERIC,
    payback_years NUMERIC,
    equipment_tier TEXT,
    status TEXT DEFAULT 'New (Web)',
    chat_history JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    source TEXT DEFAULT 'web',
    site_id TEXT NOT NULL DEFAULT 'ejjimmy',
    unread BOOLEAN DEFAULT TRUE,
    referred_by TEXT
);

-- RLS policies for ejjimmy_leads
ALTER TABLE ejjimmy_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ejjimmy_leads_select_own" ON ejjimmy_leads;
CREATE POLICY "ejjimmy_leads_select_own" ON ejjimmy_leads
    FOR SELECT USING (site_id = current_setting('request.jwt.claims', true)::json->>'site_id');

DROP POLICY IF EXISTS "ejjimmy_leads_insert_anon" ON ejjimmy_leads;
CREATE POLICY "ejjimmy_leads_insert_anon" ON ejjimmy_leads
    FOR INSERT WITH CHECK (site_id = 'ejjimmy');

DROP POLICY IF EXISTS "ejjimmy_leads_update_admin" ON ejjimmy_leads;
CREATE POLICY "ejjimmy_leads_update_admin" ON ejjimmy_leads
    FOR UPDATE USING (
        current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin')
        AND site_id = current_setting('request.jwt.claims', true)::json->>'site_id'
    );

-- Indexes
CREATE INDEX IF NOT EXISTS ejjimmy_leads_site_id_idx ON ejjimmy_leads(site_id);
CREATE INDEX IF NOT EXISTS ejjimmy_leads_phone_idx ON ejjimmy_leads(phone);
CREATE INDEX IF NOT EXISTS ejjimmy_leads_line_id_idx ON ejjimmy_leads(line_id);
CREATE INDEX IF NOT EXISTS ejjimmy_leads_email_idx ON ejjimmy_leads(email);
CREATE INDEX IF NOT EXISTS ejjimmy_leads_created_at_idx ON ejjimmy_leads(created_at DESC);

-- ============================================================================
-- SOLAR PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ejjimmy_solar_products (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    model TEXT,
    brand TEXT,
    type TEXT DEFAULT 'system',
    category TEXT,
    power_kw NUMERIC,
    capacity_kwh NUMERIC,
    price_thb NUMERIC,
    original_price_thb NUMERIC,
    specifications JSONB DEFAULT '{}'::jsonb,
    images TEXT[] DEFAULT '{}',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    site_id TEXT NOT NULL DEFAULT 'ejjimmy'
);

-- RLS
ALTER TABLE ejjimmy_solar_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ejjimmy_products_select_published" ON ejjimmy_solar_products;
CREATE POLICY "ejjimmy_products_select_published" ON ejjimmy_solar_products
    FOR SELECT USING (is_active = TRUE AND site_id = 'ejjimmy');

DROP POLICY IF EXISTS "ejjimmy_products_admin_all" ON ejjimmy_solar_products;
CREATE POLICY "ejjimmy_products_admin_all" ON ejjimmy_solar_products
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin')
        AND site_id = current_setting('request.jwt.claims', true)::json->>'site_id'
    );

-- ============================================================================
-- KNOWLEDGE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ejjimmy_knowledge (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'th',
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    embedding VECTOR(1536),
    site_id TEXT NOT NULL DEFAULT 'ejjimmy'
);

ALTER TABLE ejjimmy_knowledge ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ejjimmy_knowledge_select_published" ON ejjimmy_knowledge;
CREATE POLICY "ejjimmy_knowledge_select_published" ON ejjimmy_knowledge
    FOR SELECT USING (is_published = TRUE AND site_id = 'ejjimmy');

DROP POLICY IF EXISTS "ejjimmy_knowledge_admin_all" ON ejjimmy_knowledge;
CREATE POLICY "ejjimmy_knowledge_admin_all" ON ejjimmy_knowledge
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin')
        AND site_id = current_setting('request.jwt.claims', true)::json->>'site_id'
    );

-- ============================================================================
-- BLOG POSTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ejjimmy_blog_posts (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'th',
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    featured_image TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    site_id TEXT NOT NULL DEFAULT 'ejjimmy'
);

ALTER TABLE ejjimmy_blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ejjimmy_blog_select_published" ON ejjimmy_blog_posts;
CREATE POLICY "ejjimmy_blog_select_published" ON ejjimmy_blog_posts
    FOR SELECT USING (is_published = TRUE AND site_id = 'ejjimmy');

DROP POLICY IF EXISTS "ejjimmy_blog_admin_all" ON ejjimmy_blog_posts;
CREATE POLICY "ejjimmy_blog_admin_all" ON ejjimmy_blog_posts
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin')
        AND site_id = current_setting('request.jwt.claims', true)::json->>'site_id'
    );

-- ============================================================================
-- CASES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ejjimmy_cases (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    system_size NUMERIC,
    equipment_tier TEXT,
    bill_before NUMERIC,
    bill_after NUMERIC,
    install_days INTEGER,
    images TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    site_id TEXT NOT NULL DEFAULT 'ejjimmy'
);

ALTER TABLE ejjimmy_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ejjimmy_cases_select_published" ON ejjimmy_cases;
CREATE POLICY "ejjimmy_cases_select_published" ON ejjimmy_cases
    FOR SELECT USING (is_published = TRUE AND site_id = 'ejjimmy');

DROP POLICY IF EXISTS "ejjimmy_cases_admin_all" ON ejjimmy_cases;
CREATE POLICY "ejjimmy_cases_admin_all" ON ejjimmy_cases
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin')
        AND site_id = current_setting('request.jwt.claims', true)::json->>'site_id'
    );

-- ============================================================================
-- PARTNER CONFIG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ejjimmy_partner_config (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    partner_code TEXT NOT NULL UNIQUE,
    partner_name TEXT NOT NULL,
    commission_rate NUMERIC DEFAULT 0.05,
    payout_threshold NUMERIC DEFAULT 10000,
    is_active BOOLEAN DEFAULT TRUE,
    site_id TEXT NOT NULL DEFAULT 'ejjimmy'
);

ALTER TABLE ejjimmy_partner_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ejjimmy_partner_select_own" ON ejjimmy_partner_config;
CREATE POLICY "ejjimmy_partner_select_own" ON ejjimmy_partner_config
    FOR SELECT USING (
        partner_code = current_setting('request.jwt.claims', true)::json->>'partner_code'
        AND site_id = 'ejjimmy'
    );

DROP POLICY IF EXISTS "ejjimmy_partner_admin_all" ON ejjimmy_partner_config;
CREATE POLICY "ejjimmy_partner_admin_all" ON ejjimmy_partner_config
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin')
        AND site_id = current_setting('request.jwt.claims', true)::json->>'site_id'
    );

-- ============================================================================
-- CONTENT KEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ejjimmy_content_keys (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    locale TEXT NOT NULL DEFAULT 'th',
    site_id TEXT NOT NULL DEFAULT 'ejjimmy',
    UNIQUE(key, locale, site_id)
);

ALTER TABLE ejjimmy_content_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ejjimmy_content_keys_select" ON ejjimmy_content_keys;
CREATE POLICY "ejjimmy_content_keys_select" ON ejjimmy_content_keys
    FOR SELECT USING (site_id = 'ejjimmy');

DROP POLICY IF EXISTS "ejjimmy_content_keys_admin" ON ejjimmy_content_keys;
CREATE POLICY "ejjimmy_content_keys_admin" ON ejjimmy_content_keys
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin')
        AND site_id = current_setting('request.jwt.claims', true)::json->>'site_id'
    );

-- ============================================================================
-- SUBMIT_LEAD RPC FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION ejjimmy_submit_lead(
    p_name TEXT DEFAULT 'ลูกค้าใหม่',
    p_phone TEXT DEFAULT NULL,
    p_line_id TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_bill NUMERIC DEFAULT 0,
    p_system_size NUMERIC DEFAULT NULL,
    p_payback NUMERIC DEFAULT NULL,
    p_tier TEXT DEFAULT NULL,
    p_source TEXT DEFAULT 'web',
    p_notes TEXT DEFAULT NULL,
    p_chat_history JSONB DEFAULT '[]'::jsonb,
    p_survey_date TIMESTAMPTZ DEFAULT NULL,
    p_referred_by TEXT DEFAULT NULL
) RETURNS TABLE (
    lead_id BIGINT,
    created_at TIMESTAMPTZ,
    name TEXT,
    phone TEXT,
    line_id TEXT,
    email TEXT,
    location TEXT,
    bill_amount NUMERIC,
    system_size NUMERIC,
    payback_years NUMERIC,
    equipment_tier TEXT,
    status TEXT,
    chat_history JSONB,
    notes TEXT,
    source TEXT,
    site_id TEXT,
    unread BOOLEAN,
    referred_by TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_site_id TEXT := COALESCE(
        NULLIF(current_setting('request.jwt.claims.site_id', true), ''),
        'ejjimmy'
    );
    v_existing_id BIGINT;
BEGIN
    -- Check for existing lead by LINE ID
    IF p_line_id IS NOT NULL THEN
        SELECT ejjimmy_leads.id INTO v_existing_id
        FROM ejjimmy_leads
        WHERE line_id = p_line_id AND site_id = v_site_id
        ORDER BY created_at DESC LIMIT 1;
    END IF;

    -- Check by phone
    IF v_existing_id IS NULL AND p_phone IS NOT NULL THEN
        SELECT ejjimmy_leads.id INTO v_existing_id
        FROM ejjimmy_leads
        WHERE phone = p_phone AND site_id = v_site_id
        ORDER BY created_at DESC LIMIT 1;
    END IF;

    -- Check by email
    IF v_existing_id IS NULL AND p_email IS NOT NULL THEN
        SELECT ejjimmy_leads.id INTO v_existing_id
        FROM ejjimmy_leads
        WHERE email = p_email AND site_id = v_site_id
        ORDER BY created_at DESC LIMIT 1;
    END IF;

    IF v_existing_id IS NOT NULL THEN
        -- Update existing lead
        RETURN QUERY
        UPDATE ejjimmy_leads SET
            updated_at = NOW(),
            unread = TRUE,
            name = CASE WHEN name IN ('ลูกค้าใหม่', 'LINE User%') THEN p_name ELSE name END,
            phone = COALESCE(phone, p_phone),
            line_id = COALESCE(line_id, p_line_id),
            email = COALESCE(email, p_email),
            location = COALESCE(location, p_location),
            bill_amount = GREATEST(bill_amount, COALESCE(p_bill, 0)),
            system_size = COALESCE(system_size, p_system_size),
            payback_years = COALESCE(payback_years, p_payback),
            equipment_tier = COALESCE(equipment_tier, p_tier),
            chat_history = chat_history || p_chat_history,
            notes = COALESCE(notes, '') || CASE WHEN p_notes IS NOT NULL THEN E'\n[' || TO_CHAR(NOW(), 'HH24:MI') || ']: ' || p_notes ELSE '' END,
            referred_by = COALESCE(referred_by, p_referred_by),
            survey_date = COALESCE(survey_date, p_survey_date)
        WHERE ejjimmy_leads.id = v_existing_id
        RETURNING ejjimmy_leads.id, ejjimmy_leads.created_at, ejjimmy_leads.name, ejjimmy_leads.phone, ejjimmy_leads.line_id, ejjimmy_leads.email, ejjimmy_leads.location, ejjimmy_leads.bill_amount, ejjimmy_leads.system_size, ejjimmy_leads.payback_years, ejjimmy_leads.equipment_tier, ejjimmy_leads.status, ejjimmy_leads.chat_history, ejjimmy_leads.notes, ejjimmy_leads.source, ejjimmy_leads.site_id, ejjimmy_leads.unread, ejjimmy_leads.referred_by;
    ELSE
        -- Insert new lead
        RETURN QUERY
        INSERT INTO ejjimmy_leads (
            name, phone, line_id, email, location,
            bill_amount, system_size, payback_years, equipment_tier,
            status, chat_history, notes, source, site_id, unread,
            referred_by, survey_date
        ) VALUES (
            p_name, p_phone, p_line_id, p_email, p_location,
            p_bill, p_system_size, p_payback, p_tier,
            'New (Web)', p_chat_history, p_notes, p_source, v_site_id, TRUE,
            p_referred_by, p_survey_date
        )
        RETURNING ejjimmy_leads.id, ejjimmy_leads.created_at, ejjimmy_leads.name, ejjimmy_leads.phone, ejjimmy_leads.line_id, ejjimmy_leads.email, ejjimmy_leads.location, ejjimmy_leads.bill_amount, ejjimmy_leads.system_size, ejjimmy_leads.payback_years, ejjimmy_leads.equipment_tier, ejjimmy_leads.status, ejjimmy_leads.chat_history, ejjimmy_leads.notes, ejjimmy_leads.source, ejjimmy_leads.site_id, ejjimmy_leads.unread, ejjimmy_leads.referred_by;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION ejjimmy_submit_lead TO anon, authenticated;

-- ============================================================================
-- UPDATE LEAD TIMESTAMP TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION ejjimmy_update_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ejjimmy_leads_timestamp ON ejjimmy_leads;
CREATE TRIGGER ejjimmy_leads_timestamp
    BEFORE UPDATE ON ejjimmy_leads
    FOR EACH ROW EXECUTE FUNCTION ejjimmy_update_timestamp();

DROP TRIGGER IF EXISTS ejjimmy_products_timestamp ON ejjimmy_solar_products;
CREATE TRIGGER ejjimmy_products_timestamp
    BEFORE UPDATE ON ejjimmy_solar_products
    FOR EACH ROW EXECUTE FUNCTION ejjimmy_update_timestamp();

DROP TRIGGER IF EXISTS ejjimmy_knowledge_timestamp ON ejjimmy_knowledge;
CREATE TRIGGER ejjimmy_knowledge_timestamp
    BEFORE UPDATE ON ejjimmy_knowledge
    FOR EACH ROW EXECUTE FUNCTION ejjimmy_update_timestamp();

DROP TRIGGER IF EXISTS ejjimmy_blog_timestamp ON ejjimmy_blog_posts;
CREATE TRIGGER ejjimmy_blog_timestamp
    BEFORE UPDATE ON ejjimmy_blog_posts
    FOR EACH ROW EXECUTE FUNCTION ejjimmy_update_timestamp();

DROP TRIGGER IF EXISTS ejjimmy_cases_timestamp ON ejjimmy_cases;
CREATE TRIGGER ejjimmy_cases_timestamp
    BEFORE UPDATE ON ejjimmy_cases
    FOR EACH ROW EXECUTE FUNCTION ejjimmy_update_timestamp();

DROP TRIGGER IF EXISTS ejjimmy_partner_timestamp ON ejjimmy_partner_config;
CREATE TRIGGER ejjimmy_partner_timestamp
    BEFORE UPDATE ON ejjimmy_partner_config
    FOR EACH ROW EXECUTE FUNCTION ejjimmy_update_timestamp();

DROP TRIGGER IF EXISTS ejjimmy_content_keys_timestamp ON ejjimmy_content_keys;
CREATE TRIGGER ejjimmy_content_keys_timestamp
    BEFORE UPDATE ON ejjimmy_content_keys
    FOR EACH ROW EXECUTE FUNCTION ejjimmy_update_timestamp();