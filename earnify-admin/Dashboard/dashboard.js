const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000'
  : location.origin;

const SUPA_URL = 'https://emnrgsgerfjvndexomro.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQyMDIxMCwiZXhwIjoyMDg3OTk2MjEwfQ.mr4k_GsJ14CC1mqvEZgf9cTaNiLMlnj_sZxFjJud67k';

// Single isolated client â€” storageKey prevents GoTrueClient conflicts with other scripts
const db = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
  auth: { storageKey: 'earnify-dashboard', persistSession: false, autoRefreshToken: false }
});

// XSS sanitizer
function esc(str) {
  if (str == null) return 'â€”';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Decode base64url JWT â€” synchronous, no network needed
function decodeJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
  } catch(e) { return null; }
}

// Get email synchronously â€” works on both local and Vercel
function getUserEmail() {
  // 1. adminToken JWT (Vercel: login.html stores only this)
  const token = localStorage.getItem('adminToken');
  if (token) {
    const p = decodeJwtPayload(token);
    if (p?.email) { console.log('[Dashboard] email from adminToken =>', p.email); return p.email; }
  }
  // 2. currentUser (local dev: auth-modal stores this)
  try {
    const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (cu?.email) { console.log('[Dashboard] email from currentUser =>', cu.email); return cu.email; }
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
  return 'â‚¹' + parseFloat(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
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
  if (!d) return 'â€”';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

let _donutChart = null;
let _barChart   = null;
let _dayChart   = null;
let _dayWiseChart = null;
let _allResourceData = [];
let _allPurchasesData = [];   // used by day-wise chart (flat payment records)
let _barChartData = [];       // used exclusively by bar chart (per-payment with resource title)
let _resourcePriceMap = {};
let _resourceTypeMap  = {};

function renderDayWiseChart(purchases, selectedMonth, selectedYear) {
  const canvas = document.getElementById('dayWiseChart');
  const dayWiseCtx = canvas?.getContext('2d');
  if (!dayWiseCtx) return;

  if (_dayWiseChart) { _dayWiseChart.destroy(); _dayWiseChart = null; }

  const wrap = canvas.parentElement;
  wrap.querySelectorAll('.dw-empty').forEach(e => e.remove());

  const now = new Date();
  let month = selectedMonth !== undefined ? selectedMonth : now.getMonth();
  let year  = selectedYear  !== undefined ? selectedYear  : now.getFullYear();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName   = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthLabel  = document.getElementById('currentMonth');
  if (monthLabel) monthLabel.textContent = monthName;

  const dailyRevenue = new Array(daysInMonth + 1).fill(0);
  let total = 0;
  (purchases || []).forEach(p => {
    const d = new Date(p.created_at);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const amt = parseFloat(p.totalAmount || 0);
      dailyRevenue[d.getDate()] += amt;
      total += amt;
    }
  });

  if (total === 0) {
    canvas.style.display = 'none';
    const empty = document.createElement('div');
    empty.className = 'dw-empty';
    empty.innerHTML = `
      <div style="text-align:center;padding:52px 20px;">
        <div style="font-size:52px;opacity:.3;margin-bottom:14px;">ðŸ“­</div>
        <div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:6px;">No Revenue for ${monthName}</div>
        <div style="font-size:13px;color:#94a3b8;">No completed sales recorded for this month.</div>
        <div style="font-size:12px;color:#b0b8c8;margin-top:4px;">Select a different month from the filter above.</div>
      </div>`;
    wrap.appendChild(empty);
    return;
  }

  canvas.style.display = '';
  const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
  const values = dailyRevenue.slice(1);

  _dayWiseChart = new Chart(dayWiseCtx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Revenue', data: values,
      backgroundColor: (ctx) => { const { ctx: c, chartArea } = ctx.chart; if (!chartArea) return '#EF5835'; const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom); grad.addColorStop(0, '#EF5835'); grad.addColorStop(1, '#E29F17'); return grad; },
      borderColor: 'transparent', borderWidth: 0, borderRadius: 8, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.raw)}`, title: ctx => `Day ${ctx[0].label}` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8', maxRotation: 0, autoSkip: true, maxTicksLimit: 31 }, title: { display: true, text: 'Day of Month', color: '#64748b', font: { size: 12, weight: '600' } } },
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, color: '#94a3b8', stepSize: 500, callback: v => String.fromCharCode(8377) + v.toLocaleString('en-IN') }, title: { display: true, text: 'Revenue', color: '#64748b', font: { size: 12, weight: '600' } } }
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
            callback: v => 'â‚¹' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v)
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

function renderResourceChart(limit = 10) {
  const canvas  = document.getElementById('resourceDonutChart');
  const emptyEl = document.getElementById('resourceDonutEmpty');
  const legend  = document.getElementById('resourceDonutLegend');
  const center  = document.getElementById('resourceDonutCenter');
  if (!canvas) return;

  if (_barChart) { _barChart.destroy(); _barChart = null; }

  // Build per-resource revenue
  const resourceData = {};
  _barChartData.forEach(p => {
    const title = p.resourceTitle;
    if (!title) return;
    const unitPrice = _resourcePriceMap[title] ?? p.unitPrice ?? 0;
    if (!resourceData[title]) resourceData[title] = { revenue: 0, purchases: 0 };
    resourceData[title].revenue   += unitPrice;
    resourceData[title].purchases += 1;
  });

  let sorted = Object.entries(resourceData)
    .map(([name, d]) => ({ name, revenue: parseFloat(d.revenue.toFixed(2)), purchases: d.purchases }))
    .sort((a, b) => b.revenue - a.revenue);

  if (!sorted.length) {
    canvas.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    if (legend)  legend.innerHTML = '';
    return;
  }
  canvas.style.display = '';
  if (emptyEl) emptyEl.style.display = 'none';

  const limitNum = (limit === 'all' || isNaN(Number(limit))) ? sorted.length : Math.min(Number(limit), sorted.length);
  const top    = sorted.slice(0, limitNum);
  const others = sorted.slice(limitNum);
  if (others.length) {
    top.push({ name: 'Others', revenue: others.reduce((s, r) => s + r.revenue, 0), purchases: others.reduce((s, r) => s + r.purchases, 0) });
  }

  const PALETTE = ['#667eea','#10b981','#f59e0b','#f5576c','#06b6d4','#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16','#94a3b8'];
  const labels  = top.map(r => r.name);
  const values  = top.map(r => r.revenue);
  const colors  = top.map((_, i) => PALETTE[i % PALETTE.length]);
  const total   = values.reduce((s, v) => s + v, 0);

  const ctx = canvas.getContext('2d');
  _barChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 3, borderColor: '#fff', hoverOffset: 10 }] },
    options: {
      cutout: '70%',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const r = top[ctx.dataIndex];
              const pct = total > 0 ? ((r.revenue / total) * 100).toFixed(1) : 0;
              return ` ${fmt(r.revenue)}  (${pct}%)  â€¢  ${r.purchases} sales`;
            }
          }
        }
      }
    }
  });

  if (center) center.innerHTML = `${fmt(total)}<br><span style="font-size:10px;color:#94a3b8;font-weight:500;">Total Revenue</span>`;

  if (legend) legend.innerHTML = top.map((r, i) => {
    const pct = total > 0 ? ((r.revenue / total) * 100).toFixed(1) : 0;
    const label = r.name.length > 22 ? r.name.substring(0, 22) + 'â€¦' : r.name;
    return `<div class="legend-item">
      <span class="legend-label"><span class="legend-dot" style="background:${colors[i]}"></span>${label}</span>
      <span class="legend-val">${fmt(r.revenue)} <span style="font-size:10px;color:#94a3b8;font-weight:500;">${pct}%</span></span>
    </div>`;
  }).join('');
}

function filterResourceChart() {
  const limitVal = document.getElementById('resourceFilter')?.value || 'top10';
  const limit    = limitVal === 'all' ? 'all' : parseInt(limitVal.replace('top', ''));
  renderResourceChart(limit);
}

function renderCharts(available, totalGross, totalWithdrawn, platformFees, totalPending, purchases, userEmail) {
  // â”€â”€ Donut Chart â”€â”€
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

  // â”€â”€ Resource Donut Chart â”€â”€
  const resCtx = document.getElementById('resourceDonutChart')?.getContext('2d');
  if (resCtx) {
    db.from('resources').select('id, title, price, type').eq('user_email', userEmail)
      .then(async ({ data: resources }) => {
        _resourcePriceMap = {};
        _resourceTypeMap  = {};
        (resources || []).forEach(r => {
          if (r.title) {
            _resourcePriceMap[r.title] = parseFloat(r.price || 0);
            _resourceTypeMap[r.title]  = (r.type || 'other').toLowerCase();
          }
        });

        // Fetch per-payment records for accurate per-resource counts
        const resourceIds = (resources || []).map(r => r.id);
        if (!resourceIds.length) { renderResourceChart(10, 'revenue'); return; }

        const { data: payments } = await db.from('payments')
          .select('resource_id')
          .eq('status', 'completed')
          .in('resource_id', resourceIds);

        const idToResource = {};
        (resources || []).forEach(r => { idToResource[r.id] = r; });

        _barChartData = (payments || []).map(p => {
          const r = idToResource[p.resource_id];
          return { resourceTitle: r?.title || '', unitPrice: parseFloat(r?.price || 0) };
        }).filter(p => p.resourceTitle);

        renderResourceChart(10, 'revenue');
      }).catch(() => renderResourceChart(10, 'revenue'));
  }
  
  // â”€â”€ Day-wise Revenue Chart â”€â”€
  const dayCtx = document.getElementById('dayChart')?.getContext('2d');
  if (dayCtx && purchases.length) {
    renderDayChart(7);
  }
  
  // â”€â”€ Day-wise Monthly Chart â”€â”€
  const dayWiseCtx = document.getElementById('dayWiseChart')?.getContext('2d');
  if (dayWiseCtx) {
    initializeDateFilters();
    // Fetch individual payment records filtered by this user's resources
    db.from('resources')
      .select('id, price')
      .eq('user_email', userEmail)
      .then(async ({ data: resources }) => {
        if (!resources || !resources.length) { renderDayWiseChart([], undefined, undefined); return; }
        const priceMap = {};
        const resourceIds = resources.map(r => { priceMap[r.id] = parseFloat(r.price || 0); return r.id; });
        const { data: payments } = await db.from('payments')
          .select('created_at, resource_id')
          .eq('status', 'completed')
          .in('resource_id', resourceIds);
        if (!payments || !payments.length) { renderDayWiseChart([], undefined, undefined); return; }
        const flat = payments.map(p => ({
          created_at: p.created_at,
          totalAmount: priceMap[p.resource_id] || 0
        }));
        _allPurchasesData = flat;
        // Sync dropdowns to current selection before rendering
        const ms = document.getElementById('monthFilter');
        const ys = document.getElementById('yearFilter');
        const month = ms ? parseInt(ms.value) : new Date().getMonth();
        const year  = ys ? parseInt(ys.value)  : new Date().getFullYear();
        renderDayWiseChart(flat, month, year);
      })
      .catch(() => renderDayWiseChart(purchases));
  }
}
async function loadDashboard() {
  console.log('[Dashboard] loadDashboard() called');

  // Reset chart data on each load
  _barChartData = [];
  _resourcePriceMap = {};
  _resourceTypeMap  = {};
  if (_barChart) { _barChart.destroy(); _barChart = null; }
  if (_donutChart) { _donutChart.destroy(); _donutChart = null; }
  if (_dayWiseChart) { _dayWiseChart.destroy(); _dayWiseChart = null; }

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
  const userEmail = getUserEmail();
  console.log('[Dashboard] userEmail =>', userEmail);

  try {
    console.log('[Dashboard] fetching stats for =>', userEmail);

    // Fetch everything directly from Supabase â€” no Node server needed
    const [resourcesResult, wdResult] = await Promise.all([
      userEmail ? db.from('resources').select('id, title, price').eq('user_email', userEmail) : Promise.resolve({ data: [] }),
      userEmail ? db.from('withdrawals').select('*').eq('user_email', userEmail).order('created_at', { ascending: false }) : Promise.resolve({ data: [] })
    ]);

    const userResources = resourcesResult.data || [];
    const resourceIds   = userResources.map(r => r.id);
    const priceMap      = {};
    const titleMap      = {};
    userResources.forEach(r => { priceMap[r.id] = parseFloat(r.price || 0); titleMap[r.id] = r.title; });

    // Fetch completed payments for this user's resources
    let relevantPayments = [];
    if (resourceIds.length) {
      const { data: payments } = await db.from('payments')
        .select('user_id, resource_id, created_at')
        .eq('status', 'completed')
        .in('resource_id', resourceIds);
      relevantPayments = payments || [];
    }

    // Resolve buyer emails from user_ids via Supabase auth admin
    let userEmailMap = {};
    try {
      const uniqueUserIds = [...new Set(relevantPayments.map(p => p.user_id).filter(Boolean))];
      if (uniqueUserIds.length) {
        // Fetch user emails in parallel (max 50 at a time to avoid large requests)
        const chunks = [];
        for (let i = 0; i < uniqueUserIds.length; i += 50) chunks.push(uniqueUserIds.slice(i, i + 50));
        for (const chunk of chunks) {
          const { data: uRows } = await db.from('payments')
            .select('user_id')
            .in('user_id', chunk)
            .limit(1); // just a probe â€” actual email lookup below
          // Use Supabase auth admin API via service-role client
          const res = await fetch(`${SUPA_URL}/auth/v1/admin/users?per_page=1000`, {
            headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
          });
          if (res.ok) {
            const json = await res.json();
            (json.users || []).forEach(u => { if (u.id && u.email) userEmailMap[u.id] = u.email; });
          }
          break; // one fetch gets all users
        }
      }
    } catch(e) { console.warn('[Dashboard] email lookup failed =>', e.message); }

    // Build one row per payment (each resource purchase = separate row)
    const purchases = relevantPayments.map(p => ({
      email:      userEmailMap[p.user_id] || p.user_id || 'â€”',
      resource:   titleMap[p.resource_id] || 'â€”',
      amount:     priceMap[p.resource_id] || 0,
      created_at: p.created_at
    }));

    const totalGross = relevantPayments.reduce((s, p) => s + (priceMap[p.resource_id] || 0), 0);
    const statsData  = {
      totalGross,
      totalPurchases: relevantPayments.length,
      userStats: purchases
    };

    console.log('[Dashboard] statsData =>', statsData);

    const wdList = wdResult.data || [];
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

    // â”€â”€ Stat Cards â”€â”€
    const cardData = [
      { id: 'cardAvailable', value: fmt(available), sub: 'Ready to withdraw', subId: null },
      { id: 'cardRevenue',   value: fmt(totalGross), sub: `${completedCount} completed sales`, subId: 'cardRevenueSub' },
      { id: 'cardWithdrawn', value: fmt(totalWithdrawn), sub: `${approvedCount} approved â€¢ net after 5% fee`, subId: 'cardWithdrawnSub' },
      { id: 'cardFees',      value: fmt(platformFees),   sub: '5% of all withdrawal requests', subId: null },
      { id: 'cardPending',   value: fmt(totalPending),   sub: `${pendingCount} pending â€¢ net after 5% fee`, subId: null }
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

    // â”€â”€ Charts â”€â”€
    renderCharts(available, totalGross, totalWithdrawn, platformFees, totalPending, statsData.userStats || [], userEmail);
    
    // Remove chart loader
    document.querySelectorAll('.chart-card.is-loading').forEach(c => c.classList.remove('is-loading'));

    const purchaseRows = statsData.userStats || [];
    const tbody = document.getElementById('purchaseTbody');
    const pcEl = document.getElementById('purchaseCount');
    if (pcEl) pcEl.textContent = `${completedCount} records`;
    if (tbody) {
      const purchaseTable = tbody.closest('table');
      if (purchaseTable) {
        const thead = purchaseTable.querySelector('thead');
        if (thead) thead.classList.remove('is-loading');
      }
      
      tbody.innerHTML = !purchaseRows.length
        ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">ðŸ“­</div><p>No purchases yet</p></div></td></tr>`
        : purchaseRows.map((p, i) => `
          <tr class="mobile-table-row" data-index="${i}">
            <td colspan="6">
              <div class="mobile-cell">
                <span class="mobile-email">${esc(p.email)}</span>
                <span class="mobile-amount">${fmt(p.amount)}</span>
                <button class="view-btn" onclick="showPurchaseDetails(${i})">View</button>
              </div>
            </td>
          </tr>
          <tr data-index="${i}">
            <td>${i + 1}</td>
            <td>${esc(p.email)}</td>
            <td>${esc(p.resource)}</td>
            <td style="font-weight:700;color:#1e293b;">${fmt(p.amount)}</td>
            <td><span class="badge badge-completed">completed</span></td>
            <td>${fmtDate(p.created_at)}</td>
          </tr>`).join('');
      
      window.purchasesData = purchaseRows;
    }

    // â”€â”€ Withdrawals Table â”€â”€
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
        ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">ðŸ“­</div><p>No withdrawal requests yet</p></div></td></tr>`
        : wdList.map((w, i) => {
            const gross = parseFloat(w.amount || 0);
            const fee   = gross * 0.05;
            const net   = gross - fee;
            const reasonCell = w.reject_reason
              ? `<button onclick="showRejectReason('${w.reject_reason.replace(/'/g, "&#39;").replace(/"/g, '&quot;')}')" style="padding:4px 12px;background:white;border:1.5px solid #667eea;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">View</button>`
              : `<span style="color:#cbd5e1;font-size:13px;">â€”</span>`;
            const mobileReason = w.reject_reason
              ? `<div style="margin-top:6px;">
                   <button onclick="showRejectReason('${w.reject_reason.replace(/'/g, "&#39;").replace(/"/g, '&quot;')}')" style="display:none;padding:5px 14px;background:white;border:1.5px solid #667eea;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">âš  View Reason</button>
                 </div>`
              : '';
            return `
              <tr class="mobile-table-row mobile-withdrawal-row" data-index="${i}">
                <td colspan="8">
                  <div class="mobile-cell">
                    <span class="mobile-email">${esc(w.user_email)}</span>
                    <span class="mobile-amount">${fmt(net)}</span>
                    <button class="view-btn" onclick="showWithdrawalDetails(${i})">View</button>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                    <span class="badge ${badgeClass(w.status)}" style="font-size:10px;">${esc(w.status)}</span>
                    <span style="font-size:11px;color:#94a3b8;">${fmtDate(w.created_at)}</span>
                  </div>
                  ${mobileReason}
                </td>
              </tr>
              <tr data-index="${i}">
                <td>${i + 1}</td>
                <td>${esc(w.user_email)}</td>
                <td style="font-weight:700;color:#1e293b;">${fmt(gross)}</td>
                <td style="font-weight:700;color:#667eea;">${fmt(net)}</td>
                <td style="color:#ef4444;">-${fmt(fee)}</td>
                <td><span class="badge ${badgeClass(w.status)}"${w.status === 'pending' ? ' style="cursor:pointer;" onclick="location.href=\'/earnify-admin/payments/\'" title="Click to review"' : ''}>${w.status}</span></td>
                <td>${reasonCell}</td>
                <td>${fmtDate(w.created_at)}</td>
              </tr>`;
          }).join('');
      
      // Store withdrawals data globally for modal access
      window.withdrawalsData = wdList;
    }

    // â”€â”€ Sidebar admin info â”€â”€
    const adminBadge = document.querySelector('.admin-badge');
    if (adminBadge) adminBadge.classList.remove('is-loading');
    
    if (userEmail) {
      document.getElementById('adminEmail').textContent = userEmail;
      document.getElementById('adminAvatar').textContent = userEmail.charAt(0).toUpperCase();
    } else if (token) {
      const payload = decodeJwtPayload(token);
      const email = payload?.email || 'admin@earnify.com';
      document.getElementById('adminEmail').textContent = email;
      document.getElementById('adminAvatar').textContent = email.charAt(0).toUpperCase();
    }

    console.log('[Dashboard] âœ… done');

  } catch (err) {
    console.error('[Dashboard] âŒ loadDashboard error =>', err);
    console.error('[Dashboard] error stack =>', err.stack);
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = `âš ï¸ ${err.message}`; }
  }
}

