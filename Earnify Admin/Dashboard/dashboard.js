const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000'
  : 'https://earnify-gamma.vercel.app';

const SUPA_URL = 'https://emnrgsgerfjvndexomro.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjAyMTAsImV4cCI6MjA4Nzk5NjIxMH0.uXr8lipxLbB4D_5JwQkpLzc-HudQw23tOFBfV4C6hqY';

async function getUserEmail() {
  // 1. Try Supabase session (works across origins)
  try {
    const { createClient } = window.supabase;
    const _supa = createClient(SUPA_URL, SUPA_KEY);
    const { data: { user } } = await _supa.auth.getUser();
    if (user?.email) { console.log('[Dashboard] email from Supabase =>', user.email); return user.email; }
  } catch(e) { console.warn('[Dashboard] Supabase auth failed =>', e.message); }
  // 2. Try adminToken JWT from localStorage
  const token = localStorage.getItem('adminToken');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.email) { console.log('[Dashboard] email from adminToken =>', payload.email); return payload.email; }
    } catch(e) {}
  }
  // 3. Try currentUser
  try {
    const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (cu.email) { console.log('[Dashboard] email from currentUser =>', cu.email); return cu.email; }
  } catch(e) {}
  console.warn('[Dashboard] No email found in any source');
  return null;
}

console.log('[Dashboard] API_BASE =>', API_BASE);

async function apiFetch(path) {
  const url = API_BASE + path;
  console.log('[apiFetch] GET', url);
  const token = localStorage.getItem('adminToken');
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  console.log('[apiFetch] status', res.status, path);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  const data = await res.json();
  console.log('[apiFetch] data', path, data);
  return data;
}

