// On Live Server (5500) use Vercel production API, on Node server (5000) use local
const API_BASE = (location.hostname === '127.0.0.1' || location.hostname === 'localhost')
  ? (location.port === '5500' ? 'https://earnify-gamma.vercel.app' : 'http://127.0.0.1:5000')
  : location.origin;

function esc(str) {
  if (str == null) return '—';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function decodeJwtPayload(token) {
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); } catch(e) { return null; }
}

function getUserEmail() {
  const token = localStorage.getItem('adminToken');
  if (token) { const p = decodeJwtPayload(token); if (p?.email) return p.email; }
  try { const cu = JSON.parse(localStorage.getItem('currentUser') || '{}'); if (cu?.email) return cu.email; } catch(e) {}
  return null;
}

async function apiFetch(path) {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(API_BASE + path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json();
}

function fmt(n) {
  return '₹' + parseFloat(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function badgeClass(status) {
  if (status === 'completed' || status === 'approved') return 'badge-approved';
  if (status === 'pending') return 'badge-pending';
  return 'badge-rejected';
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

let _donutChart = null, _barChart = null, _dayWiseChart = null;
let _allPurchasesData = [];
let _barChartData = [];
let _purchasePage = 1;
let _purchasePageSize = 10;
let _wdPage = 1;
let _wdPageSize = 10;

function renderPurchasesTable() {
  const tbody = document.getElementById('purchaseTbody');
  const pcEl  = document.getElementById('purchaseCount');
  const completedPurchases = window.purchasesData || [];
  const total = completedPurchases.length;

  const pageSize = _purchasePageSize === 'all' ? total : _purchasePageSize;
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;
  _purchasePage = Math.min(_purchasePage, totalPages || 1);

  const start = (_purchasePage - 1) * pageSize;
  const slice = _purchasePageSize === 'all' ? completedPurchases : completedPurchases.slice(start, start + pageSize);

  if (pcEl) pcEl.textContent = `${total} records`;

  if (!tbody) return;
  tbody.closest('table')?.querySelector('thead')?.classList.remove('is-loading');

  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📭</div><p>No purchases yet</p></div></td></tr>`;
  } else {
    tbody.innerHTML = slice.map((p, i) => {
      const globalIndex = start + i;
      const email  = esc(p.buyer_email || '—');
      const res    = esc(p.resource_title || '—');
      const amount = fmt(p.resource_price || p.amount || 0);
      return `
        <tr class="mobile-table-row" data-index="${globalIndex}">
          <td colspan="6">
            <div class="mobile-cell">
              <span class="mobile-email">${email}</span>
              <span class="mobile-amount">${amount}</span>
              <button class="view-btn" onclick="showPurchaseDetails(${globalIndex})">View</button>
            </div>
          </td>
        </tr>
        <tr data-index="${globalIndex}">
          <td>${globalIndex + 1}</td>
          <td>${email}</td>
          <td>${res}</td>
          <td style="font-weight:700;color:#1e293b;">${amount}</td>
          <td><span class="badge badge-completed">completed</span></td>
          <td>${fmtDate(p.created_at)}</td>
        </tr>`;
    }).join('');
  }

  // Pagination controls
  let paginationEl = document.getElementById('purchasePagination');
  if (!paginationEl) {
    paginationEl = document.createElement('div');
    paginationEl.id = 'purchasePagination';
    tbody.closest('.table-card').appendChild(paginationEl);
  }

  if (_purchasePageSize === 'all' || totalPages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }

  const isDark = document.body.classList.contains('dark-mode');
  const btnBase = `padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;border:1.5px solid #e2e8f0;background:#f8fafc;color:#64748b;transition:all .2s;`;
  const btnActive = `padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;border:none;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;`;

  let pages = '';
  const range = 2;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= _purchasePage - range && p <= _purchasePage + range)) {
      pages += `<button onclick="goToPurchasePage(${p})" style="${p === _purchasePage ? btnActive : btnBase}">${p}</button>`;
    } else if (p === _purchasePage - range - 1 || p === _purchasePage + range + 1) {
      pages += `<span style="padding:0 4px;color:#94a3b8;">…</span>`;
    }
  }

  paginationEl.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-top:1px solid #f1f5f9;flex-wrap:wrap;gap:8px;">
      <span style="font-size:12px;color:#94a3b8;font-weight:500;">Showing ${start + 1}–${Math.min(start + pageSize, total)} of ${total}</span>
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
        <button onclick="goToPurchasePage(${_purchasePage - 1})" ${_purchasePage === 1 ? 'disabled' : ''} style="${btnBase}opacity:${_purchasePage === 1 ? '.4' : '1'};">‹ Prev</button>
        ${pages}
        <button onclick="goToPurchasePage(${_purchasePage + 1})" ${_purchasePage === totalPages ? 'disabled' : ''} style="${btnBase}opacity:${_purchasePage === totalPages ? '.4' : '1'};">Next ›</button>
      </div>
    </div>`;
}

function goToPurchasePage(page) {
  const total = (window.purchasesData || []).length;
  const pageSize = _purchasePageSize === 'all' ? total : _purchasePageSize;
  const totalPages = Math.ceil(total / pageSize) || 1;
  _purchasePage = Math.max(1, Math.min(page, totalPages));
  renderPurchasesTable();
}

function changePurchasePageSize() {
  const val = document.getElementById('purchasePageSize')?.value;
  _purchasePageSize = val === 'all' ? 'all' : parseInt(val);
  _purchasePage = 1;
  renderPurchasesTable();
}

function renderWithdrawalsTable() {
  const tbody = document.getElementById('wdTbody');
  const wdEl  = document.getElementById('wdCount');
  const allWd = window.withdrawalsData || [];
  const total = allWd.length;

  const pageSize = _wdPageSize === 'all' ? total : _wdPageSize;
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;
  _wdPage = Math.min(_wdPage, totalPages || 1);

  const start = (_wdPage - 1) * pageSize;
  const slice = _wdPageSize === 'all' ? allWd : allWd.slice(start, start + pageSize);

  if (wdEl) wdEl.textContent = `${total} requests`;
  if (!tbody) return;
  tbody.closest('table')?.querySelector('thead')?.classList.remove('is-loading');

  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📭</div><p>No withdrawal requests yet</p></div></td></tr>`;
  } else {
    tbody.innerHTML = slice.map((w, i) => {
      const globalIndex = start + i;
      const gross = parseFloat(w.amount || 0);
      const fee   = gross * 0.05;
      const net   = gross - fee;
      const reasonCell = w.reject_reason
        ? `<button onclick="showRejectReason('${w.reject_reason.replace(/'/g,"&#39;").replace(/"/g,'&quot;')}')" style="padding:4px 12px;border:1.5px solid #667eea;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">View</button>`
        : `<span style="color:#cbd5e1;">—</span>`;
      return `
        <tr class="mobile-table-row mobile-withdrawal-row" data-index="${globalIndex}">
          <td colspan="8">
            <div class="mobile-cell">
              <span class="mobile-email">${esc(w.user_email)}</span>
              <span class="mobile-amount">${fmt(net)}</span>
              <button class="view-btn" onclick="showWithdrawalDetails(${globalIndex})">View</button>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:0 16px 10px;">
              <span class="badge ${badgeClass(w.status)}" style="font-size:10px;">${esc(w.status)}</span>
              <span style="font-size:11px;color:#94a3b8;">${fmtDate(w.created_at)}</span>
            </div>
          </td>
        </tr>
        <tr data-index="${globalIndex}">
          <td>${globalIndex + 1}</td>
          <td>${esc(w.user_email)}</td>
          <td style="font-weight:700;color:#1e293b;">${fmt(gross)}</td>
          <td style="font-weight:700;color:#667eea;">${fmt(net)}</td>
          <td style="color:#ef4444;">-${fmt(fee)}</td>
          <td><span class="badge ${badgeClass(w.status)}"${w.status === 'pending' ? ' style="cursor:pointer;" onclick="location.href=\'/earnify-admin/payments/\'" title="Click to review"' : ''}>${w.status}</span></td>
          <td>${reasonCell}</td>
          <td>${fmtDate(w.created_at)}</td>
        </tr>`;
    }).join('');
  }

  // Pagination controls
  let paginationEl = document.getElementById('wdPagination');
  if (!paginationEl) {
    paginationEl = document.createElement('div');
    paginationEl.id = 'wdPagination';
    tbody.closest('.table-card').appendChild(paginationEl);
  }

  if (_wdPageSize === 'all' || totalPages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }

  const btnBase   = `padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;border:1.5px solid #e2e8f0;background:#f8fafc;color:#64748b;transition:all .2s;`;
  const btnActive = `padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;border:none;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;`;

  let pages = '';
  const range = 2;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= _wdPage - range && p <= _wdPage + range)) {
      pages += `<button onclick="goToWdPage(${p})" style="${p === _wdPage ? btnActive : btnBase}">${p}</button>`;
    } else if (p === _wdPage - range - 1 || p === _wdPage + range + 1) {
      pages += `<span style="padding:0 4px;color:#94a3b8;">…</span>`;
    }
  }

  paginationEl.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-top:1px solid #f1f5f9;flex-wrap:wrap;gap:8px;">
      <span style="font-size:12px;color:#94a3b8;font-weight:500;">Showing ${start + 1}–${Math.min(start + pageSize, total)} of ${total}</span>
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
        <button onclick="goToWdPage(${_wdPage - 1})" ${_wdPage === 1 ? 'disabled' : ''} style="${btnBase}opacity:${_wdPage === 1 ? '.4' : '1'};">&#8249; Prev</button>
        ${pages}
        <button onclick="goToWdPage(${_wdPage + 1})" ${_wdPage === totalPages ? 'disabled' : ''} style="${btnBase}opacity:${_wdPage === totalPages ? '.4' : '1'};">Next &#8250;</button>
      </div>
    </div>`;
}

function goToWdPage(page) {
  const total = (window.withdrawalsData || []).length;
  const pageSize = _wdPageSize === 'all' ? total : _wdPageSize;
  const totalPages = Math.ceil(total / pageSize) || 1;
  _wdPage = Math.max(1, Math.min(page, totalPages));
  renderWithdrawalsTable();
}

function changeWdPageSize() {
  const val = document.getElementById('wdPageSize')?.value;
  _wdPageSize = val === 'all' ? 'all' : parseInt(val);
  _wdPage = 1;
  renderWithdrawalsTable();
}

function renderDayWiseChart(purchases, selectedMonth, selectedYear) {
  const canvas = document.getElementById('dayWiseChart');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  if (_dayWiseChart) { _dayWiseChart.destroy(); _dayWiseChart = null; }
  const wrap = canvas.parentElement;
  wrap.querySelectorAll('.dw-empty').forEach(e => e.remove());

  const now = new Date();
  const month = selectedMonth !== undefined ? selectedMonth : now.getMonth();
  const year  = selectedYear  !== undefined ? selectedYear  : now.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthLabel = document.getElementById('currentMonth');
  if (monthLabel) monthLabel.textContent = monthName;

  const daily = new Array(daysInMonth + 1).fill(0);
  let total = 0;
  (purchases || []).forEach(p => {
    const d = new Date(p.created_at);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const amt = parseFloat(p.amount || p.totalAmount || 0);
      daily[d.getDate()] += amt;
      total += amt;
    }
  });

  if (total === 0) {
    canvas.style.display = 'none';
    const empty = document.createElement('div');
    empty.className = 'dw-empty';
    empty.innerHTML = `<div style="text-align:center;padding:52px 20px;">
      <div style="font-size:52px;opacity:.3;margin-bottom:14px;">📭</div>
      <div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:6px;">No Revenue for ${monthName}</div>
      <div style="font-size:13px;color:#94a3b8;">No completed sales recorded for this month.</div>
    </div>`;
    wrap.appendChild(empty);
    return;
  }

  canvas.style.display = '';
  _dayWiseChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: Array.from({ length: daysInMonth }, (_, i) => (i+1).toString()),
      datasets: [{ label: 'Revenue', data: daily.slice(1),
        backgroundColor: (c) => { const {ctx:cx,chartArea:ca} = c.chart; if(!ca) return '#EF5835'; const g=cx.createLinearGradient(0,ca.top,0,ca.bottom); g.addColorStop(0,'#EF5835'); g.addColorStop(1,'#E29F17'); return g; },
        borderColor:'transparent', borderWidth:0, borderRadius:8, borderSkipped:false }] },
    options: { responsive:true, maintainAspectRatio:true,
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>` ${fmt(c.raw)}`,title:c=>`Day ${c[0].label}`}} },
      scales:{
        x:{grid:{display:false},ticks:{font:{size:10},color:'#94a3b8',maxRotation:0,autoSkip:true,maxTicksLimit:31},title:{display:true,text:'Day of Month',color:'#64748b',font:{size:12,weight:'600'}}},
        y:{beginAtZero:true,grid:{color:'rgba(0,0,0,0.05)'},ticks:{font:{size:11},color:'#94a3b8',callback:v=>String.fromCharCode(8377)+v.toLocaleString('en-IN')},title:{display:true,text:'Revenue',color:'#64748b',font:{size:12,weight:'600'}}}
      }
    }
  });
}

function filterDayWiseChart() {
  const month = parseInt(document.getElementById('monthFilter')?.value);
  const year  = parseInt(document.getElementById('yearFilter')?.value);
  renderDayWiseChart(_allPurchasesData, month, year);
}

function initializeDateFilters() {
  const now = new Date();
  const ms = document.getElementById('monthFilter');
  const ys = document.getElementById('yearFilter');
  if (ms) ms.value = now.getMonth().toString();
  if (ys) {
    ys.innerHTML = '';
    for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) {
      const o = document.createElement('option');
      o.value = y; o.textContent = y;
      if (y === now.getFullYear()) o.selected = true;
      ys.appendChild(o);
    }
  }
}

function getDoughnutBorderColor() {
  return document.body.classList.contains('dark-mode') ? '#161b22' : '#fff';
}

function renderResourceChart(limit = 10) {
  const canvas  = document.getElementById('resourceDonutChart');
  const emptyEl = document.getElementById('resourceDonutEmpty');
  const legend  = document.getElementById('resourceDonutLegend');
  const center  = document.getElementById('resourceDonutCenter');
  if (!canvas) return;
  if (_barChart) { _barChart.destroy(); _barChart = null; }

  const resourceData = {};
  _barChartData.forEach(p => {
    const title = p.resource_title || p.resourceTitle;
    if (!title) return;
    const price = parseFloat(p.resource_price || p.amount || p.unitPrice || 0);
    if (!resourceData[title]) resourceData[title] = { revenue: 0, purchases: 0 };
    resourceData[title].revenue   += price;
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
  const top = sorted.slice(0, limitNum);
  // No Others grouping — use full sorted list for chart
  const others = sorted.slice(limitNum);

  const PALETTE = ['#667eea','#10b981','#f59e0b','#f5576c','#06b6d4','#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16','#94a3b8'];
  const labels = top.map(r => r.name);
  const values = top.map(r => r.revenue);
  const colors = top.map((_, i) => PALETTE[i % PALETTE.length]);
  const total  = values.reduce((s,v) => s+v, 0);

  // Store ALL resources (full sorted list) for popup — no grouping
  window._allLegendData = sorted.map((r, i) => ({
    name: r.name,
    revenue: r.revenue,
    purchases: r.purchases,
    color: PALETTE[i % PALETTE.length]
  }));
  window._legendTotal = sorted.reduce((s, r) => s + r.revenue, 0);

  _barChart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: getDoughnutBorderColor(), hoverOffset: 0, offset: 0 }] },
    options: { cutout:'70%', responsive:true, maintainAspectRatio:true,
      animation: { animateRotate: true, animateScale: false },
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:c=>{ const r=top[c.dataIndex]; const pct=total>0?((r.revenue/total)*100).toFixed(1):0; return ` ${fmt(r.revenue)} (${pct}%) • ${r.purchases} sales`; }}}
      },
      elements: { arc: { hoverOffset: 0 } }
    }
  });

  if (center) center.innerHTML = `${fmt(total)}<br><span style="font-size:10px;color:#94a3b8;font-weight:500;">Total Revenue</span>`;

  if (legend) {
    const PREVIEW = 5;
    const isDark = document.body.classList.contains('dark-mode');
    const allData = window._allLegendData;
    const grandTotal = window._legendTotal;

    const makeRow = (r, i) => {
      const pct = grandTotal > 0 ? ((r.revenue / grandTotal) * 100).toFixed(1) : 0;
      const lbl = r.name.length > 22 ? r.name.substring(0, 22) + '\u2026' : r.name;
      return `<div class="legend-item" style="padding:7px 0;border-bottom:1px solid var(--legend-divider,#f1f5f9);">
        <span class="legend-label" style="gap:6px;min-width:0;overflow:hidden;">
          <span style="font-size:10px;font-weight:700;color:#94a3b8;flex-shrink:0;min-width:16px;">${i + 1}.</span>
          <span class="legend-dot" style="background:${r.color};width:9px;height:9px;border-radius:50%;flex-shrink:0;"></span>
          <span style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${lbl}</span>
        </span>
        <span style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <span class="legend-val" style="font-size:12px;font-weight:700;">${fmt(r.revenue)}</span>
          <span style="font-size:10px;color:#94a3b8;font-weight:500;">${pct}%</span>
          <span style="font-size:10px;color:#94a3b8;">${r.purchases}x</span>
        </span>
      </div>`;
    };

    const previewRows = allData.slice(0, PREVIEW).map((r, i) => makeRow(r, i)).join('');
    const extraRows = allData.slice(PREVIEW).map((r, i) => makeRow(r, PREVIEW + i)).join('');

    const showAllBtn = allData.length > PREVIEW
      ? `<div id="legendExtraRows" style="display:none;">${extraRows}</div>
         <button id="legendToggleBtn" onclick="toggleLegendRows()">&#9660; Show all</button>`
      : '';

    legend.innerHTML = previewRows + showAllBtn;
  }
}

