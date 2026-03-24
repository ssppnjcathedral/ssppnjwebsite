# Saints Peter & Paul Orthodox Cathedral — Website

**peterandpaulcathedral.com** (formerly ssppnj.org)

## Folder Structure

```
/
├── index.html                  ← Homepage
├── about-our-church.html
├── about-orthodoxy.html
├── administration.html
├── bulletins.html
├── cemeteries.html
├── contact-us.html
├── donate.html
├── gallery.html                ← Photo gallery (edit PHOTOS array to add photos)
├── news.html
├── our-beliefs.html
├── readings.html               ← Daily readings via OCA Calendar API
├── saint-of-the-day.html
├── schedule.html               ← Liturgical calendar (3 views)
├── videos.html
├── hero-rotator.js             ← Rotating hero images (Wikimedia Commons)
├── README.md                   ← This file
└── images/
    ├── heroes/                 ← One hero image per page (see HERO-IMAGES-GUIDE.md)
    │   ├── about-our-church.webp
    │   ├── gallery.webp
    │   └── ... (one per page)
    └── gallery/                ← Parish photos for the gallery
        └── (drop photos here)
```

## Adding a Photo to the Gallery

Open `gallery.html` and find the `PHOTOS` array near the top of the archive section.
Add one line per photo:

```js
{ src:'/images/gallery/your-photo.jpg', cat:'community', year:'2025',
  label:'Community · Coffee Hour', title:'After the <em>Divine Liturgy</em>', h:165 },
```

**Categories:** `community` · `cathedral` · `events`  
**Years:** `2026` · `2025` · `2024` · `pre2023`

## Hero Images

See `HERO-IMAGES-GUIDE.md` for full instructions on adding hero photos to page banners.
Place images in `/images/heroes/` named exactly as listed in the guide.

## APIs Used

- **OrthoCal** (orthocal.info) — Daily readings and liturgical calendar data
- **Wikimedia Commons** — Rotating hero images (public domain Orthodox photography)
- **Tithe.ly** — Online giving (tithe.ly/give?c=5004259)

## Deployment

This site is hosted on Netlify. Any push to the `main` branch auto-deploys.
