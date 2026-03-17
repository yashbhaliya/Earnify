let currentResource = null;
let isLoggedIn = false;
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  loadResourceDetails();
  loadSiteSettings();
  
  // Handle window resize for responsive layout
  window.addEventListener('resize', () => {
    if (currentResource) {
      // Check if user already purchased this item
      let isPurchased = false;
      if (isLoggedIn && currentUser) {
        fetch(API_CONFIG.getURL(`${API_CONFIG.endpoints.payments}/${currentUser.id}`))
          .then(res => res.ok ? res.json() : [])
          .then(purchases => {
            isPurchased = purchases.some(p => p.resource_id === currentResource.id);
            displayResourceDetails(isPurchased);
          })
          .catch(() => displayResourceDetails(false));
      } else {
        displayResourceDetails(false);
      }
    }
  });
});

function loadSiteSettings() {
  const siteSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
  const logoElement = document.querySelector('.logo');
  if (logoElement && siteSettings.siteName) {
    logoElement.textContent = siteSettings.siteLogo || siteSettings.siteName;
  }
  if (siteSettings.siteName) {
    document.title = siteSettings.siteName + ' - Resource Details';
  }
}

function checkLoginStatus() {
  isLoggedIn = localStorage.getItem('userLoggedIn') === 'true' || localStorage.getItem('adminToken') !== null;
  const userStr = localStorage.getItem('currentUser');
  currentUser = userStr ? JSON.parse(userStr) : null;
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
    
    const displayName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User';
    const email = currentUser?.email || '';
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

document.addEventListener('click', (e) => {
  const userMenu = document.getElementById('userMenu');
  const dropdown = document.getElementById('userDropdown');
  if (userMenu && dropdown && !userMenu.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

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
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    
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
    currentUser = data.user;
    closeLoginModal();
    updateUI();
    alert('Login successful!');
    loadResourceDetails();
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
        emailRedirectTo: window.location.origin + '../'
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
  localStorage.removeItem('adminToken');
  isLoggedIn = false;
  currentUser = null;
  updateUI();
  window.location.href = '../index.html';
}

function viewProfile() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.style.display = 'none';
  window.location.href = '../admin/resources.html';
}

async function loadResourceDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const resourceId = urlParams.get('id');
  
  console.log('Loading resource with ID:', resourceId);
  console.log('Current URL:', window.location.href);
  
  if (!resourceId) {
    console.error('No resource ID found in URL');
    document.getElementById('resourceDetails').innerHTML = 
      '<p class="loading">No resource ID provided. <a href="../Dashboard/">Return to Dashboard</a></p>';
    document.getElementById('purchaseCard').innerHTML = 
      '<p class="loading">Unable to load resource.</p>';
    return;
  }
  
  // Show shimmer loading
  showShimmerLoading();
  
  try {
    console.log('Fetching resources from:', API_CONFIG.getURL(API_CONFIG.endpoints.resources));
    const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.resources));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const resources = await response.json();
    console.log('All resources:', resources);
    
    currentResource = resources.find(r => r.id == resourceId);
    console.log('Found resource:', currentResource);
    
    if (!currentResource) {
      console.error('Resource not found with ID:', resourceId);
      document.getElementById('resourceDetails').innerHTML = 
        '<p class="loading">Resource not found. <a href="../Dashboard/">Return to Dashboard</a></p>';
      document.getElementById('purchaseCard').innerHTML = 
        '<p class="loading">Resource not available.</p>';
      return;
    }
    
    // Check if user already purchased this item
    let isPurchased = false;
    if (isLoggedIn && currentUser) {
      try {
        const purchaseRes = await fetch(API_CONFIG.getURL(`${API_CONFIG.endpoints.payments}/${currentUser.id}`));
        if (purchaseRes.ok) {
          const purchases = await purchaseRes.json();
          isPurchased = purchases.some(p => p.resource_id === currentResource.id);
        }
      } catch (err) {
        console.log('Could not check purchases:', err);
      }
    }
    
    // Add a loading delay to show shimmer effect properly
    setTimeout(() => {
      displayResourceDetails(isPurchased);
    }, 1200);
    
  } catch (error) {
    console.error('Error loading resource:', error);
    document.getElementById('resourceDetails').innerHTML = 
      `<p class="loading">Failed to load resource details: ${error.message}. <a href="../Dashboard/">Return to Dashboard</a></p>`;
    document.getElementById('purchaseCard').innerHTML = 
      '<p class="loading">Failed to load purchase options.</p>';
  }
}

