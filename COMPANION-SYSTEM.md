# COMPANION-SYSTEM.md
## Saints Peter & Paul Orthodox Cathedral — Inquirer & Parishioner Companion System

All features in this document use localStorage only. No backend, no auth, no Supabase.
This is Phase 1. Supabase sync comes later in SUPABASE-SETUP.md.

Complete in the order listed. Each section depends on the previous.

---

## What Already Exists on prayers.html

Do NOT rebuild what is already working. The following is live and must be preserved:

- `PRAYERS` array with full prayer texts, rubric, sidebar explanations — complete
- `CATS` array — four categories: daily, occasional, rules, hymns
- `RULE_KEY = 'spp_my_rule'` — localStorage key for prayer rule (array of prayer IDs)
- `DONE_KEY` — localStorage key for mark-done state
- Mark Done buttons — `btn-complete` class, `toggleDone()` function
- Rule toggle buttons — `btn-rule-toggle` class, `toggleRule()` function
- My Rule modal — `rule-modal-overlay`, `openRuleModal()`, `closeRuleModal()`
- My Rule view — `handleRuleViewToggle()`, `applyRuleView()`
- Progress banner — `progress-banner`, `updateProgress()`
- Time-aware banner — `time-banner`, `showTimeBanner()`
- Dark mode — `toggleDark()`, `initDark()`, `spp_dark` localStorage key
- Sidebar explanations — `SIDEBAR` object, IntersectionObserver
- Chapter bar + floating pill nav — `jumpCat()`, `pillNav()`
- Repeat counter — SVG progress ring for Jesus Prayer etc

**What is missing and needs to be built:**
1. Prayer rule print document
2. Read/Reflect widget (on trackable pages — not prayers.html)
3. My Journey dashboard (`/my-journey.html`)
4. Journey summary print document
5. Export/import JSON backup
6. Feast day prayer suggestion (uses calendar-2026.json)
7. `inquirer-content.json` manifest file

---

## localStorage Keys — Complete Reference

Use these exact key names across all features. Never create new keys without listing them here.

```
spp_my_rule          Array of prayer IDs in the user's rule — already exists
spp_done_YYYY-MM-DD  Array of prayer IDs marked done today — already exists
spp_dark             '1' or '0' — dark mode preference — already exists
spp_journey_[key]    Object per trackable page — { completed, completedAt, notes }
spp_journey_exported ISO date string — last export date
spp_rule_name        String — user's chosen name for their prayer rule
spp_rule_begun       ISO date string — when they began their rule
spp_user_name        String — user's first name (optional, for printouts)
```

---

## SECTION 1 — `inquirer-content.json`

Create this file at the repo root. It is the manifest of all trackable pages.
The companion system reads this file to know what to track and how to display it.

**File location:** `/inquirer-content.json`

```json
{
  "version": "1.0",
  "sections": [
    {
      "id": "the-faith",
      "label": "The Faith",
      "pages": [
        {
          "key": "about-orthodoxy",
          "title": "About Orthodoxy",
          "url": "/about-orthodoxy",
          "description": "The ancient Christian faith, its history and teachings",
          "readTime": 12,
          "order": 1
        },
        {
          "key": "our-beliefs",
          "title": "Our Beliefs",
          "url": "/our-beliefs",
          "description": "What we confess and why it matters",
          "readTime": 8,
          "order": 2
        },
        {
          "key": "church-history",
          "title": "Church History",
          "url": "/church-history",
          "description": "A century of faith in Jersey City",
          "readTime": 10,
          "order": 3
        },
        {
          "key": "fasting",
          "title": "Fasting",
          "url": "/fasting",
          "description": "The history and practice of Orthodox fasting",
          "readTime": 10,
          "order": 4
        },
        {
          "key": "catechesis-history",
          "title": "Catechesis",
          "url": "/catechesis-history",
          "description": "Formation for those entering the Church",
          "readTime": 8,
          "order": 5
        }
      ]
    },
    {
      "id": "worship",
      "label": "Worship",
      "pages": [
        {
          "key": "divine-liturgy",
          "title": "About the Divine Liturgy",
          "url": "/divine-liturgy",
          "description": "History, structure, and meaning",
          "readTime": 20,
          "order": 6
        },
        {
          "key": "vespers",
          "title": "About Vespers",
          "url": "/vespers",
          "description": "The ancient evening prayer of the Church",
          "readTime": 15,
          "order": 7
        },
        {
          "key": "liturgy-history",
          "title": "History of the Liturgy",
          "url": "/liturgy-history",
          "description": "How the Divine Liturgy developed over the centuries",
          "readTime": 12,
          "order": 8
        }
      ]
    },
    {
      "id": "parish-life",
      "label": "Parish Life",
      "pages": [
        {
          "key": "our-parish",
          "title": "Our Parish",
          "url": "/our-parish",
          "description": "Our history, our people, our home",
          "readTime": 6,
          "order": 9
        },
        {
          "key": "catechesis",
          "title": "Catechesis Series",
          "url": "/catechesis",
          "description": "Recorded talks and study materials",
          "readTime": 5,
          "order": 10
        },
        {
          "key": "bible-study",
          "title": "Bible Study",
          "url": "/bible-study",
          "description": "Weekly verse-by-verse study, open to all",
          "readTime": 5,
          "order": 11
        }
      ]
    }
  ],
  "milestones": [
    { "pct": 0,   "label": "Your journey begins." },
    { "pct": 20,  "label": "You have entered the narthex." },
    { "pct": 40,  "label": "You stand before the iconostasis." },
    { "pct": 60,  "label": "You have kept vigil through the night." },
    { "pct": 80,  "label": "You approach the Holy Table." },
    { "pct": 100, "label": "You have completed the journey." }
  ]
}
```

**After creating the file, verify it is fetchable:**
```bash
# The file must be at repo root, not in _data/
ls -la inquirer-content.json
```

---

## SECTION 2 — Read/Reflect Widget

A persistent footer widget added to every trackable page.
Reads and writes to `spp_journey_[key]` in localStorage.

### 2a. Widget CSS

Add this CSS block to the `<style>` tag of every trackable page.
It must not conflict with existing styles — all classes are prefixed `jw-`.

