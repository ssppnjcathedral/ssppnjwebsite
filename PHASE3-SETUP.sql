-- ══════════════════════════════════════════════════
-- MY JOURNEY PHASE 3 — Supabase Setup
-- Saint bookmarks for the Icon Corner on my-journey.
-- Run this in Supabase SQL Editor BEFORE deploying Phase 3 HTML.
-- ══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS saint_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saint_slug text NOT NULL,
  saint_name text NOT NULL,
  feast_date text,                    -- MM-DD format, e.g. "04-18"
  image_url text,
  oca_url text,
  added_at timestamptz DEFAULT now(),
  UNIQUE (user_id, saint_slug)
);

CREATE INDEX IF NOT EXISTS saint_bookmarks_user_idx
  ON saint_bookmarks (user_id, added_at DESC);

ALTER TABLE saint_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own saint bookmarks"
  ON saint_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users write own saint bookmarks"
  ON saint_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own saint bookmarks"
  ON saint_bookmarks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own saint bookmarks"
  ON saint_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════
-- AFTER RUNNING THIS:
-- Verify in Supabase Dashboard > Table Editor that the table
-- exists and has RLS enabled. Until this runs, bookmarks live
-- only in localStorage.
-- ══════════════════════════════════════════════════
