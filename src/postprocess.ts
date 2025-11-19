import { Notice } from 'obsidian';
import { logError } from './logging';
import type { AITranscriptSettings, PromptPreset } from './types';

export async function postprocessTranscript(
  raw: string,
  settings: AITranscriptSettings,
  preset?: PromptPreset,
  selection?: string,
): Promise<string> {
  const provider = settings.postprocessingProvider || 'openai';
  if (provider === 'gemini') {
    return postprocessWithGemini(raw, settings, preset, selection);
  }
  return postprocessWithOpenAI(raw, settings, preset, selection);
}

export async function postprocessWithOpenAI(
  raw: string,
  settings: AITranscriptSettings,
  preset?: PromptPreset,
  selection?: string,
): Promise<string> {
  if (!settings.openaiApiKey) return raw; // silently skip if missing
  const { system, userContent } = buildSystemAndUserContent(raw, preset, selection);
  const model = preset?.model || settings.openaiModel || 'gpt-4o-mini';
  const temperature = clamp((preset?.temperature ?? 0.2), 0, 1);

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
        { role: 'user', content: userContent },
      ],
    }),
  });
  if (!resp.ok) {
    // If OpenAI fails, surface a notice and fall back to raw
    let detail = '';
    try {
      const bodyText = await resp.text();
      detail = bodyText;
      try {
        const parsed = JSON.parse(bodyText);
        const jsonMsg = parsed?.error?.message || parsed?.message;
        if (typeof jsonMsg === 'string' && jsonMsg.trim()) {
          detail = jsonMsg;
        }
      } catch {
        // ignore JSON parse errors; keep raw bodyText
      }
    } catch {
      // ignore body read errors
    }
    const trimmed =
      detail && detail.length > 300 ? `${detail.slice(0, 297)}…` : detail;
    logError('OpenAI', resp.status, detail || '<no-body>');
    const noticeMsg = trimmed
      ? `OpenAI postprocessing failed (${resp.status}): ${trimmed}`
      : `OpenAI postprocessing failed (${resp.status}).`;
    new Notice(noticeMsg, 15000);
    return raw;
  }
  const data = await resp.json();
  const cleaned = data?.choices?.[0]?.message?.content;
  return typeof cleaned === 'string' && cleaned.trim() ? cleaned : raw;
}

export async function postprocessWithGemini(
  raw: string,
  settings: AITranscriptSettings,
  preset?: PromptPreset,
  selection?: string,
): Promise<string> {
  if (!settings.geminiApiKey) return raw; // silently skip if missing
  const { system, userContent } = buildSystemAndUserContent(raw, preset, selection);
  const model = preset?.model || settings.geminiModel || 'gemini-1.5-flash';
  const temperature = clamp((preset?.temperature ?? 0.2), 0, 1);

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent` +
    `?key=${encodeURIComponent(settings.geminiApiKey)}`;

  const resp = await fetch(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: system }],
        },
        contents: [
          {
            parts: [{ text: userContent }],
          },
        ],
        generationConfig: {
          temperature,
        },
      }),
    },
  );
  if (!resp.ok) {
    let detail = '';
    try {
      const bodyText = await resp.text();
      detail = bodyText;
      try {
        const parsed = JSON.parse(bodyText);
        const jsonMsg = parsed?.error?.message || parsed?.message;
        if (typeof jsonMsg === 'string' && jsonMsg.trim()) {
          detail = jsonMsg;
        }
      } catch {
      }
    } catch {
    }
    const trimmed =
      detail && detail.length > 300 ? `${detail.slice(0, 297)}…` : detail;
    logError('Gemini', resp.status, detail || '<no-body>');
    const noticeMsg = trimmed
      ? `Gemini postprocessing failed (${resp.status}): ${trimmed}`
      : `Gemini postprocessing failed (${resp.status}).`;
    new Notice(noticeMsg, 15000);
    return raw;
  }
  const data = await resp.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  const cleaned =
    Array.isArray(parts)
      ? parts
          .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
          .filter(Boolean)
          .join('\n')
      : undefined;
  return typeof cleaned === 'string' && cleaned.trim() ? cleaned : raw;
}

function buildSystemAndUserContent(
  raw: string,
  preset?: PromptPreset,
  selection?: string,
): { system: string; userContent: string } {
  let system =
    preset?.system ||
    'You clean up spoken text. Fix capitalization and punctuation, remove filler words, preserve meaning. Do not add content.';

  const sel = (selection || '').trim();
  let userContent = raw;
  if (sel) {
    if (system.includes('{{selection}}')) {
      system = system.split('{{selection}}').join(sel);
    } else {
      const contextBlock = `Context (selected text):\n---\n${sel}\n---\n\n`;
      userContent = contextBlock + raw;
    }
  }
  return { system, userContent };
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
