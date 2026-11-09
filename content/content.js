// Universal Pro Engine for VisaFill AI
// Includes: Universal Heuristics, Split Dates, Country Maps, Site Presets & Captcha Helper

console.log("VisaFill AI Pro: Universal Engine Loaded.");

// Country & Demonym Dictionary
const COUNTRY_MAP = {
  "bangladesh": { iso2: "BD", iso3: "BGD", demonym: "bangladeshi" },
  "india": { iso2: "IN", iso3: "IND", demonym: "indian" },
  "pakistan": { iso2: "PK", iso3: "PAK", demonym: "pakistani" },
  "united states": { iso2: "US", iso3: "USA", demonym: "american", aliases: ["usa", "united states of america"] },
  "united kingdom": { iso2: "GB", iso3: "GBR", demonym: "british", aliases: ["uk", "great britain"] },
  "canada": { iso2: "CA", iso3: "CAN", demonym: "canadian" },
  "australia": { iso2: "AU", iso3: "AUS", demonym: "australian" },
  "nepal": { iso2: "NP", iso3: "NPL", demonym: "nepalese" },
  "sri lanka": { iso2: "LK", iso3: "LKA", demonym: "sri lankan" },
  "malaysia": { iso2: "MY", iso3: "MYS", demonym: "malaysian" },
  "singapore": { iso2: "SG", iso3: "SGP", demonym: "singaporean" },
  "saudi arabia": { iso2: "SA", iso3: "SAU", demonym: "saudi" },
  "united arab emirates": { iso2: "AE", iso3: "ARE", demonym: "emirati", aliases: ["uae"] },
  "turkey": { iso2: "TR", iso3: "TUR", demonym: "turkish", aliases: ["turkiye"] },
  "china": { iso2: "CN", iso3: "CHN", demonym: "chinese" },
  "japan": { iso2: "JP", iso3: "JPN", demonym: "japanese" },
  "germany": { iso2: "DE", iso3: "DEU", demonym: "german" },
  "france": { iso2: "FR", iso3: "FRA", demonym: "french" },
  "italy": { iso2: "IT", iso3: "ITA", demonym: "italian" }
};

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];
const MONTH_SHORT = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec"
];

