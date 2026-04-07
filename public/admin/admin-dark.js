const DARK_KEY = 'earnify_dark_mode';

function applyAdminDark(dark) {
  document.documentElement.classList.toggle('dark-mode', dark);
  if (!document.body) return;
  document.body.classList.toggle('dark-mode', dark);
  document.querySelectorAll('.admin-dark-btn, .theme-toggle-btn').forEach(btn => {
    btn.textContent = dark ? '☀️' : '🌙';
    btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  });
}

function toggleAdminDark() {
  if (!document.body) return;
  const isDark = !document.body.classList.contains('dark-mode');
  localStorage.setItem(DARK_KEY, isDark ? '1' : '0');
  applyAdminDark(isDark);
}

// Alias for compatibility with theme-toggle-btn class
function toggleDarkMode() {
  toggleAdminDark();
}

// Apply immediately to body (prevents flash)
(function () {
  const saved = localStorage.getItem(DARK_KEY);
  const isDark = saved === '1';
  if (saved === null) localStorage.setItem(DARK_KEY, '0');
  if (document.body) {
    document.body.classList.toggle('dark-mode', isDark);
  }
})();

// Update button icons once DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  if (!document.body) return;
  const isDark = document.body.classList.contains('dark-mode');
  document.querySelectorAll('.admin-dark-btn, .theme-toggle-btn').forEach(btn => {
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  });
});
