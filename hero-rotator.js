/*
   SSPP HERO IMAGE ROTATOR
   - Loads first image immediately on page load
   - Ken Burns slow zoom on each image
   - 7-second hold per image
   - Smooth crossfade between images (no dark flash)
   - Loops back to first image
*/

(function() {

  var IMAGES = [
    { url: '/images/heroes/home-1.jpg', pos: 'center center' },
    { url: '/images/heroes/home-2.jpg', pos: 'center center' },
    { url: '/images/heroes/home-3.jpg', pos: 'center center' },
    { url: '/images/heroes/home-4.jpg', pos: 'center center' },
    { url: '/images/heroes/home-5.jpg', pos: 'center center' },
    { url: '/images/heroes/home-6.jpg', pos: 'center center' }
  ];

  var HOLD     = 7000;   // ms to hold each image
  var FADE     = 1800;   // ms crossfade duration (match CSS transition)
  var ZOOM_DUR = 9000;   // ms Ken Burns zoom duration (hold + fade)

  var bg1 = document.getElementById('hero-bg1');
  var bg2 = document.getElementById('hero-bg2');
  if (!bg1 || !bg2) return;

  var current = 0;   // index of image currently visible
  var front = bg1;   // the div currently on top (visible)
  var back  = bg2;   // the div being prepared underneath

  // Apply Ken Burns zoom animation to an element
  function applyZoom(el) {
    el.style.animation = 'none';
    // Force reflow so animation restarts
    void el.offsetWidth;
    el.style.animation = 'kenburns ' + ZOOM_DUR + 'ms ease-out forwards';
  }

  // Set background image on a div
  function setImage(el, img) {
    el.style.backgroundImage = 'url("' + img.url + '")';
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = img.pos || 'center center';
    el.style.backgroundRepeat = 'no-repeat';
  }

  // Load first image immediately — no wait
  function init() {
    var first = IMAGES[0];
    setImage(front, first);
    applyZoom(front);
    front.style.opacity = '1';
    back.style.opacity = '0';

    // Preload second image
    if (IMAGES.length > 1) {
      var preload = new Image();
      preload.src = IMAGES[1].url;
    }

    // Start the rotation timer
    setTimeout(advance, HOLD);
  }

  // Crossfade to next image
  function advance() {
    current = (current + 1) % IMAGES.length;
    var next = IMAGES[current];

    // Prepare back layer with next image (already invisible)
    setImage(back, next);
    applyZoom(back);

    // Bring back layer to front (z-index already set in CSS: bg2 z-index:1)
    // Fade it IN
    back.style.transition = 'opacity ' + (FADE / 1000) + 's ease-in-out';
    back.style.opacity = '1';

    // After fade completes, swap roles and fade old front out
    setTimeout(function() {
      front.style.transition = 'none';
      front.style.opacity = '0';

      // Swap front and back references
      var tmp = front;
      front = back;
      back = tmp;

      // Hold then advance again
      setTimeout(advance, HOLD);
    }, FADE);
  }

  // Kick off on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
