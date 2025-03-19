// routes/corsTestRoutes.js
const express = require('express');
const router = express.Router();

/**
 * CORS Testing Routes
 * These routes help debug CORS issues in your Vercel deployment
 */

// Basic CORS test endpoint
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CORS test successful',
    origin: req.headers.origin || 'No origin header',
    headers: {
      'access-control-allow-origin': res.getHeader('access-control-allow-origin'),
      'access-control-allow-credentials': res.getHeader('access-control-allow-credentials'),
      'access-control-allow-methods': res.getHeader('access-control-allow-methods')
    },
    timestamp: new Date().toISOString()
  });
});

// Echo request headers for debugging
router.get('/headers', (req, res) => {
  res.status(200).json({
    message: 'Request headers received',
    requestHeaders: req.headers,
    responseHeaders: res.getHeaders()
  });
});

// Test endpoint for checking POST requests
router.post('/post-test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'POST request successful',
    body: req.body,
    origin: req.headers.origin || 'No origin header',
    method: req.method
  });
});

// Add a test endpoint with authentication
router.get('/auth-test', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(200).json({
      success: false,
      message: 'No Authorization header provided',
      hint: 'Try adding an "Authorization: Bearer test-token" header to your request'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Authorization header received successfully',
    authHeader: authHeader
  });
});

// Environment information
router.get('/environment', (req, res) => {
  res.status(200).json({
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'Not configured',
    serverTime: new Date().toISOString(),
    nodeVersion: process.version
  });
});

module.exports = router;
