# 🚀 VisaFill AI - Serverless Backend Deployment Guide

Deploy your own 100% free serverless proxy in less than 3 minutes.
Once deployed, **users of your extension will NEVER need to enter any Gemini API Key**!

---

## ⚡ Option 1: Cloudflare Workers (Recommended, 100,000 requests/day FREE)

### Method A: Automated GitHub Actions (Auto-Deploy on `git push`)
Every time you push changes to GitHub, GitHub Actions will automatically deploy your worker to Cloudflare!

1. Open your repository on GitHub: `https://github.com/arfanshakil14ok/sk-visa-auto-fill`
2. Go to **Settings** -> **Secrets and variables** -> **Actions** -> Click **"New repository secret"**.
3. Add the following repository secrets:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API Token (from [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) with **Edit Cloudflare Workers** template).
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID (visible on Cloudflare Dashboard right sidebar under Workers & Pages).
   - `GEMINI_API_KEY`: Your Google Gemini API Key (`AIzaSy...`).
4. Whenever you `git push`, the `.github/workflows/deploy-cloudflare.yml` workflow will automatically build and deploy!

---

### Method B: 1-Click Local Auto Deployment (PowerShell)
Run the auto-deployment script in your terminal:
```powershell
cd backend-proxy
.\auto-deploy.ps1
```
The script will:
- Check Cloudflare login (opens browser if needed)
- Ask for your `GEMINI_API_KEY` and securely encrypt it in Cloudflare
- Deploy the worker and give you your live URL!

---

### Method C: Manual Terminal Commands
```bash
cd backend-proxy
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
```

---

### Method D: Via Web Browser (No Terminal Needed)
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com/) and create a free account (or log in).
2. On the left sidebar, click **Compute (Workers & Pages)** -> **Create application** -> **Create Worker**.
3. Name it `visafill-proxy` and click **Deploy**.
4. Click **Edit code**:
   - Delete all existing code in the editor.
   - Paste the contents of `backend-proxy/cloudflare-worker.js`.
   - Click **Save and deploy**.
5. Set your secret Gemini API Key:
   - Go to your Worker's **Settings** tab -> **Variables and Secrets**.
   - Click **Add variable** / **Add secret**.
   - Variable name: `GEMINI_API_KEY`
   - Value: `<Your Gemini API Key>`
   - Click **Encrypt** and **Save**.
6. Done! Copy your worker URL (e.g. `https://visafill-proxy.yourname.workers.dev`).

---

## 🌐 Option 2: Deploy with Vercel (Alternative)

1. Go to [vercel.com](https://vercel.com/) and import your GitHub repository: `arfanshakil14ok/sk-visa-auto-fill`.
2. Under **Root Directory**, specify `backend-proxy` (or let it auto-detect).
3. In **Environment Variables**, add:
   - `GEMINI_API_KEY` = `<Your Gemini API Key>`
4. Click **Deploy**.
5. Your endpoint will be: `https://your-project.vercel.app/api/extract`.