function filterResourceChart() {
  const v = document.getElementById('resourceFilter')?.value || 'top10';
  renderResourceChart(v === 'all' ? 'all' : parseInt(v.replace('top','')));
}

function renderCharts(available, totalGross, totalWithdrawn, platformFees, totalPending, purchases) {
  // Earnings Breakdown donut
  const donutCtx = document.getElementById('donutChart')?.getContext('2d');
  if (donutCtx) {
    if (_donutChart) _donutChart.destroy();
    const labels = ['Available','Withdrawn','Fees','Pending'];
    const values = [available, totalWithdrawn, platformFees, totalPending];
    const colors = ['#667eea','#10b981','#f59e0b','#f5576c'];
    _donutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: getDoughnutBorderColor(), hoverOffset: 0, offset: 0 }] },
      options: { cutout:'72%', responsive:true, maintainAspectRatio:true,
        animation: { animateRotate: true, animateScale: false },
        plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>` ${c.label}: ${fmt(c.raw)}`}} },
        elements: { arc: { hoverOffset: 0 } }
      }
    });
    const center = document.getElementById('donutCenter');
    if (center) center.innerHTML = `${fmt(totalGross)}<br><span style="font-size:10px;color:#94a3b8;font-weight:500;">Total Earned</span>`;
    const legend = document.getElementById('donutLegend');
    if (legend) legend.innerHTML = labels.map((l, i) => {
      const pct = totalGross > 0 ? ((values[i] / totalGross) * 100).toFixed(1) : 0;
      return `<div class="legend-item" style="padding:7px 0;border-bottom:1px solid var(--legend-divider,#f1f5f9);">
        <span class="legend-label">
          <span class="legend-dot" style="background:${colors[i]};width:10px;height:10px;border-radius:50%;flex-shrink:0;"></span>
          <span style="font-size:12px;font-weight:600;">${l}</span>
        </span>
        <span style="display:flex;align-items:center;gap:8px;">
          <span class="legend-val" style="font-size:13px;font-weight:700;">${fmt(values[i])}</span>
          <span style="font-size:10px;color:#94a3b8;font-weight:500;min-width:32px;text-align:right;">${pct}%</span>
        </span>
      </div>`;
    }).join('');
  }

  // Resource donut — built from purchases data already fetched
  _barChartData = purchases;
  renderResourceChart(10);

  // Day-wise chart
  _allPurchasesData = purchases;
  initializeDateFilters();
  const ms = document.getElementById('monthFilter');
  const ys = document.getElementById('yearFilter');
  renderDayWiseChart(purchases, ms ? parseInt(ms.value) : new Date().getMonth(), ys ? parseInt(ys.value) : new Date().getFullYear());
}

