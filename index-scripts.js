const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS_S   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ROMAN = {1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII'};

function toRoman(n){ return ROMAN[n]||String(n); }
function datePath(d){ return d.getFullYear()+'/'+( d.getMonth()+1)+'/'+d.getDate(); }
function displayDate(d){ return DAYS_SHORT[d.getDay()]+' '+MONTHS_S[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear(); }
function addDays(d,n){ var r=new Date(d); r.setDate(r.getDate()+n); return r; }
function getNextSunday(){ var t=new Date(); var dow=t.getDay(); var s=new Date(t); s.setDate(t.getDate()+(dow===0?7:7-dow)); return s; }
function feastClass(lv){ if(lv>=7)return'lv7'; if(lv>=5)return'lv5'; if(lv>=4)return'lv4'; if(lv>=2)return'lv2'; return'lv0'; }

/* ── CALENDAR CACHE — fetched once, reused everywhere ── */
var _calCache = null;
async function getCalendar(y){
  if(_calCache && _calCache.year === y) return _calCache;
  try{
    var r = await fetch('/_data/calendar-'+y+'.json');
    if(!r.ok) throw new Error('HTTP '+r.status);
    _calCache = await r.json();
    return _calCache;
  }catch(e){
    console.warn('Calendar fetch failed:', e.message);
    return null;
  }
}

async function loadFromLocalCal(date){
  var y = date.getFullYear();
  var m = String(date.getMonth()+1).padStart(2,'0');
  var d = String(date.getDate()).padStart(2,'0');
  var key = y+'-'+m+'-'+d;
  var cal = await getCalendar(y);
  if(!cal||!cal.days||!cal.days[key]) return null;
  var day = cal.days[key];
  return {
    titles:              [day.feast],
    summary_title:       day.feast,
    saints:              (day.saints||[]),
    fast_level_description: day.fast||'',
    fast_exception_desc: day.fastException||'',
    tone:                day.tone||0,
    feast_level:         day.feastLevel||0,
    readings:            (day.readings||[]).map(function(r){
      return { source: r.source||'', display: r.display||r.short||'' };
    })
  };
}

function renderSunday(data, d){
  var feast    = (data.titles&&data.titles[0])||data.summary_title||'Sunday';
  var saints   = (data.saints||[]).slice(0,3).map(function(s){ return typeof s==='string'?s:(s&&s.name?s.name:''); }).filter(Boolean).join('; ');
  var tone     = data.tone ? 'Tone '+toRoman(data.tone) : '';
  var fast1    = data.fast_level_description||'';
  var fast2    = data.fast_exception_desc||'';
  var fastDesc = [fast1,fast2].filter(Boolean).join(' \u2014 ');
  var readings = data.readings||[];
  var readRows = readings.slice(0,4).map(function(r){
    return '<div class="ts-reading-row">'
      +'<span class="ts-reading-src">'+(r.source||'')+'</span>'
      +'<span class="ts-reading-ref">'+(r.display||'')+'</span>'
      +'</div>';
  }).join('');
  var readHTML = readRows ? '<div class="ts-readings"><p class="ts-readings-head">Scripture Readings</p>'+readRows+'</div>' : '';
  var lvl = data.feast_level||0;
  var html = '<div class="ts-opening '+feastClass(lvl)+'">'
    +'<span class="rubric">This Sunday</span>'
    +'<h2 class="ts-feast">'+feast+'</h2>'
    +(saints?'<span class="ts-saint">'+saints+'</span>':'')
    +(tone?'<span class="ts-tone">'+tone+'</span>':'')
    +'</div>'
    +readHTML
    +(fastDesc?'<p class="ts-fast">'+fastDesc+'</p>':'')
    +'<div class="ts-ctas">'
    +'<a href="/readings" class="btn btn-maroon">Read the Readings</a>'
    +'<a href="/schedule" class="btn btn-outline">Full Calendar</a>'
    +'</div>'
    +'<p style="font-family:var(--f-ui);font-size:.48rem;letter-spacing:.12em;text-transform:uppercase;color:var(--stone);margin-top:1.5rem">'+displayDate(d)+'</p>';
  document.getElementById('sunday-panel').innerHTML = html;
}

function renderWeek(entries){
  var html = entries.map(function(item){
    var date=item.date, data=item.data;
    var title = (data.titles&&data.titles[0])||data.summary_title||'';
    var lv    = data.feast_level||0;
    var dot   = lv>=2?'<span class="feast-dot"></span>':'';
    var short = title.length>50?title.slice(0,50)+'\u2026':title;
    return '<div class="week-entry">'
      +'<span class="week-day-lbl">'+DAYS_SHORT[date.getDay()]+' \u00b7 '+MONTHS_S[date.getMonth()]+' '+date.getDate()+'</span>'
      +'<span class="week-day-title '+(lv>=4?'major':'')+'">'+short+dot+'</span>'
      +'</div>';
  }).join('');
  document.getElementById('week-strip').innerHTML = html;
}

async function init(){
  var today  = new Date();
  var sunday = getNextSunday();
  document.getElementById('cbar-date').textContent = displayDate(today);
  /* Fetch calendar once — used for both sunday panel and week strip */
  var cal = await getCalendar(today.getFullYear());
  /* Sunday */
  var sundayData = await loadFromLocalCal(sunday);
  if(sundayData){
    renderSunday(sundayData, sunday);
  } else {
    document.querySelector('.this-sunday').style.display='block';document.getElementById('sunday-panel').innerHTML='<p class="ts-loading">Liturgical data temporarily unavailable.</p>';
  }
  /* Week strip — all from cache, no extra fetches */
  var entries = [];
  for(var i=0;i<7;i++){
    var d2 = addDays(today, i);
    var data = await loadFromLocalCal(d2);
    if(data) entries.push({date:d2, data:data});
  }
  if(entries.length) renderWeek(entries);
  else document.getElementById('week-strip').innerHTML='<p class="ts-loading" style="font-size:.85rem">Calendar temporarily unavailable.</p>';
}
/* Parish events system loads below — init() called after override is defined */

/* ═══════════════════════════════════════════════════════
   PARISH EVENTS SYSTEM
   Reads /_data/parish-events.json
   Featured events stick to top regardless of date.
   Non-featured events show within a 30-day window.
   Falls back to liturgical calendar view when no events.
═══════════════════════════════════════════════════════ */

var EVENT_TYPES = {
  liturgy:     { label:'Liturgy',   badgeCls:'pe-badge-litu', rowCls:'pe-row-litu',  borderColor:'var(--maroon)' },
  vespers:     { label:'Vespers',   badgeCls:'pe-badge-vesp', rowCls:'pe-row-vesp',  borderColor:'var(--gold)' },
  community:   { label:'Community', badgeCls:'pe-badge-comm', rowCls:'pe-row-comm',  borderColor:'#3D6B5E' },
  social:      { label:'Social',    badgeCls:'pe-badge-soci', rowCls:'pe-row-soci',  borderColor:'var(--stone)' },
  concert:     { label:'Concert',   badgeCls:'pe-badge-mus',  rowCls:'pe-row-mus',   borderColor:'var(--apse)' },
  announcement:{ label:'Notice',    badgeCls:'pe-badge-ann',  rowCls:'pe-row-ann',   borderColor:'var(--gold)' }
};

function tagReveal(el, cls, delay){
  if(!el) return;
  el.classList.add(cls||'rv');
  if(delay) el.classList.add('rv-d'+Math.min(delay,4));
  var io = new IntersectionObserver(function(entries, obs){
    if(entries[0].isIntersecting){ el.classList.add('in'); obs.disconnect(); }
  },{threshold:0.08});
  io.observe(el);
}

var _parishEvents = null;

async function getParishEvents() {
  if (_parishEvents) return _parishEvents;
  try {
    var r = await fetch('/parish-events.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    var json = await r.json();
    _parishEvents = json.events || [];
    return _parishEvents;
  } catch(e) {
    console.warn('Parish events fetch failed:', e.message);
    return [];
  }
}

function getActiveEvents(events) {
  var today = new Date();
  today.setHours(0,0,0,0);
  var window30 = new Date(today);
  window30.setDate(window30.getDate() + 30);

  return events.filter(function(ev) {
    if (!ev.active) return false;
    var evDate = new Date(ev.date + 'T00:00:00');
    if (ev.featured) return true;
    return evDate >= today && evDate <= window30;
  }).sort(function(a, b) {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(a.date) - new Date(b.date);
  });
}

function formatEventDate(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  var today = new Date();
  today.setHours(0,0,0,0);
  var tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return DAYS_SHORT[d.getDay()] + ', ' + MONTHS_S[d.getMonth()] + ' ' + d.getDate();
}

function renderParishEvents(events) {
  var panel = document.getElementById('sunday-panel');
  if (!panel) return;

  var typeMap = EVENT_TYPES;

  var eventsHTML = events.map(function(ev) {
    var t = typeMap[ev.type] || typeMap.announcement;
    var dateLabel = formatEventDate(ev.date);
    var featuredAttr = ev.featured ? ' pe-featured' : '';
    return '<div class="pe-row ' + t.rowCls + featuredAttr + '" onclick="openEventDetail(\'' + ev.id + '\')" role="button" tabindex="0">'
      + (ev.featured ? '<span class="pe-featured-dot"></span>' : '')
      + '<span class="pe-badge ' + t.badgeCls + '">' + t.label + '</span>'
      + '<span class="pe-info">'
      +   '<span class="pe-title">' + ev.title + '</span>'
      +   '<span class="pe-meta">' + dateLabel + ' &nbsp;&middot;&nbsp; ' + ev.time + '</span>'
      + '</span>'
      + '<span class="pe-arrow">&#8594;</span>'
      + '</div>';
  }).join('');

  var calBlock = '<div class="pe-cal-secondary">'
    + '<span class="pe-cal-label">The Liturgical Calendar</span>'
    + '<div id="pe-sunday-inner"><p class="ts-loading">Loading liturgical data&hellip;</p></div>'
    + '</div>';

  panel.innerHTML = '<div class="pe-block">'
    + '<span class="rubric">Saints Peter and Paul Orthodox Cathedral</span>'
    + '<div class="rubric-rule"></div>'
    + '<h2 class="pe-headline">Coming Up</h2>'
    + '<span class="pe-sub">Parish services &amp; events</span>'
    + '<div class="pe-events">' + eventsHTML + '</div>'
    + '</div>'
    + calBlock;

  Array.from(panel.children).forEach(function(el, i) { tagReveal(el, 'rv', i + 1); });
  panel.querySelectorAll('.pe-row').forEach(function(el, i) { tagReveal(el, 'rv', i + 1); });
}

function renderSundayIntoSecondary(data, d) {
  var el = document.getElementById('pe-sunday-inner');
  if (!el) return;
  var feast    = (data.titles&&data.titles[0])||data.summary_title||'Sunday';
  var saints   = (data.saints||[]).slice(0,3).map(function(s){ return typeof s==='string'?s:(s&&s.name?s.name:''); }).filter(Boolean).join('; ');
  var tone     = data.tone ? 'Tone '+toRoman(data.tone) : '';
  var fast1    = data.fast_level_description||'';
  var fast2    = data.fast_exception_desc||'';
  var fastDesc = [fast1,fast2].filter(Boolean).join(' \u2014 ');

  var m  = String(d.getMonth()+1).padStart(2,'0');
  var dy = String(d.getDate()).padStart(2,'0');
  var ocaDay = 'https://www.oca.org/saints/lives/'+d.getFullYear()+'/'+m+'/'+dy;

  var html = '<div class="pe-cal-row">'
    + '<span class="pe-cal-badge">This Sunday</span>'
    + '<span class="pe-cal-info">'
    +   '<a href="'+ocaDay+'" target="_blank" rel="noopener" class="pe-cal-title">'+feast+'</a>'
    + (saints ? '<a href="/saint-of-the-day" class="pe-cal-saint">'+saints+'</a>' : '')
    + (tone   ? '<span class="pe-cal-tone">'+tone+'</span>' : '')
    + '</span>'
    + '</div>'
    + (fastDesc ? '<div class="pe-cal-row pe-cal-row-fast">'
    +   '<span class="pe-cal-badge pe-cal-badge-fast">Fast</span>'
    +   '<a href="https://www.oca.org/orthodoxy/the-orthodox-faith/worship/fasting" target="_blank" rel="noopener" class="pe-cal-fast">'+fastDesc+'</a>'
    + '</div>' : '');

  el.innerHTML = html;
}

/* Event detail overlay */
var _eventsCache = null;

async function openEventDetail(id) {
  if (!_eventsCache) _eventsCache = await getParishEvents();
  var ev = _eventsCache.find(function(e) { return e.id === id; });
  if (!ev) return;
  var t = EVENT_TYPES[ev.type] || EVENT_TYPES.announcement;
  var overlay = document.getElementById('pe-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pe-overlay';
    overlay.className = 'pe-overlay';
    overlay.innerHTML = '<div class="pe-detail-card" id="pe-detail-card"></div>';
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeEventDetail();
    });
    document.body.appendChild(overlay);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeEventDetail();
    });
  }

  var d = new Date(ev.date + 'T00:00:00');
  var dateLabel = DAYS_SHORT[d.getDay()] + ', ' + MONTHS_S[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();

  document.getElementById('pe-detail-card').innerHTML =
    '<button class="pe-close" onclick="closeEventDetail()">&#x2715; Close</button>'
    + '<div class="pe-detail-header">'
    +   '<div class="pe-detail-type-row">'
    +     '<span class="pe-badge ' + t.badgeCls + '">' + t.label + '</span>'
    +     '<span class="pe-detail-date-lbl">' + dateLabel + '</span>'
    +   '</div>'
    +   '<h2 class="pe-detail-title">' + ev.title + '</h2>'
    +   (ev.subtitle ? '<p class="pe-detail-subtitle">' + ev.subtitle + '</p>' : '')
    + '</div>'
    + '<div class="pe-detail-rule"></div>'
    + '<div class="pe-detail-body">'
    +   '<p class="pe-detail-desc">' + ev.description + '</p>'
    +   '<div class="pe-detail-meta">'
    +     '<div class="pe-meta-item"><span class="pe-meta-label">Date</span><span class="pe-meta-val">' + dateLabel + '</span></div>'
    +     '<div class="pe-meta-item"><span class="pe-meta-label">Time</span><span class="pe-meta-val">' + ev.time + '</span></div>'
    +     '<div class="pe-meta-item"><span class="pe-meta-label">Location</span><span class="pe-meta-val">' + ev.location + '</span></div>'
    +     (ev.contact ? '<div class="pe-meta-item"><span class="pe-meta-label">Contact</span><span class="pe-meta-val">' + ev.contact + '</span></div>' : '')
    +   '</div>'
    + '</div>'
    + '<div class="pe-detail-footer">'
    +   (ev.link ? '<a href="' + ev.link + '" target="_blank" rel="noopener" class="btn btn-maroon">Learn More</a>' : '<span class="btn btn-maroon" style="cursor:default">All Are Welcome</span>')
    +   '<button class="btn btn-outline" onclick="closeEventDetail()">Back to Calendar</button>'
    + '</div>';

  // Two-frame delay so display:flex is applied before transform transition starts
  overlay.style.display = 'flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    overlay.classList.add('open');
  });});
  document.body.style.overflow = 'hidden';
}

