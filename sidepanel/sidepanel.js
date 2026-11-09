// Universal Pro Suite Logic for VisaFill AI

// Default Cloudflare Worker Proxy URL (Auto-used if no custom URL or key is entered)
const DEFAULT_CLOUD_PROXY_URL = "";

const elements = {
  // Navigation
  mainNavTabs: document.querySelectorAll('.nav-tab'),
  mainNavContents: document.querySelectorAll('.nav-content'),

  // Settings
  settingsBtn: document.getElementById('settingsBtn'),
  settingsSection: document.getElementById('settingsSection'),
  proxyUrl: document.getElementById('proxyUrl'),
  saveProxyUrlBtn: document.getElementById('saveProxyUrlBtn'),
  apiKey: document.getElementById('apiKey'),
  saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
  activeEngineBadge: document.getElementById('activeEngineBadge'),
  toggleFloatingBtn: document.getElementById('toggleFloatingBtn'),
  toggleSitePresets: document.getElementById('toggleSitePresets'),

  // Extraction Mode
  extractModeRadios: document.querySelectorAll('input[name="extractMode"]'),
  radioPills: document.querySelectorAll('.radio-pill'),
  aiUploadArea: document.getElementById('aiUploadArea'),
  mrzArea: document.getElementById('mrzArea'),
  mrzInput: document.getElementById('mrzInput'),
  parseMrzBtn: document.getElementById('parseMrzBtn'),

  // Profile Selector
  savedProfiles: document.getElementById('savedProfiles'),

  // Unified Single Upload Box (Image or PDF)
  passportFile: document.getElementById('passportFile'),
  passportPlaceholder: document.getElementById('passportPlaceholder'),
  passportPreviewContainer: document.getElementById('passportPreviewContainer'),
  passportImgPreview: document.getElementById('passportImgPreview'),
  passportPdfPreview: document.getElementById('passportPdfPreview'),
  pdfFileName: document.getElementById('pdfFileName'),
  pdfFileSize: document.getElementById('pdfFileSize'),
  removePassportBtn: document.getElementById('removePassportBtn'),

  extractBtn: document.getElementById('extractBtn'),
  extractSpinner: document.getElementById('extractSpinner'),
  dataStatusBadge: document.getElementById('dataStatusBadge'),

  // Form Details
  detailsForm: document.getElementById('detailsForm'),
  saveProfileBtn: document.getElementById('saveProfileBtn'),
  clearFormBtn: document.getElementById('clearFormBtn'),

  // Auto-Fill Actions
  autofillBtn: document.getElementById('autofillBtn'),
  fillSummary: document.getElementById('fillSummary'),
  fillSummaryText: document.getElementById('fillSummaryText'),

  // Photo Tool
  photoPreset: document.getElementById('photoPreset'),
  photoInput: document.getElementById('photoInput'),
  photoDropZone: document.getElementById('photoDropZone'),
  photoPlaceholder: document.getElementById('photoPlaceholder'),
  photoEditorArea: document.getElementById('photoEditorArea'),
  photoCanvas: document.getElementById('photoCanvas'),
  photoZoom: document.getElementById('photoZoom'),
  downloadPhotoBtn: document.getElementById('downloadPhotoBtn'),
  photoSizeFeedback: document.getElementById('photoSizeFeedback'),

  // Agency Tools
  csvFileInput: document.getElementById('csvFileInput'),
  importCsvBtn: document.getElementById('importCsvBtn'),
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  downloadTemplateBtn: document.getElementById('downloadTemplateBtn'),
  profileCountDisplay: document.getElementById('profileCountDisplay'),
  deleteAllProfilesBtn: document.getElementById('deleteAllProfilesBtn'),
  agencyProfilesList: document.getElementById('agencyProfilesList')
};

let uploadedBase64 = null;
let uploadedMimeType = null;
let uploadedFileName = null;

// Photo Editor State
let photoImg = null;
let photoScale = 1;
let photoPanX = 0;
let photoPanY = 0;
let isDraggingPhoto = false;
let startDragX = 0;
let startDragY = 0;