async function loadDashboard() {
  // Reset charts
  _barChartData = []; _allPurchasesData = [];
  if (_barChart)     { _barChart.destroy();     _barChart = null; }
  if (_donutChart)   { _donutChart.destroy();   _donutChart = null; }
  if (_dayWiseChart) { _dayWiseChart.destroy(); _dayWiseChart = null; }

  // Shimmer
  ['cardAvailable','cardRevenue','cardWithdrawn','cardFees','cardPending'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.className = 'shimmer shimmer-value'; el.textContent = ''; }
    const sub = el?.nextElementSibling;
    if (sub) { sub.className = 'shimmer shimmer-sub'; sub.textContent = ''; }
  });
  document.querySelectorAll('.stat-card').forEach(c => c.classList.add('is-shimmer'));
  const errEl = document.getElementById('errorBanner');
  if (errEl) errEl.style.display = 'none';

  const token = localStorage.getItem('adminToken');
  const userEmail = getUserEmail();

  try {
    // Fetch all data via server API (bypasses Supabase RLS)
    const [stats, purchases, withdrawals] = await Promise.all([
      apiFetch('/api/admin/dashboard-stats'),
      apiFetch('/api/admin/purchases'),
      apiFetch('/api/admin/withdrawals')
    ]);

    // Use ALL users' data for platform-wide stats
    const myPurchases   = purchases;
    const myWithdrawals = withdrawals;

    // Compute totals from filtered data
    const completedPurchases = myPurchases.filter(p => p.status === 'completed');
    const totalGross = completedPurchases.reduce((s, p) => s + parseFloat(p.resource_price || p.amount || 0), 0);

    const totalWithdrawnGross = myWithdrawals
      .filter(w => w.status === 'approved' || w.status === 'completed')
      .reduce((s, w) => s + parseFloat(w.amount || 0), 0);
    const totalPendingGross = myWithdrawals
      .filter(w => w.status === 'pending')
      .reduce((s, w) => s + parseFloat(w.amount || 0), 0);

    const totalWithdrawn = totalWithdrawnGross * 0.95;
    const totalPending   = totalPendingGross   * 0.95;
    // Platform fees = 5% from ALL withdrawal requests (approved + pending)
    const allWdGross   = totalWithdrawnGross + totalPendingGross;
    const platformFees = allWdGross * 0.05;
    const available    = Math.max(0, totalGross - totalWithdrawnGross - totalPendingGross);

    const completedCount = completedPurchases.length;
    const approvedCount  = myWithdrawals.filter(w => w.status === 'approved' || w.status === 'completed').length;
    const pendingCount   = myWithdrawals.filter(w => w.status === 'pending').length;
    const totalWdCount   = approvedCount + pendingCount;

    // Update stat cards
    const cardData = [
      { id: 'cardAvailable', value: fmt(available),      sub: 'Ready to withdraw' },
      { id: 'cardRevenue',   value: fmt(totalGross),     sub: `${completedCount} completed sales` },
      { id: 'cardWithdrawn', value: fmt(totalWithdrawn), sub: `${approvedCount} approved • net after 5% fee` },
      { id: 'cardFees',      value: fmt(platformFees),   sub: `${totalWdCount} withdrawal req • 5% each` },
      { id: 'cardPending',   value: fmt(totalPending),   sub: `${pendingCount} pending • net after 5% fee` }
    ];
    cardData.forEach(({ id, value, sub }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = 'stat-value';
      el.textContent = value;
      const subEl = el.nextElementSibling;
      if (subEl) { subEl.className = 'stat-sub'; subEl.textContent = sub; }
    });
    document.querySelectorAll('.stat-card.is-shimmer').forEach(c => {
      c.classList.remove('is-shimmer');
      const icon = c.querySelector('.stat-icon span');
      if (icon) icon.style.visibility = '';
    });

    // Charts
    renderCharts(available, totalGross, totalWithdrawn, platformFees, totalPending, completedPurchases);
    document.querySelectorAll('.chart-card.is-loading').forEach(c => c.classList.remove('is-loading'));

    // Purchases table
    window.purchasesData = completedPurchases;
    _purchasePage = 1;
    renderPurchasesTable();

    // Withdrawals table
    window.withdrawalsData = myWithdrawals;
    _wdPage = 1;
    renderWithdrawalsTable();

    // Sidebar
    document.querySelector('.admin-badge')?.classList.remove('is-loading');
    const displayEmail = userEmail || (token ? decodeJwtPayload(token)?.email : null) || 'admin@earnify.com';
    document.getElementById('adminEmail').textContent = displayEmail;
    document.getElementById('adminAvatar').textContent = displayEmail.charAt(0).toUpperCase();

  } catch (err) {
    console.error('[Dashboard] error =>', err);
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = `⚠️ ${err.message}`; }
    // Remove shimmer even on error
    document.querySelectorAll('.stat-card.is-shimmer').forEach(c => c.classList.remove('is-shimmer'));
    document.querySelectorAll('.chart-card.is-loading').forEach(c => c.classList.remove('is-loading'));
  }
}

