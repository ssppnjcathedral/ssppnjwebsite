-- ══════════════════════════════════════════════════
-- ADMIN VISUAL EDITOR — Supabase Setup
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════

-- 1. Content overrides table
CREATE TABLE IF NOT EXISTS content_overrides (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  page_key text NOT NULL,
  selector text NOT NULL,
  override_type text NOT NULL CHECK (override_type IN ('image', 'text', 'caption')),
  original_value text,
  new_value text NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_key, selector, override_type)
);

-- Enable RLS
ALTER TABLE content_overrides ENABLE ROW LEVEL SECURITY;

-- Anyone can read overrides (needed for the loader to work)
CREATE POLICY "Public read" ON content_overrides FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admin write" ON content_overrides FOR ALL
  USING (
    EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

-- 2. Admin users table (simple allowlist)
CREATE TABLE IF NOT EXISTS site_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE site_admins ENABLE ROW LEVEL SECURITY;

-- Admins can read the admin list (to check their own status)
CREATE POLICY "Admins can read" ON site_admins FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Create storage bucket for uploaded images
-- (Run this via Supabase Dashboard > Storage > New Bucket)
-- Bucket name: site-images
-- Public: YES (so images can be served directly)

-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT DO NOTHING;

-- Allow admins to upload to the bucket
CREATE POLICY "Admin upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'site-images'
    AND EXISTS (SELECT 1 FROM site_admins WHERE user_id = auth.uid())
  );

-- Allow public reads from the bucket
CREATE POLICY "Public read images" ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');

-- ══════════════════════════════════════════════════
-- AFTER RUNNING THIS:
-- Add Fr. Solomon's user_id to site_admins:
--
-- INSERT INTO site_admins (user_id, email)
-- VALUES ('his-supabase-user-uuid', 'ssppnj@gmail.com');
--
-- Find his user_id in Supabase Dashboard > Authentication > Users
-- ══════════════════════════════════════════════════
