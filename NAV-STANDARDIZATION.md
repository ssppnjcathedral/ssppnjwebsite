# NAV-STANDARDIZATION.md
## Saints Peter & Paul Orthodox Cathedral — Unified Navigation

Complete this after PAGE-RENAMES.md is fully deployed and verified.
Standardizes the mega menu nav across all 35 pages of the site.

---

## Prerequisites — Confirm Before Starting

```bash
# Confirm renamed files exist at correct paths
ls our-parish.html catechesis.html catechesis-history.html liturgy-history.html vespers-book.html

# Confirm old files are gone
ls about-our-church.html catechesis-series.html about-liturgy.html great-vespers.html donate.html 2>/dev/null && echo "OLD FILES STILL EXIST — stop" || echo "Good — proceed"

# Confirm redirects are in netlify.toml
grep "about-our-church\|catechesis-series\|about-liturgy\|great-vespers\|donate" netlify.toml
```

---

## What Changes From the Current Index Nav

| Element | Old | New |
|---|---|---|
| Worship tab | `id="mega-resources"` | `id="mega-worship"` |
| About Our Church link | `/about-our-church` | `/our-parish` |
| Catechesis Series link | `/catechesis-series` | `/catechesis` |
| Catechesis History link | `/catechesis` | `/catechesis-history` |
| About Liturgy link | `/about-liturgy` | `/liturgy-history` |
| Great Vespers link | `/great-vespers` | `/vespers-book` |
| Donate links | `/donate` | `/give` |
| Vespers display name | Vespers | About Vespers |
| Saints display name | Saints | Saints of the Day |
| Calendar panel | Services only (4 links) | Services + Daily (8 links) |
| Worship panel | 2 cols, services + daily practice | 2 cols, guides + follow-along |
| Fasting | Not in nav | Added to Inquirers |
| Vespers Book | Not in nav | Added to Worship |
| Liturgy History | Not in nav | Added to Worship |

---

## Current File State — Actual Slugs

These are the correct URLs as of the completed rename session:

```
/our-parish          ← was /about-our-church
/catechesis          ← was /catechesis-series
/catechesis-history  ← was /catechesis
/liturgy-history     ← was /about-liturgy
/vespers-book        ← was /great-vespers
/give                ← donate.html deleted, redirect in place
```

---

## The Canonical Nav Block

This is the single source of truth. Identical HTML goes on every page.
The only per-page variation is handled automatically by the active state JS below.

