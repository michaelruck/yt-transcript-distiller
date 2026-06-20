import { jest } from '@jest/globals';
global.fetch = jest.fn();

import { fetchAnthropicModels } from '../anthropic-model-list.js';

const MODELS = [
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
];

beforeEach(async () => {
  fetch.mockClear();
  chrome.storage.local.clear();
});

test('fetches and returns model list on cache miss', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => MODELS });
  const result = await fetchAnthropicModels();
  expect(result).toEqual(MODELS);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith(
    'https://raw.githubusercontent.com/smoochy/openrouter-model-list/main/anthropic-models.json'
  );
});

test('returns cached result when TTL not expired', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => MODELS });
  await fetchAnthropicModels();
  fetch.mockClear();
  const result = await fetchAnthropicModels();
  expect(result).toEqual(MODELS);
  expect(fetch).not.toHaveBeenCalled();
});

test('refetches when cache is expired', async () => {
  const FRESH = [{ id: 'claude-new', name: 'Claude New' }];
  // Manually insert an expired cache entry
  await chrome.storage.local.set({
    anthropicModelListCache: { result: MODELS, cachedAt: Date.now() - 172800001 },
  });
  fetch.mockResolvedValueOnce({ ok: true, json: async () => FRESH });
  const result = await fetchAnthropicModels();
  expect(result).toEqual(FRESH);
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('returns cached result on fetch error if cache exists', async () => {
  await chrome.storage.local.set({
    anthropicModelListCache: { result: MODELS, cachedAt: Date.now() },
  });
  fetch.mockRejectedValueOnce(new Error('network error'));
  const result = await fetchAnthropicModels();
  expect(result).toEqual(MODELS);
});

test('throws on fetch error with no cache', async () => {
  fetch.mockRejectedValueOnce(new Error('network error'));
  await expect(fetchAnthropicModels()).rejects.toThrow('network error');
});
