# News Page System — Handoff Brief

**Project:** Saints Peter & Paul Orthodox Cathedral website  
**Repo:** `github.com/ssppnjcathedral/ssppnjwebsite`  
**Live site:** `peterandpaulcathedral.com`  
**Stack:** Pure HTML / CSS / JS, no framework, no bundler. Netlify auto-deploy from `main`. Decap CMS at `/admin`.

---

## What this document is

The design direction for `news.html` has been fully decided and mocked up. The user is about to hand you the real news data. Your job is to:

1. Ingest the data
2. Build `news.json` at repo root
3. Update `admin/config.yml` with a News collection
4. Rebuild `news.html` from scratch using the design spec below

Do not start until the user hands you the data. When they do, execute everything in one pass.

---

## The mockup

`news-mockup.html` exists at repo root. Open it in a browser before writing a single line. The real `news.html` must match this mockup exactly in layout, spacing, typography, and interaction behavior. The mockup is the source of truth for all visual decisions.

---

## Design direction: Tablet-style editorial, B+C hybrid

**The reference:** [The Tablet (thetablet.co.uk)](https://www.thetablet.co.uk/) — a 180-year-old UK Catholic weekly. Editorial newspaper layout, not a card UI.

**The one governing rule:** No card boxes. No card borders. No drop shadows. No colored background blocks on article cards. Articles float on the vellum background. Whitespace, thin maroon rules, and typographic scale do all the visual separation. Category tags are small colored pills above the headline. An article without an image is purely typographic — category pill, headline, excerpt, date — and that is intentional, not a gap to fill.

This is the most important thing to understand about the design. The first mockup attempt used colored card backgrounds and heavy UI chrome and was rejected. The second (current) mockup is correct.

---

## Site design system (do not alter)

```css
--vellum:    #F6F1E8   /* page background */
--maroon:    #7B1D2A   /* primary brand */
--apse:      #3B0F18   /* deep maroon, dark zones */
--gold:      #B88328   /* accent */
--stone:     #7A6648   /* secondary text */
--ink:       #2C1F16   /* body text */
--verdigris: #3D6B5E   /* green accent */
```

**Fonts:**
- `Cormorant Garamond` — display headings (`var(--f-display)`)
- `EB Garamond` — body prose (`var(--f-body)`)
- `Cinzel` — UI labels, nav, caps (`var(--f-ui)`)

**Hard copy rules (enforce on every line of content):**
- No em dashes anywhere — use commas, colons, or rewrite
- No AI vocabulary: vibrant, pivotal, testament, showcasing, fostering, tapestry, delve, thriving, robust, comprehensive, seamless, elevate, cutting-edge, transformative
- No italic body prose
- No placeholder images visible in browser (`onerror="this.style.display='none'"` on all `<img>`)

---

## Page structure (top to bottom)

### 1. Nav
Standard site nav copied from `about-liturgy.html`. Mark "Bulletins" as `nav-active-parent`. No changes to nav markup or behavior.

### 2. Masthead
Dark apse background. Two elements in a flex row:
- **Left:** "Parish" + italic "News" in large Cormorant weight-300, `clamp(2.8rem, 5vw, 4.2rem)`. Below: italic descriptor in small EB Garamond.
- **Right:** Total article count as a large faint gold numeral (purely decorative, updates from JSON length).

Below the title row, still inside the masthead: the **category navigation** as horizontal Cinzel text links. Active link = gold underline. Inactive = faint white. This nav drives the filter. The active state is `All` by default.

### 3. Zone 1 — "Now" band
Continues the apse background (no visible seam from the masthead). Contains only articles where `pinned: true` or `featured: true`. Maximum 3 articles shown here, always. This zone is **never affected by the active category filter or search** — it always shows the same pinned articles regardless of what the user is filtering.

Layout inside the Now band:
- **Left (60%):** The lead article. If `image` is present, show it at full width, `height: 240px`, `object-fit: cover`. If no image, show a near-black editorial rectangle (`background: linear-gradient(175deg, #200610, #3a0c1a)`) with the category name set very large and extremely faint inside as decorative typography. Below the image/block: small category pill, large headline in Cormorant (`clamp(1.6rem, 2.5vw, 2rem)`), excerpt in EB Garamond (faint white), date + author in tiny Cinzel. "Read article →" link in gold.
- **Right (40%):** 2-3 stacked smaller articles, each separated by a thin `rgba(184,131,40,.10)` horizontal rule. Each: small category pill + Cormorant headline (`1.1rem`) + one-line excerpt + date. No boxes.
- Left and right separated by a single `rgba(184,131,40,.14)` vertical rule.

### 4. Filter bar
Sticky at `top: 60px` (below the nav). Vellum background. Bottom border only (`var(--rule)`).
- **Left:** Category text links in Cinzel with article counts as small faint numerals. Active = maroon underline. Horizontally scrollable on mobile, no visible scrollbar.
- **Right:** "Newest first" toggle button + search icon button. Minimal styling.

When a category is selected in the masthead category nav, the filter bar syncs to that category and vice versa. They are the same filter state.

### 5. Zone 2 — Recent News
Vellum background. Section eyebrow: thin maroon rule + "Recent News" in small Cinzel.

**Row A (first content row, always):**
- **Left feature (60%):** The most recent non-pinned article matching the current filter. Large Cormorant headline (`clamp(1.5rem, 2.3vw, 2rem)`), longer excerpt (3 lines), full meta row, "Read article →" link.
- **Right rail (40%):** Next 3 non-pinned articles in a stacked list. Each: category pill + `1.05rem` Cormorant headline + short excerpt + date. No boxes. Separated by `var(--rule-faint)` horizontal rules. The rail items have no "Read article" link — clicking anywhere on the item navigates.
- Separated by a single `var(--rule-faint)` vertical line.

**Row B and beyond:**
- 3-equal-column grid. Articles 5+ from the current filtered set.
- Each column: category pill + `1.05–1.15rem` Cormorant headline + 2-line excerpt + date.
- Columns separated by `var(--rule-faint)` vertical rules.
- Rows separated by `var(--rule-faint)` horizontal rules.
- Hover state on all articles: `opacity: 0.78` transition only. No lift, no shadow, no border change.

### 6. Load More
Thin top rule. "Load More" outline button (maroon text, fills maroon on hover) + article count label ("Showing 9 of 247 articles"). Shows 12 articles per load. Hides when all filtered articles are shown.

### 7. Archive
`border-top: 2px solid var(--maroon)`. "Article Archive" in Cormorant `1.6rem` + total count label right-aligned.

4-column year grid on desktop (2-col on tablet, 1-col on mobile). Each year:
- Large Cormorant year number in maroon + article count + chevron toggle
- Click expands/collapses month list
- Month rows: month name left, count right. Hover = month name turns maroon.
- Clicking a month applies a date filter (YYYY-MM) to Zone 2 and scrolls there.
- Most recent year open by default, all others closed.

### 8. Footer
Standard site footer, copied from `about-liturgy.html`.

---

## JavaScript architecture

All rendering is client-side. Single `fetch('/news.json')` on load.

**State object:**
```js
const state = {
  category: 'All',   // active category filter
  sort: 'newest',    // 'newest' | 'oldest'
  search: '',        // search string
  page: 1,           // load-more page
  month: null        // 'YYYY-MM' | null (archive filter)
};
```

**On any state change:** re-render Zone 2 grid and archive. Never re-render Zone 1.

**Filtering pipeline:**
1. Start with full articles array
2. Apply `state.month` filter if set (articles where `date.startsWith(state.month)`)
3. Apply `state.category` filter if not 'All'
4. Apply `state.search` filter against `title + excerpt` (case-insensitive, 200ms debounce on input, clear on Escape)
5. Apply `state.sort` (reverse array for 'oldest')
6. Slice `[0, state.page * 12]` for Load More
7. Render: Row A gets item `[0]`, Row A rail gets items `[1–3]`, Row B+ gets items `[4+]` in 3-col groups

**Zone 1 pipeline:**  
Separate from the main pipeline. Filter full array for `pinned === true || featured === true`, take the first 3, render once on load. Never re-render.

**Category nav sync:**  
Masthead category links and filter bar links share one click handler. Setting active state on either updates both.

**Archive month click:**  
Set `state.month = 'YYYY-MM'`, set `state.category = 'All'`, set `state.page = 1`, re-render, scroll to Zone 2.

---

## `news.json` data model

Lives at **repo root** (not `_data/` — Netlify may block client-side fetches from `_data/`).

```json
[
  {
    "id": "2026-04-01-holy-week-services",
    "date": "2026-04-01",
    "title": "Holy Week Services: A Complete Guide",
    "category": "Liturgical Life",
    "featured": true,
    "pinned": true,
    "excerpt": "One to two sentence summary. No em dashes.",
    "body": "Full article text. May be empty string if not provided.",
    "image": "/images/news/holy-week-2026.jpg",
    "author": "Fr. Solomon Longo",
    "readtime": "4 min read"
  }
]
```

**Rules for building the JSON from user data:**
- Derive all categories from the actual data. Do not invent categories not present.
- `id`: slug format, `YYYY-MM-DD-short-title`, all lowercase, hyphens only.
- `date`: `YYYY-MM-DD` always.
- `image`: `""` if none. Never a placeholder path.
- `readtime`: estimate from body word count (200 wpm). If no body, `""`.
- `pinned: true`: assign to the 2-3 most current/important articles. Maximum 3.
- `featured: true`: assign to articles that should get Row A feature treatment (may overlap with pinned).
- Sort the JSON array newest-first.
- No em dashes in any `title`, `excerpt`, or `body` field.

---

## Category color mapping

Derive the exact category set from the user's data. Apply this palette:

| Category | Background | Text |
|---|---|---|
| Liturgical Life | `#7B1D2A` (maroon) | `rgba(246,241,232,.9)` |
| Parish Announcements | `#3B0F18` (apse) | `rgba(232,201,122,.85)` |
| Community Events | `#3D6B5E` (verdigris) | `rgba(246,241,232,.9)` |
| Youth & Education | `#5a3800` | `rgba(232,201,122,.9)` |
| Outreach & Charity | `#1e3d1e` | `rgba(246,241,232,.9)` |
| Diocese News | `#1a1f45` | `rgba(232,201,122,.9)` |
| Fundraising | `#3a2200` | `rgba(232,201,122,.9)` |
| Media & Press | `#7A6648` (stone) | `rgba(246,241,232,.9)` |

If categories in the data don't match, assign a new color from within the site palette. Create CSS classes in the pattern `.cat-tag.{slug}`.

---

## Decap CMS — `admin/config.yml`

Add a `news` collection. The file format is a JSON array (not individual files per article). This matches how `parish-events.json` works.

```yaml
- name: "news"
  label: "Parish News"
  file: "news.json"
  fields:
    - label: "Articles"
      name: "articles"
      widget: "list"
      fields:
        - {label: "ID", name: "id", widget: "string"}
        - {label: "Date", name: "date", widget: "datetime", format: "YYYY-MM-DD"}
        - {label: "Title", name: "title", widget: "string"}
        - {label: "Category", name: "category", widget: "select", options: [...derived from data...]}
        - {label: "Featured", name: "featured", widget: "boolean", default: false}
        - {label: "Pinned (Now Zone)", name: "pinned", widget: "boolean", default: false}
        - {label: "Excerpt", name: "excerpt", widget: "text"}
        - {label: "Body", name: "body", widget: "markdown", required: false}
        - {label: "Image", name: "image", widget: "image", required: false}
        - {label: "Author", name: "author", widget: "string", default: "Parish Office"}
        - {label: "Read Time", name: "readtime", widget: "string", required: false}
```

Fill in the `options` array under `category` with the exact category strings derived from the data.

---

## Files to touch

| File | Action |
|---|---|
| `news.html` | Rebuild entirely |
| `news.json` | Create at repo root |
| `admin/config.yml` | Add news collection |
| `news-mockup.html` | Delete after `news.html` is built and confirmed |

**Do not touch any other file.**

---

## Files to reference (read before writing)

| File | Why |
|---|---|
| `news-mockup.html` | The visual source of truth. Copy CSS and layout from here. |
| `about-liturgy.html` | Copy nav, mobile drawer, and footer markup from here exactly. |
| `parish-events.json` | Reference for how a JSON data file is structured at repo root. |
| `admin/config.yml` | Current Decap config — append the news collection, do not replace. |
| `CLAUDE.md` | Project rules — enforce all of them. |

---

## What the user will hand you

The user is providing real parish news entries — potentially hundreds of them. They may arrive as:
- A list of titles with dates and categories
- A spreadsheet or CSV-style dump
- A series of article texts
- A mix of the above

Your job is to parse whatever format they provide, structure it into the `news.json` schema above, assign categories based on content (confirming with the user if ambiguous), flag which articles should be `pinned` or `featured`, and then build everything.

Ask the user to confirm the category list and the pinned/featured selections before writing any HTML.

---

## What is already done

- Visual design: decided and mocked up in `news-mockup.html`
- Design direction: Tablet-style editorial, B+C hybrid (dark "Now" zone + editorial grid + archive accordion)
- Data model: finalized above
- Decap integration plan: finalized above
- Site design system: established in `CLAUDE.md` and used across all pages

## What is not done yet

- `news.json` (waiting for data)
- New `news.html`
- Decap config update
- Real article content
