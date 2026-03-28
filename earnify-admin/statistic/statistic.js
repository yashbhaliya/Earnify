const SUPA_URL = 'https://emnrgsgerfjvndexomro.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQyMDIxMCwiZXhwIjoyMDg3OTk2MjEwfQ.mr4k_GsJ14CC1mqvEZgf9cTaNiLMlnj_sZxFjJud67k';
const db = window.supabase.createClient(SUPA_URL, SUPA_KEY);

async function getEmail() {
  // 1. currentUser is always set at login and has .email
  try {
    const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (cu.email) return cu.email;
  } catch(_) {}
  // 2. Decode JWT directly — no network call
  const token = localStorage.getItem('adminToken');
  if (token) {
    try {
      const p = JSON.parse(atob(token.split('.')[1]));
      if (p.email) return p.email;
    } catch(_) {}
  }
  // 3. Supabase session (works when cookie is alive)
  try {
    const { data: { session } } = await db.auth.getSession();
    if (session?.user?.email) return session.user.email;
  } catch(_) {}
  return null;
}

(async function() {
  const email = await getEmail();
  if (email) {
    document.getElementById('adminEmail').textContent = email;
    document.getElementById('adminAvatar').textContent = email.charAt(0).toUpperCase();
  }
})();

function logout() {
  localStorage.clear(); sessionStorage.clear();
  location.href = 'https://earnify-gamma.vercel.app/admin/login.html';
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}

function setCard(id, subId, value, sub) {
  document.getElementById(id).textContent = value;
  document.getElementById(subId).textContent = sub;
}

function fmt(n) { return '₹' + Math.round(n || 0).toLocaleString('en-IN'); }

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—';
}

let allPurchases = [];

async function loadStats() {
  ['valRevenue','valPurchases','valAvgOrder','valBuyers'].forEach(id =>
    document.getElementById(id).innerHTML = '<div class="shimmer shimmer-value"></div>');
  ['subRevenue','subPurchases','subAvgOrder','subBuyers'].forEach(id =>
    document.getElementById(id).innerHTML = '<div class="shimmer shimmer-sub"></div>');

  try {
    const userEmail = await getEmail();
    if (!userEmail) throw new Error('Not logged in');

    // Fetch seller resources
    const { data: resources, error: rErr } = await db.from('resources')
      .select('id, title, price').eq('user_email', userEmail);
    if (rErr) throw rErr;

    const priceMap = {}, titleMap = {};
    (resources || []).forEach(r => {
      priceMap[r.id] = parseFloat(r.price || 0);
      titleMap[r.id] = r.title;
    });
    const resourceIds = (resources || []).map(r => r.id);

    // Fetch payments for those resources
    let payments = [];
    if (resourceIds.length) {
      const { data: pData, error: pErr } = await db.from('payments')
        .select('id, user_id, resource_id, created_at, status')
        .in('resource_id', resourceIds)
        .order('created_at', { ascending: false });
      if (pErr) throw pErr;
      payments = pData || [];
    }

    // Resolve buyer emails from user_ids
    const uniqueUserIds = [...new Set(payments.map(p => p.user_id).filter(Boolean))];
    const userEmailMap = {};
    if (uniqueUserIds.length) {
      try {
        const { data: { users } } = await db.auth.admin.listUsers({ perPage: 1000 });
        (users || []).forEach(u => { if (u.id) userEmailMap[u.id] = u.email || u.id; });
      } catch(e) {
        uniqueUserIds.forEach(id => { userEmailMap[id] = id; });
      }
    }

    allPurchases = payments.map(p => ({
      id:             p.id,
      buyer_email:    userEmailMap[p.user_id] || p.user_id || '—',
      resource_title: titleMap[p.resource_id] || '—',
      amount:         priceMap[p.resource_id] || 0,
      status:         p.status || 'completed',
      created_at:     p.created_at
    }));

    const completed    = allPurchases.filter(p => p.status === 'completed');
    const totalRevenue = completed.reduce((s, p) => s + p.amount, 0);
    const uniqueBuyers = new Set(completed.map(p => p.buyer_email).filter(e => e && e !== '—')).size;
    const avgOrder     = completed.length ? totalRevenue / completed.length : 0;

    setCard('valRevenue',   'subRevenue',   fmt(totalRevenue),   `From ${completed.length} sales`);
    setCard('valPurchases', 'subPurchases', allPurchases.length, `${completed.length} completed`);
    setCard('valAvgOrder',  'subAvgOrder',  fmt(avgOrder),       'Per transaction');
    setCard('valBuyers',    'subBuyers',    uniqueBuyers,        'Unique customers');

    renderTable(allPurchases);

  } catch (err) {
    console.error('[Statistics] loadStats error =>', err);
    const subIds = ['subRevenue','subPurchases','subAvgOrder','subBuyers'];
    ['valRevenue','valPurchases','valAvgOrder','valBuyers'].forEach((id, i) =>
      setCard(id, subIds[i], '—', 'Error'));
    document.getElementById('purchaseTbody').innerHTML =
      `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">⚠️</div><p>${err.message}</p></div></td></tr>`;
    document.getElementById('recordCount').textContent = 'Error';
  }
}

