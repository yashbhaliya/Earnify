const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000'
  : location.origin;

const SUPA_URL = 'https://emnrgsgerfjvndexomro.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjAyMTAsImV4cCI6MjA4Nzk5NjIxMH0.uXr8lipxLbB4D_5JwQkpLzc-HudQw23tOFBfV4C6hqY';
const db = window.supabase.createClient(SUPA_URL, SUPA_KEY);

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
  if (status === 'completed' || status === 'approved') return 'badge-approved';
  if (status === 'pending')   return 'badge-pending';
  return 'badge-rejected';
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

let _donutChart = null;
let _barChart   = null;
let _dayChart   = null;
let _dayWiseChart = null;
let _allResourceData = [];
let _allPurchasesData = [];
let _resourcePriceMap = {}; // title -> actual price from DB

function renderDayWiseChart(purchases, selectedMonth, selectedYear) {
  const dayWiseCtx = document.getElementById('dayWiseChart')?.getContext('2d');
  if (!dayWiseCtx) return;
  
  if (_dayWiseChart) _dayWiseChart.destroy();
  
  const now = new Date();
  const month = selectedMonth !== undefined ? selectedMonth : now.getMonth();
  const year = selectedYear !== undefined ? selectedYear : now.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const monthLabel = document.getElementById('currentMonth');
  if (monthLabel) {
    const date = new Date(year, month);
    monthLabel.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  
  const dailyRevenue = new Array(daysInMonth + 1).fill(0);
  
  if (purchases.length) {
    purchases.forEach(p => {
      const purchaseDate = new Date(p.created_at);
      if (purchaseDate.getMonth() === month && purchaseDate.getFullYear() === year) {
        const day = purchaseDate.getDate();
        const amount = parseFloat(p.totalAmount || 0);
        dailyRevenue[day] += amount;
      }
    });
  }
  
  const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
  const values = dailyRevenue.slice(1);
  
  _dayWiseChart = new Chart(dayWiseCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Revenue (₹)',
        data: values,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return '#EA2F4A';
          const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          grad.addColorStop(0, '#EF5835');
          grad.addColorStop(1, '#E29F17');
          return grad;
        },
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: { 
          callbacks: { 
            label: ctx => ` ${fmt(ctx.raw)}`,
            title: ctx => `Day ${ctx[0].label}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { 
            font: { size: 10 }, 
            color: '#94a3b8',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 31
          },
          title: {
            display: true,
            text: 'Day of Month',
            color: '#64748b',
            font: { size: 12, weight: '600' }
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            font: { size: 11 },
            color: '#94a3b8',
            stepSize: 500,
            callback: v => '\u20b9' + v.toLocaleString('en-IN')
          },
          title: {
            display: true,
            text: 'Revenue (\u20b9)',
            color: '#64748b',
            font: { size: 12, weight: '600' }
          }
        }
      }
    }
  });
}

function filterDayWiseChart() {
  const monthSelect = document.getElementById('monthFilter')?.value;
  const yearSelect = document.getElementById('yearFilter')?.value;
  
  const month = parseInt(monthSelect);
  const year = parseInt(yearSelect);
  
  renderDayWiseChart(_allPurchasesData, month, year);
}

function initializeDateFilters() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthSelect = document.getElementById('monthFilter');
  if (monthSelect) {
    monthSelect.value = currentMonth.toString();
  }
  
  const yearSelect = document.getElementById('yearFilter');
  if (yearSelect) {
    yearSelect.innerHTML = '';
    for (let y = currentYear; y >= currentYear - 5; y--) {
      const option = document.createElement('option');
      option.value = y;
      option.textContent = y;
      if (y === currentYear) option.selected = true;
      yearSelect.appendChild(option);
    }
  }
}

function renderDayChart(days = 7) {
  const dayCtx = document.getElementById('dayChart')?.getContext('2d');
  if (!dayCtx || !_allPurchasesData.length) return;
  
  if (_dayChart) _dayChart.destroy();
  
  // Group purchases by date
  const dayData = {};
  const today = new Date();
  const cutoffDate = days === 'all' ? new Date(0) : new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
  
  _allPurchasesData.forEach(p => {
    const date = new Date(p.created_at);
    if (date >= cutoffDate) {
      const dateKey = date.toISOString().split('T')[0];
      if (!dayData[dateKey]) dayData[dateKey] = 0;
      dayData[dateKey] += parseFloat(p.totalAmount || 0);
    }
  });
  
  // Sort by date and prepare data
  const sortedDates = Object.keys(dayData).sort();
  const labels = sortedDates.map(d => {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  });
  const values = sortedDates.map(d => dayData[d]);
  
  if (!labels.length) {
    if (_dayChart) _dayChart.destroy();
    return;
  }
  
  _dayChart = new Chart(dayCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Revenue',
        data: values,
        backgroundColor: 'rgba(102,126,234,0.1)',
        borderColor: '#667eea',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: { 
          callbacks: { 
            label: ctx => ` Revenue: ${fmt(ctx.raw)}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { 
            font: { size: 11 }, 
            color: '#94a3b8'
          }
        },
        y: { 
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { 
            font: { size: 11 },
            color: '#94a3b8',
            callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v)
          }
        }
      }
    }
  });
}