function showShimmerLoading() {
  document.getElementById('breadcrumbTitle').innerHTML = '<div class="shimmer-element" style="width:180px;height:14px;display:inline-block;border-radius:4px;"></div>';

  const isMobile = window.innerWidth <= 968;

  document.getElementById('resourceDetails').innerHTML = `
    <div class="shimmer-element shimmer-badge"></div>
    <div class="shimmer-element shimmer-title"></div>
    <div class="shimmer-element shimmer-desc"></div>
    <div class="shimmer-element shimmer-desc shimmer-desc-mid"></div>
    <div class="shimmer-element shimmer-desc shimmer-desc-short"></div>
    ${isMobile ? `
    <div class="shimmer-mobile-price">
      <div class="shimmer-element shimmer-price-label"></div>
      <div class="shimmer-element shimmer-price"></div>
    </div>
    <div class="shimmer-element shimmer-button"></div>
    ` : ''}
    <div class="shimmer-features">
      <div class="shimmer-element shimmer-features-title"></div>
      <div class="shimmer-element shimmer-feature-item"></div>
      <div class="shimmer-element shimmer-feature-item"></div>
      <div class="shimmer-element shimmer-feature-item"></div>
      <div class="shimmer-element shimmer-feature-item shimmer-feature-item-short"></div>
    </div>
  `;

  document.getElementById('purchaseCard').innerHTML = !isMobile ? `
    <div class="shimmer-price-section">
      <div class="shimmer-element shimmer-price-label"></div>
      <div class="shimmer-element shimmer-price"></div>
    </div>
    <div class="shimmer-element shimmer-button"></div>
    <div class="shimmer-info-section">
      <div class="shimmer-element shimmer-info-item"></div>
      <div class="shimmer-element shimmer-info-item shimmer-info-item-mid"></div>
      <div class="shimmer-element shimmer-info-item shimmer-info-item-short"></div>
    </div>
  ` : '';
}

function displayResourceDetails(isPurchased = false) {
  const icons = { pdf: '📄', excel: '📊', exam: '📝', freelance: '💼' };
  const icon = icons[currentResource.type] || '📦';
  
  document.getElementById('breadcrumbTitle').textContent = currentResource.title;
  
  // Create mobile price section HTML
  let mobilePriceSection = '';
  if (window.innerWidth <= 968) {
    if (isPurchased) {
      mobilePriceSection = `
        <div class="price-section" style="text-align: center; padding: 2rem 0; border: 2px solid #e2e8f0; border-radius: 16px; margin: 2rem 0; background: white;">
          <div class="price-label" style="color: #10b981; font-size: 18px; font-weight: 600;">✅ Already Purchased</div>
        </div>
        <a href="${currentResource.fileurl || '#'}" ${currentResource.fileurl ? 'download' : ''} class="buy-button" style="width: 100%; padding: 1.3rem; background: #10b981; color: white; border: none; border-radius: 16px; font-size: 1.2rem; font-weight: 700; cursor: pointer; text-decoration: none; display: block; text-align: center; margin-bottom: 2rem;">📥 Download Content</a>
      `;
    } else {
      mobilePriceSection = `
        <div class="price-section" style="text-align: center; padding: 2rem 0; border: 2px solid #e2e8f0; border-radius: 16px; margin: 2rem 0; background: white;">
          <div class="price-label" style="color: #718096; font-size: 0.95rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Price</div>
          <div class="price" style="font-size: 3.5rem; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1;">₹${currentResource.price}</div>
        </div>
        <button class="buy-button" onclick="handlePurchase()" style="width: 100%; padding: 1.3rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 16px; font-size: 1.2rem; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2rem;">Buy Now</button>
      `;
    }
  }
  
  document.getElementById('resourceDetails').innerHTML = `
    <span class="resource-type-badge">${icon} ${currentResource.type.toUpperCase()}</span>
    <h1>${currentResource.title}</h1>
    <p class="description">${currentResource.description}</p>
    ${mobilePriceSection}
    <div class="features-list">
      <h3>What's Included</h3>
      <ul>
        <li>Instant digital download</li>
        <li>Lifetime access</li>
        <li>Premium quality content</li>
        <li>24/7 customer support</li>
      </ul>
    </div>
  `;
  
  // Only populate sidebar purchase card on desktop
  if (window.innerWidth > 968) {
    if (isPurchased) {
      document.getElementById('purchaseCard').innerHTML = `
        <div class="price-section">
          <div class="price-label" style="color: #10b981; font-size: 18px; font-weight: 600;">✅ Already Purchased</div>
        </div>
        <a href="${currentResource.fileurl || '#'}" ${currentResource.fileurl ? 'download' : ''} class="buy-button" style="background: #10b981; text-decoration: none; display: block; text-align: center;">📥 Download Content</a>
        <div class="purchase-info">
          <div class="info-item">Thank you for your purchase!</div>
          <div class="info-item">Access anytime from dashboard</div>
          <div class="info-item">Lifetime access</div>
        </div>
      `;
    } else {
      document.getElementById('purchaseCard').innerHTML = `
        <div class="price-section">
          <div class="price-label">Price</div>
          <div class="price">₹${currentResource.price}</div>
        </div>
        <button class="buy-button" onclick="handlePurchase()">Buy Now</button>
        <div class="purchase-info">
          <div class="info-item">Secure payment</div>
          <div class="info-item">Money-back guarantee</div>
          <div class="info-item">Instant delivery</div>
        </div>
      `;
    }
  } else {
    // Clear sidebar on mobile
    document.getElementById('purchaseCard').innerHTML = '';
  }
}

