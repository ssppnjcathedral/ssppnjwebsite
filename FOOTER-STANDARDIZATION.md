# FOOTER-STANDARDIZATION.md
## Saints Peter & Paul Orthodox Cathedral — Unified Footer

Complete this after NAV-STANDARDIZATION.md is fully implemented and verified.
Standardizes the footer across all 35 pages of the site.

---

## Prerequisites — Confirm Before Starting

```bash
# Confirm nav standardization is complete
grep -l "mega-worship" *.html | wc -l
# Should return 35 — every page should have the new Worship panel ID

# Confirm renamed files exist
ls our-parish.html catechesis.html catechesis-history.html liturgy-history.html vespers-book.html

# Confirm no stale slugs remain in any footer
grep -n "about-our-church\|catechesis-series\|great-vespers\|donate\|about-liturgy" *.html | grep -i "footer"
# Should return nothing
```

---

## What Is Wrong With the Current Footer

Before standardizing, understand what is broken:

| Issue | Affected Pages |
|---|---|
| 3-column layout instead of 4 | Most non-index pages |
| Wrong address: 723 Madison Ave | `prayers.html` |
| Fake phone: (201) 555-1234 | `prayers.html` |
| Missing email address | All non-index pages |
| Missing Google Maps link on address | Most pages |
| Missing YouTube in socials | Most pages |
| Missing logo SVG | Most non-index pages |
| Footer cross ornament `+ + +` | Multiple pages — remove |
| Stale slug `/about-our-church` | Multiple pages |
| Stale slug `/catechesis-series` | Multiple pages |
| Stale slug `/catechesis` (old) | Multiple pages |
| Stale slug `/donate` | Multiple pages |
| tithe.ly direct link in footer | Some pages — replace with `/give` |
| No My Journey link | All pages |
| No Vespers Book link | All pages |
| No Liturgy History link | All pages |
| Inconsistent copyright line | Multiple pages |

---

## Correct Parish Information

Use exactly this information everywhere. No variations.

```
Saints Peter & Paul Orthodox Cathedral
109 Grand Street, Jersey City, NJ 07302
Phone: (201) 434-1986
Fax:   (201) 434-1210
Email: ssppnj@gmail.com
Google Maps: https://maps.google.com/?q=109+Grand+Street+Jersey+City+NJ+07302
YouTube: https://www.youtube.com/@SSPPJC
Facebook: # (placeholder until URL confirmed)
Instagram: # (placeholder until URL confirmed)
Diocese: Diocese of New York & New Jersey
Diocese URL: https://nynjoca.org
OCA URL: https://oca.org
```

---

## Two Canonical Footer Versions

There are two versions. The only difference is Column 1.
Everything else — columns 2, 3, 4, and the bottom bar — is identical.

### Version A — index.html only
Column 1 includes the newsletter signup form in addition to the logo and info.

### Version B — all other pages (34 pages)
Column 1 has logo and info only. No newsletter form.

---

## Version A — index.html Footer (Homepage Only)

Replace the existing `<footer>` block in `index.html` with this exactly.

