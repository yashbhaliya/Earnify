// API Configuration will be loaded from api-config.js
let allResources = [];
let currentFilter = 'all';
let isLoggedIn = false;
let currentPage = 1;
const itemsPerPage = 12;

document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  loadResources();
  loadSiteSettings();
  initializeSmoothScrolling();
});

function initializeSmoothScrolling() {
  const ctaBtn = document.querySelector('.cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const el = document.querySelector(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

function loadSiteSettings() {
  const s = JSON.parse(localStorage.getItem('siteSettings') || '{}');
  const logo = document.querySelector('.logo');
  if (logo && s.siteName) logo.textContent = s.siteLogo || s.siteName;
  if (s.siteName) document.title = s.siteName + ' - Your Learning Marketplace';
}

function checkLoginStatus() {
  isLoggedIn = localStorage.getItem('userLoggedIn') === 'true' || localStorage.getItem('adminToken') !== null;
  updateUI();
}

function updateUI() {
  const loginBtn       = document.getElementById('loginBtn');
  const signupBtn      = document.getElementById('signupBtn');
  const userMenu       = document.getElementById('userMenu');
  const userName       = document.getElementById('userName');
  const userDisplayName= document.getElementById('userDisplayName');
  const userEmail      = document.getElementById('userEmail');

  if (isLoggedIn) {
    if (loginBtn)  loginBtn.style.display  = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (userMenu)  userMenu.style.display  = 'flex';
    const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const name  = cu.user_metadata?.name || cu.email?.split('@')[0] || 'User';
    const email = cu.email || '';
    if (userName)        userName.textContent        = name;
    if (userDisplayName) userDisplayName.textContent = name;
    if (userEmail)       userEmail.textContent       = email;
    const avatarEl = document.getElementById('userAvatarInitial');
    if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
  } else {
    if (loginBtn)  loginBtn.style.display  = 'inline-block';
    if (signupBtn) signupBtn.style.display = 'inline-block';
    if (userMenu)  userMenu.style.display  = 'none';
  }
}

function toggleUserDropdown() {
  const d = document.getElementById('userDropdown');
  d.style.display = d.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', (e) => {
  const um = document.getElementById('userMenu');
  const d  = document.getElementById('userDropdown');
  if (um && d && !um.contains(e.target)) d.style.display = 'none';
});

function showLoginModal()  { document.getElementById('loginModal').classList.add('open'); }
function closeLoginModal() { document.getElementById('loginModal').classList.remove('open'); }
function showSignupModal() { document.getElementById('loginModal').classList.add('open'); _amTab('signup'); }
function closeSignupModal(){ closeLoginModal(); }
function switchToSignup()  { showSignupModal(); }
function switchToLogin()   { showLoginModal(); _amTab('login'); }

function _amTab(tab) {
  document.getElementById('amLoginForm').style.display  = tab === 'login'  ? '' : 'none';
  document.getElementById('amSignupForm').style.display = tab === 'signup' ? '' : 'none';
  document.getElementById('amTabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('amTabSignup').classList.toggle('active', tab === 'signup');
  const err = document.getElementById('amErr'); if (err) err.textContent = '';
  const ok  = document.getElementById('amOk');  if (ok)  ok.textContent  = '';
}

function _amSetErr(msg) {
  const el = document.getElementById('amErr');
  if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
  const ok = document.getElementById('amOk');
  if (ok) { ok.textContent = ''; ok.style.display = 'none'; }
}

function _amSetOk(msg) {
  const el = document.getElementById('amOk');
  if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
  const err = document.getElementById('amErr');
  if (err) { err.textContent = ''; err.style.display = 'none'; }
}

function _amTogglePw(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  const eyeOn  = btn.querySelector('.eye-on');
  const eyeOff = btn.querySelector('.eye-off');
  if (eyeOn)  eyeOn.style.display  = inp.type === 'password' ? '' : 'none';
  if (eyeOff) eyeOff.style.display = inp.type === 'password' ? 'none' : '';
}

// Intercept Dashboard links — show login modal if not logged in
function goToDashboard(e) {
  if (e) e.preventDefault();
  const href = (e && e.currentTarget && e.currentTarget.getAttribute('href')) || './Dashboard/';
  if (isLoggedIn) { window.location.href = href; }
  else { window._loginRedirect = href; showLoginModal(); }
}

async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Logging in…'; }
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) { _amSetErr(error.message); if (btn) { btn.disabled=false; btn.textContent='Log In'; } return; }
    if (!data.user.email_confirmed_at) {
      _amSetErr('Please verify your email before logging in!');
      await supabaseClient.auth.signOut();
      if (btn) { btn.disabled=false; btn.textContent='Log In'; } return;
    }
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    localStorage.setItem('adminToken', data.session.access_token);
    isLoggedIn = true;
    _amSetOk('Login successful! Redirecting…');
    setTimeout(() => {
      closeLoginModal(); updateUI();
      if (window._loginRedirect) { window.location.href = window._loginRedirect; }
    }, 700);
  } catch (err) { _amSetErr('Login failed: ' + err.message); if (btn) { btn.disabled=false; btn.textContent='Log In'; } }
}

