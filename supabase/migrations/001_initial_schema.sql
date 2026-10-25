-- ==============================================================================
-- AgriGenius AI - Smart Farming Agent
-- Initial Migration: Schema, Foreign Keys, Indexes, RLS Policies, Triggers
-- ==============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector if available (wrapped in DO block to handle environments without extension)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not installed or permission denied; continuing with text-based fallback.';
END $$;

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Extends Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'Farmer',
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    role VARCHAR(20) NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'farm_manager', 'agronomist', 'admin')),
    phone_number VARCHAR(25),
    state VARCHAR(100),
    district VARCHAR(100),
    village VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. FARMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_name VARCHAR(150) NOT NULL,
    description TEXT,
    farm_type VARCHAR(50) NOT NULL DEFAULT 'open_field' CHECK (farm_type IN ('open_field', 'greenhouse', 'orchard', 'hydroponic', 'mixed')),
    village VARCHAR(100),
    taluk VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    address TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    elevation NUMERIC(7, 2), -- in meters
    total_area NUMERIC(10, 2) NOT NULL DEFAULT 1.0 CHECK (total_area > 0),
    cultivated_area NUMERIC(10, 2) DEFAULT 1.0,
    available_area NUMERIC(10, 2),
    area_unit VARCHAR(20) NOT NULL DEFAULT 'acres' CHECK (area_unit IN ('acres', 'hectares', 'bigha', 'cents')),
    soil_type VARCHAR(50) DEFAULT 'loamy' CHECK (soil_type IN ('clay', 'sandy', 'loamy', 'silt', 'black', 'red', 'alluvial', 'laterite')),
    soil_ph NUMERIC(4, 2) CHECK (soil_ph >= 0 AND soil_ph <= 14),
    soil_moisture NUMERIC(5, 2) CHECK (soil_moisture >= 0 AND soil_moisture <= 100), -- percentage
    organic_matter NUMERIC(5, 2), -- percentage
    nitrogen NUMERIC(7, 2), -- kg/ha
    phosphorus NUMERIC(7, 2), -- kg/ha
    potassium NUMERIC(7, 2), -- kg/ha
    irrigation_type VARCHAR(50) DEFAULT 'drip' CHECK (irrigation_type IN ('drip', 'sprinkler', 'flood', 'furrow', 'rainfed', 'manual')),
    water_source VARCHAR(50) DEFAULT 'borewell' CHECK (water_source IN ('borewell', 'canal', 'open_well', 'river', 'farm_pond', 'rainwater_harvesting')),
    irrigation_capacity NUMERIC(10, 2), -- liters/hour
    average_temperature NUMERIC(5, 2),
    average_rainfall NUMERIC(7, 2),
    humidity NUMERIC(5, 2),
    estimated_value NUMERIC(14, 2),
    yearly_expense NUMERIC(14, 2) DEFAULT 0,
    yearly_income NUMERIC(14, 2) DEFAULT 0,
    health_score INT DEFAULT 85 CHECK (health_score >= 0 AND health_score <= 100),
    productivity_score INT DEFAULT 80 CHECK (productivity_score >= 0 AND productivity_score <= 100),
    ai_recommendation TEXT,
    notes TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. CROP CATALOG
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crop_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(100) NOT NULL UNIQUE,
    variety VARCHAR(100),
    season VARCHAR(50) NOT NULL CHECK (season IN ('Kharif', 'Rabi', 'Zaid', 'Year-round')),
    expected_duration_days INT NOT NULL CHECK (expected_duration_days > 0),
    optimal_temp_min NUMERIC(4, 1),
    optimal_temp_max NUMERIC(4, 1),
    water_requirement_mm NUMERIC(7, 1),
    source_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. CROP CYCLES (Linked to Farms)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crop_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    actual_harvest_date DATE,
    growth_stage VARCHAR(30) NOT NULL DEFAULT 'sowing' CHECK (growth_stage IN ('sowing', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvested')),
    area_allocated NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'failed', 'planned')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. SOIL TESTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.soil_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sample_date DATE NOT NULL DEFAULT CURRENT_DATE,
    lab_name VARCHAR(150),
    ph NUMERIC(4, 2),
    nitrogen NUMERIC(7, 2),
    phosphorus NUMERIC(7, 2),
    potassium NUMERIC(7, 2),
    organic_matter NUMERIC(5, 2),
    electrical_conductivity NUMERIC(6, 3), -- dS/m
    recommendations TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. IRRIGATION LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.irrigation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    water_volume_liters NUMERIC(12, 2) NOT NULL CHECK (water_volume_liters > 0),
    method VARCHAR(50) NOT NULL DEFAULT 'drip',
    soil_moisture_before NUMERIC(5, 2),
    soil_moisture_after NUMERIC(5, 2),
    notes TEXT
);

