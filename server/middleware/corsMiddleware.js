const corsMiddleware = (req, res, next) => {
  // Allow requests from any origin - we'll restrict this in production
  res.header('Access-Control-Allow-Origin', '*');
  
  // Set allowed methods
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  // Set allowed headers
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
  
  // Allow credentials
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests - this is critical!
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Continue to next middleware
  next();
};

module.exports = corsMiddleware;