// Heuristic matching rules
const FIELD_MATCHERS = {
  passportNumber: /(pass(port)?[\s_-]*(no|num|number)?)|(travel[\s_-]*doc(ument)?[\s_-]*no)/i,
  passportType: /(pass(port)?[\s_-]*type)|(travel[\s_-]*doc(ument)?[\s_-]*type)/i,
  issuePlace: /(place[\s_-]*of[\s_-]*issue)|(issue[\s_-]*place)|(issuing[\s_-]*authority)|(authority[\s_-]*of[\s_-]*issue)/i,
  firstName: /(first[\s_-]*names?)|(forenames?)|(^fname$)/i,
  middleName: /(middle[\s_-]*names?)|(^mname$)/i,
  givenName: /(given[\s_-]*names?)|(first[\s_-]*names?)|(forenames?)|(^fname$)/i,
  surname: /(sur[\s_-]*names?)|(last[\s_-]*names?)|(family[\s_-]*names?)|(^lname$)/i,
  fullName: /(full[\s_-]*names?)|(applicant[\s_-]*names?)|(^name$)/i,
  dob: /(date[\s_-]*of[\s_-]*birth)|(birth[\s_-]*date)|(\bdob\b)/i,
  gender: /(\bgender\b)|(\bsex\b)/i,
  maritalStatus: /(marital[\s_-]*status)|(civil[\s_-]*status)|(marriage[\s_-]*status)/i,
  nationality: /(\bnationality\b)|(\bcitizenship\b)|(country[\s_-]*of[\s_-]*citizenship)/i,
  placeOfBirth: /(place[\s_-]*of[\s_-]*birth)|(birth[\s_-]*place)|(city[\s_-]*of[\s_-]*birth)|(birth[\s_-]*city)/i,
  occupation: /(occupation)|(profession)|(employment)|(designation)/i,
  issueDate: /(date[\s_-]*of[\s_-]*issue)|(issue[\s_-]*date)|(issued[\s_-]*on)/i,
  expiryDate: /(date[\s_-]*of[\s_-]*expir(y|ation))|(expir(y|ation)[\s_-]*date)|(valid[\s_-]*until)/i,
  fatherName: /(father'?s?[\s_-]*names?)|(father[\s_-]*full[\s_-]*name)/i,
  motherName: /(mother'?s?[\s_-]*names?)|(mother[\s_-]*full[\s_-]*name)/i,
  spouseName: /(spouse'?s?[\s_-]*names?)|(husband'?s?[\s_-]*names?)|(wife'?s?[\s_-]*names?)/i,
  nid: /(national[\s_-]*id)|(\bnid\b)|(citizen[\s_-]*id)|(id[\s_-]*card[\s_-]*number)/i,
  email: /(\bemail\b)|(e[\s_-]*mail[\s_-]*address)/i,
  phone: /(phone[\s_-]*number)|(mobile[\s_-]*number)|(telephone)|(contact[\s_-]*number)|(\bcell\b)/i,
  postalCode: /(postal[\s_-]*code)|(zip[\s_-]*code)|(\bpincode\b)|(post[\s_-]*code)/i,
  address: /(permanent[\s_-]*address)|(present[\s_-]*address)|(^address$)|(street[\s_-]*address)|(residence[\s_-]*address)/i
};

// Site Presets: Common boilerplate yes/no questions
const COMMON_NO_QUESTIONS = [
  /have\s+you\s+ever\s+changed\s+your\s+name/i,
  /any\s+other\s+name/i,
  /other\s+nationality/i,
  /other\s+citizenship/i,
  /other\s+passport/i,
  /previous\s+passport/i,
  /refused\s+visa/i,
  /criminal\s+conviction/i,
  /military\s+service/i,
  /communicable\s+disease/i
];

initFloatingWidget();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "AUTO_FILL") {
    try {
      chrome.storage.local.get(['enableSitePresets'], (res) => {
        const enablePresets = res.enableSitePresets !== false;
        const applicant = request.applicant;
        const count = performUniversalAutoFill(applicant, enablePresets);

        // Check for Captcha on the page and highlight/scroll
        const captchaFound = handleCaptchaScrollAndAlert();

        if (captchaFound) {
          showToast(`VisaFill AI: Filled ${count} fields! Please solve the Captcha highlighted below ⚠️`, "warning");
        } else {
          showToast(`VisaFill AI: Successfully filled ${count} fields!`, count > 0 ? "success" : "info");
        }

        sendResponse({ status: "SUCCESS", filledCount: count });
      });
    } catch (err) {
      console.error("Auto-fill error:", err);
      showToast(`VisaFill AI Error: ${err.message}`, "error");
      sendResponse({ status: "ERROR", message: err.message });
    }
  }
  return true;
});

// Floating On-Page Quick-Fill Button (⚡)
async function initFloatingWidget() {
  const { enableFloatingBtn = true } = await chrome.storage.local.get(['enableFloatingBtn']);
  if (!enableFloatingBtn) return;
  if (window.self !== window.top && (window.innerWidth < 400 || window.innerHeight < 300)) return;
  if (document.getElementById('visafill-fab-container')) return;

  const container = document.createElement('div');
  container.id = 'visafill-fab-container';
  container.innerHTML = `
    <button id="visafill-fab-btn" title="Click to 1-Click Auto-Fill this page with VisaFill AI">
      <span class="visafill-fab-icon">⚡</span>
      <span class="visafill-fab-text">VisaFill</span>
    </button>
  `;

  document.body.appendChild(container);

  const btn = document.getElementById('visafill-fab-btn');
  btn.addEventListener('click', async () => {
    btn.classList.add('loading');
    const { activeApplicant, enableSitePresets = true } = await chrome.storage.local.get(['activeApplicant', 'enableSitePresets']);
    if (!activeApplicant) {
      showToast("Please open VisaFill AI in the side panel & select an applicant first!", "info");
      btn.classList.remove('loading');
      return;
    }

    const count = performUniversalAutoFill(activeApplicant, enableSitePresets);
    const captchaFound = handleCaptchaScrollAndAlert();

    if (captchaFound) {
      showToast(`VisaFill AI: Filled ${count} fields! Please solve the Captcha highlighted below ⚠️`, "warning");
    } else {
      showToast(`VisaFill AI: Filled ${count} fields on this page!`, count > 0 ? "success" : "info");
    }

    btn.classList.remove('loading');
  });
}

