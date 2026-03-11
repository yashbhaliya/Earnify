const API = "http://localhost:5000/api/users";
const RESOURCE_API = "http://localhost:5000/api/resources";

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
    const res = await fetch(API);
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
    const res = await fetch(API);
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
    const res = await fetch(API);
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
  try {
    const res = await fetch('http://localhost:5000/api/statistics/purchases');
    
    if (!res.ok) {
      throw new Error('Server not running. Please start the server with: npm start');
    }
    
    const data = await res.json();
    
    // Update stats cards
    const statsOverview = document.getElementById('statsOverview');
    statsOverview.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          📦
        </div>
        <div class="stat-content">
          <h3>Total Purchases</h3>
          <div class="stat-number" id="totalPurchases">${data.totalPurchases || 0}</div>
          <div class="stat-label">All time purchases</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          💰
        </div>
        <div class="stat-content">
          <h3>Total Revenue</h3>
          <div class="stat-number" id="totalRevenue">₹${data.totalRevenue || 0}</div>
          <div class="stat-label">Total earnings</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          👥
        </div>
        <div class="stat-content">
          <h3>Total Customers</h3>
          <div class="stat-number" id="totalCustomers">${data.totalCustomers || 0}</div>
          <div class="stat-label">Unique buyers</div>
        </div>
      </div>
    `;
    
    const tbody = document.getElementById('purchaseTableBody');
    if (!data.userStats || data.userStats.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #666;">No purchase data available</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.userStats.map(user => `
      <tr>
        <td>${user.email}</td>
        <td>${user.totalPurchases}</td>
        <td>₹${user.totalAmount.toFixed(2)}</td>
        <td>${user.resources.join(', ')}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading purchase statistics:', error);
    const statsOverview = document.getElementById('statsOverview');
    statsOverview.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          📦
        </div>
        <div class="stat-content">
          <h3>Total Purchases</h3>
          <div class="stat-number" id="totalPurchases">0</div>
          <div class="stat-label">All time purchases</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          💰
        </div>
        <div class="stat-content">
          <h3>Total Revenue</h3>
          <div class="stat-number" id="totalRevenue">₹0</div>
          <div class="stat-label">Total earnings</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          👥
        </div>
        <div class="stat-content">
          <h3>Total Customers</h3>
          <div class="stat-number" id="totalCustomers">0</div>
          <div class="stat-label">Unique buyers</div>
        </div>
      </div>
    `;
    const tbody = document.getElementById('purchaseTableBody');
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: #ef4444;">
      ⚠️ ${error.message}<br><br>
      <small>Make sure to access via: <strong>http://localhost:5000/admin/statistics.html</strong></small>
    </td></tr>`;
  }
}



let currentType = 'all';

function showTab(type) {
  currentType = type;
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(type).classList.add('active');
  event.target.classList.add('active');
  loadResources(type);
}

async function loadResources(type) {
  const grid = document.getElementById(type + 'Grid');
  if (!grid) return;
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userEmail = currentUser.email;
  
  if (!userEmail) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔒</div>
        <h3>Login Required</h3>
        <p>Please login to view resources</p>
      </div>
    `;
    return;
  }
  
  try {
    const res = await fetch(RESOURCE_API, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }
    
    const allResources = await res.json();
    
    // Filter by user email and type
    let resources = allResources.filter(r => r.user_email === userEmail);
    if (type !== 'all') {
      resources = resources.filter(r => r.type === type);
    }
    
    // Update resource count
    const countElement = document.getElementById(type + 'Count');
    if (countElement) {
      countElement.textContent = `${resources.length} item${resources.length !== 1 ? 's' : ''}`;
    }
    
    if (resources.length === 0) {
      const emptyStates = {
        all: { icon: '📦', title: 'No Resources Yet', text: 'Click the buttons above to add your first resource!' },
        pdf: { icon: '📄', title: 'No PDF Notes', text: 'Go to "All Resources" tab to add PDF notes' },
        excel: { icon: '📊', title: 'No Excel Templates', text: 'Go to "All Resources" tab to add Excel templates' },
        exam: { icon: '📝', title: 'No Exam Materials', text: 'Go to "All Resources" tab to add exam materials' },
        freelance: { icon: '💼', title: 'No Freelance Services', text: 'Go to "All Resources" tab to add freelance services' }
      };
      const state = emptyStates[type];
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${state.icon}</div>
          <h3>${state.title}</h3>
          <p>${state.text}</p>
        </div>
      `;
      return;
    }
    
    grid.innerHTML = resources.map(r => `
      <div class="resource-card">
        <div class="resource-icon">${getTypeIcon(r.type)}</div>
        <h3>${r.title}</h3>
        <p>${r.description}</p>
        <div class="resource-price">₹${r.price}</div>
        <div class="resource-actions">
          <button onclick="openFile(${r.id})" class="btn-view">📂 Open</button>
          <button onclick="editResource(${r.id})" class="btn-edit">✏️ Edit</button>
          <button onclick="deleteResource(${r.id})" class="btn-delete">🗑️ Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading resources:', error);
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Server Connection Error</h3>
        <p>Please make sure the server is running at <strong>http://localhost:5000</strong></p>
        <p style="margin-top: 10px; font-size: 12px; color: #ef4444;">${error.message}</p>
      </div>
    `;
  }
}

function getTypeIcon(type) {
  const icons = {
    pdf: '📄',
    excel: '📊',
    exam: '📝',
    freelance: '💼'
  };
  return icons[type] || '📦';
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
  currentType = type;
  const fileInput = document.getElementById('fileUpload');
  const modalTitle = document.getElementById('modalTitle');
  
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
  
  document.getElementById('addModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('addModal').style.display = 'none';
}

function closeViewModal() {
  document.getElementById('viewModal').style.display = 'none';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

async function openFile(id) {
  try {
    const res = await fetch(RESOURCE_API);
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
    const res = await fetch(RESOURCE_API);
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
    const res = await fetch(RESOURCE_API);
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
  await fetch(RESOURCE_API + '/' + id, { method: 'DELETE' });
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
      const response = await fetch(RESOURCE_API, {
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
        const response = await fetch(RESOURCE_API + '/' + id, {
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
        const response = await fetch(RESOURCE_API + '/' + id, {
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
if (document.getElementById("purchaseTableBody")) loadPurchaseStatistics();