```html
<!-- ═══════════════════════════════════════════
     FOOTER — index.html version (with newsletter)
     ═══════════════════════════════════════════ -->
<footer>
  <div class="footer-cols">

    <!-- COL 1: Identity + Newsletter -->
    <div>
      <img src="/images/logo/logo-2026.svg" alt="Saints Peter &amp; Paul Orthodox Cathedral" class="footer-logo-img" onerror="this.style.display='none'">
      <p class="footer-meta">
        Diocese of New York &amp; New Jersey<br>
        <a href="https://nynjoca.org" target="_blank" rel="noopener">nynjoca.org</a><br>
        Orthodox Church in America<br>
        <a href="https://oca.org" target="_blank" rel="noopener">oca.org</a>
      </p>
      <div class="footer-socials">
        <a href="#" target="_blank" rel="noopener">Facebook</a>
        <a href="#" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.youtube.com/@SSPPJC" target="_blank" rel="noopener">YouTube</a>
      </div>
      <span class="footer-col-head" style="margin-top:2rem">Newsletter</span>
      <div class="footer-email">
        <input type="email" placeholder="Your email address"/>
        <button type="button">Subscribe</button>
      </div>
    </div>

    <!-- COL 2: About Us + Inquirers -->
    <div>
      <span class="footer-col-head">About Us</span>
      <ul class="footer-nav">
        <li><a href="/our-parish">Our Parish</a></li>
        <li><a href="/church-history">Church History</a></li>
        <li><a href="/our-beliefs">Our Beliefs</a></li>
        <li><a href="/administration">Administration</a></li>
        <li><a href="/council">Parish Council</a></li>
        <li><a href="/bylaws">Bylaws</a></li>
      </ul>
      <span class="footer-nav-sub">Inquirers</span>
      <ul class="footer-nav">
        <li><a href="/about-orthodoxy">About Orthodoxy</a></li>
        <li><a href="/catechesis">Catechesis Series</a></li>
        <li><a href="/catechesis-history">Catechesis History</a></li>
        <li><a href="/bible-study">Bible Study</a></li>
        <li><a href="/fasting">Fasting</a></li>
        <li><a href="/visit">Visitor Guide</a></li>
        <li><a href="/contact-us">Contact Us</a></li>
      </ul>
    </div>

    <!-- COL 3: Worship + Daily -->
    <div>
      <span class="footer-col-head">Worship</span>
      <ul class="footer-nav">
        <li><a href="/divine-liturgy">About the Divine Liturgy</a></li>
        <li><a href="/vespers">About Vespers</a></li>
        <li><a href="/liturgy-book">Liturgy Book</a></li>
        <li><a href="/vespers-book">Vespers Book</a></li>
        <li><a href="/liturgy-history">History of the Liturgy</a></li>
      </ul>
      <span class="footer-nav-sub">Daily</span>
      <ul class="footer-nav">
        <li><a href="/readings">Daily Readings</a></li>
        <li><a href="/saints">Saints of the Day</a></li>
        <li><a href="/prologue">The Prologue</a></li>
        <li><a href="/prayers">Daily Prayers</a></li>
      </ul>
    </div>

    <!-- COL 4: Parish Life + My Parish + Connect -->
    <div>
      <span class="footer-col-head">Parish Life</span>
      <ul class="footer-nav">
        <li><a href="/news">News &amp; Announcements</a></li>
        <li><a href="/bulletins">Parish Bulletins</a></li>
        <li><a href="/gallery">Gallery</a></li>
        <li><a href="/videos">Videos</a></li>
        <li><a href="/cemeteries">Cemeteries</a></li>
        <li><a href="/give">Give &amp; Support</a></li>
      </ul>
      <span class="footer-nav-sub">My Parish</span>
      <ul class="footer-nav">
        <li><a href="/my-journey">My Journey</a></li>
      </ul>
      <span class="footer-nav-sub">Connect</span>
      <p class="footer-meta" style="line-height:2.2">
        Vespers &middot; Saturdays 5:00 PM<br>
        Divine Liturgy &middot; Sundays 9:30 AM
      </p>
      <p class="footer-meta" style="margin-top:.75rem">
        <a href="https://maps.google.com/?q=109+Grand+Street+Jersey+City+NJ+07302" target="_blank" rel="noopener">109 Grand Street &middot; Jersey City, NJ</a><br>
        <a href="tel:+12014341986">(201) 434-1986</a><br>
        <a href="mailto:ssppnj@gmail.com">ssppnj@gmail.com</a>
      </p>
    </div>

  </div>
  <div class="footer-bottom">
    <p class="footer-copy">&copy; Saints Peter &amp; Paul Orthodox Cathedral. All Rights Reserved.</p>
    <p class="footer-addr">
      <a href="https://maps.google.com/?q=109+Grand+Street+Jersey+City+NJ+07302" target="_blank" rel="noopener" style="color:inherit;border-bottom:1px solid rgba(246,241,232,.25)">109 Grand Street &middot; Jersey City, NJ 07302</a><br>
      (201) 434-1986 &middot; <a href="mailto:ssppnj@gmail.com" style="color:inherit">ssppnj@gmail.com</a>
    </p>
  </div>
</footer>
<!-- ═══════════════════════════════════════════
     FOOTER END
     ═══════════════════════════════════════════ -->
```

---

## Version B — All Other Pages (34 Pages)

Column 1 has no newsletter. Everything else identical to Version A.

