# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Saints Peter & Paul Orthodox Cathedral — Site Context

## Project overview

Static HTML site for an Orthodox Christian parish in Jersey City, NJ.
Deployed via Netlify (auto-deploy from GitHub main branch). No build step — publish root is `.`.
Decap CMS at `/admin` for parish staff content management.
GitHub: `github.com/ssppnjcathedral/ssppnjwebsite`
Live: `peterandpaulcathedral.com`

The site serves three audiences: existing parishioners, inquirers exploring Orthodoxy, and visitors
planning to attend a service. Fr. Solomon Longo is the parish rector. Visitor-facing copy should
reflect his warm, first-person voice where appropriate.

---

## Stack

- Pure HTML / CSS / JS — no framework, no bundler
- Netlify + Decap CMS (git-gateway backend, main branch)
- Custom JSON-based liturgical calendar: `calendar-2026.json` (served from repo root)
- Parish events: `parish-events.json` (repo root)
- No npm, no build pipeline — changes are live on push to main
- All CSS is inline per page (`<style>` tags) — there are no external `.css` files
- External APIs: OrthoCal (orthocal.info) for daily readings, Wikimedia Commons for liturgical images, Tithe.ly for online giving

---

## Netlify configuration

`netlify.toml` at repo root. Publish root is `.`. Security headers on all pages:
`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
Explicit MIME type headers for `*.js` and `*.json` files.

---

## Decap CMS

Admin UI at `/admin/index.html`. Config at `/admin/config.yml`.
Backend: git-gateway, branch main. Uses Netlify Identity for auth.
Currently manages **one collection only**: parish events (`_data/parish-events.json`).
Media uploads go to `/images/events/`.

---

## File map (~22 pages)

```
index.html              Homepage (mega menu nav, Ken Burns hero, Coming Up events)
index-scripts.js        All homepage JS including tagReveal(), event rendering, init()
enhancements.js         Shared enhancement utilities (NOT available during init chain)
hero-rotator.js         Background image rotator
fetch-prologue.js       Node script — run locally to regenerate _data/prologue.json

divine-liturgy.html     Service book — three-column layout, sticky sidebar, pill nav
vespers.html            Service book — same layout as divine-liturgy (reference impl)
liturgy-book.html       Service book — same layout

