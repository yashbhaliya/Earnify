let isLoggedIn = false;

document.addEventListener('DOMContentLoaded', () => {
  isLoggedIn = localStorage.getItem('userLoggedIn') === 'true' || !!localStorage.getItem('adminToken');
  updateUI();
  
  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });
});

function updateUI() {
  const userMenu        = document.getElementById('userMenu');
  const loginBtn        = document.getElementById('loginBtn');
  const signupBtn       = document.getElementById('signupBtn');
  const userName        = document.getElementById('userName');
  const userDisplayName = document.getElementById('userDisplayName');
  const userEmail       = document.getElementById('userEmail');

  const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const name  = cu.user_metadata?.name || cu.email?.split('@')[0] || 'User';
  const email = cu.email || '';

  if (isLoggedIn) {
    if (loginBtn)  loginBtn.style.display  = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (userMenu)  userMenu.style.display  = 'flex';
    if (userName)        userName.textContent        = name;
    if (userDisplayName) userDisplayName.textContent = name;
    if (userEmail)       userEmail.textContent       = email;
  } else {
    if (loginBtn)  loginBtn.style.display  = 'inline-block';
    if (signupBtn) signupBtn.style.display = 'inline-block';
    if (userMenu)  userMenu.style.display  = 'none';
  }
  updateMobileUserMenu();
}

function toggleUserDropdown() {
  const d = document.getElementById('userDropdown');
  if (d) d.style.display = d.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', e => {
  const um = document.getElementById('userMenu');
  const d  = document.getElementById('userDropdown');
  if (um && d && !um.contains(e.target)) d.style.display = 'none';
});

function toggleMobileMenu() {
  document.getElementById('mobileSidebar')?.classList.toggle('active');
  document.getElementById('mobileSidebarOverlay')?.classList.toggle('active');
  document.querySelector('.mobile-menu-btn')?.classList.toggle('active');
  document.body.classList.toggle('sidebar-open');
  updateMobileUserMenu();
}

function updateMobileUserMenu() {
  const mobileUserMenu  = document.getElementById('mobileUserMenu');
  const mobileLoginBtn  = document.getElementById('mobileLoginBtn');
  const mobileSignupBtn = document.getElementById('mobileSignupBtn');
  const mobileUserName  = document.getElementById('mobileUserName');
  const mobileUserEmail = document.getElementById('mobileUserEmail');

  const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const name  = cu.user_metadata?.name || cu.email?.split('@')[0] || 'User';
  const email = cu.email || '';

  if (isLoggedIn) {
    if (mobileLoginBtn)  mobileLoginBtn.style.display  = 'none';
    if (mobileSignupBtn) mobileSignupBtn.style.display = 'none';
    if (mobileUserMenu)  mobileUserMenu.style.display  = 'block';
    if (mobileUserName)  mobileUserName.textContent    = name;
    if (mobileUserEmail) mobileUserEmail.textContent   = email;
  } else {
    if (mobileLoginBtn)  mobileLoginBtn.style.display  = 'block';
    if (mobileSignupBtn) mobileSignupBtn.style.display = 'block';
    if (mobileUserMenu)  mobileUserMenu.style.display  = 'none';
  }
}
