// API Configuration will be loaded from api-config.js
// const API = "http://localhost:5000/api/users";
// const RESOURCE_API = "http://localhost:5000/api/resources";

async function loadUsers() {
  // User management removed
}

async function updateStatus(id, status) {
  // User management removed
}

async function deleteUser(id) {
  // User management removed
}

async function loadDashboard() {
  try {
    const res = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.admin.users));
    const users = await res.json();
    
    const sidebarCount = document.getElementById("sidebarUserCount");
    if (sidebarCount) sidebarCount.textContent = users.length;
    
    if (!Array.isArray(users)) {
      console.error('Users data is not an array:', users);
      document.getElementById("totalUsers").innerText = "Total Users: Error";
      document.getElementById("activeUsers").innerText = "Active Users: Error";
      document.getElementById("inactiveUsers").innerText = "Inactive Users: Error";
      return;
    }

    const active = users.filter(u => u.status === "Active").length;
    const inactive = users.filter(u => u.status === "Inactive" || u.status === "Blocked").length;

    document.getElementById("totalUsers").innerText = "Total Users: " + users.length;
    document.getElementById("activeUsers").innerText = "Active Users: " + active;
    document.getElementById("inactiveUsers").innerText = "Inactive Users: " + inactive;
  } catch (error) {
    console.error('Error loading dashboard:', error);
    document.getElementById("totalUsers").innerText = "Total Users: Error";
    document.getElementById("activeUsers").innerText = "Active Users: Error";
    document.getElementById("inactiveUsers").innerText = "Inactive Users: Error";
  }
}

async function loadAnalytics() {
  try {
    const res = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.admin.users));
    if (!res.ok) throw new Error('Failed to fetch analytics');
    const users = await res.json();

    const sidebarCount = document.getElementById("sidebarUserCount");
    if (sidebarCount) sidebarCount.textContent = Array.isArray(users) ? users.length : 0;

    if (!Array.isArray(users)) {
      console.error('Invalid users data');
      return;
    }

    const total = users.length;
    const active = users.filter(u => u.status === "Active").length;
    const inactive = users.filter(u => u.status === "Inactive" || u.status === "Blocked").length;
    const male = users.filter(u => u.gender === "Male").length;
    const female = users.filter(u => u.gender === "Female").length;

    if (document.getElementById("activeRate")) {
      document.getElementById("activeRate").innerText = total ? Math.round((active/total)*100) + "%" : "0%";
      document.getElementById("blockRate").innerText = total ? Math.round((inactive/total)*100) + "%" : "0%";
      document.getElementById("growthRate").innerText = "+" + total;
      document.getElementById("maleCount").innerText = male;
      document.getElementById("femaleCount").innerText = female;
      document.getElementById("totalActive").innerText = active;
      document.getElementById("totalBlocked").innerText = inactive;
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
    if (document.getElementById("activeRate")) {
      document.getElementById("activeRate").innerText = "Error";
      document.getElementById("blockRate").innerText = "Error";
      document.getElementById("growthRate").innerText = "Error";
      document.getElementById("maleCount").innerText = "0";
      document.getElementById("femaleCount").innerText = "0";
      document.getElementById("totalActive").innerText = "0";
      document.getElementById("totalBlocked").innerText = "0";
    }
  }
}

async function loadSettings() {
  try {
    const res = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.admin.users));
    if (!res.ok) throw new Error('Failed to fetch settings');
    const users = await res.json();
    
    const sidebarCount = document.getElementById("sidebarUserCount");
    if (sidebarCount) sidebarCount.textContent = Array.isArray(users) ? users.length : 0;
    
    if (document.getElementById("totalRecords")) {
      document.getElementById("totalRecords").innerText = Array.isArray(users) ? users.length : 0;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    if (document.getElementById("totalRecords")) {
      document.getElementById("totalRecords").innerText = "Error";
    }
  }
}

function refreshData() {
  location.reload();
}

function exportData() {
  alert("Export functionality - Coming soon!");
}

