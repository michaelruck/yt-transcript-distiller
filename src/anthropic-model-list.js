const CACHE_KEY = 'anthropicModelListCache';
const CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours
const SOURCE_URL = 'https://raw.githubusercontent.com/smoochy/openrouter-model-list/main/anthropic-models.json';

export async function fetchAnthropicModels() {
  const stored = await chrome.storage.local.get([CACHE_KEY]);
  const entry = stored[CACHE_KEY];

  if (entry && Date.now() - entry.cachedAt < CACHE_TTL_MS) {
    return entry.result;
  }

  try {
    const res = await fetch(SOURCE_URL);
    if (!res.ok) throw new Error(`anthropic-model-list fetch failed: HTTP ${res.status}`);
    const result = await res.json();
    await chrome.storage.local.set({
      [CACHE_KEY]: { result, cachedAt: Date.now() },
    });
    return result;
  } catch (err) {
    if (entry) return entry.result;
    throw err;
  }
}
