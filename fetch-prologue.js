#!/usr/bin/env node
/**
 * fetch-prologue.js
 * Scrapes all 366 days of the Prologue of Ohrid from myrrh-bearers.org
 * Writes 12 monthly files to _data/ to stay under Netlify's 2MB file limit.
 *
 *   _data/prologue-january.json
 *   _data/prologue-february.json
 *   ... etc
 *
 * Each file is keyed by day number: { "1": {...}, "2": {...}, ... }
 *
 * Usage:   node fetch-prologue.js
 * Deps:    npm install node-fetch
 */

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const fs    = require('fs');
const path  = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = 'https://myrrh-bearers.org/prologue';
const DATA_DIR = path.join(__dirname, '_data');
const DELAY_MS = 800;

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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

function parseName(raw) {
  const s = raw.replace(/\.$/, '').trim();
  const numbered = s.match(/^(\d+)\.\s+(.+)$/);
  if (numbered) return { num: parseInt(numbered[1], 10), name: numbered[2].trim() };
  if (s.length > 0 && s.length < 150) return { num: null, name: s };
  return null;
}

function looksLikeHeader(text) {
  if (!text || text.length > 150) return false;
  if (/^\d+\.\s/.test(text)) return true;
  if (/^[a-z]/.test(text)) return false;
  if (text.split('.').length > 3) return false;
  return true;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseDayPage(html, month, day, url) {

  // Title
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title   = h1Match
    ? clean(stripTags(h1Match[1])).replace(/^Prologue from Ochrid\s*[-–]\s*/i, '').trim()
    : '';

  const h1End = html.indexOf('</h1>');
  if (h1End === -1) return empty(month, day, title, url);

  let body = html.slice(h1End + 5);
  const footerIdx = body.indexOf('The Prologue From Ochrid');
  if (footerIdx !== -1) body = body.slice(0, footerIdx);

  // Split at h4 section headers
  const h4All     = [...body.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/gi)];
  const saintsRaw = h4All.length > 0 ? body.slice(0, h4All[0].index) : body;

  const sections  = {};
  h4All.forEach((m, i) => {
    const label     = clean(stripTags(m[1])).toLowerCase();
    const start     = m.index + m[0].length;
    const end       = i + 1 < h4All.length ? h4All[i + 1].index : body.length;
    sections[label] = body.slice(start, end);
  });

  // ── Tokenize saints block ──────────────────────────────────────────────────
  const tokens = [];

  // Pattern A: <b><p>name</p></b>
  for (const m of saintsRaw.matchAll(/<b[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/b>/gi)) {
    const parsed = parseName(clean(stripTags(m[1])));
    if (parsed) tokens.push({ type: 'HEADER', pos: m.index, len: m[0].length, parsed });
  }

  // Pattern B/C: <p> whose sole content is a <b> or <strong> element
  for (const pm of saintsRaw.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const alreadyCaptured = tokens.some(t => pm.index >= t.pos && pm.index < t.pos + t.len);
    if (alreadyCaptured) continue;

    const inner = pm[1];
    const pText = clean(stripTags(inner));
    if (!pText) continue;

    // Solo bold header: entire <p> is just a <b>...</b> (period may be outside tag)
    const soloB = inner.match(/^\s*<(?:b|strong)[^>]*>([\s\S]*?)<\/(?:b|strong)>\s*\.?\s*$/i);
    if (soloB) {
      const boldText = clean(stripTags(soloB[1]));
      if (looksLikeHeader(boldText)) {
        const parsed = parseName(boldText);
        if (parsed) {
          tokens.push({ type: 'HEADER', pos: pm.index, len: pm[0].length, parsed });
          continue;
        }
      }
    }

    // Body paragraph
    if (!pText.includes('|')) {
      tokens.push({ type: 'BODY', pos: pm.index, len: pm[0].length, text: pText });
    }
  }

  // Sort by document position and group into saints
  tokens.sort((a, b) => a.pos - b.pos);

  const saints = [];
  for (const tok of tokens) {
    if (tok.type === 'HEADER') {
      saints.push({ number: tok.parsed.num, name: tok.parsed.name, text: '' });
    } else if (tok.type === 'BODY' && saints.length > 0) {
      saints[saints.length - 1].text =
        (saints[saints.length - 1].text + ' ' + tok.text).trim();
    }
  }
  saints.forEach((s, i) => { if (s.number === null) s.number = i + 1; });

  // Reflection
  let reflection = '';
  const reflKey  = Object.keys(sections).find(k => k.includes('reflection'));
  if (reflKey) {
    reflection = [...sections[reflKey].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(p => clean(stripTags(p[1]))).filter(Boolean).join('\n\n');
  }

  // Contemplation
  let contemplation = '';
  const contKey = Object.keys(sections).find(k => k.includes('contemplation'));
  if (contKey) {
    const sec = sections[contKey];
    contemplation = [
      ...[...sec.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(p => clean(stripTags(p[1]))),
      ...[...sec.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(l => clean(stripTags(l[1]))),
    ].filter(Boolean).join('\n');
  }

  // Homily
  let homily = { scripture: '', text: '' };
  const homKey = Object.keys(sections).find(k => k.includes('homily'));
  if (homKey) {
    const sec        = sections[homKey];
    const rubric     = sec.match(/<p[^>]*class="rubric"[^>]*>([\s\S]*?)<\/p>/i);
    const rubricText = rubric ? clean(stripTags(rubric[1])) : '';
    const bq         = sec.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    if (bq) {
      homily.scripture = rubricText
        ? `${rubricText} — ${clean(stripTags(bq[1]))}`
        : clean(stripTags(bq[1]));
    } else if (rubricText) {
      homily.scripture = rubricText;
    }
    homily.text = [...sec.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(p => clean(stripTags(p[1])))
      .filter(t => t
        && !t.match(/^(O Lord|To (Thee|You) (be |glory))/i)
        && t !== rubricText)
      .join('\n\n');
  }

  return { month, day, title, saints, reflection, contemplation, homily, sourceUrl: url };
}

function empty(month, day, title, url) {
  return { month, day, title, saints: [], reflection: '',
           contemplation: '', homily: { scripture: '', text: '' }, sourceUrl: url };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  let grandTotal = 0;
  const errors   = [];

  for (const { name: month, days } of MONTHS) {
    const monthData = {};
    let monthTotal  = 0;

    for (let day = 1; day <= days; day++) {
      const url = `${BASE_URL}/${month}/${day}.htm`;
      process.stdout.write(`Fetching ${month} ${day}... `);

      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; parish-site-bot/1.0)' },
          timeout: 15000,
        });

        if (!res.ok) {
          if (res.status === 404) {
            console.log('404 — skipped');
            errors.push({ month, day, error: '404' });
            await sleep(DELAY_MS);
            continue;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const html = await res.text();
        const data = parseDayPage(html, month, day, url);
        monthData[String(day)] = data;
        monthTotal++;
        grandTotal++;
        console.log(`✓ (${data.saints.length} saints)`);

      } catch (err) {
        console.log(`✗ ${err.message}`);
        errors.push({ month, day, error: err.message });
      }

      await sleep(DELAY_MS);
    }

    // Write monthly file
    const outPath = path.join(DATA_DIR, `prologue-${month}.json`);
    fs.writeFileSync(outPath, JSON.stringify(monthData, null, 2), 'utf8');
    const kb = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`\n📄 Wrote prologue-${month}.json (${monthTotal} days, ${kb}KB)\n`);
  }

  console.log('────────────────────────────────────────');
  console.log(`✅ Done. ${grandTotal} days scraped across 12 files.`);

  if (errors.length) {
    console.log(`\n⚠️  ${errors.length} error(s):`);
    errors.forEach(e => console.log(`   ${e.month} ${e.day}  →  ${e.error}`));
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
