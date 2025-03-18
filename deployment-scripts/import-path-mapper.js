// import-path-mapper.js
// Comprehensive import path correction script for Bug Dashboard project

const fs = require('fs');
const path = require('path');

class ImportPathMapper {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.pathMappings = [
      // Admin Dashboard Config
      {
        from: [
          '../Admin Dashboard/config',
          '../../Admin Dashboard/config',
          './Admin Dashboard/config',
          '../Componets/Admin Dashboard/config'
        ],
        to: '../../assets/Componets/Admin Dashboard/config'
      },
      // React Router imports
      {
        from: [
          'react-router',
          'react-router-dom/dist/react-router'
        ],
        to: 'react-router-dom'
      },
      // Lucide React icons
      {
        from: [
          'lucide-icons',
          'lucide/react'
        ],
        to: 'lucide-react'
      },
      // Axios imports
      {
        from: [
          'axios/dist/axios',
          './axios'
        ],
        to: 'axios'
      }
    ];

    // Specific component path corrections
    this.componentPathCorrections = [
      {
        searchPath: '/src/App/Common/Container/',
        modifications: [
          {
            file: 'TaskDisplay/TaskDisplayView.jsx',
            importCorrections: [
              {
                from: '../Admin Dashboard/config',
                to: '../../assets/Componets/Admin Dashboard/config'
              }
            ]
          }
        ]
      }
    ];
  }

  // Recursively find files
  findFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Ignore certain directories
        const ignoredDirs = [
          'node_modules', 
          '.git', 
          'dist', 
          'build', 
          '.vercel', 
          '.next'
        ];

        if (!ignoredDirs.includes(file)) {
          this.findFiles(filePath, fileList);
        }
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  // Correct import paths
  correctImportPaths(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Check and correct import paths
      this.pathMappings.forEach(mapping => {
        mapping.from.forEach(fromPath => {
          const importRegex = new RegExp(`from ['"]${this.escapeRegExp(fromPath)}['"]`, 'g');
          if (importRegex.test(content)) {
            content = content.replace(
              importRegex, 
              `from '${mapping.to}'`
            );
            modified = true;
            console.log(`📝 Updated import in ${filePath}: ${fromPath} → ${mapping.to}`);
          }
        });
      });

      // Write back if modified
      if (modified) {
        fs.writeFileSync(filePath, content);
      }

      return modified;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error);
      return false;
    }
  }

  // Escape special characters for regex
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Perform specific component path corrections
  applyComponentPathCorrections() {
    this.componentPathCorrections.forEach(correction => {
      const fullSearchPath = path.join(this.rootDir, correction.searchPath);
      
      if (fs.existsSync(fullSearchPath)) {
        correction.modifications.forEach(mod => {
          const fullFilePath = path.join(fullSearchPath, mod.file);
          
          if (fs.existsSync(fullFilePath)) {
            let content = fs.readFileSync(fullFilePath, 'utf8');
            let modified = false;

            mod.importCorrections.forEach(importCorrection => {
              const importRegex = new RegExp(`from ['"]${this.escapeRegExp(importCorrection.from)}['"]`, 'g');
              if (importRegex.test(content)) {
                content = content.replace(
                  importRegex, 
                  `from '${importCorrection.to}'`
                );
                modified = true;
                console.log(`🔧 Corrected component import in ${fullFilePath}: ${importCorrection.from} → ${importCorrection.to}`);
              }
            });

            if (modified) {
              fs.writeFileSync(fullFilePath, content);
            }
          }
        });
      }
    });
  }

  // Main execution method
  run() {
    console.log('🚀 Starting Import Path Mapper');
    
    // Find all JS/JSX files
    const files = this.findFiles(path.join(this.rootDir, 'src'));
    
    console.log(`📂 Found ${files.length} files to process`);
    
    // Track modified files
    const modifiedFiles = [];

    // Process each file
    files.forEach(file => {
      if (this.correctImportPaths(file)) {
        modifiedFiles.push(file);
      }
    });

    // Apply specific component path corrections
    this.applyComponentPathCorrections();

    console.log('✅ Import Path Mapping Complete');
    console.log(`📝 Modified ${modifiedFiles.length} files`);
    
    return modifiedFiles;
  }
}

// Usage
const rootDir = path.resolve(__dirname, '..');
const mapper = new ImportPathMapper(rootDir);
mapper.run();