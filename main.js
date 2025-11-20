"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AITranscriptPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian5 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var PresetImportModal = class extends import_obsidian.Modal {
  constructor(app, onImport) {
    super(app);
    this.onImport = onImport;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "Import preset" });
    contentEl.createEl("p", {
      text: "Paste a preset JSON exported from Voxidian, or an array of presets."
    });
    const textarea = contentEl.createEl("textarea", { cls: "ai-preset-json-textarea" });
    textarea.rows = 10;
    this.textareaEl = textarea;
    const actions = contentEl.createDiv({ cls: "ai-preset-json-actions" });
    const pasteBtn = actions.createEl("button", { text: "Paste", type: "button" });
    const importBtn = actions.createEl("button", { text: "Import", type: "button" });
    const cancelBtn = actions.createEl("button", { text: "Cancel", type: "button" });
    pasteBtn.addEventListener("click", () => {
      this.handlePaste();
    });
    importBtn.addEventListener("click", () => this.handleImport());
    cancelBtn.addEventListener("click", () => this.close());
  }
  async handlePaste() {
    if (!this.textareaEl) return;
    try {
      const clipboard = navigator?.clipboard;
      if (!clipboard?.readText) {
        new import_obsidian.Notice("Clipboard paste is not available; paste manually.");
        return;
      }
      const text = await clipboard.readText();
      if (!text) {
        new import_obsidian.Notice("Clipboard is empty.");
        return;
      }
      this.textareaEl.value = text;
      this.textareaEl.focus();
    } catch {
      new import_obsidian.Notice("Unable to read from clipboard; paste manually.");
    }
  }
  // Some messaging apps inject invisible or non-breaking characters that JSON.parse rejects.
  sanitizeJsonInput(raw) {
    return raw.replace(/\uFEFF/g, "").replace(/[\u200B-\u200D\u2060]/g, "").replace(/[\u00A0\u2007\u202F]/g, " ").trim();
  }
  async handleImport() {
    if (!this.textareaEl) return;
    const cleaned = this.sanitizeJsonInput(this.textareaEl.value);
    if (!cleaned) {
      new import_obsidian.Notice("Paste preset JSON to import.");
      return;
    }
    try {
      const parsed = JSON.parse(cleaned);
      await this.onImport(parsed);
      this.close();
    } catch (e) {
      new import_obsidian.Notice(`Invalid JSON: ${e?.message ?? e ?? "Unknown error"}`);
    }
  }
};
var AITranscriptSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin, getSettings, saveSettings, getErrorLog, clearErrorLog) {
    super(app, plugin);
    this.getSettings = getSettings;
    this.saveSettings = saveSettings;
    this.getErrorLog = getErrorLog;
    this.clearErrorLog = clearErrorLog;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h1", { text: "Voxidian" });
    const s = this.getSettings();
    containerEl.createEl("h3", { text: "Groq Whisper" });
    new import_obsidian.Setting(containerEl).setName("Groq API Key").setDesc("Required to transcribe audio via Groq Whisper.").addText((t) => t.setPlaceholder("gsk_...").setValue(s.groqApiKey || "").onChange(async (v) => {
      await this.saveSettings({ groqApiKey: v.trim() });
    }));
    new import_obsidian.Setting(containerEl).setName("Groq model").setDesc("Default: whisper-large-v3").addText((t) => t.setValue(s.groqModel).onChange(async (v) => {
      await this.saveSettings({ groqModel: v.trim() || "whisper-large-v3" });
    }));
    new import_obsidian.Setting(containerEl).setName("Language (optional)").setDesc("ISO code like en, es, de. Leave empty for auto.").addText((t) => t.setValue(s.language || "").onChange(async (v) => {
      await this.saveSettings({ language: v.trim() || void 0 });
    }));
    containerEl.createEl("h3", { text: "OpenAI Postprocessing (optional)" });
    new import_obsidian.Setting(containerEl).setName("OpenAI API Key").addText((t) => t.setPlaceholder("sk-...").setValue(s.openaiApiKey || "").onChange(async (v) => {
      await this.saveSettings({ openaiApiKey: v.trim() });
    }));
    new import_obsidian.Setting(containerEl).setName("OpenAI model").setDesc("Default: gpt-4o-mini").addText((t) => t.setValue(s.openaiModel).onChange(async (v) => {
      await this.saveSettings({ openaiModel: v.trim() || "gpt-4o-mini" });
    }));
    containerEl.createEl("h3", { text: "Gemini Postprocessing (optional)" });
    new import_obsidian.Setting(containerEl).setName("Gemini API Key").setDesc("Required to postprocess using Gemini.").addText((t) => t.setPlaceholder("AIza...").setValue(s.geminiApiKey || "").onChange(async (v) => {
      await this.saveSettings({ geminiApiKey: v.trim() });
    }));
    new import_obsidian.Setting(containerEl).setName("Gemini model").setDesc("Default: gemini-1.5-flash").addText((t) => t.setValue(s.geminiModel).onChange(async (v) => {
      await this.saveSettings({ geminiModel: v.trim() || "gemini-1.5-flash" });
    }));
    new import_obsidian.Setting(containerEl).setName("Postprocessing provider").setDesc("Which API to use when applying postprocessing presets.").addDropdown((d) => d.addOption("openai", "OpenAI").addOption("gemini", "Gemini").setValue(s.postprocessingProvider || "openai").onChange(async (v) => {
      await this.saveSettings({ postprocessingProvider: v });
    }));
    containerEl.createEl("hr");
    containerEl.createEl("br");
    const presetSection = containerEl.createDiv({ cls: "ai-preset-section" });
    presetSection.createEl("h3", { text: "Prompt presets", cls: "ai-preset-section-title" });
    const presetActions = presetSection.createDiv({ cls: "ai-preset-section-actions" });
    const listEl = containerEl.createDiv();
    const renderPresets = () => {
      listEl.empty();
      const st = this.getSettings();
      st.promptPresets.forEach((p) => {
        const wrap = listEl.createDiv({ cls: "ai-preset" });
        const header = wrap.createDiv({ cls: "ai-preset-header" });
        const title = header.createDiv({ cls: "ai-preset-title" });
        title.createEl("h4", { text: p.name, cls: "ai-preset-name" });
        if (st.defaultPromptId === p.id) title.createSpan({ text: "Default", cls: "ai-preset-default" });
        const actionsEl = header.createDiv({ cls: "ai-preset-actions" });
        new import_obsidian.ButtonComponent(actionsEl).setButtonText("Set as Default").onClick(async () => {
          await this.saveSettings({ defaultPromptId: p.id });
          renderPresets();
        });
        new import_obsidian.ButtonComponent(actionsEl).setIcon("copy").setTooltip("Export preset as JSON").onClick(async () => {
          const exportPreset = {
            id: p.id,
            name: p.name,
            system: p.system,
            temperature: p.temperature,
            includeTranscriptWithPostprocessed: p.includeTranscriptWithPostprocessed,
            replaceSelection: p.replaceSelection,
            model: p.model
          };
          const json = JSON.stringify(exportPreset, null, 2);
          try {
            const clipboard = navigator?.clipboard;
            if (clipboard?.writeText) {
              await clipboard.writeText(json);
              new import_obsidian.Notice("Preset JSON copied to clipboard.");
            } else {
              console.log("Voxidian preset JSON:", json);
              new import_obsidian.Notice("Clipboard unavailable; JSON logged to console.");
            }
          } catch {
            console.log("Voxidian preset JSON (failed clipboard):", json);
            new import_obsidian.Notice("Unable to access clipboard; JSON logged to console.");
          }
        });
        new import_obsidian.ButtonComponent(actionsEl).setIcon("trash").setTooltip("Delete preset").setWarning().onClick(async () => {
          const filtered = st.promptPresets.filter((x) => x.id !== p.id);
          await this.saveSettings({ promptPresets: filtered });
          renderPresets();
        });
        new import_obsidian.Setting(wrap).setName("Name").addText((t) => t.setValue(p.name).onChange(async (v) => {
          p.name = v;
          await this.saveSettings({ promptPresets: st.promptPresets });
        }));
        new import_obsidian.Setting(wrap).setName("System prompt").setDesc("Supports {{selection}} placeholder; when absent, current selection is prepended as context.").addTextArea((t) => {
          t.setValue(p.system);
          t.inputEl.rows = 6;
          t.inputEl.addClass("ai-system-textarea");
          t.onChange(async (v) => {
            p.system = v;
            await this.saveSettings({ promptPresets: st.promptPresets });
          });
        });
        new import_obsidian.Setting(wrap).setName("Temperature").addText((t) => t.setValue(String(p.temperature)).onChange(async (v) => {
          const num = Number(v);
          p.temperature = isFinite(num) ? num : 0.2;
          await this.saveSettings({ promptPresets: st.promptPresets });
        }));
        new import_obsidian.Setting(wrap).setName("Model override (optional)").addText((t) => t.setPlaceholder("e.g., gpt-4o-mini").setValue(p.model || "").onChange(async (v) => {
          p.model = v.trim() || void 0;
          await this.saveSettings({ promptPresets: st.promptPresets });
        }));
        new import_obsidian.Setting(wrap).setName("Include transcript with postprocessed message").setDesc('Prepends the raw transcript quoted with ">" when postprocessing succeeds.').addToggle((t) => t.setValue(p.includeTranscriptWithPostprocessed ?? true).onChange(async (v) => {
          p.includeTranscriptWithPostprocessed = v;
          await this.saveSettings({ promptPresets: st.promptPresets });
        }));
        new import_obsidian.Setting(wrap).setName("Replace selection").setDesc("When enabled, Voxidian replaces the current editor selection with this preset's output.").addToggle((t) => t.setValue(p.replaceSelection ?? st.insertMode === "replace").onChange(async (v) => {
          p.replaceSelection = v;
          await this.saveSettings({ promptPresets: st.promptPresets });
        }));
        wrap.createEl("br");
      });
    };
    const addPreset = async () => {
      const st = this.getSettings();
      const id = `preset-${Date.now()}`;
      const preset = { id, name: "New Preset", system: "Edit me\u2026", temperature: 0.2, includeTranscriptWithPostprocessed: true };
      await this.saveSettings({ promptPresets: [...st.promptPresets, preset] });
      renderPresets();
    };
    const openImportModal = () => {
      const modal = new PresetImportModal(this.app, async (value) => {
        const st = this.getSettings();
        const existing = [...st.promptPresets];
        const newPresets = [];
        const addOne = (raw) => {
          if (!raw || typeof raw !== "object") return;
          const baseId = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : `preset-${Date.now()}-${newPresets.length}`;
          const isIdUsed = (id2) => existing.some((p) => p.id === id2) || newPresets.some((p) => p.id === id2);
          let id = baseId;
          let suffix = 1;
          while (isIdUsed(id)) {
            id = `${baseId}-${suffix++}`;
          }
          const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : "Imported preset";
          const system = typeof raw.system === "string" && raw.system.trim() ? raw.system : "Edit me\u2026";
          const temperature = typeof raw.temperature === "number" && isFinite(raw.temperature) ? raw.temperature : 0.2;
          const includeTranscriptWithPostprocessed = typeof raw.includeTranscriptWithPostprocessed === "boolean" ? raw.includeTranscriptWithPostprocessed : true;
          const replaceSelection = typeof raw.replaceSelection === "boolean" ? raw.replaceSelection : void 0;
          const model = typeof raw.model === "string" && raw.model.trim() ? raw.model.trim() : void 0;
          newPresets.push({
            id,
            name,
            system,
            temperature,
            includeTranscriptWithPostprocessed,
            replaceSelection,
            model
          });
        };
        if (Array.isArray(value)) {
          value.forEach(addOne);
        } else {
          addOne(value);
        }
        if (!newPresets.length) {
          new import_obsidian.Notice("No valid presets found in JSON.");
          return;
        }
        await this.saveSettings({ promptPresets: [...existing, ...newPresets] });
        renderPresets();
        new import_obsidian.Notice(
          newPresets.length === 1 ? "Imported 1 preset." : `Imported ${newPresets.length} presets.`
        );
      });
      modal.open();
    };
    renderPresets();
    new import_obsidian.ButtonComponent(presetActions).setButtonText("Add preset").onClick(addPreset);
    new import_obsidian.ButtonComponent(presetActions).setButtonText("Import").onClick(openImportModal);
    containerEl.createEl("hr");
    containerEl.createEl("h3", { text: "Recording & Insertion" });
    new import_obsidian.Setting(containerEl).setName("Show recording modal").addToggle((t) => t.setValue(s.showModalWhileRecording).onChange(async (v) => {
      await this.saveSettings({ showModalWhileRecording: v });
    }));
    new import_obsidian.Setting(containerEl).setName("Max duration (seconds)").addText((t) => t.setValue(String(s.maxDurationSec)).onChange(async (v) => {
      const n = Number(v);
      await this.saveSettings({ maxDurationSec: isFinite(n) && n > 0 ? Math.floor(n) : 900 });
    }));
    new import_obsidian.Setting(containerEl).setName("Insert mode").setDesc("Insert at cursor or replace selection").addDropdown((d) => d.addOption("insert", "Insert at cursor").addOption("replace", "Replace selection").setValue(s.insertMode).onChange(async (v) => {
      await this.saveSettings({ insertMode: v });
      renderPresets();
    }));
    new import_obsidian.Setting(containerEl).setName("Add newline before").addToggle((t) => t.setValue(s.addNewlineBefore).onChange(async (v) => {
      await this.saveSettings({ addNewlineBefore: v });
    }));
    new import_obsidian.Setting(containerEl).setName("Add newline after").addToggle((t) => t.setValue(s.addNewlineAfter).onChange(async (v) => {
      await this.saveSettings({ addNewlineAfter: v });
    }));
    containerEl.createEl("h3", { text: "Error log" });
    new import_obsidian.Setting(containerEl).setName("Clear error log").setDesc("Removes stored Voxidian error entries from this vault.").addButton(
      (b) => b.setButtonText("Clear log").setCta().onClick(async () => {
        if (!this.clearErrorLog) return;
        await this.clearErrorLog();
        new import_obsidian.Notice("Voxidian error log cleared.");
        this.display();
      })
    );
    const logContainer = containerEl.createDiv({ cls: "voxidian-error-log" });
    const log = this.getErrorLog ? this.getErrorLog() : [];
    if (!log || !log.length) {
      logContainer.createEl("p", { text: "No errors recorded yet." });
    } else {
      const list = logContainer.createEl("ul", { cls: "voxidian-error-log-list" });
      const entries = [...log].sort((a, b) => b.ts - a.ts).slice(0, 50);
      for (const entry of entries) {
        const li = list.createEl("li", { cls: "voxidian-error-log-item" });
        const ts = new Date(entry.ts).toLocaleString();
        const status = typeof entry.status === "number" ? ` ${entry.status}` : "";
        li.createEl("div", {
          cls: "voxidian-error-log-meta",
          text: `${ts} \u2014 ${entry.source}${status}`
        });
        if (entry.detail) {
          const pre = li.createEl("pre", { cls: "voxidian-error-log-detail" });
          pre.textContent = entry.detail;
        }
      }
    }
  }
};

// src/recorder.ts
var AudioRecorder = class {
  constructor(onTick) {
    this.onTick = onTick;
    this.chunks = [];
    this.startedAt = 0;
  }
  async start() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") return;
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeCandidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      ""
    ];
    let mimeType = "";
    for (const cand of mimeCandidates) {
      if (!cand || window.MediaRecorder?.isTypeSupported?.(cand)) {
        mimeType = cand;
        break;
      }
    }
    this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : void 0);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data?.size) this.chunks.push(e.data);
    };
    this.mediaRecorder.start(250);
    this.startedAt = Date.now();
    if (this.onTick) this.timer = window.setInterval(() => this.onTick(Date.now() - this.startedAt), 200);
  }
  pause() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording" && typeof this.mediaRecorder.pause === "function") {
      this.mediaRecorder.pause();
    }
  }
  resume() {
    if (this.mediaRecorder && this.mediaRecorder.state === "paused" && typeof this.mediaRecorder.resume === "function") {
      this.mediaRecorder.resume();
    }
  }
  async stop() {
    const rec = this.mediaRecorder;
    if (!rec) throw new Error("Recorder not started");
    const stopPromise = new Promise((resolve) => {
      rec.onstop = () => resolve();
    });
    if (rec.state !== "inactive") rec.stop();
    await stopPromise;
    const blob = new Blob(this.chunks, { type: this.chunks.length ? this.chunks[0].type || "audio/webm" : "audio/webm" });
    this.cleanup();
    return blob;
  }
  discard() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") this.mediaRecorder.stop();
    this.cleanup();
  }
  cleanup() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = void 0;
    this.mediaRecorder = void 0;
    this.startedAt = 0;
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = void 0;
    }
    this.chunks = [];
  }
};

// src/postprocess.ts
var import_obsidian2 = require("obsidian");

// src/logging.ts
var errorLogSink;
function registerErrorLogSink(fn) {
  errorLogSink = fn;
}
function logError(source, status, detail) {
  const entry = {
    ts: Date.now(),
    source,
    status,
    detail
  };
  try {
    const w = window;
    if (!Array.isArray(w.VoxidianErrorLog)) {
      w.VoxidianErrorLog = [];
    }
    w.VoxidianErrorLog.push(entry);
  } catch {
  }
  try {
    if (errorLogSink) errorLogSink(entry);
  } catch (e) {
    console.error("[Voxidian] error log sink failed", e);
  }
  console.warn("[Voxidian]", source, "error", status, detail || "<no-body>");
}

