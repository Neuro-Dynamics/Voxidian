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
    const text = await safeText(resp);
    throw new Error(`Groq transcription failed (${resp.status}): ${text}`);
  }
  const data = await resp.json();
  if (typeof data?.text !== 'string') throw new Error('Groq response missing text');
  return data.text as string;
}

async function safeText(resp: Response) {
  try { return await resp.text(); } catch { return '<no-body>'; }
}

