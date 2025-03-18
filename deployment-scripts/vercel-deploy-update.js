#!/usr/bin/env node
// Vercel Deployment Preparation Script with Import Path Correction

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Vercel Deployment Preparation');

// Directories
const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'bug_dashboard');
const BACKEND_DIR = path.join(ROOT_DIR, 'server');

// Utility Functions
function findFiles(dir, fileTypes = ['.js', '.jsx'], ignoreDirs = ['node_modules', '.git', 'dist']) {
  const fileList = [];
  
  function traverseDir(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory() && !ignoreDirs.includes(entry.name)) {
        traverseDir(fullPath);
      } else if (entry.isFile() && fileTypes.some(type => fullPath.endsWith(type))) {
        fileList.push(fullPath);
      }
    }
  }
  
  traverseDir(dir);
  return fileList;
}

// Path Correction Function
function correctImportPaths(files) {
  const pathMappings = [
    {
      from: '../Admin Dashboard/config',
      to: '../../assets/Componets/Admin Dashboard/config'
    },
    {
      from: './Admin Dashboard/config',
      to: '../assets/Componets/Admin Dashboard/config'
    }
  ];

  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      pathMappings.forEach(mapping => {
        const importRegex = new RegExp(`from ['"]${mapping.from}['"]`, 'g');
        if (importRegex.test(content)) {
          content = content.replace(importRegex, `from '${mapping.to}'`);
          modified = true;
          console.log(`🔧 Updated import in ${file}: ${mapping.from} → ${mapping.to}`);
        }
      });

      if (modified) {
        fs.writeFileSync(file, content);
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  });
}

// Main Deployment Preparation
function prepareDeployment() {
  console.log('📂 Preparing Frontend');
  
  // Find all JS/JSX files in frontend src
  const frontendFiles = findFiles(path.join(FRONTEND_DIR, 'src'));
  
  // Correct import paths
  correctImportPaths(frontendFiles);

  // Create Vercel Config
  const vercelConfig = {
    version: 2,
    builds: [
      {
        src: 'package.json',
        use: '@vercel/static-build',
        config: { distDir: 'dist' }
      }
    ],
    routes: [
      {
        src: '/(.*)',
        dest: '/index.html'
      }
    ]
  };

  fs.writeFileSync(
    path.join(FRONTEND_DIR, 'vercel.json'), 
    JSON.stringify(vercelConfig, null, 2)
  );

  // Update .env for frontend
  const frontendEnv = `VITE_API_BASE_URL=https://your-backend-url.vercel.app/api`;
  fs.writeFileSync(
    path.join(FRONTEND_DIR, '.env'), 
    frontendEnv
  );

  console.log('✅ Frontend Deployment Preparation Complete');
}

// Execute
try {
  prepareDeployment();
  console.log('🎉 Deployment Preparation Successful');
} catch (error) {
  console.error('❌ Deployment Preparation Failed:', error);
  process.exit(1);
}