# SEO Launch Checklist

Post-launch tasks for peterandpaulcathedral.com. Do these after the new site is live on Netlify.

---

## 1. Google Search Console

1. Go to https://search.google.com/search-console/
2. Add property → enter `https://www.peterandpaulcathedral.com`
3. Verify via the HTML tag method (paste the `<meta name="google-site-verification">` tag into `index.html` and push)
4. Once verified, go to **Sitemaps** and submit: `https://www.peterandpaulcathedral.com/sitemap.xml`
5. Check **Coverage** after a few days for any crawl errors
6. Check **Core Web Vitals** after ~30 days once data accumulates

---

## 2. Validate Schema Markup

Run the homepage through Google's Rich Results Test to confirm the Church/LocalBusiness JSON-LD is valid:

https://search.google.com/test/rich-results?url=https://www.peterandpaulcathedral.com/

Expected: passes with `LocalBusiness` rich result detected. No errors.

---

## 3. Update NJ Historic Trust Link

The NJ Historic Trust listing currently links to the old domain (`saintspeterpaulchurch.com`), not peterandpaulcathedral.com.

- Page: https://www.nj.gov/dca/njht/funded/sitedetails/saints_peter_and_paul_orthodox_church.shtml
- Contact: NJ Historic Trust at https://www.nj.gov/dca/njht/contact/
- Ask them to update the website link to `https://www.peterandpaulcathedral.com`

---

## 4. NJCU Library Guide Backlink

NJCU has a detailed library guide about the parish with no link to the website. A `.edu` backlink from here would help.

- Page: https://njcu.libguides.com/peterpaulorthodox
- Contact: Use the "Suggest a Resource" or contact the guide's author (listed at the top of the page)
- Ask them to add a link to `https://www.peterandpaulcathedral.com`

---

## 5. Google Business Profile

Log in at https://business.google.com/

- Verify the website URL points to `https://www.peterandpaulcathedral.com` (not the old Webflow domain)
- Add interior/service photos (photos improve click-through rate significantly)
- Add weekday feast day services as Events when they occur
- Consider adding a post each week linking to the bulletin

**Reviews:** The listing currently has 28 reviews. Add a line to the weekly bulletin asking parishioners to leave a Google review. A link like this goes directly to the review form — replace `PLACE_ID` with the actual ID from your GBP dashboard:

```
https://search.google.com/local/writereview?placeid=PLACE_ID
```

Or use the "Get more reviews" link directly in the Google Business Profile dashboard.

---

## 6. OCA Parish Listing

Verify the OCA directory entry links to the current domain:

https://www.oca.org/parishes/oca-ny-jerspp

If the website URL shown there is outdated, log in to the OCA parish portal or contact the OCA webmaster to update it.

---

## 7. Update sitemap.xml lastmod dates

The `sitemap.xml` has `<lastmod>2026-04-07</lastmod>` on all pages. After major content updates, update the `lastmod` date on affected pages to signal freshness to Google.

---

## Notes

- `robots.txt` blocks `/admin/` and all mockup pages from crawling
- Schema markup (Church + LocalBusiness JSON-LD) is on `index.html` and `contact-us.html`
- All 35 public pages have canonical tags, meta descriptions, and Open Graph tags
- Dynamic viewer pages (`bulletin.html`, `article.html`, `giving-project.html`) have canonicals pointing to their listing pages (`/bulletins`, `/news`, `/give`)
