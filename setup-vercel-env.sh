#!/bin/bash
# Vercel Environment Variables Setup Script
# This script helps you set environment variables for your Vercel deployment

echo "🚀 Setting up Vercel Environment Variables for Dev-Hub"
echo "======================================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is ready"
echo ""

# Login to Vercel
echo "🔐 Logging in to Vercel..."
vercel login

echo ""
echo "📝 Adding environment variables..."
echo ""

# Add VITE_API_URL
echo "1️⃣ Adding VITE_API_URL..."
echo "https://dev-hub-backend-latest.onrender.com" | vercel env add VITE_API_URL production
echo "https://dev-hub-backend-latest.onrender.com" | vercel env add VITE_API_URL preview
echo "http://localhost:3000" | vercel env add VITE_API_URL development

# Add VITE_BACKEND_URL
echo "2️⃣ Adding VITE_BACKEND_URL..."
echo "https://dev-hub-backend-latest.onrender.com" | vercel env add VITE_BACKEND_URL production
echo "https://dev-hub-backend-latest.onrender.com" | vercel env add VITE_BACKEND_URL preview
echo "http://localhost:3000" | vercel env add VITE_BACKEND_URL development

# Add VITE_GOOGLE_CLIENT_ID
echo "3️⃣ Adding VITE_GOOGLE_CLIENT_ID..."
echo "208639535162-eqmptcuar53i9oh39uqmhs35vlkobhe0.apps.googleusercontent.com" | vercel env add VITE_GOOGLE_CLIENT_ID production
echo "208639535162-eqmptcuar53i9oh39uqmhs35vlkobhe0.apps.googleusercontent.com" | vercel env add VITE_GOOGLE_CLIENT_ID preview
echo "208639535162-eqmptcuar53i9oh39uqmhs35vlkobhe0.apps.googleusercontent.com" | vercel env add VITE_GOOGLE_CLIENT_ID development

echo ""
echo "✅ All environment variables have been added!"
echo ""
echo "🔄 Next steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your project: dev-hub-delta-lyart"
echo "3. Go to Deployments and click 'Redeploy' on the latest deployment"
echo ""
echo "🎉 Your frontend should now connect to the backend successfully!"