async function loadPurchaseStatistics() {
  const shimmerStats = document.getElementById('shimmerStats');
  const statsOverview = document.getElementById('statsOverview');
  const tbody = document.getElementById('purchaseTableBody');
  
  // Show shimmer, hide actual content
  shimmerStats.style.display = 'grid';
  statsOverview.style.display = 'none';
  
  try {
    // Get current user email
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userEmail = currentUser.email;
    
    if (!userEmail) {
      throw new Error('Please login to view statistics');
    }
    
    console.log('Loading statistics for user:', userEmail);
    
    // Use user-specific statistics endpoint
    const res = await fetch(API_CONFIG.getURL(`${API_CONFIG.endpoints.userStatistics}/${encodeURIComponent(userEmail)}`));
    
    if (!res.ok) {
      throw new Error('Failed to load statistics. Please try again.');
    }
    
    const data = await res.json();
    
    console.log('Statistics data:', data);
    
    // Hide shimmer, show actual content
    shimmerStats.style.display = 'none';
    statsOverview.style.display = 'grid';
    
    // Store full data globally for filtering
    window.fullStatsData = data;
    
    // Update stats cards with user-specific data
    statsOverview.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          📦
        </div>
        <div class="stat-content">
          <h3>My Sales</h3>
          <div class="stat-number" id="totalPurchases">${data.totalPurchases || 0}</div>
          <div class="stat-label">Total sales of my resources</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          💰
        </div>
        <div class="stat-content">
          <h3>My Revenue</h3>
          <div class="stat-number" id="totalRevenue">₹${data.totalRevenue || 0}</div>
          <div class="stat-label">Total earnings from my resources</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          👥
        </div>
        <div class="stat-content">
          <h3>My Customers</h3>
          <div class="stat-number" id="totalCustomers">${data.totalCustomers || 0}</div>
          <div class="stat-label">People who bought my resources</div>
        </div>
      </div>
    `;
    
    if (!data.userStats || data.userStats.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #666;">No sales data available yet.<br><small>Sales will appear here when customers purchase your resources.</small></td></tr>';
      return;
    }
    
    // Show customer purchase data (people who bought from this user)
    tbody.innerHTML = data.userStats.map(customer => `
      <tr>
        <td>${customer.email}</td>
        <td>${customer.totalPurchases}</td>
        <td>₹${customer.totalAmount.toFixed(2)}</td>
        <td>${customer.resources.join(', ')}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading purchase statistics:', error);
    
    // Hide shimmer on error
    shimmerStats.style.display = 'none';
    statsOverview.style.display = 'grid';
    
    statsOverview.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          📦
        </div>
        <div class="stat-content">
          <h3>My Sales</h3>
          <div class="stat-number" id="totalPurchases">0</div>
          <div class="stat-label">Total sales of my resources</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          💰
        </div>
        <div class="stat-content">
          <h3>My Revenue</h3>
          <div class="stat-number" id="totalRevenue">₹0</div>
          <div class="stat-label">Total earnings from my resources</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          👥
        </div>
        <div class="stat-content">
          <h3>My Customers</h3>
          <div class="stat-number" id="totalCustomers">0</div>
          <div class="stat-label">People who bought my resources</div>
        </div>
      </div>
    `;
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: #ef4444;">
      ⚠️ ${error.message}<br><br>
      <small>Make sure you are logged in and have created some resources.</small>
    </td></tr>`;
  }
}

