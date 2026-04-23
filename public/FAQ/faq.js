document.addEventListener('DOMContentLoaded', function () {
  loadFaqContent();
});

function loadFaqContent() {
  showShimmer();
  setTimeout(() => { loadActualContent(); }, 1200);
}

function showShimmer() {
  const container = document.getElementById('faqContainer');
  const isDark = document.documentElement.classList.contains('dark-mode') || document.body.classList.contains('dark-mode');
  const shimmerBg = isDark ? 'background:linear-gradient(90deg,#1c2333 25%,#252f42 50%,#1c2333 75%);background-size:400px 100%;animation:shimmerMove 1.8s infinite linear;' : '';
  const boxBg = isDark ? 'background:#161b22;border-bottom:1px solid #30363d;' : '';
  const shimmer = `<div class="shimmer-box"><div class="shimmer-title" style="${shimmerBg}"></div><div class="shimmer-list"><div class="shimmer-list-item" style="${shimmerBg}"></div><div class="shimmer-list-item" style="${shimmerBg}"></div><div class="shimmer-list-item" style="${shimmerBg}"></div><div class="shimmer-list-item" style="${shimmerBg}"></div></div></div>`;
  let html = '';
  for (let i = 0; i < 5; i++) html += `<div class="content-box" style="${boxBg}">${shimmer}</div>`;
  container.innerHTML = html;
}

