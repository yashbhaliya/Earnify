// Shimmer loading for Contact page
document.addEventListener('DOMContentLoaded', function() {
  loadContactContent();
});

function loadContactContent() {
  showShimmer();
  setTimeout(() => {
    loadActualContent();
  }, 1500);
}

function showShimmer() {
  const container = document.getElementById('contactContainer');
  container.innerHTML = `
    <div class="contact-wrapper">
      <div class="contact-info">
        <div class="shimmer-box">
          <div class="shimmer-title"></div>
          <div class="shimmer-text"></div>
          <div class="shimmer-text short"></div>
          <br>
          <div class="shimmer-contact-item">
            <div class="shimmer-icon"></div>
            <div style="flex: 1;">
              <div class="shimmer-text" style="width: 60%; margin-bottom: 8px;"></div>
              <div class="shimmer-text" style="width: 80%;"></div>
            </div>
          </div>
          <div class="shimmer-contact-item">
            <div class="shimmer-icon"></div>
            <div style="flex: 1;">
              <div class="shimmer-text" style="width: 60%; margin-bottom: 8px;"></div>
              <div class="shimmer-text" style="width: 80%;"></div>
            </div>
          </div>
          <div class="shimmer-contact-item">
            <div class="shimmer-icon"></div>
            <div style="flex: 1;">
              <div class="shimmer-text" style="width: 60%; margin-bottom: 8px;"></div>
              <div class="shimmer-text" style="width: 80%;"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="contact-form-wrapper">
        <div class="shimmer-box">
          <div class="shimmer-title"></div>
          <div class="shimmer-form-field"></div>
          <div class="shimmer-form-field"></div>
          <div class="shimmer-form-field"></div>
          <div class="shimmer-form-field large"></div>
          <div class="shimmer-button"></div>
        </div>
      </div>
    </div>
    
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

function loadActualContent() {
  const container = document.getElementById('contactContainer');
  container.innerHTML = `
    <div class="contact-wrapper">
      <div class="contact-info">
        <h2>Get In Touch</h2>
        <p>Have questions or need assistance? Our team is here to help you. Reach out to us through any of the following channels:</p>
        
        <div class="contact-item">
          <i class="fas fa-envelope"></i>
          <div>
            <h3>Email</h3>
            <p>support@earnify.com</p>
          </div>
        </div>

        <div class="contact-item">
          <i class="fas fa-phone"></i>
          <div>
            <h3>Phone</h3>
            <p>+11 60464 53263</p>
          </div>
        </div>

        <div class="contact-item">
          <i class="fas fa-clock"></i>
          <div>
            <h3>Business Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p>Saturday: 10:00 AM - 4:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>

        <div class="contact-item">
          <i class="fas fa-map-marker-alt"></i>
          <div>
            <h3>Address</h3>
            <p>123 Learning Street</p>
            <p>Education District</p>
            <p>City, State 12345</p>
          </div>
        </div>
      </div>

      <div class="contact-form-wrapper">
        <h2>Send Us a Message</h2>
        <form id="contactForm" class="contact-form">
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input type="text" id="name" name="name" required>
          </div>

          <div class="form-group">
            <label for="email">Email Address *</label>
            <input type="email" id="email" name="email" required>
          </div>

          <div class="form-group">
            <label for="subject">Subject *</label>
            <input type="text" id="subject" name="subject" required>
          </div>

          <div class="form-group">
            <label for="message">Message *</label>
            <textarea id="message" name="message" rows="6" required></textarea>
          </div>

          <button type="submit" class="submit-btn">
            <i class="fas fa-envelope"></i> Send Message
          </button>
        </form>
      </div>
    </div>

    <div class="content-box">
      <h2>Frequently Asked Questions</h2>
      <div class="faq-item">
        <h3>How do I access my purchased resources?</h3>
        <p>After purchase, you can access your resources from your Dashboard. All purchased items are available for download immediately.</p>
      </div>
      <div class="faq-item">
        <h3>What payment methods do you accept?</h3>
        <p>We accept all major credit cards, debit cards, and digital payment methods through our secure payment gateway.</p>
      </div>
      <div class="faq-item">
        <h3>Can I get a refund?</h3>
        <p>Due to the digital nature of our products, refunds are generally not available once you've accessed the content. However, we review refund requests on a case-by-case basis for defective or misrepresented products.</p>
      </div>
      <div class="faq-item">
        <h3>How do I report an issue with a resource?</h3>
        <p>Please contact us via email at support@earnify.com with details about the issue, and we'll investigate and resolve it promptly.</p>
      </div>
    </div>
  `;
  
  // Re-attach form submit handler
  document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
  });
}