// Master Universal Fill Engine
function performUniversalAutoFill(rawApplicant, enablePresets = true) {
  let filledCount = 0;
  const applicant = normalizeApplicantData(rawApplicant);

  // 1. Fill Split Date clusters (Day, Month, Year fields)
  filledCount += fillSplitDates(applicant);

  // 2. Scan all standard form elements
  const allInputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');

  allInputs.forEach(el => {
    if (el.disabled || el.readOnly || el.dataset.visafillHandled) return;

    const labelText = getFullElementContext(el);
    let matchedKey = null;

    // Direct match against matchers
    for (const [key, regex] of Object.entries(FIELD_MATCHERS)) {
      if (testContext(regex, el, labelText)) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey && applicant[matchedKey]) {
      const success = applyValueToElement(el, applicant[matchedKey], matchedKey, applicant);
      if (success) {
        filledCount++;
        highlightElement(el);
        el.dataset.visafillHandled = "true";
      }
    } else if (enablePresets) {
      // Check for common boilerplate questions (Preset Rules)
      if (applyCommonBoilerplate(el, labelText)) {
        filledCount++;
        highlightElement(el);
        el.dataset.visafillHandled = "true";
      }
    }
  });

  return filledCount;
}

// Preset Engine: Auto-answers standard boilerplate 'No' questions
function applyCommonBoilerplate(el, contextText) {
  const isQuestionNo = COMMON_NO_QUESTIONS.some(regex => regex.test(contextText));
  if (!isQuestionNo) return false;

  if (el.tagName === 'SELECT') {
    const noOption = Array.from(el.options).find(o =>
      o.value.toLowerCase() === 'no' || o.text.toLowerCase() === 'no' || o.value === 'N' || o.text.startsWith('No')
    );
    if (noOption) {
      el.value = noOption.value;
      triggerEvents(el);
      return true;
    }
  }

  if (el.type === 'radio') {
    const radioVal = el.value.toLowerCase();
    const ctx = contextText.toLowerCase();
    if (radioVal === 'no' || radioVal === 'n' || ctx.includes('no')) {
      el.checked = true;
      triggerEvents(el);
      return true;
    }
  }

  return false;
}

// Feature 4: Captcha Detection, Auto-Scroll & Alert
function handleCaptchaScrollAndAlert() {
  const captchaSelectors = [
    'input[name*="captcha" i]',
    'input[id*="captcha" i]',
    'input[placeholder*="captcha" i]',
    'img[src*="captcha" i]',
    'img[id*="captcha" i]',
    '.g-recaptcha',
    '.h-captcha',
    '#captcha',
    '#captchaImage',
    '#txtCaptcha'
  ];

  let captchaElement = null;
  for (const sel of captchaSelectors) {
    const el = document.querySelector(sel);
    if (el && el.offsetParent !== null) { // Check visibility
      captchaElement = el;
      break;
    }
  }

  if (captchaElement) {
    // Scroll smoothly to captcha
    captchaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Focus input if it's an input
    if (captchaElement.tagName === 'INPUT') {
      setTimeout(() => captchaElement.focus(), 500);
    }

    // Add alert class
    captchaElement.classList.add('visafill-captcha-alert');
    setTimeout(() => captchaElement.classList.remove('visafill-captcha-alert'), 8000);
    return true;
  }
  return false;
}

// Data Normalization
function normalizeApplicantData(data) {
  const norm = { ...data };
  if (norm.givenName) {
    const parts = norm.givenName.split(/\s+/).filter(Boolean);
    norm.firstName = parts[0] || norm.givenName;
    norm.middleName = parts.slice(1).join(' ') || '';
  }
  if (!norm.fullName) {
    norm.fullName = `${norm.givenName || ''} ${norm.surname || ''}`.trim();
  }
  return norm;
}

