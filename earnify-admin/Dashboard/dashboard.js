const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000'
  : location.origin;

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

let _donutChart = null;
let _barChart   = null;
let _allResourceData = []; // Store all resource data for filtering
let _allPurchasesData = []; // Store all purchases for date filtering

function renderResourceChart(limit = 10, sortBy = 'revenue') {
  const barCtx = document.getElementById('barChart')?.getContext('2d');
  if (!barCtx || !_allPurchasesData.length) return;
  
  if (_barChart) _barChart.destroy();
  
  // Aggregate data by resource
  const resourceData = {};
  _allPurchasesData.forEach(p => {
    const resources = p.resources || [];
    const amount = parseFloat(p.totalAmount || 0);
    resources.forEach(resource => {
      if (resource) {
        if (!resourceData[resource]) {
          resourceData[resource] = { revenue: 0, purchases: 0 };
        }
        resourceData[resource].revenue += amount;
        resourceData[resource].purchases += 1;
      }
    });
  });
  
  // Convert to array and calculate avg price
  let sortedResources = Object.entries(resourceData).map(([name, data]) => ({
    name,
    revenue: data.revenue,
    purchases: data.purchases,
    avgPrice: data.purchases > 0 ? data.revenue / data.purchases : 0
  }));
  
  // Apply sorting
  switch(sortBy) {
    case 'purchases':
      sortedResources.sort((a, b) => b.purchases - a.purchases);
      break;
    case 'avgPrice':
      sortedResources.sort((a, b) => b.avgPrice - a.avgPrice);
      break;
    case 'name':
      sortedResources.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'revenue':
    default:
      sortedResources.sort((a, b) => b.revenue - a.revenue);
      break;
  }
  
  // Apply limit
  const limitNum = limit === 'all' ? sortedResources.length : limit;
  sortedResources = sortedResources.slice(0, limitNum);
  
  if (!sortedResources.length) {
    if (_barChart) _barChart.destroy();
    return;
  }
  
  const labels = sortedResources.map(r => r.name.length > 20 ? r.name.substring(0, 20) + '...' : r.name);
  const values = sortedResources.map(r => {
    switch(sortBy) {
      case 'purchases': return r.purchases;
      case 'avgPrice': return r.avgPrice;
      default: return r.revenue;
    }
  });
  
  const colors = [
    'rgba(102,126,234,0.8)', 'rgba(118,75,162,0.8)', 'rgba(240,147,251,0.8)',
    'rgba(245,87,108,0.8)', 'rgba(255,107,107,0.8)', 'rgba(238,90,36,0.8)',
    'rgba(17,153,142,0.8)', 'rgba(56,239,125,0.8)', 'rgba(249,202,36,0.8)',
    'rgba(240,147,43,0.8)', 'rgba(99,102,241,0.8)', 'rgba(236,72,153,0.8)',
    'rgba(34,197,94,0.8)', 'rgba(251,146,60,0.8)', 'rgba(168,85,247,0.8)'
  ];
  
  const yAxisLabel = sortBy === 'purchases' ? 'Purchases' : sortBy === 'avgPrice' ? 'Avg Price (₹)' : 'Revenue (₹)';
  
  _barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: yAxisLabel,
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderColor: colors.slice(0, values.length).map(c => c.replace('0.8', '1')),
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { 
          callbacks: { 
            label: ctx => sortBy === 'purchases' ? ` ${ctx.raw} purchases` : ` ${fmt(ctx.raw)}`,
            title: ctx => sortedResources[ctx[0].dataIndex].name
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { 
            font: { size: 11 }, 
            color: '#94a3b8',
            callback: v => sortBy === 'purchases' ? v : '₹' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v)
          }
        },
        y: { 
          grid: { display: false },
          ticks: { 
            font: { size: 11, weight: '600' },
            color: '#64748b'
          }
        }
      }
    }
  });
}

function filterResourceChart() {
  const limitSelect = document.getElementById('resourceFilter')?.value;
  const sortSelect = document.getElementById('sortFilter')?.value;
  
  let limit = limitSelect === 'all' ? 'all' : parseInt(limitSelect.replace('top', ''));
  
  renderResourceChart(limit, sortSelect);
}

