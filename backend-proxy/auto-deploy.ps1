# =====================================================================
# VisaFill AI - Cloudflare Worker 1-Click Auto Configuration & Deploy
# =====================================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   🚀 VisaFill AI - Cloudflare Worker Auto Config       " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Ensure we are in backend-proxy folder
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 2. Check Node.js and NPM
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Node.js and npm are required. Please install from https://nodejs.org" -ForegroundColor Red
    Exit 1
}

# 3. Check Wrangler Login Status
Write-Host "`n[1/3] 🔐 Checking Cloudflare authentication..." -ForegroundColor Cyan
$whoami = npx --yes wrangler whoami 2>&1
if ($LASTEXITCODE -ne 0 -or $whoami -match "not authenticated|logged out|Error") {
    Write-Host "👉 Please log in to your Cloudflare account in the opened browser window..." -ForegroundColor Yellow
    npx --yes wrangler login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Cloudflare login failed or was cancelled." -ForegroundColor Red
        Exit 1
    }
} else {
    Write-Host "✅ Already authenticated with Cloudflare!" -ForegroundColor Green
}

# 4. Set Gemini API Key Secret
Write-Host "`n[2/3] 🔑 Cloudflare Secret Configuration (GEMINI_API_KEY)..." -ForegroundColor Cyan
$apiKey = Read-Host "Enter your Google Gemini API Key (starts with AIzaSy... or press Enter if already set in Cloudflare)"

if ($apiKey -and $apiKey.Trim() -ne "") {
    Write-Host "Saving GEMINI_API_KEY secret to Cloudflare..." -ForegroundColor Yellow
    $apiKey.Trim() | npx --yes wrangler secret put GEMINI_API_KEY
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Secret GEMINI_API_KEY stored securely in Cloudflare!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Warning: Failed to set secret. You can set it in the Cloudflare Dashboard under Worker Settings." -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️ Skipping secret update. Assuming GEMINI_API_KEY is already set." -ForegroundColor Gray
}

# 5. Deploy Worker
Write-Host "`n[3/3] 🚀 Deploying Worker to Cloudflare..." -ForegroundColor Cyan
npx --yes wrangler deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "   🎉 DEPLOYMENT COMPLETE!                               " -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "Copy the deployed URL above (e.g. https://visafill-proxy.<username>.workers.dev)"
    Write-Host "and paste it into the VisaFill Extension Settings (⚙️) -> Production Cloud Backend URL.`n"
} else {
    Write-Host "`n❌ Deployment failed. Check the logs above." -ForegroundColor Red
}
