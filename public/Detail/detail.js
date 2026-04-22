let currentResource = null;
let isLoggedIn = false;
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  loadResourceDetails();
});

function checkLoginStatus() {
  isLoggedIn = localStorage.getItem('userLoggedIn') === 'true' || localStorage.getItem('adminToken') !== null;
  const userStr = localStorage.getItem('currentUser');
  currentUser = userStr ? JSON.parse(userStr) : null;
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
    const name  = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User';
    const email = currentUser?.email || '';
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
  updateMobileMenuUI();
}

function toggleUserDropdown() {
  const d = document.getElementById('userDropdown');
  if (d) d.style.display = d.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', e => {
  const um = document.getElementById('userMenu');
  const d  = document.getElementById('userDropdown');
  if (um && d && !um.contains(e.target)) d.style.display = 'none';
});

function showLoginModal()  { document.getElementById('loginModal').classList.add('open'); }
function closeLoginModal() { document.getElementById('loginModal').classList.remove('open'); }
function showSignupModal() { showLoginModal(); _amTab('signup'); }
function closeSignupModal(){ closeLoginModal(); }
function switchToSignup()  { showSignupModal(); }
function switchToLogin()   { showLoginModal(); _amTab('login'); }

function _amTab(tab) {
  const lf = document.getElementById('amLoginForm');
  const sf = document.getElementById('amSignupForm');
  const tl = document.getElementById('amTabLogin');
  const ts = document.getElementById('amTabSignup');
  if (lf) lf.style.display = tab === 'login'  ? '' : 'none';
  if (sf) sf.style.display = tab === 'signup' ? '' : 'none';
  if (tl) tl.classList.toggle('active', tab === 'login');
  if (ts) ts.classList.toggle('active', tab === 'signup');
  const err = document.getElementById('amErr'); if (err) err.textContent = '';
  const ok  = document.getElementById('amOk');  if (ok)  ok.textContent  = '';
}

function _amTogglePw(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁️' : '🙈';
}

function _amSetErr(msg) {
  const e = document.getElementById('amErr'); if (e) { e.textContent = msg; e.className = 'am-msg error'; }
  const o = document.getElementById('amOk');  if (o) o.textContent = '';
}
function _amSetOk(msg) {
  const o = document.getElementById('amOk');  if (o) { o.textContent = msg; o.className = 'am-msg success'; }
  const e = document.getElementById('amErr'); if (e) e.textContent = '';
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
    isLoggedIn = true; currentUser = data.user;
    _amSetOk('Login successful!');
    setTimeout(() => { closeLoginModal(); updateUI(); loadResourceDetails(); }, 700);
  } catch (err) { _amSetErr('Login failed: ' + err.message); if (btn) { btn.disabled=false; btn.textContent='Log In'; } }
}

async function handleSignup(e) {
  e.preventDefault();
  const name     = document.getElementById('signupName').value;
  const email    = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirm  = document.getElementById('signupConfirmPassword').value;
  if (password !== confirm) { _amSetErr('Passwords do not match!'); return; }
  if (password.length < 6)  { _amSetErr('Password must be at least 6 characters!'); return; }
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account…'; }
  try {
    const { error } = await supabaseClient.auth.signUp({
      email, password, options: { data: { name }, emailRedirectTo: window.location.origin + '/' }
    });
    if (error) { _amSetErr(error.message); if (btn) { btn.disabled=false; btn.textContent='Create Account'; } return; }
    _amSetOk('Verification email sent! Please verify before logging in.');
    setTimeout(() => _amTab('login'), 1500);
  } catch (err) { console.error(err); }
}

