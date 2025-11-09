Groq Whisper Transcription — Cheat‑Sheet

Summary
- Endpoint: `https://api.groq.com/openai/v1/audio/transcriptions`
- Method: POST (multipart/form-data)
- Headers:
  - `Authorization: Bearer <GROQ_API_KEY>`
  - Do NOT set `Content-Type` manually; let `FormData` set the boundary.
- Model: `whisper-large-v3`
- Output: JSON containing `text` with the transcription result.

Minimal Request (TypeScript)
```ts
async function transcribeWithGroq(blob: Blob, opts: { apiKey: string; language?: string }) {
  const fd = new FormData();
  fd.append('file', new File([blob], 'audio.webm', { type: 'audio/webm' }));
  fd.append('model', 'whisper-large-v3');
  if (opts.language) fd.append('language', opts.language);

  const resp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${opts.apiKey}` },
    body: fd,
  });
  if (!resp.ok) throw new Error(`GROQ error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return data.text as string;
}
```

Optional Parameters (commonly supported)
- `language`: ISO language code (e.g., `en`) for better accuracy if known.
- `prompt`: Short text to guide the model (names, topic, etc.).
- `temperature`: 0–1; default 0 for more deterministic output.

Notes
- Groq’s OpenAI‑compatible API mirrors OpenAI Whisper’s `audio/transcriptions` shape.
- Accepted audio: Opus WebM (`audio/webm;codecs=opus`) is a good browser default.
- Keep recordings in memory for privacy; avoid disk writes unless user opts in.

