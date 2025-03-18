// vercel-deploy.js
// Run this script with Node.js to prepare the project for Vercel deployment
// Usage: node vercel-deploy.js

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel deployment preparation...');

// Define project directories
const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'bug_dashboard');
const BACKEND_DIR = path.join(ROOT_DIR, 'server');

// Create directories if they don't exist
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
}

// Write content to file
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log(`Created/Updated file: ${filePath}`);
}

// Find and replace in file
function findAndReplaceInFile(filePath, searchValue, replaceValue) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const updatedContent = content.replace(new RegExp(searchValue, 'g'), replaceValue);
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Modified file: ${filePath}`);
  } else {
    console.log(`No changes needed in: ${filePath}`);
  }
}

// 1. Prepare Frontend (bug_dashboard)
console.log('\n📦 Preparing Frontend...');

// Create Vercel config for frontend
const frontendVercelConfig = {
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
};

writeFile(
  path.join(FRONTEND_DIR, 'vercel.json'),
  JSON.stringify(frontendVercelConfig, null, 2)
);

// Create .env file for frontend
const frontendEnv = `VITE_API_BASE_URL=https://your-backend-api-url.vercel.app/api
`;

writeFile(path.join(FRONTEND_DIR, '.env'), frontendEnv);

// Update config.js to use environment variables
const configJsPath = path.join(FRONTEND_DIR, 'src/assets/Componets/Admin Dashboard/config.js');
const updatedConfigJs = `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
export default API_BASE_URL;`;

writeFile(configJsPath, updatedConfigJs);

// 2. Prepare Backend (server)
console.log('\n🖥️ Preparing Backend...');

// Create Vercel config for backend
const backendVercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
};

writeFile(
  path.join(BACKEND_DIR, 'vercel.json'),
  JSON.stringify(backendVercelConfig, null, 2)
);

// Update server.js with CORS configuration and module export
const serverJsPath = path.join(BACKEND_DIR, 'server.js');
let serverJsContent = fs.readFileSync(serverJsPath, 'utf8');

// Replace CORS configuration
const corsRegex = /app\.use\(cors\(\)\);/;
const newCorsConfig = `const allowedOrigins = [
  'https://your-frontend-url.vercel.app',
  'http://localhost:5173' // Keep for local development
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));`;

serverJsContent = serverJsContent.replace(corsRegex, newCorsConfig);

// Add module.exports at the end if not present
if (!serverJsContent.includes('module.exports')) {
  serverJsContent += '\n\nmodule.exports = app;\n';
}

writeFile(serverJsPath, serverJsContent);

// 3. Create deployment instructions
console.log('\n📝 Creating deployment instructions...');

const deploymentInstructions = `# Deployment Instructions for Vercel

## Backend Deployment

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure the project:
   - Set the root directory to \`server\`
   - Set the build command to \`npm install\`
   - Set the output directory to \`.\`
4. Add Environment Variables:
   - MONGO_URI
   - JWT_SECRET
   - EMAIL_USER
   - EMAIL_PASS
   - ADMIN_EMAIL
   - BASE_URL (your Vercel-deployed backend URL)
5. Deploy

## Frontend Deployment

1. Create another new project on Vercel
2. Connect the same GitHub repository
3. Configure the project:
   - Set the root directory to \`bug_dashboard\`
   - Set the build command to \`npm run build\`
   - Set the output directory to \`dist\`
4. Add Environment Variables:
   - VITE_API_BASE_URL (your deployed backend URL with /api, e.g., https://your-backend.vercel.app/api)
5. Deploy

## After Deployment

1. Update your frontend's \`.env\` file with the actual deployed backend URL
2. Update your backend's allowed origins in \`server.js\` with the actual deployed frontend URL
3. Redeploy both projects if needed

## Testing

After deployment, verify the following:
- User authentication (login/registration)
- File uploads and downloads
- Data retrieval from MongoDB
- All API routes functioning correctly
`;

writeFile(path.join(ROOT_DIR, 'VERCEL_DEPLOYMENT.md'), deploymentInstructions);

// Create a Vercel-specific .gitignore to exclude local environment files
const gitignoreContent = `# Vercel
.vercel
.env
.env.local
.env.development
.env.production

# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist
build
.output

# Misc
.DS_Store
*.pem
`;

writeFile(path.join(ROOT_DIR, '.vercelignore'), gitignoreContent);

// Create a sample .env file for local development
const sampleEnvContent = `# Frontend .env example (place in bug_dashboard/.env)
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api

# Backend .env example (place in server/.env)
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_secret_jwt_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
ADMIN_EMAIL=admin@example.com
BASE_URL=https://your-backend-url.vercel.app
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
`;

writeFile(path.join(ROOT_DIR, '.env.example'), sampleEnvContent);

console.log('\n✅ Vercel deployment preparation complete!');
console.log('📄 See VERCEL_DEPLOYMENT.md for deployment instructions');
console.log('\n⚠️ Remember to update the following before deployment:');
console.log('1. Set the actual backend URL in the frontend .env file');
console.log('2. Set the actual frontend URL in the backend server.js allowed origins');
