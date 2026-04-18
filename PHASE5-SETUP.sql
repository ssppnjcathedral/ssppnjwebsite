-- ══════════════════════════════════════════════════
-- MY JOURNEY PHASE 5 — Supabase Setup
-- Fr. Solomon's parishioner-facing notes + replies.
-- Tables prefixed `journey_` to avoid collision with the existing
-- admin follow-up table (also named pastoral_notes but for a
-- different purpose — don't touch that one).
-- Run this in Supabase SQL Editor BEFORE deploying Phase 5 HTML.
-- ══════════════════════════════════════════════════

-- ── JOURNEY NOTES ──
-- One current note per parishioner. Kept notes copy to journey_note_history.
CREATE TABLE IF NOT EXISTS journey_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  written_by text NOT NULL,
  written_at timestamptz DEFAULT now(),
  read_at timestamptz,
  kept_by_parishioner boolean DEFAULT false,
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS journey_notes_user_idx ON journey_notes (user_id);

ALTER TABLE journey_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own journey note"
  ON journey_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all journey notes"
  ON journey_notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM site_admins sa WHERE sa.user_id = auth.uid()));

CREATE POLICY "Admins insert journey notes"
  ON journey_notes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM site_admins sa WHERE sa.user_id = auth.uid()));

CREATE POLICY "Admins update journey notes"
  ON journey_notes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM site_admins sa WHERE sa.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM site_admins sa WHERE sa.user_id = auth.uid()));

CREATE POLICY "Users update own note read state"
  ON journey_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins delete journey notes"
  ON journey_notes FOR DELETE
  USING (EXISTS (SELECT 1 FROM site_admins sa WHERE sa.user_id = auth.uid()));


-- ── JOURNEY NOTE HISTORY ──
CREATE TABLE IF NOT EXISTS journey_note_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  written_by text,
  written_at timestamptz NOT NULL,
  archived_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS journey_note_history_user_idx
  ON journey_note_history (user_id, archived_at DESC);

ALTER TABLE journey_note_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own journey note history"
  ON journey_note_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all journey note history"
  ON journey_note_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM site_admins sa WHERE sa.user_id = auth.uid()));

CREATE POLICY "Users insert own journey note history"
  ON journey_note_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins insert journey note history"
  ON journey_note_history FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM site_admins sa WHERE sa.user_id = auth.uid()));


-- ── JOURNEY REPLIES ──
CREATE TABLE IF NOT EXISTS journey_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reply_text text NOT NULL,
  intent text,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS journey_replies_sent_idx ON journey_replies (sent_at DESC);

ALTER TABLE journey_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own journey reply"
  ON journey_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own journey replies"
  ON journey_replies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all journey replies"
  ON journey_replies FOR SELECT
  USING (EXISTS (SELECT 1 FROM site_admins sa WHERE sa.user_id = auth.uid()));

CREATE POLICY "Admins update journey replies"
  ON journey_replies FOR UPDATE
  USING (EXISTS (SELECT 1 FROM site_admins sa WHERE sa.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM site_admins sa WHERE sa.user_id = auth.uid()));

CREATE POLICY "Admins delete journey replies"
  ON journey_replies FOR DELETE
  USING (EXISTS (SELECT 1 FROM site_admins sa WHERE sa.user_id = auth.uid()));

-- ══════════════════════════════════════════════════
-- AFTER RUNNING THIS:
-- Verify journey_notes / journey_note_history / journey_replies
-- exist with RLS enabled. Fr. Solomon needs a row in site_admins
-- (user_id = his auth user id) for the admin policies to apply.
-- ══════════════════════════════════════════════════