function closeEventDetail() {
  var overlay = document.getElementById('pe-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(function(){ overlay.style.display = ''; }, 350);
  }
  document.body.style.overflow = '';
}

/* Override init to integrate parish events */
async function initParishEvents() {
  var events = await getParishEvents();
  var active = getActiveEvents(events);
  var sunday = getNextSunday();
  /* Pre-fetch calendar so loadFromLocalCal has data to work with */
  await getCalendar(sunday.getFullYear());
  var sundayData = await loadFromLocalCal(sunday);

  if (active.length > 0) {
    /* Build the full secondary calendar HTML before injecting */
    var calSecondaryHTML = '';
    if (sundayData) {
      var feast    = (sundayData.titles&&sundayData.titles[0])||sundayData.summary_title||'Sunday';
      var saints   = (sundayData.saints||[]).slice(0,3).map(function(s){ return typeof s==='string'?s:(s&&s.name?s.name:''); }).filter(Boolean).join('; ');
      var tone     = sundayData.tone ? 'Tone '+toRoman(sundayData.tone) : '';
      var fast1    = sundayData.fast_level_description||'';
      var fast2    = sundayData.fast_exception_desc||'';
      var fastDesc = [fast1,fast2].filter(Boolean).join(' \u2014 ');
      var m2  = String(sunday.getMonth()+1).padStart(2,'0');
      var dy2 = String(sunday.getDate()).padStart(2,'0');
      var ocaDay = 'https://www.oca.org/saints/lives/'+sunday.getFullYear()+'/'+m2+'/'+dy2;
      calSecondaryHTML = '<div class="pe-cal-row">'
        + '<span class="pe-cal-badge">This Sunday</span>'
        + '<span class="pe-cal-info">'
        +   '<a href="'+ocaDay+'" target="_blank" rel="noopener" class="pe-cal-title">'+feast+'</a>'
        + (saints ? '<a href="/saint-of-the-day" class="pe-cal-saint">'+saints+'</a>' : '')
        + (tone   ? '<span class="pe-cal-tone">'+tone+'</span>' : '')
        + '</span></div>'
        + (fastDesc ? '<div class="pe-cal-row pe-cal-row-fast">'
        +   '<span class="pe-cal-badge pe-cal-badge-fast">Fast</span>'
        +   '<a href="https://www.oca.org/orthodoxy/the-orthodox-faith/worship/fasting" target="_blank" rel="noopener" class="pe-cal-fast">'+fastDesc+'</a>'
        + '</div>' : '');
    }

    /* Render everything in one shot */
    var typeMap = EVENT_TYPES;
    var eventsHTML = active.map(function(ev) {
      var t = typeMap[ev.type] || typeMap.announcement;
      var dateLabel = formatEventDate(ev.date);
      var featuredAttr = ev.featured ? ' pe-featured' : '';
      return '<div class="pe-row ' + t.rowCls + featuredAttr + '" onclick="openEventDetail(\'' + ev.id + '\')" role="button" tabindex="0">'
        + (ev.featured ? '<span class="pe-featured-dot"></span>' : '')
        + '<span class="pe-badge ' + t.badgeCls + '">' + t.label + '</span>'
        + '<span class="pe-info">'
        +   '<span class="pe-title">' + ev.title + '</span>'
        +   '<span class="pe-meta">' + dateLabel + ' &nbsp;&middot;&nbsp; ' + ev.time + '</span>'
        + '</span>'
        + '<span class="pe-arrow">&#8594;</span>'
        + '</div>';
    }).join('');

    var panel = document.getElementById('sunday-panel');
    if (!panel) return;
    panel.innerHTML = '<div class="pe-block">'
      + '<span class="rubric">Saints Peter and Paul Orthodox Cathedral</span>'
      + '<div class="rubric-rule"></div>'
      + '<h2 class="pe-headline">Coming Up</h2>'
      + '<span class="pe-sub">Parish services &amp; events</span>'
      + '<div class="pe-events">' + eventsHTML + '</div>'
      + '</div>'
      + '<div class="pe-cal-secondary">'
      + '<span class="pe-cal-label">The Liturgical Calendar</span>'
      + (calSecondaryHTML || '<p class="ts-loading" style="font-size:.85rem">Loading liturgical data\u2026</p>')
      + '</div>';

    Array.from(panel.children).forEach(function(el, i) { tagReveal(el, 'rv', i + 1); });
    panel.querySelectorAll('.pe-row').forEach(function(el, i) { tagReveal(el, 'rv', i + 1); });

  } else {
    if (sundayData) renderSunday(sundayData, sunday);
    else {
      var panel = document.getElementById('sunday-panel');
      if (panel) panel.innerHTML = '<p class="ts-loading">Liturgical data temporarily unavailable.</p>';
    }
  }

  /* Inject parish event tags into week-ahead strip */
  var today = new Date();
  today.setHours(0,0,0,0);
  events.filter(function(ev) { return ev.active; }).forEach(function(ev) {
    var evDate = new Date(ev.date + 'T00:00:00');
    var diff = Math.round((evDate - today) / 86400000);
    if (diff >= 0 && diff < 7) {
      var weekEntries = document.querySelectorAll('.week-entry');
      if (weekEntries[diff]) {
        var t = EVENT_TYPES[ev.type] || EVENT_TYPES.announcement;
        var tag = document.createElement('span');
        tag.className = 'pe-week-tag';
        tag.textContent = ev.title + ' \u00b7 ' + ev.time;
        weekEntries[diff].appendChild(tag);
      }
    }
  });
}