visit.html              Visit page — hero, practical cards, map embed, photo mosaic, calendar pull
schedule.html           Full liturgical calendar with month/list toggle and event map
church-history.html     Editorial page — chapter rail, stats row, lightbox gallery, dual nav
about-our-church.html
about-orthodoxy.html
our-beliefs.html
administration.html
council.html
contact-us.html
donate.html
gallery.html
bulletins.html
news.html
readings.html
saints.html             Lives of the Saints — fetches _data/oca-saints-YYYY-MM-DD.json
prologue.html           Prologue of Ohrid readings — fetches _data/prologue.json
cemeteries.html
bylaws.html
videos.html
```

---

## JavaScript architecture

Three browser-side scripts, loaded in this order on the homepage:
1. `index-scripts.js` — date utilities, `getCalendar()` with caching, `tagReveal()`, `init()` chain
2. `hero-rotator.js` — Ken Burns rotating hero backgrounds
3. `enhancements.js` — scroll reveal animations (fade-up, slide, scale), hero parallax

Other pages load only `enhancements.js` for scroll animations.

Three Node.js scrapers (run via GitHub Actions, not in browser):
- `fetch-oca-saints-daily.js` — 366 daily saint JSON files (800ms polite delay, ~90 min)
- `fetch-oca-saints.js` — monthly saint aggregates (legacy)
- `fetch-prologue.js` — Prologue of Ohrid monthly + combined JSON

### Gallery management

To add a photo: edit the `PHOTOS` array in `gallery.html`. Categories: `community`, `cathedral`, `events`. Years: `2026`, `2025`, `2024`, `pre2023`. Place image files in `/images/gallery/`.

---

## Design system — DO NOT ALTER

### CSS variables

```css
--vellum:    #F6F1E8   /* page background */
--maroon:    #7B1D2A   /* primary brand */
--apse:      #3B0F18   /* deep maroon, overlays */
--gold:      #B88328   /* accent */
--stone:     #7A6648   /* secondary text */
--ink:       #2C1F16   /* body text */
--verdigris: #3D6B5E   /* green accent, fast days */
```

### Fonts

```
Cormorant Garamond — display headings (var(--f-display))
EB Garamond        — body prose (var(--f-body))
Cinzel             — UI labels, nav, caps (var(--f-ui))
```

### Layout patterns

**Service book pages (divine-liturgy, vespers, liturgy-book):**
Three-column: left dot rail | main article | 300px sticky right sidebar.
Sidebar: `position:sticky; top:60px` — never `position:fixed`.
Floating pill nav for section navigation. Mobile bottom sheet.
Sidebar A/B split panels with invisible `.sb-mid` trigger divs for long sections.

**Homepage mega menu:**
Five tabs: About Us, Inquirers, Calendar, Parish Life, Resources.
Each tab has a 420px photo strip with Ken Burns zoom, italic quote, two-column link layout.
Mobile: dark accordion drawer with gold italic descriptors.

**Footer:** Four columns mirroring nav taxonomy.

**Chapter rail (church-history):**
Desktop rail positioned dynamically to the right of `.main-col`.
Mobile floating pill with prev/next.

---

## Hard copy rules — enforce on every edit

1. **No em dashes anywhere** — use commas, colons, or rewrite the sentence
2. **No AI vocabulary** — never use: vibrant, pivotal, testament, showcasing, fostering, tapestry,
   delve, thriving, robust, comprehensive, seamless, elevate, cutting-edge, transformative
3. **No italic body prose** — italics only for liturgical rubrics or pull quotes in designated elements
4. **Hero text always left-aligned**
5. **No placeholder text visible in browser** — use `onerror="this.style.display='none'"` on images
6. **Humanized prose** — write like a thoughtful person, not a press release

---

## Data files

### _data/oca-saints-YYYY-MM-DD.json (366 files)
Pre-scraped OCA saints data, one JSON file per day of 2026.
Schema per file: `{ date, saints: [{ name, image, imageSm, imageLg, excerpt, life, troparion, kontakion, slug, url }] }`
Generated by `fetch-oca-saints-daily.js` — a Node script that scrapes oca.org (takes ~90 min, 6,400+ requests).
Triggered annually via GitHub Actions on Jan 1 (`oca-saints-daily.yml`).
`saints.html` fetches `/_data/oca-saints-YYYY-MM-DD.json` matching today's date.

### _data/prologue.json
Prologue of Ohrid daily readings. Generated by `fetch-prologue.js`. Used by `prologue.html`.

### bulletins.json
Array of bulletin objects. `bulletins.html` renders the full list; `bulletin.html?id=YYYY-MM-DD` renders one.
Schema: `{ date, reflection_title, troparia_text, patristic_quotes[], special_announcements[], thank_you_line, show_troparia, show_gospel, featured_image }`
Edit this file directly to add or update bulletins.

### calendar-2026.json
Liturgical calendar. Served from repo root (NOT `_data/`).
Accessed via `getCalendar()` with internal caching.
Contains feast names, saint names, feast levels (1-8), fast rules, tones, scripture readings.
Feast level >= 5 = major feast (rendered differently on calendar grid).

### parish-events.json
Decap CMS manages this file. **Important: Decap config.yml points to `_data/parish-events.json`
but the file the JS fetches must be at repo root.** Keep both in sync if CMS path changes.
Event schema: `{ id, active, featured, title, subtitle, type, date, time, location, contact,
description, image, link }`
Event types: liturgy | vespers | community | social | concert | announcement

---

## Critical technical rules

### JS init chain
- `tagReveal()` must be defined in `index-scripts.js` — do NOT rely on `enhancements.js`
  being available at init time. Relying on it causes silent crashes that break the entire chain.
- `init()` override must appear BEFORE the call to `init()`, not after.

### Netlify / _data/ paths
- **`/_data/` paths may be blocked by Netlify for client-side `fetch()`.**
  Any NEW JSON files that need to be fetched client-side must go at repo root, not in `_data/`.
  Existing saints files in `_data/` may work due to CDN caching from prior deployments — do not rely on this for new files.
- `calendar-2026.json`, `parish-events.json`, and `prayer-list.json` live at repo root — keep them there.

### Images
- Local paths: `/images/sidebar/`, `/images/heroes/`, `/images/events/`, `/images/logo/`
- Parish logo: `/images/logo/logo-2026.svg`
- Always add `onerror="this.style.display='none'"` fallback on `<img>` tags
- Picsum placeholders: use numeric ID URLs (`picsum.photos/id/[number]`), NOT seed-based URLs
- Wikimedia Commons used for liturgical/historical images — will be replaced with parish photos

### iOS emoji trap
- Decorative Unicode characters (cross ornament, etc.) render as colored emoji on iOS
- Use CSS or `<img>` instead of Unicode for any decorative symbols in the UI

### CSS grid debugging
- If a grid collapses, verify all expected children are inside the grid container
- Elements accidentally moved outside the container are the most common cause

---

## Edit discipline

- **Surgical edits over structural rewrites.** Large structural changes to working pages break layouts.
  Prefer targeted replacements. Use Python-based line replacement when content contains escaped
  quotes or minified single-line JS.
- **grep before editing.** Confirm the exact string exists in the file before replacing.
- **Re-read after editing.** Verify the change landed correctly before reporting done.
- **Mockups before implementation** on significant layout decisions — present options before writing code.
- **Never reformat working code** as a side effect of an unrelated edit.

---

## GitHub Actions

| Workflow | Trigger | Purpose |
|---|---|---|
| `oca-saints-daily.yml` | Jan 1 annually + manual | Runs `fetch-oca-saints-daily.js`, commits 366 `_data/oca-saints-*.json` files |
| `fetch-prologue.yml` | Schedule + manual | Runs `fetch-prologue.js`, updates `_data/prologue.json` |
| `fetch-oca-saints-daily.yml` | Manual only | Alternative trigger for the saints scraper |

To re-run the saints scraper: trigger `oca-saints-daily.yml` manually via GitHub Actions UI.

---

## Git conventions

- Commit messages: imperative, specific — e.g. `Fix sticky sidebar top offset on vespers page`
- Do not commit `.DS_Store` or editor config files
- Branch: `main` (auto-deploys to Netlify)

---

## What's pending

- Upload real parish photos to replace picsum placeholders across all pages
- Fr. Solomon theological review of `divine-liturgy.html` and `vespers.html` before publishing
- Confirm `church-history.html` is fully in the repo and linked correctly in nav
- Swap Wikimedia sidebar image URLs with real parish assets when available
- Complete scroll animations: staggered fade-up for service strip cards and Ken Burns + text
  fade-up for worship cards (may be partially implemented — check before adding)