async function logout() {
  await supabaseClient.auth.signOut();
  ['userLoggedIn','currentUser','adminToken'].forEach(k => localStorage.removeItem(k));
  isLoggedIn = false; currentUser = null;
  updateUI();
  window.location.href = '../';
}

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function loadResourceDetails() {
  const params = new URLSearchParams(window.location.search);
  const titleSlug = params.get('title');
  const resourceId = params.get('id');

  if (!titleSlug && !resourceId) {
    document.getElementById('resourceDetails').innerHTML =
      '<p class="loading">No resource specified. <a href="../">Return Home</a></p>';
    return;
  }

  showShimmerLoading();

  try {
    const res       = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.resources));
    const resources = await res.json();

    if (titleSlug) {
      currentResource = resources.find(r => toSlug(r.title) === titleSlug);
    } else {
      currentResource = resources.find(r => r.id == resourceId);
      // redirect old ?id= URL to clean slug URL
      if (currentResource) {
        const slug = toSlug(currentResource.title);
        window.history.replaceState({}, '', `?title=${slug}`);
      }
    }

    if (!currentResource) {
      document.getElementById('resourceDetails').innerHTML =
        '<p class="loading">Resource not found. <a href="../">Return Home</a></p>';
      return;
    }

    let isPurchased = false;
    if (isLoggedIn && currentUser) {
      try {
        const pr = await fetch(API_CONFIG.getURL(`${API_CONFIG.endpoints.payments}/${currentUser.id}`));
        if (pr.ok) {
          const purchases = await pr.json();
          isPurchased = purchases.some(p => p.resource_id === currentResource.id);
        }
      } catch {}
    }

    setTimeout(() => displayResourceDetails(isPurchased), 1000);
  } catch (err) {
    document.getElementById('resourceDetails').innerHTML =
      `<p class="loading">Failed to load resource. <a href="../">Return Home</a></p>`;
  }
}

function showShimmerLoading() {
  document.getElementById('breadcrumbTitle').innerHTML =
    '<span class="shimmer-element" style="width:160px;height:13px;display:inline-block;border-radius:4px;"></span>';

  document.getElementById('resourceDetails').innerHTML = `
    <div class="resource-header-card">
      <div class="shimmer-element shimmer-badge"></div>
      <div class="shimmer-element shimmer-title"></div>
      <div class="shimmer-element shimmer-desc"></div>
      <div class="shimmer-element shimmer-desc shimmer-desc-mid"></div>
      <div class="shimmer-element shimmer-desc shimmer-desc-short"></div>
    </div>
    <div class="included-card">
      <div class="shimmer-element shimmer-features-title"></div>
      <div class="shimmer-features">
        <div class="shimmer-element shimmer-feature-item"></div>
        <div class="shimmer-element shimmer-feature-item"></div>
        <div class="shimmer-element shimmer-feature-item shimmer-feature-item-short"></div>
      </div>
    </div>`;

  document.getElementById('purchaseCard').innerHTML = `
    <div class="purchase-card">
      <div class="shimmer-price-section">
        <div class="shimmer-element shimmer-price-label"></div>
        <div class="shimmer-element shimmer-price"></div>
      </div>
      <div class="shimmer-element shimmer-button"></div>
      <div class="shimmer-info-section">
        <div class="shimmer-element shimmer-info-item"></div>
        <div class="shimmer-element shimmer-info-item shimmer-info-item-mid"></div>
        <div class="shimmer-element shimmer-info-item shimmer-info-item-short"></div>
      </div>
    </div>`;

  document.getElementById('trustCard').innerHTML = '';
}

