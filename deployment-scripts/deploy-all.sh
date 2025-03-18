#!/bin/bash
echo "🚀 Starting full deployment preparation..."
node deployment-coordinator.js
./deploy-frontend.sh
./deploy-backend.sh
echo "✅ Deployment preparation complete."
echo "🔍 Now commit your changes and deploy to Vercel following the instructions in VERCEL_DEPLOYMENT.md."
