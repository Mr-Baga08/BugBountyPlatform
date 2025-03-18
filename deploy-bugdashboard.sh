#!/bin/bash
# deploy-bugdashboard.sh - Master deployment script for Bug Dashboard
# This script will prepare and deploy your project to Vercel
# Usage: ./deploy-bugdashboard.sh

set -e  # Exit on any error

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}🚀 Bug Dashboard Vercel Deployment Script${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18 or higher is required. You have version $NODE_VERSION.${NC}"
    exit 1
fi

# Create deployment scripts directory if it doesn't exist
SCRIPT_DIR="$(pwd)/deployment-scripts"
mkdir -p "$SCRIPT_DIR"

echo -e "${YELLOW}📂 Creating deployment scripts in ${SCRIPT_DIR}...${NC}"

# Write JavaScript files to the deployment scripts directory
cat > "${SCRIPT_DIR}/vercel-deploy.js" << 'EOF'
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
EOF

cat > "${SCRIPT_DIR}/update-api-endpoints.js" << 'EOF'
// update-api-endpoints.js
// This script finds and replaces hardcoded API URL formats with template literals
// Usage: node update-api-endpoints.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting comprehensive API endpoints update process...');

// Define project directories
const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'bug_dashboard');
const FRONTEND_SRC_DIR = path.join(FRONTEND_DIR, 'src');

// Regex patterns to match various problematic URL concatenations
const PATTERNS = [
  {
    pattern: /"API_BASE_URL \+ "\/([^"]+)"/g,
    replacement: '`${API_BASE_URL}/$1`',
    note: 'Replacing string concatenation with template literal'
  },
  {
    pattern: /"API_BASE_URL \+ "([^"]+)"/g,
    replacement: '`${API_BASE_URL}$1`',
    note: 'Handling concatenation without explicit slash'
  }
];

// Function to recursively process files in a directory
function processDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!entry.name.includes('node_modules') && 
          !entry.name.startsWith('.') && 
          !entry.name.includes('build') && 
          !entry.name.includes('dist')) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
      processFile(fullPath);
    }
  }
}

// Function to process an individual file
function processFile(filePath) {
  // Skip config.js itself and node_modules
  if (filePath.includes('node_modules') || 
      filePath.endsWith('config.js') || 
      filePath.includes('.test.') || 
      filePath.includes('__tests__')) {
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Track if any changes were made
    let fileModified = false;

    // Apply each pattern replacement
    PATTERNS.forEach(({pattern, replacement, note}) => {
      if (pattern.test(content)) {
        console.log(`🔧 Updating file: ${filePath}`);
        console.log(`   ${note}`);
        
        content = content.replace(pattern, replacement);
        fileModified = true;
      }
    });

    // Add import statement if URL replacements were made and import is missing
    if (fileModified) {
      // Check if import is already present
      if (!content.includes('import API_BASE_URL') && 
          !content.includes('from "../Admin Dashboard/config"')) {
        
        // Find the last import statement to place our new import after it
        const lines = content.split('\n');
        let lastImportIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('import ')) {
            lastImportIndex = i;
          }
        }
        
        // Add import statement
        const importStatement = 'import API_BASE_URL from "../Admin Dashboard/config";';
        
        if (lastImportIndex >= 0) {
          lines.splice(lastImportIndex + 1, 0, importStatement);
        } else {
          // If no imports, add at the top
          lines.unshift(importStatement);
        }
        
        content = lines.join('\n');
      }
    }

    // Write back the updated content if changes were made
    if (fileModified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated API calls in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Start processing
console.log(`Processing frontend source files in ${FRONTEND_SRC_DIR}...`);
processDirectory(FRONTEND_SRC_DIR);

console.log('\n🎉 API endpoints update process completed!');
console.log('Note: Some manual adjustments may still be necessary. Review the changes.');
EOF

cat > "${SCRIPT_DIR}/mongodb-vercel-config.js" << 'EOF'
// mongodb-vercel-config.js
// This script updates MongoDB configuration for Vercel deployment
// Usage: node mongodb-vercel-config.js

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating MongoDB configuration for Vercel...');

// Define project directories
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'server');
const CONFIG_DIR = path.join(BACKEND_DIR, 'config');

// Update db.js for Vercel
const dbJsPath = path.join(CONFIG_DIR, 'db.js');