// Split Date Handler
function fillSplitDates(applicant) {
  let count = 0;
  const dateConfigs = [
    { key: 'dob', dateStr: applicant.dob, prefix: /(birth|dob|born)/i },
    { key: 'issueDate', dateStr: applicant.issueDate, prefix: /(issue|issued)/i },
    { key: 'expiryDate', dateStr: applicant.expiryDate, prefix: /(expir|valid)/i }
  ];

  dateConfigs.forEach(cfg => {
    if (!cfg.dateStr) return;
    const parsed = parseDateParts(cfg.dateStr);
    if (!parsed) return;

    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), select'));
    inputs.forEach(el => {
      const ctx = getFullElementContext(el);
      if (!cfg.prefix.test(ctx)) return;

      if (/(^|[\s_-])(day|dd)([\s_-]|$)/i.test(ctx) && !el.dataset.visafillHandled) {
        if (applyDayValue(el, parsed.day)) {
          count++;
          highlightElement(el);
          el.dataset.visafillHandled = "true";
        }
      } else if (/(^|[\s_-])(month|mm|mon)([\s_-]|$)/i.test(ctx) && !el.dataset.visafillHandled) {
        if (applyMonthValue(el, parsed.month)) {
          count++;
          highlightElement(el);
          el.dataset.visafillHandled = "true";
        }
      } else if (/(^|[\s_-])(year|yyyy|yy)([\s_-]|$)/i.test(ctx) && !el.dataset.visafillHandled) {
        if (applyYearValue(el, parsed.year)) {
          count++;
          highlightElement(el);
          el.dataset.visafillHandled = "true";
        }
      }
    });
  });

  return count;
}

function parseDateParts(dateStr) {
  const parts = dateStr.split(/[-/.]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) return { day: parts[0], month: parts[1], year: parts[2] };
    if (parts[0].length === 4) return { day: parts[2], month: parts[1], year: parts[0] };
  }
  return null;
}

function applyDayValue(el, day) {
  const numDay = parseInt(day, 10);
  if (el.tagName === 'SELECT') {
    return selectOptionMatching(el, [day, numDay.toString(), day.padStart(2, '0')]);
  }
  setInputValue(el, numDay.toString().padStart(2, '0'));
  return true;
}

function applyMonthValue(el, month) {
  const numMonth = parseInt(month, 10);
  const mName = MONTH_NAMES[numMonth - 1] || '';
  const mShort = MONTH_SHORT[numMonth - 1] || '';
  if (el.tagName === 'SELECT') {
    return selectOptionMatching(el, [month, numMonth.toString(), month.padStart(2, '0'), mName, mShort]);
  }
  setInputValue(el, numMonth.toString().padStart(2, '0'));
  return true;
}

function applyYearValue(el, year) {
  if (el.tagName === 'SELECT') {
    return selectOptionMatching(el, [year, year.slice(-2)]);
  }
  setInputValue(el, year);
  return true;
}

// Value Application with Framework State Compatibility
function applyValueToElement(el, value, fieldType, applicant) {
  if (el.tagName === 'SELECT') {
    return fillSelectElement(el, value, fieldType);
  }
  if (el.type === 'radio') {
    return fillRadioElement(el, value, fieldType);
  }
  if (el.type === 'checkbox') {
    return false;
  }
  if (el.type === 'date') {
    const isoDate = convertToIsoDate(value);
    if (isoDate) {
      setInputValue(el, isoDate);
      return true;
    }
  }

  setInputValue(el, value);
  return true;
}

function setInputValue(el, value) {
  const prototype = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  
  if (descriptor && descriptor.set) {
    descriptor.set.call(el, value);
  } else {
    el.value = value;
  }

  el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
}