```html
<!-- ═══════════════════════════════════════════
     NAV START — Saints Peter & Paul Cathedral
     Canonical version — do not modify per page
     ═══════════════════════════════════════════ -->
<nav class="nav">
  <div class="nav-inner">
    <a href="/">
      <img src="/images/logo/logo-2026.svg" alt="Saints Peter &amp; Paul Orthodox Cathedral" class="nav-logo-img" onerror="this.style.display='none'">
    </a>
    <div class="nav-mega-group" id="nav-mega-group">
      <ul class="nav-links">
        <li data-mega="mega-about"><a href="#">About Us</a></li>
        <li data-mega="mega-inquirers"><a href="#">Inquirers</a></li>
        <li data-mega="mega-calendar"><a href="#">Calendar</a></li>
        <li data-mega="mega-parish"><a href="#">Parish Life</a></li>
        <li data-mega="mega-worship"><a href="#">Worship</a></li>
      </ul>

      <!-- PANEL: ABOUT US -->
      <div class="mega-panel" id="mega-about">
        <div class="mega-photo">
          <div class="mega-photo-bg" style="background-image:url('https://picsum.photos/seed/sspp-exterior/400/500')"></div>
          <div class="mega-photo-overlay"></div>
          <div class="mega-photo-content">
            <span class="mega-photo-label">About Us</span>
            <p class="mega-photo-quote">A century of faith on Grand Street.</p>
          </div>
        </div>
        <div class="mega-content">
          <div class="mega-inner" style="grid-template-columns:repeat(2,1fr)">
            <div class="mega-col">
              <span class="mega-col-head">Who We Are</span>
              <a href="/our-parish" class="mega-link">Our Parish</a>
              <span class="mega-sub">Our history, our people, our home</span>
              <a href="/church-history" class="mega-link">Church History</a>
              <span class="mega-sub">A century of faith in Jersey City</span>
              <a href="/our-beliefs" class="mega-link">Our Beliefs</a>
              <span class="mega-sub">What we confess and why it matters</span>
            </div>
            <div class="mega-col">
              <span class="mega-col-head">Leadership &amp; Governance</span>
              <a href="/administration" class="mega-link">Administration</a>
              <span class="mega-sub">Staff and parish leadership</span>
              <a href="/council" class="mega-link">Parish Council</a>
              <span class="mega-sub">The elected lay leadership</span>
              <a href="/bylaws" class="mega-link">Bylaws</a>
              <span class="mega-sub">Our governing documents</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL: INQUIRERS -->
      <div class="mega-panel" id="mega-inquirers">
        <div class="mega-photo">
          <div class="mega-photo-bg" style="background-image:url('https://picsum.photos/seed/sspp-welcome/400/500')"></div>
          <div class="mega-photo-overlay"></div>
          <div class="mega-photo-content">
            <span class="mega-photo-label">Inquirers</span>
            <p class="mega-photo-quote">Exploring the ancient Faith?</p>
          </div>
        </div>
        <div class="mega-content">
          <div class="mega-inner" style="grid-template-columns:repeat(2,1fr)">
            <div class="mega-col">
              <span class="mega-col-head">Learning the Faith</span>
              <a href="/about-orthodoxy" class="mega-link">About Orthodoxy</a>
              <span class="mega-sub">The ancient Christian faith, its history and teachings</span>
              <a href="/our-beliefs" class="mega-link">Our Beliefs</a>
              <span class="mega-sub">What we confess and why it matters</span>
              <a href="/catechesis" class="mega-link">Catechesis Series</a>
              <span class="mega-sub">Recorded talks and study materials</span>
              <a href="/catechesis-history" class="mega-link">Catechesis History</a>
              <span class="mega-sub">Formation for those entering the Church</span>
              <a href="/bible-study" class="mega-link">Bible Study</a>
              <span class="mega-sub">Weekly verse-by-verse study, open to all</span>
              <a href="/fasting" class="mega-link">Fasting</a>
              <span class="mega-sub">The history and practice of Orthodox fasting</span>
            </div>
            <div class="mega-col">
              <span class="mega-col-head">Come Visit</span>
              <a href="/visit" class="mega-link">Visitor Guide</a>
              <span class="mega-sub">Everything you need before you arrive</span>
              <a href="/contact-us" class="mega-link">Contact Us</a>
              <span class="mega-sub">Reach Fr. Solomon and the parish office</span>
              <span class="mega-sub" style="margin-top:.75rem;display:block">Vespers &mdash; Saturday 5:00 PM</span>
              <span class="mega-sub">Divine Liturgy &mdash; Sunday 9:30 AM</span>
              <div class="mega-cta">
                <a href="https://tithe.ly/give?c=5004259" target="_blank" class="mega-cta-btn">Give to the Cathedral &rarr;</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL: CALENDAR -->
      <div class="mega-panel" id="mega-calendar">
        <div class="mega-photo">
          <div class="mega-photo-bg" style="background-image:url('https://picsum.photos/seed/sspp-calendar/400/500')"></div>
          <div class="mega-photo-overlay"></div>
          <div class="mega-photo-content">
            <span class="mega-photo-label">Calendar</span>
            <p class="mega-photo-quote">The rhythm of the Church's year.</p>
          </div>
        </div>
        <div class="mega-content">
          <div class="mega-inner" style="grid-template-columns:repeat(2,1fr)">
            <div class="mega-col">
              <span class="mega-col-head">Services</span>
              <a href="/divine-liturgy" class="mega-link">Divine Liturgy</a>
              <span class="mega-sub">Every Sunday &middot; 9:30 AM &middot; Coffee hour follows</span>
              <a href="/vespers" class="mega-link">Great Vespers</a>
              <span class="mega-sub">Every Saturday &middot; 5:00 PM</span>
              <a href="/schedule" class="mega-link">Feast Day Liturgies</a>
              <span class="mega-sub">As scheduled &middot; 9:00 AM</span>
              <div class="mega-cta">
                <a href="/schedule" class="mega-cta-btn">Full Liturgical Calendar &rarr;</a>
              </div>
            </div>
            <div class="mega-col">
              <span class="mega-col-head">Daily</span>
              <a href="/readings" class="mega-link">Daily Readings</a>
              <span class="mega-sub">Scripture appointed for each day</span>
              <a href="/saints" class="mega-link">Saints of the Day</a>
              <span class="mega-sub">Lives of those commemorated today</span>
              <a href="/prologue" class="mega-link">The Prologue</a>
              <span class="mega-sub">Daily readings from the Prologue of Ohrid</span>
              <a href="/saint-of-the-day" class="mega-link">Saint of the Day</a>
              <span class="mega-sub">Icon, life, troparion, and kontakion</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL: PARISH LIFE -->
      <div class="mega-panel" id="mega-parish">
        <div class="mega-photo">
          <div class="mega-photo-bg" style="background-image:url('https://picsum.photos/seed/sspp-community/400/500')"></div>
          <div class="mega-photo-overlay"></div>
          <div class="mega-photo-content">
            <span class="mega-photo-label">Parish Life</span>
            <p class="mega-photo-quote">A family that shares a life.</p>
          </div>
        </div>
        <div class="mega-content">
          <div class="mega-inner" style="grid-template-columns:repeat(2,1fr)">
            <div class="mega-col">
              <span class="mega-col-head">News &amp; Publications</span>
              <a href="/news" class="mega-link">News &amp; Announcements</a>
              <span class="mega-sub">What's happening at the parish</span>
              <a href="/bulletins" class="mega-link">Parish Bulletins</a>
              <span class="mega-sub">Weekly reflections from Fr. Solomon</span>
            </div>
            <div class="mega-col">
              <span class="mega-col-head">Community</span>
              <a href="/gallery" class="mega-link">Gallery</a>
              <span class="mega-sub">Photos from parish life and worship</span>
              <a href="/videos" class="mega-link">Videos</a>
              <span class="mega-sub">Lectures, services, and parish life</span>
              <a href="/cemeteries" class="mega-link">Cemeteries</a>
              <span class="mega-sub">Our historic parish cemeteries</span>
              <a href="/give" class="mega-link">Give &amp; Support</a>
              <span class="mega-sub">Projects, drives, and ongoing stewardship</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL: WORSHIP -->
      <div class="mega-panel" id="mega-worship">
        <div class="mega-photo">
          <div class="mega-photo-bg" style="background-image:url('https://picsum.photos/seed/sspp-interior/400/500')"></div>
          <div class="mega-photo-overlay"></div>
          <div class="mega-photo-content">
            <span class="mega-photo-label">Worship</span>
            <p class="mega-photo-quote">The living tradition of the Church.</p>
          </div>
        </div>
        <div class="mega-content">
          <div class="mega-inner" style="grid-template-columns:repeat(2,1fr)">
            <div class="mega-col">
              <span class="mega-col-head">Service Guides</span>
              <a href="/divine-liturgy" class="mega-link">About the Divine Liturgy</a>
              <span class="mega-sub">History, structure, and meaning</span>
              <a href="/vespers" class="mega-link">About Vespers</a>
              <span class="mega-sub">The ancient evening prayer of the Church</span>
              <a href="/liturgy-history" class="mega-link">History of the Liturgy</a>
              <span class="mega-sub">How the Divine Liturgy developed over the centuries</span>
            </div>
            <div class="mega-col">
              <span class="mega-col-head">Follow Along</span>
              <a href="/liturgy-book" class="mega-link">Liturgy Book</a>
              <span class="mega-sub">Full text for the Divine Liturgy</span>
              <a href="/vespers-book" class="mega-link">Vespers Book</a>
              <span class="mega-sub">Full text for Great Vespers</span>
              <a href="/prayers" class="mega-link">Daily Prayers</a>
              <span class="mega-sub">The daily prayer rule of the Orthodox Church</span>
            </div>
          </div>
        </div>
      </div>

    </div>
    <a href="https://tithe.ly/give?c=5004259" target="_blank" class="nav-give">Give</a>
    <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" onclick="openDrawer()">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- MOBILE NAV DRAWER -->
<div class="nav-drawer-overlay" id="nav-overlay" onclick="closeDrawer()"></div>
<div class="nav-drawer" id="nav-drawer">
  <div class="nav-drawer-head">
    <div class="nav-drawer-logo">Sts. Peter &amp; Paul<span>Orthodox Cathedral &middot; Jersey City</span></div>
    <button class="nav-drawer-close" onclick="closeDrawer()">&#x2715;</button>
  </div>
  <div class="dr-accordion" id="dr-accordion">

    <div class="dr-section" data-photo="sspp-exterior" data-label="About Us" data-quote="A century of faith on Grand Street.">
      <div class="dr-section-head" onclick="drToggle(this)">
        <span class="dr-section-name">About Us</span>
        <span class="dr-section-toggle">+</span>
      </div>
      <div class="dr-section-links">
        <a href="/our-parish" class="dr-link"><span class="dr-link-name">Our Parish</span><span class="dr-link-sub">Our history, our people, our home</span></a>
        <a href="/church-history" class="dr-link"><span class="dr-link-name">Church History</span><span class="dr-link-sub">A century of faith in Jersey City</span></a>
        <a href="/our-beliefs" class="dr-link"><span class="dr-link-name">Our Beliefs</span><span class="dr-link-sub">What we confess and why it matters</span></a>
        <a href="/administration" class="dr-link"><span class="dr-link-name">Administration</span><span class="dr-link-sub">Staff and parish leadership</span></a>
        <a href="/council" class="dr-link"><span class="dr-link-name">Parish Council</span><span class="dr-link-sub">The elected lay leadership</span></a>
        <a href="/bylaws" class="dr-link"><span class="dr-link-name">Bylaws</span><span class="dr-link-sub">Our governing documents</span></a>
      </div>
    </div>

    <div class="dr-section" data-photo="sspp-welcome" data-label="Inquirers" data-quote="Exploring the ancient Faith?">
      <div class="dr-section-head" onclick="drToggle(this)">
        <span class="dr-section-name">Inquirers</span>
        <span class="dr-section-toggle">+</span>
      </div>
      <div class="dr-section-links">
        <a href="/about-orthodoxy" class="dr-link"><span class="dr-link-name">About Orthodoxy</span><span class="dr-link-sub">The ancient Christian faith and its teachings</span></a>
        <a href="/our-beliefs" class="dr-link"><span class="dr-link-name">Our Beliefs</span><span class="dr-link-sub">What we confess and why it matters</span></a>
        <a href="/catechesis" class="dr-link"><span class="dr-link-name">Catechesis Series</span><span class="dr-link-sub">Recorded talks and study materials</span></a>
        <a href="/catechesis-history" class="dr-link"><span class="dr-link-name">Catechesis History</span><span class="dr-link-sub">Formation for those entering the Church</span></a>
        <a href="/bible-study" class="dr-link"><span class="dr-link-name">Bible Study</span><span class="dr-link-sub">Weekly verse-by-verse study, open to all</span></a>
        <a href="/fasting" class="dr-link"><span class="dr-link-name">Fasting</span><span class="dr-link-sub">The history and practice of Orthodox fasting</span></a>
        <a href="/visit" class="dr-link"><span class="dr-link-name">Visitor Guide</span><span class="dr-link-sub">Everything you need before you arrive</span></a>
        <a href="/contact-us" class="dr-link"><span class="dr-link-name">Contact Us</span><span class="dr-link-sub">Reach Fr. Solomon and the parish office</span></a>
      </div>
    </div>

    <div class="dr-section" data-photo="sspp-calendar" data-label="Calendar" data-quote="The rhythm of the Church's year.">
      <div class="dr-section-head" onclick="drToggle(this)">
        <span class="dr-section-name">Calendar</span>
        <span class="dr-section-toggle">+</span>
      </div>
      <div class="dr-section-links">
        <a href="/divine-liturgy" class="dr-link"><span class="dr-link-name">Divine Liturgy</span><span class="dr-link-sub">Every Sunday, 9:30 AM</span></a>
        <a href="/vespers" class="dr-link"><span class="dr-link-name">Great Vespers</span><span class="dr-link-sub">Every Saturday, 5:00 PM</span></a>
        <a href="/schedule" class="dr-link"><span class="dr-link-name">Full Liturgical Calendar</span><span class="dr-link-sub">Feasts, fasts, and the Church year</span></a>
        <a href="/readings" class="dr-link"><span class="dr-link-name">Daily Readings</span><span class="dr-link-sub">Scripture appointed for each day</span></a>
        <a href="/saints" class="dr-link"><span class="dr-link-name">Saints of the Day</span><span class="dr-link-sub">Lives of those commemorated today</span></a>
        <a href="/prologue" class="dr-link"><span class="dr-link-name">The Prologue</span><span class="dr-link-sub">Daily readings from the Prologue of Ohrid</span></a>
        <a href="/saint-of-the-day" class="dr-link"><span class="dr-link-name">Saint of the Day</span><span class="dr-link-sub">Icon, life, troparion, and kontakion</span></a>
      </div>
    </div>

    <div class="dr-section" data-photo="sspp-community" data-label="Parish Life" data-quote="A family that shares a life.">
      <div class="dr-section-head" onclick="drToggle(this)">
        <span class="dr-section-name">Parish Life</span>
        <span class="dr-section-toggle">+</span>
      </div>
      <div class="dr-section-links">
        <a href="/news" class="dr-link"><span class="dr-link-name">News &amp; Announcements</span><span class="dr-link-sub">What's happening at the parish</span></a>
        <a href="/bulletins" class="dr-link"><span class="dr-link-name">Parish Bulletins</span><span class="dr-link-sub">Weekly reflections from Fr. Solomon</span></a>
        <a href="/gallery" class="dr-link"><span class="dr-link-name">Gallery</span><span class="dr-link-sub">Photos from parish life and worship</span></a>
        <a href="/videos" class="dr-link"><span class="dr-link-name">Videos</span><span class="dr-link-sub">Lectures, services, and parish life</span></a>
        <a href="/cemeteries" class="dr-link"><span class="dr-link-name">Cemeteries</span><span class="dr-link-sub">Our historic parish cemeteries</span></a>
        <a href="/give" class="dr-link"><span class="dr-link-name">Give &amp; Support</span><span class="dr-link-sub">Projects, drives, and ongoing stewardship</span></a>
      </div>
    </div>

    <div class="dr-section" data-photo="sspp-interior" data-label="Worship" data-quote="The living tradition of the Church.">
      <div class="dr-section-head" onclick="drToggle(this)">
        <span class="dr-section-name">Worship</span>
        <span class="dr-section-toggle">+</span>
      </div>
      <div class="dr-section-links">
        <a href="/divine-liturgy" class="dr-link"><span class="dr-link-name">About the Divine Liturgy</span><span class="dr-link-sub">History, structure, and meaning</span></a>
        <a href="/vespers" class="dr-link"><span class="dr-link-name">About Vespers</span><span class="dr-link-sub">The ancient evening prayer of the Church</span></a>
        <a href="/liturgy-history" class="dr-link"><span class="dr-link-name">History of the Liturgy</span><span class="dr-link-sub">How the Divine Liturgy developed</span></a>
        <a href="/liturgy-book" class="dr-link"><span class="dr-link-name">Liturgy Book</span><span class="dr-link-sub">Full text for the Divine Liturgy</span></a>
        <a href="/vespers-book" class="dr-link"><span class="dr-link-name">Vespers Book</span><span class="dr-link-sub">Full text for Great Vespers</span></a>
        <a href="/prayers" class="dr-link"><span class="dr-link-name">Daily Prayers</span><span class="dr-link-sub">The daily prayer rule of the Orthodox Church</span></a>
      </div>
    </div>

  </div>
  <a href="https://tithe.ly/give?c=5004259" target="_blank" class="nav-drawer-give">Give Online</a>
</div>
<!-- ═══════════════════════════════════════════
     NAV END
     ═══════════════════════════════════════════ -->
```

