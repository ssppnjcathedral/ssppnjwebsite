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
  may:'05', june:'06', july:'07', august:'08',
  september:'09', october:'10', november:'11', december:'12',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanText(str) {
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
  const rawTitle = h1Match ? cleanText(stripTags(h1Match[1])) : '';
  const title = rawTitle.replace(/^Prologue from Ochrid\s*[-–]\s*/i, '').trim();

  // ── Isolate body: after </h1>, before attribution footer ──────────────────
  const h1End = html.indexOf('</h1>');
  if (h1End === -1) {
    return { month, day, title, saints: [], reflection: '', contemplation: '', homily: { scripture: '', text: '' }, sourceUrl: url };
  }

  let body = html.slice(h1End + 5);
  const footerIdx = body.indexOf('The Prologue From Ochrid');
  if (footerIdx !== -1) body = body.slice(0, footerIdx);

  // ── Find h4 section headers ────────────────────────────────────────────────
  const h4Matches = [...body.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/gi)];

  // Everything before the first h4 = saints block
  const firstH4Pos = h4Matches.length > 0 ? h4Matches[0].index : body.length;
  const saintsRaw  = body.slice(0, firstH4Pos);

  // Build named sections from h4 onwards
  const sections = {};
  h4Matches.forEach((m, i) => {
    const label      = cleanText(stripTags(m[1])).toLowerCase();
    const start      = m.index + m[0].length;
    const end        = i + 1 < h4Matches.length ? h4Matches[i + 1].index : body.length;
    sections[label]  = body.slice(start, end);
  });

  // ── Parse Saints ──────────────────────────────────────────────────────────
  // Each saint = <p><strong>N. Name.</strong> body text</p>
  // Continuation paragraphs (no bold) append to the previous saint.

  const saints = [];
  const pMatches = [...saintsRaw.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];

  for (const pm of pMatches) {
    const inner = pm[1];
    const pText = cleanText(stripTags(inner));
    if (!pText) continue;

    // Look for opening bold tag with numbered saint header
    const boldMatch = inner.match(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/i);
    if (boldMatch) {
      const boldText    = cleanText(stripTags(boldMatch[1]));
      const headerMatch = boldText.match(/^(\d+)\.\s+(.+?)\.?\s*$/);
      if (headerMatch) {
        const boldEnd  = inner.indexOf(boldMatch[0]) + boldMatch[0].length;
        const bodyText = cleanText(stripTags(inner.slice(boldEnd)));
        saints.push({
          number: parseInt(headerMatch[1], 10),
          name:   headerMatch[2].replace(/\.$/, '').trim(),
          text:   bodyText,
        });
        continue;
      }
    }

    // No header found — continuation of the previous saint
    if (saints.length > 0 && pText) {
      saints[saints.length - 1].text =
        (saints[saints.length - 1].text + ' ' + pText).trim();
    }
  }

  // ── Parse Reflection ──────────────────────────────────────────────────────
  let reflection = '';
  const reflKey = Object.keys(sections).find(k => k.includes('reflection'));
  if (reflKey) {
    const paras = [...sections[reflKey].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    reflection = paras
      .map(p => cleanText(stripTags(p[1])))
      .filter(Boolean)
      .join('\n\n');
  }

  // ── Parse Contemplation ───────────────────────────────────────────────────
  let contemplation = '';
  const contKey = Object.keys(sections).find(k => k.includes('contemplation'));
  if (contKey) {
    const sec   = sections[contKey];
    const paras = [...sec.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    const lis   = [...sec.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    contemplation = [
      ...paras.map(p => cleanText(stripTags(p[1]))),
      ...lis.map(l => cleanText(stripTags(l[1]))),
    ].filter(Boolean).join('\n');
  }

  // ── Parse Homily ──────────────────────────────────────────────────────────
  let homily = { scripture: '', text: '' };
  const homKey = Object.keys(sections).find(k => k.includes('homily'));
  if (homKey) {
    const sec = sections[homKey];

    // Scripture citation lives in <blockquote>
    const bqMatch = sec.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    if (bqMatch) {
      homily.scripture = cleanText(stripTags(bqMatch[1]));
    }

    // Body paragraphs — skip the doxology closing line
    const paras = [...sec.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    homily.text = paras
      .map(p => cleanText(stripTags(p[1])))
      .filter(t => t && !t.match(/^To (Thee|You) (be |glory)/i))
      .join('\n\n');
  }

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
  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`Created directory: ${outDir}`);
  }

  const prologue = {};
  let total  = 0;
  let errors = [];

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
