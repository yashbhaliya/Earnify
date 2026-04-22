// auth-guard.js — blocks page content and shows full login modal if not logged in

(function () {
  const SUPA_URL  = 'https://emnrgsgerfjvndexomro.supabase.co';
  const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjAyMTAsImV4cCI6MjA4Nzk5NjIxMH0.uXr8lipxLbB4D_5JwQkpLzc-HudQw23tOFBfV4C6hqY';

  function _jwt(t) { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); } catch(e) { return null; } }

  function isLoggedIn() {
    const token = localStorage.getItem('adminToken');
    if (token) { const p = _jwt(token); if (p?.email && p.exp * 1000 > Date.now()) return true; }
    try { const cu = JSON.parse(localStorage.getItem('currentUser') || '{}'); if (cu?.email) return true; } catch(e) {}
    return false;
  }

  if (isLoggedIn()) return;

  // Inject auth-modal.css if not already loaded
  if (!document.querySelector('link[href*="auth-modal"]')) {
    const depth = (window.location.pathname.match(/\//g) || []).length - 1;
    const prefix = depth <= 1 ? './' : '../'.repeat(depth - 1);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = prefix + 'auth-modal.css';
    document.head.appendChild(link);
  }

  // Build full two-panel modal overlay
  const overlay = document.createElement('div');
  overlay.id = '_authGuardOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:999998;display:flex;align-items:stretch;justify-content:center;font-family:Inter,sans-serif;';
  overlay.innerHTML = `
    <div class="auth-modal-box" style="width:100%;min-height:100vh;">
      <div class="am-left">
        <div class="am-brand"><div class="am-logo-box">💰</div><span class="am-brand-name">Earnify</span></div>
        <div class="am-left-body">
          <div class="am-headline"><h2>Turn Skills into Income 🚀</h2><p>Sell notes, templates &amp; services. Buy what you need. All in one place.</p></div>
          <div class="am-stats">
            <div class="am-stat"><div class="am-stat-num">500+</div><div class="am-stat-lbl">Resources</div></div>
            <div class="am-stat"><div class="am-stat-num">1,200+</div><div class="am-stat-lbl">Buyers</div></div>
            <div class="am-stat"><div class="am-stat-num">5%</div><div class="am-stat-lbl">Fee Only</div></div>
          </div>
          <div class="am-features">
            <div class="am-feature"><div class="am-feature-icon">✅</div><div class="am-feature-text"><strong>Free to list your resources</strong></div></div>
            <div class="am-feature"><div class="am-feature-icon">⚡</div><div class="am-feature-text"><strong>Instant access after purchase</strong></div></div>
            <div class="am-feature"><div class="am-feature-icon">🔒</div><div class="am-feature-text"><strong>Secure payments via Razorpay</strong></div></div>
            <div class="am-feature"><div class="am-feature-icon">💸</div><div class="am-feature-text"><strong>Only 5% fee on withdrawal</strong></div></div>
          </div>
          <div class="am-testimonial">
            <div class="am-stars">★★★★★</div>
            <p class="am-quote">&ldquo;Earned my first ₹5,000 in two weeks selling my notes!&rdquo;</p>
            <div class="am-author"><div class="am-avatar">B</div><div class="am-author-info"><strong>Bhaliya Yash</strong><span>Student • Verified Seller</span></div></div>
          </div>
        </div>
        <div class="am-trust">
          <div class="am-trust-item">🔒 AES-256 Encrypted</div>
          <div class="am-trust-item">✅ 1,200+ Users</div>
          <div class="am-trust-item">🏦 Razorpay Secured</div>
          <div class="am-trust-item">⚡ Instant Delivery</div>
        </div>
      </div>
      <div class="am-right">
        <div class="am-form-inner">
          <div class="am-tabs">
            <button class="am-tab active" id="_agTabLogin" onclick="_agShowTab('login')">Login</button>
            <button class="am-tab" id="_agTabSignup" onclick="_agShowTab('signup')">Sign Up</button>
          </div>
          <div id="_agErr" class="am-msg error"></div>
          <div id="_agOk"  class="am-msg success"></div>
          <div id="_agLoginForm">
            <div class="am-header"><h2>Welcome back 👋</h2><p>Login to access your resources, earnings &amp; dashboard.</p></div>
            <div class="am-input-group"><label>EMAIL ADDRESS</label><input class="am-input" type="email" id="_agEmail" placeholder="you@example.com" autocomplete="email"></div>
            <div class="am-input-group">
              <div class="am-label-row"><label>PASSWORD</label><a href="#" class="am-forgot">Forgot password?</a></div>
              <div class="am-pw-wrap">
                <input class="am-input" type="password" id="_agPassword" placeholder="Enter your password" autocomplete="current-password">
                <button type="button" class="am-toggle-pass" onclick="_agTogglePw('_agPassword',this)">
                  <svg class="eye-on" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg class="eye-off" style="display:none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>
            <button class="am-submit-btn" id="_agLoginBtn" onclick="_agLogin()">🚀 Log In to Earnify</button>
            <p class="am-switch">New to Earnify? <a onclick="_agShowTab('signup')">Create a free account</a></p>
          </div>
          <div id="_agSignupForm" style="display:none;">
            <div class="am-header"><h2>Join Earnify 🎉</h2><p>Free account. Start earning from your knowledge today.</p></div>
            <div class="am-input-group"><label>FULL NAME</label><input class="am-input" type="text" id="_agSName" placeholder="Your full name" autocomplete="name"></div>
            <div class="am-input-group"><label>EMAIL ADDRESS</label><input class="am-input" type="email" id="_agSEmail" placeholder="you@example.com" autocomplete="email"></div>
            <div class="am-input-group"><label>PASSWORD</label><div class="am-pw-wrap"><input class="am-input" type="password" id="_agSPass" placeholder="Min 6 characters" autocomplete="new-password"><button type="button" class="am-toggle-pass" onclick="_agTogglePw('_agSPass',this)"><svg class="eye-on" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><svg class="eye-off" style="display:none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg></button></div></div>
            <div class="am-input-group"><label>CONFIRM PASSWORD</label><input class="am-input" type="password" id="_agSConfirm" placeholder="Re-enter your password" autocomplete="new-password"></div>
            <button class="am-submit-btn" id="_agSignupBtn" onclick="_agSignup()">✨ Create Free Account</button>
            <p class="am-switch">Already have an account? <a onclick="_agShowTab('login')">Log in here</a></p>
          </div>
          <div class="am-security">🔒 Secured with AES-256 encryption</div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.documentElement.style.overflow = 'hidden';

  window._agShowTab = function(tab) {
    document.getElementById('_agLoginForm').style.display  = tab === 'login'  ? '' : 'none';
    document.getElementById('_agSignupForm').style.display = tab === 'signup' ? '' : 'none';
    document.getElementById('_agTabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('_agTabSignup').classList.toggle('active', tab === 'signup');
    document.getElementById('_agErr').textContent = '';
    document.getElementById('_agOk').textContent  = '';
  };

  window._agTogglePw = function(id, btn) {
    const inp = document.getElementById(id);
    inp.type = inp.type === 'password' ? 'text' : 'password';
    btn.querySelector('.eye-on').style.display  = inp.type === 'text' ? 'none' : '';
    btn.querySelector('.eye-off').style.display = inp.type === 'text' ? '' : 'none';
  };

  function _agSetErr(msg) { const e = document.getElementById('_agErr'); e.textContent = msg; e.style.display = msg ? 'block' : 'none'; document.getElementById('_agOk').textContent = ''; }
  function _agSetOk(msg)  { const e = document.getElementById('_agOk');  e.textContent = msg; e.style.display = msg ? 'block' : 'none'; document.getElementById('_agErr').textContent = ''; }

  function _agDismiss(user, token) {
    if (token) localStorage.setItem('adminToken', token);
    if (user)  localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userLoggedIn', 'true');
    document.getElementById('_authGuardOverlay').remove();
    document.documentElement.style.overflow = '';
    window.location.reload();
  }

  window._agLogin = async function() {
    const email    = document.getElementById('_agEmail').value.trim();
    const password = document.getElementById('_agPassword').value;
    if (!email || !password) { _agSetErr('Please enter email and password.'); return; }
    const btn = document.getElementById('_agLoginBtn');
    btn.disabled = true; btn.textContent = 'Logging in…';
    try {
      const res  = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (data.token) { _agSetOk('Login successful!'); setTimeout(() => _agDismiss(data.user || { email }, data.token), 600); }
      else { _agSetErr(data.error || 'Invalid email or password.'); btn.disabled = false; btn.textContent = '🚀 Log In to Earnify'; }
    } catch(e) {
      try {
        const sc = window.supabase?.createClient(SUPA_URL, SUPA_ANON, { auth:{ storageKey:'ag-tmp', persistSession:false } });
        if (!sc) throw new Error('no supabase');
        const { data, error } = await sc.auth.signInWithPassword({ email, password });
        if (error) throw error;
        _agSetOk('Login successful!');
        setTimeout(() => _agDismiss(data.user, data.session?.access_token), 600);
      } catch(e2) { _agSetErr('Login failed. Check your credentials.'); btn.disabled = false; btn.textContent = '🚀 Log In to Earnify'; }
    }
  };

  window._agSignup = async function() {
    const name    = document.getElementById('_agSName').value.trim();
    const email   = document.getElementById('_agSEmail').value.trim();
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
      const { error } = await sc.auth.signUp({ email, password, options:{ data:{ name }, emailRedirectTo: window.location.origin + '/' } });
      if (error && !error.message.toLowerCase().includes('email')) throw error;
      _agSetOk('✅ Account created! Check your email to confirm, then login.');
      btn.disabled = false; btn.textContent = '✨ Create Free Account';
      setTimeout(() => _agShowTab('login'), 2000);
    } catch(e) { _agSetErr(e.message || 'Signup failed. Try again.'); btn.disabled = false; btn.textContent = '✨ Create Free Account'; }
  };

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    const loginVisible = document.getElementById('_agLoginForm').style.display !== 'none';
    if (loginVisible) _agLogin(); else _agSignup();
  });
})();


  // Decode base64url JWT
  function _jwt(token) {
    try { return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); } catch(e) { return null; }
  }

  // Check if user is logged in synchronously
  function isLoggedIn() {
    const token = localStorage.getItem('adminToken');
    if (token) { const p = _jwt(token); if (p?.email && p.exp * 1000 > Date.now()) return true; }
    try { const cu = JSON.parse(localStorage.getItem('currentUser') || '{}'); if (cu?.email) return true; } catch(e) {}
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
      const res  = await fetch('/api/admin/login', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        _agSetOk('Login successful!');
        setTimeout(() => _agDismiss(data.user || { email }, data.token), 600);
      } else {
        _agSetErr(data.error || 'Invalid email or password.');
        btn.disabled = false; btn.textContent = 'Login';
      }
    } catch(e) {
      // Fallback: try Supabase directly (for local dev)
      try {
        const sc = window.supabase?.createClient(SUPA_URL, SUPA_ANON, { auth:{ storageKey:'ag-tmp', persistSession:false } });
        if (!sc) throw new Error('no supabase');
        const { data, error } = await sc.auth.signInWithPassword({ email, password });
        if (error) throw error;
        _agSetOk('Login successful!');
        setTimeout(() => _agDismiss(data.user, data.session?.access_token), 600);
      } catch(e2) {
        _agSetErr('Login failed. Check your credentials.');
        btn.disabled = false; btn.textContent = 'Login';
      }
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
      const res  = await fetch('/api/admin/signup', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (data.token) {
        _agSetOk('Account created! Logging in…');
        setTimeout(() => _agDismiss(data.user || { email }, data.token), 600);
      } else {
        _agSetErr(data.error || 'Signup failed. Try again.');
        btn.disabled = false; btn.textContent = 'Create Account';
      }
    } catch(e) {
      _agSetErr('Connection error. Please try again.');
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
