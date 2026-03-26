// Shimmer loading for About page
document.addEventListener('DOMContentLoaded', function() {
  loadAboutContent();
});

function loadAboutContent() {
  showShimmer();
  setTimeout(() => { loadActualContent(); }, 1500);
}

function showShimmer() {
  const shimmer = `
    <div class="shimmer-box">
      <div class="shimmer-title"></div>
      <div class="shimmer-text"></div>
      <div class="shimmer-text"></div>
      <div class="shimmer-text short"></div>
    </div>`;
  document.getElementById('contentBox1').innerHTML = shimmer;
  document.getElementById('contentBox2').innerHTML = shimmer;
  document.getElementById('contentBox3').innerHTML = `
    <div class="shimmer-box">
      <div class="shimmer-title"></div>
      <div class="shimmer-features-grid">
        <div class="shimmer-feature"><div class="shimmer-icon"></div><div class="shimmer-feature-title"></div><div class="shimmer-text"></div></div>
        <div class="shimmer-feature"><div class="shimmer-icon"></div><div class="shimmer-feature-title"></div><div class="shimmer-text"></div></div>
        <div class="shimmer-feature"><div class="shimmer-icon"></div><div class="shimmer-feature-title"></div><div class="shimmer-text"></div></div>
        <div class="shimmer-feature"><div class="shimmer-icon"></div><div class="shimmer-feature-title"></div><div class="shimmer-text"></div></div>
      </div>
    </div>`;
  document.getElementById('contentBox4').innerHTML = `
    <div class="shimmer-box">
      <div class="shimmer-title"></div>
      <div class="shimmer-list">
        <div class="shimmer-list-item"></div><div class="shimmer-list-item"></div>
        <div class="shimmer-list-item"></div><div class="shimmer-list-item"></div>
        <div class="shimmer-list-item"></div><div class="shimmer-list-item"></div>
      </div>
    </div>`;
  document.getElementById('contentBox5').innerHTML = shimmer;
}

function loadActualContent() {
  document.getElementById('contentBox1').innerHTML = `
    <h2>Who We Are</h2>
    <p>Earnify is a trusted digital marketplace where creators, educators, and professionals sell their knowledge and skills. We connect sellers who create premium study materials, templates, exam resources, and freelance services with buyers who need them — all through a secure, easy-to-use platform.</p>
    <p>Whether you're a student looking for exam prep notes, a professional needing a ready-made Excel template, or a creator wanting to earn from your expertise — Earnify is built for you.</p>
  `;

  document.getElementById('contentBox2').innerHTML = `
    <h2>Our Mission</h2>
    <p>Our mission is to make high-quality learning resources accessible to everyone while giving creators a fair and transparent way to earn from their work. We believe knowledge has value — and the people who create it deserve to be rewarded.</p>
    <p>At Earnify, every resource is reviewed before going live, every payment is processed securely through Razorpay, and every withdrawal is handled transparently with a clear 5% platform fee — so you always know exactly what you earn.</p>
  `;

  document.getElementById('contentBox3').innerHTML = `
    <h2>What We Offer</h2>
    <div class="features-grid-2">
      <div class="feature-item">
        <i class="fas fa-file-pdf"></i>
        <h3>PDF Notes &amp; Study Materials</h3>
        <p>Well-structured lecture notes, subject guides, and reference PDFs across a wide range of topics — ready to download and use immediately after purchase.</p>
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
    <h2>How Earnings &amp; Withdrawals Work</h2>
    <p>Earnify operates on a fully transparent earnings model. Here is exactly how it works:</p>
    <ul class="benefits-list">
      <li><i class="fas fa-check-circle"></i> <strong>Sell your resources</strong> — Set your own price and list your resource. Every completed purchase adds to your available balance instantly.</li>
      <li><i class="fas fa-check-circle"></i> <strong>Track your earnings</strong> — Your Dashboard shows total revenue, available balance, withdrawn amount, platform fees, and pending requests in real time.</li>
      <li><i class="fas fa-check-circle"></i> <strong>Request a withdrawal</strong> — Submit a withdrawal request from your Withdrawal page with your bank or UPI details and the amount you want to withdraw.</li>
      <li><i class="fas fa-check-circle"></i> <strong>Platform fee: 5%</strong> — A flat 5% platform fee is deducted from each withdrawal. For example, if you request ₹1,000 you receive ₹950 net. This covers payment processing, platform maintenance, and support.</li>
      <li><i class="fas fa-check-circle"></i> <strong>Admin review</strong> — Every withdrawal is reviewed by our admin team. Approved requests are processed promptly. Rejected requests include a clear reason so you can resubmit.</li>
      <li><i class="fas fa-check-circle"></i> <strong>Secure payments</strong> — All buyer payments are processed through Razorpay, an RBI-regulated payment gateway. Your financial data is never stored on our servers.</li>
      <li><i class="fas fa-check-circle"></i> <strong>No hidden charges</strong> — The only deduction is the 5% withdrawal fee. No listing fees, no monthly charges, no surprise deductions.</li>
    </ul>
  `;

  document.getElementById('contentBox5').innerHTML = `
    <h2>Our Values</h2>
    <p><strong>Transparency:</strong> We show you exactly what you earn, what the fee is, and what you will receive — no surprises, no hidden costs. Your Dashboard reflects every transaction in real time.</p>
    <p><strong>Security:</strong> All payments are processed through Razorpay, a trusted and RBI-regulated payment gateway. We never store your card or bank details on our servers.</p>
    <p><strong>Fairness:</strong> A single flat 5% fee applies to all withdrawals regardless of resource type or amount. Every creator is treated equally.</p>
    <p><strong>Quality:</strong> Every resource listed on Earnify is reviewed before going live. We maintain standards so buyers trust what they purchase and sellers build a credible reputation.</p>
    <p><strong>Growth:</strong> We are constantly improving — adding new features, refining the platform, and listening to our creator and buyer community to make Earnify better every day.</p>
  `;
}
