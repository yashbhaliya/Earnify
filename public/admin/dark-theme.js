(function () {
  var DARK_KEY = 'earnify_dark_mode';

  function applyDarkMode(dark) {
    var html = document.documentElement;
    var body = document.body;

    html.classList.toggle('dark-mode', dark);
    if (body) body.classList.toggle('dark-mode', dark);

    // Clear inline background so light mode CSS takes over
    html.style.background = dark ? '#0d1117' : '';
    html.style.colorScheme = dark ? 'dark' : 'light';
    if (body) body.style.background = '';

    var knob = document.getElementById('sbNmKnob');
    if (knob) knob.textContent = dark ? '🌙' : '☀️';
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      btn.textContent = dark ? '☀️' : '🌙';
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    });

    var btnAll = document.getElementById('btnAllResources');
    var btnPur = document.getElementById('btnPurchases');
    if (btnAll || btnPur) {
      if (dark) {
        if (btnAll) btnAll.style.cssText = 'padding:10px 22px !important;border-radius:10px !important;color:#fff !important;font-size:14px !important;font-weight:700 !important;cursor:pointer !important;font-family:inherit !important;';
        if (btnPur) btnPur.style.cssText = 'padding:10px 22px !important;border-radius:10px !important;border:2px solid #30363d !important;background:#1c2333 !important;color:white !important;font-size:14px !important;font-weight:700 !important;cursor:pointer !important;font-family:inherit !important;';
      } else {
        if (btnAll) btnAll.style.cssText = 'padding:10px 22px;border-radius:10px;background:white;color:;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;';
        if (btnPur) btnPur.style.cssText = 'padding:10px 22px;border-radius:10px;border:2px solid #e2e8f0;background:#fff;color:#64748b;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;';
      }
    }
  }

  window.toggleDarkMode = function () {
    var isDark = !document.documentElement.classList.contains('dark-mode');
    localStorage.setItem(DARK_KEY, isDark ? '1' : '0');
    applyDarkMode(isDark);
  };

  // Apply immediately so html+body are in sync before paint
  applyDarkMode(localStorage.getItem(DARK_KEY) === '1');

  // Re-apply on DOMContentLoaded to catch body and knob
  document.addEventListener('DOMContentLoaded', function () {
    applyDarkMode(localStorage.getItem(DARK_KEY) === '1');
  });
})();