function filterStatsByType(type) {
  // Update active tab
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.closest('.tab-btn').classList.add('active');
  
  const data = window.fullStatsData;
  if (!data || !data.userStats) return;
  
  const tbody = document.getElementById('purchaseTableBody');
  const statsOverview = document.getElementById('statsOverview');
  
  let filteredStats = data.userStats;
  let totalPurchases = 0;
  let totalRevenue = 0;
  let totalCustomers = 0;
  
  if (type !== 'all') {
    // Filter user stats by resource type
    filteredStats = data.userStats.map(user => {
      const filteredResources = user.resources.filter(r => r.toLowerCase().includes(type));
      if (filteredResources.length === 0) return null;
      
      return {
        email: user.email,
        totalPurchases: filteredResources.length,
        totalAmount: user.totalAmount * (filteredResources.length / user.resources.length),
        resources: filteredResources
      };
    }).filter(u => u !== null);
    
    // Calculate filtered totals
    totalPurchases = filteredStats.reduce((sum, u) => sum + u.totalPurchases, 0);
    totalRevenue = filteredStats.reduce((sum, u) => sum + u.totalAmount, 0);
    totalCustomers = filteredStats.length;
  } else {
    totalPurchases = data.totalPurchases || 0;
    totalRevenue = data.totalRevenue || 0;
    totalCustomers = data.totalCustomers || 0;
  }
  
  // Update stats cards
  statsOverview.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        📦
      </div>
      <div class="stat-content">
        <h3>Total Purchases</h3>
        <div class="stat-number">${totalPurchases}</div>
        <div class="stat-label">${type === 'all' ? 'All time purchases' : type.toUpperCase() + ' purchases'}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        💰
      </div>
      <div class="stat-content">
        <h3>Total Revenue</h3>
        <div class="stat-number">₹${totalRevenue.toFixed(2)}</div>
        <div class="stat-label">Total earnings</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
        👥
      </div>
      <div class="stat-content">
        <h3>Total Customers</h3>
        <div class="stat-number">${totalCustomers}</div>
        <div class="stat-label">Unique buyers</div>
      </div>
    </div>
  `;
  
  // Update table
  if (filteredStats.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: #666;">No ${type === 'all' ? '' : type.toUpperCase() + ' '}purchase data available</td></tr>`;
    return;
  }
  
  tbody.innerHTML = filteredStats.map(user => `
    <tr>
      <td>${user.email}</td>
      <td>${user.totalPurchases}</td>
      <td>₹${user.totalAmount.toFixed(2)}</td>
      <td>${user.resources.join(', ')}</td>
    </tr>
  `).join('');
}



let currentType = 'all';

function showTab(type) {
  currentType = type;
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(type).classList.add('active');
  
  // Find and activate the correct button
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    if (btn.textContent.toLowerCase().includes(type) || 
        (type === 'all' && btn.textContent.includes('All Resources'))) {
      btn.classList.add('active');
    }
  });
  
  loadResources(type);
}