```html
<!-- ═══════════════════════════════════════════
     FOOTER — standard version (all pages except index)
     ═══════════════════════════════════════════ -->
<footer>
  <div class="footer-cols">

    <!-- COL 1: Identity -->
    <div>
      <img src="/images/logo/logo-2026.svg" alt="Saints Peter &amp; Paul Orthodox Cathedral" class="footer-logo-img" onerror="this.style.display='none'">
      <p class="footer-meta">
        Diocese of New York &amp; New Jersey<br>
        <a href="https://nynjoca.org" target="_blank" rel="noopener">nynjoca.org</a><br>
        Orthodox Church in America<br>
        <a href="https://oca.org" target="_blank" rel="noopener">oca.org</a>
      </p>
      <div class="footer-socials">
        <a href="#" target="_blank" rel="noopener">Facebook</a>
        <a href="#" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.youtube.com/@SSPPJC" target="_blank" rel="noopener">YouTube</a>
      </div>
    </div>

    <!-- COL 2: About Us + Inquirers -->
    <div>
      <span class="footer-col-head">About Us</span>
      <ul class="footer-nav">
        <li><a href="/our-parish">Our Parish</a></li>
        <li><a href="/church-history">Church History</a></li>
        <li><a href="/our-beliefs">Our Beliefs</a></li>
        <li><a href="/administration">Administration</a></li>
        <li><a href="/council">Parish Council</a></li>
        <li><a href="/bylaws">Bylaws</a></li>
      </ul>
      <span class="footer-nav-sub">Inquirers</span>
      <ul class="footer-nav">
        <li><a href="/about-orthodoxy">About Orthodoxy</a></li>
        <li><a href="/catechesis">Catechesis Series</a></li>
        <li><a href="/catechesis-history">Catechesis History</a></li>
        <li><a href="/bible-study">Bible Study</a></li>
        <li><a href="/fasting">Fasting</a></li>
        <li><a href="/visit">Visitor Guide</a></li>
        <li><a href="/contact-us">Contact Us</a></li>
      </ul>
    </div>

    <!-- COL 3: Worship + Daily -->
    <div>
      <span class="footer-col-head">Worship</span>
      <ul class="footer-nav">
        <li><a href="/divine-liturgy">About the Divine Liturgy</a></li>
        <li><a href="/vespers">About Vespers</a></li>
        <li><a href="/liturgy-book">Liturgy Book</a></li>
        <li><a href="/vespers-book">Vespers Book</a></li>
        <li><a href="/liturgy-history">History of the Liturgy</a></li>
      </ul>
      <span class="footer-nav-sub">Daily</span>
      <ul class="footer-nav">
        <li><a href="/readings">Daily Readings</a></li>
        <li><a href="/saints">Saints of the Day</a></li>
        <li><a href="/prologue">The Prologue</a></li>
        <li><a href="/prayers">Daily Prayers</a></li>
      </ul>
    </div>

    <!-- COL 4: Parish Life + My Parish + Connect -->
    <div>
      <span class="footer-col-head">Parish Life</span>
      <ul class="footer-nav">
        <li><a href="/news">News &amp; Announcements</a></li>
        <li><a href="/bulletins">Parish Bulletins</a></li>
        <li><a href="/gallery">Gallery</a></li>
        <li><a href="/videos">Videos</a></li>
        <li><a href="/cemeteries">Cemeteries</a></li>
        <li><a href="/give">Give &amp; Support</a></li>
      </ul>
      <span class="footer-nav-sub">My Parish</span>
      <ul class="footer-nav">
        <li><a href="/my-journey">My Journey</a></li>
      </ul>
      <span class="footer-nav-sub">Connect</span>
      <p class="footer-meta" style="line-height:2.2">
        Vespers &middot; Saturdays 5:00 PM<br>
        Divine Liturgy &middot; Sundays 9:30 AM
      </p>
      <p class="footer-meta" style="margin-top:.75rem">
        <a href="https://maps.google.com/?q=109+Grand+Street+Jersey+City+NJ+07302" target="_blank" rel="noopener">109 Grand Street &middot; Jersey City, NJ</a><br>
        <a href="tel:+12014341986">(201) 434-1986</a><br>
        <a href="mailto:ssppnj@gmail.com">ssppnj@gmail.com</a>
      </p>
    </div>

  </div>
  <div class="footer-bottom">
    <p class="footer-copy">&copy; Saints Peter &amp; Paul Orthodox Cathedral. All Rights Reserved.</p>
    <p class="footer-addr">
      <a href="https://maps.google.com/?q=109+Grand+Street+Jersey+City+NJ+07302" target="_blank" rel="noopener" style="color:inherit;border-bottom:1px solid rgba(246,241,232,.25)">109 Grand Street &middot; Jersey City, NJ 07302</a><br>
      (201) 434-1986 &middot; <a href="mailto:ssppnj@gmail.com" style="color:inherit">ssppnj@gmail.com</a>
    </p>
  </div>
</footer>
<!-- ═══════════════════════════════════════════
     FOOTER END
     ═══════════════════════════════════════════ -->
```

---

## Footer CSS — Verify on Every Page

Every page must have the 4-column footer CSS.
Many pages currently have a 3-column grid — this must be updated.

The critical CSS line is:
```css
.footer-cols {
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
}
```

If a page has:
```css
.footer-cols { grid-template-columns: 1fr 1fr 1fr; }
```
or any 3-column variant, replace it with the 4-column version above.

Also verify these classes exist on every page:
- `.footer-logo-img` — logo image sizing
- `.footer-meta` — diocese info text
- `.footer-socials` — social links row
- `.footer-col-head` — column headings
- `.footer-nav-sub` — sub-headings within columns
- `.footer-nav` — link list
- `.footer-blurb` — italic descriptive text
- `.footer-bottom` — bottom bar
- `.footer-copy` — copyright line
- `.footer-addr` — address line

If any are missing, copy the footer CSS block from `index.html`.

