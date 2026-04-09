// ── AUTH AVATAR INDICATOR ──
// Shows user initials in the nav when signed in.
// Desktop: replaces person icon in .nav-my-parish-btn with initials circle.
// Mobile: adds avatar indicator next to hamburger + at top of drawer.
// Loaded after auth.js on all pages.

(function() {
  if (!_supabase) return;

  function getInitials(profile, email) {
    if (profile && profile.firstName && profile.lastName) {
      return (profile.firstName.charAt(0) + profile.lastName.charAt(0)).toUpperCase();
    }
    if (profile && profile.firstName) {
      return profile.firstName.charAt(0).toUpperCase();
    }
    if (email) return email.charAt(0).toUpperCase();
    return '?';
  }

  function getProfile() {
    try { return JSON.parse(localStorage.getItem('spp_profile') || 'null'); } catch(e) { return null; }
  }

  async function updateAvatar() {
    var user = null;
    try { user = await getCurrentUser(); } catch(e) {}
    var profile = getProfile();
    var initials = user ? getInitials(profile, user.email) : null;

    // ── Desktop: update nav-my-parish-btn ──
    var desktopBtn = document.querySelector('.nav-my-parish-btn');
    if (desktopBtn) {
      if (user) {
        desktopBtn.innerHTML = '<span class="nav-avatar-initials">' + initials + '</span>';
        desktopBtn.classList.add('nav-avatar-active');
        desktopBtn.title = 'Signed in' + (user.email ? ' as ' + user.email : '');
      } else {
        // Restore default person icon
        if (desktopBtn.classList.contains('nav-avatar-active')) {
          desktopBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6"/></svg>';
          desktopBtn.classList.remove('nav-avatar-active');
          desktopBtn.title = '';
        }
      }
    }

    // ── Desktop: add sign-in/sign-out to panel ──
    var panel = document.getElementById('nav-mp-panel');
    if (panel) {
      var existingAuth = panel.querySelector('.nav-mp-auth');
      if (existingAuth) existingAuth.remove();

      var authDiv = document.createElement('div');
      authDiv.className = 'nav-mp-auth';

      if (user) {
        authDiv.innerHTML =
          '<div class="nav-mp-auth-info">' +
            '<span class="nav-mp-auth-email">' + (user.email || '') + '</span>' +
            '<button class="nav-mp-auth-btn" onclick="signOut()">Sign Out</button>' +
          '</div>';
      } else {
        authDiv.innerHTML =
          '<div class="nav-mp-auth-login">' +
            '<input type="email" id="nav-auth-email" placeholder="your@email.com" class="nav-mp-auth-input">' +
            '<button class="nav-mp-auth-btn nav-mp-auth-send" onclick="navSendLink()">Sign In</button>' +
          '</div>';
      }
      panel.appendChild(authDiv);
    }

    // ── Mobile: indicator next to hamburger ──
    var hamburger = document.getElementById('nav-hamburger');
    if (hamburger && user) {
      var existing = document.getElementById('nav-mob-avatar');
      if (!existing) {
        var mobAvatar = document.createElement('span');
        mobAvatar.id = 'nav-mob-avatar';
        mobAvatar.className = 'nav-mob-avatar';
        mobAvatar.textContent = initials;
        hamburger.parentNode.insertBefore(mobAvatar, hamburger);
      } else {
        existing.textContent = initials;
      }
    } else {
      var old = document.getElementById('nav-mob-avatar');
      if (old) old.remove();
    }

    // ── Mobile drawer: auth row at top ──
    var drawerHead = document.querySelector('.nav-drawer-head');
    if (drawerHead) {
      var existingRow = document.getElementById('drawer-auth-row');
      if (existingRow) existingRow.remove();

      var row = document.createElement('div');
      row.id = 'drawer-auth-row';
      row.className = 'drawer-auth-row';

      if (user) {
        row.innerHTML =
          '<span class="drawer-auth-avatar">' + initials + '</span>' +
          '<span class="drawer-auth-email">' + (user.email || '') + '</span>' +
          '<button class="drawer-auth-btn" onclick="signOut()">Sign Out</button>';
      } else {
        row.innerHTML =
          '<span class="drawer-auth-avatar" style="opacity:.4">?</span>' +
          '<input type="email" id="drawer-auth-email" placeholder="your@email.com" class="drawer-auth-input">' +
          '<button class="drawer-auth-btn drawer-auth-send" onclick="drawerSendLink()">Sign In</button>';
      }
      drawerHead.after(row);
    }
  }

  // ── Nav panel sign-in ──
  window.navSendLink = async function() {
    var input = document.getElementById('nav-auth-email');
    var email = input ? input.value.trim() : '';
    if (!email) return;
    var btn = document.querySelector('.nav-mp-auth-send');
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
    var result = await sendMagicLink(email, window.location.href);
    if (result.success) {
      if (btn) btn.textContent = 'Check Email';
    } else {
      if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
      alert('Could not send link: ' + (result.error || 'Unknown error'));
    }
  };

  // ── Drawer sign-in ──
  window.drawerSendLink = async function() {
    var input = document.getElementById('drawer-auth-email');
    var email = input ? input.value.trim() : '';
    if (!email) return;
    var btn = document.querySelector('.drawer-auth-send');
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
    var result = await sendMagicLink(email, window.location.href);
    if (result.success) {
      if (btn) btn.textContent = 'Check Email';
    } else {
      if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
      alert('Could not send link: ' + (result.error || 'Unknown error'));
    }
  };

  // ── Inject styles ──
  function injectStyles() {
    var s = document.createElement('style');
    s.textContent =
      /* Desktop avatar in nav button */
      '.nav-avatar-initials{font-family:var(--f-ui,"Cinzel",serif);font-size:.5rem;letter-spacing:.06em;line-height:1;font-weight:500}' +
      '.nav-my-parish-btn.nav-avatar-active{background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8);border-color:var(--maroon,#7B1D2A)}' +
      '.nav-scrolled .nav-my-parish-btn.nav-avatar-active{background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8);border-color:var(--maroon,#7B1D2A)}' +
      '.nav-my-parish-btn.nav-avatar-active:hover{background:var(--gold,#B88328);border-color:var(--gold,#B88328)}' +

      /* Auth in panel */
      '.nav-mp-auth{padding:.65rem .85rem;border-top:1px solid rgba(123,29,42,.1)}' +
      '.nav-mp-auth-info{display:flex;align-items:center;gap:.5rem;justify-content:space-between}' +
      '.nav-mp-auth-email{font-family:var(--f-body);font-size:.78rem;color:var(--stone,#7A6648);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}' +
      '.nav-mp-auth-btn{font-family:var(--f-ui,"Cinzel",serif);font-size:.42rem;letter-spacing:.12em;text-transform:uppercase;background:none;border:1px solid rgba(123,29,42,.2);color:var(--stone,#7A6648);padding:.25rem .6rem;cursor:pointer;transition:all .18s;white-space:nowrap}' +
      '.nav-mp-auth-btn:hover{color:var(--maroon,#7B1D2A);border-color:var(--maroon,#7B1D2A)}' +
      '.nav-mp-auth-login{display:flex;gap:.35rem}' +
      '.nav-mp-auth-input{flex:1;padding:.3rem .5rem;border:1px solid rgba(123,29,42,.15);background:#fff;font-family:var(--f-body);font-size:.8rem;color:var(--ink,#2C1F16);outline:none;min-width:0}' +
      '.nav-mp-auth-input:focus{border-color:var(--gold,#B88328)}' +

      /* Mobile avatar dot next to hamburger */
      '.nav-mob-avatar{width:26px;height:26px;border-radius:50%;background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8);font-family:var(--f-ui,"Cinzel",serif);font-size:.45rem;letter-spacing:.04em;display:none;align-items:center;justify-content:center;flex-shrink:0;margin-right:.35rem}' +
      '@media(max-width:1100px){.nav-mob-avatar{display:flex}}' +
      '.nav-scrolled .nav-mob-avatar{background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8)}' +

      /* Drawer auth row */
      '.drawer-auth-row{display:flex;align-items:center;gap:.6rem;padding:.6rem 1.5rem;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.15)}' +
      '.drawer-auth-avatar{width:28px;height:28px;border-radius:50%;background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8);font-family:var(--f-ui,"Cinzel",serif);font-size:.45rem;display:flex;align-items:center;justify-content:center;flex-shrink:0}' +
      '.drawer-auth-email{font-family:var(--f-body);font-size:.8rem;color:rgba(246,241,232,.65);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}' +
      '.drawer-auth-btn{font-family:var(--f-ui,"Cinzel",serif);font-size:.42rem;letter-spacing:.12em;text-transform:uppercase;background:none;border:1px solid rgba(246,241,232,.2);color:rgba(246,241,232,.5);padding:.25rem .6rem;cursor:pointer;transition:all .18s;white-space:nowrap;flex-shrink:0}' +
      '.drawer-auth-btn:hover{color:rgba(246,241,232,.9);border-color:rgba(246,241,232,.4)}' +
      '.drawer-auth-input{flex:1;padding:.3rem .5rem;border:1px solid rgba(246,241,232,.15);background:rgba(255,255,255,.06);font-family:var(--f-body);font-size:.8rem;color:rgba(246,241,232,.9);outline:none;min-width:0}' +
      '.drawer-auth-input:focus{border-color:var(--gold,#B88328)}';
    document.head.appendChild(s);
  }

  // ── Init ──
  function init() {
    injectStyles();
    updateAvatar();
    // Re-check on auth state change
    if (_supabase && _supabase.auth) {
      _supabase.auth.onAuthStateChange(function() {
        setTimeout(updateAvatar, 100);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