function loadActualContent() {
  const container = document.getElementById('faqContainer');

  container.innerHTML = `

    <!-- Quick Nav -->
    <div class="content-box">
      <div class="faq-intro">
        <p>Browse by category or use <strong>Ctrl+F</strong> to search. Can't find your answer? <a href="../Contact/" style="color:#667eea;font-weight:700;">Contact us</a> — we respond within 2 hours.</p>
      </div>
      <div class="faq-cat-nav">
        <a href="#cat-general"  class="faq-cat-btn"><i class="fas fa-info-circle"></i> General</a>
        <a href="#cat-buying"   class="faq-cat-btn"><i class="fas fa-shopping-cart"></i> Buying</a>
        <a href="#cat-selling"  class="faq-cat-btn"><i class="fas fa-store"></i> Selling</a>
        <a href="#cat-payments" class="faq-cat-btn"><i class="fas fa-credit-card"></i> Payments</a>
        <a href="#cat-withdraw" class="faq-cat-btn"><i class="fas fa-wallet"></i> Withdrawals</a>
        <a href="#cat-account"  class="faq-cat-btn"><i class="fas fa-user-circle"></i> Account</a>
      </div>
    </div>

    <!-- General -->
    <div class="content-box" id="cat-general">
      <div class="faq-cat-head"><i class="fas fa-info-circle"></i><h2>General</h2></div>
      <div class="faq-list">
        ${faqItems([
          { q: 'What is Earnify?', a: 'Earnify is an Indian digital marketplace where knowledge creators can sell study notes, Excel templates, exam materials, and freelance services — and buyers can find and purchase them instantly.' },
          { q: 'Is Earnify free to use?', a: 'Yes. Creating an account and browsing resources is completely free. Sellers pay no listing fee. A flat 5% platform fee is only charged when you withdraw your earnings.' },
          { q: 'Who can use Earnify?', a: 'Anyone aged 13 or above. Students, working professionals, educators, and freelancers are all welcome. Users under 18 require parental or guardian consent.' },
          { q: 'Is Earnify safe and secure?', a: 'Yes. Payments are processed by Razorpay (RBI-regulated, PCI-DSS compliant). Account data is stored securely via Supabase with encryption and Row Level Security. We never store your card or bank details.' },
        ])}
      </div>
    </div>

    <!-- Buying -->
    <div class="content-box" id="cat-buying">
      <div class="faq-cat-head"><i class="fas fa-shopping-cart"></i><h2>Buying</h2></div>
      <div class="faq-list">
        ${faqItems([
          { q: 'How do I purchase a resource?', a: 'Browse the marketplace, click on a resource, and click "Buy Now". You will be redirected to Razorpay\'s secure checkout. After payment, you get instant access from your Dashboard.' },
          { q: 'How do I access my purchased resources?', a: 'Go to your Dashboard after login. All purchased resources appear under "My Purchases" and are available for immediate download.' },
          { q: 'What payment methods are accepted?', a: 'All major credit/debit cards, UPI, net banking, and digital wallets supported by Razorpay.' },
          { q: 'Can I get a refund?', a: 'All digital sales are generally final once accessed. Refunds are considered if the resource is corrupted, inaccessible, or significantly different from its description. Email support@earnify.com within 48 hours of purchase.' },
          { q: 'What if my payment failed but money was deducted?', a: 'Contact support@earnify.com with your transaction ID and bank reference. We will investigate and resolve within 5–7 business days.' },
          { q: 'Can I re-download a resource I already purchased?', a: 'Yes. Your purchased resources remain accessible in your Dashboard as long as your account is active.' },
        ])}
      </div>
    </div>

    <!-- Selling -->
    <div class="content-box" id="cat-selling">
      <div class="faq-cat-head"><i class="fas fa-store"></i><h2>Selling</h2></div>
      <div class="faq-list">
        ${faqItems([
          { q: 'How do I start selling on Earnify?', a: 'Sign up for a free account, go to "Add Resources" in your Dashboard, upload your file, write a description, set your price, and submit for review. Once approved, it goes live on the marketplace.' },
          { q: 'What types of resources can I sell?', a: 'PDF notes, study guides, Excel templates, exam preparation materials, question banks, and freelance services. All resources are reviewed before going live.' },
          { q: 'Is there a listing fee?', a: 'No. Listing resources on Earnify is completely free. You only pay the 5% platform fee when you withdraw your earnings.' },
          { q: 'How is my earnings calculated?', a: 'When a buyer purchases your resource, the full sale amount is credited to your available balance. The 5% fee is only deducted when you request a withdrawal — not on each sale.' },
          { q: 'Can I set my own price?', a: 'Yes. You set the price for your resource in Indian Rupees (₹). Prices can be updated at any time from your Dashboard.' },
          { q: 'What happens if my resource is rejected?', a: 'You will receive a reason for rejection. Common reasons include copyright issues, low quality, or misleading descriptions. You can fix the issue and resubmit.' },
        ])}
      </div>
    </div>

    <!-- Payments -->
    <div class="content-box" id="cat-payments">
      <div class="faq-cat-head"><i class="fas fa-credit-card"></i><h2>Payments</h2></div>
      <div class="faq-list">
        ${faqItems([
          { q: 'How are payments processed?', a: 'All payments are processed through Razorpay — an RBI-regulated, PCI-DSS compliant payment gateway. Your card, UPI PIN, and banking credentials are entered directly on Razorpay\'s secure interface, never on Earnify\'s servers.' },
          { q: 'Does Earnify store my card or bank details?', a: 'No. We never store your card number, CVV, UPI PIN, or net banking credentials. Earnify only receives a payment confirmation (order ID, payment ID, status) from Razorpay.' },
          { q: 'Are prices in Indian Rupees?', a: 'Yes. All prices on Earnify are displayed and charged in Indian Rupees (₹).' },
          { q: 'Is there a transaction fee for buyers?', a: 'No additional fee is charged to buyers beyond the listed price of the resource.' },
        ])}
      </div>
    </div>

    <!-- Withdrawals -->
    <div class="content-box" id="cat-withdraw">
      <div class="faq-cat-head"><i class="fas fa-wallet"></i><h2>Withdrawals</h2></div>
      <div class="faq-list">
        ${faqItems([
          { q: 'How do I withdraw my earnings?', a: 'Go to the Withdrawal page in your Dashboard, enter your bank account or UPI details, specify the amount, and submit. Our team reviews and processes the request.' },
          { q: 'What is the platform fee?', a: 'Earnify charges a flat 5% fee on each withdrawal request. Example: Withdraw ₹2,000 → Fee ₹100 → You receive ₹1,900. The fee is on the withdrawal amount, not on each sale.' },
          { q: 'Is there a minimum withdrawal amount?', a: 'No. You can withdraw any amount from your available balance.' },
          { q: 'How long does a withdrawal take?', a: 'Withdrawal requests are reviewed within 1–2 business days. After approval, transfer time depends on your bank — typically 1–3 business days.' },
          { q: 'Why was my withdrawal rejected?', a: 'Common reasons: incorrect bank/UPI details, insufficient balance, or suspected fraudulent activity. You will receive a reason and can resubmit after correcting the issue.' },
          { q: 'Can I see my withdrawal history?', a: 'Yes. Your Dashboard shows all withdrawal requests with their status (pending, approved, rejected), amounts, and dates.' },
        ])}
      </div>
    </div>

    <!-- Account -->
    <div class="content-box" id="cat-account">
      <div class="faq-cat-head"><i class="fas fa-user-circle"></i><h2>Account</h2></div>
      <div class="faq-list">
        ${faqItems([
          { q: 'How do I create an account?', a: 'Click "Sign Up" on the homepage, enter your name, email, and password. Your account is created instantly — no email verification delay.' },
          { q: 'I forgot my password. What do I do?', a: 'Click "Forgot Password" on the login screen and enter your email. You will receive a password reset link within a few minutes.' },
          { q: 'Can I delete my account?', a: 'Yes. Email support@earnify.com with your account deletion request. Your account and associated data will be deleted within 30 days. Transaction records are retained for 3 years for legal compliance.' },
          { q: 'How do I update my profile or bank details?', a: 'Go to your Profile page from the Dashboard. You can update your name, email, and payment details at any time.' },
          { q: 'Can my account be suspended?', a: 'Yes. Accounts that violate our Terms of Service, engage in fraudulent activity, or abuse the withdrawal system may be suspended or permanently terminated.' },
        ])}
      </div>
    </div>

    <!-- CTA -->
    <div id="faqCta"></div>
  `;

  document.getElementById('faqCta').innerHTML = `
    <div class="about-cta">
      <div class="about-cta-content">
        <h2>Still Have Questions?</h2>
        <p>Our support team is available Monday–Friday, 9 AM–6 PM. We typically respond within 2 hours.</p>
        <div class="about-cta-btns">
          <a href="../Contact/" class="about-btn-primary">Contact Support →</a>
          <a href="../" class="about-btn-secondary">Browse Resources</a>
        </div>
      </div>
    </div>
    <div class="contact-us-strip">
      <div class="contact-us-strip-inner">
        <div class="contact-us-left">
          <div class="contact-us-icon"><i class="fas fa-headset"></i></div>
          <div>
            <h3>Can't find your answer?</h3>
            <p>Our support team is available Mon–Fri, 9 AM–6 PM. We respond within 2 hours.</p>
          </div>
        </div>
        <a href="../Contact/" class="contact-us-btn"><i class="fas fa-envelope"></i> Contact Us</a>
      </div>
    </div>
  `;

  // Accordion toggle
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', function () {
      const isOpen = this.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(f => f.classList.remove('open'));
      if (!isOpen) this.classList.add('open');
    });
  });

  // Mobile category dropdown
  const catNav = document.querySelector('.faq-cat-nav');
  if (catNav) {
    const cats = [
      { label: 'General',     icon: 'fa-info-circle',   value: '#cat-general' },
      { label: 'Buying',      icon: 'fa-shopping-cart', value: '#cat-buying' },
      { label: 'Selling',     icon: 'fa-store',         value: '#cat-selling' },
      { label: 'Payments',    icon: 'fa-credit-card',   value: '#cat-payments' },
      { label: 'Withdrawals', icon: 'fa-wallet',        value: '#cat-withdraw' },
      { label: 'Account',     icon: 'fa-user-circle',   value: '#cat-account' },
    ];
    const wrapper = document.createElement('div');
    wrapper.className = 'faq-cat-dropdown';
    wrapper.innerHTML = `
      <div class="faq-dd-trigger">
        <span class="faq-dd-label"><i class="fas fa-th-list"></i> Browse Categories</span>
        <i class="fas fa-chevron-down faq-dd-arrow"></i>
      </div>
      <ul class="faq-dd-list">
        ${cats.map(c => `<li class="faq-dd-item" data-target="${c.value}"><i class="fas ${c.icon}"></i> ${c.label}</li>`).join('')}
      </ul>`;
    catNav.appendChild(wrapper);

    const trigger = wrapper.querySelector('.faq-dd-trigger');
    const list    = wrapper.querySelector('.faq-dd-list');
    const arrow   = wrapper.querySelector('.faq-dd-arrow');

    trigger.addEventListener('click', () => {
      const open = list.classList.toggle('open');
      arrow.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
    });
    wrapper.querySelectorAll('.faq-dd-item').forEach(item => {
      item.addEventListener('click', () => {
        const target = document.querySelector(item.dataset.target);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        list.classList.remove('open');
        arrow.style.transform = 'rotate(0deg)';
      });
    });
    document.addEventListener('click', e => {
      if (!wrapper.contains(e.target)) {
        list.classList.remove('open');
        arrow.style.transform = 'rotate(0deg)';
      }
    });
  }
}

function faqItems(items) {
  return items.map(f => `
    <div class="faq-item">
      <div class="faq-q"><span>${f.q}</span><i class="fas fa-chevron-down faq-icon"></i></div>
      <div class="faq-a">${f.a}</div>
    </div>`).join('');
}
