// ── SSPP SUPABASE AUTH MODULE ──
// Shared across all pages. Loaded after supabase-client.js.

(function () {

  // ── GET CURRENT USER ──
  async function getCurrentUser() {
    try {
      var session = await _supabase.auth.getSession();
      return session.data.session ? session.data.session.user : null;
    } catch { return null; }
  }
  window.getCurrentUser = getCurrentUser;

  // ── SEND MAGIC LINK ──
  async function sendMagicLink(email, redirectTo) {
    try {
      var result = await _supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: redirectTo || window.location.origin
        }
      });
      return result.error ? { error: result.error.message } : { success: true };
    } catch (e) { return { error: e.message }; }
  }
  window.sendMagicLink = sendMagicLink;

  // ── SIGN OUT ──
  async function signOut() {
    try {
      await _supabase.auth.signOut();
      window.location.href = '/';
    } catch {}
  }
  window.signOut = signOut;

  // ── ON AUTH STATE CHANGE ──
  _supabase.auth.onAuthStateChange(async function (event, session) {
    if (event === 'SIGNED_IN' && session) {
      await migrateLocalDataToSupabase(session.user);
    }
    updateAuthUI(session ? session.user : null);
  });

  // ── MIGRATE LOCAL DATA TO SUPABASE ON FIRST LOGIN ──
  async function migrateLocalDataToSupabase(user) {
    try {
      var keys = Object.keys(localStorage).filter(function (k) {
        return k.startsWith('spp_journey_');
      });
      for (var i = 0; i < keys.length; i++) {
        var pageKey = keys[i].replace('spp_journey_', '');
        var state = JSON.parse(localStorage.getItem(keys[i]) || '{}');
        if (state.completed || (state.notes && state.notes.trim())) {
          await _supabase.from('journey_progress').upsert({
            user_id: user.id,
            page_key: pageKey,
            completed: !!state.completed,
            completed_at: state.completedAt || null,
            notes: state.notes || null
          }, { onConflict: 'user_id,page_key' });
        }
      }
      var rule = JSON.parse(localStorage.getItem('spp_my_rule') || '[]');
      var ruleName = localStorage.getItem('spp_rule_name') || null;
      var ruleBegun = localStorage.getItem('spp_rule_begun') || null;
      if (rule.length > 0) {
        await _supabase.from('prayer_rules').upsert({
          user_id: user.id,
          prayer_ids: rule,
          rule_name: ruleName,
          begun_date: ruleBegun
        }, { onConflict: 'user_id' });
      }
    } catch (e) { console.warn('Migration error:', e); }
  }

  // ── UPDATE AUTH-AWARE UI ──
  function updateAuthUI(user) {
    var loginPrompt = document.getElementById('auth-login-prompt');
    var authUserInfo = document.getElementById('auth-user-info');
    if (loginPrompt) loginPrompt.style.display = user ? 'none' : 'block';
    if (authUserInfo) {
      authUserInfo.style.display = user ? 'block' : 'none';
      if (user) {
        var emailEl = document.getElementById('auth-user-email');
        if (emailEl) emailEl.textContent = user.email;
      }
    }
  }

})();
