#!/usr/bin/env node
/**
 * fetch-oca-saints.js
 * Scrapes all 366 days of Lives of the Saints from oca.org
 * Writes 12 monthly JSON files to _data/ to stay under Netlify's 2MB file limit.
 *
 *   _data/oca-saints-january.json
 *   _data/oca-saints-february.json
 *   ... etc
 *
 * Each file is keyed by day number: { "1": { date, saints: [...] }, "2": {...}, ... }
 *
 * Each saint object:
 *   {
 *     name:    "Entry of Our Lord into Jerusalem (Palm Sunday)",
 *     image:   "https://images.oca.org/icons/xsm/greatfeasts/entryintojerusalem.jpg",
 *     excerpt: "Palm Sunday is the celebration of...",
 *     slug:    "20-entry-of-our-lord-into-jerusalem-palm-sunday",
 *     url:     "https://www.oca.org/saints/lives/2026/04/05/20-entry-of-our-lord-..."
 *   }
 *
 * Usage:   node fetch-oca-saints.js
 * Deps:    npm install node-fetch
 *
 * Note: Uses 2026 dates throughout. Moveable feasts (Pascha cycle) will shift
 * in future years — re-run annually to keep those accurate. Fixed-calendar
 * saints are stable across years.
 */

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const fs    = require('fs');
const path  = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const YEAR     = '2026';
const BASE_URL = 'https://www.oca.org/saints/lives';
const DATA_DIR = path.join(__dirname, '_data');
const DELAY_MS = 900;   // be polite to OCA servers