function renderCharts(available, totalGross, totalWithdrawn, platformFees, totalPending, purchases) {
  // ── Donut Chart ──
  const donutCtx = document.getElementById('donutChart')?.getContext('2d');
  if (donutCtx) {
    if (_donutChart) _donutChart.destroy();
    const labels  = ['Available', 'Withdrawn', 'Fees', 'Pending'];
    const values  = [available, totalWithdrawn, platformFees, totalPending];
    const colors  = ['#667eea', '#10b981', '#f59e0b', '#f5576c'];
    _donutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 3, borderColor: '#fff', hoverOffset: 8 }] },
      options: {
        cutout: '72%', responsive: true, maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)}` } }
        }
      }
    });
    // Center label
    const center = document.getElementById('donutCenter');
    if (center) center.innerHTML = `${fmt(totalGross)}<br><span style="font-size:10px;color:#94a3b8;font-weight:500;">Total Earned</span>`;
    // Legend
    const legend = document.getElementById('donutLegend');
    if (legend) legend.innerHTML = labels.map((l, i) =>
      `<div class="legend-item">
        <span class="legend-label"><span class="legend-dot" style="background:${colors[i]}"></span>${l}</span>
        <span class="legend-val">${fmt(values[i])}</span>
      </div>`).join('');
  }

  // ── Bar Chart - Revenue per Resources ──
  const barCtx = document.getElementById('barChart')?.getContext('2d');
  if (barCtx && purchases.length) {
    // Store all purchases data globally for date filtering
    _allPurchasesData = purchases;
    
    // Initial render with default filters (revenue)
    renderResourceChart(10, 'revenue');
  }
}
async function loadDashboard() {
  console.log('[Dashboard] loadDashboard() called');

  // Reset cards to shimmer state
  const shimmerCards = [
    { id: 'cardAvailable', subId: null },
    { id: 'cardRevenue',   subId: 'cardRevenueSub' },
    { id: 'cardWithdrawn', subId: 'cardWithdrawnSub' },
    { id: 'cardFees',      subId: null },
    { id: 'cardPending',   subId: null }
  ];
  shimmerCards.forEach(({ id, subId }) => {
    const el = document.getElementById(id);
    if (el) { el.className = 'shimmer shimmer-value'; el.textContent = ''; }
    const subEl = subId ? document.getElementById(subId) : el?.nextElementSibling;
    if (subEl) { subEl.className = 'shimmer shimmer-sub'; subEl.textContent = ''; }
  });
  document.querySelectorAll('.stat-card').forEach(c => c.classList.add('is-shimmer'));
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

    // ── Charts ──
    renderCharts(available, totalGross, totalWithdrawn, platformFees, totalPending, statsData.userStats || []);
    
    // Remove chart loader
    document.querySelectorAll('.chart-card.is-loading').forEach(c => c.classList.remove('is-loading'));

    const purchases = statsData.userStats || [];
    const tbody = document.getElementById('purchaseTbody');
    const pcEl = document.getElementById('purchaseCount');
    if (pcEl) pcEl.textContent = `${completedCount} records`;
    if (tbody) {
      // Remove thead shimmer
      const purchaseTable = tbody.closest('table');
      if (purchaseTable) {
        const thead = purchaseTable.querySelector('thead');
        if (thead) thead.classList.remove('is-loading');
      }
      
      tbody.innerHTML = !purchases.length
        ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📭</div><p>No purchases yet</p></div></td></tr>`
        : purchases.map((p, i) => `
          <tr class="mobile-table-row" data-index="${i}">
            <td colspan="6">
              <div class="mobile-cell">
                <span class="mobile-email">${p.email || '—'}</span>
                <span class="mobile-amount">${fmt(p.totalAmount)}</span>
                <button class="view-btn" onclick="showPurchaseDetails(${i})">View</button>
              </div>
            </td>
          </tr>
          <tr data-index="${i}">
            <td>${i + 1}</td>
            <td>${p.email || '—'}</td>
            <td>${(p.resources || []).join(', ') || '—'}</td>
            <td style="font-weight:700;color:#1e293b;">${fmt(p.totalAmount)}</td>
            <td><span class="badge badge-completed">completed</span></td>
            <td>${fmtDate(p.created_at)}</td>
          </tr>`).join('');
      
      // Store purchases data globally for modal access
      window.purchasesData = purchases;
    }

    // ── Withdrawals Table ──
    const wdTbody = document.getElementById('wdTbody');
    const wdEl = document.getElementById('wdCount');
    if (wdEl) wdEl.textContent = `${wdList.length} requests`;
    if (wdTbody) {
      // Remove thead shimmer
      const wdTable = wdTbody.closest('table');
      if (wdTable) {
        const thead = wdTable.querySelector('thead');
        if (thead) thead.classList.remove('is-loading');
      }
      
      wdTbody.innerHTML = !wdList.length
        ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div><p>No withdrawal requests yet</p></div></td></tr>`
        : wdList.map((w, i) => {
            const gross = parseFloat(w.amount || 0);
            const fee   = gross * 0.05;
            const net   = gross - fee;
            return `
              <tr class="mobile-table-row mobile-withdrawal-row" data-index="${i}">
                <td colspan="7">
                  <div class="mobile-cell">
                    <span class="mobile-email">${w.user_email || '—'}</span>
                    <span class="mobile-amount">${fmt(net)}</span>
                    <button class="view-btn" onclick="showWithdrawalDetails(${i})">View</button>
                  </div>
                </td>
              </tr>
              <tr data-index="${i}">
                <td>${i + 1}</td>
                <td>${w.user_email || '—'}</td>
                <td style="font-weight:700;color:#1e293b;">${fmt(gross)}</td>
                <td style="font-weight:700;color:#667eea;">${fmt(net)}</td>
                <td style="color:#ef4444;">-${fmt(fee)}</td>
                <td><span class="badge ${badgeClass(w.status)}">${w.status}</span></td>
                <td>${fmtDate(w.created_at)}</td>
              </tr>`;
          }).join('');
      
      // Store withdrawals data globally for modal access
      window.withdrawalsData = wdList;
    }

    // ── Sidebar admin info ──
    const adminBadge = document.querySelector('.admin-badge');
    if (adminBadge) adminBadge.classList.remove('is-loading');
    
    if (userEmail) {
      document.getElementById('adminEmail').textContent = userEmail;
      document.getElementById('adminAvatar').textContent = userEmail.charAt(0).toUpperCase();
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.email || 'admin@earnify.com';
        document.getElementById('adminEmail').textContent = email;
        document.getElementById('adminAvatar').textContent = email.charAt(0).toUpperCase();
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
  location.href = '/admin/login.html';
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}

function showPurchaseDetails(index) {
  const purchase = window.purchasesData?.[index];
  if (!purchase) return;
  
  const modalBody = document.getElementById('modalBody');
  const resources = (purchase.resources || []).join(', ') || '—';
  
  modalBody.innerHTML = `
    <div class="detail-row">
      <div class="detail-label"># Order Number</div>
      <div class="detail-value">${index + 1}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">📧 Buyer Email</div>
      <div class="detail-value">${purchase.email || '—'}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">📚 Resources Purchased</div>
      <div class="detail-value">${resources}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">💰 Total Amount</div>
      <div class="detail-value amount">${fmt(purchase.totalAmount)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">✅ Status</div>
      <div class="detail-value"><span class="badge badge-completed">completed</span></div>
    </div>
    <div class="detail-row">
      <div class="detail-label">📅 Purchase Date</div>
      <div class="detail-value">${fmtDate(purchase.created_at)}</div>
    </div>
  `;
  
  document.getElementById('detailsModal').classList.add('active');
}

function showWithdrawalDetails(index) {
  const withdrawal = window.withdrawalsData?.[index];
  if (!withdrawal) return;
  
  const modalBody = document.getElementById('modalBody');
  const gross = parseFloat(withdrawal.amount || 0);
  const fee = gross * 0.05;
  const net = gross - fee;
  
  modalBody.innerHTML = `
    <div class="detail-row">
      <div class="detail-label"># Request Number</div>
      <div class="detail-value">${index + 1}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">📧 User Email</div>
      <div class="detail-value">${withdrawal.user_email || '—'}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">💵 Gross Amount</div>
      <div class="detail-value">${fmt(gross)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">💰 Net Amount</div>
      <div class="detail-value amount">${fmt(net)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">📊 Platform Fee (5%)</div>
      <div class="detail-value" style="color:#ef4444;">-${fmt(fee)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">📊 Status</div>
      <div class="detail-value"><span class="badge ${badgeClass(withdrawal.status)}">${withdrawal.status}</span></div>
    </div>
    <div class="detail-row">
      <div class="detail-label">📅 Request Date</div>
      <div class="detail-value">${fmtDate(withdrawal.created_at)}</div>
    </div>
  `;
  
  document.getElementById('detailsModal').classList.add('active');
}

function closeDetailsModal() {
  document.getElementById('detailsModal').classList.remove('active');
}

// Close modal when clicking outside
document.getElementById('detailsModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'detailsModal') closeDetailsModal();
});

loadDashboard();
