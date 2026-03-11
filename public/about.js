// Shimmer loading for About page
document.addEventListener('DOMContentLoaded', function() {
  loadAboutContent();
});

function loadAboutContent() {
  // Show shimmer effect
  showShimmer();
  
  // Simulate loading delay (remove this in production or use actual API call)
  setTimeout(() => {
    loadActualContent();
  }, 1500);
}

function showShimmer() {
  document.getElementById('contentBox1').innerHTML = `
    <div class="shimmer-box">
      <div class="shimmer-title"></div>
      <div class="shimmer-text"></div>
      <div class="shimmer-text"></div>
      <div class="shimmer-text short"></div>
    </div>
  `;
  
  document.getElementById('contentBox2').innerHTML = `
    <div class="shimmer-box">
      <div class="shimmer-title"></div>
      <div class="shimmer-text"></div>
      <div class="shimmer-text"></div>
      <div class="shimmer-text short"></div>
    </div>
  `;
  
  document.getElementById('contentBox3').innerHTML = `
    <div class="shimmer-box">
      <div class="shimmer-title"></div>
      <div class="shimmer-features-grid">
        <div class="shimmer-feature">
          <div class="shimmer-icon"></div>
          <div class="shimmer-feature-title"></div>
          <div class="shimmer-text"></div>
        </div>
        <div class="shimmer-feature">
          <div class="shimmer-icon"></div>
          <div class="shimmer-feature-title"></div>
          <div class="shimmer-text"></div>
        </div>
        <div class="shimmer-feature">
          <div class="shimmer-icon"></div>
          <div class="shimmer-feature-title"></div>
          <div class="shimmer-text"></div>
        </div>
        <div class="shimmer-feature">
          <div class="shimmer-icon"></div>
          <div class="shimmer-feature-title"></div>
          <div class="shimmer-text"></div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('contentBox4').innerHTML = `
    <div class="shimmer-box">
      <div class="shimmer-title"></div>
      <div class="shimmer-list">
        <div class="shimmer-list-item"></div>
        <div class="shimmer-list-item"></div>
        <div class="shimmer-list-item"></div>
        <div class="shimmer-list-item"></div>
        <div class="shimmer-list-item"></div>
      </div>
    </div>
  `;
  
  document.getElementById('contentBox5').innerHTML = `
    <div class="shimmer-box">
      <div class="shimmer-title"></div>
      <div class="shimmer-text"></div>
      <div class="shimmer-text"></div>
      <div class="shimmer-text"></div>
      <div class="shimmer-text short"></div>
    </div>
  `;
}

function loadActualContent() {
  document.getElementById('contentBox1').innerHTML = `
    <h2>Who We Are</h2>
    <p>Earnify is a premier digital marketplace dedicated to empowering learners, students, and professionals with high-quality educational resources and services. Founded with the vision of making premium learning materials accessible to everyone, we bridge the gap between knowledge seekers and content creators.</p>
  `;
  
  document.getElementById('contentBox2').innerHTML = `
    <h2>Our Mission</h2>
    <p>To democratize education by providing a platform where quality study materials, templates, and professional services are easily accessible. We believe that everyone deserves access to premium educational resources that can help them achieve their academic and professional goals.</p>
  `;
  
  document.getElementById('contentBox3').innerHTML = `
    <h2>What We Offer</h2>
    <div class="features-grid-2">
      <div class="feature-item">
        <i class="fas fa-file-pdf"></i>
        <h3>PDF Notes & Study Materials</h3>
        <p>Comprehensive study guides, lecture notes, and reference materials across various subjects.</p>
      </div>
      <div class="feature-item">
        <i class="fas fa-file-excel"></i>
        <h3>Excel Templates</h3>
        <p>Professional spreadsheet templates for business, finance, and academic purposes.</p>
      </div>
      <div class="feature-item">
        <i class="fas fa-graduation-cap"></i>
        <h3>Exam Preparation</h3>
        <p>Practice tests, question banks, and exam strategies to help you succeed.</p>
      </div>
      <div class="feature-item">
        <i class="fas fa-briefcase"></i>
        <h3>Professional Services</h3>
        <p>Freelance services including tutoring, consulting, and project assistance.</p>
      </div>
    </div>
  `;
  
  document.getElementById('contentBox4').innerHTML = `
    <h2>Why Choose Earnify?</h2>
    <ul class="benefits-list">
      <li><i class="fas fa-check-circle"></i> Curated high-quality resources from verified creators</li>
      <li><i class="fas fa-check-circle"></i> Secure payment processing and instant access</li>
      <li><i class="fas fa-check-circle"></i> Affordable pricing for students and professionals</li>
      <li><i class="fas fa-check-circle"></i> Regular updates and new content additions</li>
      <li><i class="fas fa-check-circle"></i> Dedicated customer support</li>
    </ul>
  `;
  
  document.getElementById('contentBox5').innerHTML = `
    <h2>Our Values</h2>
    <p><strong>Quality:</strong> We ensure all resources meet high standards of accuracy and usefulness.</p>
    <p><strong>Accessibility:</strong> Making education affordable and available to everyone.</p>
    <p><strong>Trust:</strong> Building a secure and reliable platform for our community.</p>
    <p><strong>Innovation:</strong> Continuously improving our platform to serve you better.</p>
  `;
}
