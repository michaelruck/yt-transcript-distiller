import { BaseProvider } from './base.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

export class AnthropicProvider extends BaseProvider {
  constructor({ apiKey, model } = {}) {
    super();
    this.apiKey = apiKey;
    this.model = model || DEFAULT_MODEL;
  }

  async summarize(transcript, prompt, options = {}) {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 8192,
        system: prompt,
        messages: [{ role: 'user', content: transcript }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message || `HTTP ${res.status}`;
      throw new Error(`Anthropic API error: ${msg}`);
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text;
    if (!text) throw new Error('Anthropic returned no usable response.');
    return text.trim();
  }
}