const MONTHS = [
  { name: 'january',   num: '01', days: 31 },
  { name: 'february',  num: '02', days: 29 },
  { name: 'march',     num: '03', days: 31 },
  { name: 'april',     num: '04', days: 30 },
  { name: 'may',       num: '05', days: 31 },
  { name: 'june',      num: '06', days: 30 },
  { name: 'july',      num: '07', days: 31 },
  { name: 'august',    num: '08', days: 31 },
  { name: 'september', num: '09', days: 30 },
  { name: 'october',   num: '10', days: 31 },
  { name: 'november',  num: '11', days: 30 },
  { name: 'december',  num: '12', days: 31 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function pad2(n) { return String(n).padStart(2, '0'); }

function clean(str) {
  return (str || '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&copy;/g, '©')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function stripTags(str) {
  return (str || '').replace(/<[^>]*>/g, '');
}

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Parses the OCA daily listing page HTML.
 *
 * Actual OCA page structure per saint entry:
 *
 *   <img src="https://images.oca.org/icons/xsm/..." alt="Saint Name">
 *   <h2>Saint Name</h2>
 *   <p>Short excerpt text...</p>
 *   <a href="/saints/lives/2026/MM/DD/slug">Read the Life</a>
 *   <a href="/saints/troparia/...">Troparion & Kontakion</a>
 *
 * Strategy: anchor on every "Read the Life" link (href contains /saints/lives/).
 * From each anchor position, scan backward for the nearest <h2> (name) and
 * <img> (icon), and forward/backward for the <p> excerpt.
 */
function parseDayPage(html, month, day, url) {
  const saints = [];

  // Grab the main content block (between <main> tags if present, else full page)
  let content = html;
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) content = mainMatch[1];

  // Find all "Read the Life" links — one per saint
  const lifeLinkPattern = /<a[^>]+href="([^"]*\/saints\/lives\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let linkMatch;
  const lifeLinks = [];
  while ((linkMatch = lifeLinkPattern.exec(content)) !== null) {
    const linkText = clean(stripTags(linkMatch[2]));
    // Only grab "Read the Life" links, skip troparia/kontakia links
    if (/read\s+the\s+life/i.test(linkText)) {
      lifeLinks.push({ href: linkMatch[1], index: linkMatch.index, fullLen: linkMatch[0].length });
    }
  }

  for (let li = 0; li < lifeLinks.length; li++) {
    const link      = lifeLinks[li];
    const prevLink  = lifeLinks[li - 1];

    const lifeUrl   = link.href.startsWith('http')
      ? link.href
      : 'https://www.oca.org' + link.href;
    const slugMatch = lifeUrl.match(/\/saints\/lives\/\d{4}\/\d{2}\/\d{2}\/(.+)$/);
    const slug      = slugMatch ? slugMatch[1] : '';

    // The block of HTML between the previous life link and this one
    const blockStart = prevLink ? prevLink.index + prevLink.fullLen : 0;
    const blockEnd   = link.index;
    const block      = content.slice(blockStart, blockEnd);

    // ── Name: last <h2> in this block ────────────────────────────────────────
    const h2s  = [...block.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
    const name = h2s.length > 0 ? clean(stripTags(h2s[h2s.length - 1][1])) : '';
    if (!name) continue;

    // ── Image: last OCA CDN <img> in this block ───────────────────────────────
    const imgsInSlice  = [...block.matchAll(/<img[^>]+>/gi)];
    let image          = '';
    if (imgsInSlice.length > 0) {
      const lastImg  = imgsInSlice[imgsInSlice.length - 1][0];
      const srcMatch = lastImg.match(/src="([^"]+)"/i);
      // Only use OCA image CDN — skip nav logos, other site icons, etc.
      if (srcMatch && srcMatch[1].includes('images.oca.org')) {
        image = srcMatch[1];
      }
    }

    // ── Excerpt: first <p> in this block ─────────────────────────────────────
    const pMatch     = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const excerptRaw = pMatch ? clean(stripTags(pMatch[1])) : '';
    // Trim to ~300 chars at a sentence boundary
    let excerpt = excerptRaw;
    if (excerpt.length > 320) {
      const trimmed = excerpt.slice(0, 320);
      const lastDot = trimmed.lastIndexOf('.');
      excerpt = lastDot > 200 ? trimmed.slice(0, lastDot + 1) : trimmed + '…';
    }

    saints.push({ name, image, excerpt, slug, url: lifeUrl });
  }

  return { month, day, date: `${YEAR}-${pad2(month)}-${pad2(day)}`, saints };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  let grandTotal = 0;
  const errors   = [];

  for (const { name: monthName, num: monthNum, days } of MONTHS) {
    const monthData = {};
    let monthTotal  = 0;

    for (let day = 1; day <= days; day++) {
      const dd  = pad2(day);
      const url = `${BASE_URL}/${YEAR}/${monthNum}/${dd}`;
      process.stdout.write(`Fetching ${monthName} ${day}... `);

      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; orthodox-parish-bot/1.0; saints-peter-paul-jc)',
            'Accept':     'text/html,application/xhtml+xml',
          },
        });

        if (!res.ok) {
          if (res.status === 404) {
            console.log('404 — skipped');
            errors.push({ month: monthName, day, error: '404' });
            await sleep(DELAY_MS);
            continue;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const html = await res.text();
        const data = parseDayPage(html, monthNum, day, url);
        monthData[String(day)] = data;
        monthTotal++;
        grandTotal++;
        console.log(`✓ (${data.saints.length} saints)`);

      } catch (err) {
        console.log(`✗ ${err.message}`);
        errors.push({ month: monthName, day, error: err.message });
      }

      await sleep(DELAY_MS);
    }

    // Write monthly file
    const outPath = path.join(DATA_DIR, `oca-saints-${monthName}.json`);
    fs.writeFileSync(outPath, JSON.stringify(monthData, null, 2), 'utf8');
    const kb = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`\n📄 Wrote oca-saints-${monthName}.json (${monthTotal} days, ${kb}KB)\n`);
  }

  console.log('────────────────────────────────────────');
  console.log(`✅ Done. ${grandTotal} days scraped across 12 files.`);

  if (errors.length) {
    console.log(`\n⚠️  ${errors.length} error(s):`);
    errors.forEach(e => console.log(`   ${e.month} ${e.day}  →  ${e.error}`));
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
