// super-admin-btn.js
(async function () {
  const SUPA_URL  = 'https://emnrgsgerfjvndexomro.supabase.co';
  const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnJnc2dlcmZqdm5kZXhvbXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjAyMTAsImV4cCI6MjA4Nzk5NjIxMH0.uXr8lipxLbB4D_5JwQkpLzc-HudQw23tOFBfV4C6hqY';

  function getUser() {
    try {
      const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (cu?.email) return cu;
    } catch (e) {}
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const p = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
        if (p?.email) return { email: p.email, id: p.sub || p.id, user_metadata: {} };
      }
    } catch (e) {}
    return null;
  }

  // Works on Live Server (5500), Express (5000), and Vercel
  function getDashboardURL() {
    const port = location.port;
    if (port === '5500') return '/earnify-admin/Dashboard/index.html';
    if (port === '5000') return '/earnify-admin/Dashboard/index.html';
    return '/earnify-admin/Dashboard/';
  }

  async function run() {
    const user = getUser();
    if (!user?.id) return;

    const sidebarUser = document.getElementById('sidebarUser');
    if (!sidebarUser) return;
    if (sidebarUser.querySelector('.super-admin-btn')) return;

    try {
      const sc = window.supabase.createClient(SUPA_URL, SUPA_ANON, {
        auth: { storageKey: 'sa-check', persistSession: false, autoRefreshToken: false }
      });
      const { data } = await sc.from('profiles').select('role').eq('id', user.id).single();
      if (data?.role !== 'super_admin') return;

      const logoutLink = sidebarUser.querySelector('.logout-link, .sb-logout');
      const btn = document.createElement('a');
      btn.textContent = '🛡️ Super Admin Panel';
      btn.className = 'super-admin-btn logout-link';
      btn.style.cssText = 'background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)!important;border-radius:10px;color:#fff!important;border:none!important;outline:none!important;box-shadow:none!important;display:block;text-align:center;cursor:pointer;text-decoration:none;gap:5px';
      btn.onclick = function(e) {
        e.preventDefault();
        // Persist current UI theme before redirecting to dashboard.
        const darkNow = document.documentElement.classList.contains('dark-mode')
          || document.body.classList.contains('dark-mode');
        localStorage.setItem('earnify_dark_mode', darkNow ? '1' : '0');
        window.location.href = getDashboardURL();
      };

      if (logoutLink) sidebarUser.insertBefore(btn, logoutLink);
      else sidebarUser.appendChild(btn);
    } catch (e) {
      console.warn('[SuperAdminBtn]', e.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    setTimeout(run, 300);
  }
})();