```css
/* ── JOURNEY WIDGET ── */
.jw-bar{position:fixed;bottom:0;left:0;right:0;z-index:300;background:var(--apse);border-top:1px solid rgba(184,131,40,.25);padding:.75rem 2rem;display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;transform:translateY(0);transition:transform .3s cubic-bezier(.22,1,.36,1)}
.jw-bar.jw-hidden{transform:translateY(100%)}
.jw-label{font-family:var(--f-ui);font-size:.52rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(184,131,40,.65);white-space:nowrap;flex-shrink:0}
.jw-check-btn{font-family:var(--f-ui);font-size:.52rem;letter-spacing:.14em;text-transform:uppercase;background:none;border:1px solid rgba(246,241,232,.25);color:rgba(246,241,232,.75);padding:.38rem .85rem;cursor:pointer;transition:all .18s;white-space:nowrap;flex-shrink:0}
.jw-check-btn:hover{border-color:rgba(246,241,232,.6);color:rgba(246,241,232,1)}
.jw-check-btn.jw-done{background:rgba(61,107,94,.25);border-color:var(--verdigris);color:var(--verdigris)}
.jw-note-toggle{font-family:var(--f-ui);font-size:.52rem;letter-spacing:.14em;text-transform:uppercase;background:none;border:none;color:rgba(246,241,232,.45);padding:.38rem .65rem;cursor:pointer;transition:color .18s;white-space:nowrap;flex-shrink:0}
.jw-note-toggle:hover{color:rgba(246,241,232,.8)}
.jw-note-toggle.jw-has-note{color:rgba(184,131,40,.75)}
.jw-spacer{flex:1}
.jw-journey-link{font-family:var(--f-ui);font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(246,241,232,.3);text-decoration:none;transition:color .18s;white-space:nowrap;flex-shrink:0}
.jw-journey-link:hover{color:rgba(246,241,232,.65)}

/* Note drawer */
.jw-drawer{position:fixed;bottom:0;left:0;right:0;z-index:299;background:var(--apse);border-top:1px solid rgba(184,131,40,.2);padding:1.25rem 2rem 5rem;transform:translateY(100%);transition:transform .32s cubic-bezier(.22,1,.36,1)}
.jw-drawer.jw-open{transform:translateY(0)}
.jw-drawer-label{font-family:var(--f-ui);font-size:.52rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(184,131,40,.65);display:block;margin-bottom:.65rem}
.jw-textarea{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:rgba(246,241,232,.9);font-family:var(--f-body);font-size:1rem;line-height:1.65;padding:.75rem 1rem;resize:vertical;min-height:80px;max-height:180px;outline:none;transition:border-color .18s}
.jw-textarea:focus{border-color:rgba(184,131,40,.5)}
.jw-textarea::placeholder{color:rgba(246,241,232,.3)}
.jw-drawer-actions{display:flex;gap:.75rem;margin-top:.65rem;align-items:center}
.jw-save-btn{font-family:var(--f-ui);font-size:.5rem;letter-spacing:.14em;text-transform:uppercase;background:var(--maroon);border:none;color:var(--vellum);padding:.42rem 1rem;cursor:pointer;transition:background .18s}
.jw-save-btn:hover{background:var(--maroon-deep)}
.jw-close-btn{font-family:var(--f-ui);font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;background:none;border:none;color:rgba(246,241,232,.4);cursor:pointer;transition:color .18s;padding:.42rem .5rem}
.jw-close-btn:hover{color:rgba(246,241,232,.75)}
.jw-saved-msg{font-family:var(--f-body);font-style:italic;font-size:.85rem;color:rgba(61,107,94,.85);opacity:0;transition:opacity .3s}
.jw-saved-msg.jw-show{opacity:1}

@media(max-width:680px){
  .jw-bar{padding:.65rem 1.25rem;gap:.75rem}
  .jw-journey-link{display:none}
  .jw-drawer{padding:1rem 1.25rem 5rem}
}
```

### 2b. Widget HTML

Add this HTML immediately before the closing `</body>` tag on every trackable page.
Replace `PAGE_KEY` with the page's key from `inquirer-content.json`.
Replace `PAGE_TITLE` with the page's display title.

```html
<!-- ── JOURNEY WIDGET ── -->
<div class="jw-drawer" id="jw-drawer">
  <span class="jw-drawer-label">My Reflection — PAGE_TITLE</span>
  <textarea class="jw-textarea" id="jw-textarea" placeholder="What struck you on this page? Any questions that arose? Write as little or as much as you like."></textarea>
  <div class="jw-drawer-actions">
    <button class="jw-save-btn" onclick="jwSaveNote()">Save Note</button>
    <button class="jw-close-btn" onclick="jwCloseDrawer()">Close</button>
    <span class="jw-saved-msg" id="jw-saved-msg">Saved</span>
  </div>
</div>

<div class="jw-bar" id="jw-bar">
  <span class="jw-label">My Journey</span>
  <button class="jw-check-btn" id="jw-check-btn" onclick="jwToggleDone()">Mark as Read</button>
  <button class="jw-note-toggle" id="jw-note-toggle" onclick="jwToggleDrawer()">Add a Note</button>
  <div class="jw-spacer"></div>
  <a href="/my-journey" class="jw-journey-link">View My Journey &rarr;</a>
</div>
```

### 2c. Widget JS

Add this script block immediately before the `<!-- ── JOURNEY WIDGET ──  -->` HTML above.
Replace `'PAGE_KEY'` with the page's key string.

```html
<script>
(function() {
  var PAGE_KEY = 'PAGE_KEY'; // e.g. 'about-orthodoxy'
  var STORE_KEY = 'spp_journey_' + PAGE_KEY;

  function getState() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
  }
  function saveState(s) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {}
  }

  function jwInit() {
    var s = getState();
    var btn = document.getElementById('jw-check-btn');
    var noteToggle = document.getElementById('jw-note-toggle');
    var textarea = document.getElementById('jw-textarea');
    if (!btn) return;

    if (s.completed) {
      btn.classList.add('jw-done');
      btn.textContent = '\u2713 Read';
    }
    if (s.notes && s.notes.trim()) {
      noteToggle.classList.add('jw-has-note');
      noteToggle.textContent = 'My Note \u2713';
      if (textarea) textarea.value = s.notes;
    }
  }

  window.jwToggleDone = function() {
    var s = getState();
    s.completed = !s.completed;
    if (s.completed) s.completedAt = new Date().toISOString();
    else delete s.completedAt;
    saveState(s);
    var btn = document.getElementById('jw-check-btn');
    btn.classList.toggle('jw-done', s.completed);
    btn.textContent = s.completed ? '\u2713 Read' : 'Mark as Read';
  };

  window.jwToggleDrawer = function() {
    var drawer = document.getElementById('jw-drawer');
    var bar = document.getElementById('jw-bar');
    var isOpen = drawer.classList.contains('jw-open');
    drawer.classList.toggle('jw-open', !isOpen);
    bar.classList.toggle('jw-hidden', !isOpen);
    if (!isOpen) {
      var textarea = document.getElementById('jw-textarea');
      if (textarea) textarea.focus();
    }
  };

  window.jwCloseDrawer = function() {
    document.getElementById('jw-drawer').classList.remove('jw-open');
    document.getElementById('jw-bar').classList.remove('jw-hidden');
  };

  window.jwSaveNote = function() {
    var textarea = document.getElementById('jw-textarea');
    var noteToggle = document.getElementById('jw-note-toggle');
    var savedMsg = document.getElementById('jw-saved-msg');
    if (!textarea) return;
    var s = getState();
    s.notes = textarea.value;
    saveState(s);
    var hasNote = s.notes && s.notes.trim();
    noteToggle.classList.toggle('jw-has-note', !!hasNote);
    noteToggle.textContent = hasNote ? 'My Note \u2713' : 'Add a Note';
    if (savedMsg) {
      savedMsg.classList.add('jw-show');
      setTimeout(function() { savedMsg.classList.remove('jw-show'); }, 2000);
    }
  };

  // Auto-save note on textarea blur
  document.addEventListener('DOMContentLoaded', function() {
    jwInit();
    var textarea = document.getElementById('jw-textarea');
    if (textarea) {
      textarea.addEventListener('blur', function() {
        if (textarea.value !== (getState().notes || '')) window.jwSaveNote();
      });
    }
  });
})();
</script>
```

