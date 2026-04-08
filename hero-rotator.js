/*
   SSPP HERO IMAGE ROTATOR
   - Set window.HERO_IMAGES on each page before loading this script
   - Works on homepage (#hero-bg1/#hero-bg2) and all page heroes (.page-hero, .vp-hero, .giving-hero)
   - Pan-down animation: images drift slowly from top to bottom
   - Smooth crossfade between images, no dark flash
   - Loops continuously
*/

(function () {

  var ALL_HEROES = [
    {url:'/images/heroes/hero-01.jpg'},{url:'/images/heroes/hero-02.jpg'},
    {url:'/images/heroes/hero-03.jpg'},{url:'/images/heroes/hero-05.jpg'},
    {url:'/images/heroes/hero-06.jpg'},{url:'/images/heroes/hero-09.jpg'},
    {url:'/images/heroes/hero-10.jpg'},{url:'/images/heroes/hero-12.jpg'},
    {url:'/images/heroes/hero-13.jpg'},{url:'/images/heroes/hero-14.jpg'},
    {url:'/images/heroes/hero-16.jpg'},{url:'/images/heroes/hero-18.jpg'}
  ];

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  var IMAGES = shuffle(ALL_HEROES.slice());

  var HOLD     = 15000;  // ms each image is fully visible
  var FADE     = 2000;   // ms crossfade
  var ZOOM_DUR = 17000;  // ms zoom — longer than HOLD+FADE so it never stops mid-slide

  /* Inject shared CSS once */
  if (!document.getElementById('hr-css')) {
    var s = document.createElement('style');
    s.id = 'hr-css';
    s.textContent =
      '@keyframes hr-kenburns{from{transform:scale(1)}to{transform:scale(1.08)}}' +
      '.hr-bg{position:absolute;inset:0;background-size:cover;background-repeat:no-repeat;' +
        'background-position:center center;opacity:0;z-index:1;will-change:opacity,transform}';
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
        'rgba(91,18,30,0.97) 0%,' +
        'rgba(91,18,30,0.90) 45%,' +
        'rgba(91,18,30,0.45) 75%,' +
        'rgba(91,18,30,0.00) 100%);';

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

  function applyZoom(el) {
    el.style.animation = 'none';
    void el.offsetWidth; /* force reflow so animation restarts */
    el.style.animation = 'hr-kenburns ' + ZOOM_DUR + 'ms linear forwards';
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
    applyZoom(front);
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
      applyZoom(back);
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