if (fs.existsSync(dbJsPath)) {
  try {
    console.log(`Updating MongoDB connection in ${dbJsPath}...`);
    
    const dbJsContent = fs.readFileSync(dbJsPath, 'utf8');
    
    // Create updated db.js content with better error handling and options for Vercel
    const updatedDbJsContent = `const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGO_URI environment variable inside .env'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // These options are recommended for Vercel serverless environment
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('MongoDB connected');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

module.exports = connectDB;
`;

    fs.writeFileSync(dbJsPath, updatedDbJsContent);
    console.log(`✅ Updated ${dbJsPath} for Vercel compatibility`);
  } catch (error) {
    console.error(`❌ Error updating ${dbJsPath}:`, error.message);
  }
} else {
  console.log(`❌ File not found: ${dbJsPath}`);
}

// Update multerOfConfig.js for Vercel
const multerConfigPath = path.join(CONFIG_DIR, 'multerOfConfig.js');

if (fs.existsSync(multerConfigPath)) {
  try {
    console.log(`Updating GridFS configuration in ${multerConfigPath}...`);
    
    const multerConfigContent = fs.readFileSync(multerConfigPath, 'utf8');
    
    // Create updated multerOfConfig.js content for Vercel serverless environment
    const updatedMulterConfigContent = `const multer = require("multer");
const { MongoClient, GridFSBucket } = require("mongodb");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Use OS temp directory for Vercel compatibility
const TEMP_DIR = os.tmpdir();

async function connectDB() {
  const MONGODB_URI = process.env.MONGO_URI;
  
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGO_URI environment variable');
  }
  
  try {
    const client = await MongoClient.connect(MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log("Connected to MongoDB for GridFS");
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Use cached pattern for Vercel serverless environment
let cached = { bucket: null, client: null, promise: null };

async function getBucket() {
  if (cached.bucket) {
    return cached.bucket;
  }
  
  if (!cached.promise) {
    cached.promise = connectDB().then(client => {
      cached.client = client;
      const db = client.db("mongodb_gridfs");
      cached.bucket = new GridFSBucket(db, { bucketName: "myBucketName" });
      console.log("GridFS Bucket initialized");
      return cached.bucket;
    });
  }
  
  try {
    cached.bucket = await cached.promise;
    return cached.bucket;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use OS temp directory for Vercel
    const uploadPath = path.join(TEMP_DIR, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// ✅ Upload Middleware for Two Files
const upload = multer({
  storage,
}).fields([
  { name: "scriptFile", maxCount: 1 },
  { name: "supportFile", maxCount: 1 },
]);

// ✅ Upload Files to GridFS with Metadata
const uploadToGridFS = async (req, res, next) => {
  if (!req.files || (!req.files.scriptFile && !req.files.supportFile)) {
    return res.status(400).json({ error: "At least one file is required." });
  }

  try {
    const bucket = await getBucket();
    
    const uploadFileToGridFS = (file, fileTypeName) => {
      return new Promise((resolve, reject) => {
        const filePath = file.path;
        const fileName = file.filename;

        const stream = fs.createReadStream(filePath)
          .pipe(
            bucket.openUploadStream(fileName, {
              chunkSizeBytes: 1048576, // 1 MB
              metadata: {
                name: Date.now() + "-" + file.originalname,
                size: file.size,
                type: file.mimetype,
                fileTypeName: fileTypeName,
              },
            })
          );

        stream.on("finish", () => {
          // Delete local file after upload
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.warn("Could not delete temp file:", err);
          }
          resolve(stream.id);
        });

        stream.on("error", (err) => {
          console.error("GridFS Upload Error:", err);
          reject(err);
        });
      });
    };

    const uploadedFiles = [];

    if (req.files.scriptFile) {
      const scriptFile = req.files.scriptFile[0];
      const scriptFileName = await uploadFileToGridFS(scriptFile, "scriptFile");
      uploadedFiles.push({ scriptFile: scriptFileName });
    }

    if (req.files.supportFile) {
      const supportFile = req.files.supportFile[0];
      const supportFileName = await uploadFileToGridFS(supportFile, "supportFile");
      uploadedFiles.push({ supportFile: supportFileName });
    }

    req.uploadedFiles = uploadedFiles;
    next();
  } catch (error) {
    console.error("Error uploading files:", error);
    next(error);
  }
};

const getFileFromGridFS = async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = await getBucket();

    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("error", (err) => {
      console.error("Download error:", err);
      res.status(404).json({ message: "File not found" });
    });

    res.set("Content-Type", "application/octet-stream");
    res.set("Content-Disposition", \`attachment; filename="file-\${fileId}"\`);
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteFileFromGridFS = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "File ID is required" });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = await getBucket();

    try {
      await bucket.delete(fileId);
      res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: "File not found or already deleted" });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

module.exports = { upload, uploadToGridFS, getFileFromGridFS, deleteFileFromGridFS };
`;

    fs.writeFileSync(multerConfigPath, updatedMulterConfigContent);
    console.log(`✅ Updated ${multerConfigPath} for Vercel compatibility`);
  } catch (error) {
    console.error(`❌ Error updating ${multerConfigPath}:`, error.message);
  }
} else {
  console.log(`❌ File not found: ${multerConfigPath}`);
}