function renderTable(rows) {
  const tbody = document.getElementById('purchaseTbody');
  document.getElementById('recordCount').textContent = `${rows.length} records`;

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📭</div><p>No purchase records found.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((p, i) => {
    const status   = p.status || 'completed';
    const amount   = parseFloat(p.amount || p.resource_price || 0);
    const badgeCls = status === 'completed' ? 'badge-completed' : status === 'pending' ? 'badge-pending' : 'badge-failed';
    
    return `<tr>
      <td style="color:#94a3b8;font-weight:600;">${i + 1}</td>
      <td style="font-weight:500;color:#1e293b;">${p.buyer_email || '—'}</td>
      <td>${p.resource_title || '—'}</td>
      <td style="font-weight:700;color:#10b981;">${fmt(amount)}</td>
      <td><span class="badge ${badgeCls}">${status}</span></td>
      <td>${fmtDate(p.created_at)}</td>
    </tr><tr class="mobile-table-row">
      <td colspan="6">
        <div class="mobile-cell">
          <div class="mobile-email">${p.buyer_email || '—'}</div>
          <div class="mobile-amount">${fmt(amount)}</div>
          <button class="view-btn" onclick="showPurchaseDetails(${i})">View</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function showPurchaseDetails(index) {
  const purchase = allPurchases[index];
  if (!purchase) return;
  
  const status = purchase.status || 'completed';
  const amount = parseFloat(purchase.amount || purchase.resource_price || 0);
  const badgeCls = status === 'completed' ? 'badge-completed' : status === 'pending' ? 'badge-pending' : 'badge-failed';
  
  document.getElementById('modalBody').innerHTML = `
    <div class="detail-row">
      <div class="detail-label">Buyer Email</div>
      <div class="detail-value">${purchase.buyer_email || '—'}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Resource</div>
      <div class="detail-value">${purchase.resource_title || '—'}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Amount</div>
      <div class="detail-value amount">${fmt(amount)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Status</div>
      <div class="detail-value"><span class="badge ${badgeCls}">${status}</span></div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Purchase Date</div>
      <div class="detail-value">${fmtDate(purchase.created_at)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Purchase ID</div>
      <div class="detail-value" style="font-size:12px;color:#64748b;">${purchase.id || '—'}</div>
    </div>
  `;
  document.getElementById('detailsModal').classList.add('active');
}

function closeDetailsModal() {
  document.getElementById('detailsModal').classList.remove('active');
}

function filterTable() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const filtered = allPurchases.filter(p => {
    const matchSearch = !search ||
      (p.buyer_email || '').toLowerCase().includes(search) ||
      (p.resource_title || '').toLowerCase().includes(search);
    const matchStatus = !status || p.status === status;
    return matchSearch && matchStatus;
  });
  console.log('[Statistics] filterTable =>', filtered.length, 'rows');
  renderTable(filtered);
}

loadStats();
