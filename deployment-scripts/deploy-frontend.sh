#!/bin/bash
cd ../bug_dashboard
echo "Installing frontend dependencies..."
npm install
echo "Building frontend..."
npm run build
echo "Frontend build complete."