// src/postprocess.ts
async function postprocessTranscript(raw, settings, preset, selection) {
  const provider = settings.postprocessingProvider || "openai";
  if (provider === "gemini") {
    return postprocessWithGemini(raw, settings, preset, selection);
  }
  return postprocessWithOpenAI(raw, settings, preset, selection);
}
async function postprocessWithOpenAI(raw, settings, preset, selection) {
  if (!settings.openaiApiKey) return raw;
  const { system, userContent } = buildSystemAndUserContent(raw, preset, selection);
  const model = preset?.model || settings.openaiModel || "gpt-4o-mini";
  const temperature = clamp(preset?.temperature ?? 0.2, 0, 1);
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${settings.openaiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent }
      ]
    })
  });
  if (!resp.ok) {
    let detail = "";
    try {
      const bodyText = await resp.text();
      detail = bodyText;
      try {
        const parsed = JSON.parse(bodyText);
        const jsonMsg = parsed?.error?.message || parsed?.message;
        if (typeof jsonMsg === "string" && jsonMsg.trim()) {
          detail = jsonMsg;
        }
      } catch {
      }
    } catch {
    }
    const trimmed = detail && detail.length > 300 ? `${detail.slice(0, 297)}\u2026` : detail;
    logError("OpenAI", resp.status, detail || "<no-body>");
    const noticeMsg = trimmed ? `OpenAI postprocessing failed (${resp.status}): ${trimmed}` : `OpenAI postprocessing failed (${resp.status}).`;
    new import_obsidian2.Notice(noticeMsg, 15e3);
    return raw;
  }
  const data = await resp.json();
  const cleaned = data?.choices?.[0]?.message?.content;
  return typeof cleaned === "string" && cleaned.trim() ? cleaned : raw;
}
async function postprocessWithGemini(raw, settings, preset, selection) {
  if (!settings.geminiApiKey) return raw;
  const { system, userContent } = buildSystemAndUserContent(raw, preset, selection);
  const model = preset?.model || settings.geminiModel || "gemini-1.5-flash";
  const temperature = clamp(preset?.temperature ?? 0.2, 0, 1);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(settings.geminiApiKey)}`;
  const resp = await fetch(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: system }]
        },
        contents: [
          {
            parts: [{ text: userContent }]
          }
        ],
        generationConfig: {
          temperature
        }
      })
    }
  );
  if (!resp.ok) {
    let detail = "";
    try {
      const bodyText = await resp.text();
      detail = bodyText;
      try {
        const parsed = JSON.parse(bodyText);
        const jsonMsg = parsed?.error?.message || parsed?.message;
        if (typeof jsonMsg === "string" && jsonMsg.trim()) {
          detail = jsonMsg;
        }
      } catch {
      }
    } catch {
    }
    const trimmed = detail && detail.length > 300 ? `${detail.slice(0, 297)}\u2026` : detail;
    logError("Gemini", resp.status, detail || "<no-body>");
    const noticeMsg = trimmed ? `Gemini postprocessing failed (${resp.status}): ${trimmed}` : `Gemini postprocessing failed (${resp.status}).`;
    new import_obsidian2.Notice(noticeMsg, 15e3);
    return raw;
  }
  const data = await resp.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  const cleaned = Array.isArray(parts) ? parts.map((p) => typeof p?.text === "string" ? p.text : "").filter(Boolean).join("\n") : void 0;
  return typeof cleaned === "string" && cleaned.trim() ? cleaned : raw;
}
function buildSystemAndUserContent(raw, preset, selection) {
  let system = preset?.system || "You clean up spoken text. Fix capitalization and punctuation, remove filler words, preserve meaning. Do not add content.";
  const sel = (selection || "").trim();
  let userContent = raw;
  if (sel) {
    if (system.includes("{{selection}}")) {
      system = system.split("{{selection}}").join(sel);
    } else {
      const contextBlock = `Context (selected text):
---
${sel}
---

`;
      userContent = contextBlock + raw;
    }
  }
  return { system, userContent };
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// src/transcribe.ts
var import_obsidian3 = require("obsidian");
async function transcribeWithGroq(blob, settings) {
  if (!settings.groqApiKey) throw new Error("Groq API key is missing in settings.");
  const fd = new FormData();
  fd.append("file", new File([blob], "audio.webm", { type: blob.type || "audio/webm" }));
  fd.append("model", settings.groqModel || "whisper-large-v3");
  if (settings.language) fd.append("language", settings.language);
  const resp = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${settings.groqApiKey}` },
    body: fd
  });
  if (!resp.ok) {
    let detail = await safeText(resp);
    try {
      const parsed = JSON.parse(detail);
      const jsonMsg = parsed?.error?.message || parsed?.message;
      if (typeof jsonMsg === "string" && jsonMsg.trim()) {
        detail = jsonMsg;
      }
    } catch {
    }
    const trimmed = detail && detail.length > 300 ? `${detail.slice(0, 297)}\u2026` : detail;
    logError("Groq", resp.status, detail || "<no-body>");
    const noticeMsg = trimmed ? `Groq transcription failed (${resp.status}): ${trimmed}` : `Groq transcription failed (${resp.status}).`;
    new import_obsidian3.Notice(noticeMsg, 15e3);
    throw new Error(`Groq transcription failed (${resp.status}): ${detail || "<no-body>"}`);
  }
  const data = await resp.json();
  if (typeof data?.text !== "string") throw new Error("Groq response missing text");
  return data.text;
}
async function safeText(resp) {
  try {
    return await resp.text();
  } catch {
    return "<no-body>";
  }
}

// src/types.ts
var DEFAULT_PRESET = {
  id: "polished",
  name: "Polished",
  system: "You clean up spoken text. Fix capitalization and punctuation, remove filler words, preserve meaning. Do not add content.",
  temperature: 0.2
};
var DEFAULT_SETTINGS = {
  groqApiKey: "",
  groqModel: "whisper-large-v3",
  language: void 0,
  openaiApiKey: "",
  openaiModel: "gpt-4o-mini",
  geminiApiKey: "",
  geminiModel: "gemini-1.5-flash",
  postprocessingProvider: "openai",
  promptPresets: [DEFAULT_PRESET],
  defaultPromptId: "polished",
  lastUsedPromptId: "polished",
  showModalWhileRecording: true,
  maxDurationSec: 900,
  insertMode: "insert",
  addNewlineBefore: false,
  addNewlineAfter: true
};

// src/ui/RecordingModal.ts
var import_obsidian4 = require("obsidian");
var RecordingModal = class extends import_obsidian4.Modal {
  constructor(app, opts) {
    super(app);
    this.opts = opts;
    this.startedAt = 0;
    this.isPaused = false;
    this.pauseStartedAt = 0;
    this.accumulatedPauseMs = 0;
    this.outsideCaptureOpts = { capture: true };
    this.outsideTouchOpts = { capture: true, passive: false };
    this.preventOutsideClose = (evt) => {
      if (!this.modalEl) return;
      if (this.modalEl.contains(evt.target)) return;
      evt.preventDefault();
      evt.stopPropagation();
      evt.stopImmediatePropagation();
    };
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("voxidian-modal");
    this.rootEl = contentEl.createDiv({ cls: "voxidian-root" });
    this.rootEl.setAttribute("data-phase", "recording");
    const header = this.rootEl.createDiv({ cls: "voxidian-header" });
    header.createEl("h3", { text: "Voxidian" });
    const headerRight = header.createDiv({ cls: "voxidian-header-right" });
    headerRight.createDiv({ cls: "ai-rec-indicator", attr: { "aria-label": "Recording indicator" } });
    this.elapsedEl = headerRight.createDiv({ text: "00:00", cls: "voxidian-timer" });
    this.pauseBtnEl = headerRight.createEl("button", {
      text: "\u275A\u275A",
      type: "button",
      cls: "voxidian-pause",
      attr: { "aria-label": "Pause recording", "aria-pressed": "false" }
    });
    this.pauseBtnEl.addEventListener("click", () => this.togglePause());
    this.resetPauseState();
    const body = this.rootEl.createDiv({ cls: "voxidian-body" });
    new import_obsidian4.Setting(body).setName("Postprocessing preset").addDropdown((d) => {
      this.presetDropdown = d;
      for (const p of this.opts.presets) d.addOption(p.id, p.name);
      if (this.opts.defaultPresetId) d.setValue(this.opts.defaultPresetId);
    });
    const btns = body.createDiv({ cls: "voxidian-buttons" });
    this.transcribeBtnEl = btns.createEl("button", { text: "Transcribe", type: "button" });
    this.postprocessBtnEl = btns.createEl("button", { text: "PostProcess", type: "button" });
    this.discardBtnEl = btns.createEl("button", { text: "Cancel", type: "button" });
    this.transcribeBtnEl.addEventListener("click", () => this.triggerStop(false));
    this.postprocessBtnEl.addEventListener("click", () => this.triggerStop(true));
    this.discardBtnEl.addEventListener("click", () => this.opts.onDiscard());
    const statusBar = this.rootEl.createDiv({ cls: "voxidian-statusbar" });
    const statusWrap = statusBar.createDiv({ cls: "ai-status-wrap" });
    statusWrap.createDiv({ cls: "ai-spinner", attr: { "aria-label": "Working\u2026" } });
    this.statusTextEl = statusWrap.createDiv({ cls: "ai-status-text", text: "Listening\u2026" });
    this.modalEl.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.opts.onDiscard();
      if (e.key === "Enter") {
        e.preventDefault();
        this.triggerStop(false);
      }
    });
    this.containerEl.addEventListener("pointerdown", this.preventOutsideClose, this.outsideCaptureOpts);
    this.containerEl.addEventListener("click", this.preventOutsideClose, this.outsideCaptureOpts);
    this.containerEl.addEventListener("touchstart", this.preventOutsideClose, this.outsideTouchOpts);
    this.startedAt = Date.now();
    this.timer = window.setInterval(() => this.tick(), 200);
    this.opts.onStart?.();
  }
  onClose() {
    this.containerEl.removeEventListener("pointerdown", this.preventOutsideClose, this.outsideCaptureOpts);
    this.containerEl.removeEventListener("click", this.preventOutsideClose, this.outsideCaptureOpts);
    this.containerEl.removeEventListener("touchstart", this.preventOutsideClose, this.outsideTouchOpts);
    if (this.timer) window.clearInterval(this.timer);
    this.timer = void 0;
    this.contentEl.empty();
    this.opts.onClose?.();
  }
  tick() {
    const elapsedMs = this.getElapsedMs();
    const sec = Math.floor(elapsedMs / 1e3);
    const mm = Math.floor(sec / 60).toString().padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");
    if (this.elapsedEl) this.elapsedEl.textContent = `${mm}:${ss}`;
    if (this.opts.maxDurationSec > 0 && !this.isPaused && sec >= this.opts.maxDurationSec) {
      this.triggerStop(false);
    }
  }
  getElapsedMs() {
    if (!this.startedAt) return 0;
    const now = Date.now();
    let elapsed = now - this.startedAt - this.accumulatedPauseMs;
    if (this.isPaused && this.pauseStartedAt) {
      elapsed -= now - this.pauseStartedAt;
    }
    return Math.max(0, elapsed);
  }
  triggerStop(applyPost) {
    this.finalizePauseState();
    const presetId = this.presetDropdown?.getValue();
    this.opts.onStop(applyPost, presetId);
  }
  togglePause() {
    if (this.isPaused) {
      this.resumeRecording();
    } else {
      this.pauseRecording();
    }
  }
  pauseRecording() {
    if (this.isPaused) return;
    this.isPaused = true;
    this.pauseStartedAt = Date.now();
    this.updatePauseButtonLabel();
    this.opts.onPause?.();
  }
  resumeRecording() {
    if (!this.isPaused) return;
    if (this.pauseStartedAt) this.accumulatedPauseMs += Date.now() - this.pauseStartedAt;
    this.pauseStartedAt = 0;
    this.isPaused = false;
    this.updatePauseButtonLabel();
    this.opts.onResume?.();
  }
  finalizePauseState() {
    if (this.isPaused && this.pauseStartedAt) {
      this.accumulatedPauseMs += Date.now() - this.pauseStartedAt;
    }
    this.isPaused = false;
    this.pauseStartedAt = 0;
    this.updatePauseButtonLabel();
  }
  resetPauseState() {
    this.isPaused = false;
    this.pauseStartedAt = 0;
    this.accumulatedPauseMs = 0;
    this.updatePauseButtonLabel();
  }
  updatePauseButtonLabel() {
    if (!this.pauseBtnEl) return;
    this.pauseBtnEl.classList.toggle("is-paused", this.isPaused);
    this.pauseBtnEl.textContent = this.isPaused ? "\u25B6" : "\u275A\u275A";
    this.pauseBtnEl.setAttribute("aria-pressed", this.isPaused ? "true" : "false");
    this.pauseBtnEl.setAttribute("aria-label", this.isPaused ? "Resume recording" : "Pause recording");
  }
  // Public UI helpers
  setPhase(phase) {
    this.rootEl?.setAttribute("data-phase", phase);
    if (phase !== "recording") {
      this.finalizePauseState();
      if (this.timer) {
        window.clearInterval(this.timer);
        this.timer = void 0;
      }
    }
    if (this.pauseBtnEl) this.pauseBtnEl.disabled = phase !== "recording";
  }
  setStatus(text) {
    if (this.statusTextEl) this.statusTextEl.textContent = text;
  }
  setActionButtonsEnabled(transcribeEnabled, postprocessEnabled, discardEnabled) {
    if (this.transcribeBtnEl) this.transcribeBtnEl.disabled = !transcribeEnabled;
    if (this.postprocessBtnEl) this.postprocessBtnEl.disabled = !postprocessEnabled;
    if (this.discardBtnEl) this.discardBtnEl.disabled = !discardEnabled;
  }
  setDiscardLabel(label) {
    if (this.discardBtnEl) this.discardBtnEl.textContent = label;
  }
};

