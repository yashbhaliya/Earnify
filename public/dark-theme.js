const DARK_KEY = 'earnify_dark_mode';

function applyDarkMode(dark) {
  document.body.classList.toggle('dark-mode', dark);
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

(function () {
  const stored = localStorage.getItem(DARK_KEY);
  // Default to dark mode if no preference saved yet
  applyDarkMode(stored === null ? true : stored === '1');
})();
