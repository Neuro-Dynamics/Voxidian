import { Notice } from 'obsidian';
import { logError } from './logging';
import type { AITranscriptSettings } from './types';

export async function transcribeWithGroq(blob: Blob, settings: AITranscriptSettings): Promise<string> {
  if (!settings.groqApiKey) throw new Error('Groq API key is missing in settings.');
  const fd = new FormData();
  fd.append('file', new File([blob], 'audio.webm', { type: blob.type || 'audio/webm' }));
  fd.append('model', settings.groqModel || 'whisper-large-v3');
  if (settings.language) fd.append('language', settings.language);

  const resp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${settings.groqApiKey}` },
    body: fd,
  });
  if (!resp.ok) {
    let detail = await safeText(resp);
    try {
      const parsed = JSON.parse(detail);
      const jsonMsg = (parsed as any)?.error?.message || (parsed as any)?.message;
      if (typeof jsonMsg === 'string' && jsonMsg.trim()) {
        detail = jsonMsg;
      }
    } catch {
      // ignore JSON parse errors; keep raw detail
    }
    const trimmed =
      detail && detail.length > 300 ? `${detail.slice(0, 297)}…` : detail;
    logError('Groq', resp.status, detail || '<no-body>');
    const noticeMsg = trimmed
      ? `Groq transcription failed (${resp.status}): ${trimmed}`
      : `Groq transcription failed (${resp.status}).`;
    new Notice(noticeMsg, 15000);
    throw new Error(`Groq transcription failed (${resp.status}): ${detail || '<no-body>'}`);
  }
  const data = await resp.json();
  if (typeof data?.text !== 'string') throw new Error('Groq response missing text');
  return data.text as string;
}

async function safeText(resp: Response) {
  try { return await resp.text(); } catch { return '<no-body>'; }
}
