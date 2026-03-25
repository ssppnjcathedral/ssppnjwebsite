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
    document.getElementById('sunday-panel').innerHTML='<p class="ts-loading">Liturgical data temporarily unavailable.</p>';
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