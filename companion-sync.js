// ── COMPANION SYNC MODULE ──
// Extends existing localStorage functions with background Supabase sync.
// localStorage always writes first. Supabase syncs if user is logged in.

// ── JOURNEY PROGRESS SYNC ──
async function syncJourneyProgress(pageKey, state) {
  try {
    var user = await getCurrentUser();
    if (!user) return;
    // Support both old single-note format and new entries array
    var notesValue = state.notes || null;
    if (state.entries && state.entries.length) {
      notesValue = JSON.stringify(state.entries);
    }
    await _supabase.from('journey_progress').upsert({
      user_id: user.id,
      page_key: pageKey,
      completed: !!state.completed,
      completed_at: state.completedAt || null,
      notes: notesValue,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,page_key' });
  } catch (e) { console.warn('Journey sync error:', e); }
}
window.syncJourneyProgress = syncJourneyProgress;

// ── HIGHLIGHTS SYNC ──
async function syncHighlights(pageKey, highlights) {
  try {
    var user = await getCurrentUser();
    if (!user) return;
    await _supabase.from('journey_progress').upsert({
      user_id: user.id,
      page_key: pageKey,
      highlights: highlights || [],
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,page_key' });
  } catch (e) { console.warn('Highlights sync error:', e); }
}
window.syncHighlights = syncHighlights;

// ── READING NOTES SYNC ──
async function syncReadingNotes(dateKey, notes) {
  try {
    var user = await getCurrentUser();
    if (!user) return;
    await _supabase.from('journey_progress').upsert({
      user_id: user.id,
      page_key: 'reading_' + dateKey,
      notes: JSON.stringify(notes),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,page_key' });
  } catch (e) { console.warn('Reading notes sync error:', e); }
}
window.syncReadingNotes = syncReadingNotes;

// ── PRAYER RULE SYNC ──
async function syncPrayerRule(prayerIds, ruleName, ruleBegun) {
  try {
    var user = await getCurrentUser();
    if (!user) return;
    await _supabase.from('prayer_rules').upsert({
      user_id: user.id,
      prayer_ids: prayerIds,
      rule_name: ruleName || null,
      begun_date: ruleBegun || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch (e) { console.warn('Prayer rule sync error:', e); }
}
window.syncPrayerRule = syncPrayerRule;

// ── LOAD FROM SUPABASE (on login / page load) ──
async function loadFromSupabase() {
  try {
    var user = await getCurrentUser();
    if (!user) return;

    // Load journey progress
    var journeyResult = await _supabase
      .from('journey_progress')
      .select('*')
      .eq('user_id', user.id);

    if (journeyResult.data) {
      journeyResult.data.forEach(function(row) {
        var existing = {};
        try { existing = JSON.parse(localStorage.getItem('spp_journey_' + row.page_key) || '{}'); } catch {}
        if (!existing.completed && row.completed) {
          var state = {
            completed: row.completed,
            completedAt: row.completed_at
          };
          // Detect entries array (JSON string starting with [) vs plain note
          if (row.notes && row.notes.charAt(0) === '[') {
            try { state.entries = JSON.parse(row.notes); } catch(e) { state.entries = []; }
          } else {
            state.notes = row.notes || existing.notes || '';
          }
          localStorage.setItem('spp_journey_' + row.page_key, JSON.stringify(state));
        }
        // Sync highlights from Supabase if local is empty
        if (row.highlights && row.highlights.length > 0) {
          var localHL = [];
          try { localHL = JSON.parse(localStorage.getItem('spp_highlights_' + row.page_key) || '[]'); } catch {}
          if (localHL.length === 0) {
            localStorage.setItem('spp_highlights_' + row.page_key, JSON.stringify(row.highlights));
          }
        }
      });
    }

    // Load prayer rule
    var ruleResult = await _supabase
      .from('prayer_rules')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (ruleResult.data && ruleResult.data.prayer_ids) {
      var localRule = [];
      try { localRule = JSON.parse(localStorage.getItem('spp_my_rule') || '[]'); } catch {}
      if (localRule.length === 0 && ruleResult.data.prayer_ids.length > 0) {
        localStorage.setItem('spp_my_rule', JSON.stringify(ruleResult.data.prayer_ids));
        if (ruleResult.data.rule_name) localStorage.setItem('spp_rule_name', ruleResult.data.rule_name);
        if (ruleResult.data.begun_date) localStorage.setItem('spp_rule_begun', ruleResult.data.begun_date);
      }
    }
  } catch (e) { console.warn('Load from Supabase error:', e); }
}
window.loadFromSupabase = loadFromSupabase;
