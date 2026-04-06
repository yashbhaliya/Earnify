// auth-guard.js — blocks page content and shows login popup if not logged in
// Include this script BEFORE any page-specific scripts on protected pages.
// Works on both local (currentUser) and Vercel (adminToken JWT).

(function () {
  const SUPA_URL = 'https://emnrgsgerfjvndexomro.supabase.co';
  const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjAyMTAsImV4cCI6MjA4Nzk5NjIxMH0.uXr8lipxLbB4D_5JwQkpLzc-HudQw23tOFBfV4C6hqY';

  // Decode base64url JWT
  function _jwt(token) {
    try { return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); } catch(e) { return null; }
  }

  // Check if user is logged in synchronously
  function isLoggedIn() {
    const token = localStorage.getItem('adminToken');
    if (token) {
      const p = _jwt(token);
      // valid JWT with email and not expired
      if (p?.email && p.exp * 1000 > Date.now()) return true;
      // JWT exists but may be missing exp — still treat as logged in
      if (p?.email) return true;
    }
    try { const cu = JSON.parse(localStorage.getItem('currentUser') || '{}'); if (cu?.email) return true; } catch(e) {}
    if (localStorage.getItem('userLoggedIn') === 'true') return true;
    return false;
  }

  if (isLoggedIn()) return; // already logged in — let page load normally

  // Not logged in — inject full-screen login overlay
  const style = document.createElement('style');
  style.textContent = `
    #_authGuardOverlay {
      position:fixed;inset:0;z-index:999998;
      background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
      display:flex;align-items:center;justify-content:center;
      font-family:Inter,sans-serif;padding:20px;
    }
    #_authGuardBox {
      background:#fff;border-radius:24px;padding:40px 36px;
      width:100%;max-width:420px;
      box-shadow:0 24px 64px rgba(0,0,0,0.25);
      animation:_agSlide .35s ease;
    }
    @keyframes _agSlide { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
    #_authGuardBox h2 {
      text-align:center;font-size:26px;font-weight:800;margin:0 0 6px;
      background:linear-gradient(135deg,#667eea,#764ba2);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }
    #_authGuardBox p { text-align:center;color:#64748b;font-size:14px;margin:0 0 28px; }
    ._ag-tabs { display:flex;gap:0;margin-bottom:24px;border-radius:12px;overflow:hidden;border:2px solid #e2e8f0; }
    ._ag-tab {
      flex:1;padding:10px;text-align:center;font-size:14px;font-weight:700;
      cursor:pointer;background:#f8fafc;color:#64748b;border:none;font-family:inherit;
      transition:all .2s;
    }
    ._ag-tab.active { background:linear-gradient(135deg,#667eea,#764ba2);color:#fff; }
    ._ag-input {
      width:100%;padding:13px 16px;border:2px solid #e2e8f0;border-radius:12px;
      font-size:14px;font-family:inherit;background:#f8fafc;color:#1e293b;
      box-sizing:border-box;margin-bottom:12px;transition:border-color .2s;outline:none;
    }
    ._ag-input:focus { border-color:#667eea;background:#fff; }
    ._ag-btn {
      width:100%;padding:14px;border:none;border-radius:12px;
      background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;
      font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;
      transition:opacity .2s;margin-top:4px;
    }
    ._ag-btn:hover { opacity:.9; }
    ._ag-btn:disabled { opacity:.6;cursor:not-allowed; }
    ._ag-err { color:#ef4444;font-size:13px;font-weight:600;margin-bottom:10px;text-align:center;min-height:18px; }
    ._ag-ok  { color:#10b981;font-size:13px;font-weight:600;margin-bottom:10px;text-align:center;min-height:18px; }
    ._ag-logo { text-align:center;font-size:32px;margin-bottom:12px; }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = '_authGuardOverlay';
  overlay.innerHTML = `
    <div id="_authGuardBox">
      <div class="_ag-logo">💰</div>
      <h2>Earnify</h2>
      <p>Please login to access this page</p>
      <div class="_ag-tabs">
        <button class="_ag-tab active" id="_agTabLogin" onclick="_agShowTab('login')">Login</button>
        <button class="_ag-tab" id="_agTabSignup" onclick="_agShowTab('signup')">Sign Up</button>
      </div>
      <div id="_agErr" class="_ag-err"></div>
      <div id="_agOk"  class="_ag-ok"></div>

      <!-- Login form -->
      <div id="_agLoginForm">
        <input class="_ag-input" type="email"    id="_agEmail"    placeholder="Email address" autocomplete="email">
        <input class="_ag-input" type="password" id="_agPassword" placeholder="Password"      autocomplete="current-password">
        <button class="_ag-btn" id="_agLoginBtn" onclick="_agLogin()">Login</button>
      </div>

      <!-- Signup form -->
      <div id="_agSignupForm" style="display:none;">
        <input class="_ag-input" type="text"     id="_agSName"    placeholder="Full Name"       autocomplete="name">
        <input class="_ag-input" type="email"    id="_agSEmail"   placeholder="Email address"   autocomplete="email">
        <input class="_ag-input" type="password" id="_agSPass"    placeholder="Password (min 6)" autocomplete="new-password">
        <input class="_ag-input" type="password" id="_agSConfirm" placeholder="Confirm Password" autocomplete="new-password">
        <button class="_ag-btn" id="_agSignupBtn" onclick="_agSignup()">Create Account</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Hide page content behind overlay
  document.documentElement.style.overflow = 'hidden';

  window._agShowTab = function(tab) {
    document.getElementById('_agLoginForm').style.display  = tab === 'login'  ? '' : 'none';
    document.getElementById('_agSignupForm').style.display = tab === 'signup' ? '' : 'none';
    document.getElementById('_agTabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('_agTabSignup').classList.toggle('active', tab === 'signup');
    document.getElementById('_agErr').textContent = '';
    document.getElementById('_agOk').textContent  = '';
  };

  function _agSetErr(msg) { document.getElementById('_agErr').textContent = msg; document.getElementById('_agOk').textContent = ''; }
  function _agSetOk(msg)  { document.getElementById('_agOk').textContent  = msg; document.getElementById('_agErr').textContent = ''; }

  function _agDismiss(user, token) {
    if (token) localStorage.setItem('adminToken', token);
    if (user)  localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userLoggedIn', 'true');
    document.getElementById('_authGuardOverlay').remove();
    document.documentElement.style.overflow = '';
    // reload so page scripts re-run with auth in place
    window.location.reload();
  }

  window._agLogin = async function() {
    const email    = document.getElementById('_agEmail').value.trim();
    const password = document.getElementById('_agPassword').value;
    if (!email || !password) { _agSetErr('Please enter email and password.'); return; }
    const btn = document.getElementById('_agLoginBtn');
    btn.disabled = true; btn.textContent = 'Logging in…';
    try {
      // Always try Supabase directly first — works without backend
      const sc = window.supabase?.createClient(SUPA_URL, SUPA_ANON, { auth:{ storageKey:'ag-tmp', persistSession:false } });
      if (!sc) throw new Error('no supabase');
      const { data, error } = await sc.auth.signInWithPassword({ email, password });
      if (error) throw error;
      _agSetOk('Login successful!');
      setTimeout(() => _agDismiss(data.user, data.session?.access_token), 600);
    } catch(e) {
      _agSetErr('Invalid email or password.');
      btn.disabled = false; btn.textContent = 'Login';
    }
  };

  window._agSignup = async function() {
    const name     = document.getElementById('_agSName').value.trim();
    const email    = document.getElementById('_agSEmail').value.trim();
    const password = document.getElementById('_agSPass').value;
    const confirm  = document.getElementById('_agSConfirm').value;
    if (!name || !email || !password) { _agSetErr('Please fill all fields.'); return; }
    if (password.length < 6)          { _agSetErr('Password must be at least 6 characters.'); return; }
    if (password !== confirm)          { _agSetErr('Passwords do not match.'); return; }
    const btn = document.getElementById('_agSignupBtn');
    btn.disabled = true; btn.textContent = 'Creating account…';
    try {
      const sc = window.supabase?.createClient(SUPA_URL, SUPA_ANON, { auth:{ storageKey:'ag-tmp', persistSession:false } });
      if (!sc) throw new Error('no supabase');
      const { data, error } = await sc.auth.signUp({ email, password, options:{ data:{ name } } });
      if (error) throw error;
      if (data.session) {
        _agSetOk('Account created! Logging in…');
        setTimeout(() => _agDismiss(data.user, data.session.access_token), 600);
      } else {
        _agSetOk('Account created! Please check your email to confirm, then login.');
        setTimeout(() => _agShowTab('login'), 2000);
      }
    } catch(e) {
      _agSetErr(e.message || 'Signup failed. Try again.');
      btn.disabled = false; btn.textContent = 'Create Account';
    }
  };

  // Allow Enter key to submit
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    const loginVisible = document.getElementById('_agLoginForm').style.display !== 'none';
    if (loginVisible) _agLogin(); else _agSignup();
  });
})();
