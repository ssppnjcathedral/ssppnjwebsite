# PAGE-RENAMES.md
## Saints Peter & Paul Orthodox Cathedral — Slug Renames & Redirects

Implementation guide for Claude Code. Complete all steps in the exact order listed.
Do not skip steps. Verify each step before moving to the next.

---

## Overview of Changes

| Current File | New File | Old URL | New URL | References |
|---|---|---|---|---|
| `about-our-church.html` | `our-parish.html` | `/about-our-church` | `/our-parish` | 118 |
| `catechesis-series.html` | `lectures.html` | `/catechesis-series` | `/lectures` | 34 |
| `about-liturgy.html` | `liturgy-history.html` | `/about-liturgy` | `/liturgy-history` | 9 |
| `great-vespers.html` | `vespers-book.html` | `/great-vespers` | `/vespers-book` | 6 |
| `donate.html` | retired — redirect only | `/donate` | → `/give` | 48 |
| `config.yml` | address fix only | `111 Grand Street` | `109 Grand Street` | 1 |

**Total link references to update: ~215 across ~35 files.**

---

## Critical Rules Before Starting

- **Always `grep` before replacing** to confirm the exact string exists
- **One rename at a time** — complete all steps for one rename before starting the next
- **Re-read after every edit** to confirm changes landed correctly
- **Never use find-and-replace on minified single-line CSS/JS** — use Python-based replacement instead
- **Commit after each rename** with a clear message before proceeding to the next
- Do not rename hero image files — the images themselves stay at their existing paths

---

## STEP 0 — Verify Starting State

Before doing anything, run these checks:

```bash
# Confirm all four files exist
ls -la about-our-church.html catechesis-series.html about-liturgy.html great-vespers.html donate.html

# Confirm none of the new names already exist
ls our-parish.html lectures.html liturgy-history.html vespers-book.html 2>/dev/null && echo "CONFLICT — stop" || echo "Clean — proceed"

# Count total references to sanity-check before starting
grep -rl "about-our-church" *.html | wc -l
grep -rl "catechesis-series" *.html | wc -l
grep -rl "about-liturgy" *.html | wc -l
grep -rl "great-vespers" *.html | wc -l
grep -rl '"/donate"' *.html | wc -l
```

Expected output: 35 files, 11 files, 4 files, 2 files, ~24 files.
If counts differ significantly, stop and investigate before proceeding.

---

## STEP 1 — Rename `about-our-church.html` → `our-parish.html`

This is the highest-impact rename. 118 references across 35 files.

### 1a. Rename the file
```bash
mv about-our-church.html our-parish.html
```

### 1b. Update self-references inside the renamed file
Inside `our-parish.html`, find and replace all instances of `/about-our-church` with `/our-parish`.

```bash
# First grep to confirm what's there
grep -n "about-our-church" our-parish.html

# Then replace — use Python for safety on minified lines
python3 -c "
import re
with open('our-parish.html', 'r') as f:
    content = f.read()
content = content.replace('/about-our-church', '/our-parish')
# Also update hero image path if it referenced the old slug in a local path
# NOTE: Do NOT rename the actual image file — just the reference if it uses /images/heroes/about-our-church.webp
# The hero image stays at about-our-church.webp — no image rename needed
with open('our-parish.html', 'w') as f:
    f.write(content)
print('Done')
"

# Verify no old references remain
grep -n "about-our-church" our-parish.html && echo "REFERENCES REMAIN — check above" || echo "Clean"
```

### 1c. Update all other HTML files
Run this for every file in the list below. For each file, replace `/about-our-church` with `/our-parish`.

**Files to update (35 total):**
`about-liturgy.html`, `about-orthodoxy.html`, `administration.html`, `article.html`, `bible-study.html`, `bulletin.html`, `bulletins.html`, `bylaws.html`, `catechesis-series.html`, `catechesis.html`, `cemeteries.html`, `church-history.html`, `contact-us.html`, `council.html`, `divine-liturgy.html`, `donate.html`, `fasting.html`, `gallery.html`, `give.html`, `giving-project.html`, `great-vespers.html`, `index.html`, `liturgy-book.html`, `news.html`, `our-beliefs.html`, `prayers.html`, `prologue.html`, `readings.html`, `saint-of-the-day.html`, `saints.html`, `schedule.html`, `vespers.html`, `videos.html`, `visit.html`