// Photo Preset Specs
const PHOTO_SPECS = {
  us_india: { width: 600, height: 600, maxKb: 240, label: "US / India 2x2 in" },
  schengen: { width: 413, height: 531, maxKb: 300, label: "Schengen 35x45 mm" },
  uk: { width: 413, height: 531, maxKb: 300, label: "UK Visa 35x45 mm" },
  malaysia: { width: 413, height: 590, maxKb: 300, label: "Malaysia 35x50 mm" },
  china: { width: 390, height: 567, maxKb: 300, label: "China 33x48 mm" }
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  setupMainNav();
  setupSubTabs();
  setupEventListeners();
  setupPhotoEditor();
  await loadSettings();
  await loadProfilesList();
  await refreshAgencyList();
});

// Main Top Navigation
function setupMainNav() {
  elements.mainNavTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.mainNavTabs.forEach(t => t.classList.remove('active'));
      elements.mainNavContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.nav);
      if (target) target.classList.add('active');
    });
  });
}

// Sub Tabs in Details Form
function setupSubTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });
}

// Load Settings from storage
async function loadSettings() {
  const result = await chrome.storage.local.get(['geminiApiKey', 'proxyUrl', 'enableFloatingBtn', 'enableSitePresets', 'activeApplicant']);
  if (result.geminiApiKey) {
    elements.apiKey.value = result.geminiApiKey;
  }
  const effectiveProxy = result.proxyUrl || DEFAULT_CLOUD_PROXY_URL;
  if (effectiveProxy) {
    elements.proxyUrl.value = effectiveProxy;
  }
  elements.toggleFloatingBtn.checked = result.enableFloatingBtn !== false;
  elements.toggleSitePresets.checked = result.enableSitePresets !== false;

  updateEngineBadge(result.geminiApiKey, effectiveProxy);

  if (result.activeApplicant) {
    fillDetailsForm(result.activeApplicant);
  }
}

function updateEngineBadge(apiKey, proxyUrl) {
  const effectiveProxy = proxyUrl || DEFAULT_CLOUD_PROXY_URL;
  if (apiKey) {
    elements.activeEngineBadge.textContent = "Personal Key 🔑";
    elements.activeEngineBadge.style.color = "#2563eb";
  } else if (effectiveProxy) {
    elements.activeEngineBadge.textContent = "Cloud Backend ⚡";
    elements.activeEngineBadge.style.color = "#059669";
  } else {
    elements.activeEngineBadge.textContent = "Needs Config ⚠️";
    elements.activeEngineBadge.style.color = "#d97706";
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Settings toggle
  elements.settingsBtn.addEventListener('click', () => {
    elements.settingsSection.classList.toggle('hidden');
  });

  elements.saveProxyUrlBtn.addEventListener('click', async () => {
    const url = elements.proxyUrl.value.trim().replace(/\/+$/, '');
    await chrome.storage.local.set({ proxyUrl: url });
    const { geminiApiKey } = await chrome.storage.local.get(['geminiApiKey']);
    updateEngineBadge(geminiApiKey, url);
    alert('Production Cloud Backend URL saved!');
    elements.settingsSection.classList.add('hidden');
  });

  elements.saveApiKeyBtn.addEventListener('click', async () => {
    const key = elements.apiKey.value.trim();
    await chrome.storage.local.set({ geminiApiKey: key });
    const { proxyUrl } = await chrome.storage.local.get(['proxyUrl']);
    updateEngineBadge(key, proxyUrl);
    alert('Settings saved successfully!');
    elements.settingsSection.classList.add('hidden');
  });

  elements.toggleFloatingBtn.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ enableFloatingBtn: e.target.checked });
  });

  elements.toggleSitePresets.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ enableSitePresets: e.target.checked });
  });

  // Extraction Mode Radio Switcher
  elements.extractModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      elements.radioPills.forEach(p => p.classList.remove('active'));
      e.target.closest('.radio-pill').classList.add('active');

      if (e.target.value === 'mrz') {
        elements.aiUploadArea.classList.add('hidden');
        elements.mrzArea.classList.remove('hidden');
      } else {
        elements.aiUploadArea.classList.remove('hidden');
        elements.mrzArea.classList.add('hidden');
      }
    });
  });

  // Offline MRZ Parsing
  elements.parseMrzBtn.addEventListener('click', handleOfflineMrzParse);

  // Unified Single Passport (Image or PDF) Upload Handlers
  elements.passportFile.addEventListener('change', handlePassportSelect);
  elements.removePassportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetPassportUpload();
  });

  // Extraction Button
  elements.extractBtn.addEventListener('click', extractPassportData);

  // Form Profile Actions
  elements.saveProfileBtn.addEventListener('click', saveCurrentProfile);
  elements.clearFormBtn.addEventListener('click', clearDetailsForm);

  elements.savedProfiles.addEventListener('change', async (e) => {
    if (e.target.value === 'new') {
      clearDetailsForm();
    } else {
      await loadProfile(e.target.value);
    }
  });

  // Auto-Fill Action
  elements.autofillBtn.addEventListener('click', triggerAutoFill);

  // Agency CSV Handlers
  elements.downloadTemplateBtn.addEventListener('click', downloadCsvTemplate);
  elements.importCsvBtn.addEventListener('click', importCsvProfiles);
  elements.exportCsvBtn.addEventListener('click', exportCsvProfiles);
  elements.deleteAllProfilesBtn.addEventListener('click', deleteAllProfiles);
}