async function loadResources(type) {
  const grid = document.getElementById(type + 'Grid');
  if (!grid) return;

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userEmail = currentUser.email;

  if (!userEmail) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🔒</div><h3>Login Required</h3><p>Please login to view resources</p></div>';
    return;
  }

  // Detect mobile by CSS media query — more reliable than innerWidth
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // ── Show shimmer INSTANTLY before any fetch ──
  if (isMobile) {
    const sc = '<div class="res-card shimmer-active"><div class="res-card-top"><div class="sh-box" style="width:40px;height:40px;border-radius:9px;"></div><div class="sh-box" style="width:50px;height:18px;border-radius:10px;"></div></div><div class="res-card-body"><div class="sh-box" style="width:80%;height:14px;margin-bottom:6px;"></div><div class="sh-box" style="width:100%;height:11px;margin-bottom:4px;"></div><div class="sh-box" style="width:60%;height:11px;margin-bottom:8px;"></div><div class="sh-box" style="width:40%;height:16px;"></div></div><div class="res-card-actions"><div class="sh-box" style="flex:1;height:30px;border-radius:8px;"></div><div class="sh-box" style="flex:1;height:30px;border-radius:8px;"></div><div class="sh-box" style="flex:1;height:30px;border-radius:8px;"></div></div></div>';
    grid.innerHTML = '<div class="res-grid">' + sc + sc + sc + sc + '</div>';
    grid.querySelector('.res-grid').style.display = 'grid';
  } else {
    const sr = '<tr class="shimmer-active">' + [1,2,3,4,5].map(() => '<td><div class="sh-box" style="height:14px;border-radius:4px;"></div></td>').join('') + '</tr>';
    grid.innerHTML = '<div class="res-table-wrap"><table class="res-table"><thead><tr><th>#</th><th>Type</th><th>Title</th><th>Price</th><th>Actions</th></tr></thead><tbody>' + sr.repeat(5) + '</tbody></table></div>';
  }

  try {
    // ── Cache: skip fetch on tab switch ──
    if (!window._resourceCache) window._resourceCache = {};
    const cacheKey = userEmail + '_' + type;

    let resources;
    if (window._resourceCache[cacheKey]) {
      resources = window._resourceCache[cacheKey];
    } else {
      const url = API_CONFIG.getURL(API_CONFIG.endpoints.resources) +
        '?user_email=' + encodeURIComponent(userEmail) +
        (type !== 'all' ? '&type=' + encodeURIComponent(type) : '');
      const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Server error: ' + res.status);
      const data = await res.json();
      resources = Array.isArray(data) ? data.filter(r => r.user_email === userEmail) : [];
      if (type !== 'all') resources = resources.filter(r => r.type === type);
      window._resourceCache[cacheKey] = resources;
    }

    // Update count badge
    const countEl = document.getElementById(type + 'Count');
    if (countEl) countEl.textContent = resources.length + ' item' + (resources.length !== 1 ? 's' : '');

    // ── Empty state ──
    if (resources.length === 0) {
      const es = { all:{img:'/file/all.jpg',title:'No Resources Yet',text:'Click the buttons above to add your first resource!'}, pdf:{img:'/file/pdf.jpg',title:'No PDF Notes',text:'Go to "All Resources" tab to add PDF notes'}, excel:{img:'/file/excel.jpg',title:'No Excel Templates',text:'Go to "All Resources" tab to add Excel templates'}, exam:{img:'/file/exam.jpg',title:'No Exam Materials',text:'Go to "All Resources" tab to add exam materials'}, freelance:{img:'/file/service.jpg',title:'No Freelance Services',text:'Go to "All Resources" tab to add freelance services'} };
      const s = es[type] || es.all;
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon"><img src="' + s.img + '" alt="' + type + '" style="width:56px;height:56px;object-fit:contain;"></div><h3>' + s.title + '</h3><p>' + s.text + '</p></div>';
      return;
    }

    const typeImgs = {pdf:'/file/pdf.jpg',excel:'/file/excel.jpg',exam:'/file/exam.jpg',freelance:'/file/service.jpg'};
    const badges = {pdf:'res-badge-pdf',excel:'res-badge-excel',exam:'res-badge-exam',freelance:'res-badge-freelance'};

    // ── Render ──
    if (!isMobile) {
      grid.innerHTML = '<div class="res-table-wrap"><table class="res-table"><thead><tr><th>#</th><th>Title</th><th>Price</th><th>Actions</th></tr></thead><tbody>' +
        resources.map((r,i) => {
          const img = typeImgs[r.type] || '/file/all.jpg';
          return '<tr>' +
            '<td>'+(i+1)+'</td>' +
            '<td><div class="res-title-cell"><img src="'+img+'" class="res-type-img" alt="'+r.type+'"><div><div class="res-title">'+r.title+'</div><div class="res-desc-full">'+r.description+'</div></div></div></td>' +
            '<td><strong>&#8377;'+r.price+'</strong></td>' +
            '<td><div class="res-actions"><button onclick="openFile('+r.id+')" class="btn-view">Open</button><button onclick="editResource('+r.id+')" class="btn-edit">Edit</button><button onclick="deleteResource('+r.id+')" class="btn-delete">Delete</button></div></td>' +
            '</tr>';
        }).join('') +
        '</tbody></table></div>';
    } else {
      grid.innerHTML = '<div class="res-grid">' +
        resources.map(r => {
          const imgSrc = '/file/' + (r.type === 'freelance' ? 'service' : r.type) + '.jpg';
          return '<div class="res-card"><div class="res-card-top"><img src="'+imgSrc+'" class="res-card-img" alt="'+r.type+'"><span class="res-badge '+(badges[r.type]||'')+'">'+r.type+'</span></div><div class="res-card-body"><div class="res-card-title">'+r.title+'</div><div class="res-card-desc">'+r.description+'</div><div class="res-card-price">&#8377;'+r.price+'</div></div><div class="res-card-actions"><button onclick="openFile('+r.id+')" class="btn-view">Open</button><button onclick="editResource('+r.id+')" class="btn-edit">Edit</button><button onclick="deleteResource('+r.id+')" class="btn-delete">Delete</button></div></div>';
        }).join('') + '</div>';
      const rg = grid.querySelector('.res-grid');
      if (rg) rg.style.display = 'grid';
    }

  } catch (error) {
    console.error('Error loading resources:', error);
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Connection Error</h3><p>' + error.message + '</p></div>';
  }
}

