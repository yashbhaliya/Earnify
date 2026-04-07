const DARK_KEY = 'earnify_dark_mode';

function applyDarkMode(dark) {
  document.documentElement.classList.toggle('dark-mode', dark);
  document.body.classList.toggle('dark-mode', dark);
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.textContent = dark ? '☀️' : '🌙';
    btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  });
}

function toggleDarkMode() {
  const isDark = !document.body.classList.contains('dark-mode');
  sessionStorage.setItem(DARK_KEY, isDark ? '1' : '0');
  applyDarkMode(isDark);
}

(function () {
  // Always light on new tab — sessionStorage clears on new tab
  const stored = sessionStorage.getItem(DARK_KEY);
  applyDarkMode(stored === '1');
})();
