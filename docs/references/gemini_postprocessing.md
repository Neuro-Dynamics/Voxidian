Gemini Postprocessing — Cheat‑Sheet

Summary
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- Method: POST
- Headers:
  - `x-goog-api-key: <GEMINI_API_KEY>`
  - `Content-Type: application/json`
- Common models: `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.5-flash`
- Use case: Clean/polish transcription text without adding new content.

Minimal Request (TypeScript)
```ts
const resp = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  {
    method: 'POST',
    headers: {
      'x-goog-api-key': geminiApiKey,
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
        temperature: preset.temperature ?? 0.2,
      },
    }),
  },
);

const data = await resp.json();
const cleaned =
  data.candidates?.[0]?.content?.parts?.[0]?.text ??
  userContent;
```

Notes
- `systemInstruction` is the best place for your long‑running instructions (for example, “clean up punctuation, don’t add content”).
- `contents[0].parts[0].text` is the main user message; prepend any context (such as current selection) there if you don’t inject it into the system instruction.
- For JSON safety, cap `temperature` to 0–1.
- Respect user privacy: do not log raw transcripts or API keys.
- See the original docs in `docs/sources/gemini/generate_content.html` and `docs/sources/gemini/api_key.html` in this repo.

