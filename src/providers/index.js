import { GeminiProvider } from './gemini.js';
import { OpenAICompatProvider } from './openai-compat.js';
import { resolveModel } from '../model-list.js';

export async function createProvider(settings) {
  const { provider } = settings;

  if (provider === 'gemini') {
    return new GeminiProvider({ apiKey: settings.geminiApiKey });
  }

  if (provider === 'openai') {
    return new OpenAICompatProvider({
      apiKey: settings.openaiApiKey,
      model: settings.openaiModel || 'gpt-4o-mini',
      providerType: 'openai',
    });
  }

  if (provider === 'openrouter') {
    const resolved = await resolveModel(settings.openrouterModel);
    return new OpenAICompatProvider({
      apiKey: settings.openrouterApiKey,
      model: resolved.id,
      providerType: 'openrouter',
    });
  }

  throw new Error(`Unknown provider: ${provider}`);
}
