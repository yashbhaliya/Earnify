// Shimmer loading for Terms page
document.addEventListener('DOMContentLoaded', function() {
  loadTermsContent();
});

function loadTermsContent() {
  showShimmer();
  setTimeout(() => { loadActualContent(); }, 1500);
}

function showShimmer() {
  const container = document.getElementById('termsContainer');

  const patterns = [
    ['', 'w85', 'w70'],
    ['', 'w90', ''],
    ['', '', 'w85', 'w60'],
    ['', 'w70'],
    ['', 'w90', 'w85'],
    ['', '', 'w70'],
  ];

  let cards = '';
  for (let i = 0; i < 6; i++) {
    const lines = patterns[i].map(w =>
      `<div class="shimmer-text${w ? ' ' + w : ''}"></div>`
    ).join('');
    cards += `
      <div class="content-box shimmer-card">
        <div class="shimmer-icon"></div>
        <div class="shimmer-title"></div>
        ${lines}
      </div>`;
  }

  const sidebarLines = ['w85','w70','w90','w60','w85','w70','w90','w60'].map(w =>
    `<div class="shimmer-text ${w}" style="height:11px;margin-bottom:9px"></div>`
  ).join('');

  const sidebar = `
    <div class="shimmer-sidebar" style="width:230px;flex-shrink:0">
      <div class="toc-inner">
        <div class="shimmer-title" style="width:55%;height:13px;margin-bottom:18px"></div>
        ${sidebarLines}
        <div class="shimmer-title" style="width:100%;height:34px;border-radius:10px;margin-top:16px;margin-bottom:0"></div>
      </div>
    </div>`;

  container.innerHTML = `<div class="terms-layout">${sidebar}<div class="terms-main">${cards}</div></div>`;
}

