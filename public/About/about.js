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
    <p>Earnify is a trusted digital learning marketplace built for students, professionals, and self-learners who want to grow faster. We connect knowledge seekers with premium study materials, ready-to-use templates, exam resources, and skilled freelance professionals — all in one place.</p>
    <p>Whether you're preparing for an exam, building a business spreadsheet, or looking for expert help on a project, Earnify has you covered with resources that are practical, affordable, and instantly accessible.</p>
  `;

  document.getElementById('contentBox2').innerHTML = `
    <h2>Our Mission</h2>
    <p>Our mission is simple — make high-quality learning resources available to everyone, regardless of their background or budget. We believe that the right material at the right time can change the direction of someone's career or academic journey.</p>
    <p>At Earnify, we work hard to ensure every resource on our platform is accurate, up-to-date, and genuinely useful — so you spend less time searching and more time learning.</p>
  `;

  document.getElementById('contentBox3').innerHTML = `
    <h2>What We Offer</h2>
    <div class="features-grid-2">
      <div class="feature-item">
        <i class="fas fa-file-pdf"></i>
        <h3>PDF Notes & Study Materials</h3>
        <p>Well-structured lecture notes, subject guides, and reference PDFs across a wide range of topics — ready to download and use immediately.</p>
      </div>
      <div class="feature-item">
        <i class="fas fa-file-excel"></i>
        <h3>Excel Templates</h3>
        <p>Professional, ready-to-use spreadsheet templates for budgeting, project tracking, data analysis, and more — built to save you hours of work.</p>
      </div>
      <div class="feature-item">
        <i class="fas fa-graduation-cap"></i>
        <h3>Exam Preparation</h3>
        <p>Targeted practice papers, question banks, revision notes, and exam strategies designed to help you walk into your exam with confidence.</p>
      </div>
      <div class="feature-item">
        <i class="fas fa-briefcase"></i>
        <h3>Freelance Services</h3>
        <p>Connect with skilled professionals for tutoring, consulting, assignment help, and project support — delivered by people who know their field.</p>
      </div>
    </div>
  `;

  document.getElementById('contentBox4').innerHTML = `
    <h2>Why Choose Earnify?</h2>
    <ul class="benefits-list">
      <li><i class="fas fa-check-circle"></i> Every resource is reviewed and verified before it goes live on the platform</li>
      <li><i class="fas fa-check-circle"></i> Secure payment processing with instant access after purchase</li>
      <li><i class="fas fa-check-circle"></i> Pricing that works for students, freelancers, and working professionals</li>
      <li><i class="fas fa-check-circle"></i> New resources added regularly to keep content fresh and relevant</li>
      <li><i class="fas fa-check-circle"></i> Responsive support team ready to help when you need it</li>
      <li><i class="fas fa-check-circle"></i> Clean, fast, and easy-to-use platform — no clutter, no confusion</li>
    </ul>
  `;

  document.getElementById('contentBox5').innerHTML = `
    <h2>Our Values</h2>
    <p><strong>Quality:</strong> Every resource on Earnify is held to a high standard. We don't list anything we wouldn't use ourselves.</p>
    <p><strong>Accessibility:</strong> Great learning materials shouldn't cost a fortune. We keep our pricing fair and transparent.</p>
    <p><strong>Trust:</strong> Your data, your payments, and your experience are safe with us. We take security seriously.</p>
    <p><strong>Growth:</strong> We're constantly improving — adding new resources, refining the platform, and listening to our community.</p>
  `;
}