function fmt(n) {
  return '₹' + parseFloat(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function setCard(id, subId, value, sub) {
  const v = document.getElementById(id);
  const s = document.getElementById(subId);
  if (v) v.textContent = value;
  if (s) s.textContent = sub;
}

function badgeClass(status) {
  if (status === 'completed') return 'badge-completed';
  if (status === 'pending')   return 'badge-pending';
  return 'badge-failed';
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function loadDashboard() {
  console.log('[Dashboard] loadDashboard() called');
  console.log('[Dashboard] location.hostname =>', location.hostname);
  console.log('[Dashboard] API_BASE =>', API_BASE);

  const errEl = document.getElementById('errorBanner');
  if (errEl) errEl.style.display = 'none';

  // Get logged-in user email
  const token = localStorage.getItem('adminToken');
  const userEmail = await getUserEmail();
  console.log('[Dashboard] userEmail =>', userEmail);

  try {
    console.log('[Dashboard] fetching stats for =>', userEmail);
    const [statsData, withdrawals] = await Promise.all([
      userEmail ? apiFetch(`/api/statistics/purchases/${encodeURIComponent(userEmail)}`) : Promise.resolve({}),
      userEmail ? apiFetch(`/api/withdrawals/${encodeURIComponent(userEmail)}`) : Promise.resolve([])
    ]);

    console.log('[Dashboard] statsData =>', statsData);
    console.log('[Dashboard] withdrawals =>', withdrawals);

    const totalGross     = parseFloat(statsData.totalGross || 0);
    const wdList         = Array.isArray(withdrawals) ? withdrawals : [];
    const totalWithdrawn = wdList
      .filter(w => w.status === 'approved' || w.status === 'completed')
      .reduce((s, w) => s + parseFloat(w.amount || 0), 0);
    const totalPending   = wdList
      .filter(w => w.status === 'pending')
      .reduce((s, w) => s + parseFloat(w.amount || 0), 0);
    const platformFees   = wdList
      .filter(w => ['approved','completed','pending'].includes(w.status))
      .reduce((s, w) => s + parseFloat(w.amount || 0) * 0.05, 0);
    const available      = Math.max(0, totalGross - totalWithdrawn - totalPending);
    const completedCount = statsData.totalPurchases || 0;
    const approvedCount  = wdList.filter(w => w.status === 'approved' || w.status === 'completed').length;

    console.log('[Dashboard] computed =>', { totalGross, totalWithdrawn, totalPending, platformFees, available });

    // ── Stat Cards ──
    const cardData = [
      { id: 'cardAvailable', value: fmt(available), sub: 'Ready to withdraw', subId: null },
      { id: 'cardRevenue',   value: fmt(totalGross), sub: `${completedCount} completed sales`, subId: 'cardRevenueSub' },
      { id: 'cardWithdrawn', value: fmt(totalWithdrawn), sub: `${approvedCount} approved withdrawals`, subId: 'cardWithdrawnSub' },
      { id: 'cardFees',      value: fmt(platformFees), sub: '5% platform fee', subId: null },
      { id: 'cardPending',   value: fmt(totalPending), sub: 'awaiting approval', subId: null }
    ];
    cardData.forEach(({ id, value, sub, subId }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = 'stat-value';
      el.textContent = value;
      const subEl = el.nextElementSibling;
      if (subEl) { subEl.className = 'stat-sub'; subEl.textContent = sub; }
      if (subId) { const s = document.getElementById(subId); if (s) { s.className = 'stat-sub'; s.textContent = sub; } }
    });
    document.querySelectorAll('.stat-card.is-shimmer').forEach(c => {
      c.classList.remove('is-shimmer');
      const icon = c.querySelector('.stat-icon span');
      if (icon) { icon.style.visibility = ''; }
    });

    // ── Recent Purchases Table ──
    const purchases = statsData.userStats || [];
    const tbody = document.getElementById('purchaseTbody');
    const pcEl = document.getElementById('purchaseCount');
    if (pcEl) pcEl.textContent = `${completedCount} records`;
    if (tbody) {
      tbody.innerHTML = !purchases.length
        ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📭</div><p>No purchases yet</p></div></td></tr>`
        : purchases.map((p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${p.email || '—'}</td>
            <td>${(p.resources || []).join(', ') || '—'}</td>
            <td style="font-weight:700;color:#1e293b;">${fmt(p.totalAmount)}</td>
            <td><span class="badge badge-completed">completed</span></td>
            <td>${fmtDate(p.created_at)}</td>
          </tr>`).join('');
    }

    // ── Withdrawals Table ──
    const wdTbody = document.getElementById('wdTbody');
    const wdEl = document.getElementById('wdCount');
    if (wdEl) wdEl.textContent = `${wdList.length} requests`;
    if (wdTbody) {
      wdTbody.innerHTML = !wdList.length
        ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div><p>No withdrawal requests yet</p></div></td></tr>`
        : wdList.map((w, i) => {
            const gross = parseFloat(w.amount || 0);
            const fee   = gross * 0.05;
            const net   = gross - fee;
            return `
              <tr>
                <td>${i + 1}</td>
                <td>${w.user_email || '—'}</td>
                <td style="font-weight:700;color:#1e293b;">${fmt(gross)}</td>
                <td style="font-weight:700;color:#667eea;">${fmt(net)}</td>
                <td style="color:#ef4444;">-${fmt(fee)}</td>
                <td><span class="badge ${badgeClass(w.status)}">${w.status}</span></td>
                <td>${fmtDate(w.created_at)}</td>
              </tr>`;
          }).join('');
    }

    // ── Sidebar admin info ──
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const name = payload.email?.split('@')[0] || 'Admin';
        console.log('[Dashboard] sidebar name =>', name);
        document.getElementById('adminName').textContent = name;
        document.getElementById('adminAvatar').textContent = name.charAt(0).toUpperCase();
      } catch(e) { console.error('[Dashboard] sidebar decode error =>', e); }
    }

    console.log('[Dashboard] ✅ done');

  } catch (err) {
    console.error('[Dashboard] ❌ loadDashboard error =>', err);
    console.error('[Dashboard] error stack =>', err.stack);
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = `⚠️ ${err.message}`; }
  }
}

function logout() {
  localStorage.clear();
  sessionStorage.clear();
  location.href = '../../public/admin/login.html';
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}

loadDashboard();
