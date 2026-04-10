(function () {
  var DARK_KEY = 'earnify_dark_mode';

  function applyDarkMode(dark) {
    var html = document.documentElement;
    var body = document.body;

    html.classList.toggle('dark-mode', dark);
    html.classList.toggle('light-mode', !dark);
    if (body) {
      body.classList.toggle('dark-mode', dark);
      body.classList.toggle('light-mode', !dark);
    }

    var knob = document.getElementById('sbNmKnob');
    if (knob) knob.textContent = dark ? '🌙' : '☀️';
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      btn.textContent = dark ? '☀️' : '🌙';
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    });

    var main = document.querySelector('.main');
    if (main) {
      main.classList.toggle('dark-mode', dark);
      main.classList.toggle('light-mode', !dark);
    }

    var sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('dark-mode', dark);
      sidebar.classList.toggle('light-mode', !dark);
    }

    var btnAll = document.getElementById('btnAllResources');
    var btnPur = document.getElementById('btnPurchases');
    if (btnAll || btnPur) {
      if (dark) {
        if (btnAll) btnAll.style.cssText = 'padding:10px 22px !important;border-radius:10px !important;border:2px solid #7c6af7 !important;background:linear-gradient(135deg,#7c6af7,#5b4fcf) !important;color:#fff !important;font-size:14px !important;font-weight:700 !important;cursor:pointer !important;font-family:inherit !important;';
        if (btnPur) btnPur.style.cssText = 'padding:10px 22px !important;border-radius:10px !important;border:2px solid #30363d !important;background:#1c2333 !important;color:#8b949e !important;font-size:14px !important;font-weight:700 !important;cursor:pointer !important;font-family:inherit !important;';
      } else {
        if (btnAll) btnAll.style.cssText = 'padding:10px 22px;border-radius:10px;border:2px solid #667eea;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;';
        if (btnPur) btnPur.style.cssText = 'padding:10px 22px;border-radius:10px;border:2px solid #e2e8f0;background:#fff;color:#64748b;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;';
      }
    }
  }

  window.toggleDarkMode = function () {
    var isDark = !document.body.classList.contains('dark-mode');
    localStorage.setItem(DARK_KEY, isDark ? '1' : '0');
    applyDarkMode(isDark);
  };

  // Apply once on DOMContentLoaded only
  document.addEventListener('DOMContentLoaded', function () {
    applyDarkMode(localStorage.getItem(DARK_KEY) === '1');
  });
})();