```bash
# Batch replace across all HTML files in one command
python3 -c "
import os, glob

files = glob.glob('*.html')
count = 0
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    updated = original.replace('/about-our-church', '/our-parish')
    if updated != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f'Updated: {filepath}')
        count += 1
print(f'Total files updated: {count}')
"

# Verify no references remain anywhere
grep -rl "about-our-church" *.html && echo "REFERENCES REMAIN" || echo "All clean"
```

### 1d. Add redirect to `netlify.toml`
Add this block to `netlify.toml` **before** the existing `/donate` redirect:

```toml
[[redirects]]
  from = "/about-our-church"
  to = "/our-parish"
  status = 301
```

### 1e. Verify
```bash
# Should return nothing
grep -rn "about-our-church" *.html *.yml

# our-parish.html should exist
ls -la our-parish.html

# about-our-church.html should NOT exist
ls about-our-church.html 2>/dev/null && echo "OLD FILE STILL EXISTS — delete it" || echo "Good"
```

### 1f. Commit
```bash
git add -A
git commit -m "Rename about-our-church to our-parish, add 301 redirect"
```

---

## STEP 2 — Rename `catechesis-series.html` → `lectures.html`

34 references across 11 files.

### 2a. Rename the file
```bash
mv catechesis-series.html lectures.html
```

### 2b. Batch replace all references
```bash
python3 -c "
import glob
files = glob.glob('*.html')
count = 0
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    updated = original.replace('/catechesis-series', '/lectures')
    if updated != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f'Updated: {filepath}')
        count += 1
print(f'Total files updated: {count}')
"

# Verify
grep -rl "catechesis-series" *.html && echo "REFERENCES REMAIN" || echo "All clean"
```

### 2c. Add redirect to `netlify.toml`
```toml
[[redirects]]
  from = "/catechesis-series"
  to = "/lectures"
  status = 301
```

### 2d. Commit
```bash
git add -A
git commit -m "Rename catechesis-series to lectures, add 301 redirect"
```

---

## STEP 3 — Rename `about-liturgy.html` → `liturgy-history.html`

9 references across 4 files: `about-liturgy.html` itself, `article.html`, `fasting.html`, `news.html`.

### 3a. Rename the file
```bash
mv about-liturgy.html liturgy-history.html
```

### 3b. Batch replace all references
```bash
python3 -c "
import glob
files = glob.glob('*.html')
count = 0
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    updated = original.replace('/about-liturgy', '/liturgy-history')
    if updated != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f'Updated: {filepath}')
        count += 1
print(f'Total files updated: {count}')
"

# Verify
grep -rl "about-liturgy" *.html && echo "REFERENCES REMAIN" || echo "All clean"
```

### 3c. Add redirect to `netlify.toml`
```toml
[[redirects]]
  from = "/about-liturgy"
  to = "/liturgy-history"
  status = 301
```

### 3d. Commit
```bash
git add -A
git commit -m "Rename about-liturgy to liturgy-history, add 301 redirect"
```

---

## STEP 4 — Rename `great-vespers.html` → `vespers-book.html`

6 references across 2 files: `great-vespers.html` itself and `vespers.html`.

### 4a. Rename the file
```bash
mv great-vespers.html vespers-book.html
```

### 4b. Batch replace all references
```bash
python3 -c "
import glob
files = glob.glob('*.html')
count = 0
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    updated = original.replace('/great-vespers', '/vespers-book')
    if updated != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f'Updated: {filepath}')
        count += 1
print(f'Total files updated: {count}')
"

# Verify
grep -rl "great-vespers" *.html && echo "REFERENCES REMAIN" || echo "All clean"
```

### 4c. Add redirect to `netlify.toml`
```toml
[[redirects]]
  from = "/great-vespers"
  to = "/vespers-book"
  status = 301
```

### 4d. Commit
```bash
git add -A
git commit -m "Rename great-vespers to vespers-book, add 301 redirect"
```

---

## STEP 5 — Retire `donate.html`, consolidate to `/give`

`donate.html` stays as a file for now but is dead — all links point to `/give`.
A redirect already exists in `netlify.toml` from the earlier session.
This step cleans up all remaining `/donate` link references so no page actively links there.

48 references across ~24 files.

### 5a. Verify the redirect already exists
```bash
grep -A3 '"/donate"' netlify.toml
```
Should show `from = "/donate"`, `to = "/give"`, `status = 301`.
If it does not exist, add it now:
```toml
[[redirects]]
  from = "/donate"
  to = "/give"
  status = 301
```

