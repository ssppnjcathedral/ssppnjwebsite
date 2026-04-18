-- ══════════════════════════════════════════════════
-- MY JOURNEY PHASE 1 — Supabase Setup
-- Per-session progress for catechesis.html and bible-study.html
-- Run this in Supabase SQL Editor before deploying HTML changes
-- ══════════════════════════════════════════════════

-- 1. CATECHESIS PROGRESS
-- One row per (user, session). session_id is "sess-1" through "sess-13".
CREATE TABLE IF NOT EXISTS catechesis_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, session_id)
);

CREATE INDEX IF NOT EXISTS catechesis_progress_user_idx
  ON catechesis_progress (user_id);

ALTER TABLE catechesis_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own catechesis progress"
  ON catechesis_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users write own catechesis progress"
  ON catechesis_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own catechesis progress"
  ON catechesis_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own catechesis progress"
  ON catechesis_progress FOR DELETE
  USING (auth.uid() = user_id);


-- 2. BIBLE STUDY PROGRESS
-- One row per (user, session). study_id is "peter-01", "wisdom-01",
-- "galatians-01", "2john-01", "genesis-01", etc.
CREATE TABLE IF NOT EXISTS bible_study_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_id text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, study_id)
);

CREATE INDEX IF NOT EXISTS bible_study_progress_user_idx
  ON bible_study_progress (user_id);

ALTER TABLE bible_study_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own bible study progress"
  ON bible_study_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users write own bible study progress"
  ON bible_study_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own bible study progress"
  ON bible_study_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own bible study progress"
  ON bible_study_progress FOR DELETE
  USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════
-- AFTER RUNNING THIS:
-- Verify in Supabase Dashboard > Table Editor that both tables
-- exist and have RLS enabled. The Phase 1 HTML changes will sync
-- writes here once deployed. Until this SQL runs, all sync calls
-- fail silently and data lives only in localStorage.
-- ══════════════════════════════════════════════════
