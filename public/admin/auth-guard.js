// auth-guard.js — shows full two-panel login modal if not logged in

(function () {
  const SUPA_URL  = 'https://emnrgsgerfjvndexomro.supabase.co';
  const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjAyMTAsImV4cCI6MjA4Nzk5NjIxMH0.uXr8lipxLbB4D_5JwQkpLzc-HudQw23tOFBfV4C6hqY';

  function _jwt(t) { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); } catch(e) { return null; } }

  function isLoggedIn() {
    const token = localStorage.getItem('adminToken');
    if (token) { const p = _jwt(token); if (p?.email && p.exp * 1000 > Date.now()) return true; if (p?.email) return true; }
    try { const cu = JSON.parse(localStorage.getItem('currentUser') || '{}'); if (cu?.email) return true; } catch(e) {}
    if (localStorage.getItem('userLoggedIn') === 'true') return true;
    return false;
  }

  if (isLoggedIn()) return;

  // Inject all styles inline — no external CSS dependency
  const style = document.createElement('style');
  style.textContent = `
    #_agOverlay {
      position:fixed;inset:0;z-index:999998;display:grid;
      grid-template-columns:1.05fr 1fr;font-family:'Inter',sans-serif;
    }
    /* LEFT panel */
    #_agLeft {
      background:linear-gradient(150deg,#4f46e5 0%,#667eea 55%,#764ba2 100%);
      padding:44px 48px;display:flex;flex-direction:column;
      justify-content:space-between;position:relative;overflow:hidden;
    }
    #_agLeft::before {
      content:'';position:absolute;top:-90px;right:-90px;
      width:340px;height:340px;background:rgba(255,255,255,.06);
      border-radius:50%;pointer-events:none;
    }
    #_agLeft::after {
      content:'';position:absolute;bottom:-110px;left:-60px;
      width:380px;height:380px;background:rgba(255,255,255,.04);
      border-radius:50%;pointer-events:none;
    }
    ._ag-brand { display:flex;align-items:center;gap:11px;position:relative;z-index:1; }
    ._ag-logo-box {
      width:44px;height:44px;background:rgba(255,255,255,.18);
      border:1.5px solid rgba(255,255,255,.28);border-radius:12px;
      display:flex;align-items:center;justify-content:center;font-size:22px;
    }
    ._ag-brand-name { font-size:24px;font-weight:900;color:#fff;letter-spacing:-.4px; }
    ._ag-left-body { display:flex;flex-direction:column;gap:20px;position:relative;z-index:1; }
    ._ag-headline h2 { font-size:26px;font-weight:900;color:#fff;line-height:1.25;margin:0 0 8px;letter-spacing:-.4px; }
    ._ag-headline p  { font-size:13.5px;color:rgba(255,255,255,.75);line-height:1.65;max-width:340px;margin:0; }
    ._ag-stats { display:grid;grid-template-columns:repeat(3,1fr);gap:8px; }
    ._ag-stat { background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:12px 8px;text-align:center; }
    ._ag-stat-num { font-size:18px;font-weight:900;color:#fff;line-height:1;margin-bottom:3px; }
    ._ag-stat-lbl { font-size:10px;color:rgba(255,255,255,.6);font-weight:600;text-transform:uppercase;letter-spacing:.4px; }
    ._ag-features { display:flex;flex-direction:column;gap:8px; }
    ._ag-feature { display:flex;align-items:center;gap:10px;padding:2px 0; }
    ._ag-feature-icon { font-size:15px;width:28px;height:28px;background:rgba(255,255,255,.15);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    ._ag-feature-text strong { display:block;font-size:12.5px;font-weight:700;color:#fff; }
    ._ag-testimonial { background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:14px 16px; }
    ._ag-stars { color:#fbbf24;font-size:11px;letter-spacing:2px;margin-bottom:6px; }
    ._ag-quote { font-size:12.5px;color:rgba(255,255,255,.88);font-style:italic;line-height:1.55;margin:0 0 10px; }
    ._ag-author { display:flex;align-items:center;gap:8px; }
    ._ag-avatar { width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#f59e0b);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;flex-shrink:0; }
    ._ag-author-info strong { display:block;font-size:11.5px;font-weight:700;color:#fff; }
    ._ag-author-info span   { font-size:10px;color:rgba(255,255,255,.55); }
    ._ag-trust { display:flex;flex-wrap:wrap;gap:12px;position:relative;z-index:1; }
    ._ag-trust-item { font-size:11px;color:rgba(255,255,255,.62);font-weight:600; }
    /* RIGHT panel */
    #_agRight {
      background:#f8fafc;display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      overflow-y:auto;padding:44px 36px;position:relative;
    }
    ._ag-form-inner { width:100%;max-width:380px; }
    ._ag-tabs { display:flex;margin-bottom:20px;border-radius:11px;overflow:hidden;border:2px solid #e2e8f0;background:white; }
    ._ag-tab { flex:1;padding:10px;text-align:center;font-size:13.5px;font-weight:700;cursor:pointer;background:white;color:#64748b;border:none;font-family:inherit;transition:all .2s; }
    ._ag-tab.active { background:linear-gradient(135deg,#667eea,#764ba2);color:white; }
    ._ag-msg { font-size:12.5px;font-weight:600;text-align:center;border-radius:9px;padding:0;min-height:0;display:none; }
    ._ag-msg:not(:empty) { display:block;padding:8px 12px;margin-bottom:12px; }
    ._ag-err { color:#dc2626;background:#fef2f2;border:1px solid #fecaca; }
    ._ag-ok  { color:#059669;background:#f0fdf4;border:1px solid #a7f3d0; }
    ._ag-header { margin-bottom:22px; }
    ._ag-header h2 { font-size:23px;font-weight:800;color:#0f172a;margin:0 0 5px;letter-spacing:-.3px; }
    ._ag-header p  { font-size:13px;color:#64748b;line-height:1.55;margin:0; }
    ._ag-input-group { display:flex;flex-direction:column;gap:5px;margin-bottom:12px; }
    ._ag-input-group label { font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.5px; }
    ._ag-label-row { display:flex;justify-content:space-between;align-items:center; }
    ._ag-forgot { font-size:11.5px;color:#667eea;text-decoration:none;font-weight:600; }
    ._ag-input { width:100%;padding:11px 13px;border:2px solid #e2e8f0;border-radius:10px;font-size:13.5px;font-family:inherit;background:white;color:#0f172a;transition:all .2s;outline:none;box-sizing:border-box; }
    ._ag-input:focus { border-color:#667eea;box-shadow:0 0 0 3px rgba(102,126,234,.1); }
    ._ag-pw-wrap { position:relative; }
    ._ag-pw-wrap ._ag-input { padding-right:42px; }
    ._ag-toggle-pass { position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0;line-height:1; }
    ._ag-submit { width:100%;padding:12px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:10px;font-size:14.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .2s,transform .2s;margin-top:4px;box-shadow:0 5px 16px rgba(102,126,234,.32); }
    ._ag-submit:hover { opacity:.92;transform:translateY(-1px); }
    ._ag-submit:disabled { opacity:.6;cursor:not-allowed;transform:none; }
    ._ag-switch { text-align:center;margin-top:15px;font-size:13px;color:#64748b; }
    ._ag-switch a { color:#667eea;font-weight:700;text-decoration:none;cursor:pointer; }
    ._ag-security { text-align:center;margin-top:16px;font-size:10px;font-weight:700;letter-spacing:.7px;color:#94a3b8;text-transform:uppercase; }
    @media(max-width:768px) {
      #_agOverlay { grid-template-columns:1fr; }
      #_agLeft { display:none; }
      #_agRight { padding:52px 20px 36px;background:linear-gradient(160deg,#f0f4ff 0%,#f8fafc 100%);justify-content:flex-start;min-height:100vh;overflow-y:auto; }
      ._ag-form-inner { max-width:100%; }
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = '_agOverlay';
  overlay.innerHTML = `
    <div id="_agLeft">
      <div class="_ag-brand">
        <div class="_ag-logo-box">💰</div>
        <span class="_ag-brand-name">Earnify</span>
      </div>
      <div class="_ag-left-body">
        <div class="_ag-headline">
          <h2>Turn Skills into Income 🚀</h2>
          <p>Sell notes, templates &amp; services. Buy what you need. All in one place.</p>
        </div>
        <div class="_ag-stats">
          <div class="_ag-stat"><div class="_ag-stat-num">500+</div><div class="_ag-stat-lbl">Resources</div></div>
          <div class="_ag-stat"><div class="_ag-stat-num">1,200+</div><div class="_ag-stat-lbl">Buyers</div></div>
          <div class="_ag-stat"><div class="_ag-stat-num">5%</div><div class="_ag-stat-lbl">Fee Only</div></div>
        </div>
        <div class="_ag-features">
          <div class="_ag-feature"><div class="_ag-feature-icon">✅</div><div class="_ag-feature-text"><strong>Free to list your resources</strong></div></div>
          <div class="_ag-feature"><div class="_ag-feature-icon">⚡</div><div class="_ag-feature-text"><strong>Instant access after purchase</strong></div></div>
          <div class="_ag-feature"><div class="_ag-feature-icon">🔒</div><div class="_ag-feature-text"><strong>Secure payments via Razorpay</strong></div></div>
          <div class="_ag-feature"><div class="_ag-feature-icon">💸</div><div class="_ag-feature-text"><strong>Only 5% fee on withdrawal</strong></div></div>
        </div>
        <div class="_ag-testimonial">
          <div class="_ag-stars">★★★★★</div>
          <p class="_ag-quote">&ldquo;Earned my first ₹5,000 in two weeks selling my notes!&rdquo;</p>
          <div class="_ag-author">
            <div class="_ag-avatar">B</div>
            <div class="_ag-author-info"><strong>Bhaliya Yash</strong><span>Student • Verified Seller</span></div>
          </div>
        </div>
      </div>
      <div class="_ag-trust">
        <div class="_ag-trust-item">🔒 AES-256 Encrypted</div>
        <div class="_ag-trust-item">✅ 1,200+ Users</div>
        <div class="_ag-trust-item">🏦 Razorpay Secured</div>
        <div class="_ag-trust-item">⚡ Instant Delivery</div>
      </div>
    </div>
    <div id="_agRight">
      <div class="_ag-form-inner">
        <div class="_ag-tabs">
          <button class="_ag-tab active" id="_agTabLogin" onclick="_agShowTab('login')">Login</button>
          <button class="_ag-tab" id="_agTabSignup" onclick="_agShowTab('signup')">Sign Up</button>
        </div>
        <div id="_agErr" class="_ag-msg _ag-err"></div>
        <div id="_agOk"  class="_ag-msg _ag-ok"></div>
        <div id="_agLoginForm">
          <div class="_ag-header"><h2>Welcome back 👋</h2><p>Login to access your resources, earnings &amp; dashboard.</p></div>
          <div class="_ag-input-group">
            <label>Email Address</label>
            <input class="_ag-input" type="email" id="_agEmail" placeholder="you@example.com" autocomplete="email">
          </div>
          <div class="_ag-input-group">
            <div class="_ag-label-row"><label>Password</label><a href="#" class="_ag-forgot">Forgot password?</a></div>
            <div class="_ag-pw-wrap">
              <input class="_ag-input" type="password" id="_agPassword" placeholder="Enter your password" autocomplete="current-password">
              <button type="button" class="_ag-toggle-pass" onclick="_agTogglePw('_agPassword',this)">
                <svg class="eye-on" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg class="eye-off" style="display:none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>
          <button class="_ag-submit" id="_agLoginBtn" onclick="_agLogin()">🚀 Log In to Earnify</button>
          <p class="_ag-switch">New to Earnify? <a onclick="_agShowTab('signup')">Create a free account</a></p>
        </div>
        <div id="_agSignupForm" style="display:none;">
          <div class="_ag-header"><h2>Join Earnify 🎉</h2><p>Free account. Start earning from your knowledge today.</p></div>
          <div class="_ag-input-group"><label>Full Name</label><input class="_ag-input" type="text" id="_agSName" placeholder="Your full name" autocomplete="name"></div>
          <div class="_ag-input-group"><label>Email Address</label><input class="_ag-input" type="email" id="_agSEmail" placeholder="you@example.com" autocomplete="email"></div>
          <div class="_ag-input-group">
            <label>Password</label>
            <div class="_ag-pw-wrap">
              <input class="_ag-input" type="password" id="_agSPass" placeholder="Min 6 characters" autocomplete="new-password">
              <button type="button" class="_ag-toggle-pass" onclick="_agTogglePw('_agSPass',this)">
                <svg class="eye-on" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg class="eye-off" style="display:none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>
          <div class="_ag-input-group"><label>Confirm Password</label><input class="_ag-input" type="password" id="_agSConfirm" placeholder="Re-enter your password" autocomplete="new-password"></div>
          <button class="_ag-submit" id="_agSignupBtn" onclick="_agSignup()">✨ Create Free Account</button>
          <p class="_ag-switch">Already have an account? <a onclick="_agShowTab('login')">Log in here</a></p>
        </div>
        <div class="_ag-security">🔒 Secured with AES-256 encryption</div>
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

  function _agSetErr(msg) { const e = document.getElementById('_agErr'); e.textContent = msg; e.style.display = msg ? 'block' : 'none'; document.getElementById('_agOk').textContent = ''; document.getElementById('_agOk').style.display = 'none'; }
  function _agSetOk(msg)  { const e = document.getElementById('_agOk');  e.textContent = msg; e.style.display = msg ? 'block' : 'none'; document.getElementById('_agErr').textContent = ''; document.getElementById('_agErr').style.display = 'none'; }

  function _agDismiss(user, token) {
    if (token) localStorage.setItem('adminToken', token);
    if (user)  localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userLoggedIn', 'true');
    document.getElementById('_agOverlay').remove();
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
      const sc = window.supabase?.createClient(SUPA_URL, SUPA_ANON, { auth: { storageKey: 'ag-tmp', persistSession: false } });
      if (!sc) throw new Error('no supabase');
      const { data, error } = await sc.auth.signInWithPassword({ email, password });
      if (error) throw error;
      _agSetOk('Login successful!');
      setTimeout(() => _agDismiss(data.user, data.session?.access_token), 600);
    } catch(e) {
      _agSetErr('Invalid email or password.');
      btn.disabled = false; btn.textContent = '🚀 Log In to Earnify';
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
      const sc = window.supabase?.createClient(SUPA_URL, SUPA_ANON, { auth: { storageKey: 'ag-tmp', persistSession: false } });
      if (!sc) throw new Error('no supabase');
      const { error } = await sc.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: window.location.origin + '/' } });
      if (error && !error.message.toLowerCase().includes('email')) throw error;
      _agSetOk('✅ Account created! Check your email to confirm, then login.');
      btn.disabled = false; btn.textContent = '✨ Create Free Account';
      setTimeout(() => _agShowTab('login'), 2000);
    } catch(e) {
      _agSetErr(e.message || 'Signup failed. Try again.');
      btn.disabled = false; btn.textContent = '✨ Create Free Account';
    }
  };

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    const loginVisible = document.getElementById('_agLoginForm').style.display !== 'none';
    if (loginVisible) _agLogin(); else _agSignup();
  });
})();