// Single Upload Handler: Photo or PDF
function handlePassportSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  uploadedMimeType = file.type || 'image/jpeg';
  uploadedFileName = file.name;

  const reader = new FileReader();
  reader.onload = function(event) {
    uploadedBase64 = event.target.result;
    elements.passportPlaceholder.classList.add('hidden');
    elements.passportPreviewContainer.classList.remove('hidden');

    if (uploadedMimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      uploadedMimeType = 'application/pdf';
      elements.passportImgPreview.classList.add('hidden');
      elements.passportPdfPreview.classList.remove('hidden');
      elements.pdfFileName.textContent = file.name;
      elements.pdfFileSize.textContent = `${Math.round(file.size / 1024)} KB`;
    } else {
      elements.passportPdfPreview.classList.add('hidden');
      elements.passportImgPreview.src = uploadedBase64;
      elements.passportImgPreview.classList.remove('hidden');
    }

    elements.extractBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

function resetPassportUpload() {
  uploadedBase64 = null;
  uploadedMimeType = null;
  uploadedFileName = null;
  elements.passportFile.value = '';
  elements.passportPlaceholder.classList.remove('hidden');
  elements.passportPreviewContainer.classList.add('hidden');
  elements.passportImgPreview.classList.add('hidden');
  elements.passportPdfPreview.classList.add('hidden');
  elements.extractBtn.disabled = true;
}

// Passport Data Extraction (Hybrid: Direct Gemini or Cloud Backend Proxy)
async function extractPassportData() {
  const { geminiApiKey, proxyUrl } = await chrome.storage.local.get(['geminiApiKey', 'proxyUrl']);
  const effectiveProxy = proxyUrl || DEFAULT_CLOUD_PROXY_URL;
  
  if (!geminiApiKey && !effectiveProxy) {
    elements.settingsSection.classList.remove('hidden');
    alert('Please enter your Production Cloud Backend URL or personal Gemini API Key in the settings (⚙️).');
    return;
  }

  if (!uploadedBase64) {
    alert("Please upload a passport photo or PDF first!");
    return;
  }

  setExtractLoading(true);

  try {
    const parts = [
      {
        text: `You are an expert universal passport OCR and visa data extraction system.
Extract all details from the provided passport document (which may be a photo of the bio-page, an open spread showing both bio-page and back page, or a multi-page PDF document).
Extract all details with maximum precision:
- Given/First Name, Surname, Full Name
- Passport Number, Type, Date of Issue, Date of Expiry, Place/Authority of Issue
- Date of Birth (DD/MM/YYYY), Gender, Nationality, Country Code (ISO3), Place/District of Birth
- Marital Status, Occupation (if visible)
- Father's Name, Mother's Name, Spouse's Name (if available)
- National ID / NID number
- Permanent Address & Postal/ZIP code (if visible)

Format all dates strictly as DD/MM/YYYY.
Return ONLY valid JSON matching this schema without any markdown formatting or backticks:
{
  "givenName": "Given / First Name(s)",
  "surname": "Surname / Last Name",
  "fullName": "Full Name",
  "passportNumber": "Passport Number",
  "passportType": "ORDINARY or OFFICIAL or DIPLOMATIC",
  "nationality": "Nationality / Country (e.g. Bangladesh)",
  "countryCode": "ISO 3-letter Country Code (e.g. BGD)",
  "dob": "Date of Birth (DD/MM/YYYY)",
  "gender": "MALE or FEMALE or OTHER",
  "maritalStatus": "SINGLE or MARRIED or DIVORCED or WIDOWED",
  "occupation": "Occupation if visible or blank",
  "issueDate": "Date of Issue (DD/MM/YYYY)",
  "expiryDate": "Date of Expiry (DD/MM/YYYY)",
  "placeOfBirth": "Place / District of Birth",
  "issuePlace": "Issuing Authority or Place of Issue (e.g. DIP/Dhaka)",
  "fatherName": "Father's Full Name",
  "motherName": "Mother's Full Name",
  "spouseName": "Spouse's Name (if any)",
  "nid": "National ID / NID number",
  "postalCode": "Postal / ZIP code (if found in address)",
  "address": "Full Permanent Residential Address"
}`
      },
      {
        inline_data: {
          mime_type: uploadedMimeType,
          data: uploadedBase64.split(',')[1]
        }
      }
    ];

    let response;
    if (geminiApiKey) {
      // Direct call with personal key
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      });
    } else {
      // Production Cloud Proxy call (Users need NO API key!)
      const targetUrl = effectiveProxy.endsWith('/') ? effectiveProxy : `${effectiveProxy}/`;
      response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parts })
      });
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("No data returned by Gemini.");

    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    fillDetailsForm(parsedData);
    await chrome.storage.local.set({ activeApplicant: getDetailsFormData() });

    elements.dataStatusBadge.textContent = "Extracted ✨";
    elements.dataStatusBadge.style.color = "var(--success)";
  } catch (err) {
    console.error("Extraction error:", err);
    alert("Extraction failed: " + err.message);
  } finally {
    setExtractLoading(false);
  }
}

