/* ═══════════════════════════════════════════════════════
   SSPP SITE ENHANCEMENTS
   1. Scroll Reveal — fade-up on enter viewport
   2. Card Hover Depth — lift + shadow on interactive cards
   ═══════════════════════════════════════════════════════ */

(function(){

  /* ── 1. SCROLL REVEAL ──────────────────────────────────
     Adds .reveal class to elements, animates them in when
     they enter the viewport via IntersectionObserver.
     Elements to reveal: section headings, prose blocks,
     cards, timeline entries, stat boxes, images, sidebars.
  ─────────────────────────────────────────────────────── */
  var REVEAL_SELECTORS = [
    '.section-head',
    '.rubric-rule',
    '.prose',
    '.stat-box',
    '.tl-entry',
    '.pullquote',
    '.quote-break',
    '.card',
    '.news-card',
    '.bulletin-card',
    '.gallery-card',
    '.video-card',
    '.service-card',
    '.admin-card',
    '.cem-card',
    '.belief-block',
    '.side-section',
    '.side-col',
    '.contact-block',
    '.donate-tier',
    '.reading-section',
    '.feast-header',
    '.saint-entry',
    '.info-grid',
    '.rdg-bar',
    '.stats-row',
    '.timeline',
    '.page-body > main > *',
    '.chapter-bar',
  ].join(',');

  var style = document.createElement('style');
  style.textContent = [
    '.reveal{opacity:0;transform:translateY(22px);transition:opacity .65s cubic-bezier(.22,1,.36,1),transform .65s cubic-bezier(.22,1,.36,1)}',
    '.reveal.revealed{opacity:1;transform:translateY(0)}',
    '.reveal-delay-1{transition-delay:.08s}',
    '.reveal-delay-2{transition-delay:.16s}',
    '.reveal-delay-3{transition-delay:.24s}',
    /* Hero content never reveals — it has its own animations */
    '.page-hero .reveal,.hero .reveal{opacity:1;transform:none}',
  ].join('');
  document.head.appendChild(style);

  function initReveal(){
    var els = document.querySelectorAll(REVEAL_SELECTORS);
    els.forEach(function(el){
      /* Skip hero elements, nav, footer */
      if(el.closest('.page-hero,.hero,.nav,footer,.nav-drawer')) return;
      el.classList.add('reveal');
    });

    /* Stagger siblings — cards in a row get delay offsets */
    var rows = document.querySelectorAll('.stats-row,.card-grid,.news-grid,.bulletin-grid,.admin-grid');
    rows.forEach(function(row){
      var children = row.querySelectorAll('.reveal');
      children.forEach(function(child, i){
        child.classList.add('reveal-delay-'+Math.min(i+1,3));
      });
    });

    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:0.08, rootMargin:'0px 0px -40px 0px'});

    document.querySelectorAll('.reveal').forEach(function(el){
      observer.observe(el);
    });
  }

  /* ── 2. CARD HOVER DEPTH ──────────────────────────────
     Cards lift on hover — applies to any clickable card
     that doesn't already have a hover transform.
  ─────────────────────────────────────────────────────── */
  var cardStyle = document.createElement('style');
  cardStyle.textContent = [
    '.card,.news-card,.bulletin-card,.video-card,.admin-card,.cem-card,.donate-tier,.service-card{',
    'transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s cubic-bezier(.22,1,.36,1)!important}',
    '.card:hover,.news-card:hover,.bulletin-card:hover,.video-card:hover,',
    '.admin-card:hover,.cem-card:hover,.donate-tier:hover,.service-card:hover{',
    'transform:translateY(-5px)!important;',
    'box-shadow:0 12px 40px rgba(28,20,16,.13)!important}',
    /* Stat boxes get a subtle scale */
    '.stat-box{transition:transform .2s ease,background .2s ease}',
    '.stat-box:hover{transform:scale(1.03);background:var(--vellum-mid)}',
    /* Timeline entries get a left-accent reveal */
    '.tl-entry{transition:border-color .2s ease}',
    '.tl-entry:hover{border-left-color:var(--maroon)}',
  ].join('');
  document.head.appendChild(cardStyle);

  /* ── INIT ─────────────────────────────────────────── */
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

})();


/* ── B. PARALLAX HERO TEXT ─────────────────────────────
   Hero content scrolls at 40% speed of page scroll,
   creating depth as user scrolls past the hero.        */
(function() {
  var heroContent = document.querySelector('.hero-content');
  var heroScroll = document.querySelector('.hero-scroll');
  if (!heroContent) return;
  window.addEventListener('scroll', function() {
    var y = window.pageYOffset;
    heroContent.style.transform = 'translateY(' + (y * 0.3) + 'px)';
    heroContent.style.opacity = 1 - (y / window.innerHeight * 1.4);
    if (heroScroll) heroScroll.style.opacity = 1 - (y / 200);
  }, { passive: true });
})();

/* ── E. STAGGERED CHILD REVEALS ───────────────────────
   Each section's children fade up sequentially,
   150ms apart, when the section enters the viewport.   */
(function() {
  var staggerTargets = document.querySelectorAll(
    '.welcome-text, .rector-text, .visit-left, .visit-right, .worship-header, .gallery-text, .aq-quote, .aq-icon'
  );
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var children = entry.target.children;
      Array.from(children).forEach(function(child, i) {
        child.style.opacity = '0';
        child.style.transform = 'translateY(18px)';
        child.style.transition = 'opacity .6s ease ' + (i * 150) + 'ms, transform .6s ease ' + (i * 150) + 'ms';
        setTimeout(function() {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        }, 50 + i * 150);
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  staggerTargets.forEach(function(el) { obs.observe(el); });
})();

/* ── F. GOLD LINE DRAW ON SECTION ENTER ───────────────
   A thin gold line draws from left to right across the
   top of key sections as they enter the viewport.      */
(function() {
  var style = document.createElement('style');
  style.textContent = '.section-line{position:relative}.section-line::before{content:"";position:absolute;top:0;left:0;height:1px;background:rgba(184,131,40,.45);width:0;transition:width 1.1s cubic-bezier(.4,0,.2,1)}.section-line.line-drawn::before{width:100%}';
  document.head.appendChild(style);

  var lineSections = document.querySelectorAll(
    '.welcome-section, .rector-section, .visit-section, .gallery-section, .bulletin-section, .aq-section'
  );
  lineSections.forEach(function(s) { s.classList.add('section-line'); });

  var lineObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        setTimeout(function() {
          entry.target.classList.add('line-drawn');
        }, 200);
        lineObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
  lineSections.forEach(function(s) { lineObs.observe(s); });
})();
