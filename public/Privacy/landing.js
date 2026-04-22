// API Configuration will be loaded from api-config.js
let allResources = [];
let currentFilter = 'all';
let isLoggedIn = false;
let currentPage = 1;
const itemsPerPage = 12;

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  loadResources();
  loadSiteSettings();
});

function loadSiteSettings() {
  const siteSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
  
  // Update site name in navbar
  const logoElement = document.querySelector('.logo');
  if (logoElement && siteSettings.siteName) {
    logoElement.textContent = siteSettings.siteLogo || siteSettings.siteName;
  }
  
  // Update page title
  if (siteSettings.siteName) {
    document.title = siteSettings.siteName + ' - Your Learning Marketplace';
  }
}

function checkLoginStatus() {
  isLoggedIn = localStorage.getItem('userLoggedIn') === 'true' || localStorage.getItem('adminToken') !== null;
  updateUI();
}

function updateUI() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const userMenu = document.getElementById('userMenu');
  const userName = document.getElementById('userName');
  const userDisplayName = document.getElementById('userDisplayName');
  const userEmail = document.getElementById('userEmail');
  
  if (isLoggedIn) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const displayName = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User';
    const email = currentUser.email || '';
    if (userName) userName.textContent = displayName;
    if (userDisplayName) userDisplayName.textContent = displayName;
    if (userEmail) userEmail.textContent = email;
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (signupBtn) signupBtn.style.display = 'inline-block';
    if (userMenu) userMenu.style.display = 'none';
  }
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const userMenu = document.getElementById('userMenu');
  const dropdown = document.getElementById('userDropdown');
  if (userMenu && dropdown && !userMenu.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

function showLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
  if (typeof _amTab === 'function') _amTab('login');
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
}

function showSignupModal() {
  document.getElementById('loginModal').style.display = 'flex';
  if (typeof _amTab === 'function') _amTab('signup');
}

function closeSignupModal() {
  document.getElementById('loginModal').style.display = 'none';
}

function switchToSignup() {
  closeLoginModal();
  showSignupModal();
}

function switchToLogin() {
  closeSignupModal();
  showLoginModal();
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      alert(error.message);
      return;
    }
    
    if (!data.user.email_confirmed_at) {
      alert('Please verify your email before logging in!');
      await supabaseClient.auth.signOut();
      return;
    }
    
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    localStorage.setItem('adminToken', data.session.access_token);
    isLoggedIn = true;
    closeLoginModal();
    updateUI();
    alert('Login successful!');
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + error.message);
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  
  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters long!');
    return;
  }
  
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin + '/'
      }
    });
    
    if (error) {
      if (error.message.includes('confirmation email')) {
        alert('SMTP not configured. Please contact admin or disable email verification in Supabase settings.');
      } else {
        alert(error.message);
      }
      throw error;
    }
    
    closeSignupModal();
    alert('Verification email sent! Please check your inbox and verify your email before logging in.');
  } catch (error) {
    console.error('Signup error:', error);
  }
}

async function logout() {
  try {
    await supabaseClient.auth.signOut();
  } catch (error) {
    console.log('Supabase signout error:', error);
  }
  
  // Clear all authentication data
  localStorage.removeItem('adminToken');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('adminUser');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  sessionStorage.clear();
  
  isLoggedIn = false;
  updateUI();
  
  // Reliable redirect to main index page
  window.location.href = '../';
  setTimeout(() => {
    window.location.replace('../');
  }, 100);
}

function viewProfile() {
  // Close dropdown first
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.style.display = 'none';
  
  // Redirect to admin resources page
  window.location.href = 'admin/resources.html';
}

async function loadResources() {
  const grid = document.getElementById('resourcesGrid');
  
  // Show shimmer loading cards
  if (grid) {
    grid.innerHTML = Array(6).fill(0).map(() => `
      <div class="shimmer-card">
        <div class="shimmer shimmer-icon"></div>
        <div class="shimmer shimmer-type"></div>
        <div class="shimmer shimmer-title"></div>
        <div class="shimmer shimmer-description"></div>
        <div class="shimmer shimmer-description"></div>
        <div class="shimmer shimmer-price"></div>
        <div class="shimmer shimmer-button"></div>
      </div>
    `).join('');
  }
  
  try {
    const res = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.resources));
    allResources = await res.json();
    
    // Get user's purchases if logged in
    let userPurchases = [];
    if (isLoggedIn) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser) {
        try {
          const purchaseRes = await fetch(API_CONFIG.getURL(`${API_CONFIG.endpoints.payments}/${currentUser.id}`));
          if (purchaseRes.ok) {
            userPurchases = await purchaseRes.json();
          }
        } catch (err) {
          console.log('Could not fetch purchases');
        }
      }
    }
    
    displayResources(allResources, userPurchases);
  } catch (error) {
    console.error('Error loading resources:', error);
    const grid = document.getElementById('resourcesGrid');
    if (grid) {
      grid.innerHTML = '<p style="text-align: center; color: #666;">Unable to load resources. Please try again later.</p>';
    }
  }
}

function searchResources() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allResources.filter(resource => {
    const title = (resource.title || '').toLowerCase();
    const type = (resource.type || '').toLowerCase();
    const description = (resource.description || '').toLowerCase();
    const price = (resource.price || '').toString();
    
    return title.includes(searchTerm) || 
           type.includes(searchTerm) || 
           description.includes(searchTerm) ||
           price.includes(searchTerm);
  });
  
  // Get user purchases if logged in
  let userPurchases = [];
  if (isLoggedIn) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      fetch(API_CONFIG.getURL(`${API_CONFIG.endpoints.payments}/${currentUser.id}`))
        .then(res => res.ok ? res.json() : [])
        .then(purchases => displayResources(filtered, purchases))
        .catch(() => displayResources(filtered, []));
      return;
    }
  }
  
  displayResources(filtered, userPurchases);
}

