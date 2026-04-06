/*
   SSPP HERO IMAGE ROTATOR
   - Set window.HERO_IMAGES on each page before loading this script
   - Works on homepage (#hero-bg1/#hero-bg2) and all page heroes (.page-hero, .vp-hero, .giving-hero)
   - Pan-down animation: images drift slowly from top to bottom
   - Smooth crossfade between images, no dark flash
   - Loops continuously
*/

(function () {

  var IMAGES = (window.HERO_IMAGES && window.HERO_IMAGES.length)
    ? window.HERO_IMAGES
    : [
        { url: '/images/heroes/hero-03.jpg' },
        { url: '/images/heroes/hero-01.jpg' },
        { url: '/images/heroes/hero-09.jpg' }
      ];

  var HOLD    = 8000;   // ms each image is fully visible
  var FADE    = 1400;   // ms crossfade
  var PAN_DUR = 11000;  // ms full pan — longer than HOLD so pan never stops mid-slide

  /* Inject shared CSS once */
  if (!document.getElementById('hr-css')) {
    var s = document.createElement('style');
    s.id = 'hr-css';
    s.textContent =
      '@keyframes hr-pan{from{background-position:center top}to{background-position:center bottom}}' +
      '.hr-bg{position:absolute;inset:0;background-size:cover;background-repeat:no-repeat;' +
        'background-position:center top;opacity:0;z-index:1;will-change:opacity,background-position}';
    document.head.appendChild(s);
  }

  var bg1, bg2;

  function setup() {
    /* Homepage already has named divs */
    bg1 = document.getElementById('hero-bg1');
    bg2 = document.getElementById('hero-bg2');
    if (bg1 && bg2) {
      bg1.className = bg1.className + ' hr-bg';
      bg2.className = bg2.className + ' hr-bg';
      return true;
    }

    /* All other page heroes — inject bg divs dynamically */
    var container = document.querySelector('.page-hero, .vp-hero, .giving-hero');
    if (!container) return false;

    /* Grab the overlay gradient before clearing the background */
    var cs = window.getComputedStyle(container);
    var bgImg = cs.backgroundImage || '';
    var gradient = bgImg.replace(/url\([^)]+\)/g, '').replace(/,\s*,/g, ',')
                        .replace(/^[\s,]+|[\s,]+$/g, '');

    /* Strip the static image from the container (gradient stays via overlay below) */
    container.style.backgroundImage = 'none';

    bg1 = document.createElement('div');
    bg2 = document.createElement('div');
    bg1.className = 'hr-bg';
    bg2.className = 'hr-bg';

    /* Gradient overlay — dark left and right, slight lift in centre */
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;z-index:4;pointer-events:none;' +
      'background:linear-gradient(to right,' +
        'rgba(43,11,18,0.93) 0%,' +
        'rgba(43,11,18,0.74) 42%,' +
        'rgba(43,11,18,0.88) 100%);';

    /* Lift existing content children above the bg layers */
    Array.prototype.forEach.call(container.children, function (child) {
      child.style.position = 'relative';
      child.style.zIndex   = '5';
    });

    /* Prepend bg1, bg2, overlay — underneath existing content */
    container.insertBefore(overlay, container.firstChild);
    container.insertBefore(bg2,    container.firstChild);
    container.insertBefore(bg1,    container.firstChild);

    return true;
  }

  function applyPan(el) {
    el.style.animation = 'none';
    void el.offsetWidth; /* force reflow so animation restarts */
    el.style.backgroundPosition = 'center top';
    el.style.animation = 'hr-pan ' + PAN_DUR + 'ms linear forwards';
  }

  function setImage(el, img) {
    el.style.backgroundImage    = 'url("' + img.url + '")';
    el.style.backgroundSize     = 'cover';
    el.style.backgroundRepeat   = 'no-repeat';
  }

  var current = 0;
  var front, back;

  function init() {
    if (!setup()) return;

    front = bg1;
    back  = bg2;

    front.style.zIndex     = '2';
    back.style.zIndex      = '1';
    front.style.transition = 'opacity ' + (FADE / 1000) + 's ease-in-out';
    back.style.transition  = 'opacity ' + (FADE / 1000) + 's ease-in-out';

    setImage(front, IMAGES[0]);
    applyPan(front);
    front.style.opacity = '1';

    if (IMAGES.length > 1) new Image().src = IMAGES[1].url;
    setTimeout(advance, HOLD);
  }

  function advance() {
    current = (current + 1) % IMAGES.length;
    var next = IMAGES[current];

    var img = new Image();
    img.onload = function () {
      setImage(back, next);
      applyPan(back);
      back.style.transition = 'none';
      back.style.opacity    = '0';
      back.style.zIndex     = '1';

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          back.style.zIndex     = '3';
          back.style.transition = 'opacity ' + (FADE / 1000) + 's ease-in-out';
          back.style.opacity    = '1';

          setTimeout(function () {
            front.style.transition = 'none';
            front.style.opacity    = '0';
            front.style.zIndex     = '1';
            back.style.zIndex      = '2';

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