function setExtractLoading(isLoading) {
  elements.extractBtn.disabled = isLoading;
  if (isLoading) {
    elements.extractSpinner.classList.remove('hidden');
    elements.dataStatusBadge.textContent = "Extracting...";
  } else {
    elements.extractSpinner.classList.add('hidden');
  }
}

// ==============================================================
// FEATURE 1: VISA PHOTO RESIZER & SPEC CHECKER
// ==============================================================
function setupPhotoEditor() {
  elements.photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      photoImg = new Image();
      photoImg.onload = () => {
        elements.photoEditorArea.classList.remove('hidden');
        elements.photoPlaceholder.classList.add('hidden');
        resetPhotoCanvas();
      };
      photoImg.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  elements.photoPreset.addEventListener('change', () => {
    if (photoImg) resetPhotoCanvas();
  });

  elements.photoZoom.addEventListener('input', (e) => {
    photoScale = parseFloat(e.target.value);
    drawPhoto();
  });

  const canvas = elements.photoCanvas;
  canvas.addEventListener('mousedown', (e) => {
    isDraggingPhoto = true;
    startDragX = e.clientX - photoPanX;
    startDragY = e.clientY - photoPanY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingPhoto) return;
    photoPanX = e.clientX - startDragX;
    photoPanY = e.clientY - startDragY;
    drawPhoto();
  });

  window.addEventListener('mouseup', () => {
    isDraggingPhoto = false;
  });

  elements.downloadPhotoBtn.addEventListener('click', downloadCompliantPhoto);
}

function resetPhotoCanvas() {
  const spec = PHOTO_SPECS[elements.photoPreset.value] || PHOTO_SPECS.us_india;
  const canvas = elements.photoCanvas;

  canvas.width = spec.width;
  canvas.height = spec.height;

  const scale = Math.max(canvas.width / photoImg.width, canvas.height / photoImg.height);
  photoScale = scale;
  elements.photoZoom.value = scale;
  photoPanX = (canvas.width - photoImg.width * photoScale) / 2;
  photoPanY = (canvas.height - photoImg.height * photoScale) / 2;

  drawPhoto();
}

function drawPhoto() {
  if (!photoImg) return;
  const canvas = elements.photoCanvas;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    photoImg,
    photoPanX,
    photoPanY,
    photoImg.width * photoScale,
    photoImg.height * photoScale
  );
}

