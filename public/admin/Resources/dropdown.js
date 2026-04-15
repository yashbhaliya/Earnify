// Generic toggle — finds the dropdown inside the clicked custom-select's parent
function toggleDropdown() {
  toggleDropdownById('dropdownMenu', this);
}

function toggleDropdownById(menuId, triggerEl) {
  // Close all open dropdowns first
  document.querySelectorAll('.dropdown').forEach(d => {
    if (d.id !== menuId) {
      d.style.display = 'none';
      const arrow = d.closest('.resource-filter')?.querySelector('.arrow');
      if (arrow) arrow.classList.remove('open');
    }
  });

  const menu = document.getElementById(menuId);
  if (!menu) return;
  const isOpen = menu.style.display === 'block';
  menu.style.display = isOpen ? 'none' : 'block';

  const arrow = menu.closest('.resource-filter')?.querySelector('.arrow');
  if (arrow) arrow.classList.toggle('open', !isOpen);
}

function toggleDropdownExcel()    { toggleDropdownById('dropdownMenuExcel'); }
function toggleDropdownExam()     { toggleDropdownById('dropdownMenuExam'); }
function toggleDropdownFreelance(){ toggleDropdownById('dropdownMenuFreelance'); }

function selectOption(value, text, img) {
  // Update the currently visible tab's custom-select
  const activeTab = document.querySelector('.tab-content.active');
  if (activeTab) {
    const icon = activeTab.querySelector('.select-icon');
    const label = activeTab.querySelector('.custom-select span:not(.arrow)');
    if (icon) icon.src = img;
    if (label) label.innerText = text;
    // Close all dropdowns in this tab
    activeTab.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
    activeTab.querySelectorAll('.arrow').forEach(a => a.classList.remove('open'));
  }

  // Also update the #all tab's selectedText/selectedIcon if they exist
  const selText = document.getElementById('selectedText');
  const selIcon = document.getElementById('selectedIcon');
  if (selText) selText.innerText = text;
  if (selIcon) selIcon.src = img;

  // Close all dropdowns globally
  document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
  document.querySelectorAll('.arrow').forEach(a => a.classList.remove('open'));

  if (typeof window.showTab === 'function') window.showTab(value);
}

// Toggle type dropdown in modal
function toggleTypeDropdown() {
  const dropdown = document.getElementById('typeDropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  }
}

// Toggle second type dropdown in form (addStep2)
function toggleTypeDropdown2() {
  const dropdown = document.getElementById('typeDropdown2');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  }
}

// Change type in form (addStep2)
function changeType(type) {
  const icons = { pdf: '/file/pdf.jpg', excel: '/file/excel.jpg', exam: '/file/exam.jpg', freelance: '/file/service.jpg' };
  const labels = { pdf: 'PDF Notes', excel: 'Excel Template', exam: 'Exam Material', freelance: 'Freelance Service' };
  document.getElementById('typeIcon2').src = icons[type] || '/file/pdf.jpg';
  document.getElementById('typeText2').textContent = labels[type] || type;
  document.getElementById('typeDropdown2').style.display = 'none';
  if (typeof window.showAddModal === 'function') {
    window.showAddModal(type);
  }
}

// Close on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('.resource-filter') && !e.target.closest('.type-select-wrapper')) {
    document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
    document.querySelectorAll('.arrow').forEach(a => a.classList.remove('open'));
  }
});
