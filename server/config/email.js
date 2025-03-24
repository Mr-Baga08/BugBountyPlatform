// server/config/email.js
const nodemailer = require('nodemailer');
const { EmailJSResponseStatus } = require('@emailjs/nodejs');
const emailjs = require('@emailjs/nodejs');
require('dotenv').config();

// Initialize EmailJS with your keys
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY
});

// Fallback transporter using nodemailer (in case EmailJS fails)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send notification to admin about new user registration
const sendVerificationEmail = async (user) => {
  try {
    const templateParams = {
      username: user.username,
      email: user.email,
      role: user.role,
      registration_time: new Date().toISOString(),
      ip_address: 'Not available', // This would need to be passed from the controller
      admin_dashboard_link: `${process.env.FRONTEND_URL}/admin-dashboard`
    };
    
    // Send via EmailJS
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_ADMIN_TEMPLATE_ID,
      templateParams
    );
    
    console.log('Admin notification sent via EmailJS');
    return true;
  } catch (error) {
    console.error('Failed to send admin notification via EmailJS:', error);
    
    // Fallback to nodemailer
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `[BugHuntPlatform] New User Registration: ${user.username}`,
        html: `
          <p>Dear AstraeusNextGen Admin,</p>
          <p>A new user has registered on the BugHuntPlatform.</p>
          <p><strong>User Details:</strong></p>
          <ul>
            <li><strong>Username:</strong> ${user.username}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Role:</strong> ${user.role}</li>
            <li><strong>Registration Timestamp:</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>Please review the user's registration details and take appropriate action.</p>
          <p>Thank you,</p>
          <p>The AstraeusNextGen Team</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log('Admin notification sent via nodemailer fallback');
      return true;
    } catch (fallbackError) {
      console.error('Email fallback also failed:', fallbackError);
      return false;
    }
  }
};

// Send approval/rejection notification to user
const sendApprovalEmail = async (user, isApproved) => {
  try {
    const templateParams = {
      username: user.username,
      status: isApproved ? 'approved' : 'rejected',
      login_link: `${process.env.FRONTEND_URL}/signin`,
      support_email: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
      rejection_reason: isApproved ? '' : 'Your application did not meet our current requirements.'
    };
    
    // Send via EmailJS
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_USER_TEMPLATE_ID,
      templateParams
    );
    
    console.log(`User ${isApproved ? 'approval' : 'rejection'} notification sent via EmailJS`);
    return true;
  } catch (error) {
    console.error(`Failed to send user ${isApproved ? 'approval' : 'rejection'} via EmailJS:`, error);
    
    // Fallback to nodemailer
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `[BugHuntPlatform] Your Registration Status Update`,
        html: isApproved ? 
          `
            <p>Dear ${user.username},</p>
            <p>Thank you for registering on the BugHuntPlatform, provided by AstraeusNextGen.</p>
            <p>Your registration status has been updated to: <strong>approved</strong>.</p>
            <p>Your account has been approved. You can now log in and start using the BugHuntPlatform.</p>
            <p><a href="${process.env.FRONTEND_URL}/signin">Log in to BugHuntPlatform</a></p>
            <p>We look forward to your contributions to the BugHuntPlatform.</p>
            <p>Sincerely,</p>
            <p>The AstraeusNextGen Team</p>
          ` : 
          `
            <p>Dear ${user.username},</p>
            <p>Thank you for registering on the BugHuntPlatform, provided by AstraeusNextGen.</p>
            <p>Your registration status has been updated to: <strong>rejected</strong>.</p>
            <p>Unfortunately, your registration has been rejected. Please contact our support team at ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER} if you have any questions.</p>
            <p>We appreciate your interest in the BugHuntPlatform.</p>
            <p>Sincerely,</p>
            <p>The AstraeusNextGen Team</p>
          `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`User ${isApproved ? 'approval' : 'rejection'} notification sent via nodemailer fallback`);
      return true;
    } catch (fallbackError) {
      console.error('Email fallback also failed:', fallbackError);
      return false;
    }
  }
};

module.exports = { sendVerificationEmail, sendApprovalEmail, transporter };