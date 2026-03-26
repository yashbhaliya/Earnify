document.addEventListener('DOMContentLoaded', function() {
  loadAboutContent();
});

function loadAboutContent() {
  showShimmer();
  setTimeout(() => { loadActualContent(); }, 1200);
}

function showShimmer() {
  const shimmer = `<div class="shimmer-box"><div class="shimmer-title"></div><div class="shimmer-text"></div><div class="shimmer-text"></div><div class="shimmer-text short"></div></div>`;
  ['contentBox1','contentBox2','contentBox5','contentBox6'].forEach(id => {
    document.getElementById(id).innerHTML = shimmer;
  });
  document.getElementById('contentBox3').innerHTML = `<div class="shimmer-box"><div class="shimmer-title"></div><div class="shimmer-features-grid"><div class="shimmer-feature"><div class="shimmer-icon"></div><div class="shimmer-feature-title"></div><div class="shimmer-text"></div></div><div class="shimmer-feature"><div class="shimmer-icon"></div><div class="shimmer-feature-title"></div><div class="shimmer-text"></div></div><div class="shimmer-feature"><div class="shimmer-icon"></div><div class="shimmer-feature-title"></div><div class="shimmer-text"></div></div><div class="shimmer-feature"><div class="shimmer-icon"></div><div class="shimmer-feature-title"></div><div class="shimmer-text"></div></div></div></div>`;
  document.getElementById('contentBox4').innerHTML = `<div class="shimmer-box"><div class="shimmer-title"></div><div class="shimmer-list"><div class="shimmer-list-item"></div><div class="shimmer-list-item"></div><div class="shimmer-list-item"></div><div class="shimmer-list-item"></div><div class="shimmer-list-item"></div></div></div>`;
}