function displayResources(resources, userPurchases = []) {
  const grid = document.getElementById('resourcesGrid');
  
  if (!grid) return;
  
  if (!resources || resources.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: #666;">No resources available yet.</p>';
    const paginationDiv = document.querySelector('.pagination');
    if (paginationDiv) paginationDiv.innerHTML = '';
    return;
  }
  
  const purchasedIds = userPurchases.map(p => p.resource_id);
  const totalPages = Math.ceil(resources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResources = resources.slice(startIndex, startIndex + itemsPerPage);
  
  grid.innerHTML = paginatedResources.map(resource => {
    const isPurchased = purchasedIds.includes(resource.id);
    const icons = { pdf: '📄', excel: '📊', exam: '📝', freelance: '💼' };
    const icon = icons[resource.type] || '📦';
    
    return `
      <div class="resource-card" onclick="viewDetails(${resource.id})" style="cursor: pointer;">
        <div class="resource-icon">${icon}</div>
        <h3>${resource.title}</h3>
        <p>${resource.description}</p>
        <div class="resource-price">₹${resource.price}</div>
        <div class="resource-type">${resource.type.toUpperCase()}</div>
        ${isPurchased ? 
          '<button class="btn-purchased" disabled onclick="event.stopPropagation()">✓ Purchased</button>' :
          `<button class="btn-buy" onclick="event.stopPropagation(); buyResource(${resource.id})">Buy Now</button>`
        }
      </div>
    `;
  }).join('');
  
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  let paginationDiv = document.querySelector('.pagination');
  if (!paginationDiv) {
    paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    document.querySelector('.resources-section .container').appendChild(paginationDiv);
  }
  
  // Only show pagination if there are more than 12 resources (more than 1 page)
  if (totalPages <= 1) {
    paginationDiv.style.display = 'none';
    return;
  }
  
  paginationDiv.style.display = 'flex';
  let html = '<div class="pagination-buttons">';
  html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    html += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
  }
  
  html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;
  html += '</div>';
  paginationDiv.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  const filtered = currentFilter === 'all' ? allResources : allResources.filter(r => r.type === currentFilter);
  
  let userPurchases = [];
  if (isLoggedIn) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      fetch(API_CONFIG.getURL(`${API_CONFIG.endpoints.payments}/${currentUser.id}`))
        .then(res => res.ok ? res.json() : [])
        .then(purchases => displayResources(filtered, purchases))
        .catch(() => displayResources(filtered, []));
      return;
    }
  }
  displayResources(filtered, userPurchases);
}

function filterResources(type) {
  currentFilter = type;
  currentPage = 1;
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Filter resources
  const filtered = type === 'all' 
    ? allResources 
    : allResources.filter(r => r.type === type);
  
  // Get user purchases if logged in
  let userPurchases = [];
  if (isLoggedIn) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      fetch(API_CONFIG.getURL(`${API_CONFIG.endpoints.payments}/${currentUser.id}`))
        .then(res => res.ok ? res.json() : [])
        .then(purchases => displayResources(filtered, purchases))
        .catch(() => displayResources(filtered, []));
      return;
    }
  }
  
  displayResources(filtered, userPurchases);
}

function viewDetails(id) {
  console.log('Navigating to details page for resource:', id);
  window.location.href = `Detail/?id=${id}`;
}

function buyResource(id) {
  window.location.href = `Detail/?id=${id}`;
}

// Handle email verification callback
async function handleEmailVerification() {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const type = hashParams.get('type');
  const accessToken = hashParams.get('access_token');
  
  // If we have an access_token, it means email was verified
  if (accessToken) {
    alert('Email verified successfully!');
    // Clean the URL hash
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }
  
  if (type === 'signup' || type === 'email') {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) {
      await supabaseClient.auth.signOut();
    }
    alert('Email verified successfully! Please login to continue.');
    window.location.hash = '';
  }
}

// Handle email verification from URL
handleEmailVerification();


// Mobile Menu Toggle Function
function toggleMobileMenu() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('mobileSidebarOverlay');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const body = document.body;
  
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
  menuBtn.classList.toggle('active');
  body.classList.toggle('sidebar-open');
  
  // Update mobile user menu visibility
  updateMobileUserMenu();
}

function updateMobileUserMenu() {
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const mobileSignupBtn = document.getElementById('mobileSignupBtn');
  const mobileUserMenu = document.getElementById('mobileUserMenu');
  const mobileUserName = document.getElementById('mobileUserName');
  const mobileUserEmail = document.getElementById('mobileUserEmail');
  
  if (isLoggedIn) {
    if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
    if (mobileSignupBtn) mobileSignupBtn.style.display = 'none';
    if (mobileUserMenu) mobileUserMenu.style.display = 'block';
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const displayName = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User';
    const email = currentUser.email || '';
    
    if (mobileUserName) mobileUserName.textContent = displayName;
    if (mobileUserEmail) mobileUserEmail.textContent = email;
  } else {
    if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
    if (mobileSignupBtn) mobileSignupBtn.style.display = 'block';
    if (mobileUserMenu) mobileUserMenu.style.display = 'none';
  }
}

// Update mobile menu on login/logout
const originalUpdateUI = updateUI;
updateUI = function() {
  originalUpdateUI();
  updateMobileUserMenu();
};