async function downloadCompliantPhoto() {
  if (!photoImg) return;
  const spec = PHOTO_SPECS[elements.photoPreset.value] || PHOTO_SPECS.us_india;
  const canvas = elements.photoCanvas;

  let quality = 0.95;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  let sizeKb = Math.round((dataUrl.length * (3 / 4)) / 1024);

  while (sizeKb > spec.maxKb && quality > 0.4) {
    quality -= 0.05;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    sizeKb = Math.round((dataUrl.length * (3 / 4)) / 1024);
  }

  elements.photoSizeFeedback.textContent = `Optimized: ${canvas.width}x${canvas.height} px, Size: ${sizeKb} KB (Max allowed: ${spec.maxKb} KB) ✅`;

  const link = document.createElement('a');
  link.download = `visa_photo_${spec.width}x${spec.height}.jpg`;
  link.href = dataUrl;
  link.click();
}

// ==============================================================
// FEATURE 2: OFFLINE MRZ PARSER (ICAO Doc 9303 TD3)
// ==============================================================
function handleOfflineMrzParse() {
  const text = elements.mrzInput.value.trim().toUpperCase();
  if (!text) {
    alert("Please paste the 2 lines of MRZ text from the passport!");
    return;
  }

  const lines = text.split('\n').map(l => l.trim().replace(/\s+/g, '')).filter(Boolean);
  if (lines.length < 2 || lines[0].length < 30) {
    alert("Invalid MRZ format. A standard passport MRZ must have 2 lines of 44 characters.");
    return;
  }

  try {
    const parsed = parseTD3MRZ(lines[0], lines[1]);
    fillDetailsForm(parsed);
    elements.dataStatusBadge.textContent = "Parsed (Offline MRZ) ✅";
    elements.dataStatusBadge.style.color = "var(--success)";
    alert(`Successfully parsed offline passport for ${parsed.givenName} ${parsed.surname}!`);
  } catch (err) {
    console.error("MRZ Error:", err);
    alert("Failed to parse MRZ: " + err.message);
  }
}

function parseTD3MRZ(line1, line2) {
  const country = line1.substring(2, 5).replace(/</g, '');
  const namePart = line1.substring(5);
  const nameSplits = namePart.split('<<');
  const surname = (nameSplits[0] || '').replace(/</g, ' ').trim();
  const givenName = (nameSplits[1] || '').replace(/</g, ' ').trim();

  const passportNumber = line2.substring(0, 9).replace(/</g, '').trim();
  const nationality = line2.substring(10, 13).replace(/</g, '').trim();
  const dobRaw = line2.substring(13, 19);
  const sexChar = line2.substring(20, 21);
  const expiryRaw = line2.substring(21, 27);

  const dob = formatMrzDate(dobRaw, true);
  const expiryDate = formatMrzDate(expiryRaw, false);
  const gender = sexChar === 'M' ? 'MALE' : sexChar === 'F' ? 'FEMALE' : 'OTHER';

  return {
    givenName,
    surname,
    fullName: `${givenName} ${surname}`.trim(),
    passportNumber,
    passportType: 'ORDINARY',
    nationality: getCountryNameFromIso3(nationality || country),
    dob,
    gender,
    expiryDate,
    issueDate: '',
    placeOfBirth: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    nid: '',
    address: ''
  };
}

function formatMrzDate(yymmdd, isDob) {
  if (!yymmdd || yymmdd.length !== 6) return '';
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);

  const currentYear = new Date().getFullYear() % 100;
  let fullYear;
  if (isDob) {
    fullYear = yy > currentYear ? 1900 + yy : 2000 + yy;
  } else {
    fullYear = 2000 + yy;
  }

  return `${dd}/${mm}/${fullYear}`;
}

function getCountryNameFromIso3(iso3) {
  const map = {
    BGD: "Bangladesh", IND: "India", PAK: "Pakistan", USA: "United States",
    GBR: "United Kingdom", CAN: "Canada", AUS: "Australia", MYS: "Malaysia",
    SGP: "Singapore", SAU: "Saudi Arabia", ARE: "United Arab Emirates", TUR: "Turkey"
  };
  return map[iso3] || iso3;
}

// ==============================================================
// FEATURE 3: AGENCY BULK CSV IMPORT / EXPORT
// ==============================================================
const CSV_HEADERS = [
  "givenName", "surname", "dob", "gender", "nationality", "placeOfBirth",
  "maritalStatus", "occupation", "passportNumber", "passportType", "issueDate",
  "expiryDate", "issuePlace", "nid", "email", "phone", "fatherName", "motherName",
  "spouseName", "postalCode", "address"
];

