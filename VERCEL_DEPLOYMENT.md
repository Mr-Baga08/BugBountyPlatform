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