function loadActualContent() {

  // ── 1. Who We Are ──
  document.getElementById('contentBox1').innerHTML = `
    <h2>Who We Are</h2>
    <p>Earnify is an Indian digital marketplace that connects <strong>knowledge creators</strong> with <strong>learners and professionals</strong>. We make it easy for anyone to sell their study notes, Excel templates, exam materials, or freelance services — and for buyers to find exactly what they need, instantly.</p>
    <p>We are built on three principles: <strong>transparency</strong> in earnings, <strong>security</strong> in payments, and <strong>quality</strong> in every resource listed. Whether you are a student, a working professional, or a content creator — Earnify is your platform.</p>
    <div class="about-stats-row">
      <div class="about-stat">
        <div class="about-stat-num">500+</div>
        <div class="about-stat-label">Resources Listed</div>
      </div>
      <div class="about-stat">
        <div class="about-stat-num">1,200+</div>
        <div class="about-stat-label">Happy Buyers</div>
      </div>
      <div class="about-stat">
        <div class="about-stat-num">300+</div>
        <div class="about-stat-label">Active Sellers</div>
      </div>
      <div class="about-stat">
        <div class="about-stat-num">5%</div>
        <div class="about-stat-label">Only Platform Fee</div>
      </div>
    </div>
  `;

  // ── 2. Our Mission ──
  document.getElementById('contentBox2').innerHTML = `
    <h2>Our Mission</h2>
    <p>Our mission is to <strong>democratise access to quality learning resources</strong> while giving creators a fair, transparent way to earn from their expertise. We believe that the right resource at the right time can change the direction of someone's career or academic journey.</p>
    <p>Every resource on Earnify is reviewed before going live. Every payment is processed securely through <strong>Razorpay</strong> — an RBI-regulated, PCI-DSS compliant payment gateway. Every withdrawal is handled with a clear, flat <strong>5% platform fee</strong> — no hidden charges, no surprises.</p>
  `;

  // ── 3. What We Offer ──
  document.getElementById('contentBox3').innerHTML = `
    <h2>What We Offer</h2>
    <div class="features-grid-2">
      <div class="feature-item">
        <i class="fas fa-file-pdf"></i>
        <h3>PDF Notes &amp; Study Materials</h3>
        <p>Well-structured lecture notes, subject guides, and reference PDFs — ready to download and use immediately after purchase.</p>
      </div>
      <div class="feature-item">
        <i class="fas fa-file-excel"></i>
        <h3>Excel Templates</h3>
        <p>Professional spreadsheet templates for budgeting, project tracking, data analysis, and more — built to save you hours of work.</p>
      </div>
      <div class="feature-item">
        <i class="fas fa-graduation-cap"></i>
        <h3>Exam Preparation</h3>
        <p>Practice papers, question banks, revision notes, and exam strategies — designed to help you walk into your exam with confidence.</p>
      </div>
      <div class="feature-item">
        <i class="fas fa-briefcase"></i>
        <h3>Freelance Services</h3>
        <p>Connect with skilled professionals for tutoring, consulting, assignment help, and project support — delivered by people who know their field.</p>
      </div>
    </div>
  `;

  // ── 4. How It Works ──
  document.getElementById('contentBox4').innerHTML = `
    <h2>How Earnify Works</h2>
    <p>Getting started takes less than 2 minutes — whether you want to buy or sell.</p>
    <ul class="benefits-list">
      <li>
        <i class="fas fa-user-plus"></i>
        <div><strong>Sign up free</strong><br><span>Create your account in seconds. No subscription, no upfront cost — ever.</span></div>
      </li>
      <li>
        <i class="fas fa-upload"></i>
        <div><strong>List your resource</strong><br><span>Upload your file, write a description, set your price, and publish. Goes live after a quick review.</span></div>
      </li>
      <li>
        <i class="fas fa-search"></i>
        <div><strong>Buyers browse &amp; purchase</strong><br><span>Buyers find your resource, pay securely via Razorpay, and get instant access after payment.</span></div>
      </li>
      <li>
        <i class="fas fa-chart-line"></i>
        <div><strong>Track earnings in real time</strong><br><span>Your Dashboard shows total revenue, available balance, withdrawn amount, platform fees, and pending requests.</span></div>
      </li>
      <li>
        <i class="fas fa-wallet"></i>
        <div><strong>Withdraw anytime — only 5% fee</strong><br><span>Request a withdrawal to your bank or UPI. A flat 5% platform fee is deducted. Withdraw ₹1,000 → receive ₹950 net. No other charges.</span></div>
      </li>
      <li>
        <i class="fas fa-shield-alt"></i>
        <div><strong>Always secure</strong><br><span>Payments via Razorpay (RBI-regulated). Account data via Supabase (encrypted). We never store your card or bank details.</span></div>
      </li>
    </ul>
  `;

  // ── 5. Our Values ──
  document.getElementById('contentBox5').innerHTML = `
    <h2>Our Values</h2>
    <div class="values-grid">
      <div class="value-card">
        <div class="value-icon">🔍</div>
        <h3>Transparency</h3>
        <p>You always know exactly what you earn, what the fee is, and what you will receive. No hidden costs, no surprises.</p>
      </div>
      <div class="value-card">
        <div class="value-icon">🔒</div>
        <h3>Security</h3>
        <p>Payments via Razorpay (RBI-regulated). Data via Supabase (encrypted). We never store your card or bank details.</p>
      </div>
      <div class="value-card">
        <div class="value-icon">⚖️</div>
        <h3>Fairness</h3>
        <p>One flat 5% fee on withdrawals — regardless of resource type or amount. Every creator is treated equally.</p>
      </div>
      <div class="value-card">
        <div class="value-icon">✅</div>
        <h3>Quality</h3>
        <p>Every resource is reviewed before going live. We maintain standards so buyers trust what they purchase.</p>
      </div>
      <div class="value-card">
        <div class="value-icon">🚀</div>
        <h3>Growth</h3>
        <p>We constantly improve — adding features, refining the platform, and listening to our creator and buyer community.</p>
      </div>
      <div class="value-card">
        <div class="value-icon">🤝</div>
        <h3>Community</h3>
        <p>Earnify is built by and for its users. Your feedback shapes every update we make to the platform.</p>
      </div>
    </div>
  `;

  // ── 6. CTA ──
  document.getElementById('contentBox6').innerHTML = `
    <div class="about-cta">
      <div class="about-cta-content">
        <h2>Ready to Start?</h2>
        <p>Join thousands of buyers and sellers already using Earnify. Sign up free, list your first resource, and start earning today.</p>
        <div class="about-cta-btns">
          <a href="../admin/Resources/" class="about-btn-primary">Start Selling →</a>
          <a href="../#resources" class="about-btn-secondary">Browse Resources</a>
        </div>
      </div>
    </div>
    <div class="contact-us-strip">
      <div class="contact-us-strip-inner">
        <div class="contact-us-left">
          <div class="contact-us-icon"><i class="fas fa-headset"></i></div>
          <div>
            <h3>Have a question or need help?</h3>
            <p>Our support team is available Mon–Fri, 9 AM–6 PM. We respond within 2 hours.</p>
          </div>
        </div>
        <a href="../Contact/" class="contact-us-btn"><i class="fas fa-envelope"></i> Contact Us</a>
      </div>
    </div>
  `;
}