async function handleSignup(e) {
  e.preventDefault();
  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm  = document.getElementById('signupConfirmPassword').value;
  if (password !== confirm) { _amSetErr('Passwords do not match!'); return; }
  if (password.length < 6)  { _amSetErr('Password must be at least 6 characters!'); return; }
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account\u2026'; }

  // Try server endpoint first (sends branded Gmail confirmation email)
  try {
    const res = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.auth.signup), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
      signal: AbortSignal.timeout(8000)
    });
    const data = await res.json();
    if (data.success) {
      _amSetOk('\u2705 Account created! Check your email to confirm, then login.');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
      setTimeout(() => _amTab('login'), 2000);
      return;
    }
    // Server returned an error — fall through to Supabase direct
  } catch (_) {
    // Server unreachable — fall through to Supabase direct
  }

  // Fallback: direct Supabase signup
  try {
    const { error } = await supabaseClient.auth.signUp({
      email, password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin + '/?verified=1'
      }
    });
    const isEmailErr = error && (
      error.message.toLowerCase().includes('email') ||
      error.message.toLowerCase().includes('smtp') ||
      error.message.toLowerCase().includes('sending') ||
      error.message.toLowerCase().includes('confirmation') ||
      error.message.toLowerCase().includes('database')
    );
    if (error && !isEmailErr) {
      _amSetErr(error.message);
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
      return;
    }
    _amSetOk('\u2705 Account created! Check your email to confirm, then login.');
    if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
    setTimeout(() => _amTab('login'), 2000);
  } catch (err) {
    _amSetErr('Signup failed: ' + err.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  ['userLoggedIn','currentUser','adminToken'].forEach(k => localStorage.removeItem(k));
  isLoggedIn = false; updateUI();
  window.location.href = '/index.html';
}

/* ── Skeleton Loader ── */
function showLoader() {
  const grid = document.getElementById('resourcesGrid');
  if (!grid) return;
  const card = () => `
    <div class="skeleton-card">
      <div class="sk-header">
        <div class="sk sk-icon"></div>
        <div class="sk sk-badge"></div>
      </div>
      <div class="sk sk-title"></div>
      <div class="sk sk-desc1"></div>
      <div class="sk sk-desc2"></div>
      <div class="sk sk-price"></div>
      <div class="sk sk-btn"></div>
    </div>`;
  grid.innerHTML = card().repeat(12);
  const pag = document.querySelector('.pagination');
  if (pag) pag.innerHTML = '';
}

/* ── Load Resources ── */
async function loadResources() {
  showLoader();
  try {
    const res = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.resources));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allResources = await res.json();

    let userPurchases = [];
    if (isLoggedIn) {
      const cu = JSON.parse(localStorage.getItem('currentUser'));
      if (cu) {
        try {
          const pr = await fetch(API_CONFIG.getURL(`${API_CONFIG.endpoints.payments}/${cu.id}`));
          if (pr.ok) userPurchases = await pr.json();
        } catch {}
      }
    }
    displayResources(allResources, userPurchases);
  } catch (err) {
    const grid = document.getElementById('resourcesGrid');
    if (grid) grid.innerHTML = `<p style="text-align:center;color:#666;">Unable to load resources: ${err.message}<br>Please try refreshing.</p>`;
  }
}

