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
  let shimmerHTML = '';
  for (let i = 0; i < 13; i++) {
    shimmerHTML += `
      <div class="content-box">
        <div class="shimmer-box">
          <div class="shimmer-title"></div>
          <div class="shimmer-text"></div>
          <div class="shimmer-text"></div>
          <div class="shimmer-text short"></div>
        </div>
      </div>`;
  }
  container.innerHTML = shimmerHTML;
}

function loadActualContent() {
  const container = document.getElementById('termsContainer');
  container.innerHTML = `
    <div class="content-box">
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using Earnify, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services. These terms apply to all users — buyers, sellers, and visitors.</p>
    </div>

    <div class="content-box">
      <h2>2. Use of Services</h2>
      <p><strong>2.1 Eligibility:</strong> You must be at least 13 years old to use Earnify. Users under 18 must have parental or guardian consent.</p>
      <p><strong>2.2 Account Registration:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
      <p><strong>2.3 Prohibited Activities:</strong> You may not use our platform to engage in illegal activities, distribute malware, violate intellectual property rights, or misrepresent your resources.</p>
    </div>

    <div class="content-box">
      <h2>3. Payment System</h2>
      <p><strong>3.1 Payment Gateway:</strong> All payments on Earnify are processed securely through <strong>Razorpay</strong>, an RBI-regulated payment gateway. We do not store your card, UPI, or bank account details on our servers at any time.</p>
      <p><strong>3.2 Supported Methods:</strong> We accept all major credit cards, debit cards, UPI, net banking, and digital wallets supported by Razorpay.</p>
      <p><strong>3.3 Pricing:</strong> All prices are displayed in Indian Rupees (₹) and are set by the resource creator. Prices may change without prior notice.</p>
      <p><strong>3.4 Instant Access:</strong> Upon successful payment, buyers receive immediate access to the purchased resource. A payment confirmation is recorded in your Dashboard.</p>
      <p><strong>3.5 Failed Payments:</strong> If a payment fails after being deducted from your account, please contact us at support@earnify.com with your transaction details. We will investigate and resolve within 5–7 business days.</p>
    </div>

    <div class="content-box">
      <h2>4. Seller Earnings &amp; Commission</h2>
      <p><strong>4.1 How Earnings Work:</strong> When a buyer purchases your resource, the full sale amount is credited to your available balance on the Earnify platform. You can track all earnings in real time from your Dashboard.</p>
      <p><strong>4.2 Platform Commission:</strong> Earnify charges a flat <strong>5% platform fee</strong> on each withdrawal request — not on each sale. This fee covers payment processing costs, platform infrastructure, and ongoing support.</p>
      <p><strong>4.3 Fee Example:</strong> If you request a withdrawal of ₹2,000, the platform fee is ₹100 (5%), and you receive ₹1,900 net. The fee is always calculated on the withdrawal amount, not the sale price.</p>
      <p><strong>4.4 No Listing Fees:</strong> There are no fees to list a resource on Earnify. You only pay the 5% fee when you withdraw your earnings. There are no monthly charges or hidden deductions.</p>
      <p><strong>4.5 Dashboard Breakdown:</strong> Your Dashboard clearly shows: Total Revenue (gross sales), Available Balance (ready to withdraw), Withdrawn Amount (net after 5% fee), Platform Fees collected, and Pending withdrawal requests.</p>
    </div>

    <div class="content-box">
      <h2>5. Withdrawal Policy</h2>
      <p><strong>5.1 Requesting a Withdrawal:</strong> Sellers can submit a withdrawal request at any time from the Withdrawal page. You must provide valid bank account or UPI details and specify the amount you wish to withdraw.</p>
      <p><strong>5.2 Minimum Withdrawal:</strong> There is no minimum withdrawal amount. You may withdraw any amount from your available balance.</p>
      <p><strong>5.3 Admin Review:</strong> All withdrawal requests are reviewed by the Earnify admin team before processing. This review ensures the accuracy of account details and prevents fraudulent activity.</p>
      <p><strong>5.4 Approval:</strong> Approved withdrawals are processed and transferred to your provided bank or UPI account. Processing time may vary depending on your bank.</p>
      <p><strong>5.5 Rejection:</strong> If a withdrawal request is rejected, you will receive a clear reason. Common reasons include incorrect account details, insufficient balance, or suspected fraudulent activity. You may resubmit after correcting the issue.</p>
      <p><strong>5.6 Fee Deduction:</strong> The 5% platform fee is deducted at the time of withdrawal approval. The net amount (withdrawal amount minus 5%) is transferred to your account.</p>
    </div>

    <div class="content-box">
      <h2>6. Refund Policy</h2>
      <p><strong>6.1 Digital Products:</strong> Due to the instant-access nature of digital resources, all sales are generally final and non-refundable once the resource has been accessed or downloaded.</p>
      <p><strong>6.2 Exceptions:</strong> Refunds may be considered on a case-by-case basis in the following situations: the resource is significantly different from its description, the file is corrupted or inaccessible, or a duplicate purchase was made accidentally.</p>
      <p><strong>6.3 Refund Requests:</strong> To request a refund, contact us at support@earnify.com within 48 hours of purchase with your order details and reason. We will review and respond within 5 business days.</p>
      <p><strong>6.4 Approved Refunds:</strong> Approved refunds are returned to the original payment method. Razorpay processing fees may not be refundable depending on the payment method used.</p>
    </div>

    <div class="content-box">
      <h2>7. Intellectual Property</h2>
      <p><strong>7.1 Buyer License:</strong> All resources purchased on Earnify are licensed for personal use only. Redistribution, resale, sharing, or republishing of purchased materials is strictly prohibited.</p>
      <p><strong>7.2 Seller Ownership:</strong> Sellers retain full ownership of their resources. By listing on Earnify, sellers grant us a non-exclusive license to display, market, and distribute their resources on the platform.</p>
      <p><strong>7.3 Platform Content:</strong> The Earnify platform, including its design, logo, code, and features, is protected by copyright and trademark laws. Unauthorized use is prohibited.</p>
    </div>

    <div class="content-box">
      <h2>8. Seller Responsibilities</h2>
      <ul class="benefits-list">
        <li><i class="fas fa-check-circle"></i> Ensure all listed resources are accurate, original, and not plagiarised</li>
        <li><i class="fas fa-check-circle"></i> Provide correct bank or UPI details when submitting withdrawal requests</li>
        <li><i class="fas fa-check-circle"></i> Not list resources that violate copyright, contain harmful content, or misrepresent their value</li>
        <li><i class="fas fa-check-circle"></i> Maintain the quality of resources and update them if content becomes outdated</li>
        <li><i class="fas fa-check-circle"></i> Comply with all applicable tax laws regarding income earned through the platform</li>
      </ul>
    </div>

    <div class="content-box">
      <h2>9. Limitation of Liability</h2>
      <p>Earnify is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you paid for the specific resource in question. We are not responsible for losses arising from incorrect bank details provided during withdrawal requests.</p>
    </div>

    <div class="content-box">
      <h2>10. Account Termination</h2>
      <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or abuse the withdrawal system. Upon termination, pending withdrawal requests may be cancelled and access to purchased resources may be revoked. Any outstanding balance will be reviewed on a case-by-case basis.</p>
    </div>

    <div class="content-box">
      <h2>11. Privacy &amp; Data Security</h2>
      <p>We take your privacy seriously. Payment data is handled exclusively by Razorpay and is never stored on Earnify servers. Your personal information is used only to operate the platform and process transactions. Please review our <a href="../Privacy/" style="color:#667eea;font-weight:600;">Privacy Policy</a> for full details on how we collect, use, and protect your data.</p>
    </div>

    <div class="content-box">
      <h2>12. Changes to Terms</h2>
      <p>We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the updated terms. We will notify users of significant changes via email or platform notifications. The date of the last update is shown at the top of this page.</p>
    </div>

    <div class="content-box">
      <h2>13. Contact Information</h2>
      <p>For questions about these terms, withdrawal issues, payment disputes, or any other concerns, please contact us:</p>
      <p>📧 Email: <a href="mailto:support@earnify.com" style="color:#667eea;">support@earnify.com</a></p>
      <p>We aim to respond to all queries within 2 business days.</p>
    </div>
  `;
}
