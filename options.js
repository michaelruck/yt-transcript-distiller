// Apply all data-i18n translations
document.querySelectorAll('[data-i18n]').forEach(el => {
  const msg = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
  if (msg) el.textContent = msg;
});

// Language codes must match _locales folder names
const LANG_CODES = ['ar','zh','en','fr','de','hi','ja','ko','pt','ru','es'];

function detectBrowserLang() {
  const lang = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return LANG_CODES.includes(lang) ? lang : 'en';
}

// Build language select from i18n strings
const langSelect = document.getElementById('distillerLang');
LANG_CODES.sort((a, b) => {
  const la = chrome.i18n.getMessage('lang_' + a);
  const lb = chrome.i18n.getMessage('lang_' + b);
  return la.localeCompare(lb);
}).forEach(code => {
  const opt = document.createElement('option');
  opt.value = code;
  opt.textContent = chrome.i18n.getMessage('lang_' + code);
  langSelect.appendChild(opt);
});

const DEFAULT_PROMPT = chrome.i18n.getMessage('default_prompt');
const DEFAULT_MODEL  = 'gemini-3.5-flash';
const apiKeyInput = document.getElementById('apiKey');
const promptInput = document.getElementById('distillerPrompt');
const modelInput  = document.getElementById('distillerModel');
const saveBtn     = document.getElementById('saveBtn');
const statusEl    = document.getElementById('status');
const toggleBtn   = document.getElementById('toggleShow');
const resetBtn    = document.getElementById('resetPrompt');

const telemetryCheckbox = document.getElementById('telemetryEnabled');

// Load existing values
chrome.storage.sync.get(['geminiApiKey', 'distillerPrompt', 'distillerLang', 'distillerModel', 'telemetryEnabled'], (result) => {
  if (result.geminiApiKey) apiKeyInput.value = result.geminiApiKey;
  promptInput.value = result.distillerPrompt || DEFAULT_PROMPT;
  langSelect.value  = result.distillerLang   || detectBrowserLang();
  modelInput.value  = result.distillerModel  || DEFAULT_MODEL;
  telemetryCheckbox.checked = result.telemetryEnabled !== false; // default: true
});

// Toggle show/hide API key
toggleBtn.addEventListener('click', () => {
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    toggleBtn.textContent = chrome.i18n.getMessage('btn_hide');
  } else {
    apiKeyInput.type = 'password';
    toggleBtn.textContent = chrome.i18n.getMessage('btn_show');
  }
});

// Reset prompt
resetBtn.addEventListener('click', () => {
  promptInput.value = DEFAULT_PROMPT;
});

// Save
saveBtn.addEventListener('click', () => {
  const key    = apiKeyInput.value.trim();
  const prompt = promptInput.value.trim() || DEFAULT_PROMPT;
  const lang   = langSelect.value || detectBrowserLang();
  const model  = modelInput.value.trim() || DEFAULT_MODEL;

  if (!key) {
    statusEl.textContent = chrome.i18n.getMessage('msg_no_key');
    statusEl.className = 'status error visible';
    setTimeout(() => { statusEl.className = 'status'; }, 3000);
    return;
  }

  chrome.storage.sync.set({ geminiApiKey: key, distillerPrompt: prompt, distillerLang: lang, distillerModel: model, telemetryEnabled: telemetryCheckbox.checked }, () => {
    if (chrome.runtime.lastError) {
      statusEl.textContent = chrome.i18n.getMessage('msg_save_error');
      statusEl.className = 'status error visible';
    } else {
      statusEl.textContent = chrome.i18n.getMessage('msg_saved');
      statusEl.className = 'status visible';
    }
    setTimeout(() => { statusEl.className = 'status'; }, 3000);
  });
});

// --- MOOD & STYLE LISTS ---
const DEFAULT_MOODS = [
  'neugierig', 'begeistert', 'nachdenklich', 'humorvoll',
  'angenehm überrascht', 'respektvoll', 'inspiriert', 'aufmerksam', 'anerkennend'
];

const DEFAULT_STYLES = [
  'förmlich', 'informell', 'enthusiastisch'
];

const moodListArea  = document.getElementById('moodList');
const styleListArea = document.getElementById('styleList');
const resetMoodBtn  = document.getElementById('resetMoodList');
const resetStyleBtn = document.getElementById('resetStyleList');

// Load lists from storage
chrome.storage.local.get(['moodList', 'styleList'], (r) => {
  moodListArea.value  = (r.moodList  || DEFAULT_MOODS).join('\n');
  styleListArea.value = (r.styleList || DEFAULT_STYLES).join('\n');
});

resetMoodBtn.addEventListener('click', () => {
  moodListArea.value = DEFAULT_MOODS.join('\n');
});

resetStyleBtn.addEventListener('click', () => {
  styleListArea.value = DEFAULT_STYLES.join('\n');
});

// Include lists in save
const originalSave = saveBtn.onclick;
saveBtn.addEventListener('click', () => {
  const moodList  = moodListArea.value.split('\n').map(s => s.trim()).filter(Boolean);
  const styleList = styleListArea.value.split('\n').map(s => s.trim()).filter(Boolean);
  chrome.storage.local.set({ moodList, styleList });
});
