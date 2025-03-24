// In server/config/email.js
const emailjs = require('@emailjs/nodejs');
require('dotenv').config();

// Initialize with your keys
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY
});

// Function to send admin notification
const sendVerificationEmail = async (user) => {
  try {
    const templateParams = {
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_ADMIN_TEMPLATE_ID,
      templateParams,
      {
        to_email: process.env.ADMIN_EMAIL
      }
    );
    
    console.log('Admin notification sent');
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
};

// Function to send user notification
const sendApprovalEmail = async (user, isApproved) => {
  try {
    const templateParams = {
      username: user.username,
      status: isApproved ? 'approved' : 'rejected'
    };
    
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_USER_TEMPLATE_ID,
      templateParams,
      {
        to_email: user.email
      }
    );
    
    console.log('User notification sent');
  } catch (error) {
    console.error('Failed to send user notification:', error);
  }
};

module.exports = { sendVerificationEmail, sendApprovalEmail };