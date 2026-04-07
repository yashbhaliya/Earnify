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
  sessionStorage.setItem(DARK_KEY, isDark ? '1' : '0');
  applyAdminDark(isDark);
}

function toggleDarkMode() {
  toggleAdminDark();
}

// Apply immediately to body (prevents flash)
(function () {
  // Always light on new tab — sessionStorage clears on new tab
  const saved = sessionStorage.getItem(DARK_KEY);
  const isDark = saved === '1';
  if (document.body) {
    document.documentElement.classList.toggle('dark-mode', isDark);
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
