const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000'
  : location.origin;

console.log('[Dashboard] API_BASE =>', API_BASE);

async function apiFetch(path) {
  const url = API_BASE + path;
  console.log('[apiFetch] GET', url);
  const res = await fetch(url);
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
  document.getElementById(id).textContent = value;
  document.getElementById(subId).textContent = sub;
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

  // Reset shimmer
  ['valRevenue','valWithdrawn','valFees','valPending'].forEach(id => {
    document.getElementById(id).innerHTML = '<div class="shimmer shimmer-value"></div>';
  });
  ['subRevenue','subWithdrawn','subFees','subPending'].forEach(id => {
    document.getElementById(id).innerHTML = '<div class="shimmer shimmer-sub"></div>';
  });
  document.getElementById('errorBanner').style.display = 'none';

  try {
    const [stats, withdrawals] = await Promise.all([
      apiFetch('/api/admin/dashboard-stats'),
      apiFetch('/api/admin/withdrawals')
    ]);

    console.log('[Dashboard] stats =>', stats);
    console.log('[Dashboard] withdrawals =>', withdrawals);

    // ── Stat Cards ──
    setCard('valRevenue',   'subRevenue',   fmt(stats.totalRevenue),   `${stats.completedCount || 0} completed sales`);
    setCard('valWithdrawn', 'subWithdrawn', fmt(stats.totalWithdrawn), `${stats.withdrawalCount || 0} approved withdrawals`);
    setCard('valFees',      'subFees',      fmt(stats.totalFees),      `${stats.feePercent || '5.0'}% platform fee`);
    setCard('valPending',   'subPending',   fmt(stats.pendingAmount),  'Awaiting withdrawal');

    // ── Recent Purchases Table ──
    const purchases = stats.recentPurchases || [];
    const tbody = document.getElementById('purchaseTbody');
    document.getElementById('purchaseCount').textContent = `${purchases.length} records`;

    if (!purchases.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📭</div><p>No purchases yet</p></div></td></tr>`;
    } else {
      tbody.innerHTML = purchases.map((p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${p.buyer_email || '—'}</td>
          <td>${p.resource_title || '—'}</td>
          <td style="font-weight:700;color:#1e293b;">${fmt(p.amount)}</td>
          <td><span class="badge ${badgeClass(p.status)}">${p.status}</span></td>
          <td>${fmtDate(p.created_at)}</td>
        </tr>`).join('');
    }

    // ── Withdrawals Table ──
    const wdList = Array.isArray(withdrawals) ? withdrawals : [];
    const wdTbody = document.getElementById('wdTbody');
    document.getElementById('wdCount').textContent = `${wdList.length} requests`;

    if (!wdList.length) {
      wdTbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div><p>No withdrawal requests yet</p></div></td></tr>`;
    } else {
      wdTbody.innerHTML = wdList.map((w, i) => {
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
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const name = payload.email?.split('@')[0] || 'Admin';
        document.getElementById('adminName').textContent = name;
        document.getElementById('adminAvatar').textContent = name.charAt(0).toUpperCase();
      } catch(e) { console.warn('[Dashboard] could not decode token', e); }
    }

  } catch (err) {
    console.error('[Dashboard] loadDashboard error =>', err);
    document.getElementById('errorBanner').style.display = 'block';
    document.getElementById('errorBanner').textContent = `⚠️ ${err.message} — Is the server running at ${API_BASE}?`;
    ['valRevenue','valWithdrawn','valFees','valPending'].forEach(id => {
      document.getElementById(id).textContent = '—';
    });
    ['subRevenue','subWithdrawn','subFees','subPending'].forEach(id => {
      document.getElementById(id).textContent = 'Error loading';
    });
    document.getElementById('purchaseTbody').innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${err.message}</p></div></td></tr>`;
    document.getElementById('wdTbody').innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${err.message}</p></div></td></tr>`;
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
