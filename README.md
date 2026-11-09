# 🛂 VisaFill AI - Chrome Extension (Manifest V3)

An intelligent Visa Application Auto-Filler Chrome Extension that extracts data from passport scans/photos using Google Gemini AI and automatically detects & fills official visa application forms.

---

## 📁 Project Structure

```
visa-autofill-extension/
├── manifest.json              # Extension Manifest V3 configuration
├── background.js              # Service worker handling side panel behavior
├── icons/                     # Extension icons (16px, 48px, 128px)
├── sidepanel/
│   ├── sidepanel.html         # Modern Side Panel UI
│   ├── sidepanel.css          # Sleek responsive styles
│   └── sidepanel.js           # Gemini Vision API OCR, file uploads & profile manager
├── content/
│   ├── content.js             # Heuristic field detection & form auto-fill engine
│   └── content.css            # Field highlight effects & floating toast notifications
└── test-form/
    └── dummy-visa-form.html   # Standalone visa application test portal
```

---

## 🚀 How to Install and Run in Google Chrome

### Step 1: Open Chrome Extensions
1. Open Google Chrome.
2. In the address bar, type `chrome://extensions` and press **Enter**.
3. Toggle on **Developer mode** (top-right corner).

### Step 2: Load Unpacked Extension
1. Click the **"Load unpacked"** button (top-left).
2. Browse and select the project folder:
   `C:\Users\arfan\.gemini\antigravity\scratch\visa-autofill-extension`
3. You will see **VisaFill AI - Passport Auto-Filler** appear in your extensions list!

### Step 3: Test with the Included Demo Form
1. In Chrome, press `Ctrl + O` and open the file:
   `C:\Users\arfan\.gemini\antigravity\scratch\visa-autofill-extension\test-form\dummy-visa-form.html`
2. Click the **VisaFill AI** icon in your Chrome toolbar (or open Chrome Side Panel and switch to VisaFill AI).
3. You can either:
   - Enter your **Gemini API Key** in Settings (⚙️) and upload any real passport photo to extract details instantly.
   - Or manually fill in some fields (Name, Passport Number, DOB, etc.) in the Side Panel to test.
4. Click **"🚀 Auto-Fill Active Form"**.
5. Watch the demo visa form automatically populate with glowing green highlights and a success notification!

---

## 🔑 How to Get a Free Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **"Get API key"** -> **"Create API key"**.
3. In the VisaFill extension side panel, click **⚙️ Settings**, paste your key, and click **Save**.
# visa-auto-fill
