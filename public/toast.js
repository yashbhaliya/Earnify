// Global Toast/Popup — replaces all alert() calls site-wide
// Usage: showToast('message')  or  showToast('message', 'success'|'error'|'warning'|'info')

(function() {
  function ensureContainer() {
    let c = document.getElementById('_toastContainer');
    if (!c) {
      c = document.createElement('div');
      c.id = '_toastContainer';
      c.style.cssText = [
        'position:fixed', 'top:20px', 'right:20px', 'z-index:999999',
        'display:flex', 'flex-direction:column', 'gap:10px',
        'pointer-events:none', 'max-width:360px', 'width:calc(100vw - 40px)'
      ].join(';');
      document.body.appendChild(c);
    }
    return c;
  }

  const ICONS = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️'
  };

  const COLORS = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534', bar: '#22c55e' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', bar: '#ef4444' },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', bar: '#f59e0b' },
    info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', bar: '#3b82f6' }
  };

  window.showToast = function(message, type = 'info', duration = 3500) {
    const c = ensureContainer();
    const col = COLORS[type] || COLORS.info;
    const icon = ICONS[type] || ICONS.info;

    const toast = document.createElement('div');
    toast.style.cssText = [
      'pointer-events:all',
      'display:flex', 'align-items:flex-start', 'gap:10px',
      `background:${col.bg}`,
      `border:1.5px solid ${col.border}`,
      `color:${col.text}`,
      'border-radius:12px',
      'padding:14px 16px',
      'box-shadow:0 8px 24px rgba(0,0,0,0.12)',
      'font-family:Inter,sans-serif',
      'font-size:14px', 'font-weight:500',
      'line-height:1.5',
      'position:relative', 'overflow:hidden',
      'opacity:0',
      'transform:translateX(40px)',
      'transition:opacity 0.3s ease, transform 0.3s ease',
      'cursor:pointer'
    ].join(';');

    toast.innerHTML = `
      <span style="font-size:18px;flex-shrink:0;margin-top:1px;">${icon}</span>
      <span style="flex:1;">${message}</span>
      <span style="font-size:18px;opacity:0.5;flex-shrink:0;margin-top:-1px;line-height:1;">&times;</span>
      <div style="position:absolute;bottom:0;left:0;height:3px;background:${col.bar};border-radius:0 0 12px 12px;width:100%;transform-origin:left;animation:_toastBar ${duration}ms linear forwards;"></div>
    `;

    // inject keyframe once
    if (!document.getElementById('_toastStyle')) {
      const s = document.createElement('style');
      s.id = '_toastStyle';
      s.textContent = `@keyframes _toastBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}`;
      document.head.appendChild(s);
    }

    const remove = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => toast.remove(), 300);
    };

    toast.addEventListener('click', remove);
    c.appendChild(toast);

    // trigger animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    setTimeout(remove, duration);
  };

  // Override native alert globally
  window._nativeAlert = window.alert;
  window.alert = function(msg) {
    // detect type from message content
    const m = String(msg).toLowerCase();
    let type = 'info';
    if (m.includes('success') || m.includes('created') || m.includes('updated') || m.includes('verified') || m.includes('saved')) type = 'success';
    else if (m.includes('error') || m.includes('fail') || m.includes('invalid') || m.includes('wrong') || m.includes('not found')) type = 'error';
    else if (m.includes('please') || m.includes('must') || m.includes('cannot') || m.includes('select')) type = 'warning';
    showToast(msg, type);
  };
})();
