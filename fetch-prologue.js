#!/usr/bin/env node
/**
 * fetch-prologue.js
 * Scrapes all 366 days of the Prologue of Ohrid from myrrh-bearers.org
 * and saves them as _data/prologue.json
 *
 * Usage:   node fetch-prologue.js
 * Output:  _data/prologue.json  (keyed by "MM-DD")
 * Deps:    npm install node-fetch node-html-parser
 */

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const fs   = require('fs');
const path = require('path');

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
  january:'01', february:'02', march:'03', april:'04',
  may:'05',     june:'06',     july:'07',  august:'08',
  september:'09', october:'10', november:'11', december:'12',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function clean(str) {
  return (str || '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function stripTags(str) {
  return (str || '').replace(/<[^>]*>/g, '');
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseDayPage(html, month, day, url) {

  // ── Title ──────────────────────────────────────────────────────────────────
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title   = h1Match
    ? clean(stripTags(h1Match[1])).replace(/^Prologue from Ochrid\s*[-–]\s*/i, '').trim()
    : '';

  // ── Isolate body content between </h1> and the attribution footer ──────────
  const h1End = html.indexOf('</h1>');
  if (h1End === -1) return empty(month, day, title, url);

  let body = html.slice(h1End + 5);
  const footerIdx = body.indexOf('The Prologue From Ochrid');
  if (footerIdx !== -1) body = body.slice(0, footerIdx);

  // ── Split at h4 section headers ────────────────────────────────────────────
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
  // Two patterns used on this site:
  //
  // Pattern A (most days) — numbered:
  //   <p><strong>1. Saint Name.</strong> body text</p>
  //
  // Pattern B (first entry on some days) — unnumbered:
  //   <p><strong>St John the Baptist.</strong> body text</p>
  //   followed later by <p><strong>2. Next Saint.</strong> ...</p>
  //
  // Strategy: treat ANY paragraph that opens with a <strong> or <b> element
  // as a new saint header. Number is optional; if absent, auto-assign.

  const saints = [];
  const pAll   = [...saintsRaw.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];

  for (const pm of pAll) {
    const inner = pm[1];
    const pText = clean(stripTags(inner));
    if (!pText) continue;

    // Does this paragraph start with a bold element?
    const boldMatch = inner.match(/^\s*<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/i);
    if (boldMatch) {
      const boldText = clean(stripTags(boldMatch[1]));

      // Skip nav or attribution bolds (very long or contain '|')
      if (boldText.includes('|') || boldText.length > 120) continue;

      // Extract optional number and name
      // Matches: "1. Saint Name." OR "Saint Name." OR "Saint Name"
      const numbered   = boldText.match(/^(\d+)\.\s+(.+?)\.?\s*$/);
      const unnumbered = boldText.match(/^(.+?)\.?\s*$/);

      let num, name;
      if (numbered) {
        num  = parseInt(numbered[1], 10);
        name = numbered[2].trim();
      } else if (unnumbered) {
        num  = saints.length + 1;
        name = unnumbered[1].trim();
      } else {
        continue;
      }

      // Body text = everything in the <p> after the bold element
      const boldEnd  = inner.indexOf(boldMatch[0]) + boldMatch[0].length;
      const bodyText = clean(stripTags(inner.slice(boldEnd)));

      saints.push({ number: num, name, text: bodyText });

    } else {
      // No bold header — continuation paragraph for the last saint
      if (saints.length > 0) {
        saints[saints.length - 1].text =
          (saints[saints.length - 1].text + ' ' + pText).trim();
      }
    }
  }

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
    contemplation = [
      ...[...sec.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(p => clean(stripTags(p[1]))),
      ...[...sec.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(l => clean(stripTags(l[1]))),
    ].filter(Boolean).join('\n');
  }

  // ── Parse Homily ──────────────────────────────────────────────────────────
  let homily = { scripture: '', text: '' };
  const homKey = Object.keys(sections).find(k => k.includes('homily'));
  if (homKey) {
    const sec   = sections[homKey];
    const bq    = sec.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    if (bq) homily.scripture = clean(stripTags(bq[1]));
    homily.text = [...sec.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(p => clean(stripTags(p[1])))
      .filter(t => t && !t.match(/^To (Thee|You) (be |glory)/i))
      .join('\n\n');
  }

  return { month, day, title, saints, reflection, contemplation, homily, sourceUrl: url };
}

function empty(month, day, title, url) {
  return { month, day, title, saints: [], reflection: '', contemplation: '', homily: { scripture: '', text: '' }, sourceUrl: url };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const prologue = {};
  let total  = 0;
  const errors = [];

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
