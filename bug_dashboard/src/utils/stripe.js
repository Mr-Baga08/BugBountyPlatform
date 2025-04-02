// bug_dashboard/src/utils/stripe.js
import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51OqXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

/**
 * Initialize Stripe checkout session
 * @param {string} priceId - The ID of the price/plan to subscribe to
 * @param {number} quantity - Number of users
 * @param {string} companyName - Name of the company
 * @param {string} email - Admin email
 * @returns {Promise} - Redirects to Stripe checkout
 */
export async function createCheckoutSession({ priceId, quantity, companyName, email }) {
  try {
    // Call backend API to create a checkout session
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        quantity,
        companyName,
        email,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/pricing`,
      }),
    });
    
    const session = await response.json();
    
    // Redirect to Stripe checkout
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
    
    if (error) {
      console.error('Error redirecting to checkout:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Get current subscription details
 * @returns {Promise<Object>} - Subscription details
 */
export async function getSubscriptionDetails() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/subscription`, {
      headers: {
        'Authorization': token
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    throw error;
  }
}

/**
 * Update subscription user count
 * @param {number} newQuantity - New number of users
 * @returns {Promise<Object>} - Updated subscription
 */
export async function updateSubscriptionQuantity(newQuantity) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/update-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ quantity: newQuantity }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 * @returns {Promise<Object>} - Cancellation confirmation
 */
export async function cancelSubscription() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Authorization': token
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

export default {
  createCheckoutSession,
  getSubscriptionDetails,
  updateSubscriptionQuantity,
  cancelSubscription
};