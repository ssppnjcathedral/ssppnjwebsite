#!/usr/bin/env node
/**
 * fetch-prologue.js
 * Scrapes all 366 days of the Prologue of Ohrid from myrrh-bearers.org
 * and saves them as _data/prologue.json
 *
 * Usage:
 *   node fetch-prologue.js
 *
 * Output:
 *   _data/prologue.json  (keyed by "MM-DD", e.g. "03-26")
 *
 * Dependencies:
 *   npm install node-fetch node-html-parser
 */

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { parse } = require('node-html-parser');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = 'https://myrrh-bearers.org/prologue';
const OUTPUT_PATH = path.join(__dirname, '_data', 'prologue.json');
const DELAY_MS = 800; // be polite — ~800ms between requests

const MONTHS = [
  { name: 'january',   days: 31 },
  { name: 'february',  days: 29 }, // include leap day
  { name: 'march',     days: 31 },
  { name: 'april',     days: 30 },
  { name: 'may',       days: 31 },
  { name: 'june',      days: 30 },
  { name: 'july',      days: 31 },
  { name: 'august',    days: 31 },
  { name: 'september', days: 30 },
  { name: 'october',   days: 31 },
  { name: 'november',  days: 30 },
  { name: 'december',  days: 31 },
];

const MONTH_NUMBERS = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanText(str) {
  return str
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

/**
 * Parse a single day page HTML into structured data.
 */
function parseDayPage(html, month, day, url) {
  const root = parse(html);

  // ── Title ──────────────────────────────────────────────────────────────────
  const h1 = root.querySelector('h1');
  const rawTitle = h1 ? cleanText(h1.text) : '';
  // Strip the "Prologue from Ochrid - " prefix
  const title = rawTitle.replace(/^Prologue from Ochrid\s*[-–]\s*/i, '').trim();

  // ── Body: everything after the nav, before the footer ─────────────────────
  // The content is in the body; we want paragraphs and headers after the h1.
  // Strategy: collect all <p> and <h4> elements, then walk through them.

  const saints = [];
  let reflection = '';
  let contemplation = '';
  let homily = { scripture: '', text: '' };

  // Grab all meaningful block elements after h1
  const allElements = root.querySelectorAll('p, h4, blockquote');

  let mode = 'saints'; // states: saints | reflection | contemplation | homily
  let homilyLines = [];
  let contemplationLines = [];

  for (const el of allElements) {
    const tag = el.tagName.toLowerCase();
    const text = cleanText(el.text);

    if (!text) continue;

    // ── Section headers (h4) ────────────────────────────────────────────────
    if (tag === 'h4') {
      const lower = text.toLowerCase();
      if (lower.includes('reflection')) { mode = 'reflection'; continue; }
      if (lower.includes('contemplation')) { mode = 'contemplation'; continue; }
      if (lower.includes('homily')) { mode = 'homily'; continue; }
      continue;
    }

    // ── Blockquote = homily scripture citation ───────────────────────────────
    if (tag === 'blockquote') {
      if (mode === 'homily') {
        homily.scripture = text;
      }
      continue;
    }

    // ── Paragraph handling ───────────────────────────────────────────────────
    if (tag === 'p') {

      // Skip nav paragraphs (they contain lots of pipe-separated links)
      if (text.includes('|') && text.length < 400) continue;

      // Skip copyright / attribution lines
      if (text.startsWith('©') || text.startsWith('The Prologue From Ochrid')) continue;

      switch (mode) {

        case 'saints': {
          // Saint entries start with a bold element like "1. The Holy Archangel Gabriel."
          const boldEl = el.querySelector('strong, b');
          if (boldEl) {
            const boldText = cleanText(boldEl.text);
            // Match numbered saint headers: "1. Saint Name."
            const headerMatch = boldText.match(/^(\d+)\.\s+(.+?)\.?\s*$/);
            if (headerMatch) {
              // The rest of the paragraph text after the bold element
              const saintBody = cleanText(text.replace(boldText, ''));
              saints.push({
                number: parseInt(headerMatch[1], 10),
                name: headerMatch[2].trim(),
                text: saintBody,
              });
              break;
            }
          }

          // Continuation paragraph for the most recent saint (no bold header)
          if (saints.length > 0) {
            // Append to the last saint's text
            saints[saints.length - 1].text += ' ' + text;
            saints[saints.length - 1].text = saints[saints.length - 1].text.trim();
          }
          break;
        }

        case 'reflection': {
          reflection += (reflection ? ' ' : '') + text;
          break;
        }

        case 'contemplation': {
          contemplationLines.push(text);
          break;
        }

        case 'homily': {
          // Skip "To You glory and thanks always. Amen." closing line
          if (text.match(/^To You glory/i)) break;
          homilyLines.push(text);
          break;
        }
      }
    }
  }

  homily.text = homilyLines.join('\n\n').trim();
  contemplation = contemplationLines.join('\n').trim();
  reflection = reflection.trim();

  return {
    month,
    day,
    title,
    saints,
    reflection,
    contemplation,
    homily,
    sourceUrl: url,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`Created directory: ${outDir}`);
  }

  const prologue = {};
  let total = 0;
  let errors = [];

  for (const { name: month, days } of MONTHS) {
    const monthNum = MONTH_NUMBERS[month];

    for (let day = 1; day <= days; day++) {
      const dayStr = String(day).padStart(2, '0');
      const key = `${monthNum}-${dayStr}`;
      const url = `${BASE_URL}/${month}/${day}.htm`;

      process.stdout.write(`Fetching ${key} (${month} ${day})... `);

      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; parish-site-bot/1.0)' },
          timeout: 15000,
        });

        if (!res.ok) {
          // Feb 29 may 404 on non-leap-year sites — log and skip gracefully
          if (res.status === 404) {
            console.log(`404 — skipped`);
            errors.push({ key, url, error: '404 Not Found' });
            await sleep(DELAY_MS);
            continue;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const html = await res.text();
        const data = parseDayPage(html, month, day, url);
        prologue[key] = data;
        total++;
        console.log(`✓ (${data.saints.length} saints)`);

      } catch (err) {
        console.log(`✗ ERROR: ${err.message}`);
        errors.push({ key, url, error: err.message });
      }

      await sleep(DELAY_MS);
    }
  }

  // ── Write output ────────────────────────────────────────────────────────────
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(prologue, null, 2), 'utf8');

  console.log('\n────────────────────────────────────────');
  console.log(`✅ Done. ${total} days scraped.`);
  console.log(`📄 Output: ${OUTPUT_PATH}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} error(s):`);
    for (const e of errors) {
      console.log(`   ${e.key}  ${e.url}  →  ${e.error}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
