function toggleDropdown() {
  const menu = document.getElementById('dropdownMenu');
  const arrow = document.querySelector('.arrow');
  const isOpen = menu.style.display === 'block';
  menu.style.display = isOpen ? 'none' : 'block';
  if (arrow) arrow.classList.toggle('open', !isOpen);
}

function selectOption(value, text, img) {
  document.getElementById('selectedText').innerText = text;
  document.getElementById('selectedIcon').src = img;
  document.getElementById('dropdownMenu').style.display = 'none';
  document.querySelector('.arrow')?.classList.remove('open');
  if (typeof window.showTab === 'function') window.showTab(value);
}

// Close on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('.resource-filter')) {
    const menu = document.getElementById('dropdownMenu');
    if (menu) menu.style.display = 'none';
    document.querySelector('.arrow')?.classList.remove('open');
  }
});