function displayResourceDetails(isPurchased = false) {
  const icons = { pdf: '📄', excel: '📊', exam: '📝', freelance: '💼' };
  const icon  = icons[currentResource.type] || '📦';

  document.title = currentResource.title + ' - Earnify';
  document.getElementById('breadcrumbTitle').textContent = currentResource.title;

  // ── Main content ──
  document.getElementById('resourceDetails').innerHTML = `
    <div class="resource-header-card">
      <span class="resource-type-badge">${icon} ${currentResource.type.toUpperCase()}</span>
      <h1>${currentResource.title}</h1>
      <p class="description">${currentResource.description}</p>
      <div class="resource-meta-row">
        <div class="resource-meta-item"><strong>₹${currentResource.price}</strong></div>
        <div class="resource-meta-item"><i class="fas fa-tag"></i><strong>${currentResource.type.toUpperCase()}</strong></div>
        <div class="resource-meta-item"><i class="fas fa-bolt"></i><strong>Instant Access</strong></div>
        <div class="resource-meta-item"><i class="fas fa-infinity"></i><strong>Lifetime Access</strong></div>
      </div>
    </div>

    <div class="included-card">
      <div class="card-heading"><i class="fas fa-check-circle"></i> What's Included</div>
      <div class="included-grid">
        <div class="included-item"><i class="fas fa-check"></i><span>Instant digital download after payment</span></div>
        <div class="included-item"><i class="fas fa-check"></i><span>Lifetime access — download anytime</span></div>
        <div class="included-item"><i class="fas fa-check"></i><span>Premium quality, verified content</span></div>
        <div class="included-item"><i class="fas fa-check"></i><span>Access from your Dashboard</span></div>
        <div class="included-item"><i class="fas fa-check"></i><span>Secure payment via Razorpay</span></div>
        <div class="included-item"><i class="fas fa-check"></i><span>Support within 2 business days</span></div>
      </div>
    </div>

    <div class="why-card">
      <div class="card-heading"><i class="fas fa-star"></i> Why Choose This Resource?</div>
      <div class="why-list">
        <div class="why-item"><i class="fas fa-shield-alt"></i><span><strong>Verified & Reviewed</strong> — Every resource is checked before going live to ensure quality and accuracy.</span></div>
        <div class="why-item"><i class="fas fa-lock"></i><span><strong>Secure Payment</strong> — Payments via Razorpay (RBI-regulated, PCI-DSS compliant). We never store your card details.</span></div>
        <div class="why-item"><i class="fas fa-download"></i><span><strong>Instant Delivery</strong> — Get immediate access to your resource right after payment. No waiting.</span></div>
        <div class="why-item"><i class="fas fa-headset"></i><span><strong>Dedicated Support</strong> — Have an issue? Email support@earnify.com. We respond within 2 hours.</span></div>
      </div>
    </div>`;

  // ── Purchase card ──
  if (isPurchased) {
    document.getElementById('purchaseCard').innerHTML = `
      <div class="purchase-card">
        <div class="price-section">
          <div class="price-label" style="color:#10b981;font-size:0.85rem;">✅ Already Purchased</div>
          <div style="font-size:1.1rem;font-weight:800;color:#10b981;margin-top:6px;">You own this resource</div>
        </div>
        <a href="${currentResource.fileurl || '#'}" ${currentResource.fileurl ? 'download' : ''} class="buy-button" style="background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 8px 24px rgba(16,185,129,0.35);">
          <i class="fas fa-download"></i> Download File
        </a>
        <div class="purchase-info">
          <div class="info-item"><i class="fas fa-check"></i> Thank you for your purchase!</div>
          <div class="info-item"><i class="fas fa-tachometer-alt"></i> Access anytime from Dashboard</div>
          <div class="info-item"><i class="fas fa-infinity"></i> Lifetime access</div>
        </div>
      </div>`;
  } else {
    document.getElementById('purchaseCard').innerHTML = `
      <div class="purchase-card">
        <div class="price-section">
          <div class="price-label">Price</div>
          <div class="price">₹${currentResource.price}</div>
        </div>
        <button class="buy-button" onclick="handlePurchase()">
          <i class="fas fa-shopping-cart"></i> Buy Now
        </button>
        <div class="purchase-info">
          <div class="info-item"><i class="fas fa-bolt"></i> Instant access after payment</div>
          <div class="info-item"><i class="fas fa-lock"></i> Secure payment via Razorpay</div>
          <div class="info-item"><i class="fas fa-undo"></i> Refund policy applies</div>
          <div class="info-item"><i class="fas fa-infinity"></i> Lifetime access</div>
        </div>
      </div>`;
  }

  // ── Trust card ──
  document.getElementById('trustCard').innerHTML = `
    <div class="trust-card">
      <div class="trust-card-title">Why Earnify?</div>
      <div class="trust-badges">
        <div class="trust-badge green"><i class="fas fa-shield-alt"></i><span>RBI-regulated payments via Razorpay</span></div>
        <div class="trust-badge blue"><i class="fas fa-bolt"></i><span>Instant delivery after purchase</span></div>
        <div class="trust-badge amber"><i class="fas fa-star"></i><span>Verified & reviewed resources</span></div>
        <div class="trust-badge purple"><i class="fas fa-headset"></i><span>Support within 2 hours</span></div>
      </div>
    </div>`;
}