function loadActualContent() {
  const container = document.getElementById('termsContainer');
  container.innerHTML = `
    <div class="terms-layout">

      <!-- Sticky TOC Sidebar -->
      <aside class="toc-sidebar">
        <div class="toc-inner">
          <div class="toc-header"><i class="fas fa-list-ul"></i> Contents</div>
          <nav class="toc-nav">
            <a href="#t1" class="toc-link"><span class="toc-num">01</span> Acceptance of Terms</a>
            <a href="#t2" class="toc-link"><span class="toc-num">02</span> Use of Services</a>
            <a href="#t3" class="toc-link"><span class="toc-num">03</span> Payment System</a>
            <a href="#t4" class="toc-link"><span class="toc-num">04</span> Seller Earnings</a>
            <a href="#t5" class="toc-link"><span class="toc-num">05</span> Withdrawal Policy</a>
            <a href="#t6" class="toc-link"><span class="toc-num">06</span> Refund Policy</a>
            <a href="#t7" class="toc-link"><span class="toc-num">07</span> Intellectual Property</a>
            <a href="#t8" class="toc-link"><span class="toc-num">08</span> Seller Responsibilities</a>
            <a href="#t9" class="toc-link"><span class="toc-num">09</span> Limitation of Liability</a>
            <a href="#t10" class="toc-link"><span class="toc-num">10</span> Account Termination</a>
            <a href="#t11" class="toc-link"><span class="toc-num">11</span> Privacy &amp; Data</a>
            <a href="#t12" class="toc-link"><span class="toc-num">12</span> Changes to Terms</a>
            <a href="#t13" class="toc-link"><span class="toc-num">13</span> Contact</a>
          </nav>
          <a href="mailto:support@earnify.com" class="toc-cta"><i class="fas fa-envelope"></i> Need Help?</a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="terms-main">

        <div class="content-box" id="t1">
          <div class="section-icon-wrap"><i class="fas fa-file-signature"></i></div>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Earnify, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services. These terms apply to all users — buyers, sellers, and visitors.</p>
          <div class="info-box info-blue"><i class="fas fa-info-circle"></i> These terms form a legally binding agreement between you and Earnify.</div>
        </div>

        <div class="content-box" id="t2">
          <div class="section-icon-wrap"><i class="fas fa-user-shield"></i></div>
          <h2>2. Use of Services</h2>
          <div class="rule-cards">
            <div class="rule-card">
              <i class="fas fa-birthday-cake"></i>
              <div><strong>Eligibility</strong><p>You must be at least 13 years old. Users under 18 require parental or guardian consent.</p></div>
            </div>
            <div class="rule-card">
              <i class="fas fa-key"></i>
              <div><strong>Account Security</strong><p>You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.</p></div>
            </div>
            <div class="rule-card rule-card--warn">
              <i class="fas fa-ban"></i>
              <div><strong>Prohibited Activities</strong><p>You may not engage in illegal activities, distribute malware, violate intellectual property rights, or misrepresent your resources.</p></div>
            </div>
          </div>
        </div>

        <div class="content-box" id="t3">
          <div class="section-icon-wrap"><i class="fas fa-credit-card"></i></div>
          <h2>3. Payment System</h2>
          <div class="highlight-strip"><i class="fas fa-lock"></i> All payments are processed securely via <strong>Razorpay</strong> — an RBI-regulated gateway. We never store your card, UPI, or bank details.</div>
          <ul class="benefits-list">
            <li><i class="fas fa-check-circle"></i><span><strong>Supported Methods:</strong> Credit/debit cards, UPI, net banking, and digital wallets.</span></li>
            <li><i class="fas fa-check-circle"></i><span><strong>Pricing:</strong> All prices are in Indian Rupees (₹) and set by the resource creator.</span></li>
            <li><i class="fas fa-check-circle"></i><span><strong>Instant Access:</strong> Upon successful payment, you get immediate access. Confirmation is recorded in your Dashboard.</span></li>
            <li><i class="fas fa-exclamation-circle" style="color:#f59e0b"></i><span><strong>Failed Payments:</strong> Contact support@earnify.com with transaction details. Resolved within 5–7 business days.</span></li>
          </ul>
        </div>

        <div class="content-box" id="t4">
          <div class="section-icon-wrap"><i class="fas fa-coins"></i></div>
          <h2>4. Seller Earnings &amp; Commission</h2>
          <div class="fee-showcase">
            <div class="fee-card">
              <div class="fee-num">5%</div>
              <div class="fee-label">Platform Fee</div>
              <div class="fee-sub">Only on withdrawal</div>
            </div>
            <div class="fee-card fee-card--green">
              <div class="fee-num">₹0</div>
              <div class="fee-label">Listing Fee</div>
              <div class="fee-sub">Always free to list</div>
            </div>
            <div class="fee-card fee-card--purple">
              <div class="fee-num">Real-time</div>
              <div class="fee-label">Earnings Tracking</div>
              <div class="fee-sub">Via your Dashboard</div>
            </div>
          </div>
          <div class="info-box info-green"><i class="fas fa-calculator"></i> <strong>Example:</strong> Withdraw ₹2,000 → Fee ₹100 (5%) → You receive <strong>₹1,900</strong>. Fee is on withdrawal amount, not sale price.</div>
          <p>Your Dashboard shows: Total Revenue, Available Balance, Withdrawn Amount, Platform Fees, and Pending requests.</p>
        </div>

        <div class="content-box" id="t5">
          <div class="section-icon-wrap"><i class="fas fa-wallet"></i></div>
          <h2>5. Withdrawal Policy</h2>
          <div class="steps-list">
            <div class="step-item"><div class="step-num">1</div><div><strong>Submit Request</strong> — Go to the Withdrawal page, enter valid bank/UPI details and the amount.</div></div>
            <div class="step-item"><div class="step-num">2</div><div><strong>Admin Review</strong> — Our team verifies account details and checks for fraudulent activity.</div></div>
            <div class="step-item"><div class="step-num">3</div><div><strong>Approval &amp; Transfer</strong> — Approved withdrawals are sent to your bank/UPI. Processing time varies by bank.</div></div>
            <div class="step-item step-item--warn"><div class="step-num">!</div><div><strong>Rejection</strong> — Requests may be rejected for incorrect details or insufficient balance. You may resubmit after correction.</div></div>
          </div>
          <div class="info-box info-blue"><i class="fas fa-info-circle"></i> No minimum withdrawal amount. The 5% fee is deducted at approval time.</div>
        </div>

        <div class="content-box" id="t6">
          <div class="section-icon-wrap"><i class="fas fa-undo-alt"></i></div>
          <h2>6. Refund Policy</h2>
          <div class="info-box info-warn"><i class="fas fa-exclamation-triangle"></i> All sales are <strong>generally final</strong> once a digital resource has been accessed or downloaded.</div>
          <p><strong>Refunds may be considered if:</strong></p>
          <ul class="benefits-list">
            <li><i class="fas fa-check-circle"></i><span>The resource is significantly different from its description.</span></li>
            <li><i class="fas fa-check-circle"></i><span>The file is corrupted or inaccessible.</span></li>
            <li><i class="fas fa-check-circle"></i><span>A duplicate purchase was made accidentally.</span></li>
          </ul>
          <div class="info-box info-blue" style="margin-top:14px"><i class="fas fa-envelope"></i> Email <a href="mailto:support@earnify.com" style="color:#667eea;font-weight:600;">support@earnify.com</a> within <strong>48 hours</strong> of purchase. We respond within 5 business days.</div>
        </div>

        <div class="content-box" id="t7">
          <div class="section-icon-wrap"><i class="fas fa-copyright"></i></div>
          <h2>7. Intellectual Property</h2>
          <div class="rule-cards">
            <div class="rule-card">
              <i class="fas fa-user"></i>
              <div><strong>Buyer License</strong><p>Resources are licensed for personal use only. Redistribution, resale, or republishing is strictly prohibited.</p></div>
            </div>
            <div class="rule-card">
              <i class="fas fa-store"></i>
              <div><strong>Seller Ownership</strong><p>Sellers retain full ownership. By listing, you grant Earnify a non-exclusive license to display and distribute your resources.</p></div>
            </div>
            <div class="rule-card">
              <i class="fas fa-shield-alt"></i>
              <div><strong>Platform Content</strong><p>Earnify's design, logo, code, and features are protected by copyright and trademark laws.</p></div>
            </div>
          </div>
        </div>

        <div class="content-box" id="t8">
          <div class="section-icon-wrap"><i class="fas fa-tasks"></i></div>
          <h2>8. Seller Responsibilities</h2>
          <ul class="benefits-list">
            <li><i class="fas fa-check-circle"></i><span>Ensure all listed resources are accurate, original, and not plagiarised.</span></li>
            <li><i class="fas fa-check-circle"></i><span>Provide correct bank or UPI details when submitting withdrawal requests.</span></li>
            <li><i class="fas fa-check-circle"></i><span>Do not list resources that violate copyright, contain harmful content, or misrepresent their value.</span></li>
            <li><i class="fas fa-check-circle"></i><span>Maintain resource quality and update content if it becomes outdated.</span></li>
            <li><i class="fas fa-check-circle"></i><span>Comply with all applicable tax laws regarding income earned through the platform.</span></li>
          </ul>
        </div>

        <div class="content-box" id="t9">
          <div class="section-icon-wrap"><i class="fas fa-balance-scale"></i></div>
          <h2>9. Limitation of Liability</h2>
          <div class="info-box info-warn"><i class="fas fa-exclamation-triangle"></i> Earnify is provided <strong>"as is"</strong> without warranties of any kind.</div>
          <p>We are not liable for any indirect, incidental, or consequential damages. Our total liability shall not exceed the amount you paid for the specific resource. We are not responsible for losses from incorrect bank details provided during withdrawal requests.</p>
        </div>

        <div class="content-box" id="t10">
          <div class="section-icon-wrap"><i class="fas fa-user-times"></i></div>
          <h2>10. Account Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or abuse the withdrawal system. Upon termination, pending withdrawal requests may be cancelled and access to purchased resources may be revoked. Outstanding balances are reviewed case-by-case.</p>
        </div>

        <div class="content-box" id="t11">
          <div class="section-icon-wrap"><i class="fas fa-lock"></i></div>
          <h2>11. Privacy &amp; Data Security</h2>
          <div class="info-box info-green"><i class="fas fa-shield-alt"></i> Payment data is handled exclusively by Razorpay and is <strong>never stored</strong> on Earnify servers.</div>
          <p>Your personal information is used only to operate the platform and process transactions. Review our <a href="../Privacy/" style="color:#667eea;font-weight:600;">Privacy Policy</a> for full details.</p>
        </div>

        <div class="content-box" id="t12">
          <div class="section-icon-wrap"><i class="fas fa-sync-alt"></i></div>
          <h2>12. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the updated terms. We will notify users of significant changes via email or platform notifications.</p>
        </div>

        <div class="content-box" id="t13">
          <div class="section-icon-wrap"><i class="fas fa-envelope-open-text"></i></div>
          <h2>13. Contact Information</h2>
          <p>For questions about these terms, withdrawal issues, or payment disputes, please reach out:</p>
          <div class="contact-card">
            <a href="mailto:support@earnify.com" class="contact-item"><i class="fas fa-envelope"></i><span>support@earnify.com</span></a>
            <div class="contact-item"><i class="fas fa-clock"></i><span>Response within 2 business days</span></div>
          </div>
        </div>

        <div class="contact-us-strip">
          <div class="contact-us-strip-inner">
            <div class="contact-us-left">
              <div class="contact-us-icon"><i class="fas fa-headset"></i></div>
              <div>
                <h3>Still have questions?</h3>
                <p>Our support team is available Mon–Fri, 9 AM–6 PM. We respond within 2 hours.</p>
              </div>
            </div>
            <a href="../Contact/" class="contact-us-btn"><i class="fas fa-envelope"></i> Contact Us</a>
          </div>
        </div>

      </main>
    </div>
  `;

  // Highlight active TOC link on scroll
  const sections = document.querySelectorAll('.content-box[id]');
  const tocLinks = document.querySelectorAll('.toc-link');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.toc-link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
}
