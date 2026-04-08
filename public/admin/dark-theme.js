const DARK_KEY = 'earnify_dark_mode';

function applyDarkMode(dark) {
  document.documentElement.classList.toggle('dark-mode', dark);
  document.body.classList.toggle('dark-mode', dark);

  // Sync header emoji button
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.textContent = dark ? '☀️' : '🌙';
    btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  });

  // Sync sidebar neumorphic knob icon
  const knob = document.getElementById('sbNmKnob');
  if (knob) knob.textContent = dark ? '🌙' : '☀️';
}

function toggleDarkMode() {
  const isDark = !document.body.classList.contains('dark-mode');
  sessionStorage.setItem(DARK_KEY, isDark ? '1' : '0');
  applyDarkMode(isDark);
}

(function () {
  const stored = sessionStorage.getItem(DARK_KEY);
  applyDarkMode(stored === '1');
})();
