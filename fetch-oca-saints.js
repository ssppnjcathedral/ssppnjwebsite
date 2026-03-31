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
 * The page structure for each saint entry looks like:
 *
 *   <img ... src="https://images.oca.org/icons/xsm/..." alt="Saint Name">
 *   <h2><a href="/saints/lives/2026/MM/DD/slug">Saint Name</a></h2>
 *   <p>Short excerpt text...</p>
 *   <a href="...">Read the Life</a>
 *
 * We find each <h2> that contains a saints/lives link as our anchor,
 * then look backwards for the nearest <img> and forwards for the <p> excerpt.
 */
function parseDayPage(html, month, day, url) {
  const saints = [];

  // Grab the main content block (between <main> tags if present, else full page)
  let content = html;
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) content = mainMatch[1];

  // Find all saint entry h2 headings with a lives link
  const h2Pattern = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let h2Match;

  while ((h2Match = h2Pattern.exec(content)) !== null) {
    const h2Inner = h2Match[1];

    // Must contain a /saints/lives/ link — that's how we know it's a saint heading
    const linkMatch = h2Inner.match(/href="([^"]*\/saints\/lives\/[^"]+)"/i);
    if (!linkMatch) continue;

    const lifeUrl   = linkMatch[1].startsWith('http')
      ? linkMatch[1]
      : 'https://www.oca.org' + linkMatch[1];
    const slugMatch = lifeUrl.match(/\/saints\/lives\/\d{4}\/\d{2}\/\d{2}\/(.+)$/);
    const slug      = slugMatch ? slugMatch[1] : '';
    const name      = clean(stripTags(h2Inner));
    if (!name) continue;

    // ── Look backward from this h2 for the nearest <img> ─────────────────────
    // Only consider images that appear after the previous h2 (so each saint
    // gets its own icon, not a neighbour's).
    const prevH2Match  = [...content.slice(0, h2Match.index).matchAll(/<h2[^>]*>[\s\S]*?<\/h2>/gi)];
    const searchFrom   = prevH2Match.length > 0
      ? prevH2Match[prevH2Match.length - 1].index + prevH2Match[prevH2Match.length - 1][0].length
      : 0;
    const sliceForImg  = content.slice(searchFrom, h2Match.index);
    const imgsInSlice  = [...sliceForImg.matchAll(/<img[^>]+>/gi)];
    let image          = '';
    if (imgsInSlice.length > 0) {
      const lastImg  = imgsInSlice[imgsInSlice.length - 1][0];
      const srcMatch = lastImg.match(/src="([^"]+)"/i);
      // Only use OCA image CDN — skip nav logos, other site icons, etc.
      if (srcMatch && srcMatch[1].includes('images.oca.org')) {
        image = srcMatch[1];
      }
    }

    // ── Look forward from this h2 for the first <p> (excerpt) ────────────────
    const afterH2    = content.slice(h2Match.index + h2Match[0].length);
    const pMatch     = afterH2.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
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