async function handlePurchase() {
  if (!isLoggedIn) { showToast('Please login to purchase', 'warning'); showLoginModal(); return; }
  try {
    const btn = document.querySelector('.buy-button');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    const keyRes = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.paymentKey));
    const { key } = await keyRes.json();

    const orderRes = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.createOrder), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: currentResource.price, receipt: `receipt_${currentResource.id}_${Date.now()}` })
    });
    const order = await orderRes.json();

    const isDark = document.body.classList.contains('dark-mode');
    const options = {
      key, amount: order.amount, currency: order.currency,
      name: 'Earnify', description: currentResource.title, order_id: order.id,
      handler: async r => { await verifyPayment(r); },
      prefill: { name: currentUser?.user_metadata?.name, email: currentUser?.email },
      theme: {
        color: isDark ? '#a78bfa' : '#667eea',
        backdrop_color: isDark ? 'rgba(13,17,23,0.85)' : 'rgba(0,0,0,0.6)'
      },
      modal: { ondismiss: () => { btn.disabled = false; btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Buy Now'; } }
    };
    new Razorpay(options).open();
  } catch (err) {
    showToast('Payment failed. Please try again.', 'error');
    const btn = document.querySelector('.buy-button');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Buy Now'; }
  }
}

async function verifyPayment(response) {
  try {
    const res = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.verifyPayment), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        resourceId: currentResource.id,
        userId: currentUser.id
      })
    });
    const result = await res.json();
    if (res.ok && result.success) {
      showToast('Payment successful! You can now download your content.', 'success');
      loadResourceDetails();
    } else {
      showToast('Payment verification failed: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (err) { showToast('Verification failed: ' + err.message, 'error'); }
}

function toggleMobileMenu() {
  document.getElementById('mobileSidebar')?.classList.toggle('active');
  document.getElementById('mobileSidebarOverlay')?.classList.toggle('active');
  document.querySelector('.mobile-menu-btn')?.classList.toggle('active');
  document.body.classList.toggle('sidebar-open');
  updateMobileMenuUI();
}

function updateMobileMenuUI() {
  const mobileLoginBtn  = document.getElementById('mobileLoginBtn');
  const mobileSignupBtn = document.getElementById('mobileSignupBtn');
  const mobileUserMenu  = document.getElementById('mobileUserMenu');
  const mobileUserName  = document.getElementById('mobileUserName');
  const mobileUserEmail = document.getElementById('mobileUserEmail');

  if (isLoggedIn && currentUser) {
    if (mobileLoginBtn)  mobileLoginBtn.style.display  = 'none';
    if (mobileSignupBtn) mobileSignupBtn.style.display = 'none';
    if (mobileUserMenu)  mobileUserMenu.style.display  = 'block';
    const name  = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User';
    const email = currentUser?.email || '';
    if (mobileUserName)  mobileUserName.textContent  = name;
    if (mobileUserEmail) mobileUserEmail.textContent = email;
  } else {
    if (mobileLoginBtn)  mobileLoginBtn.style.display  = 'block';
    if (mobileSignupBtn) mobileSignupBtn.style.display = 'block';
    if (mobileUserMenu)  mobileUserMenu.style.display  = 'none';
  }
}