---

## Active State JS — Add to Every Page

Paste this immediately before the closing `</body>` tag on every page.
Auto-detects the current URL and highlights the correct nav tab.
No per-page customization needed — identical on every page.

```html
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
    if (map[panelId].some(function(p) {
      return path === p || path.startsWith(p + '/');
    })) {
      var li = document.querySelector('[data-mega="' + panelId + '"]');
      if (li) li.classList.add('tab-active');
    }
  });
})();
</script>
```

---

## Nav CSS — Verify Present on Every Page

Every page must have this CSS. Most pages already have it inline.
Check that these classes are defined — if any are missing, add the block.

The critical classes are:
- `.nav` `.nav-inner` `.nav-logo-img`
- `.nav-mega-group` `.nav-links` `.mega-panel` `.mega-visible`
- `.mega-photo` `.mega-photo-bg` `.mega-photo-overlay` `.mega-photo-content`
- `.mega-content` `.mega-inner` `.mega-col` `.mega-col-head`
- `.mega-link` `.mega-sub` `.mega-cta` `.mega-cta-btn`
- `.nav-give` `.nav-hamburger`
- `.nav-drawer` `.nav-drawer-overlay` `.nav-drawer-head` `.nav-drawer-logo`
- `.nav-drawer-close` `.nav-drawer-give`
- `.dr-accordion` `.dr-section` `.dr-section-head` `.dr-section-name`
- `.dr-section-toggle` `.dr-section-links` `.dr-link` `.dr-link-name` `.dr-link-sub`
- `.dr-photo` `.dr-photo-bg` `.dr-photo-overlay` `.dr-photo-content`
- `.tab-active`

