(function () {
  var DARK_KEY = 'earnify_dark_mode';

  function applyDarkMode(dark) {
    document.documentElement.classList.toggle('dark-mode', dark);
    document.documentElement.classList.toggle('light-mode', !dark);
    if (document.body) {
      document.body.classList.toggle('dark-mode', dark);
      document.body.classList.toggle('light-mode', !dark);
    }
    var knob = document.getElementById('sbNmKnob');
    if (knob) knob.textContent = dark ? '🌙' : '☀️';
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      btn.textContent = dark ? '☀️' : '🌙';
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    });
  }

  window.toggleDarkMode = function () {
    var isDark = !document.body.classList.contains('dark-mode');
    localStorage.setItem(DARK_KEY, isDark ? '1' : '0');
    applyDarkMode(isDark);
  };

  // Run immediately (works in <head> and bottom-of-body)
  var isDark = localStorage.getItem(DARK_KEY) === '1';
  applyDarkMode(isDark);

  // Also run on DOMContentLoaded to catch body + knob if script is in <head>
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyDarkMode(localStorage.getItem(DARK_KEY) === '1');
    });
  }
})();
