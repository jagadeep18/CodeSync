# Google OAuth Environment Setup Script for Vercel (PowerShell)
# This script helps you set up environment variables in Vercel

Write-Host "🔐 Google OAuth Environment Setup for Vercel" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI is not installed." -ForegroundColor Red
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm i -g vercel
    Write-Host ""
}

Write-Host "✅ Vercel CLI is installed" -ForegroundColor Green
Write-Host ""

# Login to Vercel
Write-Host "🔑 Logging in to Vercel..." -ForegroundColor Yellow
vercel login

Write-Host ""
Write-Host "📝 Setting up environment variables..." -ForegroundColor Yellow
Write-Host ""

# Get user input
$BACKEND_URL = Read-Host "Enter your Render backend URL (e.g., https://dev-hub-backend-latest.onrender.com)"
$GOOGLE_CLIENT_ID = Read-Host "Enter your Google Client ID"

# Validate inputs
if ([string]::IsNullOrWhiteSpace($BACKEND_URL) -or [string]::IsNullOrWhiteSpace($GOOGLE_CLIENT_ID)) {
    Write-Host "❌ Error: Backend URL and Google Client ID are required" -ForegroundColor Red
    exit 1
}

# Remove trailing slash from backend URL if present
$BACKEND_URL = $BACKEND_URL.TrimEnd('/')

Write-Host ""
Write-Host "🚀 Adding environment variables to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Function to add environment variable
function Add-VercelEnv {
    param (
        [string]$Name,
        [string]$Value,
        [string]$Environment
    )
    
    Write-Host "Adding $Name to $Environment..." -ForegroundColor Gray
    $Value | vercel env add $Name $Environment
}

# Add VITE_API_URL
Write-Host "Adding VITE_API_URL..." -ForegroundColor Yellow
Add-VercelEnv -Name "VITE_API_URL" -Value $BACKEND_URL -Environment "production"
Add-VercelEnv -Name "VITE_API_URL" -Value $BACKEND_URL -Environment "preview"
Add-VercelEnv -Name "VITE_API_URL" -Value $BACKEND_URL -Environment "development"

# Add VITE_BACKEND_URL
Write-Host "Adding VITE_BACKEND_URL..." -ForegroundColor Yellow
Add-VercelEnv -Name "VITE_BACKEND_URL" -Value $BACKEND_URL -Environment "production"
Add-VercelEnv -Name "VITE_BACKEND_URL" -Value $BACKEND_URL -Environment "preview"
Add-VercelEnv -Name "VITE_BACKEND_URL" -Value $BACKEND_URL -Environment "development"

# Add VITE_GOOGLE_CLIENT_ID
Write-Host "Adding VITE_GOOGLE_CLIENT_ID..." -ForegroundColor Yellow
Add-VercelEnv -Name "VITE_GOOGLE_CLIENT_ID" -Value $GOOGLE_CLIENT_ID -Environment "production"
Add-VercelEnv -Name "VITE_GOOGLE_CLIENT_ID" -Value $GOOGLE_CLIENT_ID -Environment "preview"
Add-VercelEnv -Name "VITE_GOOGLE_CLIENT_ID" -Value $GOOGLE_CLIENT_ID -Environment "development"

Write-Host ""
Write-Host "✅ Environment variables added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  VITE_API_URL: $BACKEND_URL" -ForegroundColor White
Write-Host "  VITE_BACKEND_URL: $BACKEND_URL" -ForegroundColor White
Write-Host "  VITE_GOOGLE_CLIENT_ID: $($GOOGLE_CLIENT_ID.Substring(0, [Math]::Min(20, $GOOGLE_CLIENT_ID.Length)))..." -ForegroundColor White
Write-Host ""
Write-Host "🔄 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Redeploy your Vercel app to apply the changes" -ForegroundColor White
Write-Host "  2. Verify environment variables in Vercel Dashboard" -ForegroundColor White
Write-Host "  3. Test Google OAuth login" -ForegroundColor White
Write-Host ""
Write-Host "To redeploy, run:" -ForegroundColor Yellow
Write-Host "  vercel --prod" -ForegroundColor White
Write-Host ""
