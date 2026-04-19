# Phase 8 Continuation — My Journey Polish (updated 2026-04-18)

**Status:** Active. Most visual-match work from the original plan is complete.
The remaining items are lower priority or require new Supabase infrastructure.

**Current commit baseline:** `58ae5fd`

---

## What is done (this session and prior)

### Visual redesign (matching mockup)
- Hero: dark overlay (`.97/.92/.84`), eyebrow with gold rule + seasonal suffix, large welcome h1 with italic gold first name, italic sub text (dynamic steps-since-last-feast line), separator rule, profile strip (avatar circle, full name, joined date, streak pill right-aligned)
- Stats rail: 6-cell count-up animation
- 2-column page grid: main + 360px sticky sidebar
- Section head above rooms ("Four Rooms of Your Journey")
- 4 room cards with sigil circles, room-head grid, progress bar + number, room-body
- Room order (top to bottom): Prayer Rule, Icon Corner, Notes, Library
- Living strip: `.living` section with gradient background, gold `::before` rule, `.living-inner` max-width grid, `.living-tile` cards with correct padding, fonts, colors. Feast tile has `<em>` italic title + animated progress bar. Patron tile uses `.patron-content`/`.patron-icon`. Discipline tile has `.fast-dot` inline span.
- Living strip titles: `font-weight:300` (lighter feel)
- Margin entries: `.margin-verse` now uses EB Garamond italic for legibility
- Library: `.lib-group` with padding, `.lib-item` 3-column grid, 22px gold check circles
- Icon Corner: `.icon-grid` 4-column, Ken Burns on hover, feast badge, sepia filter
- Prayer Rule: 2-column `.kliros-cols`, fast count from calendar
- Section nav: sliding gold ink underline, count badges, sticky at 60px
- Room collapse/expand: Prayer Rule max-height clamp; Notes shows 3, Library shows 5 per group, with expand button
- Legend at bottom
- Living strip tiles: correct background, gap 1.4rem, max-width centering
- Sidebar: keepsake card + actions card
- Fr. Solomon pastoral note card (parchment styling)
- Living strip: 3 tiles (feast, patron, discipline)
- Scroll-reveal animations on rooms
- Paschal year report (Phase 7) via Generate PDF button in sidebar
- Hero entrance cascade + heroDrift background animation
- Mobile responsive breakpoints at 640px and 900px

### Performance (this session)
- Removed blocking `await loadFromSupabase()` from DOMContentLoaded — localStorage content (Notes, Library, Prayer Rule, Icon Corner, Stats) now renders instantly on first paint
- Supabase syncs in background; re-renders localStorage sections after completion
- `loadCalendar()` uses a shared promise cache — concurrent callers share one fetch instead of making duplicate requests
- Calendar prefetched immediately on script parse
- Hero re-runs after Supabase sync completes (fixes first-refresh blank state)
- Session retry in `renderJourneyHero()` — if `getCurrentUser()` returns null on first attempt, waits 1.2s and retries before showing logged-out state

### Known path gotcha
- `calendar-2026.json` is at `/_data/calendar-2026.json` (NOT repo root). `loadCalendar()` must fetch from `/_data/calendar-YEAR.json`.

---

## What remains

### 1. Activity feed (sidebar) — requires new Supabase table
Mockup lines 254–273 — `.feed` card in sidebar above keepsake. Needs:

```sql
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  ref text,
  label text,
  source text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX activity_log_user_idx ON activity_log (user_id, created_at DESC);
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own activity" ON activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own activity" ON activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
```

Then write calls in `companion-sync.js` for each save type.
Render feed in `.j-sidebar` above `.j-keepsake`. Markup pattern: mockup lines 949–1024.

### 2. Hero quote line polish
The hero sub is already dynamic ("You have walked N steps since [feast]").
Remaining: verify the `toWords()` spelled-out numbers render correctly for all counts.

### 3. Signed-out state
Hero already shows generic sub when not logged in. Verify:
- Profile strip stays hidden (it does — `display:none` until JS confirms session)
- Pastoral note section hidden when not logged in (already handled)

### 4. Entry points preview (optional, low priority)
Mockup lines 1086–1141 — illustrative "this is what the readings widget looks like" section. Pure markup, no data. Deferred.

### 5. Polish pass
- Verify Ken Burns animation on icon photos
- Test `prefers-reduced-motion` (partially handled)
- Mobile test at 375px width

---

## Key files & line ranges in `my-journey.html`

- CSS block: lines 22–~960 (look for `</style>`)
- Body markup: `<nav class="nav">` ~line 975, ends ~line 1460
- JS render functions:
  - `renderReadingNotes`: ~2855
  - `renderLibrary`: ~2380
  - `renderIconCorner`: ~2230
  - `renderRule`: ~1488
  - `renderLivingStrip`: ~3312
  - `renderKlirosFasts`: ~2146
  - `renderPastoralNote`: ~3148
  - `renderJourneyHero`: ~2636
  - `initStatsRail`: ~2782
  - `loadCalendar`: ~3300 — fetches `/_data/calendar-YEAR.json`, promise-cached
  - `generateSummary` (Paschal report): ~1700
- Init chain (DOMContentLoaded): ~2612
  - localStorage renders fire immediately (no await)
  - Async renders fire in parallel
  - `loadFromSupabase()` runs in background, re-renders after

### IDs to preserve (JS wiring)
- `reading-notes-section`, `reading-notes-list`, `reading-notes-footer`, `reading-notes-count`
- `library-room`, `library-room-progress`, `library-room-progress-fill`, `library-groups`
- `icon-corner-section`, `icon-corner-grid`, `icon-corner-footer`, `icon-corner-count`
- `rule-section`, `rule-list`
- `pastoral-note-container`
- `living-strip`, `ls-feast-title`, `ls-feast-meta`, `ls-feast-sub`, `ls-feast-progress`, `ls-feast-progress-fill`
- `ls-patron`, `ls-patron-title`, `ls-patron-meta`, `ls-patron-sub`, `ls-patron-icon`, `ls-patron-img`, `ls-patron-cta`
- `ls-fast`, `ls-fast-title`, `ls-fast-meta`, `ls-fast-sub`
- `js-section-nav`, `js-count-*` counters
- `j-hero-name`, `j-hero-name-wrap`, `j-hero-sub`, `j-hero-eyebrow`
- `j-profile-strip`, `j-profile-avatar`, `j-profile-name`, `j-profile-joined`, `j-profile-streak`, `j-streak-text`
- `j-stats`, `stat-articles`, `stat-lectures`, `stat-verses`, `stat-saints`, `stat-prayers`, `stat-days`

---

## Hard rules (from CLAUDE.md)
- No em dashes — use commas, colons, or rewrite
- No AI vocab: vibrant / pivotal / testament / showcasing / fostering / tapestry / delve / thriving / robust / comprehensive / seamless / elevate / cutting-edge / transformative
- No italic body prose (italics only for liturgical rubrics or designated pull quotes)
- Hero text always left-aligned
- No placeholder text visible in browser — `onerror="this.style.display='none'"` on every img
- Surgical edits over structural rewrites; grep before editing; re-read after editing
- Netlify auto-deploys on push to main — every merge is live
- `/_data/` paths: calendar works at `/_data/`; new fetchable JSON files should go at repo root
