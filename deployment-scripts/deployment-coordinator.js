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
