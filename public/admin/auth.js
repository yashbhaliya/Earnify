async function checkAuth() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error || !user) {
      localStorage.removeItem('adminToken');
      window.location.href = 'login.html';
    }
  } catch (e) {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
  }
}

async function logout() {
  try {
    await supabaseClient.auth.signOut();
  } catch (e) {}
  localStorage.removeItem('adminToken');
  window.location.href = 'login.html';
}

if (!window.location.pathname.includes('login.html')) {
  checkAuth();
}
