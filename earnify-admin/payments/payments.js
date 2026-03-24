const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000' : location.origin;

console.log('[Payments] API_BASE =>', API_BASE);

async function apiFetch(path, options = {}) {
  const url = API_BASE + path;
  console.log('[apiFetch]', options.method || 'GET', url);
  const res = await fetch(url, options);
  console.log('[apiFetch] status', res.status, path);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
  const data = await res.json();
  console.log('[apiFetch] data', path, data);
  return data;
}

// Auth sidebar
(async function() {
  try {
    const SUPA_URL = 'https://emnrgsgerfjvndexomro.supabase.co';
    const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjAyMTAsImV4cCI6MjA4Nzk5NjIxMH0.uXr8lipxLbB4D_5JwQkpLzc-HudQw23tOFBfV4C6hqY';
    
    if (typeof window.supabase !== 'undefined') {
      const _supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
      const { data: { user } } = await _supa.auth.getUser();
      if (user?.email) {
        document.getElementById('adminEmail').textContent = user.email;
        document.getElementById('adminAvatar').textContent = user.email.charAt(0).toUpperCase();
        return;
      }
    }
  } catch(e) { 
    console.warn('[Payments] Supabase auth failed =>', e.message); 
  }

  const token = localStorage.getItem('adminToken');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.email || 'admin@earnify.com';
      document.getElementById('adminEmail').textContent = email;
      document.getElementById('adminAvatar').textContent = email.charAt(0).toUpperCase();
      return;
    } catch(e) { 
      console.warn('[Payments] token decode failed', e); 
    }
  }

  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.email) {
      document.getElementById('adminEmail').textContent = currentUser.email;
      document.getElementById('adminAvatar').textContent = currentUser.email.charAt(0).toUpperCase();
      return;
    }
  } catch(e) {
    console.warn('[Payments] currentUser parse failed', e);
  }

  document.getElementById('adminEmail').textContent = 'Admin';
  document.getElementById('adminAvatar').textContent = 'A';
})();

function logout() {
  localStorage.clear(); sessionStorage.clear();
  location.href = '/admin/login.html';
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}

function fmt(n) { return '₹' + Math.round(n || 0).toLocaleString('en-IN'); }

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—';
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const msg = document.getElementById('toastMessage');
  
  toast.className = `toast ${type}`;
  icon.textContent = type === 'success' ? '✅' : '❌';
  msg.textContent = message;
  
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

let allPayments = [];
let selectedPaymentIndex = null;