/* Replace the original init calendar call with parish events init */
var _origInit = init;
init = async function() {
  var today = new Date();
  document.getElementById('cbar-date').textContent = displayDate(today);
  await initParishEvents();
  /* Calendar already fetched for Sunday's year — also fetch today's if different */
  var cal2 = await getCalendar(today.getFullYear());
  var entries = [];
  for(var i=0;i<7;i++){
    var d2 = addDays(today, i);
    var data = await loadFromLocalCal(d2);
    if(data) entries.push({date:d2, data:data});
  }
  if(entries.length) renderWeek(entries);
  else {
    console.warn('Week strip empty. cal loaded:', !!cal2, 'cache:', !!_calCache);
    document.getElementById('week-strip').innerHTML='<p class="ts-loading" style="font-size:.85rem">Calendar temporarily unavailable.</p>';
  }
};

/* Now safe to call — override is fully defined */
init();

(function(){
  var t=document.getElementById('galleryTrack');
  if(!t)return;
  var down=false,startX,scrollL;
  t.addEventListener('mousedown',function(e){down=true;startX=e.pageX-t.offsetLeft;scrollL=t.scrollLeft;});
  t.addEventListener('mouseleave',function(){down=false;});
  t.addEventListener('mouseup',function(){down=false;});
  t.addEventListener('mousemove',function(e){if(!down)return;e.preventDefault();t.scrollLeft=scrollL-(e.pageX-t.offsetLeft-startX)*1.4;});
})();