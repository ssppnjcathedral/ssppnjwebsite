// ── ADMIN VISUAL EDITOR ──
// Loaded on every page after auth.js. Shows edit controls for site admins.
// Allows inline editing of text, images, and captions.

(function() {
  if (!_supabase) return;

  var PAGE_KEY = document.location.pathname.replace(/^\/|\.html$/g, '') || 'index';
  var isAdmin = false;
  var editMode = false;
  var editBtn = null;
  var overlays = [];

  // Editable selectors — elements that can be edited
  var EDITABLE_TEXT = 'h1, h2, h3, .section-head, .rubric, .rubric-voice, figcaption, .hero-title, .hero-sub, .breadcrumb, p.drop-cap, .enc-head, .enc-body, .enc-stat, .enc-stat-label, .card-title, .card-desc, .stat-number, .stat-label';
  var EDITABLE_IMAGES = 'img, .page-hero, .giving-hero, .cal-snapshot, .vp-hero, [style*="background-image"]';

  // ── Check admin status ──
  async function checkAdmin() {
    try {
      var user = await getCurrentUser();
      if (!user) return;
      var result = await _supabase
        .from('site_admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      if (result.data) {
        isAdmin = true;
        createEditButton();
      }
    } catch (e) {}
  }

  // ── Floating edit button ──
  function createEditButton() {
    editBtn = document.createElement('button');
    editBtn.id = 'admin-edit-btn';
    editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span>Edit Page</span>';
    editBtn.onclick = toggleEditMode;
    document.body.appendChild(editBtn);
    injectStyles();
  }

  // ── Toggle edit mode ──
  function toggleEditMode() {
    editMode = !editMode;
    document.body.classList.toggle('admin-editing', editMode);
    editBtn.querySelector('span').textContent = editMode ? 'Done Editing' : 'Edit Page';
    editBtn.classList.toggle('active', editMode);

    if (editMode) {
      addOverlays();
    } else {
      removeOverlays();
    }
  }

  // ── Generate a stable identifier for an element ──
  function getSelector(el) {
    // For images, use src as a stable identifier
    if (el.tagName === 'IMG' && el.src) {
      // Strip origin to get relative path
      var src = el.getAttribute('src') || el.src.replace(window.location.origin, '');
      return 'img[src="' + src + '"]';
    }
    // For elements with IDs
    if (el.id) return '#' + el.id;
    // For elements with unique classes
    if (el.className && typeof el.className === 'string') {
      var classes = el.className.trim().split(/\s+/).filter(function(c) {
        return c && !c.startsWith('admin-') && !c.startsWith('jw-');
      });
      if (classes.length) {
        var sel = el.tagName.toLowerCase() + '.' + classes.join('.');
        if (document.querySelectorAll(sel).length === 1) return sel;
      }
    }
    // Fallback: path with IDs as anchors
    var path = [];
    var current = el;
    while (current && current !== document.body) {
      var tag = current.tagName.toLowerCase();
      if (current.id) {
        path.unshift('#' + current.id);
        break;
      }
      var parent = current.parentElement;
      if (parent) {
        var siblings = Array.from(parent.children).filter(function(c) { return c.tagName === current.tagName; });
        if (siblings.length > 1) {
          var idx = siblings.indexOf(current) + 1;
          tag += ':nth-of-type(' + idx + ')';
        }
      }
      path.unshift(tag);
      current = parent;
    }
    return path.join(' > ');
  }

  // ── Add edit overlays to editable elements ──
  function addOverlays() {
    removeOverlays();

    // Text elements
    document.querySelectorAll(EDITABLE_TEXT).forEach(function(el) {
      if (isInsideDrawer(el)) return;
      makeTextEditable(el);
    });

    // Image elements
    document.querySelectorAll(EDITABLE_IMAGES).forEach(function(el) {
      if (isInsideDrawer(el)) return;
      if (el.tagName === 'IMG') {
        addImageOverlay(el);
      } else if (el.style.backgroundImage || getComputedStyle(el).backgroundImage !== 'none') {
        addBgImageOverlay(el);
      }
    });
  }

  function isInsideDrawer(el) {
    return el.closest('.jw-drawer, .jw-note-overlay, .mega-nav, footer, .mob-sheet, .sess-sheet, .iq-sheet, #admin-edit-btn');
  }

  // ── Make text editable ──
  function makeTextEditable(el) {
    el.classList.add('admin-editable-text');
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'true');
    el.dataset.originalText = el.textContent;

    var blurHandler = function() {
      var newText = el.textContent.trim();
      if (newText !== el.dataset.originalText.trim()) {
        saveOverride(getSelector(el), 'text', el.dataset.originalText, newText);
        showSavedToast();
      }
    };
    el.addEventListener('blur', blurHandler);
    overlays.push({ el: el, cleanup: function() {
      el.classList.remove('admin-editable-text');
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
      el.removeEventListener('blur', blurHandler);
    }});
  }

  // ── Image overlay (for <img> tags) ──
  function addImageOverlay(img) {
    var wrap = document.createElement('div');
    wrap.className = 'admin-img-wrap';
    wrap.style.position = 'relative';
    wrap.style.display = 'inline-block';
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);

    var overlay = document.createElement('div');
    overlay.className = 'admin-img-overlay';
    overlay.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>Replace Image</span>';
    overlay.onclick = function() { pickImage(img, 'image'); };
    wrap.appendChild(overlay);

    // Caption editing
    var fig = img.closest('figure');
    if (fig) {
      var cap = fig.querySelector('figcaption');
      if (cap) makeTextEditable(cap);
    }

    overlays.push({ el: wrap, cleanup: function() {
      wrap.parentNode.insertBefore(img, wrap);
      wrap.remove();
    }});
  }

  // ── Background image overlay ──
  function addBgImageOverlay(el) {
    el.classList.add('admin-bg-editable');
    var overlay = document.createElement('div');
    overlay.className = 'admin-bg-overlay';
    overlay.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>Replace Background</span>';
    overlay.onclick = function(e) { e.stopPropagation(); pickImage(el, 'background'); };
    el.style.position = el.style.position || 'relative';
    el.appendChild(overlay);
    overlays.push({ el: overlay, cleanup: function() {
      overlay.remove();
      el.classList.remove('admin-bg-editable');
    }});
  }

  // ── Pick and upload image ──
  function pickImage(el, mode) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async function() {
      var file = input.files[0];
      if (!file) return;

      // Show loading state
      el.style.opacity = '0.5';

      try {
        var user = await getCurrentUser();
        var ext = file.name.split('.').pop();
        var path = PAGE_KEY + '/' + Date.now() + '.' + ext;

        var uploadResult = await _supabase.storage
          .from('site-images')
          .upload(path, file, { upsert: true });

        if (uploadResult.error) throw uploadResult.error;

        var urlResult = _supabase.storage
          .from('site-images')
          .getPublicUrl(path);

        var publicUrl = urlResult.data.publicUrl;
        var selector = getSelector(el);

        if (mode === 'image' && el.tagName === 'IMG') {
          var originalSrc = el.dataset.originalSrc || el.src;
          el.dataset.originalSrc = originalSrc;
          el.src = publicUrl;
          saveOverride(selector, 'image', originalSrc, publicUrl);
        } else {
          var originalBg = el.dataset.originalBg || getComputedStyle(el).backgroundImage;
          el.dataset.originalBg = originalBg;
          el.style.backgroundImage = 'url(' + publicUrl + ')';
          saveOverride(selector, 'image', originalBg, publicUrl);
        }

        showSavedToast();
      } catch (e) {
        console.error('Upload error:', e);
        alert('Upload failed: ' + (e.message || 'Unknown error'));
      } finally {
        el.style.opacity = '';
      }
    };
    input.click();
  }

  // ── Save override to Supabase ──
  async function saveOverride(selector, type, original, newValue) {
    try {
      await _supabase.from('content_overrides').upsert({
        page_key: PAGE_KEY,
        selector: selector,
        override_type: type,
        original_value: original,
        new_value: newValue,
        updated_by: (await getCurrentUser()).id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'page_key,selector,override_type' });
    } catch (e) {
      console.error('Save override error:', e);
    }
  }

  // ── Saved toast ──
  function showSavedToast() {
    var toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.textContent = 'Saved';
      document.body.appendChild(toast);
    }
    toast.classList.add('visible');
    setTimeout(function() { toast.classList.remove('visible'); }, 1800);
  }

  // ── Remove overlays ──
  function removeOverlays() {
    overlays.forEach(function(o) { if (o.cleanup) o.cleanup(); });
    overlays = [];
  }

  // ── Inject styles ──
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      '#admin-edit-btn{position:fixed;bottom:1.5rem;left:1.5rem;z-index:9999;display:flex;align-items:center;gap:.5rem;background:var(--apse,#3B0F18);border:1px solid rgba(184,131,40,.35);color:var(--gold,#B88328);font-family:var(--f-ui,\"Cinzel\",serif);font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;padding:.55rem 1rem;border-radius:100px;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.4);transition:all .2s}' +
      '#admin-edit-btn:hover{background:var(--maroon,#7B1D2A);border-color:var(--gold,#B88328)}' +
      '#admin-edit-btn.active{background:var(--maroon,#7B1D2A);color:#fff;border-color:#fff}' +
      '#admin-edit-btn svg{flex-shrink:0}' +

      '.admin-editable-text{outline:2px dashed rgba(184,131,40,.35) !important;outline-offset:2px;cursor:text;transition:outline-color .18s}' +
      '.admin-editable-text:hover{outline-color:rgba(184,131,40,.6) !important}' +
      '.admin-editable-text:focus{outline-color:var(--gold,#B88328) !important;outline-style:solid !important}' +

      '.admin-img-overlay,.admin-bg-overlay{position:absolute;inset:0;background:rgba(59,15,24,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem;opacity:0;transition:opacity .2s;cursor:pointer;z-index:10;border-radius:inherit}' +
      '.admin-img-overlay:hover,.admin-bg-overlay:hover{opacity:1}' +
      '.admin-img-overlay span,.admin-bg-overlay span{font-family:var(--f-ui,\"Cinzel\",serif);font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;color:#fff}' +
      '.admin-img-overlay svg,.admin-bg-overlay svg{stroke:#fff}' +

      '#admin-toast{position:fixed;bottom:4rem;left:50%;transform:translateX(-50%) translateY(10px);background:var(--verdigris,#3D6B5E);color:#fff;font-family:var(--f-ui,\"Cinzel\",serif);font-size:.55rem;letter-spacing:.14em;text-transform:uppercase;padding:.5rem 1.25rem;border-radius:100px;opacity:0;transition:all .3s;z-index:10000;pointer-events:none}' +
      '#admin-toast.visible{opacity:1;transform:translateX(-50%) translateY(0)}' +

      '@media(max-width:680px){#admin-edit-btn{bottom:5rem;left:1rem;padding:.45rem .85rem;font-size:.5rem}}';
    document.head.appendChild(style);
  }

  // ── Init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAdmin);
  } else {
    checkAdmin();
  }
})();
