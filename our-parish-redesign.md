# Our Parish Page Redesign — Implementation Brief

## Purpose
Rewrite `our-parish.html` to communicate what Saints Peter & Paul is *today*: a living, growing, family-centered Orthodox community where people put down roots, raise their children, and share a life together. Not a history page. A page about a life.

## Audience
Existing parishioners who want to share the link. Newcomers and inquirers who want to understand what this place is. Families considering a parish home.

## Tone
Fr. Solomon's warm, first-person voice where appropriate. Honest, grounded, grateful. No press release language. No em dashes. No AI vocabulary (vibrant, pivotal, testament, showcasing, fostering, tapestry, delve, thriving, robust, comprehensive, seamless, elevate, cutting-edge, transformative). No italic body prose. Write like a thoughtful person, not a brochure.

---

## Page Structure (in order)

### 1. Hero
Keep existing hero format (dark overlay, breadcrumb, title).
- Title: "Our Parish"
- Subtitle: Something like "A place to belong. A life to share."
- Rubric: "About Our Church"

### 2. Opening Prose — "Who We Are Today"
Lead with what you see when you walk in on a Sunday morning. This is the first thing visitors read, and it should feel like arriving, not like reading a Wikipedia article.

Key content to weave in naturally (not as a bullet list):
- Nearly **30 children** of all ages running around after Liturgy. This parish is full of young families.
- Families from **Egypt, Ethiopia, Russia, Ukraine, Romania**, and many American converts. People from literally all walks of life and countries around the world.
- A parish that has **nearly tripled in size over the past five years**, largely through a boom in new American converts discovering the Orthodox Faith.
- The diversity should be shown, not announced. Weave countries and backgrounds into the texture of the description rather than listing them as achievements.

### 3. "A Place to Put Down Roots"
The emotional center of the page. Communicate that this is not a place you attend on Sundays. This is a whole life:
- You baptize your children here. Your kids grow up together. You grieve together. You eat together after every Liturgy.
- You clean up the park on Saturday and pray Vespers that evening.
- The family (your own family and the church family) is at the center of everything.
- The greatest expression of Christian love is strengthening the local community: not only your own household but the whole church family.
- This is a place where you make roots and participate in a life. Not a couple of years and move on, but a place where your children's children could be baptized.

### 4. Four Cards — "The Life of the Parish"
Use the same card grid pattern as the Daily Practice section on the homepage (`.daily-grid` / `.daily-card` style). Four cards in a row on desktop, 2x2 on tablet/mobile. Each card has: title (Cinzel uppercase), body text (EB Garamond), gold arrow link.

**Card 1 — Worship**
- Liturgy every Sunday at 9:30 AM, Vespers every Saturday at 5:00 PM
- Feast day services throughout the year, the full cycle of Holy Week
- Link to `/schedule`

**Card 2 — Family & Children**
- Nearly 30 children, children's choir starting at age 2
- Monthly Saturday nights for teens
- A growing vision: the parish is exploring a children's school, with a longer-term dream of an Orthodox classical education academy
- Link to `/visit`

**Card 3 — Community**
- Coffee hour after every Liturgy, potlucks, men's group, young adults group
- Neighborhood clean-ups, food giveaways, partnership with local organizations
- The rectory party at Christmas, house blessings in January
- Link to `/news`

**Card 4 — Formation**
- Wednesday catechism classes, Bible study
- The journey from inquirer to catechumen to baptism
- Five adults baptized/chrismated in a single service last year
- Link to `/catechesis`

### 5. Choir Section
A standalone prose section expressing genuine gratitude for the parish's musical life. Not a brag list, but quiet pride. Frame as a blessing from God, not an achievement.

Key content:
- **Gleb Ivanov**, world-renowned classical pianist, serves as music director
- Members include **professional opera singers**, a **Juilliard-trained classical flutist**, **Byzantine chant specialists**, and other gifted musicians and artists
- Together they produce what is, we dare say, one of the finest Orthodox parish choirs in the diocese
- This is something the parish is deeply blessed to have. These people give their talent to the worship of God every week.

### 6. "Growing Together"
Prose section about where the parish is headed. Weave in:
- The convert boom and what it means: people are finding the ancient Faith and choosing to stay
- The exploration of a **parish preschool/children's school** (Nick Rus is leading the working team, consultants have visited, Archbishop Michael has expressed support)
- The longer-term hope of an **Orthodox classical education academy**
- Frame these as natural next steps for a community that believes the Faith is handed down through families and children
- These are hopes and aspirations, not promises. Use language like "we are exploring," "we hope," "God willing"

### 7. Stats Row
Four stat boxes in a horizontal row (existing `.stats-row` / `.stat-box` pattern):
- **~30** / Children
- **3x** / Growth in 5 Years
- **1907** / Parish Founded
- **2020** / Became Cathedral

### 8. Quote Interstitial
Keep the existing Chrysostom quote: "The Church is not a building. The Church is a gathering of faithful souls, bound together by the grace of God and the love that passes understanding."

### 9. Condensed Timeline
Keep only 4-5 key dates from the existing timeline (1907 founding, 1909 Grand Street purchase, 2000 restoration, 2020 Cathedral elevation, 2023 Fr. Solomon appointed). Add a clear link: "Read the full history" pointing to `/church-history`.

### 10. Sidebar
Keep existing sidebar structure:
- Parish Leadership (Fr. Solomon Longo as Rector, Marius Anghel as Council President, Gleb Ivanov as Music Director)
- Diocese & Church (Metropolitan Tikhon, Archbishop Michael, links to nynjoca.org and oca.org)
- Contact (109 Grand Street, phone, email)
- "More from About Us" nav links

---

## Technical Notes
- Reuse existing CSS classes from `our-parish.html` wherever possible (`.prose`, `.section-head`, `.stats-row`, `.stat-box`, `.side-col`, `.side-section`, `.quote-break`, `.timeline`, `.tl-entry`)
- For the four cards section, replicate the `.daily-grid` / `.daily-card` pattern from `index.html` or create equivalent `.parish-grid` / `.parish-card` classes with the same styling
- Keep the existing nav (mega menu), footer, hero rotator JS, mobile drawer, and journey widget code unchanged
- Follow all rules in CLAUDE.md: no em dashes, no AI vocabulary, no italic body prose, hero text left-aligned, `onerror="this.style.display='none'"` on images
- Surgical edits: since we're rewriting the main content area, replace the content between the chapter-bar and the quote-break. Keep everything else intact.