function getTypeIcon(type) {
  const imgs = {
    pdf: '/file/pdf.jpg',
    excel: '/file/excel.jpg',
    exam: '/file/exam.jpg',
    freelance: '/file/service.jpg'
  };
  const src = imgs[type] || '/file/all.jpg';
  return '<img src="' + src + '" alt="' + type + '" style="width:48px;height:48px;object-fit:contain;border-radius:10px;">';
}

function setupRealtimeResources() {
  if (typeof supabaseClient === 'undefined') {
    console.log('Realtime disabled - using local mode');
    return;
  }
  const channel = supabaseClient
    .channel('resources-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'resources' },
      (payload) => {
        if (document.getElementById('pdfGrid')) {
          loadResources(currentType);
        }
      }
    )
    .subscribe();
}

function showAddModal(type) {
  console.log('showAddModal called with type:', type);
  currentType = type;
  const modal = document.getElementById('addModal');
  const fileInput = document.getElementById('fileUpload');
  const modalTitle = document.getElementById('modalTitle');
  
  if (!modal) {
    console.error('Modal element not found');
    return;
  }
  
  // Set file input accept attribute based on type
  switch(type) {
    case 'pdf':
      fileInput.accept = '.pdf';
      modalTitle.textContent = 'Add PDF Resource';
      break;
    case 'excel':
      fileInput.accept = '.xlsx,.xls';
      modalTitle.textContent = 'Add Excel Resource';
      break;
    case 'exam':
      fileInput.accept = '.pdf,.doc,.docx';
      modalTitle.textContent = 'Add Exam Material';
      break;
    case 'freelance':
      fileInput.accept = '.pdf,.doc,.docx,.xlsx,.xls';
      modalTitle.textContent = 'Add Freelance Service';
      break;
    default:
      fileInput.accept = '.pdf,.xlsx,.xls,.doc,.docx';
      modalTitle.textContent = 'Add Resource';
  }
  
  modal.style.display = 'flex';
  console.log('Modal display set to flex');
}

function closeModal() {
  console.log('closeModal called');
  const modal = document.getElementById('addModal');
  if (modal) {
    modal.style.display = 'none';
    // Reset form
    const form = document.getElementById('resourceForm');
    if (form) form.reset();
  }
}

function closeViewModal() {
  document.getElementById('viewModal').style.display = 'none';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

async function openFile(id) {
  try {
    const res = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.resources));
    const resources = await res.json();
    const resource = resources.find(r => r.id === id);
    
    console.log('Resource data:', resource);
    
    if (!resource) {
      alert('Resource not found');
      return;
    }
    
    // Check both fileUrl and fileurl (case sensitivity)
    const url = resource.fileUrl || resource.fileurl;
    
    if (url && url !== '#' && url !== 'null') {
      window.open(url, '_blank');
    } else {
      alert('No file uploaded yet. Click Edit to upload a file for this resource.');
    }
  } catch (error) {
    console.error('Error opening file:', error);
    alert('Error opening file');
  }
}

