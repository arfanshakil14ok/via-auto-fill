# =====================================================================
# VisaFill AI - Automated Cloudflare Worker Deployment via API Token
# =====================================================================

param(
    [string]$ApiToken,
    [string]$GeminiKey
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   🚀 VisaFill AI - Cloudflare Token Auto-Deployer       " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Check or prompt for Cloudflare API Token
if (-not $ApiToken -or $ApiToken.Trim() -eq "") {
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^\s*CLOUDFLARE_API_TOKEN\s*=\s*(.+)$") {
                $ApiToken = $matches[1].Trim().Trim('"').Trim("'")
            }
            if ($_ -match "^\s*GEMINI_API_KEY\s*=\s*(.+)$") {
                $GeminiKey = $matches[1].Trim().Trim('"').Trim("'")
            }
        }
    }
}

if (-not $ApiToken -or $ApiToken.Trim() -eq "") {
    $ApiToken = Read-Host "👉 Enter your Cloudflare API Token"
}

if (-not $ApiToken -or $ApiToken.Trim() -eq "") {
    Write-Host "❌ Error: Cloudflare API Token is required!" -ForegroundColor Red
    Exit 1
}

$ApiToken = $ApiToken.Trim()
$env:CLOUDFLARE_API_TOKEN = $ApiToken

# 2. Automatically verify token and fetch Account ID
Write-Host "`n[1/4] 🔍 Verifying Cloudflare Token and fetching Account ID..." -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $ApiToken"
        "Content-Type"  = "application/json"
    }
    $accountsResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts" -Method Get -Headers $headers -ErrorAction Stop
    
    if (-not $accountsResponse.success -or $accountsResponse.result.Count -eq 0) {
        Write-Host "❌ Error: Cloudflare token verification failed or no account found." -ForegroundColor Red
        Exit 1
    }

    $accountId = $accountsResponse.result[0].id
    $accountName = $accountsResponse.result[0].name
    $env:CLOUDFLARE_ACCOUNT_ID = $accountId
    Write-Host "✅ Connected to Cloudflare Account: $accountName (ID: $accountId)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error connecting to Cloudflare API: $_" -ForegroundColor Red
    Exit 1
}

# 3. Check or prompt for Gemini API Key
Write-Host "`n[2/4] 🔑 Checking Gemini API Key..." -ForegroundColor Cyan
if (-not $GeminiKey -or $GeminiKey.Trim() -eq "") {
    $GeminiKey = Read-Host "👉 Enter your Google Gemini API Key (starts with AIzaSy...)"
}

if ($GeminiKey -and $GeminiKey.Trim() -ne "") {
    $GeminiKey = $GeminiKey.Trim()
    Write-Host "Saving GEMINI_API_KEY secret to Cloudflare..." -ForegroundColor Yellow
    $GeminiKey | npx wrangler secret put GEMINI_API_KEY
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ GEMINI_API_KEY secret configured in Cloudflare!" -ForegroundColor Green
    }
}

# 4. Deploy the Worker
Write-Host "`n[3/4] 🚀 Deploying Worker to Cloudflare..." -ForegroundColor Cyan
$deployOutput = npx wrangler deploy 2>&1
$deployOutputStr = $deployOutput -join "`n"
Write-Host $deployOutputStr

# Extract deployed URL (e.g., https://visafill-proxy.<subdomain>.workers.dev)
$deployedUrl = ""
if ($deployOutputStr -match "(https://[a-zA-Z0-9\-\._]+\.workers\.dev)") {
    $deployedUrl = $matches[1]
}

if ($deployedUrl) {
    Write-Host "`n[4/4] ⚡ Auto-configuring Extension with deployed URL..." -ForegroundColor Cyan
    Write-Host "Deployed Live URL: $deployedUrl" -ForegroundColor Green

    # Automatically update sidepanel.js DEFAULT_CLOUD_PROXY_URL
    $sidepanelPath = Resolve-Path "$scriptDir\..\sidepanel\sidepanel.js"
    if (Test-Path $sidepanelPath) {
        $content = Get-Content $sidepanelPath -Raw
        $updated = $content -replace 'const DEFAULT_CLOUD_PROXY_URL = ".*?";', "const DEFAULT_CLOUD_PROXY_URL = `"$deployedUrl`";"
        Set-Content -Path $sidepanelPath -Value $updated -NoNewline
        Write-Host "✅ Extension updated! $deployedUrl is now set as the default backend." -ForegroundColor Green
    }

    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "   🎉 ALL SETUP COMPLETE!                                " -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "Your extension now works 100% out of the box with NO API key needed for users!" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ Could not automatically detect worker URL from output. Please check the logs above." -ForegroundColor Yellow
}
