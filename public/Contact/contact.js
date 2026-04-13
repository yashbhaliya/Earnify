document.addEventListener('DOMContentLoaded', function () {
  loadContactContent();
});

function loadContactContent() {
  showShimmer();
  setTimeout(() => { loadActualContent(); }, 1200);
}

function showShimmer() {
  const container = document.getElementById('contactContainer');

  const infoCards = Array(4).fill(
    `<div class="shimmer-info-card"></div>`
  ).join('');

  const formFields = Array(3).fill(
    `<div class="shimmer-form-field"></div>`
  ).join('');

  const faqCards = Array(4).fill(
    `<div class="shimmer-faq-card"></div>`
  ).join('');

  container.innerHTML = `
    <div class="contact-page">
      <div class="shimmer-left-panel">
        <div class="shimmer-title" style="width:55%"></div>
        <div class="shimmer-text short"></div>
        ${infoCards}
      </div>
      <div class="shimmer-right-panel">
        <div class="shimmer-title" style="width:45%"></div>
        <div class="shimmer-text short"></div>
        ${formFields}
        <div class="shimmer-form-field large"></div>
        <div class="shimmer-button"></div>
      </div>
    </div>
    <div class="faq-section">
      <div class="shimmer-title" style="width:28%;margin:0 auto 24px"></div>
      <div style="max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:10px">
        ${faqCards}
      </div>
    </div>`;
}

function loadActualContent() {
  const container = document.getElementById('contactContainer');

  const faqs = [
    { q: 'How do I access my purchased resources?', a: 'After a successful payment, go to your Dashboard. All purchased resources appear under "My Purchases" and are available for immediate download.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay — an RBI-regulated, PCI-DSS compliant gateway.' },
    { q: 'Can I get a refund?', a: 'All digital sales are generally final once accessed. Refunds are considered if the resource is corrupted, inaccessible, or significantly misrepresented. Email us within 48 hours of purchase.' },
    { q: 'How do withdrawals work?', a: 'Submit a withdrawal request from your Dashboard. Our team reviews it and transfers the amount (minus the 5% platform fee) to your bank or UPI account.' },
    { q: 'How long does a withdrawal take?', a: 'Withdrawals are reviewed within 1–2 business days. Transfer time depends on your bank, typically 1–3 business days after approval.' },
    { q: 'How do I report an issue with a resource?', a: 'Email support@earnify.com with your order ID and a description of the issue. We investigate and resolve all reports within 2 business days.' },
  ];

  container.innerHTML = `
    <div class="contact-page">

      <div class="contact-left">
        <div class="info-head">
          <div class="info-icon-wrap"><i class="fas fa-headset"></i></div>
          <h2>We're Here to Help</h2>
          <p>Have a question, issue, or just want to say hello? Reach out through any channel below.</p>
        </div>

        <div class="response-badge"><i class="fas fa-bolt"></i> Average response: <strong>&nbsp;under 2 hours</strong></div>

        <div class="info-cards">
          <a href="mailto:support@earnify.com" class="info-card">
            <div><strong>Email Us</strong><span>support@earnify.com</span></div>
            <i class="fas fa-arrow-right info-card-arrow"></i>
          </a>
          <a href="tel:+116046453263" class="info-card">
            <div><strong>Call Us</strong><span>+11 60464 53263</span></div>
            <i class="fas fa-arrow-right info-card-arrow"></i>
          </a>
          <div class="info-card">
            <div><strong>Business Hours</strong><span>Mon–Fri: 9 AM – 6 PM</span><span>Sat: 10 AM – 4 PM &nbsp;|&nbsp; Sun: Closed</span></div>
          </div>
          <div class="info-card">
            <div><strong>Address</strong><span>123 Learning Street, Education District</span><span>City, State 12345</span></div>
          </div>
        </div>

        <div class="social-section">
          <p class="social-label">Follow us</p>
          <div class="social-row">
            <a class="social-btn fb" title="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a class="social-btn ig" title="Instagram"><i class="fab fa-instagram"></i></a>
            <a class="social-btn wa" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
            <a class="social-btn tw" title="Twitter"><i class="fab fa-twitter"></i></a>
          </div>
        </div>
      </div>

      <div class="contact-right">
        <div class="form-head">
          <h2>Send Us a Message</h2>
          <p>Fill in the form and we'll get back to you within 2 business days.</p>
        </div>
        <form id="contactForm" class="contact-form" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label for="name"><i class="fas fa-user"></i> Full Name</label>
              <input type="text" id="name" name="name" placeholder="Your full name" required>
            </div>
            <div class="form-group">
              <label for="email"><i class="fas fa-envelope"></i> Email Address</label>
              <input type="email" id="email" name="email" placeholder="you@example.com" required>
            </div>
          </div>
          <div class="form-group">
            <label for="subject"><i class="fas fa-tag"></i> Subject</label>
            <div class="select-wrap">
              <select id="subject" name="subject" required>
                <option value="" disabled selected>Select a topic…</option>
                <option>Payment Issue</option>
                <option>Withdrawal Problem</option>
                <option>Refund Request</option>
                <option>Account / Login Help</option>
                <option>Resource / Content Issue</option>
                <option>Seller Enquiry</option>
                <option>Other</option>
              </select>
              <i class="fas fa-chevron-down select-arrow"></i>
            </div>
          </div>
          <div class="form-group">
            <label for="message"><i class="fas fa-comment-alt"></i> Message</label>
            <textarea id="message" name="message" rows="5" placeholder="Describe your issue or question in detail…" required></textarea>
          </div>
          <button type="submit" class="submit-btn">
            <i class="fas fa-paper-plane"></i> Send Message
          </button>
        </form>
      </div>
    </div>

    <div class="faq-section">
      <div class="faq-head">
        <div class="faq-head-icon"><i class="fas fa-question-circle"></i></div>
        <h2>Frequently Asked Questions</h2>
        <p>Quick answers to the most common questions.</p>
      </div>
      <div class="faq-grid">
        ${faqs.map(f => `
          <div class="faq-item" onclick="toggleFaq(this)">
            <div class="faq-q"><span>${f.q}</span><i class="fas fa-chevron-down faq-icon"></i></div>
            <div class="faq-a">${f.a}</div>
          </div>`).join('')}
      </div>
    </div>
  `;

  document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn     = this.querySelector('.submit-btn');
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value.trim();
    if (!name || !email || !subject || !message) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    try {
      const res  = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
      const data = await res.json();
      if (data.success) {
        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
        this.reset();
      } else throw new Error();
    } catch {
      btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed — Try Again';
      btn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
    }
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      btn.style.background = '';
    }, 3000);
  });
}

function toggleFaq(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(f => f.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}
