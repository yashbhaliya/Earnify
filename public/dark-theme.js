(function () {
const DARK_KEY = 'earnify_dark_mode';

function applyDarkMode(dark) {
  document.documentElement.classList.toggle('dark-mode', dark);
  if (document.body) document.body.classList.toggle('dark-mode', dark);
  document.documentElement.style.background = dark ? '#0d1117' : '';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  // update legacy toggle btn if still present
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.textContent = dark ? '☀️' : '🌙';
    btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  });
  // update neumorphic knob emoji
  const knob = document.getElementById('sbNmKnob');
  if (knob) knob.textContent = dark ? '☀️' : '🌙';
  const mobileKnob = document.getElementById('mobileNmKnob');
  if (mobileKnob) mobileKnob.textContent = dark ? '☀️' : '🌙';
}

window.toggleDarkMode = function () {
  const isDark = !document.documentElement.classList.contains('dark-mode');
  localStorage.setItem(DARK_KEY, isDark ? '1' : '0');
  applyDarkMode(isDark);
};

// Apply immediately on script load
(function () {
  const stored = localStorage.getItem(DARK_KEY);
  applyDarkMode(stored === '1');
})();

// Re-apply on DOMContentLoaded to ensure body class is set
document.addEventListener('DOMContentLoaded', function () {
  const stored = localStorage.getItem(DARK_KEY);
  applyDarkMode(stored === '1');
  // Allow background transitions only after initial paint to prevent flash
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add('dark-mode-ready');
    });
  });
});
})();