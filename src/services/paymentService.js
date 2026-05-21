import api from './api';

const paymentService = {
  processMockPayment: async (amount, gateway) => {
    // Simulates an API call to a secure endpoint that generates tokens/intents
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `${gateway.toUpperCase()}_TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          amount: amount,
          gateway: gateway,
          timestamp: new Date().toISOString()
        });
      }, 1500); // 1.5 second loading experience
    });
  },

  createStripePaymentIntent: async (amount) => {
    // Real integration placeholder: POST to backend stripe gateway
    const response = await api.post('/api/payments/stripe/create-intent', { amount });
    return response.data;
  },

  verifyRazorpaySignature: async (paymentDetails) => {
    // Real integration placeholder: POST signature hash validation
    const response = await api.post('/api/payments/razorpay/verify', paymentDetails);
    return response.data;
  }
};

export default paymentService;
