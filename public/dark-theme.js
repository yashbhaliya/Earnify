const DARK_KEY = 'earnify_dark_mode';

function applyDarkMode(dark) {
  document.documentElement.classList.toggle('dark-mode', dark);
  document.body.classList.toggle('dark-mode', dark);
  // update legacy toggle btn if still present
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.textContent = dark ? '☀️' : '🌙';
    btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  });
}

function toggleDarkMode() {
  const isDark = !document.body.classList.contains('dark-mode');
  localStorage.setItem(DARK_KEY, isDark ? '1' : '0');
  applyDarkMode(isDark);
}

// Apply immediately on script load — before DOMContentLoaded
(function () {
  const stored = localStorage.getItem(DARK_KEY);
  applyDarkMode(stored === '1');
})();

// Re-apply on DOMContentLoaded to ensure body class is set
document.addEventListener('DOMContentLoaded', function () {
  const stored = localStorage.getItem(DARK_KEY);
  applyDarkMode(stored === '1');
});