function fillSelectElement(selectEl, value, fieldType) {
  const valLower = value.toString().toLowerCase().trim();

  if (fieldType === 'gender') {
    const isMale = valLower === 'male' || valLower === 'm';
    const isFemale = valLower === 'female' || valLower === 'f';
    const match = Array.from(selectEl.options).find(opt => {
      const text = opt.text.toLowerCase().trim();
      const val = opt.value.toLowerCase().trim();
      if (isMale) return text === 'male' || val === 'male' || val === 'm' || text === 'm' || text.startsWith('male');
      if (isFemale) return text === 'female' || val === 'female' || val === 'f' || text === 'f' || text.startsWith('female');
      return false;
    });
    if (match) {
      selectEl.value = match.value;
      triggerEvents(selectEl);
      return true;
    }
  }

  if (fieldType === 'maritalStatus') {
    const match = Array.from(selectEl.options).find(opt => {
      const text = opt.text.toLowerCase();
      const val = opt.value.toLowerCase();
      return text.includes(valLower) || val.includes(valLower) ||
        (valLower === 'single' && (text.includes('unmarried') || val.includes('unmarried')));
    });
    if (match) {
      selectEl.value = match.value;
      triggerEvents(selectEl);
      return true;
    }
  }

  if (fieldType === 'nationality') {
    const countryInfo = COUNTRY_MAP[valLower];
    const targets = [valLower];
    if (countryInfo) {
      targets.push(countryInfo.iso2.toLowerCase());
      targets.push(countryInfo.iso3.toLowerCase());
      targets.push(countryInfo.demonym.toLowerCase());
      if (countryInfo.aliases) countryInfo.aliases.forEach(a => targets.push(a.toLowerCase()));
    }

    const match = Array.from(selectEl.options).find(opt => {
      const text = opt.text.toLowerCase().trim();
      const val = opt.value.toLowerCase().trim();
      return targets.some(t => text === t || val === t || text.startsWith(t) || val.startsWith(t));
    });

    if (match) {
      selectEl.value = match.value;
      triggerEvents(selectEl);
      return true;
    }
  }

  return selectOptionMatching(selectEl, [valLower]);
}

function selectOptionMatching(selectEl, candidates) {
  const normCandidates = candidates.map(c => c.toLowerCase().trim());
  const options = Array.from(selectEl.options);

  const matched = options.find(opt => {
    const t = opt.text.toLowerCase().trim();
    const v = opt.value.toLowerCase().trim();
    return normCandidates.some(c => t === c || v === c);
  }) || options.find(opt => {
    const t = opt.text.toLowerCase().trim();
    return normCandidates.some(c => t.includes(c) || c.includes(t));
  });

  if (matched) {
    selectEl.value = matched.value;
    triggerEvents(selectEl);
    return true;
  }
  return false;
}

function fillRadioElement(radioEl, value, fieldType) {
  const valLower = value.toString().toLowerCase();
  const ctx = getFullElementContext(radioEl).toLowerCase();
  const radioVal = radioEl.value.toLowerCase();

  if (fieldType === 'gender') {
    const isMale = valLower.startsWith('m');
    const isFemale = valLower.startsWith('f');
    if (isMale && (ctx.includes('male') || radioVal === 'm' || radioVal === 'male')) {
      radioEl.checked = true;
      triggerEvents(radioEl);
      return true;
    }
    if (isFemale && (ctx.includes('female') || radioVal === 'f' || radioVal === 'female')) {
      radioEl.checked = true;
      triggerEvents(radioEl);
      return true;
    }
  }

  if (fieldType === 'maritalStatus') {
    if (ctx.includes(valLower) || radioVal.includes(valLower)) {
      radioEl.checked = true;
      triggerEvents(radioEl);
      return true;
    }
  }

  return false;
}

function getFullElementContext(el) {
  const parts = [
    el.id || '',
    el.name || '',
    el.placeholder || '',
    el.getAttribute('aria-label') || '',
    el.getAttribute('title') || ''
  ];

  if (el.id) {
    const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (label) parts.push(label.innerText);
  }
  const parentLabel = el.closest('label');
  if (parentLabel) parts.push(parentLabel.innerText);

  const td = el.closest('td');
  if (td && td.previousElementSibling) {
    parts.push(td.previousElementSibling.innerText);
  }

  const group = el.closest('.form-group, .form-row, .field, tr, div');
  if (group) {
    const titleEl = group.querySelector('label, .label, span, th');
    if (titleEl && titleEl !== el) parts.push(titleEl.innerText);
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function testContext(regex, el, contextText) {
  return regex.test(contextText);
}

function convertToIsoDate(dateStr) {
  const parts = dateStr.split(/[-/.]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    if (parts[0].length === 4) return dateStr;
  }
  return null;
}

function triggerEvents(el) {
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
}

function highlightElement(el) {
  el.classList.add('visafill-highlight');
  setTimeout(() => el.classList.remove('visafill-highlight'), 4500);
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('visafill-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'visafill-toast';
    document.body.appendChild(toast);
  }

  toast.className = `visafill-toast visafill-toast-${type} visafill-toast-show`;
  toast.innerText = message;

  setTimeout(() => toast.classList.remove('visafill-toast-show'), 5000);
}
