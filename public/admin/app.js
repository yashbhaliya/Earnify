const API = "http://localhost:5000/api/users";
const RESOURCE_API = "http://localhost:5000/api/resources";

async function loadUsers() {
  const res = await fetch(API);
  const users = await res.json();

  const table = document.getElementById("userTable");
  const emptyState = document.getElementById("emptyState");
  
  if (!table) return;

  if (users.length === 0) {
    table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  table.style.display = 'table-row-group';
  if (emptyState) emptyState.style.display = 'none';
  table.innerHTML = "";

  users.forEach(user => {
    table.innerHTML += `
      <tr>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.gender}</td>
        <td><span class="badge ${user.status.toLowerCase()}">${user.status}</span></td>
        <td>
          <button onclick="updateStatus('${user.id}','Active')">Activate</button>
          <button onclick="updateStatus('${user.id}','Blocked')">Block</button>
          <button onclick="deleteUser('${user.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

async function updateStatus(id, status) {
  await fetch(API + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  loadUsers();
}

async function deleteUser(id) {
  if (!confirm("Delete this user?")) return;
  await fetch(API + "/" + id, {
    method: "DELETE"
  });
  loadUsers();
}

async function loadDashboard() {
  try {
    const res = await fetch(API);
    const users = await res.json();
    
    // Handle error response or non-array data
    if (!Array.isArray(users)) {
      console.error('Users data is not an array:', users);
      document.getElementById("totalUsers").innerText = "Total Users: Error";
      document.getElementById("activeUsers").innerText = "Active Users: Error";
      document.getElementById("blockedUsers").innerText = "Blocked Users: Error";
      return;
    }

    document.getElementById("totalUsers").innerText =
      "Total Users: " + users.length;

    document.getElementById("activeUsers").innerText =
      "Active Users: " +
      users.filter(u => u.status === "Active").length;

    document.getElementById("blockedUsers").innerText =
      "Blocked Users: " +
      users.filter(u => u.status === "Blocked").length;
  } catch (error) {
    console.error('Error loading dashboard:', error);
    document.getElementById("totalUsers").innerText = "Total Users: Error";
    document.getElementById("activeUsers").innerText = "Active Users: Error";
    document.getElementById("blockedUsers").innerText = "Blocked Users: Error";
  }
}

async function loadAnalytics() {
  const res = await fetch(API);
  const users = await res.json();

  const total = users.length;
  const active = users.filter(u => u.status === "Active").length;
  const blocked = users.filter(u => u.status === "Blocked").length;
  const male = users.filter(u => u.gender === "Male").length;
  const female = users.filter(u => u.gender === "Female").length;

  if (document.getElementById("activeRate")) {
    document.getElementById("activeRate").innerText = total ? Math.round((active/total)*100) + "%" : "0%";
    document.getElementById("blockRate").innerText = total ? Math.round((blocked/total)*100) + "%" : "0%";
    document.getElementById("growthRate").innerText = "+" + total;
    document.getElementById("maleCount").innerText = male;
    document.getElementById("femaleCount").innerText = female;
    document.getElementById("totalActive").innerText = active;
    document.getElementById("totalBlocked").innerText = blocked;
  }
}

async function loadSettings() {
  const res = await fetch(API);
  const users = await res.json();
  if (document.getElementById("totalRecords")) {
    document.getElementById("totalRecords").innerText = users.length;
  }
}

function refreshData() {
  location.reload();
}

function exportData() {
  alert("Export functionality - Coming soon!");
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
  
  try {
    const res = await fetch(RESOURCE_API);
    const allResources = await res.json();
    
    // Filter resources based on type
    const filtered = type === 'all' ? allResources : allResources.filter(r => r.type === type);
    
    if (filtered.length === 0) {
      grid.innerHTML = '<p style="color: white; padding: 20px;">No resources yet. Add your first resource!</p>';
      return;
    }
    
    const icons = { pdf: '📄', excel: '📊', exam: '📝', freelance: '💼' };
    
    grid.innerHTML = filtered.map(r => `
      <div class="resource-card">
        <div class="resource-type-badge">${icons[r.type]} ${r.type.toUpperCase()}</div>
        <h3>${r.title}</h3>
        <p>${r.description}</p>
        <div class="resource-price">₹${r.price}</div>
        <div class="resource-actions">
          <button onclick="viewResource(${r.id})">View</button>
          <button onclick="editResource(${r.id})">Edit</button>
          <button onclick="deleteResource(${r.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading resources:', err);
    grid.innerHTML = '<p style="color: white; padding: 20px;">Error loading resources. Please check server.</p>';
  }
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
    
    const formData = new FormData();
    formData.append('type', currentType);
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('file', document.getElementById('fileUpload').files[0]);
    
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