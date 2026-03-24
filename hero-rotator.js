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

    /* CHURCH INTERIORS — NAVES & ICONOSTASES */
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Interior_of_Greek_Orthodox_church_18th_century_section.JPG/1280px-Interior_of_Greek_Orthodox_church_18th_century_section.JPG',
      label: 'Greek Orthodox church interior, 18th century',
      pos: 'center center'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Romanian_Orthodox_Monastery_%2849074404227%29.jpg/1280px-Romanian_Orthodox_Monastery_%2849074404227%29.jpg',
      label: 'Romanian Orthodox Monastery interior',
      pos: 'center center'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Saint_Nicholas_Orthodox_church_in_Bangkok_%2810%29.jpg/1280px-Saint_Nicholas_Orthodox_church_in_Bangkok_%2810%29.jpg',
      label: 'Saint Nicholas Orthodox Church, Bangkok',
      pos: 'center center'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Saint_Nicholas_Orthodox_church_in_Bangkok_%287%29.jpg/1280px-Saint_Nicholas_Orthodox_church_in_Bangkok_%287%29.jpg',
      label: 'Saint Nicholas Orthodox Church interior, Bangkok',
      pos: 'center 40%'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/St._Michael_the_Archangel_Russian_Orthodox_Church%2C_Kuala_Lumpur_%281%29.jpg/1280px-St._Michael_the_Archangel_Russian_Orthodox_Church%2C_Kuala_Lumpur_%281%29.jpg',
      label: 'St Michael the Archangel Russian Orthodox Church, Kuala Lumpur',
      pos: 'center center'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/St._Michael_the_Archangel_Russian_Orthodox_Church%2C_Kuala_Lumpur_%282%29.jpg/1280px-St._Michael_the_Archangel_Russian_Orthodox_Church%2C_Kuala_Lumpur_%282%29.jpg',
      label: 'St Michael the Archangel Orthodox Church interior',
      pos: 'center center'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/St._Michael_the_Archangel_Russian_Orthodox_Church%2C_Kuala_Lumpur_%283%29.jpg/1280px-St._Michael_the_Archangel_Russian_Orthodox_Church%2C_Kuala_Lumpur_%283%29.jpg',
      label: 'Russian Orthodox Church interior, Kuala Lumpur',
      pos: 'center center'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/St._Michael_the_Archangel_Russian_Orthodox_Church%2C_Kuala_Lumpur_%285%29.jpg/1280px-St._Michael_the_Archangel_Russian_Orthodox_Church%2C_Kuala_Lumpur_%285%29.jpg',
      label: 'Russian Orthodox Church nave, Kuala Lumpur',
      pos: 'center 30%'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Turku_Orthodox_Church%2C_interior.JPG/1280px-Turku_Orthodox_Church%2C_interior.JPG',
      label: 'Turku Orthodox Church interior, Finland',
      pos: 'center center'
    },

    /* ICONOSTASES */
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Church_of_the_Dormition_of_the_Theotokos_iconostasis.jpg/1280px-Church_of_the_Dormition_of_the_Theotokos_iconostasis.jpg',
      label: 'Church of the Dormition of the Theotokos iconostasis',
      pos: 'center center'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Russian_Orthodox_iconostasis_Deventer.jpg/1280px-Russian_Orthodox_iconostasis_Deventer.jpg',
      label: 'Russian Orthodox iconostasis, Deventer',
      pos: 'center center'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Iconostasis%2C_crypt_of_Church_of_Saint_Sava%2C_Belgrade.jpg/1280px-Iconostasis%2C_crypt_of_Church_of_Saint_Sava%2C_Belgrade.jpg',
      label: 'Iconostasis, crypt of Church of Saint Sava, Belgrade',
      pos: 'center center'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/St_Michael_The_Archangel_Russian_Orthodox_Church_Malaysia_15_May_2022.jpg/1280px-St_Michael_The_Archangel_Russian_Orthodox_Church_Malaysia_15_May_2022.jpg',
      label: 'Russian Orthodox Church interior, Malaysia',
      pos: 'center center'
    },

    /* CATHEDRAL EXTERIORS & DOMES */
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Hagia_Sophia_Mars_2013.jpg/1280px-Hagia_Sophia_Mars_2013.jpg',
      label: 'Hagia Sophia, Constantinople',
      pos: 'center 60%'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Saint_Basil%27s_Cathedral_in_Moscow_%28pixinn.net%29.jpg/1280px-Saint_Basil%27s_Cathedral_in_Moscow_%28pixinn.net%29.jpg',
      label: "Saint Basil's Cathedral, Moscow",
      pos: 'center 40%'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Cathedral_of_the_Annunciation_in_Moscow_Kremlin_-_5481.jpg/1280px-Cathedral_of_the_Annunciation_in_Moscow_Kremlin_-_5481.jpg',
      label: 'Cathedral of the Annunciation, Moscow Kremlin',
      pos: 'center center'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/20100px-Meteora_kloster_Varlaam.jpg/1280px-20100px-Meteora_kloster_Varlaam.jpg',
      label: 'Varlaam Monastery, Meteora',
      pos: 'center 40%'
    },

    /* BYZANTINE MOSAICS & FRESCOES */
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Hagia_Sophia_Interior_Wikimedia_Commons.jpg/1280px-Hagia_Sophia_Interior_Wikimedia_Commons.jpg',
      label: 'Hagia Sophia interior',
      pos: 'center center'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Hagia_Sophia_altar.jpg/1280px-Hagia_Sophia_altar.jpg',
      label: 'Hagia Sophia altar and apse',
      pos: 'center center'
    },

    /* ICONS */
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Icon_of_Christ_Pantocrator%2C_Sinai%2C_6th_century.jpg/800px-Icon_of_Christ_Pantocrator%2C_Sinai%2C_6th_century.jpg',
      label: 'Christ Pantocrator, 6th century, Sinai',
      pos: 'center 30%'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Kizhi_church_1.jpg/1280px-Kizhi_church_1.jpg',
      label: 'Church of the Transfiguration, Kizhi island',
      pos: 'center 40%'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Iglesia_de_la_Natividad%2C_Bet_Sahour%2C_Palestina%2C_2013-09-12%2C_DD_04.jpg/1280px-Iglesia_de_la_Natividad%2C_Bet_Sahour%2C_Palestina%2C_2013-09-12%2C_DD_04.jpg',
      label: 'Church of the Nativity interior, Bethlehem',
      pos: 'center center'
    },

    /* MONASTERIES */
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Monastery_of_Saint_Naum_02.jpg/1280px-Monastery_of_Saint_Naum_02.jpg',
      label: 'Monastery of Saint Naum, North Macedonia',
      pos: 'center center'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Rila_Monastery_Bulgaria.jpg/1280px-Rila_Monastery_Bulgaria.jpg',
      label: 'Rila Monastery, Bulgaria',
      pos: 'center 40%'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Mystras_view.jpg/1280px-Mystras_view.jpg',
      label: 'Byzantine churches, Mystras',
      pos: 'center center'
    },
  ];

  /* ── GRADIENT SCRIM ────────────────────────────────── */
  var SCRIM = 'linear-gradient(to right, rgba(21,8,4,.88) 0%, rgba(21,8,4,.65) 55%, rgba(21,8,4,.38) 100%)';

  /* ── FIND HERO ELEMENT ─────────────────────────────── */
  var hero = document.querySelector('.page-hero') || document.querySelector('.giving-hero') || document.querySelector('.hero');
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
