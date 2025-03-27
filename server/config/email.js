const { EmailJSResponseStatus } = require('@emailjs/nodejs');
const emailjs = require('@emailjs/nodejs');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Initialize EmailJS with your keys
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY
});

// Fallback transporter using nodemailer
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
      ip_address: 'Not available',
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
        from: process.env.EMAIL_USER || 'info@astraeusnextgen.com',
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
      support_email: process.env.SUPPORT_EMAIL || 'info@astraeusnextgen.com',
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
        from: process.env.EMAIL_USER || 'info@astraeusnextgen.com',
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
            <p>Unfortunately, your registration has been rejected. Please contact our support team at ${process.env.SUPPORT_EMAIL || 'info@astraeusnextgen.com'} if you have any questions.</p>
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

const sendTaskStatusChangeEmail = async (task, newStatus, userName) => {
  try {
    // First try to use EmailJS
    const templateParams = {
      username: task.userEmail.split('@')[0] || 'User',
      taskId: task.taskId,
      status: newStatus,
      updatedBy: userName,
      domain: task.DomainLink || 'Not specified',
      dashboardUrl: `${process.env.FRONTEND_URL || 'https://bug-hunt-platform-frontend.vercel.app'}`
    };
    
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_USER_TEMPLATE_ID,
      templateParams
    );
    
    console.log(`Task status change email sent for task ${task.taskId}`);
    return true;
  } catch (error) {
    console.error('Failed to send task status email via EmailJS:', error);
    
    // Fallback to nodemailer
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'info@astraeusnextgen.com',
        to: task.userEmail,
        subject: `Task Status Updated: ${task.taskId}`,
        html: `
          <p>Dear User,</p>
          <p>Your task's status has been updated.</p>
          <p><strong>Task Details:</strong></p>
          <ul>
            <li><strong>Task ID:</strong> ${task.taskId}</li>
            <li><strong>New Status:</strong> ${newStatus}</li>
            <li><strong>Updated By:</strong> ${userName}</li>
          </ul>
          <p>Please log in to view more details.</p>
          <p>Thank you,</p>
          <p>The AstraeusNextGen Team</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`Task status change email sent via nodemailer fallback for task ${task.taskId}`);
      return true;
    } catch (fallbackError) {
      console.error('Email fallback also failed:', fallbackError);
      return false;
    }
  }
};

// Send task review notification
const sendTaskReviewNotification = async (task, reviewBy, reviewType) => {
  try {
    // Determine recipient based on review type
    let recipient;
    let subject;
    let message;
    
    if (reviewType === 'hunter_to_coach') {
      // Find a coach to notify
      const User = require('../models/User');
      const coaches = await User.find({ role: 'coach', isVerified: true });
      if (coaches.length > 0) {
        recipient = coaches[0].email; // Send to first coach found
      } else {
        recipient = process.env.ADMIN_EMAIL; // Fallback to admin
      }
      subject = `Task ${task.taskId} Submitted for Review`;
      message = `Task ${task.taskId} has been submitted by ${reviewBy} and needs your review.`;
    } else if (reviewType === 'coach_to_admin') {
      recipient = process.env.ADMIN_EMAIL;
      subject = `Task ${task.taskId} Validated by Coach`;
      message = `Task ${task.taskId} has been validated by coach ${reviewBy} and is ready for admin review.`;
    } else if (reviewType === 'admin_to_delivery') {
      recipient = process.env.ADMIN_EMAIL; // Send to admin and potentially others
      subject = `Task ${task.taskId} Approved for Delivery`;
      message = `Task ${task.taskId} has been approved for delivery by ${reviewBy}.`;
    }
    
    if (!recipient) {
      console.error('No recipient found for task review notification');
      return false;
    }
    
    // Try EmailJS first
    try {
      const templateParams = {
        username: recipient.split('@')[0] || 'User',
        taskId: task.taskId,
        status: reviewType,
        message: message,
        reviewBy: reviewBy,
        dashboardUrl: `${process.env.FRONTEND_URL || 'https://bug-hunt-platform-frontend.vercel.app'}`
      };
      
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_ADMIN_TEMPLATE_ID,
        templateParams
      );
      
      console.log(`Task review notification sent for task ${task.taskId}`);
      return true;
    } catch (error) {
      console.error('Failed to send task review notification via EmailJS:', error);
      
      // Fallback to nodemailer
      const mailOptions = {
        from: process.env.EMAIL_USER || 'info@astraeusnextgen.com',
        to: recipient,
        subject: subject,
        html: `
          <p>Dear ${recipient.split('@')[0] || 'User'},</p>
          <p>${message}</p>
          <p><strong>Task Details:</strong></p>
          <ul>
            <li><strong>Task ID:</strong> ${task.taskId}</li>
            <li><strong>Project:</strong> ${task.projectName}</li>
            <li><strong>Industry:</strong> ${task.industry}</li>
          </ul>
          <p>Please log in to the platform to review this task.</p>
          <p>Thank you,</p>
          <p>The AstraeusNextGen Team</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`Task review notification sent via nodemailer for task ${task.taskId}`);
      return true;
    }
  } catch (error) {
    console.error('Failed to send task review notification:', error);
    return false;
  }
};

// Export the new functions
module.exports = { 
  sendVerificationEmail, 
  sendApprovalEmail,
  sendTaskStatusChangeEmail,
  sendTaskReviewNotification,
  transporter
};

// module.exports = { sendVerificationEmail, sendApprovalEmail, transporter };