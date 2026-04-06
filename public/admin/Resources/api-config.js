// API Configuration for Earnify
// This file automatically detects if we're running locally or on Vercel

const API_CONFIG = {
  // Detect if we're running locally or on production
  isLocal: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  
  // Base URL for API calls
  get baseURL() {
    if (this.isLocal) {
      return window.location.port === '5500'
        ? 'https://earnify-gamma.vercel.app'
        : 'http://localhost:5000';
    }
    return window.location.origin;
  },
  
  // API endpoints
  endpoints: {
    resources: '/api/resources',
    payments: '/api/payments',
    paymentKey: '/api/payment/key',
    createOrder: '/api/payment/create-order',
    verifyPayment: '/api/payment/verify',
    auth: {
      login: '/api/auth/login',
      signup: '/api/auth/signup'
    },
    admin: {
      login: '/api/admin/login',
      signup: '/api/admin/signup',
      users: '/api/users'
    },
    contact: '/api/contact',
    statistics: '/api/statistics/purchases',
    userStatistics: '/api/statistics/purchases' // Will append /{userEmail}
  },
  
  // Helper method to get full URL
  getURL(endpoint) {
    return this.baseURL + endpoint;
  }
};

// Make it globally available
window.API_CONFIG = API_CONFIG;

console.log('API Config loaded:', {
  isLocal: API_CONFIG.isLocal,
  baseURL: API_CONFIG.baseURL
});