console.log('\n✅ MongoDB configuration updated for Vercel!');
EOF

cat > "${SCRIPT_DIR}/update-package-json.js" << 'EOF'
// update-package-json.js
// This script updates package.json files for Vercel compatibility
// Usage: node update-package-json.js

const fs = require('fs');
const path = require('path');

console.log('📦 Updating package.json files for Vercel deployment...');

// Define project directories
const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'bug_dashboard');
const BACKEND_DIR = path.join(ROOT_DIR, 'server');

// Update frontend package.json
const frontendPackageJsonPath = path.join(FRONTEND_DIR, 'package.json');

if (fs.existsSync(frontendPackageJsonPath)) {
  try {
    console.log(`Updating ${frontendPackageJsonPath}...`);
    
    const packageJson = JSON.parse(fs.readFileSync(frontendPackageJsonPath, 'utf8'));
    
    // Add Vercel-specific scripts and configurations
    packageJson.scripts = {
      ...packageJson.scripts,
      "vercel-build": "vite build"
    };
    
    // Ensure engines field for Node.js version
    packageJson.engines = {
      "node": ">=18.x"
    };
    
    fs.writeFileSync(
      frontendPackageJsonPath,
      JSON.stringify(packageJson, null, 2)
    );
    
    console.log(`✅ Updated ${frontendPackageJsonPath}`);
  } catch (error) {
    console.error(`❌ Error updating ${frontendPackageJsonPath}:`, error.message);
  }
} else {
  console.log(`❌ File not found: ${frontendPackageJsonPath}`);
}

// Update backend package.json
const backendPackageJsonPath = path.join(BACKEND_DIR, 'package.json');

if (fs.existsSync(backendPackageJsonPath)) {
  try {
    console.log(`Updating ${backendPackageJsonPath}...`);
    
    const packageJson = JSON.parse(fs.readFileSync(backendPackageJsonPath, 'utf8'));
    
    // Add Vercel-specific scripts and configurations
    packageJson.scripts = {
      ...packageJson.scripts,
      "vercel-build": "echo 'Build step completed'",
      "start": "node server.js"
    };
    
    // Ensure engines field for Node.js version
    packageJson.engines = {
      "node": ">=18.x"
    };
    
    fs.writeFileSync(
      backendPackageJsonPath,
      JSON.stringify(packageJson, null, 2)
    );
    
    console.log(`✅ Updated ${backendPackageJsonPath}`);
  } catch (error) {
    console.error(`❌ Error updating ${backendPackageJsonPath}:`, error.message);
  }
} else {
  console.log(`❌ File not found: ${backendPackageJsonPath}`);
}

// Create root deployment package.json
const rootPackageJsonPath = path.join(ROOT_DIR, 'package.json');

try {
  console.log(`Creating ${rootPackageJsonPath} for project-level deployment scripts...`);
  
  const rootPackageJson = {
    "name": "bug-dashboard-deployment",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "prepare-vercel": "node deployment-scripts/vercel-deploy.js && node deployment-scripts/update-api-endpoints.js && node deployment-scripts/mongodb-vercel-config.js && node deployment-scripts/update-package-json.js",
      "prepare-frontend": "cd bug_dashboard && npm install",
      "prepare-backend": "cd server && npm install",
      "prepare-all": "npm run prepare-vercel && npm run prepare-frontend && npm run prepare-backend"
    },
    "engines": {
      "node": ">=18.x"
    }
  };
  
  fs.writeFileSync(
    rootPackageJsonPath,
    JSON.stringify(rootPackageJson, null, 2)
  );
  
  console.log(`✅ Created ${rootPackageJsonPath}`);
} catch (error) {
  console.error(`❌ Error creating ${rootPackageJsonPath}:`, error.message);
}

console.log('\n✅ Package.json files updated for Vercel deployment!');
console.log('🔍 Run "npm run prepare-all" to prepare the entire project for deployment.');
EOF

