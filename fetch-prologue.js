#!/usr/bin/env node
/**
 * fetch-prologue.js
 * Scrapes all 366 days of the Prologue of Ohrid from myrrh-bearers.org
 * and saves them as _data/prologue.json
 *
 * Usage:   node fetch-prologue.js
 * Output:  _data/prologue.json  (keyed by "MM-DD")
 * Deps:    npm install node-fetch
 *
 * ── CONFIRMED HTML PATTERNS (from raw file inspection) ──────────────────────
 *
 * Pattern A  (Jan 1 – Mar 18 approx)
 *   <b><p>1. Saint Name.</p>\n</b>
 *   <p>Body text...</p>
 *
 * Pattern B  (Mar 19 – May 18 approx)
 *   <p><b>1. Saint Name.</b></p>   ← header is its own <p>, period may be outside </b>
 *   <p>Body text...</p>             ← body is the NEXT <p>
 *
 * Pattern C  (May 19+ approx)
 *   <p><b>1. Saint Name.</b></p>
 *   <p>Body text...</p>
 *   (same as B structurally — handled by same code path)
 *
 * In all patterns the bold element contains ONLY the saint name/number,
 * and the body text is always in a separate following <p>.
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
    .replace(/&quot;/g, '"')
    .replace(/&copy;/g, '©')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function stripTags(str) {
  return (str || '').replace(/<[^>]*>/g, '');
}

// Extract number and name from "1. Saint Name" or "Saint Name"
function parseName(raw) {
  const s = raw.replace(/\.$/, '').trim(); // strip trailing period
  const numbered = s.match(/^(\d+)\.\s+(.+)$/);
  if (numbered) return { num: parseInt(numbered[1], 10), name: numbered[2].trim() };
  if (s.length > 0 && s.length < 150) return { num: null, name: s };
  return null;
}

// Is this text a saint header? Must look like a name, not body prose.
// Heuristic: short (< 120 chars), no sentence-ending punctuation mid-string,
// doesn't start with a lowercase letter.
function looksLikeHeader(text) {
  if (!text || text.length > 150) return false;
  if (/^\d+\.\s/.test(text)) return true;          // numbered → definitely a header
  if (/^[a-z]/.test(text)) return false;            // starts lowercase → body text
  if (text.split('.').length > 3) return false;     // multiple sentences → body text
  return true;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseDayPage(html, month, day, url) {

  // ── Title ──────────────────────────────────────────────────────────────────
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title   = h1Match
    ? clean(stripTags(h1Match[1])).replace(/^Prologue from Ochrid\s*[-–]\s*/i, '').trim()
    : '';

  // ── Isolate saints block: after </h1>, before first <h4> ──────────────────
  const h1End = html.indexOf('</h1>');
  if (h1End === -1) return empty(month, day, title, url);

  let body = html.slice(h1End + 5);
  const footerIdx = body.indexOf('The Prologue From Ochrid');
  if (footerIdx !== -1) body = body.slice(0, footerIdx);

  // ── Split at h4 section headers ────────────────────────────────────────────
  const h4All     = [...body.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/gi)];
  const saintsRaw = h4All.length > 0 ? body.slice(0, h4All[0].index) : body;

  const sections  = {};
  h4All.forEach((m, i) => {
    const label     = clean(stripTags(m[1])).toLowerCase();
    const start     = m.index + m[0].length;
    const end       = i + 1 < h4All.length ? h4All[i + 1].index : body.length;
    sections[label] = body.slice(start, end);
  });

  // ── Parse Saints ──────────────────────────────────────────────────────────
  //
  // Unified approach: tokenize the saints block into a flat list of tokens,
  // each tagged as either HEADER or BODY, then group them.
  //
  // Token types:
  //   HEADER — a <b><p>...</p></b> block (Pattern A)
  //          — a <p> whose ONLY content (ignoring trailing period) is a <b>...</b> (Patterns B/C)
  //   BODY   — any other <p> with actual prose text

  const tokens = [];

  // ── Pattern A tokens: <b><p>text</p></b> ───────────────────────────────────
  const patARegex = /<b[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/b>/gi;
  for (const m of saintsRaw.matchAll(patARegex)) {
    const text = clean(stripTags(m[1]));
    const parsed = parseName(text);
    if (parsed) {
      tokens.push({ type: 'HEADER', pos: m.index, len: m[0].length, parsed });
    }
  }

  // ── Pattern B/C tokens: <p> containing only a <b> element ─────────────────
  // Match every <p>...</p> and check if it's a standalone bold header
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  for (const pm of saintsRaw.matchAll(pRegex)) {
    // Skip if already captured as part of Pattern A
    const alreadyCaptured = tokens.some(t =>
      pm.index >= t.pos && pm.index < t.pos + t.len
    );
    if (alreadyCaptured) continue;

    const inner = pm[1];
    const pText = clean(stripTags(inner));

    // Is the entire paragraph content just a bold element (plus optional period)?
    // Match: optional whitespace, <b>text</b>, optional period/whitespace
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

    // Otherwise it's a body paragraph
    if (pText && !pText.includes('|')) { // skip toolbar paragraphs
      tokens.push({ type: 'BODY', pos: pm.index, len: pm[0].length, text: pText });
    }
  }

  // Sort all tokens by position in the document
  tokens.sort((a, b) => a.pos - b.pos);

  // ── Group tokens into saints ───────────────────────────────────────────────
  const saints = [];
  for (const tok of tokens) {
    if (tok.type === 'HEADER') {
      saints.push({
        number: tok.parsed.num,
        name:   tok.parsed.name,
        text:   '',
      });
    } else if (tok.type === 'BODY' && saints.length > 0) {
      saints[saints.length - 1].text =
        (saints[saints.length - 1].text + ' ' + tok.text).trim();
    }
  }

  // Auto-number any saints that had no number
  saints.forEach((s, i) => { if (s.number === null) s.number = i + 1; });

  // ── Reflection ─────────────────────────────────────────────────────────────
  let reflection = '';
  const reflKey  = Object.keys(sections).find(k => k.includes('reflection'));
  if (reflKey) {
    reflection = [...sections[reflKey].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(p => clean(stripTags(p[1]))).filter(Boolean).join('\n\n');
  }

  // ── Contemplation ──────────────────────────────────────────────────────────
  let contemplation = '';
  const contKey = Object.keys(sections).find(k => k.includes('contemplation'));
  if (contKey) {
    const sec = sections[contKey];
    contemplation = [
      ...[...sec.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(p => clean(stripTags(p[1]))),
      ...[...sec.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(l => clean(stripTags(l[1]))),
    ].filter(Boolean).join('\n');
  }

  // ── Homily ─────────────────────────────────────────────────────────────────
  let homily = { scripture: '', text: '' };
  const homKey = Object.keys(sections).find(k => k.includes('homily'));
  if (homKey) {
    const sec    = sections[homKey];
    const rubric = sec.match(/<p[^>]*class="rubric"[^>]*>([\s\S]*?)<\/p>/i);
    const rubricText = rubric ? clean(stripTags(rubric[1])) : '';
    const bq     = sec.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    if (bq) {
      const bqText     = clean(stripTags(bq[1]));
      homily.scripture = rubricText ? `${rubricText} — ${bqText}` : bqText;
    } else if (rubricText) {
      homily.scripture = rubricText;
    }
    homily.text = [...sec.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(p => clean(stripTags(p[1])))
      .filter(t => t && !t.match(/^(O Lord|To (Thee|You) (be |glory))/i) && t !== rubricText)
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
