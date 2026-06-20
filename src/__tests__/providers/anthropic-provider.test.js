import { jest } from '@jest/globals';
global.fetch = jest.fn();

import { AnthropicProvider } from '../../providers/anthropic.js';

beforeEach(() => {
  fetch.mockClear();
});

test('sends correct headers', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ content: [{ text: 'summary' }] }),
  });
  const p = new AnthropicProvider({ apiKey: 'test-key', model: 'claude-haiku-4-5-20251001' });
  await p.summarize('transcript', 'prompt');
  const [, opts] = fetch.mock.calls[0];
  expect(opts.headers['x-api-key']).toBe('test-key');
  expect(opts.headers['anthropic-version']).toBe('2023-06-01');
});

test('sends prompt as system, transcript as user message', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ content: [{ text: 'ok' }] }),
  });
  const p = new AnthropicProvider({ apiKey: 'k', model: 'claude-haiku-4-5-20251001' });
  await p.summarize('my transcript', 'my prompt');
  const body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body.system).toBe('my prompt');
  expect(body.messages[0]).toEqual({ role: 'user', content: 'my transcript' });
});

test('returns content[0].text from response', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ content: [{ text: '  trimmed summary  ' }] }),
  });
  const p = new AnthropicProvider({ apiKey: 'k', model: 'm' });
  const result = await p.summarize('t', 'p');
  expect(result).toBe('trimmed summary');
});

test('throws on non-ok response with error message', async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    status: 401,
    json: async () => ({ error: { message: 'Invalid API key' } }),
  });
  const p = new AnthropicProvider({ apiKey: 'bad', model: 'm' });
  await expect(p.summarize('t', 'p')).rejects.toThrow('Invalid API key');
});

test('throws when content[0].text is missing', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ content: [] }),
  });
  const p = new AnthropicProvider({ apiKey: 'k', model: 'm' });
  await expect(p.summarize('t', 'p')).rejects.toThrow('no usable response');
});

test('uses DEFAULT_MODEL when no model provided', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ content: [{ text: 'ok' }] }),
  });
  const p = new AnthropicProvider({ apiKey: 'k' });
  await p.summarize('t', 'p');
  const body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body.model).toBe('claude-haiku-4-5-20251001');
});