### 5b. Replace all `/donate` link references with `/give`
```bash
python3 -c "
import glob, re
files = glob.glob('*.html')
count = 0
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    # Replace href='/donate' and href=\"/donate\" patterns
    updated = re.sub(r'href=[\"\']/donate[\"\'»]', lambda m: m.group(0).replace('/donate', '/give'), original)
    # Also catch bare /donate in href context
    updated = updated.replace('href=\"/donate\"', 'href=\"/give\"')
    updated = updated.replace(\"href='/donate'\", \"href='/give'\")
    if updated != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f'Updated: {filepath}')
        count += 1
print(f'Total files updated: {count}')
"

# Verify — should return nothing except donate.html itself and netlify.toml
grep -rn '"/donate"\|/donate"' *.html | grep -v "donate.html"
```

### 5c. Delete `donate.html`
The redirect in `netlify.toml` handles anyone with old bookmarks or external links.
The file itself is no longer needed.

```bash
rm donate.html

# Verify it's gone
ls donate.html 2>/dev/null && echo "FILE STILL EXISTS — delete manually" || echo "Good — deleted"
```

### 5d. Commit
```bash
git add -A
git commit -m "Consolidate all /donate links to /give, delete donate.html, redirect handles old URLs"
```

---

## STEP 6 — Fix address in `config.yml`

One character fix. The location default says `111 Grand Street` — it should be `109 Grand Street`.

### 6a. Find and confirm the error
```bash
grep -n "111 Grand\|109 Grand" config.yml
```

### 6b. Fix it
```bash
python3 -c "
with open('config.yml', 'r') as f:
    content = f.read()
content = content.replace('111 Grand Street', '109 Grand Street')
with open('config.yml', 'w') as f:
    f.write(content)
print('Fixed')
"

# Verify
grep -n "Grand Street" config.yml
```

### 6c. Commit
```bash
git add config.yml
git commit -m "Fix address in config.yml: 111 -> 109 Grand Street"
```

---

## STEP 7 — Final Verification

Run this full audit after all renames are complete:

```bash
echo "=== Checking for stale references ==="

echo "about-our-church (expect 0):"
grep -rl "about-our-church" *.html | wc -l

echo "catechesis-series (expect 0):"
grep -rl "catechesis-series" *.html | wc -l

echo "about-liturgy (expect 0):"
grep -rl "about-liturgy" *.html | wc -l

echo "great-vespers (expect 0):"
grep -rl "great-vespers" *.html | wc -l

echo "/donate links (expect 0 outside donate.html):"
grep -rl '"/donate"' *.html | grep -v "donate.html" | wc -l

echo ""
echo "=== Checking new files exist ==="
ls -la our-parish.html lectures.html liturgy-history.html vespers-book.html

echo ""
echo "=== Checking redirects in netlify.toml ==="
grep -A2 "from = " netlify.toml

echo ""
echo "=== Address fix ==="
grep "Grand Street" config.yml
```

**All counts should be 0. All four new files should exist. Four redirects should appear in netlify.toml.**

---

## STEP 8 — Final Commit and Push

```bash
git add -A
git commit -m "Complete page rename session: our-parish, lectures, liturgy-history, vespers-book"
git push origin main
```

Netlify will auto-deploy. After deploy (~2 min), test the following redirects live:

- `peterandpaulcathedral.com/about-our-church` → should redirect to `/our-parish`
- `peterandpaulcathedral.com/catechesis-series` → should redirect to `/lectures`
- `peterandpaulcathedral.com/about-liturgy` → should redirect to `/liturgy-history`
- `peterandpaulcathedral.com/great-vespers` → should redirect to `/vespers-book`
- `peterandpaulcathedral.com/donate` → should redirect to `/give`

---

## Post-Rename Notes for Nav Standardization

After this session is complete and verified, the correct URLs for the canonical nav are:

| Display Name | URL |
|---|---|
| About Our Church (display: "Our Parish") | `/our-parish` |
| Catechesis Series (display: "Lectures") | `/lectures` |
| History of the Liturgy | `/liturgy-history` |
| Great Vespers (display: "Vespers Book") | `/vespers-book` |
| Give & Support | `/give` |

The nav standardization markdown will use these URLs. Do not begin nav standardization until this rename session is fully deployed and verified.

---

## What This Does NOT Change

- Hero image filenames — `/images/heroes/about-our-church.webp` stays as-is, just not renamed
- The `donate.html` file itself — it stays but is orphaned with a redirect. It can be deleted later once the redirect has been live for 30+ days
- Any external links pointing to the old URLs — the 301 redirects handle those permanently
- `saint-of-the-day.html` — this file already redirects to `saints.html` based on earlier work; no action needed here
