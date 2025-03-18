#!/bin/bash
# deploy-to-vercel.sh - Script to prepare and deploy your app to Vercel
# Run this script from the project root

set -e  # Exit on any error

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Bug Hunt Platform Vercel Deployment Preparation ===${NC}"
echo -e "${YELLOW}This script will prepare your codebase for Vercel deployment${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install Git first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

# Create necessary Vercel configuration files
echo -e "${BLUE}Creating Vercel configuration files...${NC}"

# Frontend vercel.json
cat > bug_dashboard/vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { 
        "distDir": "dist",
        "buildCommand": "npm run build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF
echo -e "${GREEN}✓ Frontend vercel.json created${NC}"

# Backend vercel.json
cat > server/vercel.json << 'EOF'
{
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
}
EOF
echo -e "${GREEN}✓ Backend vercel.json created${NC}"

# Create sample .env files for guidance
echo -e "${BLUE}Creating sample .env files...${NC}"

# Frontend .env
cat > bug_dashboard/.env.example << 'EOF'
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
EOF
echo -e "${GREEN}✓ Frontend .env.example created${NC}"

# Backend .env
cat > server/.env.example << 'EOF'
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_secret_jwt_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
ADMIN_EMAIL=admin@example.com
BASE_URL=https://your-backend-url.vercel.app
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:5173
EOF
echo -e "${GREEN}✓ Backend .env.example created${NC}"

# Fix API URL template literals
echo -e "${BLUE}Fixing API URL references in code...${NC}"

# Function to find and replace in files
fix_api_urls() {
    find "$1" -type f -name "*.jsx" -exec sed -i 's/`API_BASE_URL + "\/\([^"]*\)"`/`${API_BASE_URL}\/\1`/g' {} \;
    find "$1" -type f -name "*.jsx" -exec sed -i 's/`API_BASE_URL + "\([^"]*\)"`/`${API_BASE_URL}\1`/g' {} \;
}

# Fix API URLs in frontend files
fix_api_urls "bug_dashboard/src"
echo -e "${GREEN}✓ API URL references fixed${NC}"

# Update frontend config.js to use environment variables
cat > bug_dashboard/src/assets/Componets/AdminDashboard/config.js << 'EOF'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
export default API_BASE_URL;
EOF
echo -e "${GREEN}✓ Frontend API config updated${NC}"

# Update CORS config in server.js
if grep -q "const allowedOrigins" server/server.js; then
    # Replace existing CORS config
    sed -i '/const allowedOrigins/,/app.use(cors/c\
const allowedOrigins = [\
  process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [],\
  "http://localhost:5173" // Keep for local development\
].flat();\
\
app.use(cors({\
  origin: function (origin, callback) {\
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {\
      callback(null, true);\
    } else {\
      callback(new Error("Not allowed by CORS"));\
    }\
  },\
  credentials: true\
}));' server/server.js
else
    echo -e "${YELLOW}⚠️ Could not locate CORS configuration in server.js. Please update manually.${NC}"
fi
echo -e "${GREEN}✓ CORS configuration updated${NC}"

# Install required dependencies
echo -e "${BLUE}Installing required dependencies...${NC}"

# Compression for backend
cd server
npm install compression --save
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Create deployment instructions
echo -e "${BLUE}Creating deployment documentation...${NC}"
cat > VERCEL_DEPLOYMENT.md << 'EOF'
# Vercel Deployment Guide

## Backend Deployment

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure the project:
   - Set the root directory to `server`
   - Set the build command to `npm install`
   - Set the output directory to `.`
4. Add Environment Variables:
   - MONGO_URI
   - JWT_SECRET
   - EMAIL_USER
   - EMAIL_PASS
   - ADMIN_EMAIL
   - BASE_URL (your Vercel-deployed backend URL)
   - ALLOWED_ORIGINS (your frontend URL)
5. Deploy

## Frontend Deployment

1. Create another new project on Vercel
2. Connect the same GitHub repository
3. Configure the project:
   - Set the root directory to `bug_dashboard`
   - Set the build command to `npm run build`
   - Set the output directory to `dist`
4. Add Environment Variables:
   - VITE_API_BASE_URL (your deployed backend URL with /api, e.g., https://your-backend.vercel.app/api)
5. Deploy

## After Deployment

1. Update your frontend's `.env` file with the actual deployed backend URL
2. Update your backend's allowed origins in the environment variables with the actual deployed frontend URL
3. Redeploy both projects if needed

## Testing

After deployment, verify the following:
- User authentication (login/registration)
- File uploads and downloads
- Data retrieval from MongoDB
- All API routes functioning correctly
EOF
echo -e "${GREEN}✓ Deployment documentation created${NC}"

echo -e "${BLUE}=== Preparation Complete ===${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Review the VERCEL_DEPLOYMENT.md file for detailed deployment instructions"
echo -e "2. Create appropriate .env files based on the examples"
echo -e "3. Test your application locally before deploying"
echo -e "4. Deploy your application following the documentation"