function downloadCsvTemplate() {
  const sampleRow = [
    "MOHAMMAD", "ISLAM", "15/08/1992", "MALE", "Bangladesh", "Dhaka",
    "MARRIED", "Engineer", "A01234567", "ORDINARY", "10/01/2021",
    "09/01/2031", "DIP/Dhaka", "1992261234567", "islam@example.com", "+8801700000000",
    "Abdul Karim", "Fatema Begum", "Rina Akter", "1205", "House 12, Road 4, Dhanmondi, Dhaka"
  ];

  const csvContent = "data:text/csv;charset=utf-8," +
    CSV_HEADERS.join(",") + "\n" +
    sampleRow.map(v => `"${v}"`).join(",");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "visafill_applicant_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function importCsvProfiles() {
  const file = elements.csvFileInput.files[0];
  if (!file) {
    alert("Please select a CSV file first!");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const csvText = e.target.result;
      const rows = parseCsvText(csvText);

      if (rows.length < 2) {
        alert("The CSV file is empty or has no data rows.");
        return;
      }

      const headers = rows[0].map(h => h.trim());
      const { profiles = {} } = await chrome.storage.local.get(['profiles']);
      let importedCount = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || !row[0]) continue;

        const data = {};
        headers.forEach((h, idx) => {
          data[h] = row[idx] ? row[idx].trim() : '';
        });

        if (!data.passportNumber && !data.givenName) continue;

        const profileId = data.passportNumber || `prof_${Date.now()}_${i}`;
        const profileName = `${data.givenName} ${data.surname} (${data.passportNumber || 'No Passport'})`;
        profiles[profileId] = { id: profileId, name: profileName, data, updatedAt: Date.now() };
        importedCount++;
      }

      await chrome.storage.local.set({ profiles });
      await loadProfilesList();
      await refreshAgencyList();
      alert(`Successfully imported ${importedCount} applicant profiles!`);
    } catch (err) {
      alert("Error importing CSV: " + err.message);
    }
  };
  reader.readAsText(file);
}

function parseCsvText(text) {
  const lines = text.split(/\r\n|\n/);
  const result = [];
  lines.forEach(line => {
    if (!line.trim()) return;
    const row = [];
    let insideQuote = false;
    let entry = '';
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        insideQuote = !insideQuote;
      } else if (c === ',' && !insideQuote) {
        row.push(entry);
        entry = '';
      } else {
        entry += c;
      }
    }
    row.push(entry);
    result.push(row);
  });
  return result;
}

