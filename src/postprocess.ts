import type { AITranscriptSettings, PromptPreset } from './types';

export async function postprocessWithOpenAI(raw: string, settings: AITranscriptSettings, preset?: PromptPreset): Promise<string> {
  if (!settings.openaiApiKey) return raw; // silently skip if missing
  const model = preset?.model || settings.openaiModel || 'gpt-4o-mini';
  const temperature = clamp((preset?.temperature ?? 0.2), 0, 1);
  const system = preset?.system || 'You clean up spoken text. Fix capitalization and punctuation, remove filler words, preserve meaning. Do not add content.';

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: raw },
      ],
    }),
  });
  if (!resp.ok) {
    // If OpenAI fails, return raw rather than breaking insertion
    try { console.warn('OpenAI postprocess failed', resp.status, await resp.text()); } catch {}
    return raw;
  }
  const data = await resp.json();
  const cleaned = data?.choices?.[0]?.message?.content;
  return typeof cleaned === 'string' && cleaned.trim() ? cleaned : raw;
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

