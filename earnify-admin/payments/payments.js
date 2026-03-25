(function () {
  'use strict';

  const SUPA_URL = 'https://emnrgsgerfjvndexomro.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjAyMTAsImV4cCI6MjA4Nzk5NjIxMH0.uXr8lipxLbB4D_5JwQkpLzc-HudQw23tOFBfV4C6hqY';
  const db = window.supabase.createClient(SUPA_URL, SUPA_KEY);

  console.log('[Payments] Supabase ready');

  /* ── Auth sidebar ── */
  (async function () {
    let email = 'Admin';
    try {
      const { data: { user } } = await db.auth.getUser();
      if (user?.email) email = user.email;
    } catch (_) {}

    if (email === 'Admin') {
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          const p = JSON.parse(atob(token.split('.')[1]));
          if (p.email) email = p.email;
        }
      } catch (_) {}
    }

    if (email === 'Admin') {
      try {
        const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (u.email) email = u.email;
      } catch (_) {}
    }

    document.getElementById('adminEmail').textContent = email;
    document.getElementById('adminAvatar').textContent = email.charAt(0).toUpperCase();
  })();

  /* ── Helpers ── */
  window.logout = () => { localStorage.clear(); sessionStorage.clear(); location.href = '/admin/login.html'; };
  window.toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
  };

  const fmt = n => '₹' + Math.round(n || 0).toLocaleString('en-IN');
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.className = `toast ${type} show`;
    document.getElementById('toastIcon').textContent = type === 'success' ? '✅' : '❌';
    document.getElementById('toastMessage').textContent = msg;
    setTimeout(() => t.classList.remove('show'), 3500);
  }

  /* ── State ── */
  let allPayments = [];   // pending only
  let _allRaw = [];       // all records (for processed count)
  let filteredPayments = [];
  let selectedIdx = null;

  /* ── Date filter ── */
  // Always work in LOCAL date strings to avoid UTC timezone shift
  function toLocalDateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Parse a YYYY-MM-DD string as local midnight (not UTC)
  function localMidnight(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  }

  // Get local date string from a UTC timestamp string (e.g. created_at)
  function recordDateStr(isoStr) {
    const d = new Date(isoStr);
    return toLocalDateStr(d);
  }

  window.setPreset = function (btn, preset) {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const now = new Date();
    if (preset === 'today') {
      const d = toLocalDateStr(now);
      applyRange(d, d);
    } else if (preset === 'yesterday') {
      const y = new Date(now); y.setDate(now.getDate() - 1);
      const d = toLocalDateStr(y);
      applyRange(d, d);
    } else if (preset === 'week') {
      const start = new Date(now); start.setDate(now.getDate() - now.getDay());
      applyRange(toLocalDateStr(start), toLocalDateStr(now));
    } else if (preset === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      applyRange(toLocalDateStr(start), toLocalDateStr(now));
    } else if (preset === 'custom') {
      document.getElementById('customRangeModal').classList.add('show');
      document.body.style.overflow = 'hidden';
    } else {
      applyRange(null, null);
    }
  };

  window.applyCustomRange = function () {
    const from = document.getElementById('filterFrom').value;
    const to   = document.getElementById('filterTo').value;
    closeCustomRange();
    if (from || to) applyRange(from || null, to || null);
  };

  window.closeCustomRange = function () {
    document.getElementById('customRangeModal').classList.remove('show');
    document.body.style.overflow = '';
  };

  function applyRange(from, to) {
    const fromTs = from ? localMidnight(from) : null;
    const toTs   = to   ? localMidnight(to) + 86399999 : null;
    filteredPayments = allPayments.filter(p => {
      const recTs = localMidnight(recordDateStr(p.created_at));
      if (fromTs !== null && recTs < fromTs) return false;
      if (toTs   !== null && recTs > toTs)   return false;
      return true;
    });

    // Update stat cards
    const filteredNet = filteredPayments.reduce((s, p) => s + parseFloat(p.amount || 0) * 0.95, 0);
    const approvedInRange = _allRaw.filter(w => {
      if (w.status !== 'approved' && w.status !== 'completed') return false;
      const recTs = localMidnight(recordDateStr(w.approved_at || w.created_at));
      if (fromTs !== null && recTs < fromTs) return false;
      if (toTs   !== null && recTs > toTs)   return false;
      return true;
    }).length;
    const rejectedInRange = _allRaw.filter(w => {
      if (w.status !== 'rejected') return false;
      const recTs = localMidnight(recordDateStr(w.created_at));
      if (fromTs !== null && recTs < fromTs) return false;
      if (toTs   !== null && recTs > toTs)   return false;
      return true;
    }).length;
    renderStats(filteredPayments.length, filteredNet, approvedInRange, rejectedInRange);

    const resultEl = document.getElementById('filterResult');
    if (from || to) {
      resultEl.textContent = `${filteredPayments.length} of ${allPayments.length} shown`;
      resultEl.classList.add('visible');
    } else {
      resultEl.textContent = '';
      resultEl.classList.remove('visible');
    }
    renderPayments(filteredPayments);
  }

  window.clearFilter = function () {
    document.getElementById('filterFrom').value = '';
    document.getElementById('filterTo').value = '';
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === 'all'));
    applyRange(null, null);
  };

  /* ── Load from Supabase ── */
  function showShimmer() {
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card shimmer-card"><div class="stat-icon"><span>⏳</span></div><div class="stat-body"><span class="sh" style="height:10px;width:70px;margin-bottom:10px;"></span><span class="sh" style="height:26px;width:60px;margin-bottom:8px;"></span><span class="sh" style="height:9px;width:90px;"></span></div></div>
      <div class="stat-card shimmer-card"><div class="stat-icon"><span>💰</span></div><div class="stat-body"><span class="sh" style="height:10px;width:80px;margin-bottom:10px;"></span><span class="sh" style="height:26px;width:80px;margin-bottom:8px;"></span><span class="sh" style="height:9px;width:100px;"></span></div></div>
      <div class="stat-card shimmer-card"><div class="stat-icon"><span>✅</span></div><div class="stat-body"><span class="sh" style="height:10px;width:60px;margin-bottom:10px;"></span><span class="sh" style="height:26px;width:50px;margin-bottom:8px;"></span><span class="sh" style="height:9px;width:90px;"></span></div></div>
      <div class="stat-card shimmer-card"><div class="stat-icon"><span>✕</span></div><div class="stat-body"><span class="sh" style="height:10px;width:60px;margin-bottom:10px;"></span><span class="sh" style="height:26px;width:50px;margin-bottom:8px;"></span><span class="sh" style="height:9px;width:90px;"></span></div></div>`;

    const cardHtml = `
      <div class="payment-shimmer">
        <div class="ps-header"><div class="ps-user"><span class="sh" style="width:48px;height:48px;border-radius:50%;flex-shrink:0;"></span><div><span class="sh" style="height:14px;width:160px;margin-bottom:8px;"></span><span class="sh" style="height:11px;width:100px;"></span></div></div><span class="sh" style="height:22px;width:90px;"></span></div>
        <div class="ps-details"><span class="sh" style="height:44px;"></span><span class="sh" style="height:44px;"></span><span class="sh" style="height:44px;"></span><span class="sh" style="height:44px;"></span></div>
        <div class="ps-actions"><span class="sh" style="height:44px;flex:1;border-radius:10px;"></span><span class="sh" style="height:44px;flex:1;border-radius:10px;"></span></div>
      </div>`;
    document.getElementById('paymentsGrid').innerHTML = cardHtml + cardHtml + cardHtml;
  }

  function renderStats(pending, amount, approved, rejected) {
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-body"><div class="stat-label">Pending</div><div class="stat-value" id="statPending">${pending}</div><div class="stat-sub">Awaiting review</div></div></div>
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-body"><div class="stat-label">Total Amount</div><div class="stat-value" id="statAmount">${fmt(amount)}</div><div class="stat-sub">Pending withdrawals</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-body"><div class="stat-label">Approved</div><div class="stat-value" id="statApproved">${approved}</div><div class="stat-sub">In selected range</div></div></div>
      <div class="stat-card"><div class="stat-icon">✕</div><div class="stat-body"><div class="stat-label">Rejected</div><div class="stat-value" id="statRejected">${rejected}</div><div class="stat-sub">In selected range</div></div></div>`;
  }

  async function loadPayments() {
    showShimmer();

    const { data, error } = await db.from('withdrawals').select('*').order('created_at', { ascending: false });

    console.log('[Payments] Supabase fetch =>', { data, error });

    if (error) {
      document.getElementById('paymentsGrid').innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Supabase Error</h3>
          <p>${error.message}</p>
          <small style="color:#94a3b8">Table may not exist — run the SQL schema first</small>
        </div>`;
      return;
    }

    const all = data || [];
    _allRaw = all;
    allPayments = all.filter(w => w.status === 'pending');
    filteredPayments = [...allPayments];

    // re-apply active preset after reload (skip custom to avoid reopening modal)
    const activePreset = document.querySelector('.preset-btn.active')?.dataset.preset || 'all';
    if (activePreset === 'custom') {
      applyRange(null, null);
    } else {
      const fakeBtn = document.querySelector(`.preset-btn[data-preset="${activePreset}"]`);
      if (fakeBtn) setPreset(fakeBtn, activePreset);
      else applyRange(null, null);
    }
  }

  /* ── Render cards ── */
  function renderPayments(payments) {
    const grid = document.getElementById('paymentsGrid');
    if (!payments.length) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div><h3>All Caught Up!</h3><p>No pending payment requests</p></div>`;
      return;
    }

    grid.innerHTML = payments.map((p, i) => {
      const email = p.user_email || p.email || 'Unknown';
      const gross = parseFloat(p.amount || 0);
      const fee = gross * 0.05;
      const net = gross - fee;
      const method = (p.method || 'Bank Transfer').toUpperCase();
      return `
        <div class="payment-card">
          <div class="payment-header">
            <div class="payment-user">
              <div class="user-avatar">${email.charAt(0).toUpperCase()}</div>
              <div class="user-info">
                <h3>${email}</h3>
                <p>ID: ${p.id}</p>
              </div>
            </div>
            <div class="payment-amount">
              <div class="amount-label">Net Amount</div>
              <div class="amount-value">${fmt(net)}</div>
            </div>
          </div>
          <div class="payment-details">
            <div class="detail-item"><div class="detail-label">Gross Amount</div><div class="detail-value">${fmt(gross)}</div></div>
            <div class="detail-item"><div class="detail-label">Platform Fee (5%)</div><div class="detail-value" style="color:#ef4444">${fmt(fee)}</div></div>
            <div class="detail-item"><div class="detail-label">Request Date</div><div class="detail-value">${fmtDate(p.created_at)}</div></div>
            <div class="detail-item"><div class="detail-label">Method</div><div class="detail-value">${method}</div></div>
          </div>
          <div class="payment-actions">
            <button class="action-btn btn-accept" id="accept-${i}" onclick="openConfirmModal(${i})">✓ Accept</button>
            <button class="action-btn btn-reject" id="reject-${i}" onclick="openRejectModal(${i})">✕ Reject</button>
          </div>
        </div>`;
    }).join('');
  }

  /* ── Confirm modal ── */
  window.openConfirmModal = function (i) {
    selectedIdx = i;
    const p = filteredPayments[i];
    if (!p) return;
    const gross = parseFloat(p.amount || 0);
    const fee = gross * 0.05;
    const net = gross - fee;
    document.getElementById('modalDetails').innerHTML = `
      <div class="modal-detail-item"><div class="modal-detail-label">User Email</div><div class="modal-detail-value">${p.user_email || '—'}</div></div>
      <div class="modal-detail-item"><div class="modal-detail-label">Request ID</div><div class="modal-detail-value">${p.id}</div></div>
      <div class="modal-detail-item"><div class="modal-detail-label">Gross Amount</div><div class="modal-detail-value">${fmt(gross)}</div></div>
      <div class="modal-detail-item"><div class="modal-detail-label">Platform Fee (5%)</div><div class="modal-detail-value" style="color:#ef4444">${fmt(fee)}</div></div>
      <div class="modal-detail-item full"><div class="modal-detail-label">Net Amount</div><div class="modal-detail-value highlight">${fmt(net)}</div></div>
      <div class="modal-detail-item"><div class="modal-detail-label">Method</div><div class="modal-detail-value">${(p.method || '—').toUpperCase()}</div></div>
      <div class="modal-detail-item"><div class="modal-detail-label">Request Date</div><div class="modal-detail-value">${fmtDate(p.created_at)}</div></div>
      <div class="modal-detail-item full"><div class="modal-detail-label">Account Details</div><div class="modal-detail-value" style="font-size:14px;white-space:pre-line">${p.account || '—'}</div></div>
      ${p.note ? `<div class="modal-detail-item full"><div class="modal-detail-label">Note</div><div class="modal-detail-value" style="font-size:14px">${p.note}</div></div>` : ''}`;
    document.getElementById('confirmModal').classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  window.closeConfirmModal = function () {
    document.getElementById('confirmModal').classList.remove('show');
    document.body.style.overflow = '';
    selectedIdx = null;
    const btn = document.getElementById('confirmBtn');
    btn.disabled = false;
    btn.textContent = '✓ Approve Payment';
  };

  window.confirmPayment = async function () {
    if (selectedIdx === null) return;
    const btn = document.getElementById('confirmBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Processing...';
    await handlePayment(selectedIdx, 'approve', '', filteredPayments);
    window.closeConfirmModal();
  };

  let rejectIdx = null;

  window.openRejectModal = function (i) {
    rejectIdx = i;
    const input = document.getElementById('rejectReasonInput');
    const errEl = document.getElementById('rejectReasonError');
    if (input) input.value = '';
    if (errEl) errEl.style.display = 'none';
    document.getElementById('rejectModal').classList.add('show');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input && input.focus(), 100);
  };

  window.closeRejectModal = function () {
    document.getElementById('rejectModal').classList.remove('show');
    document.body.style.overflow = '';
    rejectIdx = null;
    const btn = document.getElementById('rejectConfirmBtn');
    if (btn) { btn.disabled = false; btn.textContent = '✕ Confirm Reject'; }
  };

  window.confirmReject = async function () {
    if (rejectIdx === null) return;
    const reason = document.getElementById('rejectReasonInput').value.trim();
    const errEl = document.getElementById('rejectReasonError');
    if (!reason) { errEl.style.display = 'block'; return; }
    errEl.style.display = 'none';
    const btn = document.getElementById('rejectConfirmBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Rejecting...';
    await handlePayment(rejectIdx, 'reject', reason, filteredPayments);
    window.closeRejectModal();
  };

  /* ── Approve / Reject via Supabase ── */
  window.handlePayment = async function (i, action, rejectReason = '', list = filteredPayments) {
    const p = list[i];
    if (!p) return;

    const acceptBtn = document.getElementById(`accept-${i}`);
    const rejectBtn = document.getElementById(`reject-${i}`);
    if (acceptBtn) acceptBtn.disabled = true;
    if (rejectBtn) rejectBtn.disabled = true;

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    console.log(`[Payments] Updating id=${p.id} status=${newStatus}`);

    const updateData = { status: newStatus };
    if (action === 'approve') updateData.approved_at = new Date().toISOString();
    if (action === 'reject' && rejectReason) updateData.reject_reason = rejectReason;

    const { error } = await db
      .from('withdrawals')
      .update(updateData)
      .eq('id', p.id);

    if (error) {
      console.error('[Payments] Update error =>', error);
      showToast(`Failed: ${error.message}`, 'error');
      if (acceptBtn) acceptBtn.disabled = false;
      if (rejectBtn) rejectBtn.disabled = false;
      return;
    }

    const net = parseFloat(p.amount || 0) * 0.95;
    showToast(
      action === 'approve' ? `Approved! ${fmt(net)} will be transferred.` : 'Request rejected.',
      'success'
    );
    setTimeout(loadPayments, 1000);
  };

  window.loadPayments = loadPayments;
  loadPayments();
})();
