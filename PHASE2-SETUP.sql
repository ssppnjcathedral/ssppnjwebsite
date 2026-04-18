-- ══════════════════════════════════════════════════
-- MY JOURNEY PHASE 2 — Supabase Setup
-- Reading notes (save-a-verse + inline note) from readings.html,
-- later prologue.html and bulletin.html.
-- Run this in Supabase SQL Editor BEFORE deploying Phase 2 HTML.
-- ══════════════════════════════════════════════════

-- READING NOTES
-- One row per saved verse. A user can save the same verse on different
-- days (e.g. it recurs in the lectionary), so uniqueness is per (user, date, verse_ref).
CREATE TABLE IF NOT EXISTS reading_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  verse_ref text NOT NULL,            -- e.g. "matthew-5-9"
  verse_text text NOT NULL,
  citation text,                      -- e.g. "Matthew 5:9"
  source text,                        -- "gospel" | "epistle" | "ot" | "matins" | "prologue" | "bulletin" | "bible_study"
  note_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, date, verse_ref)
);

CREATE INDEX IF NOT EXISTS reading_notes_user_idx
  ON reading_notes (user_id, date DESC);

ALTER TABLE reading_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own reading notes"
  ON reading_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users write own reading notes"
  ON reading_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reading notes"
  ON reading_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own reading notes"
  ON reading_notes FOR DELETE
  USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════
-- AFTER RUNNING THIS:
-- Verify in Supabase Dashboard > Table Editor that the table
-- exists and has RLS enabled. Until this runs, all widget saves
-- live only in localStorage and the "Your Notes" room on my-journey
-- shows only what the current browser has saved.
-- ══════════════════════════════════════════════════