async function loadPayments() {
  console.log('[Payments] loadPayments() called');
  
  try {
    const withdrawals = await apiFetch('/api/admin/withdrawals');
    console.log('[Payments] withdrawals =>', withdrawals);
    
    allPayments = Array.isArray(withdrawals) ? withdrawals.filter(w => w.status === 'pending') : [];
    
    const totalAmount = allPayments.reduce((sum, p) => {
      const amount = parseFloat(p.amount || 0);
      const netAmount = amount * 0.95;
      return sum + netAmount;
    }, 0);
    
    const processedToday = Array.isArray(withdrawals) ? withdrawals.filter(w => {
      const today = new Date().toDateString();
      const wDate = new Date(w.updated_at || w.created_at).toDateString();
      return wDate === today && (w.status === 'approved' || w.status === 'rejected');
    }).length : 0;
    
    document.getElementById('statPending').textContent = allPayments.length;
    document.getElementById('statAmount').textContent = fmt(totalAmount);
    document.getElementById('statProcessed').textContent = processedToday;
    
    renderPayments(allPayments);
    
  } catch (err) {
    console.error('[Payments] loadPayments error =>', err);
    document.getElementById('paymentsGrid').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Error Loading Payments</h3>
        <p>${err.message}</p>
      </div>
    `;
  }
}

function renderPayments(payments) {
  const grid = document.getElementById('paymentsGrid');
  
  if (!payments.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>All Caught Up!</h3>
        <p>No pending payment requests at the moment</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = payments.map((p, i) => {
    const email = p.user_email || p.email || 'Unknown';
    const avatar = email.charAt(0).toUpperCase();
    const grossAmount = parseFloat(p.amount || 0);
    const fee = grossAmount * 0.05;
    const netAmount = grossAmount - fee;
    const method = p.method || 'Bank Transfer';
    
    return `
      <div class="payment-card">
        <div class="payment-header">
          <div class="payment-user">
            <div class="user-avatar">${avatar}</div>
            <div class="user-info">
              <h3>${email}</h3>
              <p>Request ID: ${p.id || '—'}</p>
            </div>
          </div>
          <div class="payment-amount">
            <div class="amount-label">Net Amount</div>
            <div class="amount-value">${fmt(netAmount)}</div>
          </div>
        </div>
        
        <div class="payment-details">
          <div class="detail-item">
            <div class="detail-label">Gross Amount</div>
            <div class="detail-value">${fmt(grossAmount)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Platform Fee (5%)</div>
            <div class="detail-value" style="color:#ef4444;">${fmt(fee)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Request Date</div>
            <div class="detail-value">${fmtDate(p.created_at)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Payment Method</div>
            <div class="detail-value">${method.toUpperCase()}</div>
          </div>
        </div>
        
        <div class="payment-actions">
          <button class="action-btn btn-accept" onclick="openConfirmModal(${i})" id="accept-${i}">
            ✓ Accept
          </button>
          <button class="action-btn btn-reject" onclick="handlePayment(${i}, 'reject')" id="reject-${i}">
            ✕ Reject
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openConfirmModal(index) {
  selectedPaymentIndex = index;
  const payment = allPayments[index];
  if (!payment) return;
  
  const email = payment.user_email || payment.email || 'Unknown';
  const grossAmount = parseFloat(payment.amount || 0);
  const fee = grossAmount * 0.05;
  const netAmount = grossAmount - fee;
  const method = payment.method || 'Bank Transfer';
  const account = payment.account || '—';
  
  document.getElementById('modalDetails').innerHTML = `
    <div class="modal-detail-item">
      <div class="modal-detail-label">User Email</div>
      <div class="modal-detail-value">${email}</div>
    </div>
    <div class="modal-detail-item">
      <div class="modal-detail-label">Request ID</div>
      <div class="modal-detail-value">${payment.id || '—'}</div>
    </div>
    <div class="modal-detail-item">
      <div class="modal-detail-label">Gross Amount</div>
      <div class="modal-detail-value">${fmt(grossAmount)}</div>
    </div>
    <div class="modal-detail-item">
      <div class="modal-detail-label">Platform Fee (5%)</div>
      <div class="modal-detail-value" style="color:#ef4444;">${fmt(fee)}</div>
    </div>
    <div class="modal-detail-item full">
      <div class="modal-detail-label">Net Amount (To Transfer)</div>
      <div class="modal-detail-value highlight">${fmt(netAmount)}</div>
    </div>
    <div class="modal-detail-item">
      <div class="modal-detail-label">Payment Method</div>
      <div class="modal-detail-value">${method.toUpperCase()}</div>
    </div>
    <div class="modal-detail-item">
      <div class="modal-detail-label">Request Date</div>
      <div class="modal-detail-value">${fmtDate(payment.created_at)}</div>
    </div>
    <div class="modal-detail-item full">
      <div class="modal-detail-label">Account Details</div>
      <div class="modal-detail-value" style="font-size:14px;">${account}</div>
    </div>
    ${payment.note ? `
    <div class="modal-detail-item full">
      <div class="modal-detail-label">Note</div>
      <div class="modal-detail-value" style="font-size:14px;">${payment.note}</div>
    </div>` : ''}
  `;
  
  document.getElementById('confirmModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeConfirmModal() {
  document.getElementById('confirmModal').classList.remove('show');
  document.body.style.overflow = '';
  selectedPaymentIndex = null;
}

async function confirmPayment() {
  if (selectedPaymentIndex === null) return;
  
  const confirmBtn = document.getElementById('confirmBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = '⏳ Processing...';
  
  try {
    await handlePayment(selectedPaymentIndex, 'approve');
    closeConfirmModal();
  } catch (err) {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = '✓ Approve Payment';
  }
}

async function handlePayment(index, action) {
  const payment = allPayments[index];
  if (!payment) return;
  
  const acceptBtn = document.getElementById(`accept-${index}`);
  const rejectBtn = document.getElementById(`reject-${index}`);
  
  acceptBtn.disabled = true;
  rejectBtn.disabled = true;
  
  try {
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    await apiFetch(`/api/admin/withdrawals/${payment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    const netAmount = parseFloat(payment.amount || 0) * 0.95;
    showToast(
      action === 'approve' 
        ? `Payment approved successfully! ${fmt(netAmount)} will be transferred.`
        : 'Payment request rejected.',
      'success'
    );
    
    setTimeout(() => loadPayments(), 1000);
    
  } catch (err) {
    console.error('[Payments] handlePayment error =>', err);
    showToast(`Failed to ${action} payment: ${err.message}`, 'error');
    acceptBtn.disabled = false;
    rejectBtn.disabled = false;
  }
}

loadPayments();
