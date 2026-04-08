const DARK_KEY = 'earnify_dark_mode';

function applyAdminDark(dark) {
  document.documentElement.classList.toggle('dark-mode', dark);
  if (!document.body) return;
  document.body.classList.toggle('dark-mode', dark);

  document.querySelectorAll('.nm-toggle-knob').forEach(knob => {
    knob.textContent = dark ? '🌙' : '☀️';
  });

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

function toggleDarkMode() { toggleAdminDark(); }

(function () {
  const saved = sessionStorage.getItem(DARK_KEY);
  const isDark = saved === '1';
  if (document.body) {
    document.documentElement.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('dark-mode', isDark);
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  if (!document.body) return;
  const isDark = document.body.classList.contains('dark-mode');
  applyAdminDark(isDark);
});
