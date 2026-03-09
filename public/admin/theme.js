// Theme Toggle Script - Works across all admin pages
document.addEventListener('DOMContentLoaded', function() {
  const body = document.body;
  
  // Apply saved theme immediately
  const savedTheme = localStorage.getItem('adminTheme');
  if (savedTheme === 'light') {
    body.classList.add('light-mode');
  }
  
  // Theme toggle button (if exists on page)
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    // Update button text based on current theme
    if (body.classList.contains('light-mode')) {
      themeToggle.textContent = '🌙 Dark Mode';
    }
    
    // Toggle theme on click
    themeToggle.addEventListener('click', function() {
      body.classList.toggle('light-mode');
      
      if (body.classList.contains('light-mode')) {
        themeToggle.textContent = '🌙 Dark Mode';
        localStorage.setItem('adminTheme', 'light');
      } else {
        themeToggle.textContent = '☀️ Light Mode';
        localStorage.setItem('adminTheme', 'dark');
      }
    });
  }
});
