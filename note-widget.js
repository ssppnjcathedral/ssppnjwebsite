// ── NOTE WIDGET ──
// Save-a-verse and add-a-note component. Attaches to any container with verse spans.
// Writes to localStorage (`spp_reading_notes`) first, syncs to Supabase if signed in.
//
// Storage shape (localStorage):
//   spp_reading_notes -> { "YYYY-MM-DD": [ { id, ref, text, note, citation, source, created_at, updated_at } ] }
//
// Public API:
//   NoteWidget.attach({ root, date, resolveVerseMeta })
//     root              — element containing .verse-span nodes
//     date              — YYYY-MM-DD string for the saved verses
//     resolveVerseMeta  — fn(span) -> { ref, citation, source, text }
//                         ref is a stable slug like "matthew-5-9"
//
//   NoteWidget.getAll()                 — full localStorage dict
//   NoteWidget.getForDate(dateKey)      — array for one day
//   NoteWidget.remove(dateKey, ref)     — remove one entry, syncs delete
//   NoteWidget.save(dateKey, entry)     — upsert an entry (used internally)

(function(){
  var LS_KEY = 'spp_reading_notes';

  function readAll(){
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; }
    catch(e){ return {}; }
  }
  function writeAll(obj){
    try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch(e){}
  }
  function getForDate(dateKey){
    var all = readAll();
    return Array.isArray(all[dateKey]) ? all[dateKey] : [];
  }
  function findEntry(dateKey, ref){
    var list = getForDate(dateKey);
    for (var i=0; i<list.length; i++) if (list[i].ref === ref) return { entry:list[i], index:i };
    return null;
  }
  function saveEntry(dateKey, entry){
    var all = readAll();
    if (!Array.isArray(all[dateKey])) all[dateKey] = [];
    var list = all[dateKey];
    var now = new Date().toISOString();
    var idx = -1;
    for (var i=0; i<list.length; i++) if (list[i].ref === entry.ref) { idx = i; break; }
    if (idx >= 0) {
      list[idx] = Object.assign({}, list[idx], entry, { updated_at: now });
      entry = list[idx];
    } else {
      entry.created_at = now;
      entry.updated_at = now;
      list.push(entry);
    }
    writeAll(all);
    if (typeof window.syncReadingNote === 'function') {
      window.syncReadingNote(dateKey, entry);
    }
    return entry;
  }
  function removeEntry(dateKey, ref){
    var all = readAll();
    if (!Array.isArray(all[dateKey])) return;
    all[dateKey] = all[dateKey].filter(function(e){ return e.ref !== ref; });
    if (!all[dateKey].length) delete all[dateKey];
    writeAll(all);
    if (typeof window.deleteReadingNote === 'function') {
      window.deleteReadingNote(dateKey, ref);
    }
  }

  // ── UI ──
  var STYLE_ID = 'note-widget-style';
  function injectStyle(){
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      '.nw-selectable{cursor:pointer;transition:background .18s ease,box-shadow .18s ease;border-radius:2px;padding:0 .05em}',
      '.nw-hover:not(.nw-saved){background:rgba(184,131,40,.09)}',
      '.nw-selected{background:rgba(184,131,40,.18);box-shadow:inset 0 -2px 0 var(--gold)}',
      '.nw-saved{background:linear-gradient(180deg,transparent 55%,rgba(184,131,40,.22) 55%)}',
      '.nw-saved::after{content:"\\2605";color:var(--gold);font-size:.62em;margin-left:.22em;vertical-align:super;line-height:0}',
      '.nw-pop{position:absolute;z-index:40;background:var(--vellum);border:1px solid rgba(59,15,24,.2);box-shadow:0 8px 24px -8px rgba(21,8,4,.25);padding:.55rem;display:flex;gap:.35rem;align-items:center;flex-wrap:wrap;max-width:320px;font-family:var(--f-ui)}',
      '.nw-pop::before{content:"";position:absolute;top:-6px;left:18px;width:10px;height:10px;background:var(--vellum);border-left:1px solid rgba(59,15,24,.2);border-top:1px solid rgba(59,15,24,.2);transform:rotate(45deg)}',
      '.nw-btn{font-family:var(--f-ui);font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;padding:.45rem .7rem;border:1px solid rgba(59,15,24,.2);background:transparent;color:var(--apse);cursor:pointer;transition:background .15s,color .15s,border-color .15s}',
      '.nw-btn:hover{background:var(--maroon);color:var(--vellum);border-color:var(--maroon)}',
      '.nw-btn.nw-primary{background:var(--maroon);color:var(--vellum);border-color:var(--maroon)}',
      '.nw-btn.nw-primary:hover{background:var(--maroon-deep,#5C1520)}',
      '.nw-btn.nw-danger:hover{background:var(--maroon-deep,#5C1520);border-color:var(--maroon-deep,#5C1520);color:var(--vellum)}',
      '.nw-note-box{margin-top:.45rem;width:100%}',
      '.nw-note-box textarea{width:100%;min-height:72px;padding:.55rem .7rem;border:1px solid rgba(59,15,24,.2);background:#fff;font-family:var(--f-body);font-size:.95rem;color:var(--ink);outline:none;resize:vertical;line-height:1.5}',
      '.nw-note-box textarea:focus{border-color:var(--maroon)}',
      '.nw-note-row{display:flex;gap:.35rem;margin-top:.45rem;justify-content:flex-end}',
      '.nw-toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:var(--apse);color:var(--vellum);padding:.75rem 1.25rem;font-family:var(--f-ui);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;z-index:999;opacity:0;transition:opacity .22s ease;pointer-events:none}',
      '.nw-toast.nw-show{opacity:1}',
      '@media print{.nw-pop,.nw-toast{display:none !important}.nw-saved{background:none !important}.nw-saved::after{display:none !important}.nw-selectable{cursor:auto !important;padding:0 !important}.nw-selected,.nw-hover{background:none !important;box-shadow:none !important}}'
    ].join('');
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = css;
    document.head.appendChild(s);
  }

  var activePop = null;
  function closePop(){
    if (activePop && activePop.parentNode) activePop.parentNode.removeChild(activePop);
    activePop = null;
    document.querySelectorAll('.nw-selected').forEach(function(el){ el.classList.remove('nw-selected'); });
  }

  function toast(msg){
    var t = document.createElement('div');
    t.className = 'nw-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('nw-show'); });
    setTimeout(function(){
      t.classList.remove('nw-show');
      setTimeout(function(){ if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, 1600);
  }

  function positionPop(pop, target){
    var r = target.getBoundingClientRect();
    var top = r.bottom + window.scrollY + 8;
    var left = r.left + window.scrollX;
    var maxLeft = window.scrollX + document.documentElement.clientWidth - 340;
    if (left > maxLeft) left = maxLeft;
    if (left < 8) left = 8;
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
  }

  function openPop(span, ctx){
    closePop();
    span.classList.add('nw-selected');

    var dateKey = ctx.date;
    var meta = ctx.resolveVerseMeta(span);
    if (!meta || !meta.ref || !meta.text) return;

    if (!meta.text || !meta.text.trim()) return;
    var existing = findEntry(dateKey, meta.ref);
    var pop = document.createElement('div');
    pop.className = 'nw-pop';
    pop.setAttribute('role', 'dialog');

    function render(){
      pop.innerHTML = '';
      var saved = findEntry(dateKey, meta.ref);
      if (saved && saved.entry) {
        var editBtn = btn('Edit note', function(){ showNoteBox(saved.entry.note || ''); });
        var removeBtn = btn('Remove', function(){
          removeEntry(dateKey, meta.ref);
          span.classList.remove('nw-saved');
          toast('Removed from Your Notes');
          closePop();
        }, 'nw-danger');
        pop.appendChild(labelSpan(saved.entry.note ? 'Saved with a note' : 'Saved'));
        pop.appendChild(editBtn);
        pop.appendChild(removeBtn);
      } else {
        var saveBtn = btn('Save verse', function(){
          saveEntry(dateKey, {
            ref: meta.ref, text: meta.text, citation: meta.citation || '',
            source: meta.source || '', note: ''
          });
          span.classList.add('nw-saved');
          toast('Saved to Your Notes');
          closePop();
        }, 'nw-primary');
        var noteBtn = btn('Add note', function(){ showNoteBox(''); });
        pop.appendChild(saveBtn);
        pop.appendChild(noteBtn);
      }
    }

    function labelSpan(txt){
      var s = document.createElement('span');
      s.style.cssText = 'font-family:var(--f-display);font-style:italic;font-size:.92rem;color:var(--stone);margin-right:.35rem';
      s.textContent = txt;
      return s;
    }
    function btn(label, onClick, variant){
      var b = document.createElement('button');
      b.className = 'nw-btn' + (variant ? ' ' + variant : '');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', function(e){ e.stopPropagation(); onClick(); });
      return b;
    }
    function showNoteBox(initial){
      pop.innerHTML = '';
      var wrap = document.createElement('div');
      wrap.className = 'nw-note-box';
      var ta = document.createElement('textarea');
      ta.placeholder = 'Write a reflection on this verse.';
      ta.value = initial || '';
      wrap.appendChild(ta);
      var row = document.createElement('div');
      row.className = 'nw-note-row';
      var cancel = btn('Cancel', function(){ render(); });
      var save = btn('Save', function(){
        saveEntry(dateKey, {
          ref: meta.ref, text: meta.text, citation: meta.citation || '',
          source: meta.source || '', note: ta.value.trim()
        });
        span.classList.add('nw-saved');
        toast('Saved to Your Notes');
        closePop();
      }, 'nw-primary');
      row.appendChild(cancel); row.appendChild(save);
      wrap.appendChild(row);
      pop.appendChild(wrap);
      setTimeout(function(){ ta.focus(); }, 10);
    }

    render();
    document.body.appendChild(pop);
    activePop = pop;
    positionPop(pop, span);
  }

  document.addEventListener('click', function(e){
    if (!activePop) return;
    if (activePop.contains(e.target)) return;
    if (e.target.classList && e.target.classList.contains('nw-selectable')) return;
    closePop();
  }, true);
  window.addEventListener('resize', closePop);
  window.addEventListener('scroll', function(){ if (activePop) closePop(); }, { passive:true });

  function attach(opts){
    injectStyle();
    var root = opts.root; if (!root) return;
    var dateKey = opts.date;
    var resolve = opts.resolveVerseMeta;
    if (!dateKey || typeof resolve !== 'function') return;

    var saved = getForDate(dateKey);
    var savedRefs = {}; saved.forEach(function(e){ savedRefs[e.ref] = true; });

    var selector = opts.selector || '.verse-span';
    var spans = root.querySelectorAll(selector);
    spans.forEach(function(span){
      span.classList.add('nw-selectable');
      var meta;
      try { meta = resolve(span); } catch(e){ meta = null; }
      if (!meta || !meta.ref) return;
      span.dataset.nwRef = meta.ref;
      if (savedRefs[meta.ref]) span.classList.add('nw-saved');
      span.addEventListener('mouseenter', function(){ span.classList.add('nw-hover'); });
      span.addEventListener('mouseleave', function(){ span.classList.remove('nw-hover'); });
      span.addEventListener('click', function(e){
        e.stopPropagation();
        openPop(span, { date: dateKey, resolveVerseMeta: resolve });
      });
    });
  }

  window.NoteWidget = {
    attach: attach,
    getAll: readAll,
    getForDate: getForDate,
    save: saveEntry,
    remove: removeEntry
  };
})();