async function handlePurchase() {
  if (!isLoggedIn) {
    alert('Please login to purchase');
    showLoginModal();
    return;
  }
  
  try {
    const button = document.querySelector('.buy-button');
    button.disabled = true;
    button.textContent = 'Processing...';
    
    // Get Razorpay key
    const keyResponse = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.paymentKey));
    const { key } = await keyResponse.json();
    
    // Create order
    const orderResponse = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.createOrder), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: currentResource.price,
        receipt: `receipt_${currentResource.id}_${Date.now()}`
      })
    });
    
    const order = await orderResponse.json();
    
    // Open Razorpay checkout
    const options = {
      key: key,
      amount: order.amount,
      currency: order.currency,
      name: 'Earnify',
      description: currentResource.title,
      order_id: order.id,
      handler: async function(response) {
        await verifyPayment(response);
      },
      prefill: {
        name: currentUser.name,
        email: currentUser.email
      },
      theme: {
        color: '#667eea'
      },
      modal: {
        ondismiss: function() {
          button.disabled = false;
          button.textContent = 'Buy Now';
        }
      }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
    
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
    const button = document.querySelector('.buy-button');
    button.disabled = false;
    button.textContent = 'Buy Now';
  }
}

async function verifyPayment(response) {
  try {
    const verifyResponse = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.verifyPayment), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        resourceId: currentResource.id,
        userId: currentUser.id
      })
    });
    
    const result = await verifyResponse.json();
    
    if (verifyResponse.ok && result.success) {
      alert('Payment successful! You can now download your content.');
      loadResourceDetails();
    } else {
      alert('Payment verification failed: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Verification error:', error);
    alert('Payment verification failed: ' + error.message);
  }
}


// Mobile Menu Functions
function toggleMobileMenu() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('mobileSidebarOverlay');
  
  if (sidebar && overlay) {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
  }
}

// Update mobile menu UI based on login status
function updateMobileMenuUI() {
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const mobileSignupBtn = document.getElementById('mobileSignupBtn');
  const mobileUserMenu = document.getElementById('mobileUserMenu');
  const mobileUserName = document.getElementById('mobileUserName');
  const mobileUserEmail = document.getElementById('mobileUserEmail');
  
  if (isLoggedIn && currentUser) {
    if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
    if (mobileSignupBtn) mobileSignupBtn.style.display = 'none';
    if (mobileUserMenu) mobileUserMenu.style.display = 'block';
    
    const displayName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User';
    const email = currentUser?.email || '';
    if (mobileUserName) mobileUserName.textContent = displayName;
    if (mobileUserEmail) mobileUserEmail.textContent = email;
  } else {
    if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
    if (mobileSignupBtn) mobileSignupBtn.style.display = 'block';
    if (mobileUserMenu) mobileUserMenu.style.display = 'none';
  }
}

// Call updateMobileMenuUI when updating UI
const originalUpdateUI = updateUI;
updateUI = function() {
  originalUpdateUI();
  updateMobileMenuUI();
};
