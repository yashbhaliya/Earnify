let currentResource = null;
let isLoggedIn = false;
let currentUser = null;

function checkLoginStatus() {
  isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const userStr = localStorage.getItem('currentUser');
  currentUser = userStr ? JSON.parse(userStr) : null;
  updateUI();
}

function updateUI() {
  if (isLoggedIn) {
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('dashboardLink').style.display = 'inline-block';
  }
}

function logout() {
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('currentUser');
  window.location.href = '/';
}

async function loadResourceDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const resourceId = urlParams.get('id');
  
  if (!resourceId) {
    window.location.href = '/';
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:5000/api/resources`);
    const resources = await response.json();
    currentResource = resources.find(r => r.id == resourceId);
    
    if (!currentResource) {
      window.location.href = '/';
      return;
    }
    
    // Check if user already purchased this item
    let isPurchased = false;
    if (isLoggedIn && currentUser) {
      try {
        const purchaseRes = await fetch(`http://localhost:5000/api/payments/${currentUser.id}`);
        if (purchaseRes.ok) {
          const purchases = await purchaseRes.json();
          isPurchased = purchases.some(p => p.resource_id === currentResource.id);
        }
      } catch (err) {
        console.log('Could not check purchases');
      }
    }
    
    displayResourceDetails(isPurchased);
  } catch (error) {
    console.error('Error loading resource:', error);
    document.getElementById('resourceDetails').innerHTML = 
      '<p class="loading">Failed to load resource details.</p>';
  }
}

function displayResourceDetails(isPurchased = false) {
  const icons = { pdf: '📄', excel: '📊', exam: '📝', freelance: '💼' };
  const icon = icons[currentResource.type] || '📦';
  
  document.getElementById('breadcrumbTitle').textContent = currentResource.title;
  
  document.getElementById('resourceDetails').innerHTML = `
    <span class="resource-type-badge">${icon} ${currentResource.type.toUpperCase()}</span>
    <h1>${currentResource.title}</h1>
    <p class="description">${currentResource.description}</p>
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
}

async function handlePurchase() {
  if (!isLoggedIn) {
    alert('Please login to purchase');
    window.location.href = '/#resources';
    return;
  }
  
  try {
    const button = document.querySelector('.buy-button');
    button.disabled = true;
    button.textContent = 'Processing...';
    
    // Get Razorpay key
    const keyResponse = await fetch('http://localhost:5000/api/payment/key');
    const { key } = await keyResponse.json();
    
    // Create order
    const orderResponse = await fetch('http://localhost:5000/api/payment/create-order', {
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
    const verifyResponse = await fetch('http://localhost:5000/api/payment/verify', {
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

checkLoginStatus();
loadResourceDetails();