If a page has the old simple dropdown nav instead of the mega menu,
the entire nav CSS block from `index.html` must be copied into that page's `<style>` tag.

---

## Nav JS — Verify Present on Every Page

Every page must have the mega menu JS. Check for these functions:
- `openDrawer()` / `closeDrawer()` — mobile drawer open/close
- `drToggle()` — mobile accordion section toggle
- Mega panel hover logic — desktop panel show/hide

If a page is missing these, copy the nav JS block from `index.html`.
In `index.html` the nav JS lives in `index-scripts.js`.
For all other pages it should be inline in a `<script>` tag near `</body>`.

---

## Implementation — Page by Page

**Work through pages in this order. Complete and verify each before moving on.
Commit after every 3-4 pages.**

### Phase 1 — index.html (reference implementation)

`index.html` is first. Get this right before touching anything else.

**Find the nav block:**
```bash
grep -n "<!-- NAV -->\|<!-- MOBILE NAV DRAWER -->\|<!-- HERO -->" index.html
```

**Replace** everything from `<nav class="nav">` through the closing `</div>` of
the mobile drawer (the line just before `<!-- HERO -->`).

**Paste** the canonical nav block above exactly.

**The active state JS** is not needed on `index.html` — the homepage has
no nav tab to highlight. Skip it for this page only.

