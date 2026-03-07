const API = 'http://localhost:5000/api/resources';
let allResources = [];
let currentFilter = 'all';
let isLoggedIn = false;

function checkLoginStatus() {
  isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  updateUI();
}

function updateUI() {
  if (isLoggedIn) {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('signupBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('dashboardLink').style.display = 'inline-block';
  } else {
    document.getElementById('loginBtn').style.display = 'inline-block';
    document.getElementById('signupBtn').style.display = 'inline-block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('dashboardLink').style.display = 'none';
  }
}

function showLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
}

function showSignupModal() {
  document.getElementById('signupModal').style.display = 'flex';
}

function closeSignupModal() {
  document.getElementById('signupModal').style.display = 'none';
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
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      alert('Invalid email or password!');
      return;
    }
    
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    isLoggedIn = true;
    closeLoginModal();
    updateUI();
    alert('Login successful!');
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
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
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (data.error === 'User already exists') {
        alert('User with this email already exists! Please login.');
        switchToLogin();
        return;
      }
      throw new Error(data.error);
    }
    
    // Close signup modal and open login modal
    closeSignupModal();
    alert('Account created successfully! Please login.');
    showLoginModal();
  } catch (error) {
    console.error('Signup error:', error);
    alert('Signup failed. Please try again.');
  }
}

function logout() {
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('currentUser');
  isLoggedIn = false;
  updateUI();
  alert('Logged out successfully!');
}

async function loadResources() {
  try {
    const res = await fetch(API);
    allResources = await res.json();
    displayResources(allResources);
  } catch (error) {
    console.error('Error loading resources:', error);
    document.getElementById('resourcesGrid').innerHTML = 
      '<p style="text-align: center; color: #666;">Unable to load resources. Please try again later.</p>';
  }
}

function displayResources(resources) {
  const grid = document.getElementById('resourcesGrid');
  
  if (!resources || resources.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: #666;">No resources available yet.</p>';
    return;
  }

  const icons = { pdf: '📄', excel: '📊', exam: '📝', freelance: '💼' };
  
  grid.innerHTML = resources.map(r => `
    <div class="resource-card">
      <span class="resource-type">${icons[r.type] || '📦'} ${r.type.toUpperCase()}</span>
      <h3>${r.title}</h3>
      <p>${r.description}</p>
      <div class="resource-price">₹${r.price}</div>
      <button class="buy-btn" onclick="buyResource(${r.id})">Buy Now</button>
    </div>
  `).join('');
}

function filterResources(type) {
  currentFilter = type;
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Filter resources
  const filtered = type === 'all' 
    ? allResources 
    : allResources.filter(r => r.type === type);
  
  displayResources(filtered);
}

function buyResource(id) {
  if (!isLoggedIn) {
    alert('Please login to purchase resources');
    showLoginModal();
    return;
  }
  
  window.location.href = '/payment.html';
}

// Load resources and check login on page load
loadResources();
checkLoginStatus();
