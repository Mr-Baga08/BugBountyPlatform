// bug_dashboard/src/services/RazorpayService.js
import axios from 'axios';
import API_BASE_URL from '../assets/Componets/AdminDashboard/config';

/**
 * RazorpayService - Handles Razorpay payment integration
 * Note: API keys should be handled on the server-side only,
 * frontend is only responsible for opening the payment modal
 */
class RazorpayService {
  /**
   * Load the Razorpay script dynamically
   * @returns {Promise} Resolves when script is loaded
   */
  static loadScript() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Create subscription order
   * @param {Object} orderData Order details
   * @returns {Promise} API response with order details
   */
  static async createSubscriptionOrder(orderData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/create-subscription`, {
        interval: orderData.interval,
        userCount: orderData.userCount,
        companyName: orderData.companyName,
        email: orderData.email,
        phone: orderData.phone
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating subscription order:', error);
      throw new Error(error.response?.data?.message || 'Failed to create subscription');
    }
  }

  /**
   * Open Razorpay payment modal
   * @param {Object} orderData Order details from API
   * @param {Object} customerData Customer information
   * @param {Function} onSuccess Success callback
   * @param {Function} onError Error callback
   */
  static async openPaymentModal(orderData, customerData, onSuccess, onError) {
    // Make sure the script is loaded
    const scriptLoaded = await this.loadScript();
    
    if (!scriptLoaded) {
      onError('Failed to load Razorpay SDK');
      return;
    }
    
    try {
      const options = {
        key: orderData.keyId, // Key should be provided by backend
        subscription_id: orderData.subscriptionId,
        name: "Astraeus Next Gen BugHuntPlatform",
        description: `Enterprise Plan - ${customerData.userCount} users (${customerData.interval})`,
        image: "https://your-company-logo.png", // Replace with your company logo
        prefill: {
          name: customerData.companyName,
          email: customerData.email,
          contact: customerData.phone
        },
        notes: {
          companyName: customerData.companyName,
          userCount: customerData.userCount,
          billingCycle: customerData.interval
        },
        theme: {
          color: "#2563EB"
        },
        handler: function(response) {
          // Process the successful payment
          onSuccess({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySubscriptionId: response.razorpay_subscription_id,
            razorpaySignature: response.razorpay_signature
          });
        },
        modal: {
          ondismiss: function() {
            onError('Payment canceled by user');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      onError('Failed to initialize payment. Please try again.');
    }
  }

  /**
   * Verify payment with the backend
   * @param {Object} paymentData Payment response data
   * @param {Object} customerData Customer information
   * @returns {Promise} API response after verification
   */
  static async verifyPayment(paymentData, customerData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/verify-payment`, {
        razorpayPaymentId: paymentData.razorpayPaymentId,
        razorpaySubscriptionId: paymentData.razorpaySubscriptionId,
        razorpaySignature: paymentData.razorpaySignature,
        companyName: customerData.companyName,
        email: customerData.email,
        phone: customerData.phone,
        userCount: customerData.userCount,
        billingCycle: customerData.interval
      });
      
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  }

  /**
   * Setup trial for company
   * @param {Object} trialData Trial setup data
   * @returns {Promise} API response with trial details
   */
  static async setupTrial(trialData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/setup-trial`, {
        companyName: trialData.companyName,
        email: trialData.email,
        phone: trialData.phone,
        userCount: trialData.userCount
      });
      
      return response.data;
    } catch (error) {
      console.error('Error setting up trial:', error);
      throw new Error(error.response?.data?.message || 'Failed to set up trial');
    }
  }

  /**
   * Get company usage metrics
   * @param {string} companyId Company identifier
   * @returns {Promise} Current usage metrics
   */
  static async getCompanyUsage(companyId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/company-usage/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting company usage:', error);
      throw new Error(error.response?.data?.message || 'Failed to get company usage data');
    }
  }

  /**
   * Update user count for subscription
   * @param {string} companyId Company identifier
   * @param {number} newUserCount New user count
   * @returns {Promise} Updated subscription details
   */
  static async updateUserCount(companyId, newUserCount) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/update-user-count`, {
        companyId,
        newUserCount
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating user count:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user count');
    }
  }
  
  /**
   * Calculate the price based on user count and billing cycle
   * @param {number} userCount - Number of users
   * @param {string} billingCycle - 'monthly' or 'yearly'
   * @returns {Object} - Price details with base price, total, and savings
   */
  static calculatePrice(userCount, billingCycle) {
    // Base price for the first 20 users
    let basePrice = 99;
    
    // Additional cost for each block of 20 users beyond the first 20
    if (userCount > 20) {
      const additionalGroups = Math.ceil((userCount - 20) / 20);
      basePrice += additionalGroups * 25;
    }
    
    let finalPrice = basePrice;
    let savings = 0;
    
    // Apply discount for yearly billing
    if (billingCycle === 'yearly') {
      savings = Math.round(basePrice * 12 * 0.2); // 20% discount
      finalPrice = Math.round(basePrice * 0.8); // Discounted monthly price
      
      // For display purposes, we might want to know the annual price too
      const annualPrice = finalPrice * 12;
      return {
        baseMonthlyPrice: basePrice,
        monthlyPrice: finalPrice,
        annualPrice: annualPrice,
        savings: savings
      };
    }
    
    return {
      baseMonthlyPrice: basePrice,
      monthlyPrice: finalPrice,
      annualPrice: finalPrice * 12,
      savings: 0
    };
  }
}

export default RazorpayService;