function logout() {
  localStorage.clear(); sessionStorage.clear(); location.href = '/';
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}

function showPurchaseDetails(index) {
  const p = window.purchasesData?.[index];
  if (!p) return;
  document.getElementById('modalBody').innerHTML = `
    <div class="detail-row"><div class="detail-label"># Order Number</div><div class="detail-value">${index+1}</div></div>
    <div class="detail-row"><div class="detail-label">📧 Buyer Email</div><div class="detail-value">${esc(p.buyer_email)}</div></div>
    <div class="detail-row"><div class="detail-label">📚 Resource</div><div class="detail-value">${esc(p.resource_title)}</div></div>
    <div class="detail-row"><div class="detail-label">💰 Amount</div><div class="detail-value amount">${fmt(p.resource_price || p.amount)}</div></div>
    <div class="detail-row"><div class="detail-label">✅ Status</div><div class="detail-value"><span class="badge badge-completed">completed</span></div></div>
    <div class="detail-row"><div class="detail-label">📅 Date</div><div class="detail-value">${fmtDate(p.created_at)}</div></div>`;
  document.getElementById('detailsModal').classList.add('active');
}

function showWithdrawalDetails(index) {
  const w = window.withdrawalsData?.[index];
  if (!w) return;
  const gross = parseFloat(w.amount || 0), fee = gross * 0.05, net = gross - fee;
  document.getElementById('modalBody').innerHTML = `
    <div class="detail-row"><div class="detail-label"># Request</div><div class="detail-value">${index+1}</div></div>
    <div class="detail-row"><div class="detail-label">📧 User Email</div><div class="detail-value">${esc(w.user_email)}</div></div>
    <div class="detail-row"><div class="detail-label">💵 Gross Amount</div><div class="detail-value">${fmt(gross)}</div></div>
    <div class="detail-row"><div class="detail-label">💰 Net Amount</div><div class="detail-value amount">${fmt(net)}</div></div>
    <div class="detail-row"><div class="detail-label">📊 Platform Fee (5%)</div><div class="detail-value" style="color:#ef4444;">-${fmt(fee)}</div></div>
    <div class="detail-row"><div class="detail-label">📊 Status</div><div class="detail-value"><span class="badge ${badgeClass(w.status)}">${w.status}</span></div></div>
    <div class="detail-row"><div class="detail-label">📅 Date</div><div class="detail-value">${fmtDate(w.created_at)}</div></div>
    ${w.reject_reason ? `<div style="padding:12px 14px;background:#fef2f2;border:1.5px solid #fecaca;border-radius:12px;"><div style="font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;">⚠ Rejection Reason</div><div style="font-size:13px;font-weight:600;color:#991b1b;line-height:1.5;">${esc(w.reject_reason)}</div></div>` : ''}`;
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

function toggleLegendRows() {
  const extra = document.getElementById('legendExtraRows');
  const btn   = document.getElementById('legendToggleBtn');
  if (!extra || !btn) return;
  const isHidden = extra.style.display === 'none';
  extra.style.display = isHidden ? '' : 'none';
  const total = (window._allLegendData || []).length;
  btn.innerHTML = isHidden
    ? `&#9650; Show less`
    : `&#9660; Show all `;
}

function openAllLegendPopup() {}
function closeAllLegendPopup() {
  document.getElementById('allLegendPopup')?.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('detailsModal')?.addEventListener('click', e => {
  if (e.target.id === 'detailsModal') closeDetailsModal();
});

loadDashboard();
