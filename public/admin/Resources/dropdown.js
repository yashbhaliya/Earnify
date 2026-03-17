// Enhanced Resource Dropdown Functionality
function showTab(selectedType) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab with animation
  const selectedTab = document.getElementById(selectedType);
  if (selectedTab) {
    setTimeout(() => {
      selectedTab.classList.add('active');
    }, 100);
  }
  
  // Update dropdown styling based on selection
  const dropdown = document.getElementById('resourceSelect');
  if (dropdown) {
    dropdown.style.borderColor = getTypeColor(selectedType);
    dropdown.style.boxShadow = `0 8px 25px ${getTypeColorRgba(selectedType, 0.15)}`;
  }
  
  // Update page title based on selection
  updatePageTitle(selectedType);
}

function getTypeColor(type) {
  const colors = {
    'all': '#3b82f6',
    'pdf': '#ef4444',
    'excel': '#10b981',
    'exam': '#f59e0b',
    'freelance': '#8b5cf6'
  };
  return colors[type] || '#3b82f6';
}

function getTypeColorRgba(type, opacity) {
  const colors = {
    'all': `rgba(59, 130, 246, ${opacity})`,
    'pdf': `rgba(239, 68, 68, ${opacity})`,
    'excel': `rgba(16, 185, 129, ${opacity})`,
    'exam': `rgba(245, 158, 11, ${opacity})`,
    'freelance': `rgba(139, 92, 246, ${opacity})`
  };
  return colors[type] || `rgba(59, 130, 246, ${opacity})`;
}

function updatePageTitle(type) {
  const titles = {
    'all': '<img src="../../../file/exam.jpg" alt="">  All Resources',
    'pdf': '📄 PDF Notes',
    'excel': '📊 Excel Templates',
    'exam': '📝 Exam Materials',
    'freelance': '💼 Freelance Services'
  };
  
  const headerTitle = document.querySelector('.page-header h1');
  if (headerTitle) {
    headerTitle.textContent = titles[type] || ' All Resources';
  }
}

// Enhanced dropdown interaction
document.addEventListener('DOMContentLoaded', function() {
  const dropdown = document.getElementById('resourceSelect');
  
  if (dropdown) {
    // Add smooth transition on change
    dropdown.addEventListener('change', function(e) {
      const selectedValue = e.target.value;
      
      // Add loading effect
      dropdown.style.opacity = '0.7';
      dropdown.style.transform = 'scale(0.98)';
      
      setTimeout(() => {
        showTab(selectedValue);
        dropdown.style.opacity = '1';
        dropdown.style.transform = 'scale(1)';
      }, 150);
    });
    
    // Add hover effects
    dropdown.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    
    dropdown.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  }
  
  // Initialize with default selection
  showTab('all');
});

// Mobile-friendly dropdown enhancements
function initMobileDropdown() {
  const dropdown = document.getElementById('resourceSelect');
  const container = document.querySelector('.resource-dropdown-container');
  
  if (window.innerWidth <= 768) {
    // Remove any sticky positioning
    if (container) {
      container.style.position = 'static';
      container.style.top = 'auto';
      container.style.zIndex = 'auto';
    }
    
    if (dropdown) {
      dropdown.style.fontSize = '15px';
      dropdown.style.padding = '12px 15px';
    }
  }
}

// Handle window resize
window.addEventListener('resize', initMobileDropdown);
window.addEventListener('load', initMobileDropdown);

// Smooth scroll to content after selection
function scrollToContent() {
  const activeContent = document.querySelector('.tab-content.active');
  if (activeContent && window.innerWidth <= 768) {
    activeContent.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Add to existing showTab function
const originalShowTab = window.showTab;
window.showTab = function(type) {
  if (originalShowTab) {
    originalShowTab(type);
  } else {
    showTab(type);
  }
  setTimeout(scrollToContent, 300);
};