function logout() {
  localStorage.clear();
  sessionStorage.clear();
  location.href = '/';
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}

function showPurchaseDetails(index) {
  const purchase = window.purchasesData?.[index];
  if (!purchase) return;
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="detail-row">
      <div class="detail-label"># Order Number</div>
      <div class="detail-value">${index + 1}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">ðŸ“§ Buyer Email</div>
      <div class="detail-value">${esc(purchase.email)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">ðŸ“š Resource Purchased</div>
      <div class="detail-value">${esc(purchase.resource)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">ðŸ’° Amount</div>
      <div class="detail-value amount">${fmt(purchase.amount)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">âœ… Status</div>
      <div class="detail-value"><span class="badge badge-completed">completed</span></div>
    </div>
    <div class="detail-row">
      <div class="detail-label">ðŸ“… Purchase Date</div>
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
      <div class="detail-label">ðŸ“§ User Email</div>
      <div class="detail-value">${esc(withdrawal.user_email)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">ðŸ’µ Gross Amount</div>
      <div class="detail-value">${fmt(gross)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">ðŸ’° Net Amount</div>
      <div class="detail-value amount">${fmt(net)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">ðŸ“Š Platform Fee (5%)</div>
      <div class="detail-value" style="color:#ef4444;">-${fmt(fee)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">ðŸ“Š Status</div>
      <div class="detail-value"><span class="badge ${badgeClass(withdrawal.status)}">${withdrawal.status}</span></div>
    </div>
    <div class="detail-row">
      <div class="detail-label">ðŸ“… Request Date</div>
      <div class="detail-value">${fmtDate(withdrawal.created_at)}</div>
    </div>
    ${withdrawal.reject_reason ? `
    <div style="padding:12px 14px;background:#fef2f2;border:1.5px solid #fecaca;border-radius:12px;">
      <div style="font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;">âš  Rejection Reason</div>
      <div style="font-size:13px;font-weight:600;color:#991b1b;line-height:1.5;">${withdrawal.reject_reason}</div>
    </div>` : ''}
  `;
  
  document.getElementById('detailsModal').classList.add('active');
}

function showRejectReason(reason) {
  document.getElementById('rejectReasonText').textContent = reason;
  document.getElementById('rejectReasonModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeRejectReasonModal() {
  document.getElementById('rejectReasonModal').classList.remove('active');
  document.body.style.overflow = '';
}

function closeDetailsModal() {
  document.getElementById('detailsModal').classList.remove('active');
}

// Close modal when clicking outside
document.getElementById('detailsModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'detailsModal') closeDetailsModal();
});

loadDashboard();
