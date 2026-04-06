/*
   SSPP HERO IMAGE ROTATOR
   - Loads first image immediately on page load
   - Ken Burns slow zoom on each image (15s)
   - Smooth crossfade between images — no dark flash
   - Loops continuously
*/

(function () {

  var IMAGES = [
    { url: '/images/heroes/hero-03.jpg', pos: 'center center' },
    { url: '/images/heroes/hero-02.jpg', pos: 'center center' },
    { url: '/images/heroes/hero-04.jpg', pos: 'center center' },
    { url: '/images/heroes/hero-11.jpg', pos: 'center center' },
    { url: '/images/heroes/hero-01.jpg', pos: 'center center' },
    { url: '/images/heroes/hero-09.jpg', pos: 'center center' },
    { url: '/images/heroes/hero-07.jpg', pos: 'center center' },
    { url: '/images/heroes/hero-12.jpg', pos: 'center center' },
    { url: '/images/heroes/hero-06.jpg', pos: 'center center' },
    { url: '/images/heroes/hero-08.jpg', pos: 'center center' }
  ];

  var HOLD     = 15000;  // ms to show each image
  var FADE     = 2000;   // ms crossfade
  var ZOOM_DUR = 17000;  // ms zoom — longer than HOLD+FADE so it never stops mid-slide

  var bg1 = document.getElementById('hero-bg1');
  var bg2 = document.getElementById('hero-bg2');
  if (!bg1 || !bg2) return;

  /* Reset any CSS z-index — we manage it dynamically */
  bg1.style.zIndex  = '1';
  bg2.style.zIndex  = '0';
  bg1.style.opacity = '0';
  bg2.style.opacity = '0';

  var current = 0;
  var front = bg1;  /* currently visible */
  var back  = bg2;  /* being prepared    */

  function applyZoom(el) {
    el.style.animation = 'none';
    void el.offsetWidth; /* force reflow so animation restarts */
    el.style.animation = 'kenburns ' + ZOOM_DUR + 'ms linear forwards';
  }

  function setImage(el, img) {
    el.style.backgroundImage    = 'url("' + img.url + '")';
    el.style.backgroundSize     = 'cover';
    el.style.backgroundPosition = img.pos || 'center center';
    el.style.backgroundRepeat   = 'no-repeat';
  }

  function init() {
    setImage(front, IMAGES[0]);
    applyZoom(front);
    front.style.zIndex     = '1';
    front.style.transition = 'opacity ' + (FADE / 1000) + 's ease-in-out';
    front.style.opacity    = '1';

    /* preload next */
    if (IMAGES.length > 1) new Image().src = IMAGES[1].url;

    setTimeout(advance, HOLD);
  }

  function advance() {
    current = (current + 1) % IMAGES.length;
    var next = IMAGES[current];

    var img = new Image();
    img.onload = function () {
      /* prepare back layer silently underneath */
      setImage(back, next);
      applyZoom(back);
      back.style.transition = 'none';
      back.style.opacity    = '0';
      back.style.zIndex     = '0';

      /* double rAF so browser paints the reset before we animate */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          back.style.zIndex     = '2';   /* lift above front */
          back.style.transition = 'opacity ' + (FADE / 1000) + 's ease-in-out';
          back.style.opacity    = '1';

          setTimeout(function () {
            /* back fully visible — hide and demote front */
            front.style.transition = 'none';
            front.style.opacity    = '0';
            front.style.zIndex     = '0';
            back.style.zIndex      = '1';

            /* swap */
            var tmp = front; front = back; back = tmp;

            setTimeout(advance, HOLD);
          }, FADE);
        });
      });
    };
    img.onerror = function () { setTimeout(advance, 500); };
    img.src = next.url;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
