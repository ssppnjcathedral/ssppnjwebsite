// ── CONTENT OVERRIDES LOADER ──
// Loads on every page. Fetches overrides from Supabase and applies them.
// Runs after supabase-client.js. No auth required (public read).

(function() {
  if (!_supabase) return;

  var PAGE_KEY = document.location.pathname.replace(/^\/|\.html$/g, '') || 'index';

  async function applyOverrides() {
    try {
      var result = await _supabase
        .from('content_overrides')
        .select('selector, override_type, new_value')
        .eq('page_key', PAGE_KEY);

      if (!result.data || !result.data.length) return;

      result.data.forEach(function(row) {
        var el = document.querySelector(row.selector);
        if (!el) return;

        switch (row.override_type) {
          case 'image':
            if (el.tagName === 'IMG') {
              el.src = row.new_value;
            } else {
              // Background image
              el.style.backgroundImage = 'url(' + row.new_value + ')';
            }
            break;
          case 'text':
            el.textContent = row.new_value;
            break;
          case 'caption':
            // Look for figcaption sibling or child
            var cap = el.tagName === 'FIGCAPTION' ? el :
                      el.querySelector('figcaption') ||
                      (el.parentElement && el.parentElement.querySelector('figcaption'));
            if (cap) cap.textContent = row.new_value;
            break;
        }
      });
    } catch (e) {
      console.warn('Content overrides load error:', e);
    }
  }

  // Apply after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyOverrides);
  } else {
    applyOverrides();
  }
})();
