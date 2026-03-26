// Shimmer loading for Privacy page
document.addEventListener('DOMContentLoaded', function() {
  loadPrivacyContent();
});

function loadPrivacyContent() {
  showShimmer();
  setTimeout(() => { loadActualContent(); }, 1500);
}

function showShimmer() {
  const container = document.getElementById('privacyContainer');
  let shimmerHTML = '';
  for (let i = 0; i < 13; i++) {
    shimmerHTML += `
      <div class="content-box">
        <div class="shimmer-box">
          <div class="shimmer-title"></div>
          <div class="shimmer-text"></div>
          <div class="shimmer-text"></div>
          <div class="shimmer-text short"></div>
          <div class="shimmer-list">
            <div class="shimmer-list-item"></div>
            <div class="shimmer-list-item"></div>
            <div class="shimmer-list-item"></div>
          </div>
        </div>
      </div>`;
  }
  container.innerHTML = shimmerHTML;
}

function loadActualContent() {
  const container = document.getElementById('privacyContainer');
  container.innerHTML = `
    <div class="content-box">
      <h2>1. Introduction</h2>
      <p>At Earnify, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains what data we collect, how we use it, who we share it with, and what rights you have over your information.</p>
      <p>By using Earnify, you agree to the collection and use of information as described in this policy. If you do not agree, please do not use our platform.</p>
    </div>

    <div class="content-box">
      <h2>2. Information We Collect</h2>
      <p><strong>2.1 Account Information:</strong></p>
      <ul class="benefits-list">
        <li><i class="fas fa-info-circle"></i> Name and email address provided during registration</li>
        <li><i class="fas fa-info-circle"></i> Password (stored securely in encrypted form via Supabase Auth — never in plain text)</li>
        <li><i class="fas fa-info-circle"></i> Profile details you choose to add</li>
      </ul>
      <p><strong>2.2 Transaction &amp; Financial Information:</strong></p>
      <ul class="benefits-list">
        <li><i class="fas fa-info-circle"></i> Purchase history — which resources you bought and when</li>
        <li><i class="fas fa-info-circle"></i> Payment status (completed, pending, failed) — stored in our database</li>
        <li><i class="fas fa-info-circle"></i> Withdrawal requests — amount, bank/UPI details you provide, and status</li>
        <li><i class="fas fa-info-circle"></i> <strong>We do not store your card number, CVV, or full bank account details.</strong> All payment processing is handled by Razorpay, an RBI-regulated payment gateway.</li>
      </ul>
      <p><strong>2.3 Usage Information:</strong></p>
      <ul class="benefits-list">
        <li><i class="fas fa-info-circle"></i> Pages visited and resources viewed on the platform</li>
        <li><i class="fas fa-info-circle"></i> Device type, browser, and operating system</li>
        <li><i class="fas fa-info-circle"></i> IP address and approximate location</li>
        <li><i class="fas fa-info-circle"></i> Session activity and interaction logs</li>
      </ul>
    </div>

    <div class="content-box">
      <h2>3. How We Use Your Information</h2>
      <p>We use your information only for the following purposes:</p>
      <ul class="benefits-list">
        <li><i class="fas fa-check-circle"></i> <strong>Account management</strong> — to create, maintain, and secure your account</li>
        <li><i class="fas fa-check-circle"></i> <strong>Payment processing</strong> — to verify and record transactions made through Razorpay</li>
        <li><i class="fas fa-check-circle"></i> <strong>Withdrawal processing</strong> — to review and approve your withdrawal requests and transfer earnings to your bank or UPI account</li>
        <li><i class="fas fa-check-circle"></i> <strong>Resource delivery</strong> — to give you access to resources you have purchased</li>
        <li><i class="fas fa-check-circle"></i> <strong>Platform improvement</strong> — to understand how users interact with Earnify and improve the experience</li>
        <li><i class="fas fa-check-circle"></i> <strong>Security &amp; fraud prevention</strong> — to detect and prevent fraudulent activity, especially around withdrawals and payments</li>
        <li><i class="fas fa-check-circle"></i> <strong>Communication</strong> — to send transaction confirmations, withdrawal status updates, and important platform notices</li>
        <li><i class="fas fa-check-circle"></i> <strong>Legal compliance</strong> — to meet applicable legal and regulatory obligations</li>
      </ul>
      <p>We do <strong>not</strong> use your data for advertising, profiling, or selling to third parties.</p>
    </div>

    <div class="content-box">
      <h2>4. Payment Data &amp; Razorpay</h2>
      <p>All payments on Earnify are processed through <strong>Razorpay</strong>, an RBI-regulated and PCI-DSS compliant payment gateway.</p>
      <ul class="benefits-list">
        <li><i class="fas fa-shield-alt"></i> Your card number, CVV, UPI PIN, and net banking credentials are entered directly on Razorpay's secure interface — never on Earnify's servers</li>
        <li><i class="fas fa-shield-alt"></i> Earnify only receives a payment confirmation (order ID, payment ID, and status) from Razorpay after a transaction is completed</li>
        <li><i class="fas fa-shield-alt"></i> We store only the payment reference ID and status in our database — not your financial credentials</li>
        <li><i class="fas fa-shield-alt"></i> Razorpay's privacy policy governs how they handle your payment data: <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener" style="color:#667eea;">razorpay.com/privacy</a></li>
      </ul>
    </div>

    <div class="content-box">
      <h2>5. Withdrawal Data</h2>
      <p>When you submit a withdrawal request, we collect and store:</p>
      <ul class="benefits-list">
        <li><i class="fas fa-info-circle"></i> The withdrawal amount requested</li>
        <li><i class="fas fa-info-circle"></i> Your bank account number or UPI ID (as provided by you)</li>
        <li><i class="fas fa-info-circle"></i> The payment method you selected</li>
        <li><i class="fas fa-info-circle"></i> Any note you include with the request</li>
        <li><i class="fas fa-info-circle"></i> The status of the request (pending, approved, rejected) and the reason if rejected</li>
      </ul>
      <p>This information is used solely to process your withdrawal and is accessible only to the Earnify admin team. We do not share your bank or UPI details with any third party other than the payment processor used to transfer your funds.</p>
    </div>

    <div class="content-box">
      <h2>6. Data Storage &amp; Security</h2>
      <p>Your data is stored securely using <strong>Supabase</strong>, a trusted cloud database platform with enterprise-grade security.</p>
      <ul class="benefits-list">
        <li><i class="fas fa-shield-alt"></i> All data is encrypted in transit using HTTPS/TLS</li>
        <li><i class="fas fa-shield-alt"></i> Passwords are hashed and never stored in plain text</li>
        <li><i class="fas fa-shield-alt"></i> Database access is restricted using Row Level Security (RLS) — users can only access their own data</li>
        <li><i class="fas fa-shield-alt"></i> Admin access to sensitive data (withdrawals, payments) is restricted to authorised personnel only</li>
        <li><i class="fas fa-shield-alt"></i> Regular security reviews are conducted to identify and address vulnerabilities</li>
      </ul>
      <p>While we implement strong security measures, no system is 100% immune to breaches. In the event of a data breach affecting your information, we will notify you promptly.</p>
    </div>

    <div class="content-box">
      <h2>7. Information Sharing</h2>
      <p><strong>We do not sell your personal data.</strong> We only share your information in the following limited circumstances:</p>
      <ul class="benefits-list">
        <li><i class="fas fa-check-circle"></i> <strong>Razorpay</strong> — to process payments and verify transactions</li>
        <li><i class="fas fa-check-circle"></i> <strong>Supabase</strong> — our database and authentication provider that stores your account and transaction data</li>
        <li><i class="fas fa-check-circle"></i> <strong>Legal requirements</strong> — if required by law, court order, or government authority</li>
        <li><i class="fas fa-check-circle"></i> <strong>Fraud prevention</strong> — to investigate suspected fraud or abuse of the platform</li>
      </ul>
      <p>We do not share your data with advertisers, data brokers, or any unrelated third parties.</p>
    </div>

    <div class="content-box">
      <h2>8. Cookies</h2>
      <p>Earnify uses minimal cookies to keep you logged in and remember your session. We do not use advertising cookies or third-party tracking cookies.</p>
      <ul class="benefits-list">
        <li><i class="fas fa-cookie"></i> <strong>Session cookies</strong> — to keep you logged in during your visit</li>
        <li><i class="fas fa-cookie"></i> <strong>Authentication tokens</strong> — stored in localStorage to maintain your login state across sessions</li>
      </ul>
      <p>You can clear cookies and localStorage at any time through your browser settings. This will log you out of the platform.</p>
    </div>

    <div class="content-box">
      <h2>9. Your Privacy Rights</h2>
      <p>You have the following rights over your personal data:</p>
      <ul class="benefits-list">
        <li><i class="fas fa-user-check"></i> <strong>Access</strong> — request a copy of the personal data we hold about you</li>
        <li><i class="fas fa-user-check"></i> <strong>Correction</strong> — ask us to correct inaccurate or incomplete information</li>
        <li><i class="fas fa-user-check"></i> <strong>Deletion</strong> — request deletion of your account and associated data (subject to legal retention requirements)</li>
        <li><i class="fas fa-user-check"></i> <strong>Withdrawal history</strong> — view all your withdrawal requests and their statuses from your Dashboard at any time</li>
        <li><i class="fas fa-user-check"></i> <strong>Opt-out</strong> — unsubscribe from non-essential communications at any time</li>
      </ul>
      <p>To exercise any of these rights, email us at <a href="mailto:support@earnify.com" style="color:#667eea;">support@earnify.com</a>. We will respond within 5 business days.</p>
    </div>

    <div class="content-box">
      <h2>10. Data Retention</h2>
      <p>We retain your data for as long as your account is active or as needed to provide our services:</p>
      <ul class="benefits-list">
        <li><i class="fas fa-info-circle"></i> <strong>Account data</strong> — retained while your account is active. Deleted within 30 days of an account deletion request.</li>
        <li><i class="fas fa-info-circle"></i> <strong>Transaction records</strong> — retained for a minimum of 3 years for financial and legal compliance purposes</li>
        <li><i class="fas fa-info-circle"></i> <strong>Withdrawal records</strong> — retained for a minimum of 3 years for audit and dispute resolution purposes</li>
      </ul>
    </div>

    <div class="content-box">
      <h2>11. Children's Privacy</h2>
      <p>Earnify is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has created an account on our platform, please contact us immediately at <a href="mailto:support@earnify.com" style="color:#667eea;">support@earnify.com</a> and we will delete the account promptly.</p>
    </div>

    <div class="content-box">
      <h2>12. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we make significant changes, we will notify you via email or a prominent notice on the platform. The date of the last update is shown at the top of this page. Your continued use of Earnify after changes are posted constitutes your acceptance of the updated policy.</p>
    </div>

    <div class="content-box">
      <h2>13. Contact Us</h2>
      <p>If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us:</p>
      <p>📧 Email: <a href="mailto:support@earnify.com" style="color:#667eea;">support@earnify.com</a></p>
      <p>We aim to respond to all privacy-related queries within 2 business days.</p>
    </div>
  `;
}