cat > "${SCRIPT_DIR}/deployment-coordinator.js" << 'EOF'
#!/usr/bin/env node
// deployment-coordinator.js
// This script runs all the necessary scripts to prepare the project for Vercel deployment
// Usage: node deployment-coordinator.js

console.log('🚀 Starting Bug Dashboard deployment preparation...');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define deployment scripts
const deploymentScripts = [
  'vercel-deploy.js',
  'update-api-endpoints.js',
  'mongodb-vercel-config.js',
  'update-package-json.js'
];

// Ensure all scripts exist
const missingScripts = deploymentScripts.filter(script => !fs.existsSync(path.join(__dirname, script)));

if (missingScripts.length > 0) {
  console.error('❌ The following required scripts are missing:');
  missingScripts.forEach(script => console.error(`  - ${script}`));
  process.exit(1);
}

// Run each script sequentially
deploymentScripts.forEach(script => {
  try {
    console.log(`\n🔧 Running ${script}...`);
    execSync(`node ${script}`, { stdio: 'inherit' });
    console.log(`✅ ${script} completed successfully.`);
  } catch (error) {
    console.error(`❌ Error executing ${script}: ${error.message}`);
    process.exit(1);
  }
});

// Create the build scripts
console.log('\n📝 Creating build scripts...');

// Helper to create an executable file
function createExecutable(filename, content) {
  fs.writeFileSync(filename, content);
  fs.chmodSync(filename, '755'); // Make executable
  console.log(`✅ Created ${filename}`);
}

// Create deploy-frontend.sh
const deployFrontendScript = `#!/bin/bash
cd ../bug_dashboard
echo "Installing frontend dependencies..."
npm install
echo "Building frontend..."
npm run build
echo "Frontend build complete."
`;
createExecutable(path.join(__dirname, 'deploy-frontend.sh'), deployFrontendScript);

// Create deploy-backend.sh
const deployBackendScript = `#!/bin/bash
cd ../server
echo "Installing backend dependencies..."
npm install
echo "Backend preparation complete."
`;
createExecutable(path.join(__dirname, 'deploy-backend.sh'), deployBackendScript);

// Create deploy-all.sh
const deployAllScript = `#!/bin/bash
echo "🚀 Starting full deployment preparation..."
node deployment-coordinator.js
./deploy-frontend.sh
./deploy-backend.sh
echo "✅ Deployment preparation complete."
echo "🔍 Now commit your changes and deploy to Vercel following the instructions in VERCEL_DEPLOYMENT.md."
`;
createExecutable(path.join(__dirname, 'deploy-all.sh'), deployAllScript);

console.log('\n🎉 Deployment coordinator setup complete!');
console.log('\nTo prepare the project for Vercel deployment, run:');
console.log('  ./deploy-all.sh');
console.log('\nOr run individual steps:');
console.log('  ./deploy-frontend.sh - Prepare the frontend');
console.log('  ./deploy-backend.sh - Prepare the backend');
EOF

# Create package.json for deployment scripts if it doesn't exist
# Create package.json for deployment scripts if it doesn't exist
if [ ! -f "${SCRIPT_DIR}/package.json" ]; then
    echo -e "${YELLOW}📦 Creating package.json for deployment scripts...${NC}"
    cat > "${SCRIPT_DIR}/package.json" << EOF
{
  "name": "bug-dashboard-deployment",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "prepare-vercel": "node vercel-deploy.js && node update-api-endpoints.js && node mongodb-vercel-config.js && node update-package-json.js",
    "prepare-frontend": "cd ../bug_dashboard && npm install",
    "prepare-backend": "cd ../server && npm install",
    "prepare-all": "npm run prepare-vercel && npm run prepare-frontend && npm run prepare-backend"
  },
  "engines": {
    "node": ">=18.x"
  }
}
EOF
fi

# Install necessary dependencies
echo -e "${YELLOW}📦 Installing deployment dependencies...${NC}"
cd "$SCRIPT_DIR"

# Create a basic package.json if it doesn't exist already
if [ ! -f "package.json" ]; then
    npm init -y > /dev/null 2>&1
fi

# Install required dependencies
npm install --save fs-extra path child_process > /dev/null 2>&1

# Run the deployment coordinator
echo -e "${GREEN}🚀 Running deployment coordinator...${NC}"
node deployment-coordinator.js

# Return to original directory
cd -

echo -e "${GREEN}✅ Project preparation for Vercel completed!${NC}"
echo -e "${YELLOW}📝 Please follow the deployment instructions in VERCEL_DEPLOYMENT.md${NC}"
echo -e "${BLUE}======================================================${NC}"