### 2d. Pages to Add the Widget To

Add the widget to every page in `inquirer-content.json`.
Use the correct `PAGE_KEY` and `PAGE_TITLE` for each.

| File | PAGE_KEY | PAGE_TITLE |
|---|---|---|
| `about-orthodoxy.html` | `about-orthodoxy` | About Orthodoxy |
| `our-beliefs.html` | `our-beliefs` | Our Beliefs |
| `church-history.html` | `church-history` | Church History |
| `fasting.html` | `fasting` | Fasting |
| `catechesis-history.html` | `catechesis-history` | Catechesis |
| `divine-liturgy.html` | `divine-liturgy` | About the Divine Liturgy |
| `vespers.html` | `vespers` | About Vespers |
| `liturgy-history.html` | `liturgy-history` | History of the Liturgy |
| `our-parish.html` | `our-parish` | Our Parish |
| `catechesis.html` | `catechesis` | Catechesis Series |
| `bible-study.html` | `bible-study` | Bible Study |

**Verify after adding to each page:**
- Widget bar appears fixed at bottom
- Click "Mark as Read" — button turns green with checkmark
- Reload page — state persists (still shows as read)
- Click "Add a Note" — drawer slides up from bottom
- Type a note, click Save — "Saved" confirmation appears
- Reload page — note text persists in textarea
- "View My Journey →" link points to `/my-journey`

**Commit after every 3-4 pages:**
```bash
git add -A
git commit -m "Add journey widget to [page names]"
```

---

## SECTION 3 — Prayer Rule Print Document

Adds a "Print My Rule" button to the existing prayers page.
On click, opens a print-optimized overlay with the full text of every
prayer in the user's rule, formatted for printing or saving as PDF.

### 3a. Personalization Modal CSS + HTML

Add to `prayers.html` inside `<style>`:

```css
/* ── PRINT PERSONALIZATION MODAL ── */
.print-modal-overlay{display:none;position:fixed;inset:0;background:rgba(21,8,4,.75);z-index:500;align-items:center;justify-content:center;padding:1.5rem}
.print-modal-overlay.open{display:flex}
.print-modal{background:var(--vellum);max-width:460px;width:100%;padding:2.5rem}
.print-modal-title{font-family:var(--f-display);font-weight:300;font-size:1.8rem;color:var(--apse);margin-bottom:.25rem}
.print-modal-sub{font-family:var(--f-display);font-style:italic;font-size:1rem;color:var(--stone);display:block;margin-bottom:1.75rem}
.print-modal-field{margin-bottom:1.1rem}
.print-modal-label{font-family:var(--f-ui);font-size:.52rem;letter-spacing:.14em;text-transform:uppercase;color:var(--stone);display:block;margin-bottom:.4rem}
.print-modal-input{width:100%;padding:.65rem .85rem;border:1px solid rgba(59,15,24,.2);background:white;font-family:var(--f-body);font-size:1rem;color:var(--ink);outline:none}
.print-modal-input:focus{border-color:var(--maroon)}
.print-modal-actions{display:flex;gap:.75rem;margin-top:1.5rem;flex-wrap:wrap}
.print-modal-btn{font-family:var(--f-ui);font-size:.52rem;letter-spacing:.14em;text-transform:uppercase;padding:.65rem 1.25rem;cursor:pointer;border:none;flex:1}
.print-modal-btn.primary{background:var(--maroon);color:var(--vellum)}
.print-modal-btn.secondary{background:none;border:1px solid rgba(59,15,24,.2);color:var(--stone)}
```

Add this HTML just before the closing `</body>` tag in `prayers.html`:

```html
<!-- ── PRINT PERSONALIZATION MODAL ── -->
<div class="print-modal-overlay" id="print-modal-overlay" onclick="closePrintModal(event)">
  <div class="print-modal">
    <div class="print-modal-title">Print My Rule</div>
    <span class="print-modal-sub">Personalize your prayer rule document</span>
    <div class="print-modal-field">
      <label class="print-modal-label">Your Name (optional)</label>
      <input class="print-modal-input" type="text" id="print-name" placeholder="e.g. Catherine">
    </div>
    <div class="print-modal-field">
      <label class="print-modal-label">Beginning This Rule</label>
      <input class="print-modal-input" type="text" id="print-date" placeholder="e.g. April 2026">
    </div>
    <div class="print-modal-actions">
      <button class="print-modal-btn primary" onclick="generatePrint()">Generate Document</button>
      <button class="print-modal-btn secondary" onclick="closePrintModal()">Cancel</button>
    </div>
  </div>
</div>
```

### 3b. Print Button in Chapter Bar

In `prayers.html`, find the chapter bar's `.cbar-right` div.
Add a Print Rule button alongside the existing My Rule button:

```html
<button class="cbar-rule-btn" onclick="openPrintModal()" id="print-rule-btn" title="Print My Rule">&#128438; Print</button>
```

Place it immediately after the existing `cbar-rule-btn` (My Rule button).

### 3c. Print JS

Add this function block to the existing `<script>` section in `prayers.html`:

```javascript
// ─────────────────────────────────────────────
//  PRAYER RULE PRINT DOCUMENT
// ─────────────────────────────────────────────
function openPrintModal() {
  var rule = getRule();
  if (rule.length === 0) {
    alert('Add some prayers to My Rule first, then print.');
    return;
  }
  // Pre-fill saved name/date if available
  try {
    var savedName = localStorage.getItem('spp_rule_name') || '';
    var savedDate = localStorage.getItem('spp_rule_begun') || '';
    document.getElementById('print-name').value = savedName;
    document.getElementById('print-date').value = savedDate;
  } catch {}
  document.getElementById('print-modal-overlay').classList.add('open');
}

function closePrintModal(e) {
  if (!e || e.target === document.getElementById('print-modal-overlay')) {
    document.getElementById('print-modal-overlay').classList.remove('open');
  }
}

function generatePrint() {
  var name = document.getElementById('print-name').value.trim();
  var date = document.getElementById('print-date').value.trim();

  // Save for next time
  try {
    localStorage.setItem('spp_rule_name', name);
    localStorage.setItem('spp_rule_begun', date);
  } catch {}

  var rule = getRule();
  var rulePrayers = rule.map(function(id) {
    return PRAYERS.find(function(p) { return p.id === id; });
  }).filter(Boolean);

  // Build the print HTML
  var html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="color-scheme" content="light only">
<title>My Rule of Prayer${name ? ' — ' + name : ''}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Cinzel:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{--vellum:#F6F1E8;--maroon:#7B1D2A;--apse:#3B0F18;--gold:#B88328;--stone:#7A6648;--ink:#2C1F16;}
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{color-scheme:light only;}
  body{background:var(--vellum);color:var(--ink);font-family:'EB Garamond',Georgia,serif;font-size:12pt;line-height:1.75;padding:0;}
  .page{max-width:680px;margin:0 auto;padding:2.5cm 2cm;}
  .header{text-align:center;padding-bottom:1.5rem;border-bottom:1px solid rgba(123,29,42,.25);margin-bottom:2rem;}
  .header-parish{font-family:'Cinzel',serif;font-size:7pt;letter-spacing:.2em;text-transform:uppercase;color:var(--stone);display:block;margin-bottom:.75rem;}
  .header-title{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:26pt;color:var(--apse);line-height:1.05;margin-bottom:.2rem;}
  .header-name{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13pt;color:var(--stone);}
  .rubric-block{background:rgba(184,131,40,.07);border-left:3px solid var(--gold);padding:.9rem 1.1rem;margin-bottom:2rem;}
  .rubric-label{font-family:'Cinzel',serif;font-size:6.5pt;letter-spacing:.2em;text-transform:uppercase;color:var(--stone);display:block;margin-bottom:.35rem;}
  .rubric-text{font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:10pt;color:var(--ink);line-height:1.65;}
  .prayer{margin-bottom:2rem;padding-bottom:2rem;border-bottom:1px solid rgba(123,29,42,.12);}
  .prayer:last-child{border-bottom:none;}
  .prayer-title{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:14pt;color:var(--maroon);margin-bottom:.3rem;line-height:1.2;}
  .prayer-rubric{font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:10pt;color:var(--stone);margin-bottom:.6rem;}
  .prayer-text{font-family:'EB Garamond',Georgia,serif;font-size:11pt;line-height:1.82;color:var(--ink);}
  .prayer-text p{margin-bottom:.6rem;}
  .prayer-text p:last-child{margin-bottom:0;}
  .group-item{margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid rgba(123,29,42,.07);}
  .group-item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
  .group-item-name{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:12pt;color:var(--maroon);margin-bottom:.25rem;}
  .blessing{margin-top:3rem;padding-top:1.5rem;border-top:1px solid rgba(123,29,42,.18);display:flex;justify-content:space-between;align-items:flex-end;}
  .blessing-text{font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:9.5pt;color:var(--stone);}
  .sig-line{text-align:center;width:180px;}
  .sig-line-rule{border-top:1px solid rgba(123,29,42,.3);margin-bottom:.3rem;}
  .sig-line-label{font-family:'Cinzel',serif;font-size:6pt;letter-spacing:.12em;text-transform:uppercase;color:var(--stone);}
  @media print{body{background:white;}@page{margin:2cm 1.8cm;}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <span class="header-parish">Saints Peter &amp; Paul Orthodox Cathedral &middot; Jersey City, NJ</span>
    <div class="header-title">A Rule of Prayer</div>
    ${name || date ? `<div class="header-name">${name ? 'For ' + name : ''}${name && date ? ' &middot; ' : ''}${date ? 'begun ' + date : ''}</div>` : ''}
  </div>

  <div class="rubric-block">
    <span class="rubric-label">Before beginning</span>
    <div class="rubric-text">Stand facing east if possible. Make the sign of the cross three times. Light a candle before your icon if you are able. Still your mind and heart before you begin to speak.</div>
  </div>`;

  rulePrayers.forEach(function(p) {
    html += `<div class="prayer">`;
    html += `<div class="prayer-title">${p.title}</div>`;
    if (p.rubric) html += `<div class="prayer-rubric">${p.rubric}</div>`;
    if (p.isGroup && p.prayers) {
      p.prayers.forEach(function(gp) {
        html += `<div class="group-item">`;
        html += `<div class="group-item-name">${gp.name}</div>`;
        if (gp.rubric) html += `<div class="prayer-rubric">${gp.rubric}</div>`;
        var ptext = gp.text.split('\n\n').map(function(para) {
          return '<p>' + para.trim().replace(/\n/g, '<br>') + '</p>';
        }).join('');
        html += `<div class="prayer-text">${ptext}</div>`;
        html += `</div>`;
      });
    } else if (p.text) {
      var ptext = p.text.split('\n\n').map(function(para) {
        return '<p>' + para.trim().replace(/\n/g, '<br>') + '</p>';
      }).join('');
      html += `<div class="prayer-text">${ptext}</div>`;
    }
    html += `</div>`;
  });

  html += `
  <div class="blessing">
    <div class="blessing-text">This rule carries the blessing of:</div>
    <div class="sig-line">
      <div class="sig-line-rule"></div>
      <div class="sig-line-label">Fr. Solomon Longo</div>
    </div>
  </div>
</div>
</body>
</html>`;

  // Open in new window and print
  var win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(function() { win.print(); }, 600);

  document.getElementById('print-modal-overlay').classList.remove('open');
}
```

**Verify:**
- "Print" button appears in chapter bar
- Click with empty rule — shows alert
- Add prayers to rule, click Print — modal opens
- Enter name and date, click Generate Document — new window opens with formatted document
- Document shows parish header, rubric block, full prayer texts, blessing line
- Window print dialog appears automatically
- Closing and reopening modal — name and date are remembered

---

## SECTION 4 — Feast Day Prayer Suggestion

Adds a contextual suggestion to the prayers page sidebar when today
is a feast day, nudging the user to add that saint's troparion.
Uses the existing `calendar-2026.json` via the `getCalendar()` function
already available on pages that load `index-scripts.js`.

**Note:** `prayers.html` does not load `index-scripts.js`.
Add a minimal calendar fetch directly to the prayers page script instead.

Add this function to the existing `<script>` block in `prayers.html`,
after `initDark()`:

```javascript
// ─────────────────────────────────────────────
//  FEAST DAY SUGGESTION
// ─────────────────────────────────────────────
async function checkFeastDay() {
  try {
    var today = new Date();
    var y = today.getFullYear();
    var m = String(today.getMonth() + 1).padStart(2, '0');
    var d = String(today.getDate()).padStart(2, '0');
    var key = y + '-' + m + '-' + d;
    var resp = await fetch('/calendar-2026.json');
    var cal = await resp.json();
    if (!cal || !cal.days || !cal.days[key]) return;
    var day = cal.days[key];
    var level = day.feastLevel || 0;
    if (level < 4) return; // only suggest on notable feasts (level 4+)
    var feast = day.feast || '';
    var saint = day.saint || '';
    if (!feast && !saint) return;
    var name = feast || saint;
    var el = document.getElementById('feast-suggestion');
    if (!el) return;
    el.innerHTML = `<span class="sb-tag">Today &mdash; Feast Day</span>
      <div class="sb-rule"></div>
      <span class="sb-head">${name}</span>
      <p class="sb-body">Today the Church commemorates ${name}. Consider adding the troparion for this feast to your rule for today.</p>`;
    el.style.display = 'block';
  } catch {}
}
```

In `prayers.html`, add a `<div id="feast-suggestion" style="display:none">` 
to the sidebar section, immediately before the existing default sidebar content.

Call `checkFeastDay()` in the `DOMContentLoaded` handler alongside the other init calls.

---

## SECTION 5 — My Journey Dashboard (`/my-journey.html`)

Create a new file `my-journey.html` at the repo root.
This page reads `inquirer-content.json` and all `spp_journey_*` localStorage keys
to render the user's progress, reflections, and generate the summary printout.

### 5a. Page Structure Overview

The page has four sections:
1. **Progress arc** — percentage complete with milestone language
2. **Article list** — all trackable pages, checked or unchecked, with reflection snippets
3. **Actions bar** — Generate Summary, Export Backup, Import Backup
4. **Print overlay** — the generated journey summary document

### 5b. Full Page HTML

Create `/my-journey.html` with this complete content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only">
<title>My Journey &middot; Saints Peter &amp; Paul Orthodox Cathedral</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Cinzel:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --vellum:#F6F1E8;--vellum-mid:#EDE7DC;
  --maroon:#7B1D2A;--maroon-deep:#5C1520;
  --gold:#B88328;--stone:#7A6648;--ink:#2C1F16;
  --apse:#3B0F18;--verdigris:#3D6B5E;
  --f-display:'Cormorant Garamond',Georgia,serif;
  --f-body:'EB Garamond',Georgia,serif;
  --f-ui:'Cinzel',Georgia,serif;
  --rule-faint:1px solid rgba(123,29,42,.14);
  --rule-hair:1px solid rgba(123,29,42,.07);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{color-scheme:light only;scroll-behavior:smooth;}
body{background:var(--vellum);color:var(--ink);font-family:var(--f-body);font-size:18px;line-height:1.75;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
a{color:inherit;text-decoration:none;}

/* PAGE HERO */
.page-hero{padding-top:60px;background:linear-gradient(to right,rgba(59,15,24,.92) 0%,rgba(59,15,24,.72) 55%,rgba(59,15,24,.38) 100%),url('https://picsum.photos/id/1040/1600/500') center/cover no-repeat;background-color:var(--apse);min-height:280px;display:flex;align-items:center;}
.page-hero-inner{max-width:1100px;margin:0 auto;padding:4rem 2rem 3rem;width:100%;}
.page-title{font-family:var(--f-display);font-weight:300;font-size:clamp(2.2rem,4vw,3.5rem);line-height:.95;color:#fff;margin:.4rem 0 .5rem;}
.breadcrumb{font-family:var(--f-ui);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:1rem;}
.breadcrumb a{color:rgba(232,201,122,.65);}
.page-sub{font-family:var(--f-display);font-style:italic;font-size:1.1rem;color:rgba(255,255,255,.55);}

/* MAIN LAYOUT */
.journey-outer{max-width:900px;margin:0 auto;padding:3.5rem 2rem 6rem;}

/* PROGRESS RING */
.progress-section{text-align:center;padding:3rem 0 2.5rem;border-bottom:var(--rule-faint);margin-bottom:2.5rem;}
.progress-ring-wrap{position:relative;width:120px;height:120px;margin:0 auto 1.5rem;}
.progress-ring-wrap svg{transform:rotate(-90deg);}
.ring-track{fill:none;stroke:rgba(123,29,42,.1);stroke-width:8;}
.ring-fill{fill:none;stroke:var(--maroon);stroke-width:8;stroke-linecap:round;transition:stroke-dashoffset .6s cubic-bezier(.22,1,.36,1);}
.ring-label{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.ring-pct{font-family:var(--f-display);font-weight:300;font-size:2rem;color:var(--maroon);line-height:1;}
.ring-pct-label{font-family:var(--f-ui);font-size:.46rem;letter-spacing:.14em;text-transform:uppercase;color:var(--stone);}
.milestone-text{font-family:var(--f-display);font-style:italic;font-size:1.25rem;color:var(--apse);margin-bottom:.75rem;}
.progress-sub{font-family:var(--f-body);font-size:.9rem;color:var(--stone);}

/* SECTION HEADS */
.section-label{font-family:var(--f-ui);font-size:.52rem;letter-spacing:.2em;text-transform:uppercase;color:var(--stone);display:block;margin-bottom:.4rem;}
.section-title{font-family:var(--f-display);font-weight:300;font-size:1.6rem;color:var(--apse);margin-bottom:1.5rem;}
.section-rule{height:1px;background:rgba(123,29,42,.12);margin:2.5rem 0;}

/* ARTICLE CARDS */
.section-group{margin-bottom:2rem;}
.section-group-head{font-family:var(--f-ui);font-size:.5rem;letter-spacing:.18em;text-transform:uppercase;color:var(--maroon);display:block;padding-bottom:.5rem;border-bottom:1px solid rgba(123,29,42,.15);margin-bottom:.85rem;}
.article-row{display:flex;align-items:flex-start;gap:1rem;padding:.9rem 0;border-bottom:var(--rule-hair);}
.article-row:last-child{border-bottom:none;}
.article-check{width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(123,29,42,.3);flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:.15rem;}
.article-check.done{background:var(--maroon);border-color:var(--maroon);color:white;font-size:.7rem;}
.article-main{flex:1;min-width:0;}
.article-title{font-family:var(--f-display);font-weight:500;font-size:1.05rem;color:var(--apse);margin-bottom:.1rem;}
.article-title a{transition:color .14s;}
.article-title a:hover{color:var(--maroon);}
.article-desc{font-family:var(--f-body);font-size:.88rem;color:var(--stone);margin-bottom:.3rem;}
.article-note{font-family:var(--f-body);font-style:italic;font-size:.85rem;color:var(--verdigris);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.article-meta{font-family:var(--f-ui);font-size:.46rem;letter-spacing:.1em;text-transform:uppercase;color:var(--stone);text-align:right;flex-shrink:0;}
.article-read-link{font-family:var(--f-ui);font-size:.48rem;letter-spacing:.1em;text-transform:uppercase;color:var(--maroon);}

/* NEXT SUGGESTION */
.next-suggestion{background:var(--vellum-mid);border-left:3px solid var(--gold);padding:1.1rem 1.4rem;margin:1.5rem 0 2rem;}
.next-label{font-family:var(--f-ui);font-size:.5rem;letter-spacing:.16em;text-transform:uppercase;color:var(--stone);display:block;margin-bottom:.3rem;}
.next-text{font-family:var(--f-display);font-size:1.1rem;color:var(--apse);}
.next-text a{color:var(--maroon);}

/* ACTIONS */
.actions-row{display:flex;gap:1rem;flex-wrap:wrap;margin:2.5rem 0;}
.action-btn{font-family:var(--f-ui);font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;padding:.75rem 1.4rem;cursor:pointer;border:none;transition:all .2s;white-space:nowrap;}
.action-btn.primary{background:var(--maroon);color:var(--vellum);}
.action-btn.primary:hover{background:var(--maroon-deep);}
.action-btn.secondary{background:none;border:1px solid rgba(123,29,42,.3);color:var(--maroon);}
.action-btn.secondary:hover{background:var(--maroon);color:var(--vellum);}
.action-btn.ghost{background:none;border:1px solid rgba(59,15,24,.15);color:var(--stone);}
.action-btn.ghost:hover{border-color:rgba(59,15,24,.35);color:var(--ink);}

/* EMPTY STATE */
.empty-state{text-align:center;padding:4rem 2rem;border:1px solid var(--rule-faint);}
.empty-state-title{font-family:var(--f-display);font-weight:300;font-size:1.8rem;color:var(--apse);margin-bottom:.5rem;}
.empty-state-body{font-family:var(--f-body);font-style:italic;font-size:1rem;color:var(--stone);margin-bottom:2rem;}

/* LOADING */
.loading{font-family:var(--f-display);font-style:italic;color:var(--stone);text-align:center;padding:3rem;}

@media(max-width:680px){
  .journey-outer{padding:2.5rem 1.25rem 5rem;}
  .actions-row{flex-direction:column;}
  .action-btn{text-align:center;}
}
</style>
</head>
<body>

<!-- NAV: paste canonical nav block here -->

<!-- HERO -->
<div class="page-hero">
  <div class="page-hero-inner">
    <p class="breadcrumb"><a href="/">Home</a> &middot; My Journey</p>
    <h1 class="page-title">My <em>Journey</em></h1>
    <p class="page-sub">Your path through the Faith, at your own pace</p>
  </div>
</div>

<!-- MAIN -->
<div class="journey-outer">

  <!-- PROGRESS -->
  <div class="progress-section" id="progress-section">
    <div class="progress-ring-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle class="ring-track" cx="60" cy="60" r="52"/>
        <circle class="ring-fill" cx="60" cy="60" r="52" id="ring-fill"
          stroke-dasharray="326.73" stroke-dashoffset="326.73"/>
      </svg>
      <div class="ring-label">
        <span class="ring-pct" id="ring-pct">0%</span>
        <span class="ring-pct-label">Complete</span>
      </div>
    </div>
    <div class="milestone-text" id="milestone-text">Your journey begins.</div>
    <div class="progress-sub" id="progress-sub">Start reading to track your progress.</div>
  </div>

  <!-- NEXT SUGGESTION -->
  <div class="next-suggestion" id="next-suggestion" style="display:none">
    <span class="next-label">Where to Go Next</span>
    <div class="next-text" id="next-text"></div>
  </div>

  <!-- ARTICLE LIST -->
  <div id="article-list">
    <div class="loading">Loading your journey&hellip;</div>
  </div>

  <!-- ACTIONS -->
  <div class="section-rule"></div>
  <div class="actions-row">
    <button class="action-btn primary" onclick="openSummaryPrint()">Generate My Summary &rarr;</button>
    <button class="action-btn secondary" onclick="emailSummary()">Email to Fr. Solomon</button>
    <button class="action-btn ghost" onclick="exportBackup()">Export Backup &darr;</button>
    <label class="action-btn ghost" style="cursor:pointer">Import Backup &uarr;<input type="file" accept=".json" onchange="importBackup(event)" style="display:none"></label>
  </div>
  <p style="font-family:var(--f-body);font-style:italic;font-size:.82rem;color:var(--stone);margin-top:.5rem">Your notes and progress are saved in this browser. Use Export Backup to save a copy you can restore on any device.</p>

</div>

<!-- PRINT SUMMARY MODAL -->
<div id="summary-modal-overlay" style="display:none;position:fixed;inset:0;background:rgba(21,8,4,.75);z-index:500;align-items:center;justify-content:center;padding:1.5rem;" onclick="closeSummaryModal(event)">
  <div style="background:var(--vellum);max-width:460px;width:100%;padding:2.5rem;">
    <div style="font-family:var(--f-display);font-weight:300;font-size:1.8rem;color:var(--apse);margin-bottom:.25rem;">Generate My Summary</div>
    <span style="font-family:var(--f-display);font-style:italic;font-size:1rem;color:var(--stone);display:block;margin-bottom:1.75rem;">For sharing with Fr. Solomon</span>
    <div style="margin-bottom:1.1rem;">
      <label style="font-family:var(--f-ui);font-size:.52rem;letter-spacing:.14em;text-transform:uppercase;color:var(--stone);display:block;margin-bottom:.4rem;">Your Name (optional)</label>
      <input id="summary-name" type="text" placeholder="e.g. Thomas" style="width:100%;padding:.65rem .85rem;border:1px solid rgba(59,15,24,.2);background:white;font-family:var(--f-body);font-size:1rem;color:var(--ink);outline:none;">
    </div>
    <div style="display:flex;gap:.75rem;margin-top:1.5rem;">
      <button onclick="generateSummary()" style="font-family:var(--f-ui);font-size:.52rem;letter-spacing:.14em;text-transform:uppercase;padding:.65rem 1.25rem;cursor:pointer;border:none;background:var(--maroon);color:var(--vellum);flex:1;">Generate Document</button>
      <button onclick="closeSummaryModal()" style="font-family:var(--f-ui);font-size:.52rem;letter-spacing:.14em;text-transform:uppercase;padding:.65rem 1rem;cursor:pointer;border:1px solid rgba(59,15,24,.2);background:none;color:var(--stone);">Cancel</button>
    </div>
  </div>
</div>

<!-- FOOTER: paste canonical footer Version B here -->

<script>
var MANIFEST = null;

// ── LOAD MANIFEST ──
async function loadManifest() {
  try {
    var resp = await fetch('/inquirer-content.json');
    MANIFEST = await resp.json();
    render();
  } catch {
    document.getElementById('article-list').innerHTML =
      '<p style="color:var(--stone);font-style:italic;text-align:center;padding:2rem">Could not load journey content. Please try again.</p>';
  }
}

// ── GET PAGE STATE ──
function getPageState(key) {
  try { return JSON.parse(localStorage.getItem('spp_journey_' + key) || '{}'); } catch { return {}; }
}

// ── RENDER ──
function render() {
  if (!MANIFEST) return;
  var allPages = [];
  MANIFEST.sections.forEach(function(s) { s.pages.forEach(function(p) { allPages.push(p); }); });
  var total = allPages.length;
  var completed = allPages.filter(function(p) { return getPageState(p.key).completed; }).length;
  var pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Progress ring
  var circ = 326.73;
  var offset = circ - (pct / 100) * circ;
  document.getElementById('ring-fill').style.strokeDashoffset = offset;
  document.getElementById('ring-pct').textContent = pct + '%';
  document.getElementById('progress-sub').textContent = completed + ' of ' + total + ' articles read';

  // Milestone
  var milestones = MANIFEST.milestones || [];
  var milestone = milestones[0];
  for (var i = 0; i < milestones.length; i++) {
    if (pct >= milestones[i].pct) milestone = milestones[i];
  }
  document.getElementById('milestone-text').textContent = milestone.label;

  // Next suggestion
  var nextPage = allPages.find(function(p) { return !getPageState(p.key).completed; });
  if (nextPage) {
    document.getElementById('next-suggestion').style.display = 'block';
    document.getElementById('next-text').innerHTML = 'Continue with <a href="' + nextPage.url + '">' + nextPage.title + '</a> &rarr;';
  }

  // Article list
  var html = '';
  MANIFEST.sections.forEach(function(section) {
    html += '<div class="section-group">';
    html += '<span class="section-group-head">' + section.label + '</span>';
    section.pages.forEach(function(page) {
      var state = getPageState(page.key);
      var isDone = !!state.completed;
      var hasNote = state.notes && state.notes.trim();
      html += '<div class="article-row">';
      html += '<div class="article-check' + (isDone ? ' done' : '') + '">' + (isDone ? '&#10003;' : '') + '</div>';
      html += '<div class="article-main">';
      html += '<div class="article-title"><a href="' + page.url + '">' + page.title + '</a></div>';
      html += '<div class="article-desc">' + page.description + '</div>';
      if (hasNote) html += '<div class="article-note">' + escHtml(state.notes) + '</div>';
      html += '</div>';
      html += '<div class="article-meta">';
      if (isDone && state.completedAt) {
        var d = new Date(state.completedAt);
        html += formatDate(d) + '<br>';
      }
      if (!isDone) html += '<a href="' + page.url + '" class="article-read-link">Read &rarr;</a>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
  });

  if (completed === 0) {
    html = '<div class="empty-state"><div class="empty-state-title">Your journey awaits.</div><div class="empty-state-body">Begin reading any article and mark it complete. Your progress will appear here.</div><a href="/about-orthodoxy" style="font-family:var(--f-ui);font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;padding:.75rem 1.4rem;background:var(--maroon);color:var(--vellum);display:inline-block;">Start with About Orthodoxy &rarr;</a></div>';
  }

  document.getElementById('article-list').innerHTML = html;
}

// ── SUMMARY PRINT ──
function openSummaryPrint() {
  try { document.getElementById('summary-name').value = localStorage.getItem('spp_user_name') || ''; } catch {}
  var overlay = document.getElementById('summary-modal-overlay');
  overlay.style.display = 'flex';
}

function closeSummaryModal(e) {
  if (!e || e.target === document.getElementById('summary-modal-overlay')) {
    document.getElementById('summary-modal-overlay').style.display = 'none';
  }
}

function generateSummary() {
  var name = document.getElementById('summary-name').value.trim();
  try { localStorage.setItem('spp_user_name', name); } catch {}
  if (!MANIFEST) return;

  var allPages = [];
  MANIFEST.sections.forEach(function(s) { s.pages.forEach(function(p) { allPages.push(p); }); });
  var completed = allPages.filter(function(p) { return getPageState(p.key).completed; });
  var today = formatDate(new Date());

  var html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="color-scheme" content="light only">';
  html += '<title>My Journey in Faith' + (name ? ' — ' + name : '') + '</title>';
  html += '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Cinzel:wght@400;500;600&display=swap" rel="stylesheet">';
  html += '<style>:root{--vellum:#F6F1E8;--maroon:#7B1D2A;--apse:#3B0F18;--gold:#B88328;--stone:#7A6648;--ink:#2C1F16;}';
  html += '*{box-sizing:border-box;margin:0;padding:0;}html,body{color-scheme:light only;}';
  html += 'body{background:var(--vellum);color:var(--ink);font-family:\'EB Garamond\',Georgia,serif;font-size:11.5pt;line-height:1.78;padding:0;}';
  html += '.page{max-width:680px;margin:0 auto;padding:2.5cm 2cm;}';
  html += '.header{text-align:center;padding-bottom:1.5rem;border-bottom:1px solid rgba(123,29,42,.25);margin-bottom:2rem;}';
  html += '.header-parish{font-family:\'Cinzel\',serif;font-size:7pt;letter-spacing:.2em;text-transform:uppercase;color:var(--stone);display:block;margin-bottom:.75rem;}';
  html += '.header-title{font-family:\'Cormorant Garamond\',serif;font-weight:300;font-size:26pt;color:var(--apse);line-height:1.05;margin-bottom:.2rem;}';
  html += '.header-name{font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:13pt;color:var(--stone);}';
  html += '.entry{margin-bottom:1.75rem;padding-bottom:1.75rem;border-bottom:1px solid rgba(123,29,42,.1);}';
  html += '.entry:last-child{border-bottom:none;}';
  html += '.entry-title{font-family:\'Cormorant Garamond\',serif;font-weight:600;font-size:13pt;color:var(--maroon);margin-bottom:.2rem;}';
  html += '.entry-date{font-family:\'Cinzel\',serif;font-size:6.5pt;letter-spacing:.12em;text-transform:uppercase;color:var(--stone);margin-bottom:.5rem;display:block;}';
  html += '.entry-note{font-family:\'EB Garamond\',Georgia,serif;font-style:italic;font-size:10.5pt;color:var(--ink);line-height:1.72;}';
  html += '.no-note{font-family:\'EB Garamond\',Georgia,serif;font-style:italic;font-size:10pt;color:var(--stone);}';
  html += '.blessing{margin-top:3rem;padding-top:1.5rem;border-top:1px solid rgba(123,29,42,.18);display:flex;justify-content:space-between;align-items:flex-end;}';
  html += '.blessing-text{font-family:\'EB Garamond\',Georgia,serif;font-style:italic;font-size:9.5pt;color:var(--stone);}';
  html += '.sig-line{text-align:center;width:180px;}.sig-line-rule{border-top:1px solid rgba(123,29,42,.3);margin-bottom:.3rem;}';
  html += '.sig-line-label{font-family:\'Cinzel\',serif;font-size:6pt;letter-spacing:.12em;text-transform:uppercase;color:var(--stone);}';
  html += '@media print{body{background:white;}@page{margin:2cm 1.8cm;}}';
  html += '</style></head><body><div class="page">';
  html += '<div class="header">';
  html += '<span class="header-parish">Saints Peter &amp; Paul Orthodox Cathedral &middot; Jersey City, NJ</span>';
  html += '<div class="header-title">My Journey in Faith</div>';
  if (name) html += '<div class="header-name">' + escHtml(name) + ' &middot; ' + today + '</div>';
  else html += '<div class="header-name">' + today + '</div>';
  html += '</div>';

  if (completed.length === 0) {
    html += '<p style="font-style:italic;color:var(--stone);text-align:center;padding:2rem 0">No articles marked complete yet.</p>';
  } else {
    completed.forEach(function(page) {
      var state = getPageState(page.key);
      html += '<div class="entry">';
      html += '<div class="entry-title">' + escHtml(page.title) + '</div>';
      if (state.completedAt) html += '<span class="entry-date">Completed ' + formatDate(new Date(state.completedAt)) + '</span>';
      if (state.notes && state.notes.trim()) {
        html += '<div class="entry-note">' + escHtml(state.notes).replace(/\n/g, '<br>') + '</div>';
      } else {
        html += '<div class="no-note">No reflection written.</div>';
      }
      html += '</div>';
    });
  }

  html += '<div class="blessing"><div class="blessing-text">Prepared for conversation with:</div>';
  html += '<div class="sig-line"><div class="sig-line-rule"></div><div class="sig-line-label">Fr. Solomon Longo</div></div></div>';
  html += '</div></body></html>';

  var win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(function() { win.print(); }, 600);
  document.getElementById('summary-modal-overlay').style.display = 'none';
}

// ── EMAIL SUMMARY ──
function emailSummary() {
  if (!MANIFEST) return;
  var allPages = [];
  MANIFEST.sections.forEach(function(s) { s.pages.forEach(function(p) { allPages.push(p); }); });
  var total = allPages.length;
  var completed = allPages.filter(function(p) { return getPageState(p.key).completed; });
  var name = '';
  try { name = localStorage.getItem('spp_user_name') || ''; } catch {}

  var body = 'Dear Fr. Solomon,\n\nI wanted to share my journey so far with you.\n\n';
  body += 'Articles Completed: ' + completed.length + ' of ' + total + '\n\n';
  completed.forEach(function(page) {
    var state = getPageState(page.key);
    body += page.title + '\n';
    if (state.notes && state.notes.trim()) body += 'My reflection: ' + state.notes + '\n';
    body += '\n';
  });
  body += '\nIn Christ,\n' + (name || '[Your name]');

  var subject = 'My Journey in Faith' + (name ? ' — ' + name : '');
  window.location.href = 'mailto:ssppnj@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

// ── EXPORT / IMPORT ──
function exportBackup() {
  if (!MANIFEST) return;
  var data = { version: '1.0', exportedAt: new Date().toISOString(), journey: {}, prayerRule: [] };
  try {
    var rule = JSON.parse(localStorage.getItem('spp_my_rule') || '[]');
    data.prayerRule = rule;
  } catch {}
  var allPages = [];
  MANIFEST.sections.forEach(function(s) { s.pages.forEach(function(p) { allPages.push(p); }); });
  allPages.forEach(function(page) {
    var state = getPageState(page.key);
    if (state.completed || (state.notes && state.notes.trim())) {
      data.journey[page.key] = state;
    }
  });

  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'my-journey-backup-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  try { localStorage.setItem('spp_journey_exported', new Date().toISOString()); } catch {}
}

function importBackup(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var data = JSON.parse(ev.target.result);
      if (!data.version || !data.journey) { alert('This does not appear to be a valid backup file.'); return; }
      Object.keys(data.journey).forEach(function(key) {
        try { localStorage.setItem('spp_journey_' + key, JSON.stringify(data.journey[key])); } catch {}
      });
      if (data.prayerRule && Array.isArray(data.prayerRule)) {
        try { localStorage.setItem('spp_my_rule', JSON.stringify(data.prayerRule)); } catch {}
      }
      alert('Backup imported. Your journey has been restored.');
      render();
    } catch { alert('Could not read this file. Please check it is a valid backup.'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ── UTILITIES ──
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', loadManifest);
</script>

<!-- Active state JS -->
<script>
(function() {
  var path = window.location.pathname.replace(/\/$/, '') || '/';
  var map = {
    'mega-about':    ['/our-parish','/church-history','/our-beliefs','/administration','/council','/bylaws'],
    'mega-inquirers':['/about-orthodoxy','/catechesis','/catechesis-history','/bible-study','/fasting','/visit','/contact-us'],
    'mega-calendar': ['/schedule','/readings','/saints','/prologue','/saint-of-the-day'],
    'mega-parish':   ['/news','/bulletins','/gallery','/videos','/cemeteries','/give','/giving-project'],
    'mega-worship':  ['/divine-liturgy','/vespers','/liturgy-history','/liturgy-book','/vespers-book','/prayers']
  };
  Object.keys(map).forEach(function(panelId) {
    if (map[panelId].some(function(p) { return path === p || path.startsWith(p + '/'); })) {
      var li = document.querySelector('[data-mega="' + panelId + '"]');
      if (li) li.classList.add('tab-active');
    }
  });
})();
</script>
</body>
</html>
```