**Verify:**
- Open in browser
- Hover all five tabs — panels open correctly
- Click hamburger on mobile — drawer opens
- Expand all five drawer sections — links correct
- No broken links visible

```bash
git add index.html
git commit -m "Update index.html to canonical nav"
```

---

### Phase 2 — Pages with old simple dropdown nav

These pages have a simple dropdown nav, not the mega menu.
They need both the nav HTML AND the full nav CSS and JS added.

Identify them first:
```bash
grep -rL "mega-panel\|nav-mega-group" *.html
```

Any file that returns from that grep has the old nav and needs the full treatment:
1. Replace the old `<nav>` block with the canonical nav HTML
2. Verify nav CSS classes are present in the `<style>` tag — if not, copy from index.html
3. Verify nav JS functions are present — if not, add the inline nav JS block
4. Add the active state JS before `</body>`
5. Open in browser and verify

---

### Phase 3 — Pages with mega menu nav (update only)

These pages already have the mega menu — they just need the links updated
to the new slugs and the new panels added.

```bash
grep -rl "mega-panel\|nav-mega-group" *.html | grep -v "index.html"
```

For each file returned:

**Find the nav block:**
```bash
grep -n "<!-- NAV -->\|<nav class" FILENAME.html | head -5
```

**Replace** the nav block with the canonical nav.

