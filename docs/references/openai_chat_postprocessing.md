OpenAI Chat Completions — Postprocessing Cheat‑Sheet

Summary
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Method: POST
- Headers:
  - `Authorization: Bearer <OPENAI_API_KEY>`
  - `Content-Type: application/json`
- Common models: `gpt-4o-mini` (fast, cost‑effective), `gpt-4o`
- Use case: Clean/polish transcription text without adding new content.

Minimal Request (TypeScript)
```ts
const resp = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${openaiApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: openaiModel ?? 'gpt-4o-mini',
    temperature: preset.temperature ?? 0.2,
    messages: [
      { role: 'system', content: preset.system ||
        'You clean up spoken text. Fix casing and punctuation, remove filler words, keep meaning. Do not add content.' },
      { role: 'user', content: rawTranscript },
    ],
  }),
});
const data = await resp.json();
const cleaned = data.choices?.[0]?.message?.content ?? rawTranscript;
```

Notes
- Only the `Authorization` header is required; other headers (like `OpenAI-Organization`) are optional.
- If you prefer the Responses API, see: `docs/sources/openai/responses_create.html` in this repo.
- For JSON safety, cap `temperature` to 0–1.
- Respect user privacy: do not log raw transcripts by default.