function filterDayChart() {
  const daySelect = document.getElementById('dayFilter')?.value;
  const days = daySelect === 'all' ? 'all' : parseInt(daySelect);
  renderDayChart(days);
}

function renderResourceChart(limit = 10, sortBy = 'revenue') {
  const barCtx = document.getElementById('barChart')?.getContext('2d');
  if (!barCtx || !_allPurchasesData.length) return;

  if (_barChart) _barChart.destroy();

  // Build per-resource stats using actual unit prices from _resourcePriceMap.
  // userStats is grouped by buyer: { resources: ['Title A','Title B'], totalAmount: X }
  // totalAmount = sum of individual resource prices for that buyer.
  // We look up each resource's real price instead of splitting totalAmount.
  const resourceData = {};
  _allPurchasesData.forEach(p => {
    const titles = (p.resources || []).filter(Boolean);
    titles.forEach(title => {
      const unitPrice = _resourcePriceMap[title] ?? 0;
      if (!resourceData[title]) resourceData[title] = { revenue: 0, purchases: 0, unitPrice };
      resourceData[title].revenue   += unitPrice;
      resourceData[title].purchases += 1;
    });
  });

  let sorted = Object.entries(resourceData).map(([name, d]) => ({
    name,
    revenue:   parseFloat(d.revenue.toFixed(2)),
    purchases: d.purchases,
    unitPrice: parseFloat(d.unitPrice.toFixed(2))
  }));

  switch (sortBy) {
    case 'purchases': sorted.sort((a, b) => b.purchases - a.purchases); break;
    case 'avgPrice':  sorted.sort((a, b) => b.unitPrice  - a.unitPrice); break;
    case 'name':      sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
    default:          sorted.sort((a, b) => b.revenue    - a.revenue);   break;
  }

  const limitNum = limit === 'all' ? sorted.length : Math.min(limit, sorted.length);
  sorted = sorted.slice(0, limitNum);
  if (!sorted.length) return;

  const labels = sorted.map(r => r.name.length > 22 ? r.name.substring(0, 22) + '...' : r.name);
  const values = sorted.map(r => {
    if (sortBy === 'purchases') return r.purchases;
    if (sortBy === 'avgPrice')  return r.unitPrice;
    return r.revenue;
  });

  // Build light linear gradient per bar
  const gradientPairs = [
    ['#EA2F4A','#D2ECF9'],
    ['#667eea','#c9d6ff'],
    ['#f093fb','#fde8ff'],
    ['#43e97b','#d4f7e7'],
    ['#fa709a','#ffd6e7'],
    ['#4facfe','#d6eeff'],
    ['#f7971e','#fde8c8'],
    ['#a18cd1','#ede0f7'],
    ['#11998e','#c8f0ec'],
    ['#f5576c','#fde0e3'],
    ['#764ba2','#e8d5f5'],
    ['#00b4db','#d0f0fb'],
    ['#e96c1e','#fde3d0'],
    ['#38ef7d','#d4fbe6'],
    ['#6a11cb','#ddd0f7']
  ];

  const gradientColors = gradientPairs.slice(0, values.length).map(([c1, c2]) => {
    const grad = barCtx.createLinearGradient(0, 0, 0, 320);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    return grad;
  });

  const borderColors = gradientPairs.slice(0, values.length).map(([c1]) => c1);

  const canvas = document.getElementById('barChart');
  const wrap = document.getElementById('barChartWrap');
  const h = 320;
  if (wrap) wrap.style.height = h + 'px';
  canvas.style.height = h + 'px';

  const isMoney = sortBy !== 'purchases';
  const axisLabel = sortBy === 'purchases' ? 'Purchases' : sortBy === 'avgPrice' ? 'Unit Price (₹)' : 'Total Revenue (₹)';

  _barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: axisLabel,
        data: values,
        backgroundColor: gradientColors,
        borderColor: borderColors,
        borderWidth: 0,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => sorted[ctx[0].dataIndex].name,
            label: ctx => {
              const r = sorted[ctx[0].dataIndex];
              if (sortBy === 'purchases') return ` ${r.purchases} sales • Unit price: ${fmt(r.unitPrice)}`;
              if (sortBy === 'avgPrice')  return ` Unit price: ${fmt(r.unitPrice)} • ${r.purchases} sales`;
              return ` Total: ${fmt(r.revenue)} • ${r.purchases} sales • ${fmt(r.unitPrice)}/unit`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 11, weight: '600' },
            color: '#64748b',
            maxRotation: 40,
            minRotation: 0,
            callback: function(val) {
              const label = this.getLabelForValue(val);
              return label.length > 14 ? label.substring(0, 14) + '...' : label;
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            font: { size: 11 },
            color: '#94a3b8',
            callback: v => isMoney ? ('₹' + (v >= 1000 ? (v/1000).toFixed(1) + 'k' : v)) : v
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
    _allPurchasesData = purchases;
    // Fetch actual resource prices from API to build title->price map
    apiFetch('/api/resources').then(resources => {
      _resourcePriceMap = {};
      (resources || []).forEach(r => {
        if (r.title) _resourcePriceMap[r.title] = parseFloat(r.price || 0);
      });
      renderResourceChart(10, 'revenue');
    }).catch(() => {
      // Fallback: render without price map (bars will show 0 for unknown resources)
      renderResourceChart(10, 'revenue');
    });
  }
  
  // ── Day-wise Revenue Chart ──
  const dayCtx = document.getElementById('dayChart')?.getContext('2d');
  if (dayCtx && purchases.length) {
    renderDayChart(7);
  }
  
  // ── Day-wise Monthly Chart ──
  const dayWiseCtx = document.getElementById('dayWiseChart')?.getContext('2d');
  if (dayWiseCtx) {
    initializeDateFilters();
    renderDayWiseChart(purchases);
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
    const [statsData, wdResult] = await Promise.all([
      userEmail ? apiFetch(`/api/statistics/purchases/${encodeURIComponent(userEmail)}`) : Promise.resolve({}),
      userEmail ? db.from('withdrawals').select('*').eq('user_email', userEmail).order('created_at', { ascending: false }) : Promise.resolve({ data: [] })
    ]);

    console.log('[Dashboard] statsData =>', statsData);

    const totalGross     = parseFloat(statsData.totalGross || 0);
    const wdList         = wdResult.data || [];
    console.log('[Dashboard] withdrawals from Supabase =>', wdList);

    // Net = gross * 0.95 (after 5% fee)
    const totalWithdrawn = wdList
      .filter(w => w.status === 'approved' || w.status === 'completed')
      .reduce((s, w) => s + parseFloat(w.amount || 0) * 0.95, 0);
    const totalPending   = wdList
      .filter(w => w.status === 'pending')
      .reduce((s, w) => s + parseFloat(w.amount || 0) * 0.95, 0);
    const platformFees   = wdList
      .filter(w => ['approved','completed','pending'].includes(w.status))
      .reduce((s, w) => s + parseFloat(w.amount || 0) * 0.05, 0);
    const available      = Math.max(0, totalGross - totalWithdrawn - totalPending - platformFees);
    const completedCount = statsData.totalPurchases || 0;
    const approvedCount  = wdList.filter(w => w.status === 'approved' || w.status === 'completed').length;
    const pendingCount   = wdList.filter(w => w.status === 'pending').length;

    console.log('[Dashboard] computed =>', { totalGross, totalWithdrawn, totalPending, platformFees, available });

    // ── Stat Cards ──
    const cardData = [
      { id: 'cardAvailable', value: fmt(available), sub: 'Ready to withdraw', subId: null },
      { id: 'cardRevenue',   value: fmt(totalGross), sub: `${completedCount} completed sales`, subId: 'cardRevenueSub' },
      { id: 'cardWithdrawn', value: fmt(totalWithdrawn), sub: `${approvedCount} approved • net after 5% fee`, subId: 'cardWithdrawnSub' },
      { id: 'cardFees',      value: fmt(platformFees),   sub: '5% of all withdrawal requests', subId: null },
      { id: 'cardPending',   value: fmt(totalPending),   sub: `${pendingCount} pending • net after 5% fee`, subId: null }
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
            const reasonCell = w.reject_reason
              ? `<div style="display:flex;align-items:flex-start;gap:5px;max-width:160px;">
                   <span style="color:#dc2626;flex-shrink:0;">⚠</span>
                   <span style="font-size:12px;font-weight:600;color:#991b1b;line-height:1.4;word-break:break-word;">${w.reject_reason}</span>
                 </div>`
              : `<span style="color:#cbd5e1;">—</span>`;
            const mobileReason = w.reject_reason
              ? `<div style="margin-top:6px;padding:7px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;display:flex;align-items:flex-start;gap:6px;">
                   <span style="font-size:12px;color:#dc2626;flex-shrink:0;">⚠</span>
                   <span style="font-size:12px;font-weight:600;color:#991b1b;line-height:1.4;">${w.reject_reason}</span>
                 </div>`
              : '';
            return `
              <tr class="mobile-table-row mobile-withdrawal-row" data-index="${i}">
                <td colspan="8">
                  <div class="mobile-cell">
                    <span class="mobile-email">${w.user_email || '—'}</span>
                    <span class="mobile-amount">${fmt(net)}</span>
                    <button class="view-btn" onclick="showWithdrawalDetails(${i})">View</button>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                    <span class="badge ${badgeClass(w.status)}" style="font-size:10px;">${w.status}</span>
                    <span style="font-size:11px;color:#94a3b8;">${fmtDate(w.created_at)}</span>
                  </div>
                  ${mobileReason}
                </td>
              </tr>
              <tr data-index="${i}">
                <td>${i + 1}</td>
                <td>${w.user_email || '—'}</td>
                <td style="font-weight:700;color:#1e293b;">${fmt(gross)}</td>
                <td style="font-weight:700;color:#667eea;">${fmt(net)}</td>
                <td style="color:#ef4444;">-${fmt(fee)}</td>
                <td><span class="badge ${badgeClass(w.status)}">${w.status}</span></td>
                <td>${reasonCell}</td>
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
    ${withdrawal.reject_reason ? `
    <div style="padding:12px 14px;background:#fef2f2;border:1.5px solid #fecaca;border-radius:12px;">
      <div style="font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;">⚠ Rejection Reason</div>
      <div style="font-size:13px;font-weight:600;color:#991b1b;line-height:1.5;">${withdrawal.reject_reason}</div>
    </div>` : ''}
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
