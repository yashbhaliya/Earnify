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
  let allPayments = [];
  let selectedIdx = null;

  /* ── Load from Supabase ── */
  async function loadPayments() {
    document.getElementById('paymentsGrid').innerHTML = `
      <div class="empty-state"><div class="empty-icon">⏳</div><h3>Loading...</h3><p>Fetching from Supabase</p></div>`;

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
    allPayments = all.filter(w => w.status === 'pending');

    const totalNet = allPayments.reduce((s, p) => s + parseFloat(p.amount || 0) * 0.95, 0);
    const today = new Date().toDateString();
    const processedToday = all.filter(w =>
      new Date(w.updated_at || w.created_at).toDateString() === today &&
      (w.status === 'approved' || w.status === 'rejected')
    ).length;

    document.getElementById('statPending').textContent = allPayments.length;
    document.getElementById('statAmount').textContent = fmt(totalNet);
    document.getElementById('statProcessed').textContent = processedToday;

    renderPayments(allPayments);
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
            <button class="action-btn btn-reject" id="reject-${i}" onclick="handlePayment(${i},'reject')">✕ Reject</button>
          </div>
        </div>`;
    }).join('');
  }

  /* ── Confirm modal ── */
  window.openConfirmModal = function (i) {
    selectedIdx = i;
    const p = allPayments[i];
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
    await handlePayment(selectedIdx, 'approve');
    window.closeConfirmModal();
  };

  /* ── Approve / Reject via Supabase ── */
  window.handlePayment = async function (i, action) {
    const p = allPayments[i];
    if (!p) return;

    const acceptBtn = document.getElementById(`accept-${i}`);
    const rejectBtn = document.getElementById(`reject-${i}`);
    if (acceptBtn) acceptBtn.disabled = true;
    if (rejectBtn) rejectBtn.disabled = true;

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    console.log(`[Payments] Updating id=${p.id} status=${newStatus}`);

    const { error } = await db
      .from('withdrawals')
      .update({ status: newStatus })
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
