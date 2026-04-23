// ── AUTH AVATAR INDICATOR ──
// Controls all auth-related UI: nav panel, sign-in modal, drawer row, footer CTA.
// Loaded after auth.js on all pages.

(function() {
  if (!_supabase) return;

  // ── Helpers ──
  function getInitials(profile, email) {
    if (profile && profile.firstName && profile.lastName)
      return (profile.firstName.charAt(0) + profile.lastName.charAt(0)).toUpperCase();
    if (profile && profile.firstName)
      return profile.firstName.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return '?';
  }

  function getProfile() {
    try { return JSON.parse(localStorage.getItem('spp_profile') || 'null'); } catch(e) { return null; }
  }

  // ── Modal ──
  var ENVELOPE_SVG =
    '<svg viewBox="0 0 52 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="44">' +
      '<rect x="1" y="1" width="50" height="38" rx="3" stroke="var(--gold,#B88328)" stroke-width="1.5"/>' +
      '<path d="M1 5l25 17L51 5" stroke="var(--gold,#B88328)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  function injectModal() {
    // ── Sign In modal ──
    if (!document.getElementById('auth-modal')) {
      var modal = document.createElement('div');
      modal.id = 'auth-modal';
      modal.className = 'auth-modal-overlay';
      modal.innerHTML =
        '<div class="auth-modal-card">' +
          '<button class="auth-modal-close" onclick="closeAuthModal()" aria-label="Close">&times;</button>' +

          // Sign-in state (default)
          '<div class="auth-modal-form" id="auth-modal-form">' +
            '<h3 class="auth-modal-heading">Welcome back</h3>' +
            '<input type="email" id="auth-modal-email" class="auth-modal-input" placeholder="your@email.com" autocomplete="email">' +
            '<input type="password" id="auth-modal-password" class="auth-modal-input" placeholder="Password" autocomplete="current-password">' +
            '<button class="auth-modal-btn" id="auth-modal-send-btn" onclick="modalSignIn()">Sign In</button>' +
            '<button class="auth-modal-link-btn" onclick="showAuthForgot()">Forgot your password?</button>' +
          '</div>' +

          // Forgot password state
          '<div class="auth-modal-form" id="auth-modal-forgot" style="display:none">' +
            '<h3 class="auth-modal-heading">Reset your password</h3>' +
            '<p class="auth-modal-sub">Enter your email and we\'ll send a reset link.</p>' +
            '<input type="email" id="auth-modal-forgot-email" class="auth-modal-input" placeholder="your@email.com" autocomplete="email">' +
            '<button class="auth-modal-btn" id="auth-modal-reset-btn" onclick="modalForgotPassword()">Send reset link</button>' +
            '<button class="auth-modal-link-btn" onclick="showAuthSignin()">Back to sign in</button>' +
          '</div>' +

          // Confirmation (forgot password only)
          '<div class="auth-modal-confirm" id="auth-modal-confirm">' +
            '<div class="auth-modal-envelope">' + ENVELOPE_SVG + '</div>' +
            '<p class="auth-modal-confirm-msg">Check your inbox</p>' +
            '<p class="auth-modal-confirm-sub" id="auth-modal-confirm-sub"></p>' +
          '</div>' +
        '</div>';
      modal.addEventListener('click', function(e) { if (e.target === modal) closeAuthModal(); });

      // Enter key on password field submits sign-in
      modal.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter') return;
        var forgot = document.getElementById('auth-modal-forgot');
        if (forgot && forgot.style.display !== 'none') { modalForgotPassword(); }
        else { modalSignIn(); }
      });

      document.body.appendChild(modal);
    }

    // ── Create Profile modal ──
    if (!document.getElementById('profile-modal')) {
      var pmodal = document.createElement('div');
      pmodal.id = 'profile-modal';
      pmodal.className = 'auth-modal-overlay';
      pmodal.innerHTML =
        '<div class="auth-modal-card">' +
          '<button class="auth-modal-close" onclick="closeProfileModal()" aria-label="Close">&times;</button>' +
          '<div class="auth-modal-form" id="profile-modal-form">' +
            '<h3 class="auth-modal-heading">Create your parish profile</h3>' +
            '<p class="auth-modal-sub">Your profile lets you save notes and highlights as you explore the Faith, track the pages you\'ve read, and gives Fr. Solomon a way to know your family and walk alongside you on your journey.</p>' +
            '<input type="email" id="profile-modal-email" class="auth-modal-input" placeholder="your@email.com" autocomplete="email">' +
            '<input type="password" id="profile-modal-password" class="auth-modal-input" placeholder="Choose a password" autocomplete="new-password">' +
            '<input type="password" id="profile-modal-password2" class="auth-modal-input" placeholder="Confirm password" autocomplete="new-password">' +
            '<button class="auth-modal-btn" id="profile-modal-send-btn" onclick="modalSignUp()">Create my profile</button>' +
            '<button class="auth-modal-link-btn" onclick="closeProfileModal();openAuthModal()">Already have an account? Sign in</button>' +
          '</div>' +
        '</div>';
      pmodal.addEventListener('click', function(e) { if (e.target === pmodal) closeProfileModal(); });
      pmodal.addEventListener('keydown', function(e) { if (e.key === 'Enter') modalSignUp(); });
      document.body.appendChild(pmodal);
    }
  }

  function resetAuthModal() {
    var form = document.getElementById('auth-modal-form');
    var forgot = document.getElementById('auth-modal-forgot');
    var confirm = document.getElementById('auth-modal-confirm');
    var emailEl = document.getElementById('auth-modal-email');
    var passEl = document.getElementById('auth-modal-password');
    var btn = document.getElementById('auth-modal-send-btn');
    if (form) { form.style.display = 'flex'; form.style.opacity = '1'; }
    if (forgot) forgot.style.display = 'none';
    if (confirm) confirm.classList.remove('visible');
    if (emailEl) emailEl.value = '';
    if (passEl) passEl.value = '';
    if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
  }

  function resetProfileModal() {
    var emailEl = document.getElementById('profile-modal-email');
    var passEl = document.getElementById('profile-modal-password');
    var pass2El = document.getElementById('profile-modal-password2');
    var btn = document.getElementById('profile-modal-send-btn');
    if (emailEl) emailEl.value = '';
    if (passEl) passEl.value = '';
    if (pass2El) pass2El.value = '';
    if (btn) { btn.textContent = 'Create my profile'; btn.disabled = false; }
  }

  window.openAuthModal = function() {
    var modal = document.getElementById('auth-modal');
    if (!modal) return;
    resetAuthModal();
    modal.classList.add('open');
    setTimeout(function() { var i = document.getElementById('auth-modal-email'); if (i) i.focus(); }, 80);
  };

  window.closeAuthModal = function() {
    var modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('open');
  };

  window.openProfileModal = function() {
    var modal = document.getElementById('profile-modal');
    if (!modal) return;
    resetProfileModal();
    modal.classList.add('open');
    setTimeout(function() { var i = document.getElementById('profile-modal-email'); if (i) i.focus(); }, 80);
  };

  window.closeProfileModal = function() {
    var modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('open');
  };

  window.showAuthForgot = function() {
    var signin = document.getElementById('auth-modal-form');
    var forgot = document.getElementById('auth-modal-forgot');
    if (signin) signin.style.display = 'none';
    if (forgot) { forgot.style.display = 'flex'; }
    setTimeout(function() { var i = document.getElementById('auth-modal-forgot-email'); if (i) i.focus(); }, 60);
  };

  window.showAuthSignin = function() {
    var signin = document.getElementById('auth-modal-form');
    var forgot = document.getElementById('auth-modal-forgot');
    var confirm = document.getElementById('auth-modal-confirm');
    if (signin) { signin.style.display = 'flex'; signin.style.opacity = '1'; }
    if (forgot) forgot.style.display = 'none';
    if (confirm) confirm.classList.remove('visible');
    setTimeout(function() { var i = document.getElementById('auth-modal-email'); if (i) i.focus(); }, 60);
  };

  window.modalSignIn = async function() {
    var email = (document.getElementById('auth-modal-email') || {}).value || '';
    var password = (document.getElementById('auth-modal-password') || {}).value || '';
    var btn = document.getElementById('auth-modal-send-btn');
    email = email.trim();
    if (!email) { var i = document.getElementById('auth-modal-email'); if (i) i.focus(); return; }
    if (!password) { var p = document.getElementById('auth-modal-password'); if (p) p.focus(); return; }
    if (btn) { btn.textContent = 'Signing in...'; btn.disabled = true; }
    var result = await signInWithPassword(email, password);
    if (result.success) {
      closeAuthModal();
    } else {
      if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
      alert(result.error || 'Sign in failed. Check your email and password.');
    }
  };

  window.modalSignUp = async function() {
    var email = (document.getElementById('profile-modal-email') || {}).value || '';
    var pass = (document.getElementById('profile-modal-password') || {}).value || '';
    var pass2 = (document.getElementById('profile-modal-password2') || {}).value || '';
    var btn = document.getElementById('profile-modal-send-btn');
    email = email.trim();
    if (!email) { var i = document.getElementById('profile-modal-email'); if (i) i.focus(); return; }
    if (!pass) { var p = document.getElementById('profile-modal-password'); if (p) p.focus(); return; }
    if (pass.length < 8) { alert('Please choose a password of at least 8 characters.'); return; }
    if (pass !== pass2) { alert('Passwords do not match.'); return; }
    if (btn) { btn.textContent = 'Creating...'; btn.disabled = true; }
    var result = await signUpWithPassword(email, pass);
    if (result.success) {
      closeProfileModal();
      window.location.href = '/my-profile';
    } else {
      if (btn) { btn.textContent = 'Create my profile'; btn.disabled = false; }
      alert(result.error || 'Could not create account. Please try again.');
    }
  };

  window.modalForgotPassword = async function() {
    var email = (document.getElementById('auth-modal-forgot-email') || {}).value || '';
    var btn = document.getElementById('auth-modal-reset-btn');
    email = email.trim();
    if (!email) { var i = document.getElementById('auth-modal-forgot-email'); if (i) i.focus(); return; }
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
    var result = await resetPasswordForEmail(email);
    if (result.success) {
      var forgot = document.getElementById('auth-modal-forgot');
      var confirm = document.getElementById('auth-modal-confirm');
      var sub = document.getElementById('auth-modal-confirm-sub');
      if (sub) sub.textContent = 'We sent a reset link to ' + email + '. Check your inbox.';
      if (forgot) forgot.style.display = 'none';
      if (confirm) confirm.classList.add('visible');
    } else {
      if (btn) { btn.textContent = 'Send reset link'; btn.disabled = false; }
      alert(result.error || 'Could not send reset link. Please try again.');
    }
  };

  // ── Footer CTA ──
  function updateFooterCTA(user, initials) {
    var socials = document.querySelector('.footer-socials');
    if (!socials) return;
    var existing = document.getElementById('footer-auth-cta');
    if (existing) existing.remove();

    var cta = document.createElement('div');
    cta.id = 'footer-auth-cta';
    cta.className = 'footer-auth-cta';

    if (user) {
      cta.innerHTML =
        '<div class="footer-auth-signed">' +
          '<span class="footer-auth-avatar">' + initials + '</span>' +
          '<span class="footer-auth-email">' + (user.email || '') + '</span>' +
        '</div>' +
        '<div class="footer-auth-actions">' +
          '<a href="/my-journey" class="footer-auth-link">My Journey</a>' +
          '<button class="footer-auth-signout" onclick="signOut()">Sign Out</button>' +
        '</div>';
    } else {
      cta.innerHTML =
        '<p class="footer-auth-pitch">Your journey, saved.</p>' +
        '<p class="footer-auth-desc">Create a profile or sign in to pick up where you left off.</p>' +
        '<div class="footer-auth-btns">' +
          '<button class="footer-auth-create" onclick="openProfileModal()">Create Profile</button>' +
          '<button class="footer-auth-signin" onclick="openAuthModal()">Sign In</button>' +
        '</div>';
    }
    socials.after(cta);
  }


  // ── Main update ──
  async function updateAvatar() {
    var user = null;
    try { user = await getCurrentUser(); } catch(e) {}
    var profile = getProfile();
    var initials = user ? getInitials(profile, user.email) : null;

    // ── Desktop nav button ──
    var desktopBtn = document.querySelector('.nav-my-parish-btn');
    if (desktopBtn) {
      if (user) {
        desktopBtn.innerHTML = '<span class="nav-avatar-initials">' + initials + '</span>';
        desktopBtn.classList.add('nav-avatar-active');
        desktopBtn.title = user.email ? 'Signed in as ' + user.email : 'Signed in';
      } else {
        if (desktopBtn.classList.contains('nav-avatar-active')) {
          desktopBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6"/></svg>';
          desktopBtn.classList.remove('nav-avatar-active');
          desktopBtn.title = '';
        }
      }
    }

    // ── Desktop panel: fully rebuilt each update ──
    var panel = document.getElementById('nav-mp-panel');
    if (panel) {
      panel.innerHTML = '';
      var body = document.createElement('div');
      body.className = 'nav-mp-body';
      var firstName = (profile && profile.firstName) ? profile.firstName : null;
      if (user) {
        body.innerHTML =
          '<div class="nav-mp-header">' +
            '<span class="nav-mp-avatar">' + initials + '</span>' +
            '<div class="nav-mp-header-text">' +
              '<span class="nav-mp-welcome">Welcome' + (firstName ? ', ' + firstName : '') + '.</span>' +
              '<span class="nav-mp-email">' + (user.email || '') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="nav-mp-feature-list">' +
            '<a href="/my-journey" class="nav-mp-feature">' +
              '<span class="nav-mp-feature-name">My Journey</span>' +
              '<span class="nav-mp-feature-sub">Explore the Faith at your own pace</span>' +
            '</a>' +
            '<a href="/my-profile" class="nav-mp-feature">' +
              '<span class="nav-mp-feature-name">My Profile</span>' +
              '<span class="nav-mp-feature-sub">Help Fr. Solomon know your family</span>' +
            '</a>' +
            '<a href="/my-journey" class="nav-mp-feature">' +
              '<span class="nav-mp-feature-name">My Notes</span>' +
              '<span class="nav-mp-feature-sub">Your saved highlights and reflections</span>' +
            '</a>' +
          '</div>' +
          '<div class="nav-mp-footer">' +
            '<button class="nav-mp-signout" onclick="signOut()">Sign Out</button>' +
          '</div>';
      } else {
        body.innerHTML =
          '<div class="nav-mp-logged-out">' +
            '<p class="nav-mp-pitch-head">Your journey, saved.</p>' +
            '<p class="nav-mp-pitch-body">Create a profile or sign in to pick up where you left off.</p>' +
            '<button class="nav-mp-signin-btn" onclick="openProfileModal()">Create Profile</button>' +
            '<button class="nav-mp-signin-alt" onclick="openAuthModal()">Sign In</button>' +
          '</div>';
      }
      panel.appendChild(body);
    }

    // ── Mobile: initials dot next to hamburger ──
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

    // ── Mobile drawer auth row ──
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
        // Logged in: identity strip at top
        drawerHead.after(row);
      } else {
        row.innerHTML =
          '<div class="drawer-auth-pitch">Your journey, saved.</div>' +
          '<div class="drawer-auth-cta">' +
            '<button class="drawer-auth-btn drawer-auth-create" onclick="openProfileModal()">Create Profile</button>' +
            '<button class="drawer-auth-btn drawer-auth-send" onclick="openAuthModal()">Sign In</button>' +
          '</div>';
        // Logged out: CTA at bottom, before Give Online
        var giveBtn = document.querySelector('.nav-drawer-give');
        if (giveBtn) giveBtn.before(row);
        else document.getElementById('nav-drawer').appendChild(row);
      }
    }

    // ── Footer CTA ──
    updateFooterCTA(user, initials);
  }

  // ── Prevent panel from closing when clicking inside it ──
  function bindPanelClick() {
    var panel = document.getElementById('nav-mp-panel');
    if (panel && !panel._authClickBound) {
      panel.addEventListener('click', function(e) { e.stopPropagation(); });
      panel._authClickBound = true;
    }
  }

  // ── Styles ──
  function injectStyles() {
    var s = document.createElement('style');
    s.textContent =
      /* Hide hardcoded panel links — panel is fully rebuilt by JS */
      '.nav-mp-link{display:none!important}' +
      /* Pull panel out of nav stacking context (backdrop-filter z-index bug in Safari) */
      '#nav-mp-panel{position:fixed!important;width:270px!important;z-index:1500!important}' +

      /* Nav button avatar */
      '.nav-avatar-initials{font-family:var(--f-ui,"Cinzel",serif);font-size:.5rem;letter-spacing:.06em;line-height:1;font-weight:500}' +
      '.nav-my-parish-btn.nav-avatar-active{background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8);border-color:var(--maroon,#7B1D2A)}' +
      '.nav-scrolled .nav-my-parish-btn.nav-avatar-active{background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8);border-color:var(--maroon,#7B1D2A)}' +
      '.nav-my-parish-btn.nav-avatar-active:hover{background:var(--gold,#B88328);border-color:var(--gold,#B88328)}' +

      /* Panel body */
      '.nav-mp-body{padding:0;overflow:hidden}' +
      '.nav-mp-logged-out{padding:1.4rem 1.1rem 1.4rem}' +

      /* Logged out: pitch */
      '.nav-mp-pitch-head{font-family:var(--f-display,"Cormorant Garamond",serif);font-size:1.15rem;font-weight:600;color:var(--ink,#2C1F16);margin:0 0 .5rem;line-height:1.2}' +
      '.nav-mp-pitch-body{font-family:var(--f-body,"EB Garamond",serif);font-size:.88rem;line-height:1.6;color:var(--stone,#7A6648);margin:0 0 1.1rem}' +
      '.nav-mp-signin-btn{width:100%;padding:.65rem;background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8);border:none;font-family:var(--f-ui,"Cinzel",serif);font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;transition:background .18s}' +
      '.nav-mp-signin-btn:hover{background:var(--gold,#B88328)}' +
      '.nav-mp-signin-alt{width:100%;margin-top:.5rem;padding:.5rem;background:none;border:1px solid rgba(123,29,42,.2);color:var(--stone,#7A6648);font-family:var(--f-ui,"Cinzel",serif);font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;transition:all .18s}' +
      '.nav-mp-signin-alt:hover{color:var(--maroon,#7B1D2A);border-color:var(--maroon,#7B1D2A)}' +

      /* Logged in: header */
      '.nav-mp-header{display:flex;align-items:center;gap:.75rem;padding:1.25rem 1.1rem 1rem;background:var(--maroon,#7B1D2A)}' +
      '.nav-mp-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.15);color:var(--vellum,#F6F1E8);font-family:var(--f-ui,"Cinzel",serif);font-size:.55rem;letter-spacing:.04em;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid rgba(255,255,255,.25)}' +
      '.nav-mp-header-text{display:flex;flex-direction:column;gap:.15rem;min-width:0}' +
      '.nav-mp-welcome{font-family:var(--f-display,"Cormorant Garamond",serif);font-size:1.05rem;font-weight:600;color:var(--vellum,#F6F1E8);line-height:1.2;display:block}' +
      '.nav-mp-email{font-family:var(--f-body,"EB Garamond",serif);font-size:.75rem;color:rgba(246,241,232,.5);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      /* Feature list */
      '.nav-mp-feature-list{padding:.4rem 0}' +
      '.nav-mp-feature{display:block;text-decoration:none;padding:.7rem 1.1rem .7rem 1.4rem;border-left:2px solid transparent;transition:border-color .18s,background .18s;position:relative}' +
      '.nav-mp-feature:hover{border-left-color:var(--gold,#B88328);background:rgba(123,29,42,.04)}' +
      '.nav-mp-feature-name{display:block;font-family:var(--f-ui,"Cinzel",serif);font-size:.6rem;letter-spacing:.13em;text-transform:uppercase;color:var(--maroon,#7B1D2A);margin-bottom:.25rem}' +
      '.nav-mp-feature-sub{display:block;font-family:var(--f-body,"EB Garamond",serif);font-size:.85rem;color:var(--stone,#7A6648);line-height:1.4}' +
      /* Footer */
      '.nav-mp-footer{padding:.75rem 1.1rem;border-top:1px solid rgba(123,29,42,.08)}' +
      '.nav-mp-signout{background:none;border:none;font-family:var(--f-ui,"Cinzel",serif);font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(123,29,42,.4);cursor:pointer;padding:0;transition:color .18s}' +
      '.nav-mp-signout:hover{color:var(--maroon,#7B1D2A)}' +

      /* Mobile avatar dot */
      '.nav-mob-avatar{width:26px;height:26px;border-radius:50%;background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8);font-family:var(--f-ui,"Cinzel",serif);font-size:.45rem;letter-spacing:.04em;display:none;align-items:center;justify-content:center;flex-shrink:0;margin-right:.35rem}' +
      '@media(max-width:1100px){.nav-mob-avatar{display:flex}}' +

      /* Drawer auth row */
      '.drawer-auth-row{display:flex;align-items:center;flex-wrap:wrap;gap:.5rem;padding:.85rem 1.5rem;border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.15)}' +
      '.drawer-auth-avatar{width:28px;height:28px;border-radius:50%;background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8);font-family:var(--f-ui,"Cinzel",serif);font-size:.45rem;display:flex;align-items:center;justify-content:center;flex-shrink:0}' +
      '.drawer-auth-email{font-family:var(--f-body);font-size:.8rem;color:rgba(246,241,232,.65);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}' +
      '.drawer-auth-btn{font-family:var(--f-ui,"Cinzel",serif);font-size:.42rem;letter-spacing:.12em;text-transform:uppercase;background:none;border:1px solid rgba(246,241,232,.2);color:rgba(246,241,232,.5);padding:.28rem .65rem;cursor:pointer;transition:all .18s;white-space:nowrap;flex-shrink:0}' +
      '.drawer-auth-btn:hover{color:rgba(246,241,232,.9);border-color:rgba(246,241,232,.4)}' +
      '.drawer-auth-create{background:var(--maroon,#7B1D2A)!important;border-color:var(--maroon,#7B1D2A)!important;color:var(--vellum,#F6F1E8)!important}' +
      '.drawer-auth-create:hover{background:var(--gold,#B88328)!important;border-color:var(--gold,#B88328)!important}' +
      '.drawer-auth-pitch{font-family:var(--f-display,"Cormorant Garamond",serif);font-size:.95rem;font-weight:500;color:rgba(246,241,232,.85);margin-bottom:.55rem;width:100%}' +
      '.drawer-auth-cta{display:flex;gap:.5rem;width:100%}' +
      '.drawer-auth-cta .drawer-auth-btn{flex:1;text-align:center}' +

      /* ── Sign In Modal ── */
      '.auth-modal-overlay{position:fixed;inset:0;background:rgba(21,8,4,.75);z-index:9000;display:flex;align-items:center;justify-content:center;padding:1.5rem;opacity:0;pointer-events:none;transition:opacity .25s}' +
      '.auth-modal-overlay.open{opacity:1;pointer-events:all}' +
      '.auth-modal-card{background:var(--vellum,#F6F1E8);width:100%;max-width:420px;padding:2.5rem 2rem 2.25rem;position:relative;box-shadow:0 24px 80px rgba(21,8,4,.4);transform:translateY(14px);transition:transform .3s cubic-bezier(.4,0,.2,1)}' +
      '.auth-modal-overlay.open .auth-modal-card{transform:translateY(0)}' +
      '@media(max-width:680px){' +
        '.auth-modal-overlay{align-items:flex-end;padding:0}' +
        '.auth-modal-card{max-width:100%;border-radius:16px 16px 0 0;padding:2rem 1.5rem 2.5rem;transform:translateY(100%)}' +
        '.auth-modal-overlay.open .auth-modal-card{transform:translateY(0)}' +
      '}' +
      '.auth-modal-close{position:absolute;top:.9rem;right:.9rem;background:none;border:none;font-size:1.4rem;color:var(--stone,#7A6648);cursor:pointer;line-height:1;padding:.2rem .4rem;transition:color .18s}' +
      '.auth-modal-close:hover{color:var(--maroon,#7B1D2A)}' +
      '.auth-modal-form{display:flex;flex-direction:column;gap:.8rem}' +
      '.auth-modal-heading{font-family:var(--f-display,"Cormorant Garamond",serif);font-size:1.55rem;font-weight:600;color:var(--ink,#2C1F16);margin:0;line-height:1.2}' +
      '.auth-modal-sub{font-family:var(--f-body,"EB Garamond",serif);font-size:.92rem;color:var(--stone,#7A6648);line-height:1.55;margin:0}' +
      '.auth-modal-input{padding:.7rem .85rem;border:1px solid rgba(123,29,42,.2);background:#fff;font-family:var(--f-body);font-size:1rem;color:var(--ink,#2C1F16);outline:none;width:100%;box-sizing:border-box}' +
      '.auth-modal-input:focus{border-color:var(--gold,#B88328)}' +
      '.auth-modal-btn{padding:.75rem;background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8);border:none;font-family:var(--f-ui,"Cinzel",serif);font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;transition:background .18s}' +
      '.auth-modal-btn:hover:not(:disabled){background:var(--gold,#B88328)}' +
      '.auth-modal-btn:disabled{opacity:.55;cursor:default}' +
      '.auth-modal-link-btn{background:none;border:none;font-family:var(--f-body,"EB Garamond",serif);font-size:.88rem;color:var(--stone,#7A6648);cursor:pointer;padding:.15rem 0;text-decoration:underline;text-underline-offset:2px;transition:color .18s;text-align:center}' +
      '.auth-modal-link-btn:hover{color:var(--maroon,#7B1D2A)}' +

      /* Confirmation screen */
      '.auth-modal-confirm{display:none;flex-direction:column;align-items:center;text-align:center;padding:.75rem 0 .25rem}' +
      '.auth-modal-confirm.visible{display:flex}' +
      '.auth-modal-envelope{animation:envFloat .55s cubic-bezier(.34,1.56,.64,1) both}' +
      '@keyframes envFloat{from{opacity:0;transform:translateY(18px) scale(.8)}to{opacity:1;transform:translateY(0) scale(1)}}' +
      '.auth-modal-confirm-msg{font-family:var(--f-display,"Cormorant Garamond",serif);font-size:1.5rem;font-weight:600;color:var(--ink,#2C1F16);margin:1.2rem 0 .45rem;animation:fadeUp .4s .2s both}' +
      '.auth-modal-confirm-sub{font-family:var(--f-body,"EB Garamond",serif);font-size:.92rem;color:var(--stone,#7A6648);line-height:1.6;margin:0;animation:fadeUp .4s .32s both}' +
      '@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}' +

      /* ── Footer CTA ── */
      '.footer-auth-cta{margin-top:1.6rem;padding-top:1.5rem;border-top:1px solid rgba(246,241,232,.08)}' +
      '.footer-auth-pitch{font-family:var(--f-display,"Cormorant Garamond",serif);font-size:1.05rem;font-weight:500;color:rgba(246,241,232,.88);margin:0 0 .3rem;line-height:1.25}' +
      '.footer-auth-desc{font-family:var(--f-body,"EB Garamond",serif);font-size:.82rem;line-height:1.55;color:rgba(246,241,232,.42);margin:0 0 .9rem}' +
      '.footer-auth-btns{display:flex;gap:.5rem;flex-wrap:wrap}' +
      '.footer-auth-create{flex:1;padding:.55rem .5rem;background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8);border:none;font-family:var(--f-ui,"Cinzel",serif);font-size:.58rem;letter-spacing:.13em;text-transform:uppercase;cursor:pointer;transition:background .18s;white-space:nowrap}' +
      '.footer-auth-create:hover{background:var(--gold,#B88328)}' +
      '.footer-auth-signin{flex:1;padding:.55rem .5rem;background:none;border:1px solid rgba(246,241,232,.18);color:rgba(246,241,232,.55);font-family:var(--f-ui,"Cinzel",serif);font-size:.58rem;letter-spacing:.13em;text-transform:uppercase;cursor:pointer;transition:all .18s;white-space:nowrap}' +
      '.footer-auth-signin:hover{color:rgba(246,241,232,.9);border-color:rgba(246,241,232,.4)}' +
      /* Footer logged-in */
      '.footer-auth-signed{display:flex;align-items:center;gap:.6rem;margin-bottom:.75rem}' +
      '.footer-auth-avatar{width:28px;height:28px;border-radius:50%;background:var(--maroon,#7B1D2A);color:var(--vellum,#F6F1E8);font-family:var(--f-ui,"Cinzel",serif);font-size:.45rem;display:flex;align-items:center;justify-content:center;flex-shrink:0}' +
      '.footer-auth-email{font-family:var(--f-body);font-size:.78rem;color:rgba(246,241,232,.48);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}' +
      '.footer-auth-actions{display:flex;align-items:center;gap:.7rem}' +
      '.footer-auth-link{font-family:var(--f-ui,"Cinzel",serif);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(246,241,232,.6);text-decoration:none;transition:color .18s}' +
      '.footer-auth-link:hover{color:var(--gold,#B88328)}' +
      '.footer-auth-signout{background:none;border:1px solid rgba(246,241,232,.14);color:rgba(246,241,232,.42);font-family:var(--f-ui,"Cinzel",serif);font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;padding:.28rem .6rem;cursor:pointer;transition:all .18s}' +
      '.footer-auth-signout:hover{color:rgba(246,241,232,.85);border-color:rgba(246,241,232,.35)}';

    document.head.appendChild(s);
  }

  // ── Remove legacy My Parish elements ──
  function removeLegacyMyParish() {
    // Footer pill links
    document.querySelectorAll('a.footer-my-journey').forEach(function(el) { el.remove(); });
    document.querySelectorAll('.footer-nav-sub').forEach(function(el) {
      if (el.textContent.trim() === 'My Parish') el.remove();
    });
    // Mobile drawer "My Profile" accordion section
    document.querySelectorAll('.dr-section').forEach(function(section) {
      var head = section.querySelector('.dr-section-name');
      if (head && head.textContent.trim() === 'My Profile') section.remove();
    });
  }

  // ── Dev testing hook ──
  window.__reloadAuth = updateAvatar;

  // ── Init ──
  // Reads the Supabase session from localStorage synchronously so the avatar
  // button updates instantly — before the async getSession() call resolves.
  function applyAvatarSync() {
    try {
      var ref = (SUPABASE_URL || '').match(/\/\/([^.]+)\./);
      if (!ref) return;
      var stored = localStorage.getItem('sb-' + ref[1] + '-auth-token');
      if (!stored) return;
      var data = JSON.parse(stored);
      var user = data && data.user;
      if (!user || !user.email) return;
      var btn = document.querySelector('.nav-my-parish-btn');
      if (btn && !btn.classList.contains('nav-avatar-active')) {
        var initials = getInitials(getProfile(), user.email);
        btn.innerHTML = '<span class="nav-avatar-initials">' + initials + '</span>';
        btn.classList.add('nav-avatar-active');
        btn.title = 'Signed in as ' + user.email;
      }
    } catch(e) {}
  }

  function init() {
    injectStyles();
    injectModal();
    applyAvatarSync();
    updateAvatar();
    bindPanelClick();
    removeLegacyMyParish();
    overrideToggle();
    if (_supabase && _supabase.auth) {
      _supabase.auth.onAuthStateChange(function() {
        setTimeout(updateAvatar, 100);
      });
    }
  }

  // Must run inside init() — inline body scripts redefine toggleMyParish after
  // auth-avatar.js loads, so any top-level override gets clobbered.
  function overrideToggle() {
    window.toggleMyParish = function(e) {
      e.stopPropagation();
      var panel = document.getElementById('nav-mp-panel');
      if (!panel) return;
      if (!panel.classList.contains('open')) {
        var btn = document.querySelector('.nav-my-parish-btn');
        if (btn) {
          var r = btn.getBoundingClientRect();
          panel.style.top = (r.bottom + 6) + 'px';
          panel.style.right = (window.innerWidth - r.right) + 'px';
          panel.style.left = 'auto';
        }
      }
      panel.classList.toggle('open');
    };
  }

  function bindPanelClick() {
    var panel = document.getElementById('nav-mp-panel');
    if (panel && !panel._authClickBound) {
      panel.addEventListener('click', function(e) { e.stopPropagation(); });
      panel._authClickBound = true;
    }
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (window.closeAuthModal) closeAuthModal();
      if (window.closeProfileModal) closeProfileModal();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
