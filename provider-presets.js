// Public connection metadata only. Never put a credential in this file.
export const PROVIDER_PRESETS = [
  { id: 'groq', label: 'Groq (free-tier key)', endpoint: 'https://api.groq.com/openai/v1', models: ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'allam-2-7b', 'openai/gpt-oss-safeguard-20b', 'meta-llama/llama-prompt-guard-2-22m', 'meta-llama/llama-prompt-guard-2-86m'], keyUrl: 'https://console.groq.com/keys', privacyUrl: 'https://console.groq.com/docs/your-data', free: true },
  { id: 'openrouter', label: 'OpenRouter (free models)', endpoint: 'https://openrouter.ai/api/v1', models: ['openrouter/free'], keyUrl: 'https://openrouter.ai/settings/keys', privacyUrl: 'https://openrouter.ai/docs/guides/privacy/data-collection', free: true },
  { id: 'openai', label: 'OpenAI (paid API)', endpoint: 'https://api.openai.com/v1', models: [], keyUrl: 'https://platform.openai.com/api-keys', privacyUrl: 'https://platform.openai.com/docs/guides/your-data', free: false },
  { id: 'custom', label: 'Other OpenAI-compatible API', endpoint: '', models: [], keyUrl: '', privacyUrl: '', free: false }
];