async function viewResource(id) {
  try {
    const res = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.resources));
    const resources = await res.json();
    const resource = resources.find(r => r.id === id);
    
    if (resource) {
      document.getElementById('viewTitle').textContent = resource.title;
      document.getElementById('viewDescription').textContent = resource.description;
      document.getElementById('viewPrice').textContent = resource.price;
      document.getElementById('viewType').textContent = resource.type;
      document.getElementById('viewFileName').textContent = 'File uploaded';
      document.getElementById('viewModal').style.display = 'flex';
    }
  } catch (error) {
    alert('Error loading resource details');
  }
}

async function editResource(id) {
  try {
    const res = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.resources));
    const resources = await res.json();
    const resource = resources.find(r => r.id === id);
    
    if (resource) {
      document.getElementById('editId').value = resource.id;
      document.getElementById('editTitle').value = resource.title;
      document.getElementById('editDescription').value = resource.description;
      document.getElementById('editPrice').value = resource.price;
      
      // Show last uploaded file based on resource type
      const fileTypes = {
        pdf: 'PDF file',
        excel: 'Excel file', 
        exam: 'Exam material',
        freelance: 'Service file'
      };
      document.getElementById('lastFileName').textContent = fileTypes[resource.type] || 'File uploaded';
      
      document.getElementById('editModal').style.display = 'flex';
    }
  } catch (error) {
    alert('Error loading resource for editing');
  }
}

async function deleteResource(id) {
  if (!confirm('Delete this resource?')) return;
  await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.resources) + '/' + id, { method: 'DELETE' });
  window._resourceCache = {}; // clear cache after delete
  loadResources(currentType);
}

if (document.getElementById('resourceForm')) {
  document.getElementById('resourceForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userEmail = currentUser.email;
    
    if (!userEmail) {
      alert('Please login to add resources');
      return;
    }
    
    const formData = new FormData();
    formData.append('type', currentType);
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('file', document.getElementById('fileUpload').files[0]);
    formData.append('user_email', userEmail);
    
    document.getElementById('uploadProgress').style.display = 'block';
    
    try {
      const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.resources), {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      document.getElementById('uploadProgress').style.display = 'none';
      loadResources(currentType);
      closeModal();
      e.target.reset();
      alert('Resource added successfully!');
    } catch (error) {
      document.getElementById('uploadProgress').style.display = 'none';
      alert('Error: ' + error.message);
      console.error('Upload error:', error);
    }
  };
}

if (document.getElementById('editForm')) {
  document.getElementById('editForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const file = document.getElementById('editFileUpload').files[0];
    
    if (file) {
      // If file is selected, use FormData for file upload
      const formData = new FormData();
      formData.append('title', document.getElementById('editTitle').value);
      formData.append('description', document.getElementById('editDescription').value);
      formData.append('price', document.getElementById('editPrice').value);
      formData.append('file', file);
      
      try {
        const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.resources) + '/' + id, {
          method: 'PUT',
          body: formData
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Update failed');
        }
        
        loadResources(currentType);
        closeEditModal();
        alert('Resource updated successfully!');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    } else {
      // If no file, use JSON for text-only update
      const updateData = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        price: document.getElementById('editPrice').value
      };
      
      try {
        const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.resources) + '/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Update failed');
        }
        
        loadResources(currentType);
        closeEditModal();
        alert('Resource updated successfully!');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };
}

if (document.getElementById('allGrid')) loadResources('all');
if (document.getElementById('pdfGrid')) setupRealtimeResources();

if (document.getElementById("userTable")) loadUsers();
if (document.getElementById("totalUsers")) loadDashboard();
if (document.getElementById("activeRate")) loadAnalytics();
if (document.getElementById("totalRecords")) loadSettings();
if (document.getElementById("purchaseTableBody")) {
  // Disabled loadPurchaseStatistics to prevent fetch errors
  console.log('loadPurchaseStatistics disabled - Statistics page uses its own mock data system');
}