async function exportCsvProfiles() {
  const { profiles = {} } = await chrome.storage.local.get(['profiles']);
  const list = Object.values(profiles);

  if (list.length === 0) {
    alert("No profiles saved yet to export!");
    return;
  }

  let csv = CSV_HEADERS.join(",") + "\n";
  list.forEach(p => {
    const row = CSV_HEADERS.map(h => `"${(p.data[h] || '').replace(/"/g, '""')}"`);
    csv += row.join(",") + "\n";
  });

  const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `visafill_profiles_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function refreshAgencyList() {
  const { profiles = {}, activeApplicant } = await chrome.storage.local.get(['profiles', 'activeApplicant']);
  const list = Object.values(profiles);
  elements.profileCountDisplay.textContent = list.length;
  elements.agencyProfilesList.innerHTML = '';

  if (list.length === 0) {
    elements.agencyProfilesList.innerHTML = '<div style="padding: 10px; color: #94a3b8; text-align: center;">No profiles saved yet.</div>';
    return;
  }

  list.forEach(p => {
    const div = document.createElement('div');
    const isActive = activeApplicant && activeApplicant.passportNumber === p.data.passportNumber;
    div.className = `agency-item ${isActive ? 'active' : ''}`;
    div.innerHTML = `
      <span><strong>${p.data.givenName} ${p.data.surname}</strong> - ${p.data.passportNumber || 'N/A'}</span>
      <button class="btn btn-secondary btn-sm" style="padding: 2px 6px; font-size: 10px;">Select</button>
    `;
    div.addEventListener('click', async () => {
      fillDetailsForm(p.data);
      await chrome.storage.local.set({ activeApplicant: p.data });
      await loadProfilesList(p.id);
      await refreshAgencyList();
      alert(`Applicant "${p.name}" is now active!`);
    });
    elements.agencyProfilesList.appendChild(div);
  });
}

async function deleteAllProfiles() {
  if (confirm("Are you sure you want to delete ALL saved applicant profiles? This action cannot be undone.")) {
    await chrome.storage.local.set({ profiles: {} });
    await chrome.storage.local.remove(['activeApplicant']);
    clearDetailsForm();
    await loadProfilesList();
    await refreshAgencyList();
  }
}

// Form Population & Reading
const ALL_FIELDS = [
  'givenName', 'surname', 'dob', 'gender', 'nationality', 'placeOfBirth',
  'maritalStatus', 'occupation', 'passportNumber', 'passportType', 'issueDate',
  'expiryDate', 'issuePlace', 'nid', 'email', 'phone', 'fatherName', 'motherName',
  'spouseName', 'postalCode', 'address'
];

function fillDetailsForm(data) {
  ALL_FIELDS.forEach(field => {
    const el = document.getElementById(field);
    if (el && data[field]) {
      el.value = data[field];
    }
  });
}

function getDetailsFormData() {
  const form = elements.detailsForm;
  const data = {};
  ALL_FIELDS.forEach(field => {
    const el = form[field];
    data[field] = el ? el.value.trim() : '';
  });

  data.fullName = `${data.givenName} ${data.surname}`.trim();
  return data;
}

function clearDetailsForm() {
  elements.detailsForm.reset();
  elements.dataStatusBadge.textContent = "Ready";
  elements.dataStatusBadge.style.color = "var(--text-muted)";
  elements.fillSummary.classList.add('hidden');
  chrome.storage.local.remove(['activeApplicant']);
}

async function saveCurrentProfile() {
  const data = getDetailsFormData();
  if (!data.passportNumber && !data.givenName) {
    alert("Please provide at least a name or passport number to save profile.");
    return;
  }

  const profileId = data.passportNumber || `prof_${Date.now()}`;
  const profileName = `${data.givenName} ${data.surname} (${data.passportNumber || 'No Passport'})`;

  const { profiles = {} } = await chrome.storage.local.get(['profiles']);
  profiles[profileId] = { id: profileId, name: profileName, data, updatedAt: Date.now() };

  await chrome.storage.local.set({ profiles, activeApplicant: data });
  await loadProfilesList(profileId);
  await refreshAgencyList();
  alert(`Profile for "${profileName}" saved!`);
}

async function loadProfilesList(selectedId = null) {
  const { profiles = {} } = await chrome.storage.local.get(['profiles']);
  elements.savedProfiles.innerHTML = '<option value="new">+ New Applicant Profile</option>';

  Object.values(profiles).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    if (selectedId && p.id === selectedId) opt.selected = true;
    elements.savedProfiles.appendChild(opt);
  });
}

async function loadProfile(profileId) {
  const { profiles = {} } = await chrome.storage.local.get(['profiles']);
  const profile = profiles[profileId];
  if (profile && profile.data) {
    fillDetailsForm(profile.data);
    await chrome.storage.local.set({ activeApplicant: profile.data });
    await refreshAgencyList();
    elements.dataStatusBadge.textContent = "Loaded";
  }
}

// Auto-fill active form
async function triggerAutoFill() {
  const data = getDetailsFormData();
  if (!data.passportNumber && !data.givenName) {
    alert("Please extract or enter applicant data first!");
    return;
  }

  await chrome.storage.local.set({ activeApplicant: data });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    alert("No active browser tab found.");
    return;
  }

  elements.fillSummary.classList.add('hidden');

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "AUTO_FILL",
      applicant: data
    });

    if (response && response.status === "SUCCESS") {
      elements.fillSummaryText.textContent = `Auto-filled ${response.filledCount} fields on this page!`;
      elements.fillSummary.classList.remove('hidden');
    } else {
      elements.fillSummaryText.textContent = response?.message || "No matching form fields detected on this page.";
      elements.fillSummary.classList.remove('hidden');
    }
  } catch (err) {
    console.error("Auto-fill messaging error:", err);
    alert("Could not connect to the page. Please refresh the visa application page and try again.");
  }
}