**Important:** After creating this file, add the canonical nav and footer blocks:
- Replace `<!-- NAV: paste canonical nav block here -->` with the full nav from NAV-STANDARDIZATION.md
- Replace `<!-- FOOTER: paste canonical footer Version B here -->` with Version B from FOOTER-STANDARDIZATION.md

---

## SECTION 6 — Final Verification

Run after all sections are complete:

```bash
# Manifest file exists at repo root
ls -la inquirer-content.json

# my-journey.html exists
ls -la my-journey.html

# Widget present on all trackable pages
for page in about-orthodoxy our-beliefs church-history fasting catechesis-history divine-liturgy vespers liturgy-history our-parish catechesis bible-study; do
  if grep -q "jw-bar" ${page}.html; then
    echo "OK: ${page}.html"
  else
    echo "MISSING: ${page}.html"
  fi
done

# Print modal present on prayers.html
grep -c "print-modal" prayers.html

# No references to wrong localStorage keys
grep -rn "my_journey_\|journey_key" *.html | wc -l
# Should return 0
```

**Browser verification:**
1. Visit any trackable page — widget bar appears at bottom
2. Click Mark as Read — button turns green, persists on reload
3. Click Add a Note — drawer slides up, type something, save, reload — note persists
4. Visit `/my-journey` — progress ring shows correct percentage
5. Articles show checked/unchecked state matching what you marked on each page
6. Reflection notes appear under completed articles
7. Click Generate My Summary — print window opens with formatted document
8. Click Export Backup — JSON file downloads
9. Visit `prayers.html`, add prayers to rule, click Print — personalization modal opens, document generates

---

## Final Commit

```bash
git add -A
git commit -m "Companion system Phase 1 — journey widget, my-journey dashboard, prayer rule print, feast suggestion"
git push origin main
```

---

## Notes for Phase 2 (Supabase)

When SUPABASE-SETUP.md is implemented, the following functions will be extended:

- `getPageState(key)` — will try Supabase first, fall back to localStorage
- `saveState(s)` — will write to both localStorage and Supabase in background
- `getRule()` / `saveRule()` in prayers.html — same pattern
- `exportBackup()` — will also offer "Save to account" option
- `my-journey.html` will show a login prompt offering to sync across devices

No changes to the HTML structure or CSS will be required for the Supabase migration.
The localStorage layer built here becomes the offline cache.
