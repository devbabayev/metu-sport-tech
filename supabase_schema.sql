-- ==========================================================
-- MoveUp - Supabase Database Schema & Seed Data
-- ==========================================================

-- 1. Cities Table
CREATE TABLE IF NOT EXISTS public.cities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Türkiye',
    total_points BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    city_id TEXT REFERENCES public.cities(id),
    balance BIGINT NOT NULL DEFAULT 100,
    level INT NOT NULL DEFAULT 1,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Missions Table
CREATE TABLE IF NOT EXISTS public.missions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    target_value INT NOT NULL,
    category TEXT NOT NULL, -- 'squat', 'pushup', 'cardio', etc.
    points INT NOT NULL DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. User Missions Progress Table
CREATE TABLE IF NOT EXISTS public.user_missions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_id TEXT REFERENCES public.missions(id) ON DELETE CASCADE,
    current_value INT NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, mission_id)
);

-- ==========================================================
-- RPC Functions
-- ==========================================================

-- Increment user balance
CREATE OR REPLACE FUNCTION increment_balance(user_id UUID, amount INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET balance = balance + amount,
        updated_at = timezone('utc'::text, now())
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment city points
CREATE OR REPLACE FUNCTION increment_city_points(city_id TEXT, amount INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.cities
    SET total_points = total_points + amount
    WHERE id = city_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================
-- Trigger for automatic profile creation on Supabase Auth signup
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, city_id, balance, level)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Sporcu'),
        COALESCE(new.raw_user_meta_data->>'city_id', 'baku'),
        150,
        1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- Initial Seed Data: Cities
-- ==========================================================
INSERT INTO public.cities (id, name, country, total_points) VALUES
-- Azerbaycan
('baku', 'Bakı', 'Azerbaycan', 42500),
('ganja', 'Gəncə', 'Azerbaycan', 28400),
('sumgayit', 'Sumqayıt', 'Azerbaycan', 24100),
('mingachevir', 'Mingəçevir', 'Azerbaycan', 15300),
('nakhchivan', 'Naxçıvan', 'Azerbaycan', 13900),
('sheki', 'Şəki', 'Azerbaycan', 12200),
('lankaran', 'Lənkəran', 'Azerbaycan', 11400),
('shirvan', 'Şirvan', 'Azerbaycan', 9800),
('khirdalan', 'Xırdalan', 'Azerbaycan', 9200),
('guba', 'Quba', 'Azerbaycan', 8400),
('shamakhi', 'Şamaxı', 'Azerbaycan', 7600),
('gabala', 'Qəbələ', 'Azerbaycan', 7100),
('zaqatala', 'Zaqatala', 'Azerbaycan', 6500),
('yevlakh', 'Yevlax', 'Azerbaycan', 5900),
-- Türkiye
('istanbul', 'İstanbul', 'Türkiye', 48900),
('ankara', 'Ankara', 'Türkiye', 41200),
('izmir', 'İzmir', 'Türkiye', 35600),
('bursa', 'Bursa', 'Türkiye', 29700),
('antalya', 'Antalya', 'Türkiye', 26800),
('adana', 'Adana', 'Türkiye', 22100),
('konya', 'Konya', 'Türkiye', 20500),
('gaziantep', 'Gaziantep', 'Türkiye', 19400),
('kocaeli', 'Kocaeli', 'Türkiye', 17200),
('mersin', 'Mersin', 'Türkiye', 16100),
('diyarbakir', 'Diyarbakır', 'Türkiye', 14900),
('kayseri', 'Kayseri', 'Türkiye', 13900),
('eskisehir', 'Eskişehir', 'Türkiye', 13200),
('samsun', 'Samsun', 'Türkiye', 12100),
('trabzon', 'Trabzon', 'Türkiye', 11500),
('denizli', 'Denizli', 'Türkiye', 10200),
('sanliurfa', 'Şanlıurfa', 'Türkiye', 9600),
('malatya', 'Malatya', 'Türkiye', 8800),
('erzurum', 'Erzurum', 'Türkiye', 8100),
('canakkale', 'Çanakkale', 'Türkiye', 7400)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, total_points = EXCLUDED.total_points;

-- ==========================================================
-- Initial Seed Data: Daily Missions
-- ==========================================================
INSERT INTO public.missions (id, title, target_value, category, points) VALUES
('m1', '50 Squat Yap', 50, 'squat', 30),
('m2', '30 Şınav Çek', 30, 'pushup', 40),
('m3', '5000 Adım At', 5000, 'cardio', 50)
ON CONFLICT (id) DO NOTHING;
