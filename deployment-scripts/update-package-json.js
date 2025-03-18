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
