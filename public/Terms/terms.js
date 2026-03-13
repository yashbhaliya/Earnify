// Shimmer loading for Terms page
document.addEventListener('DOMContentLoaded', function() {
  loadTermsContent();
});

function loadTermsContent() {
  showShimmer();
  setTimeout(() => {
    loadActualContent();
  }, 1500);
}

function showShimmer() {
  const container = document.getElementById('termsContainer');
  let shimmerHTML = '';
  
  for (let i = 0; i < 11; i++) {
    shimmerHTML += `
      <div class="content-box">
        <div class="shimmer-box">
          <div class="shimmer-title"></div>
          <div class="shimmer-text"></div>
          <div class="shimmer-text"></div>
          <div class="shimmer-text short"></div>
        </div>
      </div>
    `;
  }
  
  container.innerHTML = shimmerHTML;
}

function loadActualContent() {
  const container = document.getElementById('termsContainer');
  container.innerHTML = `
    <div class="content-box">
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using Earnify, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.</p>
    </div>

    <div class="content-box">
      <h2>2. Use of Services</h2>
      <p><strong>2.1 Eligibility:</strong> You must be at least 13 years old to use our services. Users under 18 should have parental consent.</p>
      <p><strong>2.2 Account Registration:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
      <p><strong>2.3 Prohibited Activities:</strong> You may not use our platform to engage in illegal activities, distribute malware, or violate intellectual property rights.</p>
    </div>

    <div class="content-box">
      <h2>3. Purchases and Payments</h2>
      <p><strong>3.1 Pricing:</strong> All prices are displayed in the local currency and are subject to change without notice.</p>
      <p><strong>3.2 Payment Processing:</strong> Payments are processed securely through our payment partners. We do not store your payment card information.</p>
      <p><strong>3.3 Refund Policy:</strong> Digital products are generally non-refundable once accessed. Refunds may be considered on a case-by-case basis for defective or misrepresented products.</p>
    </div>

    <div class="content-box">
      <h2>4. Intellectual Property</h2>
      <p><strong>4.1 Content Ownership:</strong> All resources purchased are for personal use only. Redistribution, resale, or sharing of purchased materials is strictly prohibited.</p>
      <p><strong>4.2 Platform Content:</strong> The Earnify platform, including its design, logo, and features, is protected by copyright and trademark laws.</p>
      <p><strong>4.3 User Content:</strong> Content creators retain ownership of their materials but grant Earnify a license to display and distribute them on the platform.</p>
    </div>

    <div class="content-box">
      <h2>5. User Responsibilities</h2>
      <p>Users are responsible for:</p>
      <ul class="benefits-list">
        <li><i class="fas fa-check-circle"></i> Providing accurate account information</li>
        <li><i class="fas fa-check-circle"></i> Maintaining account security</li>
        <li><i class="fas fa-check-circle"></i> Using purchased materials ethically and legally</li>
        <li><i class="fas fa-check-circle"></i> Respecting intellectual property rights</li>
        <li><i class="fas fa-check-circle"></i> Complying with all applicable laws</li>
      </ul>
    </div>

    <div class="content-box">
      <h2>6. Limitation of Liability</h2>
      <p>Earnify is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you paid for the specific resource in question.</p>
    </div>

    <div class="content-box">
      <h2>7. Content Accuracy</h2>
      <p>While we strive to ensure the quality of resources on our platform, we do not guarantee the accuracy, completeness, or usefulness of any content. Users should verify information independently.</p>
    </div>

    <div class="content-box">
      <h2>8. Termination</h2>
      <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities. Upon termination, your right to access purchased materials may be revoked.</p>
    </div>

    <div class="content-box">
      <h2>9. Changes to Terms</h2>
      <p>We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notifications.</p>
    </div>

    <div class="content-box">
      <h2>10. Governing Law</h2>
      <p>These terms are governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration or in the courts of our jurisdiction.</p>
    </div>

    <div class="content-box">
      <h2>11. Contact Information</h2>
      <p>For questions about these terms, please contact us at:</p>
      <p>📧 Email: support@earnify.com</p>
      <p>📞 Phone: +11 60464 53263</p>
    </div>
  `;
}
