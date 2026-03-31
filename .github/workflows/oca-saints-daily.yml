#!/usr/bin/env node
/**
 * fetch-oca-saints-daily.js
 * Scrapes the full Lives of the Saints + Troparia/Kontakia from oca.org
 * for every saint on every day of the year (2026).
 *
 * Writes one JSON file per day to _data/:
 *   _data/oca-saints-2026-01-01.json
 *   _data/oca-saints-2026-01-02.json
 *   ... (366 files total)
 *
 * Each file: { date, saints: [...] }
 *
 * Each saint object:
 *   {
 *     name:      "Entry of Our Lord into Jerusalem (Palm Sunday)",
 *     image:     "https://images.oca.org/icons/xsm/...",   // small icon from listing
 *     imageLg:   "https://images.oca.org/icons/sm/...",    // larger icon from life page
 *     excerpt:   "Short intro from listing page...",
 *     life:      "Full biography text, paragraphs joined with \n\n",
 *     troparion: "Troparion text...",
 *     kontakion: "Kontakion text...",
 *     slug:      "20-entry-of-our-lord-into-jerusalem-palm-sunday",
 *     url:       "https://www.oca.org/saints/lives/2026/04/05/20-..."
 *   }
 *
 * Usage:  node fetch-oca-saints-daily.js
 * Deps:   npm install node-fetch
 *
 * Runtime: ~90 min (6,400+ requests at 800ms delay)
 * GitHub Actions limit: 6 hours — well within budget.
 *
 * Page fetches: /_data/oca-saints-2026-04-05.json (one small file per day load)
 */

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const fs    = require('fs');
const path  = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const YEAR         = '2026';
const LIVES_BASE   = 'https://www.oca.org/saints/lives';
const TROPARIA_BASE = 'https://www.oca.org/saints/troparia';
const DATA_DIR     = path.join(__dirname, '_data');
const DELAY_MS     = 800;  // polite delay between every request

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

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; orthodox-parish-bot/1.0; saints-peter-paul-jc)',
  'Accept':     'text/html,application/xhtml+xml',
};

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
    .replace(/&apos;/g, "'")
    .replace(/&copy;/g, '©')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#160;/g, ' ')
    .trim();
}

function stripTags(str) {
  return (str || '').replace(/<[^>]*>/g, '');
}

async function safeFetch(url) {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return { ok: false, status: res.status, html: '' };
    const html = await res.text();
    return { ok: true, status: res.status, html };
  } catch (err) {
    return { ok: false, status: 0, html: '', error: err.message };
  }
}

// Attempt a HEAD request — returns true if resource exists (200-299)
async function headCheck(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', headers: HEADERS });
    return res.ok;
  } catch {
    return false;
  }
}

// Derive the largest available OCA icon URL from any tier URL
// OCA image tiers: xsm → sm → med → lg
function upscaleUrl(url) {
  if (!url) return '';
  return url
    .replace('/icons/xsm/', '/icons/lg/')
    .replace('/icons/sm/',  '/icons/lg/')
    .replace('/icons/med/', '/icons/lg/');
}

// ─── Parse listing page ───────────────────────────────────────────────────────
// Returns array of stub objects: { name, image, excerpt, slug, url, tropariaUrl }

function parseListingPage(html) {
  const stubs = [];

  let content = html;
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) content = mainMatch[1];

  // Anchor on "Read the Life" links
  const lifeLinkPattern = /<a[^>]+href="([^"]*\/saints\/lives\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let linkMatch;
  const lifeLinks = [];
  while ((linkMatch = lifeLinkPattern.exec(content)) !== null) {
    const linkText = clean(stripTags(linkMatch[2]));
    if (/read\s+the\s+life/i.test(linkText)) {
      lifeLinks.push({ href: linkMatch[1], index: linkMatch.index, fullLen: linkMatch[0].length });
    }
  }

  for (let li = 0; li < lifeLinks.length; li++) {
    const link     = lifeLinks[li];
    const prevLink = lifeLinks[li - 1];

    const lifeUrl   = link.href.startsWith('http') ? link.href : 'https://www.oca.org' + link.href;
    const slugMatch = lifeUrl.match(/\/saints\/lives\/\d{4}\/\d{2}\/\d{2}\/(.+)$/);
    const slug      = slugMatch ? slugMatch[1] : '';

    // Block between previous and current life link
    const blockStart = prevLink ? prevLink.index + prevLink.fullLen : 0;
    const block      = content.slice(blockStart, link.index);

    // Name from last h2
    const h2s  = [...block.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
    const name = h2s.length > 0 ? clean(stripTags(h2s[h2s.length - 1][1])) : '';
    if (!name) continue;

    // Small icon image
    const imgs = [...block.matchAll(/<img[^>]+>/gi)];
    let image  = '';
    if (imgs.length > 0) {
      const src = imgs[imgs.length - 1][0].match(/src="([^"]+)"/i);
      if (src && src[1].includes('images.oca.org')) image = src[1];
    }

    // Excerpt — first <p>
    const pMatch  = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    let excerpt   = pMatch ? clean(stripTags(pMatch[1])) : '';
    if (excerpt.length > 320) {
      const t   = excerpt.slice(0, 320);
      const dot = t.lastIndexOf('.');
      excerpt   = dot > 200 ? t.slice(0, dot + 1) : t + '…';
    }

    // Troparia URL — swap lives → troparia in the href
    const tropariaUrl = lifeUrl.replace('/saints/lives/', '/saints/troparia/');

    stubs.push({ name, image, excerpt, slug, url: lifeUrl, tropariaUrl });
  }

  return stubs;
}

