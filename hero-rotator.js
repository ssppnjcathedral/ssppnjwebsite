/* ═══════════════════════════════════════════════════════
   SSPP HERO IMAGE ROTATOR
   Curated Wikimedia Commons Orthodox imagery
   Public domain / CC-licensed — free to use
   Picks one random image per page load, crossfades on a timer
═══════════════════════════════════════════════════════ */

(function() {

  /* ── CURATED IMAGE POOL ──────────────────────────────
     All from Wikimedia Commons. Each has:
     - url:   Direct image URL (1280px preview — fast load, sharp enough for hero)
     - label: What it depicts
     - pos:   CSS background-position for best crop
  ─────────────────────────────────────────────────────── */
  var IMAGES = [

    /* SSPP PARISH PHOTOS */
    {
      url: '/images/heroes/home-1.jpg',
      label: 'Saints Peter & Paul Orthodox Cathedral',
      pos: 'center center'
    },
    {
      url: '/images/heroes/home-2.jpg',
      label: 'Saints Peter & Paul Orthodox Cathedral',
      pos: 'center center'
    },
    {
      url: '/images/heroes/home-3.jpg',
      label: 'Saints Peter & Paul Orthodox Cathedral',
      pos: 'center center'
    },
    {
      url: '/images/heroes/home-4.jpg',
      label: 'Saints Peter & Paul Orthodox Cathedral',
      pos: 'center center'
    },
    {
      url: '/images/heroes/home-5.jpg',
      label: 'Saints Peter & Paul Orthodox Cathedral',
      pos: 'center center'
    },
    {
      url: '/images/heroes/home-6.jpg',
      label: 'Saints Peter & Paul Orthodox Cathedral',
      pos: 'center center'
    }
  ];

  /* ── GRADIENT SCRIM ────────────────────────────────── */
  var SCRIM = 'linear-gradient(to right, rgba(21,8,4,.88) 0%, rgba(21,8,4,.65) 55%, rgba(21,8,4,.38) 100%)';

  /* ── FIND HERO ELEMENT ─────────────────────────────── */
  var heroBg = document.querySelector('.hero-bg');
  var hero = heroBg || document.querySelector('.page-hero') || document.querySelector('.giving-hero') || document.querySelector('.hero');
  if (!hero) return;

  /* ── PICK RANDOM START IMAGE ───────────────────────── */
  function pick(exclude) {
    var pool = IMAGES.filter(function(img, i) { return i !== exclude; });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  var currentIdx = Math.floor(Math.random() * IMAGES.length);
  var current = IMAGES[currentIdx];

  /* ── APPLY IMAGE ───────────────────────────────────── */
  function applyImage(img) {
    hero.style.backgroundImage = SCRIM + ', url("' + img.url + '")';
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = img.pos || 'center center';
    hero.style.backgroundRepeat = 'no-repeat';
    hero.style.transition = 'background-image 1.2s ease-in-out';
  }

  /* ── CROSSFADE TO NEXT ─────────────────────────────── */
  function advance() {
    var nextIdx = Math.floor(Math.random() * IMAGES.length);
    if (nextIdx === currentIdx) nextIdx = (nextIdx + 1) % IMAGES.length;
    currentIdx = nextIdx;
    applyImage(IMAGES[currentIdx]);
  }

  /* ── PRELOAD THEN SHOW ─────────────────────────────── */
  var img = new Image();
  img.onload = function() {
    applyImage(current);
    setInterval(advance, 8000); /* rotate every 8 seconds */
  };
  img.onerror = function() {
    /* First image failed — try next */
    currentIdx = (currentIdx + 1) % IMAGES.length;
    img.src = IMAGES[currentIdx].url;
  };
  img.src = current.url;

})();
