#!/usr/bin/env node
/**
 * fetch-prologue.js
 * Scrapes all 366 days of the Prologue of Ohrid from myrrh-bearers.org
 * and saves them as _data/prologue.json
 *
 * Usage:   node fetch-prologue.js
 * Output:  _data/prologue.json  (keyed by "MM-DD")
 * Deps:    npm install node-fetch
 */

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const fs    = require('fs');
const path  = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL    = 'https://myrrh-bearers.org/prologue';
const OUTPUT_PATH = path.join(__dirname, '_data', 'prologue.json');
const DELAY_MS    = 800;

const MONTHS = [
  { name: 'january',   days: 31 },
  { name: 'february',  days: 29 },
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
  january:'01', february:'02', march:'03',  april:'04',
  may:'05',     june:'06',     july:'07',   august:'08',
  september:'09', october:'10', november:'11', december:'12',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function clean(str) {
  return (str || '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&copy;/g, '©')
    .trim();
}

function stripTags(str) {
  return (str || '').replace(/<[^>]*>/g, '');
}

// ─── Parser ───────────────────────────────────────────────────────────────────
//
// ACTUAL HTML STRUCTURE on myrrh-bearers.org:
//
//   Saint header:  <b><p>1. Saint Name.</p>\n</b>
//   Saint body:    <p>Body text here...</p>
//
// The <b> wraps the <p>, not the other way around.
// This is non-standard HTML but it's consistent across the site.
//
// Section headers: <h4>Reflection</h4>  (sometimes inside <center>)
// Homily title:    <p class="rubric">About...</p>
// Scripture:       <blockquote>...</blockquote>
//
// ─────────────────────────────────────────────────────────────────────────────

function parseDayPage(html, month, day, url) {

  // ── Title ──────────────────────────────────────────────────────────────────
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title   = h1Match
    ? clean(stripTags(h1Match[1])).replace(/^Prologue from Ochrid\s*[-–]\s*/i, '').trim()
    : '';

  // ── Isolate body: after </h1>, before attribution ─────────────────────────
  const h1End = html.indexOf('</h1>');
  if (h1End === -1) return empty(month, day, title, url);

  let body = html.slice(h1End + 5);
  const footerIdx = body.indexOf('The Prologue From Ochrid');
  if (footerIdx !== -1) body = body.slice(0, footerIdx);

  // ── Split at h4 section headers ────────────────────────────────────────────
  // h4 tags are sometimes wrapped in <center>...</center> — handle both
  const h4All = [...body.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/gi)];
  const saintsRaw = h4All.length > 0 ? body.slice(0, h4All[0].index) : body;

  const sections = {};
  h4All.forEach((m, i) => {
    const label = clean(stripTags(m[1])).toLowerCase();
    const start = m.index + m[0].length;
    const end   = i + 1 < h4All.length ? h4All[i + 1].index : body.length;
    sections[label] = body.slice(start, end);
  });

  // ── Parse Saints ──────────────────────────────────────────────────────────
  //
  // Pattern: <b><p>N. Saint Name.</p>\n</b><p>body text</p>
  //
  // Strategy: find every <b>...<p>...</p>...</b> block — that's a saint header.
  // The very next <p> after the closing </b> is that saint's body text.
  // Subsequent <p> tags (until the next <b><p>) are continuations.

  const saints = [];

  // Match all <b> blocks that contain a <p> — these are saint headers
  // Use a forgiving regex since the </b> may come after the </p>
  const bpRegex = /<b[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/b>/gi;
  const bpMatches = [...saintsRaw.matchAll(bpRegex)];

  bpMatches.forEach((bm, i) => {
    const headerText = clean(stripTags(bm[1]));
    if (!headerText) return;

    // Extract optional number and name from "N. Saint Name." or "Saint Name."
    const numbered   = headerText.match(/^(\d+)\.\s+(.+?)\.?\s*$/);
    const unnumbered = headerText.match(/^(.+?)\.?\s*$/);

    let num, name;
    if (numbered) {
      num  = parseInt(numbered[1], 10);
      name = numbered[2].trim();
    } else if (unnumbered) {
      num  = saints.length + 1;
      name = unnumbered[1].trim();
    } else {
      return;
    }

    // Find body text: all <p> tags between this </b> and the next <b><p>
    const afterHeader = saintsRaw.slice(bm.index + bm[0].length);
    const nextBPos    = i + 1 < bpMatches.length
      ? bpMatches[i + 1].index - bm.index - bm[0].length
      : afterHeader.length;
    const bodyChunk   = afterHeader.slice(0, nextBPos);

    const bodyParas   = [...bodyChunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(pm => clean(stripTags(pm[1])))
      .filter(Boolean)
      .join(' ');

    saints.push({ number: num, name, text: bodyParas });
  });

  // ── Parse Reflection ──────────────────────────────────────────────────────
  let reflection = '';
  const reflKey  = Object.keys(sections).find(k => k.includes('reflection'));
  if (reflKey) {
    reflection = [...sections[reflKey].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(p => clean(stripTags(p[1]))).filter(Boolean).join('\n\n');
  }

  // ── Parse Contemplation ───────────────────────────────────────────────────
  let contemplation = '';
  const contKey = Object.keys(sections).find(k => k.includes('contemplation'));
  if (contKey) {
    const sec = sections[contKey];
    const parts = [
      ...[...sec.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(p => clean(stripTags(p[1]))),
      ...[...sec.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(l => clean(stripTags(l[1]))),
    ].filter(Boolean);
    contemplation = parts.join('\n');
  }

  // ── Parse Homily ──────────────────────────────────────────────────────────
  let homily = { scripture: '', text: '' };
  const homKey = Object.keys(sections).find(k => k.includes('homily'));
  if (homKey) {
    const sec = sections[homKey];

    // Rubric title (p.rubric = "About the citizens of the other world")
    const rubric = sec.match(/<p[^>]*class="rubric"[^>]*>([\s\S]*?)<\/p>/i);
    const rubricText = rubric ? clean(stripTags(rubric[1])) : '';

    // Scripture in blockquote
    const bq = sec.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    if (bq) {
      const bqText = clean(stripTags(bq[1]));
      homily.scripture = rubricText ? `${rubricText} — ${bqText}` : bqText;
    } else if (rubricText) {
      homily.scripture = rubricText;
    }

    // Body paragraphs — skip rubric and doxology
    homily.text = [...sec.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(p => clean(stripTags(p[1])))
      .filter(t => t
        && !t.match(/^To (Thee|You) (be |glory)/i)
        && t !== rubricText
      )
      .join('\n\n');
  }

  return { month, day, title, saints, reflection, contemplation, homily, sourceUrl: url };
}

function empty(month, day, title, url) {
  return { month, day, title, saints: [], reflection: '', contemplation: '',
           homily: { scripture: '', text: '' }, sourceUrl: url };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const prologue = {};
  let total      = 0;
  const errors   = [];

  for (const { name: month, days } of MONTHS) {
    const monthNum = MONTH_NUMBERS[month];

    for (let day = 1; day <= days; day++) {
      const dayStr = String(day).padStart(2, '0');
      const key    = `${monthNum}-${dayStr}`;
      const url    = `${BASE_URL}/${month}/${day}.htm`;

      process.stdout.write(`Fetching ${key} (${month} ${day})... `);

      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; parish-site-bot/1.0)' },
          timeout: 15000,
        });

        if (!res.ok) {
          if (res.status === 404) {
            console.log('404 — skipped');
            errors.push({ key, url, error: '404' });
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
        console.log(`✗ ${err.message}`);
        errors.push({ key, url, error: err.message });
      }

      await sleep(DELAY_MS);
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(prologue, null, 2), 'utf8');

  console.log('\n────────────────────────────────────────');
  console.log(`✅ Done. ${total} days scraped.`);
  console.log(`📄 Output: ${OUTPUT_PATH}`);
  if (errors.length) {
    console.log(`\n⚠️  ${errors.length} error(s):`);
    errors.forEach(e => console.log(`   ${e.key}  →  ${e.error}`));
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
