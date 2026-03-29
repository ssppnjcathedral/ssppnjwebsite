/* ═══════════════════════════════════════════════════════════════
   SSPP SCROLL ANIMATION SYSTEM
   A+B: Fade-up base with selective signature moments per section
   ═══════════════════════════════════════════════════════════════ */

(function () {

  /* ── Respect user's motion preferences ────────────────────── */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Shared easing ────────────────────────────────────────── */
  var EASE = 'cubic-bezier(.22,1,.36,1)';

  /* ── Hero parallax ────────────────────────────────────────── */
  (function () {
    var hero = document.querySelector('.hero-content');
    if (!hero || reduced) return;
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset;
      var vh = window.innerHeight;
      if (y > vh) return;
      hero.style.transform = 'translateY(' + (y * 0.28) + 'px)';
      hero.style.opacity   = Math.max(0, 1 - (y / vh * 1.6));
    }, { passive: true });
  })();


  /* ════════════════════════════════════════════════════════════
     A. BASE REVEAL STYLES
     ════════════════════════════════════════════════════════════ */

  var baseStyle = document.createElement('style');
  baseStyle.textContent =
    '.rv{opacity:0;transform:translateY(22px);transition:opacity .7s ' + EASE + ',transform .7s ' + EASE + '}' +
    '.rv.in{opacity:1;transform:none}' +
    '.rv-d1{transition-delay:.08s}.rv-d2{transition-delay:.17s}.rv-d3{transition-delay:.26s}.rv-d4{transition-delay:.35s}' +
    '.rv-left{opacity:0;transform:translateX(-28px);transition:opacity .75s ' + EASE + ',transform .75s ' + EASE + '}' +
    '.rv-left.in{opacity:1;transform:none}' +
    '.rv-right{opacity:0;transform:translateX(28px);transition:opacity .75s ' + EASE + ',transform .75s ' + EASE + '}' +
    '.rv-right.in{opacity:1;transform:none}' +
    '.rv-scale{opacity:0;transform:scale(.94);transition:opacity .6s ' + EASE + ',transform .6s ' + EASE + '}' +
    '.rv-scale.in{opacity:1;transform:none}' +
    '.rv-quote{opacity:0;transform:translateY(40px);transition:opacity 1s ' + EASE + ',transform 1s ' + EASE + '}' +
    '.rv-quote.in{opacity:1;transform:none}' +
    '.rv-line{position:relative;overflow:hidden}' +
    '.rv-line::after{content:"";position:absolute;bottom:0;left:0;height:1px;width:100%;background:rgba(184,131,40,.4);transform:scaleX(0);transform-origin:left;transition:transform 1.2s ' + EASE + '}' +
    '.rv-line.in::after{transform:scaleX(1)}' +
    '.hero .rv,.nav .rv,footer .rv{opacity:1;transform:none;transition:none}';
  document.head.appendChild(baseStyle);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  function tag(el, cls, delay) {
    if (!el || reduced) { if(el) el.style.opacity='1'; return; }
    el.classList.add(cls || 'rv');
    if (delay) el.classList.add('rv-d' + delay);
    io.observe(el);
  }


  /* ════════════════════════════════════════════════════════════
     B. SECTION-SPECIFIC ANIMATIONS
     ════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {

    /* 1. CHAPTER BARS — slide down + fade */
    document.querySelectorAll('.chapter-bar').forEach(function (el) {
      if (reduced) return;
      el.style.cssText += 'opacity:0;transform:translateY(-12px);transition:opacity .6s ' + EASE + ',transform .6s ' + EASE;
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting) return;
        entries[0].target.style.opacity = '1';
        entries[0].target.style.transform = 'translateY(0)';
        obs.disconnect();
      }, { threshold: 0.3 }).observe(el);
    });

    /* 2. THIS SUNDAY — left children stagger up, right slide from right */
    var tsLeft = document.querySelector('.ts-left');
    var tsRight = document.querySelector('.ts-right');
    if (tsLeft) Array.from(tsLeft.children).forEach(function (c, i) { tag(c, 'rv', Math.min(i+1,4)); });
    if (tsRight) Array.from(tsRight.children).forEach(function (c, i) { tag(c, 'rv-right', Math.min(i+1,4)); });
    document.querySelectorAll('.ts-strip-item').forEach(function (el, i) { tag(el, 'rv-scale', Math.min(i+1,4)); });

    /* 3. WELCOME — text children stagger, photos slide from right */
    var wText = document.querySelector('.welcome-text');
    if (wText) Array.from(wText.children).forEach(function (c, i) { tag(c, 'rv', Math.min(i+1,4)); });
    tag(document.querySelector('.welcome-photos'), 'rv-right');

    /* 4. WORSHIP — header fades up, cards stagger L→R */
    tag(document.querySelector('.worship-header'), 'rv');
    document.querySelectorAll('.worship-card').forEach(function (el, i) { tag(el, 'rv', Math.min(i+1,3)); });

    /* 5. CHRYSOSTOM QUOTE — icon slides from left, text slow rise */
    tag(document.querySelector('.aq-icon'),  'rv-left');
    tag(document.querySelector('.aq-text'),  'rv-quote');
    tag(document.querySelector('.aq-attr'),  'rv', 2);
    tag(document.querySelector('.aq-ref'),   'rv', 3);

    /* 6. GALLERY — panels scale up staggered, text children stagger */
    document.querySelectorAll('.gallery-panel').forEach(function (el, i) { tag(el, 'rv-scale', Math.min(i+1,3)); });
    var gText = document.querySelector('.gallery-text');
    if (gText) Array.from(gText.children).forEach(function (c, i) { tag(c, 'rv', Math.min(i+1,4)); });

    /* 7. PULL QUOTE — line draws, then text slow rise */
    var qb = document.querySelector('.quote-break');
    if (qb) {
      tag(qb, 'rv-line');
      tag(qb.querySelector('.qb-text'), 'rv-quote', 1);
      tag(qb.querySelector('.qb-attr'), 'rv', 3);
    }

    /* 8. VISIT SECTION — left up, right details slide from right */
    var vLeft = document.querySelector('.visit-left');
    if (vLeft) Array.from(vLeft.children).forEach(function (c, i) { tag(c, 'rv', Math.min(i+1,3)); });
    document.querySelectorAll('.visit-detail').forEach(function (el, i) { tag(el, 'rv-right', Math.min(i+1,4)); });

    /* 9. BULLETIN ENTRIES — stagger */
    document.querySelectorAll('.bulletin-entry').forEach(function (el, i) { tag(el, 'rv', Math.min(i+1,3)); });

    /* 10. GIVING — children stagger up */
    var gInner = document.querySelector('.giving-inner');
    if (gInner) Array.from(gInner.children).forEach(function (c, i) { tag(c, 'rv', Math.min(i+1,4)); });

    /* 11. MISC — apostle, rector blocks */
    ['.apostle-quote-block > *', '.apostle-icon > *', '.rector-text > *'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        if (!el.classList.contains('rv') && !el.classList.contains('rv-quote') && !el.classList.contains('rv-left') && !el.classList.contains('rv-right')) {
          tag(el, 'rv', Math.min(i+1,4));
        }
      });
    });

  });


  /* ════════════════════════════════════════════════════════════
     C. GOLD LINE SWEEP — top of each major section
     ════════════════════════════════════════════════════════════ */
  (function () {
    var s = document.createElement('style');
    s.textContent =
      '.section-line{position:relative}' +
      '.section-line::before{content:"";position:absolute;top:0;left:0;height:1px;' +
      'background:rgba(184,131,40,.35);width:0;transition:width 1.3s ' + EASE + ';z-index:1}' +
      '.section-line.line-in::before{width:100%}';
    document.head.appendChild(s);

    ['.welcome-section','.worship-section','.aq-section',
     '.gallery-section','.visit-section','.bulletin-section','.giving-section']
    .forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      el.classList.add('section-line');
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting) return;
        setTimeout(function () { entries[0].target.classList.add('line-in'); }, 150);
        obs.disconnect();
      }, { threshold: 0.04 }).observe(el);
    });
  })();


  /* ════════════════════════════════════════════════════════════
     D. CARD HOVER DEPTH — desktop/mouse only
     ════════════════════════════════════════════════════════════ */
  (function () {
    var s = document.createElement('style');
    s.textContent =
      '@media(hover:hover){' +
      '.card,.news-card,.bulletin-card,.video-card,.admin-card,.cem-card,.donate-tier,.service-card' +
      '{transition:transform .22s ' + EASE + ',box-shadow .22s ' + EASE + '!important}' +
      '.card:hover,.news-card:hover,.bulletin-card:hover,.video-card:hover,' +
      '.admin-card:hover,.cem-card:hover,.donate-tier:hover,.service-card:hover' +
      '{transform:translateY(-5px)!important;box-shadow:0 12px 40px rgba(28,20,16,.13)!important}' +
      '.tl-entry:hover{border-left-color:var(--maroon)}' +
      '}';
    document.head.appendChild(s);
  })();

})();