/* ── Search ── */
function searchResources() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allResources.filter(r =>
    (r.title||'').toLowerCase().includes(q) ||
    (r.type||'').toLowerCase().includes(q)  ||
    (r.description||'').toLowerCase().includes(q) ||
    String(r.price||'').includes(q)
  );
  showLoader();
  if (isLoggedIn) {
    const cu = JSON.parse(localStorage.getItem('currentUser'));
    if (cu) {
      fetch(API_CONFIG.getURL(`${API_CONFIG.endpoints.payments}/${cu.id}`))
        .then(r => r.ok ? r.json() : [])
        .then(p => displayResources(filtered, p))
        .catch(() => displayResources(filtered, []));
      return;
    }
  }
  displayResources(filtered, []);
}

/* ── Display ── */
function displayResources(resources, userPurchases = []) {
  const grid = document.getElementById('resourcesGrid');
  if (!grid) return;

  if (!resources || resources.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#666;grid-column:1/-1;">No resources available yet.</p>';
    const pag = document.querySelector('.pagination');
    if (pag) pag.innerHTML = '';
    return;
  }

  const purchasedIds = userPurchases.map(p => p.resource_id);
  const totalPages   = Math.ceil(resources.length / itemsPerPage);
  const start        = (currentPage - 1) * itemsPerPage;
  const paged        = resources.slice(start, start + itemsPerPage);
  const imgMap       = { pdf:'/file/pdf.jpg', excel:'/file/excel.jpg', exam:'/file/exam.jpg', freelance:'/file/service.jpg' };

  grid.innerHTML = paged.map(r => {
    const bought = purchasedIds.includes(r.id);
    const img    = imgMap[r.type] || '/file/all.jpg';
    return `
      <div class="resource-card" onclick="viewDetails(${r.id})" style="cursor:pointer;">
        <div class="card-header">
          <div class="resource-icon"><img src="${img}" alt="${r.type}" style="width:48px;height:48px;object-fit:contain;border-radius:10px;"></div>
          <div class="resource-type">${r.type.toUpperCase()}</div>
        </div>
        <h3>${r.title}</h3>
        <p>${r.description}</p>
        <div class="resource-price">₹${r.price}</div>
        ${bought
          ? '<button class="btn-purchased" disabled onclick="event.stopPropagation()">✓ Purchased</button>'
          : `<button class="btn-buy" onclick="event.stopPropagation();buyResource(${r.id})">Buy Now</button>`}
      </div>`;
  }).join('');

  renderPagination(totalPages);
}

/* ── Pagination ── */
function renderPagination(totalPages) {
  let pag = document.querySelector('.pagination');
  if (!pag) {
    pag = document.createElement('div');
    pag.className = 'pagination';
    document.querySelector('.resources-section .container').appendChild(pag);
  }
  if (totalPages <= 1) { pag.style.display = 'none'; return; }
  pag.style.display = 'flex';

  // build page numbers: always show first, last, current ±1, with ellipsis
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    }
  }
  // insert ellipsis markers
  const withEllipsis = [];
  pages.forEach((p, idx) => {
    if (idx > 0 && p - pages[idx - 1] > 1) withEllipsis.push('...');
    withEllipsis.push(p);
  });

  let html = `<div class="pag-info">Page ${currentPage} of ${totalPages}</div><div class="pag-btns">`;
  html += `<button class="pag-arrow" onclick="changePage(${currentPage-1})" ${currentPage===1?'disabled':''}><i class="fas fa-chevron-left"></i></button>`;
  withEllipsis.forEach(p => {
    if (p === '...') {
      html += `<span class="pag-ellipsis">…</span>`;
    } else {
      html += `<button class="pag-num ${p===currentPage?'active':''}" onclick="changePage(${p})">${p}</button>`;
    }
  });
  html += `<button class="pag-arrow" onclick="changePage(${currentPage+1})" ${currentPage===totalPages?'disabled':''}><i class="fas fa-chevron-right"></i></button>`;
  html += '</div>';
  pag.innerHTML = html;
}