**Add** the active state JS before `</body>` if not already present.

**Verify:**
- All five tabs visible
- Correct panel opens on hover
- Links point to correct URLs
- Mobile drawer works

---

### Full Page List — All 34 Non-Index Pages

Work through these after index.html is confirmed correct.
Check the box mentally as each is done.

**About Us pages:**
- [ ] `our-parish.html`
- [ ] `church-history.html`
- [ ] `our-beliefs.html`
- [ ] `administration.html`
- [ ] `council.html`
- [ ] `bylaws.html`

**Inquirer pages:**
- [ ] `about-orthodoxy.html`
- [ ] `catechesis.html`
- [ ] `catechesis-history.html`
- [ ] `bible-study.html`
- [ ] `fasting.html`
- [ ] `visit.html`
- [ ] `contact-us.html`

**Calendar pages:**
- [ ] `schedule.html`
- [ ] `readings.html`
- [ ] `saints.html`
- [ ] `prologue.html`
- [ ] `saint-of-the-day.html`

**Parish Life pages:**
- [ ] `news.html`
- [ ] `bulletins.html`
- [ ] `bulletin.html`
- [ ] `gallery.html`
- [ ] `videos.html`
- [ ] `cemeteries.html`
- [ ] `give.html`
- [ ] `giving-project.html`