// src/main.ts
var AITranscriptPlugin = class extends import_obsidian5.Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS, promptPresets: [...DEFAULT_SETTINGS.promptPresets] };
    this.errorLog = [];
  }
  async onload() {
    const raw = await this.loadData();
    if (raw && raw.settings) {
      const data = raw;
      this.settings = Object.assign({}, DEFAULT_SETTINGS, data.settings || {});
      this.errorLog = Array.isArray(data.errorLog) ? data.errorLog : [];
    } else {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, raw || {});
      this.errorLog = [];
    }
    registerErrorLogSink((entry) => {
      this.appendErrorLog(entry);
    });
    this.addRibbonIcon("mic", "Record & Transcribe", () => this.toggleRecording());
    this.addCommand({
      id: "voxidian-start-stop",
      name: "Start/Stop Recording",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "M" }],
      callback: () => this.toggleRecording()
    });
    this.addCommand({
      id: "record-transcribe-insert",
      name: "Record \u2022 Transcribe \u2022 Insert",
      icon: "mic",
      editorCallback: () => this.toggleRecording()
    });
    this.addSettingTab(
      new AITranscriptSettingTab(
        this.app,
        this,
        () => this.settings,
        async (partial) => {
          Object.assign(this.settings, partial);
          await this.saveAllData();
        },
        () => this.errorLog,
        async () => {
          await this.clearErrorLog();
        }
      )
    );
  }
  onunload() {
    try {
      this.recorder?.discard();
    } catch {
    }
    try {
      this.modal?.close();
    } catch {
    }
  }
  async toggleRecording() {
    if (this.modal) {
      return;
    }
    const view = this.app.workspace.getActiveViewOfType(import_obsidian5.MarkdownView);
    if (!view) return;
    this.recorder = new AudioRecorder();
    const presets = this.settings.promptPresets.map((p) => ({ id: p.id, name: p.name }));
    const modal = new RecordingModal(this.app, {
      presets,
      defaultPresetId: this.settings.lastUsedPromptId || this.settings.defaultPromptId,
      maxDurationSec: this.settings.maxDurationSec,
      onStart: async () => {
        try {
          await this.recorder.start();
        } catch (e) {
          console.error(e);
          modal.setPhase("error");
          modal.setStatus("Microphone permission or recorder error.");
          modal.setActionButtonsEnabled(false, false, true);
          modal.setDiscardLabel("Close");
          this.recorder?.discard();
          this.recorder = void 0;
        }
      },
      onStop: async (applyPost, presetId) => {
        modal.setActionButtonsEnabled(false, false, false);
        modal.setPhase("transcribing");
        modal.setStatus("Transcribing\u2026");
        try {
          let preset;
          const blob = await this.recorder.stop();
          this.recorder = void 0;
          const raw = await transcribeWithGroq(blob, this.settings);
          let text = raw;
          if (applyPost) {
            preset = this.settings.promptPresets.find((p) => p.id === presetId);
            this.settings.lastUsedPromptId = preset?.id || presetId || this.settings.lastUsedPromptId;
            await this.saveAllData();
            modal.setPhase("postprocessing");
            modal.setStatus("Cleaning transcript\u2026");
            const activeView = this.app.workspace.getActiveViewOfType(import_obsidian5.MarkdownView);
            const selection = activeView?.editor?.getSelection() || "";
            text = await postprocessTranscript(raw, this.settings, preset, selection);
          }
          const finalOutput = this.combineTranscripts(raw, text, applyPost, preset);
          await this.insertText(finalOutput, preset?.replaceSelection);
          modal.setPhase("done");
          modal.setStatus("Transcript inserted into the note.");
          modal.setActionButtonsEnabled(false, false, true);
          modal.setDiscardLabel("Close");
          modal.close();
          if (this.modal === modal) this.modal = void 0;
        } catch (e) {
          console.error(e);
          modal.setPhase("error");
          modal.setStatus(`Error: ${e?.message || e}`);
          modal.setActionButtonsEnabled(false, false, true);
          modal.setDiscardLabel("Close");
          try {
            this.recorder?.discard();
          } catch {
          }
          this.recorder = void 0;
        } finally {
        }
      },
      onDiscard: () => {
        try {
          this.recorder?.discard();
        } catch {
        }
        this.recorder = void 0;
        modal.close();
        this.modal = void 0;
      },
      onPause: () => this.recorder?.pause(),
      onResume: () => this.recorder?.resume(),
      onClose: () => {
        try {
          this.recorder?.discard();
        } catch {
        }
        this.recorder = void 0;
        if (this.modal === modal) this.modal = void 0;
      }
    });
    this.modal = modal;
    modal.open();
  }
  async insertText(text, replaceSelectionOverride) {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian5.MarkdownView);
    if (!view) throw new Error("No active Markdown editor");
    const editor = view.editor;
    const normalized = text.startsWith(" ") ? text.slice(1) : text;
    const before = this.settings.addNewlineBefore ? "\n" : "";
    const after = this.settings.addNewlineAfter ? "\n" : "";
    const content = `${before}${normalized}${after}`;
    let start;
    const replaceSelection = replaceSelectionOverride ?? this.settings.insertMode === "replace";
    if (replaceSelection && editor.somethingSelected()) {
      start = editor.getCursor("from");
      editor.replaceSelection(content);
    } else {
      start = editor.getCursor();
      editor.replaceRange(content, start);
    }
    const caret = this.advancePos(start, `${before}${normalized}`);
    editor.setCursor(caret);
  }
  advancePos(start, text) {
    const parts = text.split("\n");
    if (parts.length === 1) return { line: start.line, ch: start.ch + parts[0].length };
    const linesAdded = parts.length - 1;
    const lastLen = parts[parts.length - 1].length;
    return { line: start.line + linesAdded, ch: lastLen };
  }
  combineTranscripts(raw, processed, postprocessedApplied, preset) {
    const includeTranscriptWithPostprocessed = preset?.includeTranscriptWithPostprocessed ?? true;
    if (!(postprocessedApplied && includeTranscriptWithPostprocessed)) return processed;
    const quoted = this.quoteTranscript(raw);
    if (!quoted) return processed;
    return processed.trim().length ? `${quoted}

${processed}` : quoted;
  }
  quoteTranscript(raw) {
    const normalized = raw.trim();
    if (!normalized) return "";
    const paragraphs = normalized.split(/\n\s*\n/);
    const quotedBlocks = paragraphs.map((paragraph) => {
      const lines = paragraph.split("\n");
      return lines.map((line) => `> ${line.trimEnd()}`).join("\n");
    });
    return quotedBlocks.join("\n>\n");
  }
  async saveAllData() {
    const payload = {
      settings: this.settings,
      errorLog: this.errorLog
    };
    await this.saveData(payload);
  }
  appendErrorLog(entry) {
    this.errorLog.push(entry);
    if (this.errorLog.length > 200) {
      this.errorLog = this.errorLog.slice(-200);
    }
    this.saveAllData().catch((e) => console.error("[Voxidian] failed to persist error log", e));
  }
  async clearErrorLog() {
    this.errorLog = [];
    try {
      const w = window;
      if (Array.isArray(w.VoxidianErrorLog)) {
        w.VoxidianErrorLog = [];
      }
    } catch {
    }
    await this.saveAllData();
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9yZWNvcmRlci50cyIsICJzcmMvcG9zdHByb2Nlc3MudHMiLCAic3JjL2xvZ2dpbmcudHMiLCAic3JjL3RyYW5zY3JpYmUudHMiLCAic3JjL3R5cGVzLnRzIiwgInNyYy91aS9SZWNvcmRpbmdNb2RhbC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQXBwLCBNYXJrZG93blZpZXcsIFBsdWdpbiwgdHlwZSBFZGl0b3JQb3NpdGlvbiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEFJVHJhbnNjcmlwdFNldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IEF1ZGlvUmVjb3JkZXIgfSBmcm9tICcuL3JlY29yZGVyJztcbmltcG9ydCB7IHBvc3Rwcm9jZXNzVHJhbnNjcmlwdCB9IGZyb20gJy4vcG9zdHByb2Nlc3MnO1xuaW1wb3J0IHsgdHJhbnNjcmliZVdpdGhHcm9xIH0gZnJvbSAnLi90cmFuc2NyaWJlJztcbmltcG9ydCB7IHJlZ2lzdGVyRXJyb3JMb2dTaW5rLCB0eXBlIFZveGlkaWFuRXJyb3JMb2dFbnRyeSB9IGZyb20gJy4vbG9nZ2luZyc7XG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCB0eXBlIEFJVHJhbnNjcmlwdFNldHRpbmdzLCB0eXBlIFByb21wdFByZXNldCB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgUmVjb3JkaW5nTW9kYWwgfSBmcm9tICcuL3VpL1JlY29yZGluZ01vZGFsJztcblxuaW50ZXJmYWNlIFZveGlkaWFuUGVyc2lzdGVudERhdGEge1xuICBzZXR0aW5ncz86IEFJVHJhbnNjcmlwdFNldHRpbmdzO1xuICBlcnJvckxvZz86IFZveGlkaWFuRXJyb3JMb2dFbnRyeVtdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBSVRyYW5zY3JpcHRQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MgPSB7IC4uLkRFRkFVTFRfU0VUVElOR1MsIHByb21wdFByZXNldHM6IFsuLi5ERUZBVUxUX1NFVFRJTkdTLnByb21wdFByZXNldHNdIH07XG4gIGVycm9yTG9nOiBWb3hpZGlhbkVycm9yTG9nRW50cnlbXSA9IFtdO1xuICBwcml2YXRlIHJlY29yZGVyPzogQXVkaW9SZWNvcmRlcjtcbiAgcHJpdmF0ZSBtb2RhbD86IFJlY29yZGluZ01vZGFsO1xuXG4gIGFzeW5jIG9ubG9hZCgpIHtcbiAgICBjb25zdCByYXcgPSAoYXdhaXQgdGhpcy5sb2FkRGF0YSgpKSBhcyBWb3hpZGlhblBlcnNpc3RlbnREYXRhIHwgQUlUcmFuc2NyaXB0U2V0dGluZ3MgfCBudWxsO1xuICAgIGlmIChyYXcgJiYgKHJhdyBhcyBWb3hpZGlhblBlcnNpc3RlbnREYXRhKS5zZXR0aW5ncykge1xuICAgICAgY29uc3QgZGF0YSA9IHJhdyBhcyBWb3hpZGlhblBlcnNpc3RlbnREYXRhO1xuICAgICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGRhdGEuc2V0dGluZ3MgfHwge30pO1xuICAgICAgdGhpcy5lcnJvckxvZyA9IEFycmF5LmlzQXJyYXkoZGF0YS5lcnJvckxvZykgPyBkYXRhLmVycm9yTG9nIDogW107XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCByYXcgfHwge30pO1xuICAgICAgdGhpcy5lcnJvckxvZyA9IFtdO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyRXJyb3JMb2dTaW5rKChlbnRyeSkgPT4ge1xuICAgICAgdGhpcy5hcHBlbmRFcnJvckxvZyhlbnRyeSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZFJpYmJvbkljb24oJ21pYycsICdSZWNvcmQgJiBUcmFuc2NyaWJlJywgKCkgPT4gdGhpcy50b2dnbGVSZWNvcmRpbmcoKSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICd2b3hpZGlhbi1zdGFydC1zdG9wJyxcbiAgICAgIG5hbWU6ICdTdGFydC9TdG9wIFJlY29yZGluZycsXG4gICAgICBob3RrZXlzOiBbeyBtb2RpZmllcnM6IFsnTW9kJywgJ1NoaWZ0J10sIGtleTogJ00nIH1dLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMudG9nZ2xlUmVjb3JkaW5nKCksXG4gICAgfSk7XG5cbiAgICAvLyBNb2JpbGUgdG9vbGJhciBhY3Rpb246IGFwcGVhcnMgaW4gT2JzaWRpYW4gTW9iaWxlIGVkaXRvciB0b29sYmFyXG4gICAgLy8gVXNlcnMgY2FuIGFkZCB0aGlzIGNvbW1hbmQgdG8gdGhlIG1vYmlsZSB0b29sYmFyIHZpYSBTZXR0aW5ncyBcdTIxOTIgTW9iaWxlIFx1MjE5MiBUb29sYmFyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAncmVjb3JkLXRyYW5zY3JpYmUtaW5zZXJ0JyxcbiAgICAgIG5hbWU6ICdSZWNvcmQgXHUyMDIyIFRyYW5zY3JpYmUgXHUyMDIyIEluc2VydCcsXG4gICAgICBpY29uOiAnbWljJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoKSA9PiB0aGlzLnRvZ2dsZVJlY29yZGluZygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKFxuICAgICAgbmV3IEFJVHJhbnNjcmlwdFNldHRpbmdUYWIoXG4gICAgICAgIHRoaXMuYXBwLFxuICAgICAgICB0aGlzLFxuICAgICAgICAoKSA9PiB0aGlzLnNldHRpbmdzLFxuICAgICAgICBhc3luYyAocGFydGlhbCkgPT4ge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5zZXR0aW5ncywgcGFydGlhbCk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5zYXZlQWxsRGF0YSgpO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB0aGlzLmVycm9yTG9nLFxuICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5jbGVhckVycm9yTG9nKCk7XG4gICAgICAgIH0sXG4gICAgICApLFxuICAgICk7XG4gIH1cblxuICBvbnVubG9hZCgpIHtcbiAgICB0cnkgeyB0aGlzLnJlY29yZGVyPy5kaXNjYXJkKCk7IH0gY2F0Y2ggeyB9XG4gICAgdHJ5IHsgdGhpcy5tb2RhbD8uY2xvc2UoKTsgfSBjYXRjaCB7IH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdG9nZ2xlUmVjb3JkaW5nKCkge1xuICAgIC8vIElmIG1vZGFsIGlzIG9wZW4sIHN0b3Agbm93IChzaW11bGF0ZSBjbGlja2luZyBTdG9wKVxuICAgIGlmICh0aGlzLm1vZGFsKSB7XG4gICAgICAvLyBub29wIFx1MjAxNCBzdG9wcGluZyBpcyBkcml2ZW4gdmlhIG1vZGFsIGJ1dHRvbiB0byBwcmVzZXJ2ZSBwcmVzZXQvYXBwbHkgc3RhdGVcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgd2UgaGF2ZSBhbiBlZGl0b3IgdG8gaW5zZXJ0IGludG8gbGF0ZXIgKG5vdCBzdHJpY3RseSByZXF1aXJlZCBidXQgaGVscHMgVVgpXG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgaWYgKCF2aWV3KSByZXR1cm47IC8vIE1WUDogcmVxdWlyZSBhY3RpdmUgbWFya2Rvd24gdmlld1xuXG4gICAgLy8gUHJlcGFyZSByZWNvcmRlciBhbmQgbW9kYWxcbiAgICB0aGlzLnJlY29yZGVyID0gbmV3IEF1ZGlvUmVjb3JkZXIoKTtcbiAgICBjb25zdCBwcmVzZXRzID0gdGhpcy5zZXR0aW5ncy5wcm9tcHRQcmVzZXRzLm1hcChwID0+ICh7IGlkOiBwLmlkLCBuYW1lOiBwLm5hbWUgfSkpO1xuICAgIGNvbnN0IG1vZGFsID0gbmV3IFJlY29yZGluZ01vZGFsKHRoaXMuYXBwLCB7XG4gICAgICBwcmVzZXRzLFxuICAgICAgZGVmYXVsdFByZXNldElkOiB0aGlzLnNldHRpbmdzLmxhc3RVc2VkUHJvbXB0SWQgfHwgdGhpcy5zZXR0aW5ncy5kZWZhdWx0UHJvbXB0SWQsXG4gICAgICBtYXhEdXJhdGlvblNlYzogdGhpcy5zZXR0aW5ncy5tYXhEdXJhdGlvblNlYyxcbiAgICAgIG9uU3RhcnQ6IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLnJlY29yZGVyIS5zdGFydCgpO1xuICAgICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgIG1vZGFsLnNldFBoYXNlKCdlcnJvcicpO1xuICAgICAgICAgIG1vZGFsLnNldFN0YXR1cygnTWljcm9waG9uZSBwZXJtaXNzaW9uIG9yIHJlY29yZGVyIGVycm9yLicpO1xuICAgICAgICAgIG1vZGFsLnNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgbW9kYWwuc2V0RGlzY2FyZExhYmVsKCdDbG9zZScpO1xuICAgICAgICAgIHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTtcbiAgICAgICAgICB0aGlzLnJlY29yZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25TdG9wOiBhc3luYyAoYXBwbHlQb3N0LCBwcmVzZXRJZCkgPT4ge1xuICAgICAgICBtb2RhbC5zZXRBY3Rpb25CdXR0b25zRW5hYmxlZChmYWxzZSwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ3RyYW5zY3JpYmluZycpO1xuICAgICAgICBtb2RhbC5zZXRTdGF0dXMoJ1RyYW5zY3JpYmluZ1x1MjAyNicpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxldCBwcmVzZXQ6IFByb21wdFByZXNldCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICBjb25zdCBibG9iID0gYXdhaXQgdGhpcy5yZWNvcmRlciEuc3RvcCgpO1xuICAgICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgY29uc3QgcmF3ID0gYXdhaXQgdHJhbnNjcmliZVdpdGhHcm9xKGJsb2IsIHRoaXMuc2V0dGluZ3MpO1xuICAgICAgICAgIGxldCB0ZXh0ID0gcmF3O1xuICAgICAgICAgIGlmIChhcHBseVBvc3QpIHtcbiAgICAgICAgICAgIHByZXNldCA9IHRoaXMuc2V0dGluZ3MucHJvbXB0UHJlc2V0cy5maW5kKHAgPT4gcC5pZCA9PT0gcHJlc2V0SWQpIGFzIFByb21wdFByZXNldCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MubGFzdFVzZWRQcm9tcHRJZCA9IHByZXNldD8uaWQgfHwgcHJlc2V0SWQgfHwgdGhpcy5zZXR0aW5ncy5sYXN0VXNlZFByb21wdElkO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlQWxsRGF0YSgpO1xuICAgICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ3Bvc3Rwcm9jZXNzaW5nJyk7XG4gICAgICAgICAgICBtb2RhbC5zZXRTdGF0dXMoJ0NsZWFuaW5nIHRyYW5zY3JpcHRcdTIwMjYnKTtcbiAgICAgICAgICAgIC8vIENhcHR1cmUgY3VycmVudCBzZWxlY3Rpb24gZnJvbSBhY3RpdmUgZWRpdG9yIHRvIGluY2x1ZGUgYXMgY29udGV4dCBvciBpbmxpbmUgaW4gc3lzdGVtXG4gICAgICAgICAgICBjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGFjdGl2ZVZpZXc/LmVkaXRvcj8uZ2V0U2VsZWN0aW9uKCkgfHwgJyc7XG4gICAgICAgICAgICB0ZXh0ID0gYXdhaXQgcG9zdHByb2Nlc3NUcmFuc2NyaXB0KHJhdywgdGhpcy5zZXR0aW5ncywgcHJlc2V0LCBzZWxlY3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmaW5hbE91dHB1dCA9IHRoaXMuY29tYmluZVRyYW5zY3JpcHRzKHJhdywgdGV4dCwgYXBwbHlQb3N0LCBwcmVzZXQpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuaW5zZXJ0VGV4dChmaW5hbE91dHB1dCwgcHJlc2V0Py5yZXBsYWNlU2VsZWN0aW9uKTtcbiAgICAgICAgICBtb2RhbC5zZXRQaGFzZSgnZG9uZScpO1xuICAgICAgICAgIG1vZGFsLnNldFN0YXR1cygnVHJhbnNjcmlwdCBpbnNlcnRlZCBpbnRvIHRoZSBub3RlLicpO1xuICAgICAgICAgIG1vZGFsLnNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgbW9kYWwuc2V0RGlzY2FyZExhYmVsKCdDbG9zZScpO1xuICAgICAgICAgIG1vZGFsLmNsb3NlKCk7XG4gICAgICAgICAgaWYgKHRoaXMubW9kYWwgPT09IG1vZGFsKSB0aGlzLm1vZGFsID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgIG1vZGFsLnNldFBoYXNlKCdlcnJvcicpO1xuICAgICAgICAgIG1vZGFsLnNldFN0YXR1cyhgRXJyb3I6ICR7ZT8ubWVzc2FnZSB8fCBlfWApO1xuICAgICAgICAgIG1vZGFsLnNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgbW9kYWwuc2V0RGlzY2FyZExhYmVsKCdDbG9zZScpO1xuICAgICAgICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7IH1cbiAgICAgICAgICB0aGlzLnJlY29yZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIC8vIGtlZXAgbW9kYWwgb3BlbiBmb3IgdXNlciB0byByZWFkL2Nsb3NlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbkRpc2NhcmQ6ICgpID0+IHtcbiAgICAgICAgdHJ5IHsgdGhpcy5yZWNvcmRlcj8uZGlzY2FyZCgpOyB9IGNhdGNoIHsgfVxuICAgICAgICB0aGlzLnJlY29yZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgICAgICB0aGlzLm1vZGFsID0gdW5kZWZpbmVkO1xuICAgICAgfSxcbiAgICAgIG9uUGF1c2U6ICgpID0+IHRoaXMucmVjb3JkZXI/LnBhdXNlKCksXG4gICAgICBvblJlc3VtZTogKCkgPT4gdGhpcy5yZWNvcmRlcj8ucmVzdW1lKCksXG4gICAgICBvbkNsb3NlOiAoKSA9PiB7XG4gICAgICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7IH1cbiAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMubW9kYWwgPT09IG1vZGFsKSB0aGlzLm1vZGFsID0gdW5kZWZpbmVkO1xuICAgICAgfSxcbiAgICB9KTtcbiAgICB0aGlzLm1vZGFsID0gbW9kYWw7XG5cbiAgICAvLyBNVlAgdXNlcyBtb2RhbCB0byBwcmVzZW50IGFsbCBzdGF0dXMgYW5kIGFuaW1hdGlvbnNcbiAgICBtb2RhbC5vcGVuKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluc2VydFRleHQodGV4dDogc3RyaW5nLCByZXBsYWNlU2VsZWN0aW9uT3ZlcnJpZGU/OiBib29sZWFuKSB7XG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgaWYgKCF2aWV3KSB0aHJvdyBuZXcgRXJyb3IoJ05vIGFjdGl2ZSBNYXJrZG93biBlZGl0b3InKTtcbiAgICBjb25zdCBlZGl0b3IgPSB2aWV3LmVkaXRvcjtcbiAgICBjb25zdCBub3JtYWxpemVkID0gdGV4dC5zdGFydHNXaXRoKCcgJykgPyB0ZXh0LnNsaWNlKDEpIDogdGV4dDtcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLnNldHRpbmdzLmFkZE5ld2xpbmVCZWZvcmUgPyAnXFxuJyA6ICcnO1xuICAgIGNvbnN0IGFmdGVyID0gdGhpcy5zZXR0aW5ncy5hZGROZXdsaW5lQWZ0ZXIgPyAnXFxuJyA6ICcnO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBgJHtiZWZvcmV9JHtub3JtYWxpemVkfSR7YWZ0ZXJ9YDtcblxuICAgIGxldCBzdGFydDogRWRpdG9yUG9zaXRpb247XG4gICAgY29uc3QgcmVwbGFjZVNlbGVjdGlvbiA9IHJlcGxhY2VTZWxlY3Rpb25PdmVycmlkZSA/PyAodGhpcy5zZXR0aW5ncy5pbnNlcnRNb2RlID09PSAncmVwbGFjZScpO1xuICAgIGlmIChyZXBsYWNlU2VsZWN0aW9uICYmIGVkaXRvci5zb21ldGhpbmdTZWxlY3RlZCgpKSB7XG4gICAgICBzdGFydCA9IChlZGl0b3IgYXMgYW55KS5nZXRDdXJzb3IoJ2Zyb20nKSBhcyBFZGl0b3JQb3NpdGlvbjtcbiAgICAgIGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKGNvbnRlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGFydCA9IGVkaXRvci5nZXRDdXJzb3IoKTtcbiAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoY29udGVudCwgc3RhcnQpO1xuICAgIH1cbiAgICBjb25zdCBjYXJldCA9IHRoaXMuYWR2YW5jZVBvcyhzdGFydCwgYCR7YmVmb3JlfSR7bm9ybWFsaXplZH1gKTtcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yKGNhcmV0KTtcbiAgfVxuXG4gIHByaXZhdGUgYWR2YW5jZVBvcyhzdGFydDogRWRpdG9yUG9zaXRpb24sIHRleHQ6IHN0cmluZyk6IEVkaXRvclBvc2l0aW9uIHtcbiAgICBjb25zdCBwYXJ0cyA9IHRleHQuc3BsaXQoJ1xcbicpO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHJldHVybiB7IGxpbmU6IHN0YXJ0LmxpbmUsIGNoOiBzdGFydC5jaCArIHBhcnRzWzBdLmxlbmd0aCB9O1xuICAgIGNvbnN0IGxpbmVzQWRkZWQgPSBwYXJ0cy5sZW5ndGggLSAxO1xuICAgIGNvbnN0IGxhc3RMZW4gPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS5sZW5ndGg7XG4gICAgcmV0dXJuIHsgbGluZTogc3RhcnQubGluZSArIGxpbmVzQWRkZWQsIGNoOiBsYXN0TGVuIH07XG4gIH1cblxuICBwcml2YXRlIGNvbWJpbmVUcmFuc2NyaXB0cyhyYXc6IHN0cmluZywgcHJvY2Vzc2VkOiBzdHJpbmcsIHBvc3Rwcm9jZXNzZWRBcHBsaWVkOiBib29sZWFuLCBwcmVzZXQ/OiBQcm9tcHRQcmVzZXQpOiBzdHJpbmcge1xuICAgIGNvbnN0IGluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQgPSBwcmVzZXQ/LmluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQgPz8gdHJ1ZTtcbiAgICBpZiAoIShwb3N0cHJvY2Vzc2VkQXBwbGllZCAmJiBpbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkKSkgcmV0dXJuIHByb2Nlc3NlZDtcbiAgICBjb25zdCBxdW90ZWQgPSB0aGlzLnF1b3RlVHJhbnNjcmlwdChyYXcpO1xuICAgIGlmICghcXVvdGVkKSByZXR1cm4gcHJvY2Vzc2VkO1xuICAgIHJldHVybiBwcm9jZXNzZWQudHJpbSgpLmxlbmd0aCA/IGAke3F1b3RlZH1cXG5cXG4ke3Byb2Nlc3NlZH1gIDogcXVvdGVkO1xuICB9XG5cbiAgcHJpdmF0ZSBxdW90ZVRyYW5zY3JpcHQocmF3OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSByYXcudHJpbSgpO1xuICAgIGlmICghbm9ybWFsaXplZCkgcmV0dXJuICcnO1xuICAgIGNvbnN0IHBhcmFncmFwaHMgPSBub3JtYWxpemVkLnNwbGl0KC9cXG5cXHMqXFxuLyk7XG4gICAgY29uc3QgcXVvdGVkQmxvY2tzID0gcGFyYWdyYXBocy5tYXAoKHBhcmFncmFwaCkgPT4ge1xuICAgICAgY29uc3QgbGluZXMgPSBwYXJhZ3JhcGguc3BsaXQoJ1xcbicpO1xuICAgICAgcmV0dXJuIGxpbmVzLm1hcChsaW5lID0+IGA+ICR7bGluZS50cmltRW5kKCl9YCkuam9pbignXFxuJyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHF1b3RlZEJsb2Nrcy5qb2luKCdcXG4+XFxuJyk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNhdmVBbGxEYXRhKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBheWxvYWQ6IFZveGlkaWFuUGVyc2lzdGVudERhdGEgPSB7XG4gICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5ncyxcbiAgICAgIGVycm9yTG9nOiB0aGlzLmVycm9yTG9nLFxuICAgIH07XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YShwYXlsb2FkKTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwZW5kRXJyb3JMb2coZW50cnk6IFZveGlkaWFuRXJyb3JMb2dFbnRyeSk6IHZvaWQge1xuICAgIHRoaXMuZXJyb3JMb2cucHVzaChlbnRyeSk7XG4gICAgaWYgKHRoaXMuZXJyb3JMb2cubGVuZ3RoID4gMjAwKSB7XG4gICAgICB0aGlzLmVycm9yTG9nID0gdGhpcy5lcnJvckxvZy5zbGljZSgtMjAwKTtcbiAgICB9XG4gICAgLy8gRmlyZS1hbmQtZm9yZ2V0OyBsb2dnaW5nIGZhaWx1cmUgc2hvdWxkIG5vdCBicmVhayBVWFxuICAgIHRoaXMuc2F2ZUFsbERhdGEoKS5jYXRjaCgoZSkgPT4gY29uc29sZS5lcnJvcignW1ZveGlkaWFuXSBmYWlsZWQgdG8gcGVyc2lzdCBlcnJvciBsb2cnLCBlKSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNsZWFyRXJyb3JMb2coKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5lcnJvckxvZyA9IFtdO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB3ID0gd2luZG93IGFzIGFueTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHcuVm94aWRpYW5FcnJvckxvZykpIHtcbiAgICAgICAgdy5Wb3hpZGlhbkVycm9yTG9nID0gW107XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBpZ25vcmUgd2luZG93IGFjY2VzcyBpc3N1ZXNcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5zYXZlQWxsRGF0YSgpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBCdXR0b25Db21wb25lbnQsIE1vZGFsLCBOb3RpY2UsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgVm94aWRpYW5FcnJvckxvZ0VudHJ5IH0gZnJvbSAnLi9sb2dnaW5nJztcbmltcG9ydCB0eXBlIHsgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIFByb21wdFByZXNldCB9IGZyb20gJy4vdHlwZXMnO1xuXG5jbGFzcyBQcmVzZXRJbXBvcnRNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSB0ZXh0YXJlYUVsPzogSFRNTFRleHRBcmVhRWxlbWVudDtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvbkltcG9ydDogKHZhbHVlOiB1bmtub3duKSA9PiBQcm9taXNlPHZvaWQ+IHwgdm9pZCkge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG4gICAgY29udGVudEVsLmVtcHR5KCk7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ0ltcG9ydCBwcmVzZXQnIH0pO1xuICAgIGNvbnRlbnRFbC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6ICdQYXN0ZSBhIHByZXNldCBKU09OIGV4cG9ydGVkIGZyb20gVm94aWRpYW4sIG9yIGFuIGFycmF5IG9mIHByZXNldHMuJyxcbiAgICB9KTtcbiAgICBjb25zdCB0ZXh0YXJlYSA9IGNvbnRlbnRFbC5jcmVhdGVFbCgndGV4dGFyZWEnLCB7IGNsczogJ2FpLXByZXNldC1qc29uLXRleHRhcmVhJyB9KTtcbiAgICB0ZXh0YXJlYS5yb3dzID0gMTA7XG4gICAgdGhpcy50ZXh0YXJlYUVsID0gdGV4dGFyZWE7XG4gICAgY29uc3QgYWN0aW9ucyA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1wcmVzZXQtanNvbi1hY3Rpb25zJyB9KTtcbiAgICBjb25zdCBwYXN0ZUJ0biA9IGFjdGlvbnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ1Bhc3RlJywgdHlwZTogJ2J1dHRvbicgfSk7XG4gICAgY29uc3QgaW1wb3J0QnRuID0gYWN0aW9ucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnSW1wb3J0JywgdHlwZTogJ2J1dHRvbicgfSk7XG4gICAgY29uc3QgY2FuY2VsQnRuID0gYWN0aW9ucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnQ2FuY2VsJywgdHlwZTogJ2J1dHRvbicgfSk7XG4gICAgcGFzdGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7IHRoaXMuaGFuZGxlUGFzdGUoKTsgfSk7XG4gICAgaW1wb3J0QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5oYW5kbGVJbXBvcnQoKSk7XG4gICAgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5jbG9zZSgpKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlUGFzdGUoKSB7XG4gICAgaWYgKCF0aGlzLnRleHRhcmVhRWwpIHJldHVybjtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY2xpcGJvYXJkID0gKG5hdmlnYXRvciBhcyBhbnkpPy5jbGlwYm9hcmQ7XG4gICAgICBpZiAoIWNsaXBib2FyZD8ucmVhZFRleHQpIHtcbiAgICAgICAgbmV3IE5vdGljZSgnQ2xpcGJvYXJkIHBhc3RlIGlzIG5vdCBhdmFpbGFibGU7IHBhc3RlIG1hbnVhbGx5LicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgY2xpcGJvYXJkLnJlYWRUZXh0KCk7XG4gICAgICBpZiAoIXRleHQpIHtcbiAgICAgICAgbmV3IE5vdGljZSgnQ2xpcGJvYXJkIGlzIGVtcHR5LicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnRleHRhcmVhRWwudmFsdWUgPSB0ZXh0O1xuICAgICAgdGhpcy50ZXh0YXJlYUVsLmZvY3VzKCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICBuZXcgTm90aWNlKCdVbmFibGUgdG8gcmVhZCBmcm9tIGNsaXBib2FyZDsgcGFzdGUgbWFudWFsbHkuJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gU29tZSBtZXNzYWdpbmcgYXBwcyBpbmplY3QgaW52aXNpYmxlIG9yIG5vbi1icmVha2luZyBjaGFyYWN0ZXJzIHRoYXQgSlNPTi5wYXJzZSByZWplY3RzLlxuICBwcml2YXRlIHNhbml0aXplSnNvbklucHV0KHJhdzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcmF3XG4gICAgICAucmVwbGFjZSgvXFx1RkVGRi9nLCAnJykgLy8gQk9NXG4gICAgICAucmVwbGFjZSgvW1xcdTIwMEItXFx1MjAwRFxcdTIwNjBdL2csICcnKSAvLyB6ZXJvLXdpZHRoIHNwYWNlc1xuICAgICAgLnJlcGxhY2UoL1tcXHUwMEEwXFx1MjAwN1xcdTIwMkZdL2csICcgJykgLy8gbm9uLWJyZWFraW5nIHNwYWNlcyAtPiByZWd1bGFyIHNwYWNlc1xuICAgICAgLnRyaW0oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlSW1wb3J0KCkge1xuICAgIGlmICghdGhpcy50ZXh0YXJlYUVsKSByZXR1cm47XG4gICAgY29uc3QgY2xlYW5lZCA9IHRoaXMuc2FuaXRpemVKc29uSW5wdXQodGhpcy50ZXh0YXJlYUVsLnZhbHVlKTtcbiAgICBpZiAoIWNsZWFuZWQpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ1Bhc3RlIHByZXNldCBKU09OIHRvIGltcG9ydC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoY2xlYW5lZCk7XG4gICAgICBhd2FpdCB0aGlzLm9uSW1wb3J0KHBhcnNlZCk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICBuZXcgTm90aWNlKGBJbnZhbGlkIEpTT046ICR7ZT8ubWVzc2FnZSA/PyBlID8/ICdVbmtub3duIGVycm9yJ31gKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFJVHJhbnNjcmlwdFNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgY29uc3RydWN0b3IoXG4gICAgYXBwOiBBcHAsXG4gICAgcGx1Z2luOiBQbHVnaW4sXG4gICAgcHJpdmF0ZSBnZXRTZXR0aW5nczogKCkgPT4gQUlUcmFuc2NyaXB0U2V0dGluZ3MsXG4gICAgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6IChzOiBQYXJ0aWFsPEFJVHJhbnNjcmlwdFNldHRpbmdzPikgPT4gUHJvbWlzZTx2b2lkPixcbiAgICBwcml2YXRlIGdldEVycm9yTG9nPzogKCkgPT4gVm94aWRpYW5FcnJvckxvZ0VudHJ5W10sXG4gICAgcHJpdmF0ZSBjbGVhckVycm9yTG9nPzogKCkgPT4gUHJvbWlzZTx2b2lkPixcbiAgKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gxJywgeyB0ZXh0OiAnVm94aWRpYW4nIH0pO1xuXG4gICAgY29uc3QgcyA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcblxuICAgIC8vIEdST1FcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdHcm9xIFdoaXNwZXInIH0pO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0dyb3EgQVBJIEtleScpXG4gICAgICAuc2V0RGVzYygnUmVxdWlyZWQgdG8gdHJhbnNjcmliZSBhdWRpbyB2aWEgR3JvcSBXaGlzcGVyLicpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdnc2tfLi4uJylcbiAgICAgICAgLnNldFZhbHVlKHMuZ3JvcUFwaUtleSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZ3JvcUFwaUtleTogdi50cmltKCkgfSk7IH0pKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0dyb3EgbW9kZWwnKVxuICAgICAgLnNldERlc2MoJ0RlZmF1bHQ6IHdoaXNwZXItbGFyZ2UtdjMnKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRWYWx1ZShzLmdyb3FNb2RlbClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZ3JvcU1vZGVsOiB2LnRyaW0oKSB8fCAnd2hpc3Blci1sYXJnZS12MycgfSk7IH0pKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0xhbmd1YWdlIChvcHRpb25hbCknKVxuICAgICAgLnNldERlc2MoJ0lTTyBjb2RlIGxpa2UgZW4sIGVzLCBkZS4gTGVhdmUgZW1wdHkgZm9yIGF1dG8uJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0VmFsdWUocy5sYW5ndWFnZSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgbGFuZ3VhZ2U6IHYudHJpbSgpIHx8IHVuZGVmaW5lZCB9KTsgfSkpO1xuXG4gICAgLy8gT3BlbkFJXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnT3BlbkFJIFBvc3Rwcm9jZXNzaW5nIChvcHRpb25hbCknIH0pO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ09wZW5BSSBBUEkgS2V5JylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ3NrLS4uLicpXG4gICAgICAgIC5zZXRWYWx1ZShzLm9wZW5haUFwaUtleSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgb3BlbmFpQXBpS2V5OiB2LnRyaW0oKSB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnT3BlbkFJIG1vZGVsJylcbiAgICAgIC5zZXREZXNjKCdEZWZhdWx0OiBncHQtNG8tbWluaScpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFZhbHVlKHMub3BlbmFpTW9kZWwpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IG9wZW5haU1vZGVsOiB2LnRyaW0oKSB8fCAnZ3B0LTRvLW1pbmknIH0pOyB9KSk7XG5cbiAgICAvLyBHZW1pbmlcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdHZW1pbmkgUG9zdHByb2Nlc3NpbmcgKG9wdGlvbmFsKScgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnR2VtaW5pIEFQSSBLZXknKVxuICAgICAgLnNldERlc2MoJ1JlcXVpcmVkIHRvIHBvc3Rwcm9jZXNzIHVzaW5nIEdlbWluaS4nKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRQbGFjZWhvbGRlcignQUl6YS4uLicpXG4gICAgICAgIC5zZXRWYWx1ZShzLmdlbWluaUFwaUtleSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZ2VtaW5pQXBpS2V5OiB2LnRyaW0oKSB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnR2VtaW5pIG1vZGVsJylcbiAgICAgIC5zZXREZXNjKCdEZWZhdWx0OiBnZW1pbmktMS41LWZsYXNoJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0VmFsdWUocy5nZW1pbmlNb2RlbClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZ2VtaW5pTW9kZWw6IHYudHJpbSgpIHx8ICdnZW1pbmktMS41LWZsYXNoJyB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnUG9zdHByb2Nlc3NpbmcgcHJvdmlkZXInKVxuICAgICAgLnNldERlc2MoJ1doaWNoIEFQSSB0byB1c2Ugd2hlbiBhcHBseWluZyBwb3N0cHJvY2Vzc2luZyBwcmVzZXRzLicpXG4gICAgICAuYWRkRHJvcGRvd24oZCA9PiBkXG4gICAgICAgIC5hZGRPcHRpb24oJ29wZW5haScsICdPcGVuQUknKVxuICAgICAgICAuYWRkT3B0aW9uKCdnZW1pbmknLCAnR2VtaW5pJylcbiAgICAgICAgLnNldFZhbHVlKHMucG9zdHByb2Nlc3NpbmdQcm92aWRlciB8fCAnb3BlbmFpJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcG9zdHByb2Nlc3NpbmdQcm92aWRlcjogdiBhcyBhbnkgfSk7IH0pKTtcblxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdocicpO1xuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdicicpO1xuXG4gICAgLy8gUHJlc2V0c1xuICAgIGNvbnN0IHByZXNldFNlY3Rpb24gPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1wcmVzZXQtc2VjdGlvbicgfSk7XG4gICAgcHJlc2V0U2VjdGlvbi5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdQcm9tcHQgcHJlc2V0cycsIGNsczogJ2FpLXByZXNldC1zZWN0aW9uLXRpdGxlJyB9KTtcbiAgICBjb25zdCBwcmVzZXRBY3Rpb25zID0gcHJlc2V0U2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6ICdhaS1wcmVzZXQtc2VjdGlvbi1hY3Rpb25zJyB9KTtcblxuICAgIGNvbnN0IGxpc3RFbCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdigpO1xuICAgIGNvbnN0IHJlbmRlclByZXNldHMgPSAoKSA9PiB7XG4gICAgICBsaXN0RWwuZW1wdHkoKTtcbiAgICAgIGNvbnN0IHN0ID0gdGhpcy5nZXRTZXR0aW5ncygpO1xuICAgICAgc3QucHJvbXB0UHJlc2V0cy5mb3JFYWNoKChwKSA9PiB7XG4gICAgICAgIGNvbnN0IHdyYXAgPSBsaXN0RWwuY3JlYXRlRGl2KHsgY2xzOiAnYWktcHJlc2V0JyB9KTtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gd3JhcC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1wcmVzZXQtaGVhZGVyJyB9KTtcbiAgICAgICAgY29uc3QgdGl0bGUgPSBoZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiAnYWktcHJlc2V0LXRpdGxlJyB9KTtcbiAgICAgICAgdGl0bGUuY3JlYXRlRWwoJ2g0JywgeyB0ZXh0OiBwLm5hbWUsIGNsczogJ2FpLXByZXNldC1uYW1lJyB9KTtcbiAgICAgICAgaWYgKHN0LmRlZmF1bHRQcm9tcHRJZCA9PT0gcC5pZCkgdGl0bGUuY3JlYXRlU3Bhbih7IHRleHQ6ICdEZWZhdWx0JywgY2xzOiAnYWktcHJlc2V0LWRlZmF1bHQnIH0pO1xuICAgICAgICBjb25zdCBhY3Rpb25zRWwgPSBoZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiAnYWktcHJlc2V0LWFjdGlvbnMnIH0pO1xuICAgICAgICBuZXcgQnV0dG9uQ29tcG9uZW50KGFjdGlvbnNFbClcbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dCgnU2V0IGFzIERlZmF1bHQnKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZGVmYXVsdFByb21wdElkOiBwLmlkIH0pO1xuICAgICAgICAgICAgcmVuZGVyUHJlc2V0cygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBuZXcgQnV0dG9uQ29tcG9uZW50KGFjdGlvbnNFbClcbiAgICAgICAgICAuc2V0SWNvbignY29weScpXG4gICAgICAgICAgLnNldFRvb2x0aXAoJ0V4cG9ydCBwcmVzZXQgYXMgSlNPTicpXG4gICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhwb3J0UHJlc2V0OiBQcm9tcHRQcmVzZXQgPSB7XG4gICAgICAgICAgICAgIGlkOiBwLmlkLFxuICAgICAgICAgICAgICBuYW1lOiBwLm5hbWUsXG4gICAgICAgICAgICAgIHN5c3RlbTogcC5zeXN0ZW0sXG4gICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiBwLnRlbXBlcmF0dXJlLFxuICAgICAgICAgICAgICBpbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkOiBwLmluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQsXG4gICAgICAgICAgICAgIHJlcGxhY2VTZWxlY3Rpb246IHAucmVwbGFjZVNlbGVjdGlvbixcbiAgICAgICAgICAgICAgbW9kZWw6IHAubW9kZWwsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGV4cG9ydFByZXNldCwgbnVsbCwgMik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBjbGlwYm9hcmQgPSAobmF2aWdhdG9yIGFzIGFueSk/LmNsaXBib2FyZDtcbiAgICAgICAgICAgICAgaWYgKGNsaXBib2FyZD8ud3JpdGVUZXh0KSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpcGJvYXJkLndyaXRlVGV4dChqc29uKTtcbiAgICAgICAgICAgICAgICBuZXcgTm90aWNlKCdQcmVzZXQgSlNPTiBjb3BpZWQgdG8gY2xpcGJvYXJkLicpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdWb3hpZGlhbiBwcmVzZXQgSlNPTjonLCBqc29uKTtcbiAgICAgICAgICAgICAgICBuZXcgTm90aWNlKCdDbGlwYm9hcmQgdW5hdmFpbGFibGU7IEpTT04gbG9nZ2VkIHRvIGNvbnNvbGUuJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVm94aWRpYW4gcHJlc2V0IEpTT04gKGZhaWxlZCBjbGlwYm9hcmQpOicsIGpzb24pO1xuICAgICAgICAgICAgICBuZXcgTm90aWNlKCdVbmFibGUgdG8gYWNjZXNzIGNsaXBib2FyZDsgSlNPTiBsb2dnZWQgdG8gY29uc29sZS4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgbmV3IEJ1dHRvbkNvbXBvbmVudChhY3Rpb25zRWwpXG4gICAgICAgICAgLnNldEljb24oJ3RyYXNoJylcbiAgICAgICAgICAuc2V0VG9vbHRpcCgnRGVsZXRlIHByZXNldCcpXG4gICAgICAgICAgLnNldFdhcm5pbmcoKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkID0gc3QucHJvbXB0UHJlc2V0cy5maWx0ZXIoeCA9PiB4LmlkICE9PSBwLmlkKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogZmlsdGVyZWQgfSk7XG4gICAgICAgICAgICByZW5kZXJQcmVzZXRzKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ05hbWUnKVxuICAgICAgICAgIC5hZGRUZXh0KHQgPT4gdC5zZXRWYWx1ZShwLm5hbWUpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICBwLm5hbWUgPSB2OyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IHN0LnByb21wdFByZXNldHMgfSk7XG4gICAgICAgICAgfSkpO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKCdTeXN0ZW0gcHJvbXB0JylcbiAgICAgICAgICAuc2V0RGVzYygnU3VwcG9ydHMge3tzZWxlY3Rpb259fSBwbGFjZWhvbGRlcjsgd2hlbiBhYnNlbnQsIGN1cnJlbnQgc2VsZWN0aW9uIGlzIHByZXBlbmRlZCBhcyBjb250ZXh0LicpXG4gICAgICAgICAgLmFkZFRleHRBcmVhKHQgPT4ge1xuICAgICAgICAgICAgdC5zZXRWYWx1ZShwLnN5c3RlbSk7XG4gICAgICAgICAgICB0LmlucHV0RWwucm93cyA9IDY7XG4gICAgICAgICAgICB0LmlucHV0RWwuYWRkQ2xhc3MoJ2FpLXN5c3RlbS10ZXh0YXJlYScpO1xuICAgICAgICAgICAgdC5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgICBwLnN5c3RlbSA9IHY7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKCdUZW1wZXJhdHVyZScpXG4gICAgICAgICAgLmFkZFRleHQodCA9PiB0LnNldFZhbHVlKFN0cmluZyhwLnRlbXBlcmF0dXJlKSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG51bSA9IE51bWJlcih2KTsgcC50ZW1wZXJhdHVyZSA9IGlzRmluaXRlKG51bSkgPyBudW0gOiAwLjI7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ01vZGVsIG92ZXJyaWRlIChvcHRpb25hbCknKVxuICAgICAgICAgIC5hZGRUZXh0KHQgPT4gdC5zZXRQbGFjZWhvbGRlcignZS5nLiwgZ3B0LTRvLW1pbmknKS5zZXRWYWx1ZShwLm1vZGVsIHx8ICcnKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgcC5tb2RlbCA9IHYudHJpbSgpIHx8IHVuZGVmaW5lZDsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnSW5jbHVkZSB0cmFuc2NyaXB0IHdpdGggcG9zdHByb2Nlc3NlZCBtZXNzYWdlJylcbiAgICAgICAgICAuc2V0RGVzYygnUHJlcGVuZHMgdGhlIHJhdyB0cmFuc2NyaXB0IHF1b3RlZCB3aXRoIFwiPlwiIHdoZW4gcG9zdHByb2Nlc3Npbmcgc3VjY2VlZHMuJylcbiAgICAgICAgICAuYWRkVG9nZ2xlKHQgPT4gdFxuICAgICAgICAgICAgLnNldFZhbHVlKHAuaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZCA/PyB0cnVlKVxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICAgIHAuaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZCA9IHY7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnUmVwbGFjZSBzZWxlY3Rpb24nKVxuICAgICAgICAgIC5zZXREZXNjKCdXaGVuIGVuYWJsZWQsIFZveGlkaWFuIHJlcGxhY2VzIHRoZSBjdXJyZW50IGVkaXRvciBzZWxlY3Rpb24gd2l0aCB0aGlzIHByZXNldFxcJ3Mgb3V0cHV0LicpXG4gICAgICAgICAgLmFkZFRvZ2dsZSh0ID0+IHRcbiAgICAgICAgICAgIC5zZXRWYWx1ZShwLnJlcGxhY2VTZWxlY3Rpb24gPz8gKHN0Lmluc2VydE1vZGUgPT09ICdyZXBsYWNlJykpXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgICAgcC5yZXBsYWNlU2VsZWN0aW9uID0gdjtcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAvLyBBZGQgc29tZSBzcGFjZSBhZnRlciBlYWNoIHByZXNldFxuICAgICAgICB3cmFwLmNyZWF0ZUVsKCdicicpO1xuXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3QgYWRkUHJlc2V0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3Qgc3QgPSB0aGlzLmdldFNldHRpbmdzKCk7XG4gICAgICBjb25zdCBpZCA9IGBwcmVzZXQtJHtEYXRlLm5vdygpfWA7XG4gICAgICBjb25zdCBwcmVzZXQ6IFByb21wdFByZXNldCA9IHsgaWQsIG5hbWU6ICdOZXcgUHJlc2V0Jywgc3lzdGVtOiAnRWRpdCBtZVx1MjAyNicsIHRlbXBlcmF0dXJlOiAwLjIsIGluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQ6IHRydWUgfTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogWy4uLnN0LnByb21wdFByZXNldHMsIHByZXNldF0gfSk7XG4gICAgICByZW5kZXJQcmVzZXRzKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IG9wZW5JbXBvcnRNb2RhbCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG1vZGFsID0gbmV3IFByZXNldEltcG9ydE1vZGFsKHRoaXMuYXBwLCBhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgY29uc3Qgc3QgPSB0aGlzLmdldFNldHRpbmdzKCk7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gWy4uLnN0LnByb21wdFByZXNldHNdO1xuICAgICAgICBjb25zdCBuZXdQcmVzZXRzOiBQcm9tcHRQcmVzZXRbXSA9IFtdO1xuICAgICAgICBjb25zdCBhZGRPbmUgPSAocmF3OiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAoIXJhdyB8fCB0eXBlb2YgcmF3ICE9PSAnb2JqZWN0JykgcmV0dXJuO1xuICAgICAgICAgIGNvbnN0IGJhc2VJZCA9IHR5cGVvZiByYXcuaWQgPT09ICdzdHJpbmcnICYmIHJhdy5pZC50cmltKClcbiAgICAgICAgICAgID8gcmF3LmlkLnRyaW0oKVxuICAgICAgICAgICAgOiBgcHJlc2V0LSR7RGF0ZS5ub3coKX0tJHtuZXdQcmVzZXRzLmxlbmd0aH1gO1xuICAgICAgICAgIGNvbnN0IGlzSWRVc2VkID0gKGlkOiBzdHJpbmcpID0+XG4gICAgICAgICAgICBleGlzdGluZy5zb21lKHAgPT4gcC5pZCA9PT0gaWQpIHx8IG5ld1ByZXNldHMuc29tZShwID0+IHAuaWQgPT09IGlkKTtcbiAgICAgICAgICBsZXQgaWQgPSBiYXNlSWQ7XG4gICAgICAgICAgbGV0IHN1ZmZpeCA9IDE7XG4gICAgICAgICAgd2hpbGUgKGlzSWRVc2VkKGlkKSkge1xuICAgICAgICAgICAgaWQgPSBgJHtiYXNlSWR9LSR7c3VmZml4Kyt9YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbmFtZSA9IHR5cGVvZiByYXcubmFtZSA9PT0gJ3N0cmluZycgJiYgcmF3Lm5hbWUudHJpbSgpID8gcmF3Lm5hbWUudHJpbSgpIDogJ0ltcG9ydGVkIHByZXNldCc7XG4gICAgICAgICAgY29uc3Qgc3lzdGVtID0gdHlwZW9mIHJhdy5zeXN0ZW0gPT09ICdzdHJpbmcnICYmIHJhdy5zeXN0ZW0udHJpbSgpID8gcmF3LnN5c3RlbSA6ICdFZGl0IG1lXHUyMDI2JztcbiAgICAgICAgICBjb25zdCB0ZW1wZXJhdHVyZSA9IHR5cGVvZiByYXcudGVtcGVyYXR1cmUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKHJhdy50ZW1wZXJhdHVyZSkgPyByYXcudGVtcGVyYXR1cmUgOiAwLjI7XG4gICAgICAgICAgY29uc3QgaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZCA9XG4gICAgICAgICAgICB0eXBlb2YgcmF3LmluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQgPT09ICdib29sZWFuJ1xuICAgICAgICAgICAgICA/IHJhdy5pbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkXG4gICAgICAgICAgICAgIDogdHJ1ZTtcbiAgICAgICAgICBjb25zdCByZXBsYWNlU2VsZWN0aW9uID1cbiAgICAgICAgICAgIHR5cGVvZiByYXcucmVwbGFjZVNlbGVjdGlvbiA9PT0gJ2Jvb2xlYW4nID8gcmF3LnJlcGxhY2VTZWxlY3Rpb24gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgY29uc3QgbW9kZWwgPVxuICAgICAgICAgICAgdHlwZW9mIHJhdy5tb2RlbCA9PT0gJ3N0cmluZycgJiYgcmF3Lm1vZGVsLnRyaW0oKSA/IHJhdy5tb2RlbC50cmltKCkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV3UHJlc2V0cy5wdXNoKHtcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIHN5c3RlbSxcbiAgICAgICAgICAgIHRlbXBlcmF0dXJlLFxuICAgICAgICAgICAgaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZCxcbiAgICAgICAgICAgIHJlcGxhY2VTZWxlY3Rpb24sXG4gICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgdmFsdWUuZm9yRWFjaChhZGRPbmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFkZE9uZSh2YWx1ZSBhcyBhbnkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbmV3UHJlc2V0cy5sZW5ndGgpIHtcbiAgICAgICAgICBuZXcgTm90aWNlKCdObyB2YWxpZCBwcmVzZXRzIGZvdW5kIGluIEpTT04uJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogWy4uLmV4aXN0aW5nLCAuLi5uZXdQcmVzZXRzXSB9KTtcbiAgICAgICAgcmVuZGVyUHJlc2V0cygpO1xuICAgICAgICBuZXcgTm90aWNlKFxuICAgICAgICAgIG5ld1ByZXNldHMubGVuZ3RoID09PSAxXG4gICAgICAgICAgICA/ICdJbXBvcnRlZCAxIHByZXNldC4nXG4gICAgICAgICAgICA6IGBJbXBvcnRlZCAke25ld1ByZXNldHMubGVuZ3RofSBwcmVzZXRzLmBcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgICAgbW9kYWwub3BlbigpO1xuICAgIH07XG5cbiAgICByZW5kZXJQcmVzZXRzKCk7XG5cbiAgICBuZXcgQnV0dG9uQ29tcG9uZW50KHByZXNldEFjdGlvbnMpXG4gICAgICAuc2V0QnV0dG9uVGV4dCgnQWRkIHByZXNldCcpXG4gICAgICAub25DbGljayhhZGRQcmVzZXQpO1xuICAgIG5ldyBCdXR0b25Db21wb25lbnQocHJlc2V0QWN0aW9ucylcbiAgICAgIC5zZXRCdXR0b25UZXh0KCdJbXBvcnQnKVxuICAgICAgLm9uQ2xpY2sob3BlbkltcG9ydE1vZGFsKTtcblxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdocicpO1xuXG4gICAgLy8gUmVjb3JkaW5nIGJlaGF2aW9yXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnUmVjb3JkaW5nICYgSW5zZXJ0aW9uJyB9KTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdTaG93IHJlY29yZGluZyBtb2RhbCcpXG4gICAgICAuYWRkVG9nZ2xlKHQgPT4gdC5zZXRWYWx1ZShzLnNob3dNb2RhbFdoaWxlUmVjb3JkaW5nKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHNob3dNb2RhbFdoaWxlUmVjb3JkaW5nOiB2IH0pO1xuICAgICAgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ01heCBkdXJhdGlvbiAoc2Vjb25kcyknKVxuICAgICAgLmFkZFRleHQodCA9PiB0LnNldFZhbHVlKFN0cmluZyhzLm1heER1cmF0aW9uU2VjKSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgY29uc3QgbiA9IE51bWJlcih2KTsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBtYXhEdXJhdGlvblNlYzogaXNGaW5pdGUobikgJiYgbiA+IDAgPyBNYXRoLmZsb29yKG4pIDogOTAwIH0pO1xuICAgICAgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0luc2VydCBtb2RlJylcbiAgICAgIC5zZXREZXNjKCdJbnNlcnQgYXQgY3Vyc29yIG9yIHJlcGxhY2Ugc2VsZWN0aW9uJylcbiAgICAgIC5hZGREcm9wZG93bihkID0+IGRcbiAgICAgICAgLmFkZE9wdGlvbignaW5zZXJ0JywgJ0luc2VydCBhdCBjdXJzb3InKVxuICAgICAgICAuYWRkT3B0aW9uKCdyZXBsYWNlJywgJ1JlcGxhY2Ugc2VsZWN0aW9uJylcbiAgICAgICAgLnNldFZhbHVlKHMuaW5zZXJ0TW9kZSlcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBpbnNlcnRNb2RlOiB2IGFzIGFueSB9KTtcbiAgICAgICAgICByZW5kZXJQcmVzZXRzKCk7XG4gICAgICAgIH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdBZGQgbmV3bGluZSBiZWZvcmUnKVxuICAgICAgLmFkZFRvZ2dsZSh0ID0+IHQuc2V0VmFsdWUocy5hZGROZXdsaW5lQmVmb3JlKS5vbkNoYW5nZShhc3luYyAodikgPT4geyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IGFkZE5ld2xpbmVCZWZvcmU6IHYgfSk7IH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdBZGQgbmV3bGluZSBhZnRlcicpXG4gICAgICAuYWRkVG9nZ2xlKHQgPT4gdC5zZXRWYWx1ZShzLmFkZE5ld2xpbmVBZnRlcikub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBhZGROZXdsaW5lQWZ0ZXI6IHYgfSk7IH0pKTtcblxuICAgIC8vIEVycm9yIGxvZyAoYXQgdGhlIGJvdHRvbSlcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdFcnJvciBsb2cnIH0pO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0NsZWFyIGVycm9yIGxvZycpXG4gICAgICAuc2V0RGVzYygnUmVtb3ZlcyBzdG9yZWQgVm94aWRpYW4gZXJyb3IgZW50cmllcyBmcm9tIHRoaXMgdmF1bHQuJylcbiAgICAgIC5hZGRCdXR0b24oKGIpID0+XG4gICAgICAgIGJcbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dCgnQ2xlYXIgbG9nJylcbiAgICAgICAgICAuc2V0Q3RhKClcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2xlYXJFcnJvckxvZykgcmV0dXJuO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jbGVhckVycm9yTG9nKCk7XG4gICAgICAgICAgICBuZXcgTm90aWNlKCdWb3hpZGlhbiBlcnJvciBsb2cgY2xlYXJlZC4nKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcbiAgICBjb25zdCBsb2dDb250YWluZXIgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1lcnJvci1sb2cnIH0pO1xuICAgIGNvbnN0IGxvZyA9IHRoaXMuZ2V0RXJyb3JMb2cgPyB0aGlzLmdldEVycm9yTG9nKCkgOiBbXTtcbiAgICBpZiAoIWxvZyB8fCAhbG9nLmxlbmd0aCkge1xuICAgICAgbG9nQ29udGFpbmVyLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiAnTm8gZXJyb3JzIHJlY29yZGVkIHlldC4nIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBsaXN0ID0gbG9nQ29udGFpbmVyLmNyZWF0ZUVsKCd1bCcsIHsgY2xzOiAndm94aWRpYW4tZXJyb3ItbG9nLWxpc3QnIH0pO1xuICAgICAgY29uc3QgZW50cmllcyA9IFsuLi5sb2ddLnNvcnQoKGEsIGIpID0+IGIudHMgLSBhLnRzKS5zbGljZSgwLCA1MCk7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgY29uc3QgbGkgPSBsaXN0LmNyZWF0ZUVsKCdsaScsIHsgY2xzOiAndm94aWRpYW4tZXJyb3ItbG9nLWl0ZW0nIH0pO1xuICAgICAgICBjb25zdCB0cyA9IG5ldyBEYXRlKGVudHJ5LnRzKS50b0xvY2FsZVN0cmluZygpO1xuICAgICAgICBjb25zdCBzdGF0dXMgPSB0eXBlb2YgZW50cnkuc3RhdHVzID09PSAnbnVtYmVyJyA/IGAgJHtlbnRyeS5zdGF0dXN9YCA6ICcnO1xuICAgICAgICBsaS5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgICAgIGNsczogJ3ZveGlkaWFuLWVycm9yLWxvZy1tZXRhJyxcbiAgICAgICAgICB0ZXh0OiBgJHt0c30gXHUyMDE0ICR7ZW50cnkuc291cmNlfSR7c3RhdHVzfWAsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZW50cnkuZGV0YWlsKSB7XG4gICAgICAgICAgY29uc3QgcHJlID0gbGkuY3JlYXRlRWwoJ3ByZScsIHsgY2xzOiAndm94aWRpYW4tZXJyb3ItbG9nLWRldGFpbCcgfSk7XG4gICAgICAgICAgcHJlLnRleHRDb250ZW50ID0gZW50cnkuZGV0YWlsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCAiZXhwb3J0IGNsYXNzIEF1ZGlvUmVjb3JkZXIge1xuICBwcml2YXRlIG1lZGlhUmVjb3JkZXI/OiBNZWRpYVJlY29yZGVyO1xuICBwcml2YXRlIGNodW5rczogQmxvYlBhcnRbXSA9IFtdO1xuICBwcml2YXRlIHN0cmVhbT86IE1lZGlhU3RyZWFtO1xuICBwcml2YXRlIHN0YXJ0ZWRBdCA9IDA7XG4gIHByaXZhdGUgdGltZXI/OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBvblRpY2s/OiAoZWxhcHNlZE1zOiBudW1iZXIpID0+IHZvaWQpIHt9XG5cbiAgYXN5bmMgc3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMubWVkaWFSZWNvcmRlciAmJiB0aGlzLm1lZGlhUmVjb3JkZXIuc3RhdGUgPT09ICdyZWNvcmRpbmcnKSByZXR1cm47XG4gICAgdGhpcy5jaHVua3MgPSBbXTtcbiAgICB0aGlzLnN0cmVhbSA9IGF3YWl0IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHsgYXVkaW86IHRydWUgfSk7XG4gICAgY29uc3QgbWltZUNhbmRpZGF0ZXMgPSBbXG4gICAgICAnYXVkaW8vd2VibTtjb2RlY3M9b3B1cycsXG4gICAgICAnYXVkaW8vd2VibScsXG4gICAgICAnYXVkaW8vb2dnO2NvZGVjcz1vcHVzJyxcbiAgICAgICcnXG4gICAgXTtcbiAgICBsZXQgbWltZVR5cGUgPSAnJztcbiAgICBmb3IgKGNvbnN0IGNhbmQgb2YgbWltZUNhbmRpZGF0ZXMpIHtcbiAgICAgIGlmICghY2FuZCB8fCAod2luZG93IGFzIGFueSkuTWVkaWFSZWNvcmRlcj8uaXNUeXBlU3VwcG9ydGVkPy4oY2FuZCkpIHsgbWltZVR5cGUgPSBjYW5kOyBicmVhazsgfVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHRoaXMubWVkaWFSZWNvcmRlciA9IG5ldyBNZWRpYVJlY29yZGVyKHRoaXMuc3RyZWFtLCBtaW1lVHlwZSA/IHsgbWltZVR5cGUgfSA6IHVuZGVmaW5lZCk7XG4gICAgdGhpcy5tZWRpYVJlY29yZGVyLm9uZGF0YWF2YWlsYWJsZSA9IChlOiBCbG9iRXZlbnQpID0+IHsgaWYgKGUuZGF0YT8uc2l6ZSkgdGhpcy5jaHVua3MucHVzaChlLmRhdGEpOyB9O1xuICAgIHRoaXMubWVkaWFSZWNvcmRlci5zdGFydCgyNTApOyAvLyBzbWFsbCBjaHVua3NcbiAgICB0aGlzLnN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgaWYgKHRoaXMub25UaWNrKSB0aGlzLnRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHRoaXMub25UaWNrIShEYXRlLm5vdygpIC0gdGhpcy5zdGFydGVkQXQpLCAyMDApO1xuICB9XG5cbiAgcGF1c2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVkaWFSZWNvcmRlciAmJiB0aGlzLm1lZGlhUmVjb3JkZXIuc3RhdGUgPT09ICdyZWNvcmRpbmcnICYmIHR5cGVvZiB0aGlzLm1lZGlhUmVjb3JkZXIucGF1c2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMubWVkaWFSZWNvcmRlci5wYXVzZSgpO1xuICAgIH1cbiAgfVxuXG4gIHJlc3VtZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZWRpYVJlY29yZGVyICYmIHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSA9PT0gJ3BhdXNlZCcgJiYgdHlwZW9mIHRoaXMubWVkaWFSZWNvcmRlci5yZXN1bWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMubWVkaWFSZWNvcmRlci5yZXN1bWUoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzdG9wKCk6IFByb21pc2U8QmxvYj4ge1xuICAgIGNvbnN0IHJlYyA9IHRoaXMubWVkaWFSZWNvcmRlcjtcbiAgICBpZiAoIXJlYykgdGhyb3cgbmV3IEVycm9yKCdSZWNvcmRlciBub3Qgc3RhcnRlZCcpO1xuICAgIGNvbnN0IHN0b3BQcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgIHJlYy5vbnN0b3AgPSAoKSA9PiByZXNvbHZlKCk7XG4gICAgfSk7XG4gICAgaWYgKHJlYy5zdGF0ZSAhPT0gJ2luYWN0aXZlJykgcmVjLnN0b3AoKTtcbiAgICBhd2FpdCBzdG9wUHJvbWlzZTtcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IodGhpcy5jaHVua3MsIHsgdHlwZTogdGhpcy5jaHVua3MubGVuZ3RoID8gKHRoaXMuY2h1bmtzWzBdIGFzIGFueSkudHlwZSB8fCAnYXVkaW8vd2VibScgOiAnYXVkaW8vd2VibScgfSk7XG4gICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgcmV0dXJuIGJsb2I7XG4gIH1cblxuICBkaXNjYXJkKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1lZGlhUmVjb3JkZXIgJiYgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXRlICE9PSAnaW5hY3RpdmUnKSB0aGlzLm1lZGlhUmVjb3JkZXIuc3RvcCgpO1xuICAgIHRoaXMuY2xlYW51cCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGVhbnVwKCkge1xuICAgIGlmICh0aGlzLnRpbWVyKSB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcbiAgICB0aGlzLnRpbWVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMubWVkaWFSZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnN0YXJ0ZWRBdCA9IDA7XG4gICAgaWYgKHRoaXMuc3RyZWFtKSB7XG4gICAgICB0aGlzLnN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKHQgPT4gdC5zdG9wKCkpO1xuICAgICAgdGhpcy5zdHJlYW0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMuY2h1bmtzID0gW107XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBsb2dFcnJvciB9IGZyb20gJy4vbG9nZ2luZyc7XG5pbXBvcnQgdHlwZSB7IEFJVHJhbnNjcmlwdFNldHRpbmdzLCBQcm9tcHRQcmVzZXQgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvc3Rwcm9jZXNzVHJhbnNjcmlwdChcbiAgcmF3OiBzdHJpbmcsXG4gIHNldHRpbmdzOiBBSVRyYW5zY3JpcHRTZXR0aW5ncyxcbiAgcHJlc2V0PzogUHJvbXB0UHJlc2V0LFxuICBzZWxlY3Rpb24/OiBzdHJpbmcsXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBwcm92aWRlciA9IHNldHRpbmdzLnBvc3Rwcm9jZXNzaW5nUHJvdmlkZXIgfHwgJ29wZW5haSc7XG4gIGlmIChwcm92aWRlciA9PT0gJ2dlbWluaScpIHtcbiAgICByZXR1cm4gcG9zdHByb2Nlc3NXaXRoR2VtaW5pKHJhdywgc2V0dGluZ3MsIHByZXNldCwgc2VsZWN0aW9uKTtcbiAgfVxuICByZXR1cm4gcG9zdHByb2Nlc3NXaXRoT3BlbkFJKHJhdywgc2V0dGluZ3MsIHByZXNldCwgc2VsZWN0aW9uKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvc3Rwcm9jZXNzV2l0aE9wZW5BSShcbiAgcmF3OiBzdHJpbmcsXG4gIHNldHRpbmdzOiBBSVRyYW5zY3JpcHRTZXR0aW5ncyxcbiAgcHJlc2V0PzogUHJvbXB0UHJlc2V0LFxuICBzZWxlY3Rpb24/OiBzdHJpbmcsXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICBpZiAoIXNldHRpbmdzLm9wZW5haUFwaUtleSkgcmV0dXJuIHJhdzsgLy8gc2lsZW50bHkgc2tpcCBpZiBtaXNzaW5nXG4gIGNvbnN0IHsgc3lzdGVtLCB1c2VyQ29udGVudCB9ID0gYnVpbGRTeXN0ZW1BbmRVc2VyQ29udGVudChyYXcsIHByZXNldCwgc2VsZWN0aW9uKTtcbiAgY29uc3QgbW9kZWwgPSBwcmVzZXQ/Lm1vZGVsIHx8IHNldHRpbmdzLm9wZW5haU1vZGVsIHx8ICdncHQtNG8tbWluaSc7XG4gIGNvbnN0IHRlbXBlcmF0dXJlID0gY2xhbXAoKHByZXNldD8udGVtcGVyYXR1cmUgPz8gMC4yKSwgMCwgMSk7XG5cbiAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7c2V0dGluZ3Mub3BlbmFpQXBpS2V5fWAsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgbW9kZWwsXG4gICAgICB0ZW1wZXJhdHVyZSxcbiAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgIHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IHN5c3RlbSB9LFxuICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogdXNlckNvbnRlbnQgfSxcbiAgICAgIF0sXG4gICAgfSksXG4gIH0pO1xuICBpZiAoIXJlc3Aub2spIHtcbiAgICAvLyBJZiBPcGVuQUkgZmFpbHMsIHN1cmZhY2UgYSBub3RpY2UgYW5kIGZhbGwgYmFjayB0byByYXdcbiAgICBsZXQgZGV0YWlsID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGJvZHlUZXh0ID0gYXdhaXQgcmVzcC50ZXh0KCk7XG4gICAgICBkZXRhaWwgPSBib2R5VGV4dDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoYm9keVRleHQpO1xuICAgICAgICBjb25zdCBqc29uTXNnID0gcGFyc2VkPy5lcnJvcj8ubWVzc2FnZSB8fCBwYXJzZWQ/Lm1lc3NhZ2U7XG4gICAgICAgIGlmICh0eXBlb2YganNvbk1zZyA9PT0gJ3N0cmluZycgJiYganNvbk1zZy50cmltKCkpIHtcbiAgICAgICAgICBkZXRhaWwgPSBqc29uTXNnO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gaWdub3JlIEpTT04gcGFyc2UgZXJyb3JzOyBrZWVwIHJhdyBib2R5VGV4dFxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gaWdub3JlIGJvZHkgcmVhZCBlcnJvcnNcbiAgICB9XG4gICAgY29uc3QgdHJpbW1lZCA9XG4gICAgICBkZXRhaWwgJiYgZGV0YWlsLmxlbmd0aCA+IDMwMCA/IGAke2RldGFpbC5zbGljZSgwLCAyOTcpfVx1MjAyNmAgOiBkZXRhaWw7XG4gICAgbG9nRXJyb3IoJ09wZW5BSScsIHJlc3Auc3RhdHVzLCBkZXRhaWwgfHwgJzxuby1ib2R5PicpO1xuICAgIGNvbnN0IG5vdGljZU1zZyA9IHRyaW1tZWRcbiAgICAgID8gYE9wZW5BSSBwb3N0cHJvY2Vzc2luZyBmYWlsZWQgKCR7cmVzcC5zdGF0dXN9KTogJHt0cmltbWVkfWBcbiAgICAgIDogYE9wZW5BSSBwb3N0cHJvY2Vzc2luZyBmYWlsZWQgKCR7cmVzcC5zdGF0dXN9KS5gO1xuICAgIG5ldyBOb3RpY2Uobm90aWNlTXNnLCAxNTAwMCk7XG4gICAgcmV0dXJuIHJhdztcbiAgfVxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gIGNvbnN0IGNsZWFuZWQgPSBkYXRhPy5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQ7XG4gIHJldHVybiB0eXBlb2YgY2xlYW5lZCA9PT0gJ3N0cmluZycgJiYgY2xlYW5lZC50cmltKCkgPyBjbGVhbmVkIDogcmF3O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9zdHByb2Nlc3NXaXRoR2VtaW5pKFxuICByYXc6IHN0cmluZyxcbiAgc2V0dGluZ3M6IEFJVHJhbnNjcmlwdFNldHRpbmdzLFxuICBwcmVzZXQ/OiBQcm9tcHRQcmVzZXQsXG4gIHNlbGVjdGlvbj86IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghc2V0dGluZ3MuZ2VtaW5pQXBpS2V5KSByZXR1cm4gcmF3OyAvLyBzaWxlbnRseSBza2lwIGlmIG1pc3NpbmdcbiAgY29uc3QgeyBzeXN0ZW0sIHVzZXJDb250ZW50IH0gPSBidWlsZFN5c3RlbUFuZFVzZXJDb250ZW50KHJhdywgcHJlc2V0LCBzZWxlY3Rpb24pO1xuICBjb25zdCBtb2RlbCA9IHByZXNldD8ubW9kZWwgfHwgc2V0dGluZ3MuZ2VtaW5pTW9kZWwgfHwgJ2dlbWluaS0xLjUtZmxhc2gnO1xuICBjb25zdCB0ZW1wZXJhdHVyZSA9IGNsYW1wKChwcmVzZXQ/LnRlbXBlcmF0dXJlID8/IDAuMiksIDAsIDEpO1xuXG4gIGNvbnN0IHVybCA9XG4gICAgYGh0dHBzOi8vZ2VuZXJhdGl2ZWxhbmd1YWdlLmdvb2dsZWFwaXMuY29tL3YxYmV0YS9tb2RlbHMvYCArXG4gICAgYCR7ZW5jb2RlVVJJQ29tcG9uZW50KG1vZGVsKX06Z2VuZXJhdGVDb250ZW50YCArXG4gICAgYD9rZXk9JHtlbmNvZGVVUklDb21wb25lbnQoc2V0dGluZ3MuZ2VtaW5pQXBpS2V5KX1gO1xuXG4gIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcbiAgICB1cmwsXG4gICAge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzeXN0ZW1JbnN0cnVjdGlvbjoge1xuICAgICAgICAgIHBhcnRzOiBbeyB0ZXh0OiBzeXN0ZW0gfV0sXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgcGFydHM6IFt7IHRleHQ6IHVzZXJDb250ZW50IH1dLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIGdlbmVyYXRpb25Db25maWc6IHtcbiAgICAgICAgICB0ZW1wZXJhdHVyZSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIH0sXG4gICk7XG4gIGlmICghcmVzcC5vaykge1xuICAgIGxldCBkZXRhaWwgPSAnJztcbiAgICB0cnkge1xuICAgICAgY29uc3QgYm9keVRleHQgPSBhd2FpdCByZXNwLnRleHQoKTtcbiAgICAgIGRldGFpbCA9IGJvZHlUZXh0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShib2R5VGV4dCk7XG4gICAgICAgIGNvbnN0IGpzb25Nc2cgPSBwYXJzZWQ/LmVycm9yPy5tZXNzYWdlIHx8IHBhcnNlZD8ubWVzc2FnZTtcbiAgICAgICAgaWYgKHR5cGVvZiBqc29uTXNnID09PSAnc3RyaW5nJyAmJiBqc29uTXNnLnRyaW0oKSkge1xuICAgICAgICAgIGRldGFpbCA9IGpzb25Nc2c7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgIH1cbiAgICBjb25zdCB0cmltbWVkID1cbiAgICAgIGRldGFpbCAmJiBkZXRhaWwubGVuZ3RoID4gMzAwID8gYCR7ZGV0YWlsLnNsaWNlKDAsIDI5Nyl9XHUyMDI2YCA6IGRldGFpbDtcbiAgICBsb2dFcnJvcignR2VtaW5pJywgcmVzcC5zdGF0dXMsIGRldGFpbCB8fCAnPG5vLWJvZHk+Jyk7XG4gICAgY29uc3Qgbm90aWNlTXNnID0gdHJpbW1lZFxuICAgICAgPyBgR2VtaW5pIHBvc3Rwcm9jZXNzaW5nIGZhaWxlZCAoJHtyZXNwLnN0YXR1c30pOiAke3RyaW1tZWR9YFxuICAgICAgOiBgR2VtaW5pIHBvc3Rwcm9jZXNzaW5nIGZhaWxlZCAoJHtyZXNwLnN0YXR1c30pLmA7XG4gICAgbmV3IE5vdGljZShub3RpY2VNc2csIDE1MDAwKTtcbiAgICByZXR1cm4gcmF3O1xuICB9XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgY29uc3QgcGFydHMgPSBkYXRhPy5jYW5kaWRhdGVzPy5bMF0/LmNvbnRlbnQ/LnBhcnRzO1xuICBjb25zdCBjbGVhbmVkID1cbiAgICBBcnJheS5pc0FycmF5KHBhcnRzKVxuICAgICAgPyBwYXJ0c1xuICAgICAgICAgIC5tYXAoKHA6IGFueSkgPT4gKHR5cGVvZiBwPy50ZXh0ID09PSAnc3RyaW5nJyA/IHAudGV4dCA6ICcnKSlcbiAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgcmV0dXJuIHR5cGVvZiBjbGVhbmVkID09PSAnc3RyaW5nJyAmJiBjbGVhbmVkLnRyaW0oKSA/IGNsZWFuZWQgOiByYXc7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkU3lzdGVtQW5kVXNlckNvbnRlbnQoXG4gIHJhdzogc3RyaW5nLFxuICBwcmVzZXQ/OiBQcm9tcHRQcmVzZXQsXG4gIHNlbGVjdGlvbj86IHN0cmluZyxcbik6IHsgc3lzdGVtOiBzdHJpbmc7IHVzZXJDb250ZW50OiBzdHJpbmcgfSB7XG4gIGxldCBzeXN0ZW0gPVxuICAgIHByZXNldD8uc3lzdGVtIHx8XG4gICAgJ1lvdSBjbGVhbiB1cCBzcG9rZW4gdGV4dC4gRml4IGNhcGl0YWxpemF0aW9uIGFuZCBwdW5jdHVhdGlvbiwgcmVtb3ZlIGZpbGxlciB3b3JkcywgcHJlc2VydmUgbWVhbmluZy4gRG8gbm90IGFkZCBjb250ZW50Lic7XG5cbiAgY29uc3Qgc2VsID0gKHNlbGVjdGlvbiB8fCAnJykudHJpbSgpO1xuICBsZXQgdXNlckNvbnRlbnQgPSByYXc7XG4gIGlmIChzZWwpIHtcbiAgICBpZiAoc3lzdGVtLmluY2x1ZGVzKCd7e3NlbGVjdGlvbn19JykpIHtcbiAgICAgIHN5c3RlbSA9IHN5c3RlbS5zcGxpdCgne3tzZWxlY3Rpb259fScpLmpvaW4oc2VsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY29udGV4dEJsb2NrID0gYENvbnRleHQgKHNlbGVjdGVkIHRleHQpOlxcbi0tLVxcbiR7c2VsfVxcbi0tLVxcblxcbmA7XG4gICAgICB1c2VyQ29udGVudCA9IGNvbnRleHRCbG9jayArIHJhdztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgc3lzdGVtLCB1c2VyQ29udGVudCB9O1xufVxuXG5mdW5jdGlvbiBjbGFtcChuOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikgeyByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIG4pKTsgfVxuIiwgImV4cG9ydCB0eXBlIFZveGlkaWFuRXJyb3JTb3VyY2UgPSAnR3JvcScgfCAnT3BlbkFJJyB8ICdHZW1pbmknO1xuXG5leHBvcnQgaW50ZXJmYWNlIFZveGlkaWFuRXJyb3JMb2dFbnRyeSB7XG4gIHRzOiBudW1iZXI7XG4gIHNvdXJjZTogVm94aWRpYW5FcnJvclNvdXJjZTtcbiAgc3RhdHVzPzogbnVtYmVyO1xuICBkZXRhaWw/OiBzdHJpbmc7XG59XG5cbmxldCBlcnJvckxvZ1Npbms6ICgoZW50cnk6IFZveGlkaWFuRXJyb3JMb2dFbnRyeSkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckVycm9yTG9nU2luayhmbjogKGVudHJ5OiBWb3hpZGlhbkVycm9yTG9nRW50cnkpID0+IHZvaWQpOiB2b2lkIHtcbiAgZXJyb3JMb2dTaW5rID0gZm47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dFcnJvcihzb3VyY2U6IFZveGlkaWFuRXJyb3JTb3VyY2UsIHN0YXR1czogbnVtYmVyLCBkZXRhaWw6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBlbnRyeTogVm94aWRpYW5FcnJvckxvZ0VudHJ5ID0ge1xuICAgIHRzOiBEYXRlLm5vdygpLFxuICAgIHNvdXJjZSxcbiAgICBzdGF0dXMsXG4gICAgZGV0YWlsLFxuICB9O1xuICB0cnkge1xuICAgIGNvbnN0IHcgPSB3aW5kb3cgYXMgYW55O1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh3LlZveGlkaWFuRXJyb3JMb2cpKSB7XG4gICAgICB3LlZveGlkaWFuRXJyb3JMb2cgPSBbXTtcbiAgICB9XG4gICAgdy5Wb3hpZGlhbkVycm9yTG9nLnB1c2goZW50cnkpO1xuICB9IGNhdGNoIHtcbiAgICAvLyBOb24tYnJvd3NlciBlbnZpcm9ubWVudDsgaWdub3JlLlxuICB9XG4gIHRyeSB7XG4gICAgaWYgKGVycm9yTG9nU2luaykgZXJyb3JMb2dTaW5rKGVudHJ5KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tWb3hpZGlhbl0gZXJyb3IgbG9nIHNpbmsgZmFpbGVkJywgZSk7XG4gIH1cbiAgY29uc29sZS53YXJuKCdbVm94aWRpYW5dJywgc291cmNlLCAnZXJyb3InLCBzdGF0dXMsIGRldGFpbCB8fCAnPG5vLWJvZHk+Jyk7XG59XG5cbiIsICJpbXBvcnQgeyBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBsb2dFcnJvciB9IGZyb20gJy4vbG9nZ2luZyc7XG5pbXBvcnQgdHlwZSB7IEFJVHJhbnNjcmlwdFNldHRpbmdzIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0cmFuc2NyaWJlV2l0aEdyb3EoYmxvYjogQmxvYiwgc2V0dGluZ3M6IEFJVHJhbnNjcmlwdFNldHRpbmdzKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgaWYgKCFzZXR0aW5ncy5ncm9xQXBpS2V5KSB0aHJvdyBuZXcgRXJyb3IoJ0dyb3EgQVBJIGtleSBpcyBtaXNzaW5nIGluIHNldHRpbmdzLicpO1xuICBjb25zdCBmZCA9IG5ldyBGb3JtRGF0YSgpO1xuICBmZC5hcHBlbmQoJ2ZpbGUnLCBuZXcgRmlsZShbYmxvYl0sICdhdWRpby53ZWJtJywgeyB0eXBlOiBibG9iLnR5cGUgfHwgJ2F1ZGlvL3dlYm0nIH0pKTtcbiAgZmQuYXBwZW5kKCdtb2RlbCcsIHNldHRpbmdzLmdyb3FNb2RlbCB8fCAnd2hpc3Blci1sYXJnZS12MycpO1xuICBpZiAoc2V0dGluZ3MubGFuZ3VhZ2UpIGZkLmFwcGVuZCgnbGFuZ3VhZ2UnLCBzZXR0aW5ncy5sYW5ndWFnZSk7XG5cbiAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5ncm9xLmNvbS9vcGVuYWkvdjEvYXVkaW8vdHJhbnNjcmlwdGlvbnMnLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtzZXR0aW5ncy5ncm9xQXBpS2V5fWAgfSxcbiAgICBib2R5OiBmZCxcbiAgfSk7XG4gIGlmICghcmVzcC5vaykge1xuICAgIGxldCBkZXRhaWwgPSBhd2FpdCBzYWZlVGV4dChyZXNwKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShkZXRhaWwpO1xuICAgICAgY29uc3QganNvbk1zZyA9IChwYXJzZWQgYXMgYW55KT8uZXJyb3I/Lm1lc3NhZ2UgfHwgKHBhcnNlZCBhcyBhbnkpPy5tZXNzYWdlO1xuICAgICAgaWYgKHR5cGVvZiBqc29uTXNnID09PSAnc3RyaW5nJyAmJiBqc29uTXNnLnRyaW0oKSkge1xuICAgICAgICBkZXRhaWwgPSBqc29uTXNnO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gaWdub3JlIEpTT04gcGFyc2UgZXJyb3JzOyBrZWVwIHJhdyBkZXRhaWxcbiAgICB9XG4gICAgY29uc3QgdHJpbW1lZCA9XG4gICAgICBkZXRhaWwgJiYgZGV0YWlsLmxlbmd0aCA+IDMwMCA/IGAke2RldGFpbC5zbGljZSgwLCAyOTcpfVx1MjAyNmAgOiBkZXRhaWw7XG4gICAgbG9nRXJyb3IoJ0dyb3EnLCByZXNwLnN0YXR1cywgZGV0YWlsIHx8ICc8bm8tYm9keT4nKTtcbiAgICBjb25zdCBub3RpY2VNc2cgPSB0cmltbWVkXG4gICAgICA/IGBHcm9xIHRyYW5zY3JpcHRpb24gZmFpbGVkICgke3Jlc3Auc3RhdHVzfSk6ICR7dHJpbW1lZH1gXG4gICAgICA6IGBHcm9xIHRyYW5zY3JpcHRpb24gZmFpbGVkICgke3Jlc3Auc3RhdHVzfSkuYDtcbiAgICBuZXcgTm90aWNlKG5vdGljZU1zZywgMTUwMDApO1xuICAgIHRocm93IG5ldyBFcnJvcihgR3JvcSB0cmFuc2NyaXB0aW9uIGZhaWxlZCAoJHtyZXNwLnN0YXR1c30pOiAke2RldGFpbCB8fCAnPG5vLWJvZHk+J31gKTtcbiAgfVxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gIGlmICh0eXBlb2YgZGF0YT8udGV4dCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignR3JvcSByZXNwb25zZSBtaXNzaW5nIHRleHQnKTtcbiAgcmV0dXJuIGRhdGEudGV4dCBhcyBzdHJpbmc7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhZmVUZXh0KHJlc3A6IFJlc3BvbnNlKSB7XG4gIHRyeSB7IHJldHVybiBhd2FpdCByZXNwLnRleHQoKTsgfSBjYXRjaCB7IHJldHVybiAnPG5vLWJvZHk+JzsgfVxufVxuIiwgImV4cG9ydCB0eXBlIEluc2VydE1vZGUgPSAnaW5zZXJ0JyB8ICdyZXBsYWNlJztcbmV4cG9ydCB0eXBlIFBvc3Rwcm9jZXNzaW5nUHJvdmlkZXIgPSAnb3BlbmFpJyB8ICdnZW1pbmknO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb21wdFByZXNldCB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgc3lzdGVtOiBzdHJpbmc7XG4gIHRlbXBlcmF0dXJlOiBudW1iZXI7XG4gIGluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQ/OiBib29sZWFuO1xuICByZXBsYWNlU2VsZWN0aW9uPzogYm9vbGVhbjtcbiAgbW9kZWw/OiBzdHJpbmc7IC8vIG9wdGlvbmFsIE9wZW5BSSBtb2RlbCBvdmVycmlkZVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFJVHJhbnNjcmlwdFNldHRpbmdzIHtcbiAgZ3JvcUFwaUtleTogc3RyaW5nO1xuICBncm9xTW9kZWw6IHN0cmluZzsgLy8gZS5nLiwgJ3doaXNwZXItbGFyZ2UtdjMnXG4gIGxhbmd1YWdlPzogc3RyaW5nOyAvLyBJU08gY29kZSwgb3B0aW9uYWxcblxuICBvcGVuYWlBcGlLZXk/OiBzdHJpbmc7XG4gIG9wZW5haU1vZGVsOiBzdHJpbmc7IC8vIGUuZy4sICdncHQtNG8tbWluaSdcblxuICAgZ2VtaW5pQXBpS2V5Pzogc3RyaW5nO1xuICAgZ2VtaW5pTW9kZWw6IHN0cmluZzsgLy8gZS5nLiwgJ2dlbWluaS0xLjUtZmxhc2gnXG5cbiAgIHBvc3Rwcm9jZXNzaW5nUHJvdmlkZXI6IFBvc3Rwcm9jZXNzaW5nUHJvdmlkZXI7XG5cbiAgcHJvbXB0UHJlc2V0czogUHJvbXB0UHJlc2V0W107XG4gIGRlZmF1bHRQcm9tcHRJZD86IHN0cmluZztcbiAgbGFzdFVzZWRQcm9tcHRJZD86IHN0cmluZztcblxuICBzaG93TW9kYWxXaGlsZVJlY29yZGluZzogYm9vbGVhbjtcbiAgbWF4RHVyYXRpb25TZWM6IG51bWJlcjtcbiAgaW5zZXJ0TW9kZTogSW5zZXJ0TW9kZTtcbiAgYWRkTmV3bGluZUJlZm9yZTogYm9vbGVhbjtcbiAgYWRkTmV3bGluZUFmdGVyOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QUkVTRVQ6IFByb21wdFByZXNldCA9IHtcbiAgaWQ6ICdwb2xpc2hlZCcsXG4gIG5hbWU6ICdQb2xpc2hlZCcsXG4gIHN5c3RlbTpcbiAgICAnWW91IGNsZWFuIHVwIHNwb2tlbiB0ZXh0LiBGaXggY2FwaXRhbGl6YXRpb24gYW5kIHB1bmN0dWF0aW9uLCByZW1vdmUgZmlsbGVyIHdvcmRzLCBwcmVzZXJ2ZSBtZWFuaW5nLiBEbyBub3QgYWRkIGNvbnRlbnQuJyxcbiAgdGVtcGVyYXR1cmU6IDAuMixcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBBSVRyYW5zY3JpcHRTZXR0aW5ncyA9IHtcbiAgZ3JvcUFwaUtleTogJycsXG4gIGdyb3FNb2RlbDogJ3doaXNwZXItbGFyZ2UtdjMnLFxuICBsYW5ndWFnZTogdW5kZWZpbmVkLFxuXG4gIG9wZW5haUFwaUtleTogJycsXG4gIG9wZW5haU1vZGVsOiAnZ3B0LTRvLW1pbmknLFxuXG4gIGdlbWluaUFwaUtleTogJycsXG4gIGdlbWluaU1vZGVsOiAnZ2VtaW5pLTEuNS1mbGFzaCcsXG5cbiAgcG9zdHByb2Nlc3NpbmdQcm92aWRlcjogJ29wZW5haScsXG5cbiAgcHJvbXB0UHJlc2V0czogW0RFRkFVTFRfUFJFU0VUXSxcbiAgZGVmYXVsdFByb21wdElkOiAncG9saXNoZWQnLFxuICBsYXN0VXNlZFByb21wdElkOiAncG9saXNoZWQnLFxuXG4gIHNob3dNb2RhbFdoaWxlUmVjb3JkaW5nOiB0cnVlLFxuICBtYXhEdXJhdGlvblNlYzogOTAwLFxuICBpbnNlcnRNb2RlOiAnaW5zZXJ0JyxcbiAgYWRkTmV3bGluZUJlZm9yZTogZmFsc2UsXG4gIGFkZE5ld2xpbmVBZnRlcjogdHJ1ZSxcbn07XG4iLCAiaW1wb3J0IHsgQXBwLCBNb2RhbCwgU2V0dGluZywgRHJvcGRvd25Db21wb25lbnQgfSBmcm9tICdvYnNpZGlhbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlY29yZGluZ01vZGFsT3B0aW9ucyB7XHJcbiAgcHJlc2V0czogeyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfVtdO1xyXG4gIGRlZmF1bHRQcmVzZXRJZD86IHN0cmluZztcclxuICBtYXhEdXJhdGlvblNlYzogbnVtYmVyO1xyXG4gIG9uU3RhcnQ/OiAoKSA9PiB2b2lkO1xyXG4gIG9uU3RvcDogKGFwcGx5UG9zdDogYm9vbGVhbiwgcHJlc2V0SWQ/OiBzdHJpbmcpID0+IHZvaWQ7XHJcbiAgb25EaXNjYXJkOiAoKSA9PiB2b2lkO1xyXG4gIG9uUGF1c2U/OiAoKSA9PiB2b2lkO1xyXG4gIG9uUmVzdW1lPzogKCkgPT4gdm9pZDtcclxuICBvbkNsb3NlPzogKCkgPT4gdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFJlY29yZGluZ01vZGFsIGV4dGVuZHMgTW9kYWwge1xyXG4gIHByaXZhdGUgcm9vdEVsPzogSFRNTERpdkVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBlbGFwc2VkRWw/OiBIVE1MRWxlbWVudDtcclxuICBwcml2YXRlIHRpbWVyPzogbnVtYmVyO1xyXG4gIHByaXZhdGUgc3RhcnRlZEF0ID0gMDtcclxuICBwcml2YXRlIHByZXNldERyb3Bkb3duPzogRHJvcGRvd25Db21wb25lbnQ7XHJcbiAgcHJpdmF0ZSBwYXVzZUJ0bkVsPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSB0cmFuc2NyaWJlQnRuRWw/OiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBwcml2YXRlIHBvc3Rwcm9jZXNzQnRuRWw/OiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgcHJpdmF0ZSBzdGF0dXNUZXh0RWw/OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBkaXNjYXJkQnRuRWw/OiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgcHJpdmF0ZSBpc1BhdXNlZCA9IGZhbHNlO1xuICBwcml2YXRlIHBhdXNlU3RhcnRlZEF0ID0gMDtcbiAgcHJpdmF0ZSBhY2N1bXVsYXRlZFBhdXNlTXMgPSAwO1xuICBwcml2YXRlIG91dHNpZGVDYXB0dXJlT3B0czogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMgPSB7IGNhcHR1cmU6IHRydWUgfTtcbiAgcHJpdmF0ZSBvdXRzaWRlVG91Y2hPcHRzOiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyA9IHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogZmFsc2UgfTtcbiAgcHJpdmF0ZSBwcmV2ZW50T3V0c2lkZUNsb3NlID0gKGV2dDogRXZlbnQpID0+IHtcbiAgICBpZiAoIXRoaXMubW9kYWxFbCkgcmV0dXJuO1xuICAgIGlmICh0aGlzLm1vZGFsRWwuY29udGFpbnMoZXZ0LnRhcmdldCBhcyBOb2RlKSkgcmV0dXJuO1xuICAgIC8vIEJsb2NrIGRlZmF1bHQgbW9kYWwgYmVoYXZpb3IgdGhhdCBjbG9zZXMgb24gYmFja2Ryb3AgaW50ZXJhY3Rpb25zXG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGV2dC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvcHRzOiBSZWNvcmRpbmdNb2RhbE9wdGlvbnMpIHtcbiAgICBzdXBlcihhcHApO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xyXG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XHJcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcclxuXHJcbiAgICB0aGlzLm1vZGFsRWwuYWRkQ2xhc3MoJ3ZveGlkaWFuLW1vZGFsJyk7XHJcblxyXG4gICAgdGhpcy5yb290RWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiAndm94aWRpYW4tcm9vdCcgfSk7XHJcbiAgICB0aGlzLnJvb3RFbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtcGhhc2UnLCAncmVjb3JkaW5nJyk7XHJcblxyXG4gICAgY29uc3QgaGVhZGVyID0gdGhpcy5yb290RWwuY3JlYXRlRGl2KHsgY2xzOiAndm94aWRpYW4taGVhZGVyJyB9KTtcclxuICAgIGhlYWRlci5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdWb3hpZGlhbicgfSk7XHJcbiAgICBjb25zdCBoZWFkZXJSaWdodCA9IGhlYWRlci5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1oZWFkZXItcmlnaHQnIH0pO1xyXG4gICAgaGVhZGVyUmlnaHQuY3JlYXRlRGl2KHsgY2xzOiAnYWktcmVjLWluZGljYXRvcicsIGF0dHI6IHsgJ2FyaWEtbGFiZWwnOiAnUmVjb3JkaW5nIGluZGljYXRvcicgfSB9KTtcclxuICAgIHRoaXMuZWxhcHNlZEVsID0gaGVhZGVyUmlnaHQuY3JlYXRlRGl2KHsgdGV4dDogJzAwOjAwJywgY2xzOiAndm94aWRpYW4tdGltZXInIH0pO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsID0gaGVhZGVyUmlnaHQuY3JlYXRlRWwoJ2J1dHRvbicsIHtcclxuICAgICAgdGV4dDogJ1x1Mjc1QVx1Mjc1QScsXHJcbiAgICAgIHR5cGU6ICdidXR0b24nLFxyXG4gICAgICBjbHM6ICd2b3hpZGlhbi1wYXVzZScsXHJcbiAgICAgIGF0dHI6IHsgJ2FyaWEtbGFiZWwnOiAnUGF1c2UgcmVjb3JkaW5nJywgJ2FyaWEtcHJlc3NlZCc6ICdmYWxzZScgfSxcclxuICAgIH0pO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy50b2dnbGVQYXVzZSgpKTtcclxuICAgIHRoaXMucmVzZXRQYXVzZVN0YXRlKCk7XHJcblxyXG4gICAgY29uc3QgYm9keSA9IHRoaXMucm9vdEVsLmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLWJvZHknIH0pO1xyXG5cclxuICAgIC8vIFByZXNldCBzZWxlY3Rpb25cclxuICAgIG5ldyBTZXR0aW5nKGJvZHkpXHJcbiAgICAgIC5zZXROYW1lKCdQb3N0cHJvY2Vzc2luZyBwcmVzZXQnKVxyXG4gICAgICAuYWRkRHJvcGRvd24oZCA9PiB7XHJcbiAgICAgICAgdGhpcy5wcmVzZXREcm9wZG93biA9IGQ7XHJcbiAgICAgICAgZm9yIChjb25zdCBwIG9mIHRoaXMub3B0cy5wcmVzZXRzKSBkLmFkZE9wdGlvbihwLmlkLCBwLm5hbWUpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuZGVmYXVsdFByZXNldElkKSBkLnNldFZhbHVlKHRoaXMub3B0cy5kZWZhdWx0UHJlc2V0SWQpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICBjb25zdCBidG5zID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1idXR0b25zJyB9KTtcclxuICAgIHRoaXMudHJhbnNjcmliZUJ0bkVsID0gYnRucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnVHJhbnNjcmliZScsIHR5cGU6ICdidXR0b24nIH0pO1xyXG4gICAgdGhpcy5wb3N0cHJvY2Vzc0J0bkVsID0gYnRucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnUG9zdFByb2Nlc3MnLCB0eXBlOiAnYnV0dG9uJyB9KTtcclxuICAgIHRoaXMuZGlzY2FyZEJ0bkVsID0gYnRucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnQ2FuY2VsJywgdHlwZTogJ2J1dHRvbicgfSk7XG4gICAgdGhpcy50cmFuc2NyaWJlQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnRyaWdnZXJTdG9wKGZhbHNlKSk7XHJcbiAgICB0aGlzLnBvc3Rwcm9jZXNzQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnRyaWdnZXJTdG9wKHRydWUpKTtcclxuICAgIHRoaXMuZGlzY2FyZEJ0bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5vcHRzLm9uRGlzY2FyZCgpKTtcclxuXHJcbiAgICBjb25zdCBzdGF0dXNCYXIgPSB0aGlzLnJvb3RFbC5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1zdGF0dXNiYXInIH0pO1xyXG4gICAgY29uc3Qgc3RhdHVzV3JhcCA9IHN0YXR1c0Jhci5jcmVhdGVEaXYoeyBjbHM6ICdhaS1zdGF0dXMtd3JhcCcgfSk7XHJcbiAgICBzdGF0dXNXcmFwLmNyZWF0ZURpdih7IGNsczogJ2FpLXNwaW5uZXInLCBhdHRyOiB7ICdhcmlhLWxhYmVsJzogJ1dvcmtpbmdcdTIwMjYnIH0gfSk7XHJcbiAgICB0aGlzLnN0YXR1c1RleHRFbCA9IHN0YXR1c1dyYXAuY3JlYXRlRGl2KHsgY2xzOiAnYWktc3RhdHVzLXRleHQnLCB0ZXh0OiAnTGlzdGVuaW5nXHUyMDI2JyB9KTtcclxuXG4gICAgdGhpcy5tb2RhbEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgdGhpcy5vcHRzLm9uRGlzY2FyZCgpO1xuICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyU3RvcChmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5jb250YWluZXJFbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHRoaXMucHJldmVudE91dHNpZGVDbG9zZSwgdGhpcy5vdXRzaWRlQ2FwdHVyZU9wdHMpO1xuICAgIHRoaXMuY29udGFpbmVyRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnByZXZlbnRPdXRzaWRlQ2xvc2UsIHRoaXMub3V0c2lkZUNhcHR1cmVPcHRzKTtcbiAgICB0aGlzLmNvbnRhaW5lckVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLnByZXZlbnRPdXRzaWRlQ2xvc2UsIHRoaXMub3V0c2lkZVRvdWNoT3B0cyk7XG5cbiAgICAvLyBTdGFydCB0aW1lclxuICAgIHRoaXMuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHRoaXMudGljaygpLCAyMDApO1xuICAgIHRoaXMub3B0cy5vblN0YXJ0Py4oKTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250YWluZXJFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHRoaXMucHJldmVudE91dHNpZGVDbG9zZSwgdGhpcy5vdXRzaWRlQ2FwdHVyZU9wdHMpO1xuICAgIHRoaXMuY29udGFpbmVyRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnByZXZlbnRPdXRzaWRlQ2xvc2UsIHRoaXMub3V0c2lkZUNhcHR1cmVPcHRzKTtcbiAgICB0aGlzLmNvbnRhaW5lckVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLnByZXZlbnRPdXRzaWRlQ2xvc2UsIHRoaXMub3V0c2lkZVRvdWNoT3B0cyk7XG4gICAgaWYgKHRoaXMudGltZXIpIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuICAgIHRoaXMudGltZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgICB0aGlzLm9wdHMub25DbG9zZT8uKCk7XG4gIH1cblxyXG4gIHByaXZhdGUgdGljaygpOiB2b2lkIHtcclxuICAgIGNvbnN0IGVsYXBzZWRNcyA9IHRoaXMuZ2V0RWxhcHNlZE1zKCk7XHJcbiAgICBjb25zdCBzZWMgPSBNYXRoLmZsb29yKGVsYXBzZWRNcyAvIDEwMDApO1xyXG4gICAgY29uc3QgbW0gPSBNYXRoLmZsb29yKHNlYyAvIDYwKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XHJcbiAgICBjb25zdCBzcyA9IChzZWMgJSA2MCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xyXG4gICAgaWYgKHRoaXMuZWxhcHNlZEVsKSB0aGlzLmVsYXBzZWRFbC50ZXh0Q29udGVudCA9IGAke21tfToke3NzfWA7XHJcbiAgICBpZiAodGhpcy5vcHRzLm1heER1cmF0aW9uU2VjID4gMCAmJiAhdGhpcy5pc1BhdXNlZCAmJiBzZWMgPj0gdGhpcy5vcHRzLm1heER1cmF0aW9uU2VjKSB7XHJcbiAgICAgIHRoaXMudHJpZ2dlclN0b3AoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRFbGFwc2VkTXMoKTogbnVtYmVyIHtcclxuICAgIGlmICghdGhpcy5zdGFydGVkQXQpIHJldHVybiAwO1xyXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5zdGFydGVkQXQgLSB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcztcclxuICAgIGlmICh0aGlzLmlzUGF1c2VkICYmIHRoaXMucGF1c2VTdGFydGVkQXQpIHtcclxuICAgICAgZWxhcHNlZCAtPSBub3cgLSB0aGlzLnBhdXNlU3RhcnRlZEF0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIGVsYXBzZWQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0cmlnZ2VyU3RvcChhcHBseVBvc3Q6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuZmluYWxpemVQYXVzZVN0YXRlKCk7XHJcbiAgICBjb25zdCBwcmVzZXRJZCA9IHRoaXMucHJlc2V0RHJvcGRvd24/LmdldFZhbHVlKCk7XHJcbiAgICB0aGlzLm9wdHMub25TdG9wKGFwcGx5UG9zdCwgcHJlc2V0SWQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0b2dnbGVQYXVzZSgpIHtcclxuICAgIGlmICh0aGlzLmlzUGF1c2VkKSB7XHJcbiAgICAgIHRoaXMucmVzdW1lUmVjb3JkaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnBhdXNlUmVjb3JkaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBhdXNlUmVjb3JkaW5nKCkge1xyXG4gICAgaWYgKHRoaXMuaXNQYXVzZWQpIHJldHVybjtcclxuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5wYXVzZVN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XHJcbiAgICB0aGlzLnVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKTtcclxuICAgIHRoaXMub3B0cy5vblBhdXNlPy4oKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzdW1lUmVjb3JkaW5nKCkge1xyXG4gICAgaWYgKCF0aGlzLmlzUGF1c2VkKSByZXR1cm47XHJcbiAgICBpZiAodGhpcy5wYXVzZVN0YXJ0ZWRBdCkgdGhpcy5hY2N1bXVsYXRlZFBhdXNlTXMgKz0gRGF0ZS5ub3coKSAtIHRoaXMucGF1c2VTdGFydGVkQXQ7XHJcbiAgICB0aGlzLnBhdXNlU3RhcnRlZEF0ID0gMDtcclxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMudXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpO1xyXG4gICAgdGhpcy5vcHRzLm9uUmVzdW1lPy4oKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZmluYWxpemVQYXVzZVN0YXRlKCkge1xyXG4gICAgaWYgKHRoaXMuaXNQYXVzZWQgJiYgdGhpcy5wYXVzZVN0YXJ0ZWRBdCkge1xyXG4gICAgICB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcyArPSBEYXRlLm5vdygpIC0gdGhpcy5wYXVzZVN0YXJ0ZWRBdDtcclxuICAgIH1cclxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSAwO1xyXG4gICAgdGhpcy51cGRhdGVQYXVzZUJ1dHRvbkxhYmVsKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0UGF1c2VTdGF0ZSgpIHtcclxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSAwO1xyXG4gICAgdGhpcy5hY2N1bXVsYXRlZFBhdXNlTXMgPSAwO1xyXG4gICAgdGhpcy51cGRhdGVQYXVzZUJ1dHRvbkxhYmVsKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKSB7XHJcbiAgICBpZiAoIXRoaXMucGF1c2VCdG5FbCkgcmV0dXJuO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLmNsYXNzTGlzdC50b2dnbGUoJ2lzLXBhdXNlZCcsIHRoaXMuaXNQYXVzZWQpO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLnRleHRDb250ZW50ID0gdGhpcy5pc1BhdXNlZCA/ICdcdTI1QjYnIDogJ1x1Mjc1QVx1Mjc1QSc7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCB0aGlzLmlzUGF1c2VkID8gJ3RydWUnIDogJ2ZhbHNlJyk7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgdGhpcy5pc1BhdXNlZCA/ICdSZXN1bWUgcmVjb3JkaW5nJyA6ICdQYXVzZSByZWNvcmRpbmcnKTtcclxuICB9XHJcblxyXG4gIC8vIFB1YmxpYyBVSSBoZWxwZXJzXHJcbiAgc2V0UGhhc2UocGhhc2U6ICdyZWNvcmRpbmcnIHwgJ3RyYW5zY3JpYmluZycgfCAncG9zdHByb2Nlc3NpbmcnIHwgJ2RvbmUnIHwgJ2Vycm9yJykge1xyXG4gICAgdGhpcy5yb290RWw/LnNldEF0dHJpYnV0ZSgnZGF0YS1waGFzZScsIHBoYXNlKTtcclxuICAgIGlmIChwaGFzZSAhPT0gJ3JlY29yZGluZycpIHtcclxuICAgICAgdGhpcy5maW5hbGl6ZVBhdXNlU3RhdGUoKTtcclxuICAgICAgaWYgKHRoaXMudGltZXIpIHsgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7IHRoaXMudGltZXIgPSB1bmRlZmluZWQ7IH1cclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBhdXNlQnRuRWwpIHRoaXMucGF1c2VCdG5FbC5kaXNhYmxlZCA9IHBoYXNlICE9PSAncmVjb3JkaW5nJztcclxuICB9XHJcblxyXG4gIHNldFN0YXR1cyh0ZXh0OiBzdHJpbmcpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1c1RleHRFbCkgdGhpcy5zdGF0dXNUZXh0RWwudGV4dENvbnRlbnQgPSB0ZXh0O1xyXG4gIH1cclxuXHJcbiAgc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQodHJhbnNjcmliZUVuYWJsZWQ6IGJvb2xlYW4sIHBvc3Rwcm9jZXNzRW5hYmxlZDogYm9vbGVhbiwgZGlzY2FyZEVuYWJsZWQ6IGJvb2xlYW4pIHtcclxuICAgIGlmICh0aGlzLnRyYW5zY3JpYmVCdG5FbCkgdGhpcy50cmFuc2NyaWJlQnRuRWwuZGlzYWJsZWQgPSAhdHJhbnNjcmliZUVuYWJsZWQ7XHJcbiAgICBpZiAodGhpcy5wb3N0cHJvY2Vzc0J0bkVsKSB0aGlzLnBvc3Rwcm9jZXNzQnRuRWwuZGlzYWJsZWQgPSAhcG9zdHByb2Nlc3NFbmFibGVkO1xyXG4gICAgaWYgKHRoaXMuZGlzY2FyZEJ0bkVsKSB0aGlzLmRpc2NhcmRCdG5FbC5kaXNhYmxlZCA9ICFkaXNjYXJkRW5hYmxlZDtcclxuICB9XHJcblxyXG4gIHNldERpc2NhcmRMYWJlbChsYWJlbDogc3RyaW5nKSB7XHJcbiAgICBpZiAodGhpcy5kaXNjYXJkQnRuRWwpIHRoaXMuZGlzY2FyZEJ0bkVsLnRleHRDb250ZW50ID0gbGFiZWw7XHJcbiAgfVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUErRDs7O0FDQS9ELHNCQUF1RjtBQUl2RixJQUFNLG9CQUFOLGNBQWdDLHNCQUFNO0FBQUEsRUFHcEMsWUFBWSxLQUFrQixVQUFvRDtBQUNoRixVQUFNLEdBQUc7QUFEbUI7QUFBQSxFQUU5QjtBQUFBLEVBRUEsU0FBZTtBQUNiLFVBQU0sRUFBRSxVQUFVLElBQUk7QUFDdEIsY0FBVSxNQUFNO0FBQ2hCLGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRCxjQUFVLFNBQVMsS0FBSztBQUFBLE1BQ3RCLE1BQU07QUFBQSxJQUNSLENBQUM7QUFDRCxVQUFNLFdBQVcsVUFBVSxTQUFTLFlBQVksRUFBRSxLQUFLLDBCQUEwQixDQUFDO0FBQ2xGLGFBQVMsT0FBTztBQUNoQixTQUFLLGFBQWE7QUFDbEIsVUFBTSxVQUFVLFVBQVUsVUFBVSxFQUFFLEtBQUsseUJBQXlCLENBQUM7QUFDckUsVUFBTSxXQUFXLFFBQVEsU0FBUyxVQUFVLEVBQUUsTUFBTSxTQUFTLE1BQU0sU0FBUyxDQUFDO0FBQzdFLFVBQU0sWUFBWSxRQUFRLFNBQVMsVUFBVSxFQUFFLE1BQU0sVUFBVSxNQUFNLFNBQVMsQ0FBQztBQUMvRSxVQUFNLFlBQVksUUFBUSxTQUFTLFVBQVUsRUFBRSxNQUFNLFVBQVUsTUFBTSxTQUFTLENBQUM7QUFDL0UsYUFBUyxpQkFBaUIsU0FBUyxNQUFNO0FBQUUsV0FBSyxZQUFZO0FB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QUNsQyxVQUFNLFVBQVUsTUFBTSxNQUFNLFNBQVMsQ0FBQyxFQUFFO0FBQ3hDLFdBQU8sRUFBRSxNQUFNLE1BQU0sT0FBTyxZQUFZLElBQUksUUFBUTtBQUFBLEVBQ3REO0FBQUEsRUFFUSxtQkFBbUIsS0FBYSxXQUFtQixzQkFBK0IsUUFBK0I7QUFDdkgsVUFBTSxxQ0FBcUMsUUFBUSxzQ0FBc0M7QUFDekYsUUFBSSxFQUFFLHdCQUF3QixvQ0FBcUMsUUFBTztBQUMxRSxVQUFNLFNBQVMsS0FBSyxnQkFBZ0IsR0FBRztBQUN2QyxRQUFJLENBQUMsT0FBUSxRQUFPO0FBQ3BCLFdBQU8sVUFBVSxLQUFLLEVBQUUsU0FBUyxHQUFHLE1BQU07QUFBQTtBQUFBLEVBQU8sU0FBUyxLQUFLO0FBQUEsRUFDakU7QUFBQSxFQUVRLGdCQUFnQixLQUFxQjtBQUMzQyxVQUFNLGFBQWEsSUFBSSxLQUFLO0FBQzVCLFFBQUksQ0FBQyxXQUFZLFFBQU87QUFDeEIsVUFBTSxhQUFhLFdBQVcsTUFBTSxTQUFTO0FBQzdDLFVBQU0sZUFBZSxXQUFXLElBQUksQ0FBQyxjQUFjO0FBQ2pELFlBQU0sUUFBUSxVQUFVLE1BQU0sSUFBSTtBQUNsQyxhQUFPLE1BQU0sSUFBSSxVQUFRLEtBQUssS0FBSyxRQUFRLENBQUMsRUFBRSxFQUFFLEtBQUssSUFBSTtBQUFBLElBQzNELENBQUM7QUFDRCxXQUFPLGFBQWEsS0FBSyxPQUFPO0FBQUEsRUFDbEM7QUFBQSxFQUVBLE1BQWMsY0FBNkI7QUFDekMsVUFBTSxVQUFrQztBQUFBLE1BQ3RDLFVBQVUsS0FBSztBQUFBLE1BQ2YsVUFBVSxLQUFLO0FBQUEsSUFDakI7QUFDQSxVQUFNLEtBQUssU0FBUyxPQUFPO0FBQUEsRUFDN0I7QUFBQSxFQUVRLGVBQWUsT0FBb0M7QUFDekQsU0FBSyxTQUFTLEtBQUssS0FBSztBQUN4QixRQUFJLEtBQUssU0FBUyxTQUFTLEtBQUs7QUFDOUIsV0FBSyxXQUFXLEtBQUssU0FBUyxNQUFNLElBQUk7QUFBQSxJQUMxQztBQUVBLFNBQUssWUFBWSxFQUFFLE1BQU0sQ0FBQyxNQUFNLFFBQVEsTUFBTSwwQ0FBMEMsQ0FBQyxDQUFDO0FBQUEsRUFDNUY7QUFBQSxFQUVBLE1BQWMsZ0JBQStCO0FBQzNDLFNBQUssV0FBVyxDQUFDO0FBQ2pCLFFBQUk7QUFDRixZQUFNLElBQUk7QUFDVixVQUFJLE1BQU0sUUFBUSxFQUFFLGdCQUFnQixHQUFHO0FBQ3JDLFVBQUUsbUJBQW1CLENBQUM7QUFBQSxNQUN4QjtBQUFBLElBQ0YsUUFBUTtBQUFBLElBRVI7QUFDQSxVQUFNLEtBQUssWUFBWTtBQUFBLEVBQ3pCO0FBQ0Y7IiwKICAibmFtZXMiOiBbImltcG9ydF9vYnNpZGlhbiIsICJpZCIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiJdCn0K