function scrollToResources() {
  const section = document.getElementById('resources');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function changePage(page) {
  currentPage = page;
  showLoader();
  scrollToResources();
  const filtered = currentFilter === 'all' ? allResources : allResources.filter(r => r.type === currentFilter);
  if (isLoggedIn) {
    const cu = JSON.parse(localStorage.getItem('currentUser'));
    if (cu) {
      fetch(API_CONFIG.getURL(`${API_CONFIG.endpoints.payments}/${cu.id}`))
        .then(r => r.ok ? r.json() : [])
        .then(p => displayResources(filtered, p))
        .catch(() => displayResources(filtered, []));
      return;
    }
  }
  displayResources(filtered, []);
}

/* ── Filter ── */
function filterResources(type) {
  currentFilter = type;
  currentPage   = 1;
  document.querySelectorAll('.filter-btn').forEach(b => {
    const btnType = b.getAttribute('onclick')?.match(/'(\w+)'/)?.[1] || 'all';
    b.classList.toggle('active', btnType === type);
  });
  showLoader();
  scrollToResources();
  const filtered = type === 'all' ? allResources : allResources.filter(r => r.type === type);
  if (isLoggedIn) {
    const cu = JSON.parse(localStorage.getItem('currentUser'));
    if (cu) {
      fetch(API_CONFIG.getURL(`${API_CONFIG.endpoints.payments}/${cu.id}`))
        .then(r => r.ok ? r.json() : [])
        .then(p => displayResources(filtered, p))
        .catch(() => displayResources(filtered, []));
      return;
    }
  }
  displayResources(filtered, []);
}

function viewDetails(id) { window.location.href = `Detail/?id=${id}`; }
function buyResource(id)  { window.location.href = `Detail/?id=${id}`; }

async function handleEmailVerification() {
  const params = new URLSearchParams(window.location.search);
  const hash   = new URLSearchParams(window.location.hash.substring(1));
  const token  = hash.get('access_token');
  const type   = hash.get('type');

  // Case 1: Supabase redirected back with access_token in hash (email confirmed)
  if (token) {
    await supabaseClient.auth.signOut(); // sign out the auto-session
    window.history.replaceState({}, document.title, window.location.pathname);
    setTimeout(() => {
      showLoginModal();
      _amSetOk('\u2705 Email verified! You can now login.');
    }, 300);
    return;
  }

  // Case 2: type=signup or email in hash
  if (type === 'signup' || type === 'email') {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) await supabaseClient.auth.signOut();
    window.location.hash = '';
    setTimeout(() => {
      showLoginModal();
      _amSetOk('\u2705 Email verified! You can now login.');
    }, 300);
    return;
  }

  // Case 3: redirected back with ?verified=1
  if (params.get('verified') === '1') {
    window.history.replaceState({}, document.title, window.location.pathname);
    setTimeout(() => {
      showLoginModal();
      _amSetOk('\u2705 Email verified! You can now login.');
    }, 300);
  }
}
window.addEventListener('load', handleEmailVerification);

function toggleMobileMenu() {
  document.getElementById('mobileSidebar')?.classList.toggle('active');
  document.getElementById('mobileSidebarOverlay')?.classList.toggle('active');
  document.querySelector('.mobile-menu-btn')?.classList.toggle('active');
  document.body.classList.toggle('sidebar-open');
  updateMobileUserMenu();
}

function updateMobileUserMenu() {
  const mobileLoginBtn  = document.getElementById('mobileLoginBtn');
  const mobileSignupBtn = document.getElementById('mobileSignupBtn');
  const mobileUserMenu  = document.getElementById('mobileUserMenu');
  const mobileUserName  = document.getElementById('mobileUserName');
  const mobileUserEmail = document.getElementById('mobileUserEmail');
  if (isLoggedIn) {
    if (mobileLoginBtn)  mobileLoginBtn.style.display  = 'none';
    if (mobileSignupBtn) mobileSignupBtn.style.display = 'none';
    if (mobileUserMenu)  mobileUserMenu.style.display  = 'block';
    const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (mobileUserName)  mobileUserName.textContent  = cu.user_metadata?.name || cu.email?.split('@')[0] || 'User';
    if (mobileUserEmail) mobileUserEmail.textContent = cu.email || '';
  } else {
    if (mobileLoginBtn)  mobileLoginBtn.style.display  = 'block';
    if (mobileSignupBtn) mobileSignupBtn.style.display = 'block';
    if (mobileUserMenu)  mobileUserMenu.style.display  = 'none';
  }
}

const originalUpdateUI = updateUI;
updateUI = function() { originalUpdateUI(); updateMobileUserMenu(); };
