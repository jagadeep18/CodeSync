#!/bin/bash

# Google OAuth Environment Setup Script for Vercel
# This script helps you set up environment variables in Vercel

echo "🔐 Google OAuth Environment Setup for Vercel"
echo "=============================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

echo "✅ Vercel CLI is installed"
echo ""

# Login to Vercel
echo "🔑 Logging in to Vercel..."
vercel login

echo ""
echo "📝 Setting up environment variables..."
echo ""

# Get user input
read -p "Enter your Render backend URL (e.g., https://dev-hub-backend-latest.onrender.com): " BACKEND_URL
read -p "Enter your Google Client ID: " GOOGLE_CLIENT_ID

# Validate inputs
if [ -z "$BACKEND_URL" ] || [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "❌ Error: Backend URL and Google Client ID are required"
    exit 1
fi

# Remove trailing slash from backend URL if present
BACKEND_URL="${BACKEND_URL%/}"

echo ""
echo "🚀 Adding environment variables to Vercel..."
echo ""

# Add VITE_API_URL
echo "Adding VITE_API_URL..."
echo "$BACKEND_URL" | vercel env add VITE_API_URL production
echo "$BACKEND_URL" | vercel env add VITE_API_URL preview
echo "$BACKEND_URL" | vercel env add VITE_API_URL development

# Add VITE_BACKEND_URL
echo "Adding VITE_BACKEND_URL..."
echo "$BACKEND_URL" | vercel env add VITE_BACKEND_URL production
echo "$BACKEND_URL" | vercel env add VITE_BACKEND_URL preview
echo "$BACKEND_URL" | vercel env add VITE_BACKEND_URL development

# Add VITE_GOOGLE_CLIENT_ID
echo "Adding VITE_GOOGLE_CLIENT_ID..."
echo "$GOOGLE_CLIENT_ID" | vercel env add VITE_GOOGLE_CLIENT_ID production
echo "$GOOGLE_CLIENT_ID" | vercel env add VITE_GOOGLE_CLIENT_ID preview
echo "$GOOGLE_CLIENT_ID" | vercel env add VITE_GOOGLE_CLIENT_ID development

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "📋 Summary:"
echo "  VITE_API_URL: $BACKEND_URL"
echo "  VITE_BACKEND_URL: $BACKEND_URL"
echo "  VITE_GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo ""
echo "🔄 Next steps:"
echo "  1. Redeploy your Vercel app to apply the changes"
echo "  2. Verify environment variables in Vercel Dashboard"
echo "  3. Test Google OAuth login"
echo ""
echo "To redeploy, run:"
echo "  vercel --prod"
echo ""
