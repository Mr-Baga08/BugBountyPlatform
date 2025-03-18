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
