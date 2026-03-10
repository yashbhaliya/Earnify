const API = 'http://localhost:5000/api/resources';
let allResources = [];
let currentFilter = 'all';
let isLoggedIn = false;

function checkLoginStatus() {
  isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  updateUI();
}

function updateUI() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (isLoggedIn) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (signupBtn) signupBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
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
        emailRedirectTo: 'http://127.0.0.1:5500/public/index.html'
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
  await supabaseClient.auth.signOut();
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
    
    // Get user's purchases if logged in
    let userPurchases = [];
    if (isLoggedIn) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser) {
        try {
          const purchaseRes = await fetch(`http://localhost:5000/api/payments/${currentUser.id}`);
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
    document.getElementById('resourcesGrid').innerHTML = 
      '<p style="text-align: center; color: #666;">Unable to load resources. Please try again later.</p>';
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
      fetch(`http://localhost:5000/api/payments/${currentUser.id}`)
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
  
  if (!resources || resources.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: #666;">No resources available yet.</p>';
    return;
  }

  const icons = { pdf: '📄', excel: '📊', exam: '📝', freelance: '💼' };
  const purchasedIds = userPurchases.map(p => p.resource_id);
  
  grid.innerHTML = resources.map(r => {
    const isPurchased = purchasedIds.includes(r.id);
    const purchasedItem = userPurchases.find(p => p.resource_id === r.id);
    
    return `
    <div class="resource-card" onclick="viewDetails(${r.id})" style="cursor: pointer;">
      <span class="resource-type">${icons[r.type] || '📦'} ${r.type.toUpperCase()}</span>
      <h3>${r.title}</h3>
      <p>${r.description}</p>
      <div class="resource-price" style="${isPurchased ? 'color: #10b981;' : ''}">${isPurchased ? '✅ Already Purchased' : '₹' + r.price}</div>
      ${isPurchased ? 
        `<a href="${purchasedItem?.resources?.fileurl || '#'}" ${purchasedItem?.resources?.fileurl ? 'download' : ''} class="buy-btn" onclick="event.stopPropagation();" style="display: block; text-align: center; text-decoration: none; background: #10b981;">📥 Download</a>` 
        : 
        `<button class="buy-btn" onclick="event.stopPropagation(); buyResource(${r.id})">Buy Now</button>`
      }
    </div>
  `;
  }).join('');
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
  
  // Get user purchases if logged in
  let userPurchases = [];
  if (isLoggedIn) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      fetch(`http://localhost:5000/api/payments/${currentUser.id}`)
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
  window.location.href = `details.html?id=${id}`;
}

function buyResource(id) {
  window.location.href = `details.html?id=${id}`;
}

// Handle email verification callback
async function handleEmailVerification() {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const type = hashParams.get('type');
  
  if (type === 'signup' || type === 'email') {
    const { data, error } = await supabaseClient.auth.getSession();
    
    if (data.session) {
      await supabaseClient.auth.signOut();
    }
    
    alert('Email verified successfully! Please login to continue.');
    window.location.hash = '';
    showLoginModal();
  }
}

// Load resources and check login on page load
loadResources();
checkLoginStatus();
handleEmailVerification();
