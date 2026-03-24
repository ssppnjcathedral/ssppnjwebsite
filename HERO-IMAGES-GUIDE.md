# Hero Images — Upload Guide for Netlify

## Folder Structure

Place all hero images in this exact folder on your site:

```
/images/heroes/
```

Your Netlify project should look like this:

```
/
├── index.html
├── about-our-church.html
├── about-orthodoxy.html
├── administration.html
├── bulletins.html
├── cemeteries.html
├── contact-us.html
├── donate.html
├── gallery.html
├── news.html
├── our-beliefs.html
├── readings.html
├── saint-of-the-day.html
├── schedule.html
├── videos.html
└── images/
    └── heroes/
        ├── about-our-church.webp
        ├── about-orthodoxy.webp
        ├── administration.webp
        ├── bulletins.webp
        ├── cemeteries.webp
        ├── contact-us.webp
        ├── donate.webp
        ├── gallery.webp
        ├── news.webp
        ├── our-beliefs.webp
        ├── readings.webp
        ├── saint-of-the-day.webp
        ├── schedule.webp
        └── videos.webp
```

---

## Photo Recommendations Per Page

| File name | Suggested photo | Notes |
|---|---|---|
| `about-our-church.webp` | Exterior of the cathedral, Grand Street facade | Shoot from across the street to get the full building + domes |
| `about-orthodoxy.webp` | Icon close-up, gold leaf detail, or altar view | Rich color works well with the maroon scrim |
| `administration.webp` | Clergy in vestments, or altar preparation | Portrait orientation crops fine |
| `bulletins.webp` | Congregation during Liturgy, wide nave shot | Any Sunday service photo works |
| `cemeteries.webp` | Cemetery grounds, Orthodox crosses, landscape | Outdoor, natural light |
| `contact-us.webp` | Front entrance / doors of the cathedral | Golden hour or daytime |
| `donate.webp` | Interior wide shot — nave, chandelier, candles | Dark/moody works well, scrim is heavier here |
| `gallery.webp` | Community moment, coffee hour, feast day | Warm, people-focused |
| `news.webp` | Exterior or congregation, any parish event | General parish life |
| `our-beliefs.webp` | Iconostasis, Royal Doors, or icon detail | Gold tones photograph beautifully |
| `readings.webp` | Gospel book open on the altar, or Bible | Close-up detail shot |
| `saint-of-the-day.webp` | Icon of a saint, or icon wall | Any icon photograph works |
| `schedule.webp` | Liturgy in progress, choir, candlelit service | Saturday Vespers or Sunday Liturgy |
| `videos.webp` | Choir singing, or interior during service | Any video-relevant parish moment |

---

## Image Specs

- **Format:** WebP preferred (smallest file size). JPEG is fine as a fallback — just rename the CSS path from `.webp` to `.jpg`
- **Width:** 1800px maximum (wider is wasteful, narrower may look soft on large screens)
- **File size:** Under 300KB each — run through [squoosh.app](https://squoosh.app) before uploading
- **Quality:** 75–80% JPEG / 80% WebP quality is the sweet spot
- **Orientation:** Landscape works best. The scrim is heavier on the left (where text lives) and lighter on the right (where the rosette shows)

---

## If a Photo Isn't Available Yet

No problem — the page falls back to the solid maroon or apse color it had before. The gradient scrim is layered *on top* of the image, so if the image 404s, you just see the color. Nothing breaks.

---

## Adjusting the Scrim Darkness

Each page has a gradient like this in its CSS:

```css
background:
  linear-gradient(to right,
    rgba(59,15,24,.88) 0%,    /* left edge — darkest, text lives here */
    rgba(59,15,24,.62) 55%,   /* midpoint */
    rgba(59,15,24,.38) 100%   /* right edge — lightest, rosette shows through */
  ),
  url('/images/heroes/page-name.webp') center/cover no-repeat;
```

- If your photo is **very dark** — reduce the opacity values (e.g. `.88` → `.70`)
- If your photo is **very light/bright** — increase them (e.g. `.88` → `.95`)
- The text must always be readable — prioritize the left-side opacity

---

## Deploying to Netlify

**Drag and drop method:**
1. Prepare your full project folder with HTML files + `images/heroes/` folder
2. Go to Netlify dashboard → your site → **Deploys** tab
3. Drag the entire folder onto the deploy dropzone
4. Done — Netlify deploys in ~30 seconds

**Git method (recommended):**
1. Add the `images/heroes/` folder to your repository
2. Commit and push
3. Netlify auto-deploys on every push