-- ------------------------------------------------------------------------------
-- 7. CONVERSATIONS & MESSAGES (AI Assistant Chat)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL DEFAULT 'Farming Consultation',
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    direct_answer TEXT,
    key_reasons JSONB,
    assumptions_missing_data JSONB,
    suggested_next_steps JSONB,
    confidence_limitations TEXT,
    citations JSONB,
    tool_calls JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 8. KNOWLEDGE DOCUMENTS & CHUNKS (RAG Base)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    jurisdiction VARCHAR(100) DEFAULT 'India',
    source_url TEXT,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'provisional', 'archived')),
    author_agency VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Full text search index on knowledge chunks
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_fts ON public.knowledge_chunks USING gin(to_tsvector('english', content));

-- ------------------------------------------------------------------------------
-- 9. DISEASE ASSESSMENTS (Image & Symptom Diagnostic)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.disease_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    image_url TEXT,
    symptoms_description TEXT NOT NULL,
    identified_issue VARCHAR(200) NOT NULL,
    confidence_score NUMERIC(4, 2) NOT NULL, -- 0.00 to 1.00
    visible_evidence TEXT NOT NULL,
    non_chemical_checks TEXT NOT NULL,
    prevention_steps TEXT NOT NULL,
    expert_referral_needed BOOLEAN NOT NULL DEFAULT FALSE,
    consultation_warning TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 10. TASKS & FIELD REMINDERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'scouting' CHECK (category IN ('irrigation', 'fertilizer', 'pesticide', 'scouting', 'harvesting', 'soil_test', 'general')),
    due_date DATE NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 11. NOTIFICATIONS (Deduplicated Alerts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    deduplication_key VARCHAR(150) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_dedup UNIQUE (owner_id, deduplication_key)
);

-- ------------------------------------------------------------------------------
-- 12. MARKET PRICES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    market VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    state VARCHAR(100) NOT NULL,
    price_per_quintal NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'INR/Quintal',
    price_date DATE NOT NULL,
    source VARCHAR(100) NOT NULL,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 13. GOVERNMENT SCHEMES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.government_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(100) NOT NULL DEFAULT 'National (India)',
    description TEXT NOT NULL,
    eligibility_summary TEXT NOT NULL,
    benefits_summary TEXT NOT NULL,
    official_source_url TEXT NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'verified',
    update_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 14. AUDIT LOGS (Security & Admin Transparency)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR HIGH QUERY EFFICIENCY
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_farms_owner ON public.farms(owner_id) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_crop_cycles_farm ON public.crop_cycles(farm_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_owner ON public.crop_cycles(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_due ON public.tasks(owner_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_farm ON public.irrigation_logs(farm_id);
CREATE INDEX IF NOT EXISTS idx_disease_owner ON public.disease_assessments(owner_id);
CREATE INDEX IF NOT EXISTS idx_market_commodity ON public.market_prices(commodity, price_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_owner ON public.notifications(owner_id, status);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Read-only public reference tables (accessible by all authenticated users)
ALTER TABLE public.crop_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;

-- Profiles: Users manage their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Farms: Users manage their own farms
CREATE POLICY "Users can view own non-deleted farms" ON public.farms FOR SELECT USING (auth.uid() = owner_id AND NOT is_deleted);
CREATE POLICY "Users can insert own farms" ON public.farms FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own farms" ON public.farms FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can soft-delete own farms" ON public.farms FOR DELETE USING (auth.uid() = owner_id);

-- Crop Cycles: Users manage crop cycles for their owned farms
CREATE POLICY "Users can view own crop cycles" ON public.crop_cycles FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own crop cycles" ON public.crop_cycles FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can update own crop cycles" ON public.crop_cycles FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own crop cycles" ON public.crop_cycles FOR DELETE USING (auth.uid() = owner_id);

-- Tasks: Users manage own tasks
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = owner_id);

-- Conversations & Messages
CREATE POLICY "Users can manage own conversations" ON public.conversations FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Users can view messages of their conversations" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can insert messages to their conversations" ON public.messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND owner_id = auth.uid())
);

-- Public Reference Tables Policies (Read for all authenticated or anon)
CREATE POLICY "Allow read on crop catalog" ON public.crop_catalog FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Allow read on knowledge documents" ON public.knowledge_documents FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Allow read on knowledge chunks" ON public.knowledge_chunks FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Allow read on market prices" ON public.market_prices FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Allow read on schemes" ON public.government_schemes FOR SELECT TO authenticated, anon USING (true);