// ─── Parse full life page ─────────────────────────────────────────────────────
// Returns { life, imageLg }

function parseLifePage(html) {
  let content = html;
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) content = mainMatch[1];

  // Larger icon — OCA life pages use /icons/sm/ (vs /icons/xsm/ on listing)
  let imageLg = '';
  const imgs = [...content.matchAll(/<img[^>]+>/gi)];
  for (const im of imgs) {
    const src = im[0].match(/src="([^"]+)"/i);
    if (src && src[1].includes('images.oca.org')) {
      imageLg = src[1];
      break;
    }
  }

  // Full life text — collect all <p> tags after the first <h1> or <h2>
  // Skip navigation paragraphs (very short, or containing only links)
  const h1Match = content.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
  const bodyStart = h1Match ? content.indexOf(h1Match[0]) + h1Match[0].length : 0;
  const bodyContent = content.slice(bodyStart);

  const paragraphs = [];
  for (const pm of bodyContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = clean(stripTags(pm[1]));
    // Skip blanks, nav items, copyright lines, "No information available"
    if (!text) continue;
    if (text.length < 20) continue;
    if (/^(back|forward|all\s+(troparia|lives))/i.test(text)) continue;
    if (/copyright|all rights reserved/i.test(text)) continue;
    paragraphs.push(text);
  }

  const life = paragraphs.join('\n\n');
  return { life, imageLg };
}

// ─── Parse troparia page ──────────────────────────────────────────────────────
// Returns { troparion, kontakion }
// OCA troparia pages list one or more saints; we grab only the first
// troparion and kontakion blocks (matching the primary saint on the day's listing).

