# Phase 8 Continuation — My Journey Mockup Polish

**Goal:** finish the redesign so `my-journey.html` visually matches `my-journey-mockup.html`. The structural shell is in place (hero, stats rail, 2-column grid, sidebar with keepsake + actions, legend). The room cards inside the main column still use the old visual treatment.

**Current commit baseline:** `861012e` (Paschal report fixes). Previous redesign work is in `70506f5` (Phase 8 partial).

---

## Reference files

| File | Purpose |
|---|---|
| `my-journey.html` | Live page. Already has new hero + stats + sidebar + legend. Rooms inside `.j-main` use old markup. |
| `my-journey-mockup.html` | Visual target. Lines 164–250 contain the room CSS, lines 582–942 the room markup. |
| `my-journey-margin-mockup.html` | Visual target for the Notes archive. Already shipped at `/my-journey-notes`. |

---

## What's done

- New hero with personal welcome, profile strip (avatar, joined date, streak)
- 6-cell stats rail with count-up
- 2-column grid: main + sticky sidebar (keepsake card + apse-dark actions card)
- Legend section at bottom
- Sticky section nav (Phase 6) — different markup from mockup but functionally equivalent
- Living strip (Phase 4) — three tiles, slightly different markup from mockup but covers all data
- Fr. Solomon's note card (Phase 5) — parchment styling close to mockup
- Reveal-on-scroll animations on rooms
- Paschal year report (Phase 7) — print keepsake from sidebar Generate PDF button
- Hero entrance cascade + heroDrift background animation

## What's left for Phase 8 (the visual-match work)

### 1. Room card redesign — biggest visual gap

Replace each room's current head with the mockup pattern (lines 168–198 of mockup CSS, lines 585–678 of mockup markup):

```html
<article class="room scroll-anchor" id="room-margin">
  <div class="room-head">
    <div class="room-sigil"><svg viewBox="0 0 24 24">...</svg></div>
    <div>
      <div class="room-title">Your <em>Notes</em></div>
      <div class="room-caption">Verses you have saved, notes you have written</div>
    </div>
    <div class="room-progress">
      <div class="room-progress-num">17 <em>saved</em></div>
      <div class="room-progress-bar"><div class="room-progress-fill" style="--fill:100%"></div></div>
      <div class="room-progress-label">Most recent Apr 12</div>
    </div>
  </div>
  <div class="room-body">...existing content...</div>
</article>
```

The four rooms in mockup order: `room-margin` (Notes), `room-library` (Library), `room-icon` (Icon Corner), `room-kliros` (Prayer Rule).

Each needs:
- 62×62 sigil circle with SVG glyph (mockup has unique glyph per room)
- Title + italic accent + caption
- Right-aligned progress: number, italic counter (e.g. "17 saved", "23 of 65", "6 saints", "6 prayers"), 140px gold gradient bar, sub-label
- Sigil rotates 6° + scales 1.05 on `:hover` (already in CSS port)

Existing render functions already compute the data needed (see `renderReadingNotes`, `renderLibrary`, `renderIconCorner`, `renderRule`). Just need to inject the new wrapper markup.

**Migration pattern:** wrap each existing section block in the new `.room` shell. Keep the existing `id` attributes (`reading-notes-section`, `library-room`, `icon-corner-section`, `rule-section`) so section nav still works. Move the existing inner content into `.room-body`.

### 2. Margin entries (Notes room body) styling

Mockup lines 202–223 — `.margin-entry` with date column, gold left border, hover-reveal action buttons (`.margin-actions` with jump/copy/edit/delete). Currently `renderReadingNotes()` uses inline-styled blocks. Replace with the mockup classes.

### 3. Library items styling

Mockup lines 184–199 — `.lib-group` heading (Cinzel maroon + italic count) and `.lib-item` rows with 22px gold-fill check, title + sub, italic right-aligned date. The current `renderLibraryGroup()` already emits `.lib-item` markup; just verify the CSS classes match what's now declared.

### 4. Icon Corner grid styling

Mockup lines 226–234 — `.icon-grid` with 4 columns, 3/4 aspect images, sepia filter, feast badge top-right, Ken Burns zoom on hover. Currently `renderIconCorner()` uses inline-styled grid. Replace with `.icon-grid` / `.icon-card` / `.icon-photo` / `.icon-feast` / `.icon-name` / `.icon-date`.

### 5. Prayer Rule (Kliros) — two-column body

Mockup lines 237–250 — `.kliros-cols` two-column grid: left "My Rule of Prayer" + right "Fasts Observed". The fasts column needs:
- Big italic verdigris number (count of fast days kept this year, derived from calendar-2026.json)
- List of fasts with status (in progress / completed)

This requires a small new compute function that walks the calendar to count fast days year-to-date. Strict + Wine&Oil + Fish-allowed all count; Fast Free does not.

### 6. Activity feed (sidebar)

Mockup lines 254–273 — `.feed` card in the sidebar above keepsake. This needs an `activity_log` Supabase table. SQL:

```sql
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,           -- 'note_saved' | 'session_completed' | 'saint_bookmarked' | 'article_read'
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

Then add write calls in `companion-sync.js` for each save type (syncReadingNote, syncSaintBookmark, syncCatechesisSession, syncBibleStudySession, syncJourneyProgress) that also insert an `activity_log` row.

Render the feed in `.j-sidebar` above `.j-keepsake`. Markup pattern in mockup lines 949–1024. Includes the continuous vertical gold rail via `.feed-list::before`.

### 7. Section head before rooms

Mockup lines 576–580:
```html
<div class="section-head">
  <div class="section-eyebrow">Four Rooms of Your Journey</div>
  <h2 class="section-title">A record of <em>what you have walked through</em>.</h2>
  <p class="section-kicker">Each room keeps the work you have done. Open one to see what you have saved, read, sung, and kept in mind.</p>
</div>
```

Insert this above the rooms inside `.j-main`.

### 8. Entry points preview (optional)

Mockup lines 1086–1141 — synthetic "this is what the readings page looks like with the widget" section. Pure illustration, no data. Adds context for first-time visitors. Low priority — defer if cutting scope.

### 9. Mockup hero quote line

The mockup hero subtitle is dynamic-feeling: *"You have walked twenty-three steps along this road since the feast of the Theophany. The Church keeps every one."* Currently the live page shows a generic line. Compute "steps" from total journey activity since most recent major feast (level 7+) before today, and write the line dynamically. Number to spelled-out text (twenty-three) for warmth.

### 10. Polish pass

- Verify all mockup animations land: stats count-up (already done), room hover lift, sigil rotate, feed dot pop, margin verse quote-mark scale on hover, Ken Burns on icon photos
- Test mobile responsive — mockup has explicit `@media(max-width:640px)` breakpoint adjustments
- Test signed-out state: hero should show generic welcome, hide profile strip, hide pastoral note section
- Reduce `prefers-reduced-motion` correctly (already partially handled)

---

## Implementation order (suggested slices)

| Slice | Work | Risk |
|---|---|---|
| 1 | Section head + 4 room shells with sigils (steps 1, 7) | Low — markup wrap only |
| 2 | Margin entries + Library items + Icon Corner restyle (steps 2, 3, 4) | Low — render function tweaks |
| 3 | Kliros two-column with fast count (step 5) | Medium — new calendar walk function |
| 4 | Activity feed + activity_log table (step 6) | Medium — new SQL + many sync writes |
| 5 | Hero quote dynamic line + polish (steps 9, 10) | Low |
| 6 | Entry points preview (step 8) | Low — pure markup |

---

## Key files & line ranges in `my-journey.html`

- CSS block: lines 22–~840 (look for the `</style>` close)
- Body markup: starts ~line 700 with `<nav class="nav">`, ends ~line 1450 with `</footer>`
- JS render functions:
  - `renderReadingNotes`: ~1750
  - `renderLibrary`: ~2380
  - `renderIconCorner`: ~2230
  - `renderRule`: ~1488
  - `renderLivingStrip`: ~2070
  - `renderPastoralNote`: ~1935
  - `renderJourneyHero`: ~1925
  - `initStatsRail`: ~2020
  - `generateSummary` (Paschal report): ~1700
- Init chain (DOMContentLoaded): ~1900

Existing IDs to preserve so JS keeps wiring:
- `reading-notes-section`, `reading-notes-list`, `reading-notes-footer`, `reading-notes-count`
- `library-room`, `library-room-progress`, `library-room-progress-fill`, `library-groups`
- `icon-corner-section`, `icon-corner-grid`, `icon-corner-footer`, `icon-corner-count`
- `rule-section`, `rule-list`
- `pastoral-note-container`
- `living-strip` and its tile children (`ls-feast-title`, `ls-patron-title`, `ls-fast-title`, etc.)
- `js-section-nav` and the `js-count-*` counters
- `j-hero-name`, `j-profile-*`, `j-stats`, `stat-*`

---

## Hard rules to remember

From `CLAUDE.md`:
- No em dashes anywhere — use commas, colons, or rewrite
- No AI vocab: vibrant / pivotal / testament / showcasing / fostering / tapestry / delve / thriving / robust / comprehensive / seamless / elevate / cutting-edge / transformative
- No italic body prose (italics only for liturgical rubrics or designated pull quotes)
- Hero text always left-aligned
- No placeholder text visible in browser — `onerror="this.style.display='none'"` on every img
- Surgical edits over structural rewrites; grep before editing; re-read after editing
- Netlify auto-deploys on push to main — every merge is live

---

## Suggested first prompt for the new chat

> Continue Phase 8 of the My Journey redesign. Read PHASE-8-CONTINUATION.md for the plan. Start with Slice 1 (section head + 4 room shells with sigils). Use my-journey-mockup.html as the visual target. Preserve all existing render-function IDs so data wiring keeps working. Ship slice by slice, commit + push between slices.
