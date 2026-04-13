document.addEventListener('DOMContentLoaded', function () {
  loadPrivacyContent();
});

function loadPrivacyContent() {
  showShimmer();
  setTimeout(() => { loadActualContent(); }, 1500);
}

function showShimmer() {
  const container = document.getElementById('privacyContainer');

  const patterns = [
    ['', 'w85', 'w70'],
    ['', 'w90', ''],
    ['', '', 'w85', 'w60'],
    ['', 'w70'],
    ['', 'w90', 'w85'],
    ['', '', 'w70'],
    ['', 'w85'],
    ['', 'w90', 'w60'],
  ];

  let cards = '';
  for (let i = 0; i < 8; i++) {
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

  const sidebarLines = ['w85','w70','w90','w60','w85','w70','w90','w60','w85','w70','w90','w60','w85'].map(w =>
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

  container.innerHTML = `<div class="privacy-layout">${sidebar}<div class="privacy-main">${cards}</div></div>`;
}

function loadActualContent() {
  const container = document.getElementById('privacyContainer');
  container.innerHTML = `
    <div class="privacy-layout">

      <!-- TOC Sidebar -->
      <aside class="toc-sidebar">
        <div class="toc-inner">
          <div class="toc-header"><i class="fas fa-shield-alt"></i> Contents</div>
          <nav class="toc-nav">
            <a href="#p1"  class="toc-link"><span class="toc-num">01</span> Introduction</a>
            <a href="#p2"  class="toc-link"><span class="toc-num">02</span> Data We Collect</a>
            <a href="#p3"  class="toc-link"><span class="toc-num">03</span> How We Use It</a>
            <a href="#p4"  class="toc-link"><span class="toc-num">04</span> Payment & Razorpay</a>
            <a href="#p5"  class="toc-link"><span class="toc-num">05</span> Withdrawal Data</a>
            <a href="#p6"  class="toc-link"><span class="toc-num">06</span> Storage & Security</a>
            <a href="#p7"  class="toc-link"><span class="toc-num">07</span> Information Sharing</a>
            <a href="#p8"  class="toc-link"><span class="toc-num">08</span> Cookies</a>
            <a href="#p9"  class="toc-link"><span class="toc-num">09</span> Your Rights</a>
            <a href="#p10" class="toc-link"><span class="toc-num">10</span> Data Retention</a>
            <a href="#p11" class="toc-link"><span class="toc-num">11</span> Children's Privacy</a>
            <a href="#p12" class="toc-link"><span class="toc-num">12</span> Policy Changes</a>
            <a href="#p13" class="toc-link"><span class="toc-num">13</span> Contact Us</a>
          </nav>
          <a href="mailto:support@earnify.com" class="toc-cta"><i class="fas fa-envelope"></i> Privacy Query?</a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="privacy-main">

        <div class="content-box" id="p1">
          <div class="section-icon-wrap"><i class="fas fa-file-shield"></i></div>
          <h2>1. Introduction</h2>
          <p>At Earnify, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains what data we collect, how we use it, who we share it with, and what rights you have.</p>
          <div class="info-box info-blue"><i class="fas fa-info-circle"></i> By using Earnify, you agree to the collection and use of information as described in this policy.</div>
          <div class="privacy-stats">
            <div class="pstat-card"><i class="fas fa-ban"></i><span>No data selling</span></div>
            <div class="pstat-card"><i class="fas fa-lock"></i><span>Encrypted storage</span></div>
            <div class="pstat-card"><i class="fas fa-user-shield"></i><span>You control your data</span></div>
          </div>
        </div>

        <div class="content-box" id="p2">
          <div class="section-icon-wrap"><i class="fas fa-database"></i></div>
          <h2>2. Information We Collect</h2>
          <div class="data-grid">
            <div class="data-card">
              <div class="data-card-head"><i class="fas fa-user-circle"></i> Account Info</div>
              <ul>
                <li>Name &amp; email address</li>
                <li>Password (encrypted via Supabase Auth)</li>
                <li>Profile details you add</li>
              </ul>
            </div>
            <div class="data-card">
              <div class="data-card-head"><i class="fas fa-credit-card"></i> Transaction Info</div>
              <ul>
                <li>Purchase history &amp; payment status</li>
                <li>Withdrawal requests &amp; bank/UPI details</li>
                <li><strong>Not stored:</strong> card number, CVV, full bank details</li>
              </ul>
            </div>
            <div class="data-card">
              <div class="data-card-head"><i class="fas fa-chart-bar"></i> Usage Info</div>
              <ul>
                <li>Pages visited &amp; resources viewed</li>
                <li>Device, browser &amp; OS type</li>
                <li>IP address &amp; approximate location</li>
              </ul>
            </div>
          </div>
          <div class="info-box info-green" style="margin-top:14px"><i class="fas fa-shield-alt"></i> We never store your card number, CVV, or net banking credentials — all payment data is handled by Razorpay.</div>
        </div>

        <div class="content-box" id="p3">
          <div class="section-icon-wrap"><i class="fas fa-cogs"></i></div>
          <h2>3. How We Use Your Information</h2>
          <div class="use-list">
            <div class="use-item"><i class="fas fa-user-cog"></i><div><strong>Account management</strong><p>Create, maintain, and secure your account.</p></div></div>
            <div class="use-item"><i class="fas fa-credit-card"></i><div><strong>Payment processing</strong><p>Verify and record transactions made through Razorpay.</p></div></div>
            <div class="use-item"><i class="fas fa-wallet"></i><div><strong>Withdrawal processing</strong><p>Review, approve, and transfer your earnings to your bank or UPI.</p></div></div>
            <div class="use-item"><i class="fas fa-download"></i><div><strong>Resource delivery</strong><p>Give you access to resources you have purchased.</p></div></div>
            <div class="use-item"><i class="fas fa-chart-line"></i><div><strong>Platform improvement</strong><p>Understand how users interact with Earnify to improve the experience.</p></div></div>
            <div class="use-item"><i class="fas fa-shield-alt"></i><div><strong>Security &amp; fraud prevention</strong><p>Detect and prevent fraudulent activity around withdrawals and payments.</p></div></div>
            <div class="use-item"><i class="fas fa-bell"></i><div><strong>Communication</strong><p>Send transaction confirmations, withdrawal updates, and platform notices.</p></div></div>
            <div class="use-item"><i class="fas fa-balance-scale"></i><div><strong>Legal compliance</strong><p>Meet applicable legal and regulatory obligations.</p></div></div>
          </div>
          <div class="info-box info-warn" style="margin-top:14px"><i class="fas fa-ban"></i> We do <strong>not</strong> use your data for advertising, profiling, or selling to third parties.</div>
        </div>

        <div class="content-box" id="p4">
          <div class="section-icon-wrap"><i class="fas fa-lock"></i></div>
          <h2>4. Payment Data &amp; Razorpay</h2>
          <div class="highlight-strip"><i class="fas fa-lock"></i> All payments are processed through <strong>Razorpay</strong> — an RBI-regulated, PCI-DSS compliant payment gateway.</div>
          <ul class="benefits-list">
            <li><i class="fas fa-shield-alt"></i><span>Your card, UPI PIN, and net banking credentials are entered directly on Razorpay's secure interface — never on Earnify's servers.</span></li>
            <li><i class="fas fa-shield-alt"></i><span>Earnify only receives a payment confirmation (order ID, payment ID, status) after a transaction completes.</span></li>
            <li><i class="fas fa-shield-alt"></i><span>We store only the payment reference ID and status — not your financial credentials.</span></li>
            <li><i class="fas fa-external-link-alt"></i><span>Razorpay's privacy policy: <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener" style="color:#667eea;font-weight:600;">razorpay.com/privacy</a></span></li>
          </ul>
        </div>

        <div class="content-box" id="p5">
          <div class="section-icon-wrap"><i class="fas fa-wallet"></i></div>
          <h2>5. Withdrawal Data</h2>
          <p>When you submit a withdrawal request, we collect and store:</p>
          <ul class="benefits-list">
            <li><i class="fas fa-info-circle"></i><span>The withdrawal amount requested.</span></li>
            <li><i class="fas fa-info-circle"></i><span>Your bank account number or UPI ID (as provided by you).</span></li>
            <li><i class="fas fa-info-circle"></i><span>The payment method selected and any note you include.</span></li>
            <li><i class="fas fa-info-circle"></i><span>Request status (pending, approved, rejected) and rejection reason if applicable.</span></li>
          </ul>
          <div class="info-box info-blue"><i class="fas fa-user-lock"></i> This data is accessible only to the Earnify admin team and is never shared with any third party other than the payment processor used to transfer your funds.</div>
        </div>

        <div class="content-box" id="p6">
          <div class="section-icon-wrap"><i class="fas fa-server"></i></div>
          <h2>6. Data Storage &amp; Security</h2>
          <div class="highlight-strip"><i class="fas fa-database"></i> Your data is stored securely using <strong>Supabase</strong> — a trusted cloud database platform with enterprise-grade security.</div>
          <div class="security-grid">
            <div class="sec-card"><i class="fas fa-lock"></i><strong>HTTPS / TLS</strong><p>All data encrypted in transit.</p></div>
            <div class="sec-card"><i class="fas fa-key"></i><strong>Hashed Passwords</strong><p>Never stored in plain text.</p></div>
            <div class="sec-card"><i class="fas fa-table"></i><strong>Row Level Security</strong><p>Users access only their own data.</p></div>
            <div class="sec-card"><i class="fas fa-user-shield"></i><strong>Restricted Admin Access</strong><p>Sensitive data limited to authorised personnel.</p></div>
          </div>
          <div class="info-box info-warn"><i class="fas fa-exclamation-triangle"></i> No system is 100% immune to breaches. In the event of a data breach, we will notify you promptly.</div>
        </div>

        <div class="content-box" id="p7">
          <div class="section-icon-wrap"><i class="fas fa-share-alt"></i></div>
          <h2>7. Information Sharing</h2>
          <div class="info-box info-green"><i class="fas fa-ban"></i> <strong>We do not sell your personal data.</strong> We only share it in the following limited circumstances.</div>
          <div class="share-cards">
            <div class="share-card"><i class="fas fa-credit-card"></i><div><strong>Razorpay</strong><p>To process payments and verify transactions.</p></div></div>
            <div class="share-card"><i class="fas fa-database"></i><div><strong>Supabase</strong><p>Our database and authentication provider for account and transaction data.</p></div></div>
            <div class="share-card share-card--warn"><i class="fas fa-gavel"></i><div><strong>Legal Requirements</strong><p>If required by law, court order, or government authority.</p></div></div>
            <div class="share-card share-card--warn"><i class="fas fa-search"></i><div><strong>Fraud Prevention</strong><p>To investigate suspected fraud or abuse of the platform.</p></div></div>
          </div>
        </div>

        <div class="content-box" id="p8">
          <div class="section-icon-wrap"><i class="fas fa-cookie-bite"></i></div>
          <h2>8. Cookies</h2>
          <p>Earnify uses minimal cookies to keep you logged in and remember your session. We do <strong>not</strong> use advertising or third-party tracking cookies.</p>
          <div class="cookie-row">
            <div class="cookie-card"><i class="fas fa-clock"></i><strong>Session Cookies</strong><p>Keep you logged in during your visit.</p></div>
            <div class="cookie-card"><i class="fas fa-key"></i><strong>Auth Tokens</strong><p>Stored in localStorage to maintain login state across sessions.</p></div>
          </div>
          <div class="info-box info-blue" style="margin-top:14px"><i class="fas fa-info-circle"></i> You can clear cookies and localStorage anytime via browser settings. This will log you out of the platform.</div>
        </div>

        <div class="content-box" id="p9">
          <div class="section-icon-wrap"><i class="fas fa-user-check"></i></div>
          <h2>9. Your Privacy Rights</h2>
          <div class="rights-grid">
            <div class="right-card"><i class="fas fa-eye"></i><strong>Access</strong><p>Request a copy of the personal data we hold about you.</p></div>
            <div class="right-card"><i class="fas fa-edit"></i><strong>Correction</strong><p>Ask us to correct inaccurate or incomplete information.</p></div>
            <div class="right-card"><i class="fas fa-trash-alt"></i><strong>Deletion</strong><p>Request deletion of your account and associated data.</p></div>
            <div class="right-card"><i class="fas fa-history"></i><strong>Withdrawal History</strong><p>View all requests and statuses from your Dashboard anytime.</p></div>
            <div class="right-card"><i class="fas fa-bell-slash"></i><strong>Opt-out</strong><p>Unsubscribe from non-essential communications at any time.</p></div>
          </div>
          <div class="info-box info-blue" style="margin-top:14px"><i class="fas fa-envelope"></i> To exercise any right, email <a href="mailto:support@earnify.com" style="color:#667eea;font-weight:600;">support@earnify.com</a>. We respond within <strong>5 business days</strong>.</div>
        </div>

        <div class="content-box" id="p10">
          <div class="section-icon-wrap"><i class="fas fa-calendar-alt"></i></div>
          <h2>10. Data Retention</h2>
          <div class="retention-list">
            <div class="retention-item">
              <div class="retention-icon"><i class="fas fa-user"></i></div>
              <div><strong>Account Data</strong><p>Retained while your account is active. Deleted within 30 days of an account deletion request.</p></div>
            </div>
            <div class="retention-item">
              <div class="retention-icon"><i class="fas fa-receipt"></i></div>
              <div><strong>Transaction Records</strong><p>Retained for a minimum of <strong>3 years</strong> for financial and legal compliance.</p></div>
            </div>
            <div class="retention-item">
              <div class="retention-icon"><i class="fas fa-wallet"></i></div>
              <div><strong>Withdrawal Records</strong><p>Retained for a minimum of <strong>3 years</strong> for audit and dispute resolution.</p></div>
            </div>
          </div>
        </div>

        <div class="content-box" id="p11">
          <div class="section-icon-wrap"><i class="fas fa-child"></i></div>
          <h2>11. Children's Privacy</h2>
          <div class="info-box info-warn"><i class="fas fa-exclamation-triangle"></i> Earnify is <strong>not intended for users under 13</strong>. We do not knowingly collect data from children under 13.</div>
          <p>If you believe a child has created an account on our platform, please contact us immediately at <a href="mailto:support@earnify.com" style="color:#667eea;font-weight:600;">support@earnify.com</a> and we will delete the account promptly.</p>
        </div>

        <div class="content-box" id="p12">
          <div class="section-icon-wrap"><i class="fas fa-sync-alt"></i></div>
          <h2>12. Changes to This Policy</h2>
          <p>We may update this Privacy Policy to reflect changes in our practices or legal requirements. When we make significant changes, we will notify you via email or a prominent notice on the platform.</p>
          <div class="info-box info-blue"><i class="fas fa-info-circle"></i> The date of the last update is shown at the top of this page. Continued use of Earnify after changes are posted constitutes acceptance of the updated policy.</div>
        </div>

        <div class="content-box" id="p13">
          <div class="section-icon-wrap"><i class="fas fa-envelope-open-text"></i></div>
          <h2>13. Contact Us</h2>
          <p>For any questions, concerns, or requests regarding this Privacy Policy or how we handle your data:</p>
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

  // Active TOC on scroll
  const sections = document.querySelectorAll('.content-box[id]');
  const tocLinks = document.querySelectorAll('.toc-link');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.toc-link[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => observer.observe(s));
}