function parseTropariaPage(html, slug) {
  let content = html;
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) content = mainMatch[1];

  // Strategy: find the section for this specific slug.
  // Each saint's troparia block is preceded by an anchor or heading containing the slug.
  // If we can't isolate it, fall back to the first troparion/kontakion on the page.

  // Find all troparion blocks — OCA uses <h4> or <strong> labels like "Troparion" / "Kontakion"
  // followed by one or more <p> tags with the text.

  // Normalise content: strip script/style blocks first
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  let troparion = '';
  let kontakion = '';

  // Look for the slug anchor to isolate this saint's section
  let section = content;
  const slugAnchor = content.indexOf(slug);
  if (slugAnchor !== -1) {
    // Find the next saint's slug anchor (or end of content)
    // Saints are separated by h2/h3 headings; slice from this saint to the next
    const afterSlug  = content.slice(slugAnchor);
    const nextH2     = afterSlug.slice(1).search(/<h[23][^>]*>/i);
    section = nextH2 !== -1 ? afterSlug.slice(0, nextH2 + 1) : afterSlug;
  }

  // Match troparion and kontakion label blocks
  // OCA uses patterns like: <h4>Troparion</h4><p>text</p>
  // or: <strong>Troparion —</strong> text inside a <p>
  // or: <p><strong>Troparion</strong></p><p>text</p>

  const labelPattern = /<(?:h[2-6]|p|div)[^>]*>([\s\S]*?)<\/(?:h[2-6]|p|div)>/gi;
  const blocks       = [];
  let bm;
  while ((bm = labelPattern.exec(section)) !== null) {
    const text = clean(stripTags(bm[1]));
    if (text) blocks.push({ raw: bm[0], text, index: bm.index });
  }

  for (let i = 0; i < blocks.length; i++) {
    const b    = blocks[i];
    const next = blocks[i + 1];
    const isTroparion  = /^troparion/i.test(b.text);
    const isKontakion  = /^kontakion/i.test(b.text);

    if ((isTroparion || isKontakion) && next) {
      // The label block is followed by the text block
      const value = next.text;
      if (!value || value.length < 10) continue;
      if (isTroparion && !troparion) troparion = value;
      if (isKontakion && !kontakion) kontakion = value;
    }
  }

  // Fallback: some pages embed troparion text inside the label block itself
  // e.g. <p><strong>Troparion — Tone 4:</strong> Thou who wast taken up...</p>
  if (!troparion || !kontakion) {
    for (const pm of section.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
      const inner = pm[1];
      const text  = clean(stripTags(inner));
      if (!text || text.length < 20) continue;
      const labelMatch = inner.match(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/i);
      if (!labelMatch) continue;
      const label = clean(stripTags(labelMatch[1]));
      const body  = text.replace(label, '').replace(/^[\s\-–—:]+/, '').trim();
      if (!body || body.length < 10) continue;
      if (/troparion/i.test(label) && !troparion) troparion = body;
      if (/kontakion/i.test(label) && !kontakion) kontakion = body;
    }
  }

  return { troparion, kontakion };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  let grandTotal = 0;
  let saintTotal = 0;
  const errors   = [];

  for (const { name: monthName, num: monthNum, days } of MONTHS) {
    for (let day = 1; day <= days; day++) {
      const dd      = pad2(day);
      const dateStr = `${YEAR}-${monthNum}-${dd}`;
      const listUrl = `${LIVES_BASE}/${YEAR}/${monthNum}/${dd}`;

      process.stdout.write(`\n[${dateStr}] Listing... `);

      // ── Step 1: fetch listing page ──────────────────────────────────────────
      await sleep(DELAY_MS);
      const listRes = await safeFetch(listUrl);
      if (!listRes.ok) {
        console.log(`✗ listing ${listRes.status}`);
        errors.push({ date: dateStr, step: 'listing', status: listRes.status });
        continue;
      }

      const stubs = parseListingPage(listRes.html);
      console.log(`${stubs.length} saints`);

      // ── Step 2: for each saint, fetch full life + troparia ──────────────────
      const fullSaints = [];
      for (const stub of stubs) {
        process.stdout.write(`  [${stub.slug.slice(0, 40)}] life... `);
        await sleep(DELAY_MS);

        // Full life page
        const lifeRes = await safeFetch(stub.url);
        let life    = '';
        let imageSm = stub.image;  // small icon — always kept as fallback
        let imageLg = '';
        if (lifeRes.ok) {
          const parsed = parseLifePage(lifeRes.html);
          life    = parsed.life;
          imageSm = parsed.imageLg || stub.image;
          process.stdout.write(`✓ (${life.length}ch) `);
        } else {
          process.stdout.write(`✗ life(${lifeRes.status}) `);
          errors.push({ date: dateStr, step: 'life', slug: stub.slug, status: lifeRes.status });
        }

        // Check for full-resolution icon (lg tier)
        const lgCandidate = upscaleUrl(imageSm || stub.image);
        if (lgCandidate && lgCandidate !== (imageSm || stub.image)) {
          const lgExists = await headCheck(lgCandidate);
          imageLg = lgExists ? lgCandidate : (imageSm || stub.image);
          process.stdout.write(lgExists ? `[lg✓] ` : `[lg✗] `);
        } else {
          imageLg = imageSm || stub.image;
        }

        // Troparia page
        await sleep(DELAY_MS);
        process.stdout.write(`troparia... `);
        const tropRes = await safeFetch(stub.tropariaUrl);
        let troparion = '';
        let kontakion = '';
        if (tropRes.ok) {
          const parsed = parseTropariaPage(tropRes.html, stub.slug);
          troparion = parsed.troparion;
          kontakion = parsed.kontakion;
          process.stdout.write(`✓ (${troparion ? 'T' : '-'}${kontakion ? 'K' : '-'})\n`);
        } else {
          process.stdout.write(`✗ (${tropRes.status})\n`);
          errors.push({ date: dateStr, step: 'troparia', slug: stub.slug, status: tropRes.status });
        }

        fullSaints.push({
          name:      stub.name,
          image:     stub.image,   // xsm thumbnail — always available
          imageSm,                 // sm from life page
          imageLg,                 // lg full-res if confirmed, else best available
          excerpt:   stub.excerpt,
          life,
          troparion,
          kontakion,
          slug:      stub.slug,
          url:       stub.url,
        });

        saintTotal++;
      }

      // ── Write one file per day ──────────────────────────────────────────────
      const outPath = path.join(DATA_DIR, `oca-saints-${dateStr}.json`);
      const payload = { date: dateStr, saints: fullSaints };
      fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
      const kb = Math.round(fs.statSync(outPath).size / 1024);
      process.stdout.write(`  → wrote oca-saints-${dateStr}.json (${kb}KB)\n`);

      grandTotal++;
    }

    console.log(`\n✓ ${monthName} complete\n`);
  }

  console.log('══════════════════════════════════════════');
  console.log(`✅ Done. ${grandTotal} days, ${saintTotal} saints, 366 JSON files.`);

  if (errors.length) {
    console.log(`\n⚠️  ${errors.length} error(s):`);
    errors.forEach(e => console.log(`   ${e.date} / ${e.step}${e.slug ? ' / '+e.slug : ''} → ${e.status}`));
    fs.writeFileSync(
      path.join(DATA_DIR, 'oca-saints-errors.json'),
      JSON.stringify(errors, null, 2),
      'utf8'
    );
    console.log('   Error log → _data/oca-saints-errors.json');
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