**Worship pages:**
- [ ] `divine-liturgy.html`
- [ ] `vespers.html`
- [ ] `liturgy-history.html`
- [ ] `liturgy-book.html`
- [ ] `vespers-book.html`
- [ ] `prayers.html`

**Other:**
- [ ] `article.html`
- [ ] `about-liturgy.html` — check if this still exists or was renamed

---

## Batch Replace — Stale Link Cleanup

After all pages have the canonical nav, run a final sweep to catch
any stale links that appear in nav or footer that were missed:

```bash
# These should all return 0 after nav standardization
echo "Checking for stale nav links..."

echo "about-our-church (expect 0):"
grep -rl "about-our-church" *.html | wc -l

echo "catechesis-series (expect 0):"
grep -rl "catechesis-series" *.html | wc -l

echo "about-liturgy (expect 0):"
grep -rl "about-liturgy" *.html | wc -l

echo "great-vespers (expect 0):"
grep -rl "great-vespers" *.html | wc -l

echo "/donate links (expect 0):"
grep -rl 'href="/donate"' *.html | wc -l

echo "mega-resources panel ID (expect 0 — replaced by mega-worship):"
grep -rl "mega-resources" *.html | wc -l
```

If any return non-zero, fix those files before final commit.

---

## Final Commit and Push

```bash
git add -A
git commit -m "Standardize mega menu nav across all pages"
git push origin main
```

After Netlify deploys (~2 min), spot-check five pages across different sections:
- Homepage
- One About Us page
- One Inquirers page
- One Worship page
- One Parish Life page

On each: hover all five tabs, click a link, open mobile drawer, confirm no 404s.

---

## Notes for Future Pages

When a new page is added to the site:

1. Copy the canonical nav block from this document exactly
2. Add the active state JS before `</body>`
3. Add the new page's URL to the correct entry in the active state JS map
4. Update this document's page list

The canonical nav block does not change unless a new section or link is
added to the site — in which case update this document first, then
propagate sitewide.