**Remove from every page:**
- `.footer-cross` CSS and any `<span class="footer-cross">` HTML — no ornaments

---

## Implementation — Page by Page

### STEP 1 — index.html first

Find the footer:
```bash
grep -n "<footer>\|</footer>" index.html
```

Replace everything from `<footer>` through `</footer>` with Version A above.

Verify in browser:
- 4 columns visible on desktop
- Newsletter signup present in col 1
- YouTube link present in socials
- All links point to correct slugs
- Address is 109 Grand Street
- Bottom bar shows correct email and phone
- No cross ornament

```bash
git add index.html
git commit -m "Update index.html footer to canonical 4-column version"
```

---

### STEP 2 — All other pages (34 pages)

For each page, find and replace the footer:

```bash
grep -n "<footer>\|</footer>" FILENAME.html
```

Replace everything from `<footer>` through `</footer>` with Version B.

Also check and fix footer CSS if the page has a 3-column grid.
Also remove any `<span class="footer-cross">` if present.

**Work through pages in this order:**

**About Us:**
- [ ] `our-parish.html`
- [ ] `church-history.html`
- [ ] `our-beliefs.html`
- [ ] `administration.html`
- [ ] `council.html`
- [ ] `bylaws.html`

**Inquirers:**
- [ ] `about-orthodoxy.html`
- [ ] `catechesis.html`
- [ ] `catechesis-history.html`
- [ ] `bible-study.html`
- [ ] `fasting.html`
- [ ] `visit.html`
- [ ] `contact-us.html`

**Calendar:**
- [ ] `schedule.html`
- [ ] `readings.html`
- [ ] `saints.html`
- [ ] `prologue.html`
- [ ] `saint-of-the-day.html`

**Worship:**
- [ ] `divine-liturgy.html`
- [ ] `vespers.html`
- [ ] `liturgy-history.html`
- [ ] `liturgy-book.html`
- [ ] `vespers-book.html`
- [ ] `prayers.html`

**Parish Life:**
- [ ] `news.html`
- [ ] `bulletins.html`
- [ ] `bulletin.html`
- [ ] `gallery.html`
- [ ] `videos.html`
- [ ] `cemeteries.html`
- [ ] `give.html`
- [ ] `giving-project.html`

**Other:**
- [ ] `article.html`
- [ ] `about-liturgy.html` — check if still exists

Commit every 4-5 pages:
```bash
git add -A
git commit -m "Standardize footer — [page names]"
```

---

## Final Verification

Run after all pages are done:

```bash
echo "=== Stale slugs in footers ==="

echo "about-our-church (expect 0):"
grep -c "about-our-church" *.html | grep -v ":0" | wc -l

echo "catechesis-series (expect 0):"
grep -c "catechesis-series" *.html | grep -v ":0" | wc -l

echo "/donate (expect 0):"
grep -c '"/donate"' *.html | grep -v ":0" | wc -l

echo "great-vespers (expect 0):"
grep -c "great-vespers" *.html | grep -v ":0" | wc -l

echo "saint-of-the-day in footer (expect 0 — removed from nav and footer):"
grep -n "saint-of-the-day" *.html | grep -i "footer"

echo ""
echo "=== Wrong address (expect 0) ==="
grep -rl "723 Madison\|555-1234" *.html | wc -l

echo ""
echo "=== Footer cross ornament (expect 0) ==="
grep -rl "footer-cross" *.html | wc -l

echo ""
echo "=== tithe.ly in footer (expect 0 — all give links use /give) ==="
grep -n "tithe.ly" *.html | grep -i "footer" | wc -l

echo ""
echo "=== Missing YouTube link ==="
grep -rL "youtube.com/@SSPPJC" *.html | wc -l

echo ""
echo "=== 3-column footer grid (expect 0) ==="
grep -rl "grid-template-columns:1fr 1fr 1fr\|grid-template-columns: 1fr 1fr 1fr" *.html | wc -l
```

All counts should be 0 except the YouTube check — that one
should match the total number of HTML files (every page should have it).

---

## Final Push

```bash
git add -A
git commit -m "Standardize footer across all pages — 4 columns, correct info, canonical links"
git push origin main
```

After Netlify deploys, spot-check:
- `prayers.html` — confirm address is now 109 Grand Street, not 723 Madison Ave
- `fasting.html` — confirm 4 columns and YouTube link present
- `index.html` — confirm newsletter still present, no regression
- Any page — confirm My Journey link appears in col 4

---

## Notes for Future Pages

When a new page is added:
1. Copy Version B footer exactly
2. No modifications needed — it is complete as-is
3. The `/my-journey` link is a placeholder until that page is built —
   it will 404 until the companion system is implemented, which is fine

When Facebook and Instagram URLs are confirmed, do a single
find-and-replace across all pages to update the `href="#"` placeholders.
