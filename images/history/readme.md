## Church History Page — Photo Requirements

All images go in: `/images/history/`
Format: `.webp` | Recommended minimum width: 1600px (full-width), 800px (pairs/floats/gallery)

---

### Full-Width Article Images

| File Name | Placement | Description |
|---|---|---|
| `church-exterior.webp` | Hero background | Grand Street façade — sandstone towers, three Russian-style cupolas, Orthodox three-bar crosses, teak doors. Shoot straight-on or at a slight angle. |
| `paulus-hook-map.webp` | Section 1 — pair left | Original Paulus Hook survey / plat map by Joseph F. Mangin, c. 1804 — showing the four "church grounds" lots |
| `van-vorst-waterfront.webp` | Section 1 — pair right | Portrait of Cornelius Van Vorst (1728–1818) or early Paulus Hook / Hudson River waterfront scene |
| `gothic-interior-1857.webp` | Section 2 — full-width | Interior showing original Gothic arches, poured-cement columns, nave — as built by Detlef Lienau, 1857 |
| `jersey-city-immigrants.webp` | Section 3 — full-width | Eastern European immigrants or Jersey City street scene, c. 1890–1910 |
| `archpriest-hotovitsky.webp` | Section 3 — pair left | Portrait of Archpriest Alexander Hotovitsky, c. 1907 |
| `founding-congregation.webp` | Section 3 — pair right | Early parish gathering, founding-era congregation photo, or exterior c. 1907–1910 |
| `iconostasis.webp` | Section 4 — full-width | Straight-on shot of the hand-carved oak Iconostasis, Royal Doors, red curtains, and icon screen |

---

### Floated Inline Images (Section 4 — Redesigned chapter)

| File Name | Float Direction | Description |
|---|---|---|
| `iconostasis-detail.webp` | Right | Tight detail shot of the Iconostasis — icons, Royal Doors, or icon panel close-up |
| `cupola-detail.webp` | Left | Corner tower and Russian-style copper dome with Orthodox three-bar cross |
| `ceiling-murals.webp` | Right | Looking up at nave ceiling — murals by iconographer Photius Bodasiuk of Kiev, 1940s |
| `crystal-chandelier.webp` | Left | Center aisle chandelier (45,000 crystals) — shoot from nave level looking toward altar |

---

### Interior Gallery (9 images — lightbox slideshow)

| File Name | Caption shown in lightbox |
|---|---|
| `iconostasis.webp` | The hand-carved solid oak Iconostasis, purchased in 1909 for $1,200. Modeled after Saint Nicholas Cathedral, NYC. |
| `royal-doors.webp` | The center Royal Doors, hung with red curtains and flanked by icons. Icon of the Last Supper above. |
| `ceiling-murals.webp` | One of 70+ ceiling and wall murals by iconographer Photius Bodasiuk of Kiev, completed in the 1940s. |
| `crystal-chandelier.webp` | The 45,000-crystal chandelier runs the full length of the center aisle. |
| `stained-glass.webp` | The foiled-arch Gothic stained-glass window above the entrance — surviving feature of the 1857 Dutch Reformed Church. |
| `nave-pews.webp` | The well-worn dark wood pews — a remnant of the original Dutch Reformed congregation. |
| `wall-icon-detail.webp` | Detail of one of the oil-painted icons on canvas, imported from Russia in 1909. |
| `gothic-arches.webp` | The original Gothic arches and poured-cement columns by Detlef Lienau, 1857, now framing the Orthodox space. |
| `altar-sanctuary.webp` | The sacred inner space of the altar — the Holy of Holies — richly encrusted with icons. |

---

### Swapping Placeholders

Replace each picsum `<img>` with:

    <img src="/images/history/FILENAME.webp" alt="DESCRIPTION">

For the hero, update the CSS background-image in `.page-hero`:

    url('/images/heroes/church-history.webp')

The caption text, sizing, lightbox data, and responsive CSS are all already wired up.
No other changes needed.
