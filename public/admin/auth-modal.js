function openAuthModal(type) {
  console.log('Opening auth modal with type:', type);
  const modal = document.getElementById('authModal');
  const loginForm = document.getElementById('authLoginForm');
  const signupForm = document.getElementById('authSignupForm');
  const title = document.getElementById('authTitle');
  const subtitle = document.getElementById('authSubtitle');
  
  // Check for token in URL hash (from email confirmation - Supabase uses #)
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  
  if (accessToken && refreshToken) {
    // Show success and redirect to home page
    alert('Email verified successfully!');
    window.location.href = '../index.html';
    return;
  }
  
  modal.style.display = 'flex';
  
  if (type === 'signup') {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    title.textContent = 'Admin Sign Up';
    subtitle.textContent = 'Create your admin account';
  } else {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    title.textContent = 'Admin Login';
    subtitle.textContent = 'Login to access admin dashboard';
  }
  document.getElementById('authError').style.display = 'none';
  document.getElementById('authSuccess').style.display = 'none';
  
  // Clear form fields
  document.getElementById('authLoginEmail').value = '';
  document.getElementById('authLoginPassword').value = '';
  document.getElementById('authSignupEmail').value = '';
  document.getElementById('authSignupPassword').value = '';
  document.getElementById('authSignupConfirm').value = '';
}

function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
  document.getElementById('authLoginForm').classList.remove('hidden');
  document.getElementById('authSignupForm').classList.add('hidden');
  document.getElementById('authError').style.display = 'none';
  document.getElementById('authSuccess').style.display = 'none';
}

function toggleAuthForm() {
  const loginForm = document.getElementById('authLoginForm');
  const signupForm = document.getElementById('authSignupForm');
  const title = document.getElementById('authTitle');
  const subtitle = document.getElementById('authSubtitle');
  
  if (loginForm.classList.contains('hidden')) {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    title.textContent = 'Admin Login';
    subtitle.textContent = 'Login to access admin dashboard';
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    title.textContent = 'Admin Sign Up';
    subtitle.textContent = 'Create your admin account';
  }
  document.getElementById('authError').style.display = 'none';
  document.getElementById('authSuccess').style.display = 'none';
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password strength checker
function checkModalPasswordStrength(password) {
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  // Calculate strength
  let score = 0;
  if (hasLength) score += 20;
  if (hasUpper) score += 20;
  if (hasLower) score += 20;
  if (hasNumber) score += 20;
  if (hasSpecial) score += 20;
  
  return score >= 60;
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('authLoginForm');
  const signupForm = document.getElementById('authSignupForm');
  
  if (!loginForm || !signupForm) return;
  
  // Login form handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('authError').style.display = 'none';
    
    const email = document.getElementById('authLoginEmail').value.trim();
    const password = document.getElementById('authLoginPassword').value;
    const btn = loginForm.querySelector('button[type="submit"]');
    
    // Validation
    if (!email) {
      document.getElementById('authError').textContent = 'Please enter your email address';
      document.getElementById('authError').style.display = 'block';
      return;
    }
    
    if (!isValidEmail(email)) {
      document.getElementById('authError').textContent = 'Please enter a valid email address';
      document.getElementById('authError').style.display = 'block';
      return;
    }
    
    if (!password) {
      document.getElementById('authError').textContent = 'Please enter your password';
      document.getElementById('authError').style.display = 'block';
      return;
    }
    
    // Show loading
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Logging in...';
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        document.getElementById('authSuccess').textContent = 'Login successful!';
        document.getElementById('authSuccess').style.display = 'block';
        setTimeout(() => { closeAuthModal(); window.location.href = 'admin/dashboard.html'; }, 1000);
      } else {
        document.getElementById('authError').textContent = data.error || 'Invalid email or password';
        document.getElementById('authError').style.display = 'block';
        btn.disabled = false;
        btn.textContent = originalText;
      }
    } catch (error) {
      document.getElementById('authError').textContent = 'Connection error. Please try again.';
      document.getElementById('authError').style.display = 'block';
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  // Signup form handler
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('authError').style.display = 'none';
    
    const email = document.getElementById('authSignupEmail').value.trim();
    const password = document.getElementById('authSignupPassword').value;
    const confirm = document.getElementById('authSignupConfirm').value;
    const btn = signupForm.querySelector('button[type="submit"]');
    
    // Validation
    if (!email) {
      document.getElementById('authError').textContent = 'Please enter your email address';
      document.getElementById('authError').style.display = 'block';
      return;
    }
    
    if (!isValidEmail(email)) {
      document.getElementById('authError').textContent = 'Please enter a valid email address';
      document.getElementById('authError').style.display = 'block';
      return;
    }
    
    if (!password) {
      document.getElementById('authError').textContent = 'Please create a password';
      document.getElementById('authError').style.display = 'block';
      return;
    }
    
    if (!checkModalPasswordStrength(password)) {
      document.getElementById('authError').textContent = 'Password must be at least 8 characters with letters, numbers, and symbols';
      document.getElementById('authError').style.display = 'block';
      return;
    }
    
    if (password !== confirm) {
      document.getElementById('authError').textContent = 'Passwords do not match';
      document.getElementById('authError').style.display = 'block';
      return;
    }
    
    // Show loading
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account...';
    
    try {
      const response = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        document.getElementById('authSuccess').textContent = 'Account created successfully!';
        document.getElementById('authSuccess').style.display = 'block';
        setTimeout(() => { closeAuthModal(); window.location.href = 'admin/dashboard.html'; }, 1000);
      } else {
        const errorMsg = data.error || 'Signup failed';
        if (errorMsg.includes('already registered') || errorMsg.includes('already exists')) {
          document.getElementById('authError').textContent = 'An account with this email already exists. Please login.';
        } else {
          document.getElementById('authError').textContent = errorMsg;
        }
        document.getElementById('authError').style.display = 'block';
        btn.disabled = false;
        btn.textContent = originalText;
      }
    } catch (error) {
      document.getElementById('authError').textContent = 'Connection error. Please try again.';
      document.getElementById('authError').style.display = 'block';
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
});
