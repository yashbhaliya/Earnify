const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000' : location.origin;

console.log('[Statistics] API_BASE =>', API_BASE);

async function apiFetch(path) {
  const url = API_BASE + path;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${path}`);
  return res.json();
}

function setAdminInfo(email) {
  const elEmail  = document.getElementById('adminEmail');
  const elAvatar = document.getElementById('adminAvatar');
  if (elEmail)  elEmail.textContent  = email;
  if (elAvatar) elAvatar.textContent = email.charAt(0).toUpperCase();
}

(async function initAdmin() {
  try {
    const SUPA_URL = 'https://emnrgsgerfjvndexomro.supabase.co';
    const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjAyMTAsImV4cCI6MjA4Nzk5NjIxMH0.uXr8lipxLbB4D_5JwQkpLzc-HudQw23tOFBfV4C6hqY';
    if (typeof window.supabase !== 'undefined') {
      const _supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
      const { data: { user } } = await _supa.auth.getUser();
      if (user?.email) { setAdminInfo(user.email); return; }
    }
  } catch(e) { console.warn('[Statistics] Supabase auth failed =>', e.message); }

  const token = localStorage.getItem('adminToken');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setAdminInfo(payload.email || 'admin@earnify.com');
      return;
    } catch(e) { console.warn('[Statistics] token decode failed', e); }
  }

  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.email) { setAdminInfo(currentUser.email); return; }
  } catch(e) { console.warn('[Statistics] currentUser parse failed', e); }

  setAdminInfo('Admin');
})();

function logout() {
  localStorage.clear(); sessionStorage.clear();
  location.href = '/';
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}

function setCard(id, subId, value, sub) {
  const el = document.getElementById(id);
  const elSub = document.getElementById(subId);
  if (el) el.textContent = value;
  if (elSub) elSub.textContent = sub;
}

function fmt(n) { return '\u20b9' + Math.round(n || 0).toLocaleString('en-IN'); }

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '--';
}

let allPurchases = [];

async function loadStats() {
  document.querySelectorAll('.stat-card').forEach(c => c.classList.add('is-shimmer'));
  ['valRevenue','valPurchases','valAvgOrder','valBuyers'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div class="shimmer shimmer-value"></div>';
  });
  ['subRevenue','subPurchases','subAvgOrder','subBuyers'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div class="shimmer shimmer-sub"></div>';
  });

  try {
    allPurchases = await apiFetch('/api/admin/purchases');

    const completed    = allPurchases.filter(p => p.status === 'completed');
    const totalRevenue = completed.reduce((s, p) => s + parseFloat(p.amount || p.resource_price || 0), 0);
    const uniqueBuyers = new Set(allPurchases.map(p => p.buyer_email)).size;
    const avgOrder     = completed.length ? totalRevenue / completed.length : 0;

    document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('is-shimmer'));
    setCard('valRevenue',   'subRevenue',   fmt(totalRevenue),   'From ' + completed.length + ' sales');
    setCard('valPurchases', 'subPurchases', allPurchases.length, completed.length + ' completed');
    setCard('valAvgOrder',  'subAvgOrder',  fmt(avgOrder),       'Per transaction');
    setCard('valBuyers',    'subBuyers',    uniqueBuyers,        'Unique customers');

    renderTable(allPurchases);

  } catch (err) {
    console.error('[Statistics] loadStats error =>', err);
    document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('is-shimmer'));
    const subIds = ['subRevenue','subPurchases','subAvgOrder','subBuyers'];
    ['valRevenue','valPurchases','valAvgOrder','valBuyers'].forEach((id, i) =>
      setCard(id, subIds[i], '--', 'Error loading'));
    const tbody = document.getElementById('purchaseTbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">\u26a0\ufe0f</div><p>' + err.message + '</p></div></td></tr>';
    const rc = document.getElementById('recordCount');
    if (rc) rc.textContent = 'Error';
  }
}

function renderTable(rows) {
  const tbody = document.getElementById('purchaseTbody');
  const rc    = document.getElementById('recordCount');
  if (!tbody) return;
  if (rc) rc.textContent = rows.length + ' record' + (rows.length !== 1 ? 's' : '');

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">\ud83d\udced</div><p>No records found</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(function(p, i) {
    const status   = p.status || 'completed';
    const amount   = parseFloat(p.amount || p.resource_price || 0);
    const badgeCls = status === 'completed' ? 'badge-completed' : status === 'pending' ? 'badge-pending' : 'badge-failed';
    const email    = p.buyer_email || '--';
    const title    = p.resource_title || '--';

    return '<tr>'
      + '<td style="color:#94a3b8;font-weight:600;">' + (i + 1) + '</td>'
      + '<td style="font-weight:500;color:#1e293b;">' + email + '</td>'
      + '<td>' + title + '</td>'
      + '<td style="font-weight:700;color:#10b981;">' + fmt(amount) + '</td>'
      + '<td><span class="badge ' + badgeCls + '">' + status + '</span></td>'
      + '<td>' + fmtDate(p.created_at) + '</td>'
      + '</tr>'
      + '<tr class="mobile-table-row">'
      + '<td colspan="6">'
      + '<div class="mobile-cell">'
      + '<div class="mobile-left">'
      + '<div class="mobile-email">' + email + '</div>'
      + '<div class="mobile-resource">' + title + '</div>'
      + '</div>'
      + '<div class="mobile-right">'
      + '<div class="mobile-amount">' + fmt(amount) + '</div>'
      + '<span class="badge ' + badgeCls + '" style="font-size:10px;">' + status + '</span>'
      + '</div>'
      + '<button class="view-btn" onclick="showPurchaseDetails(' + i + ')">View</button>'
      + '</div>'
      + '</td>'
      + '</tr>';
  }).join('');
}

function showPurchaseDetails(index) {
  const purchase = allPurchases[index];
  if (!purchase) return;

  const status   = purchase.status || 'completed';
  const amount   = parseFloat(purchase.amount || purchase.resource_price || 0);
  const badgeCls = status === 'completed' ? 'badge-completed' : status === 'pending' ? 'badge-pending' : 'badge-failed';

  const mb = document.getElementById('modalBody');
  if (!mb) return;
  mb.innerHTML =
    '<div class="detail-row"><div class="detail-label">Buyer Email</div><div class="detail-value">' + (purchase.buyer_email || '--') + '</div></div>'
    + '<div class="detail-row"><div class="detail-label">Resource</div><div class="detail-value">' + (purchase.resource_title || '--') + '</div></div>'
    + '<div class="detail-row"><div class="detail-label">Amount</div><div class="detail-value amount">' + fmt(amount) + '</div></div>'
    + '<div class="detail-row"><div class="detail-label">Status</div><div class="detail-value"><span class="badge ' + badgeCls + '">' + status + '</span></div></div>'
    + '<div class="detail-row"><div class="detail-label">Purchase Date</div><div class="detail-value">' + fmtDate(purchase.created_at) + '</div></div>'
    + '<div class="detail-row"><div class="detail-label">Purchase ID</div><div class="detail-value" style="font-size:12px;color:#64748b;">' + (purchase.id || '--') + '</div></div>';

  document.getElementById('detailsModal').classList.add('active');
}

function closeDetailsModal() {
  document.getElementById('detailsModal').classList.remove('active');
}

function filterTable() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const filtered = allPurchases.filter(function(p) {
    const matchSearch = !search ||
      (p.buyer_email || '').toLowerCase().includes(search) ||
      (p.resource_title || '').toLowerCase().includes(search);
    const matchStatus = !status || p.status === status;
    return matchSearch && matchStatus;
  });
  renderTable(filtered);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadStats);
} else {
  loadStats();
}
