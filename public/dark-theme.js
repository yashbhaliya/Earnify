(function () {
const DARK_KEY = 'earnify_dark_mode';

// Inject html.dark-mode toggle CSS once — fixes knob flash on ALL pages on refresh
(function injectToggleFlashFix() {
  if (document.getElementById('nm-toggle-flash-fix')) return;
  var s = document.createElement('style');
  s.id = 'nm-toggle-flash-fix';
  s.textContent =
    'html.dark-mode .sb-nm-toggle{background:#1e2535!important;box-shadow:4px 4px 8px #0d1117,-3px -3px 7px #2d3a4a!important;}' +
    'html.dark-mode .sb-nm-knob{left:52px!important;background:linear-gradient(135deg,#3a4a5c,#2d3748)!important;box-shadow:2px 2px 5px #0d1117,-1px -1px 4px #3a4a5c!important;}' +
    'html.dark-mode .sb-nm-label-light{opacity:0!important;}' +
    'html.dark-mode .sb-nm-label-dark{opacity:1!important;}';
  document.head.appendChild(s);
})();

function applyDarkMode(dark) {
  document.documentElement.classList.toggle('dark-mode', dark);
  if (document.body) document.body.classList.toggle('dark-mode', dark);
  document.documentElement.style.background = dark ? '#0d1117' : '';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  // update legacy toggle btn if still present
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.textContent = dark ? '\u2600\ufe0f' : '\ud83c\udf19';
    btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  });
  // update neumorphic knob emoji
  const knob = document.getElementById('sbNmKnob');
  if (knob) knob.textContent = dark ? '\u2600\ufe0f' : '\ud83c\udf19';
  const mobileKnob = document.getElementById('mobileNmKnob');
  if (mobileKnob) mobileKnob.textContent = dark ? '\u2600\ufe0f' : '\ud83c\udf19';
}

window.toggleDarkMode = function () {
  const isDark = !document.documentElement.classList.contains('dark-mode');
  localStorage.setItem(DARK_KEY, isDark ? '1' : '0');
  applyDarkMode(isDark);
};

// Apply immediately on script load + set correct knob emoji
(function () {
  const dark = localStorage.getItem(DARK_KEY) === '1';
  applyDarkMode(dark);
  // Set knob emoji immediately — no flash on refresh
  const knob = document.getElementById('sbNmKnob');
  if (knob) knob.textContent = dark ? '\u2600\ufe0f' : '\ud83c\udf19';
  const mobileKnob = document.getElementById('mobileNmKnob');
  if (mobileKnob) mobileKnob.textContent = dark ? '\u2600\ufe0f' : '\ud83c\udf19';
})();

// Re-apply on DOMContentLoaded to ensure body class is set
document.addEventListener('DOMContentLoaded', function () {
  const dark = localStorage.getItem(DARK_KEY) === '1';
  applyDarkMode(dark);
  // Allow background transitions only after initial paint to prevent flash
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add('dark-mode-ready');
    });
  });
});
})();