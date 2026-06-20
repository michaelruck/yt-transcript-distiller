import { GeminiProvider } from './gemini.js';
import { OpenAICompatProvider } from './openai-compat.js';
import { AnthropicProvider } from './anthropic.js';
import { resolveModel } from '../model-list.js';

export async function createProvider(settings) {
  const provider = settings.provider || 'gemini';

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
    const modelId = settings.openrouterCustomModel
      ? settings.openrouterCustomModel
      : (await resolveModel(settings.openrouterModel)).id;
    return new OpenAICompatProvider({
      apiKey: settings.openrouterApiKey,
      model: modelId,
      providerType: 'openrouter',
    });
  }

  if (provider === 'anthropic') {
    return new AnthropicProvider({
      apiKey: settings.anthropicApiKey,
      model: settings.anthropicModel,
    });
  }

  throw new Error(`Unknown provider: ${provider}`);
}
