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

// src/keepAwake.ts
var SILENT_AUDIO_SRC = "data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
var KeepAwakeManager = class {
  constructor() {
    this.state = { supported: false, active: false };
  }
  init() {
    this.state.supported = this.isLikelyIos();
  }
  isLikelyIos() {
    if (this.isIosCache !== void 0) return this.isIosCache;
    const ua = navigator.userAgent || "";
    const platform = navigator.platform || "";
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    const isiOS = /iP(ad|hone|od)/i.test(ua) || /Mac/i.test(platform) && maxTouchPoints > 2;
    this.isIosCache = isiOS;
    return isiOS;
  }
  getState() {
    return { ...this.state };
  }
  async enableFromUserGesture() {
    if (!this.isLikelyIos()) {
      this.state = { supported: false, active: false, lastError: "Keep-awake is scoped to iOS." };
      return this.getState();
    }
    if (this.state.active) return this.getState();
    const nav = navigator;
    const wakeLockApi = nav?.wakeLock;
    if (wakeLockApi?.request) {
      try {
        this.wakeLock = await wakeLockApi.request("screen");
        this.state = { supported: true, active: true, strategy: "wake-lock" };
        this.wakeLock?.addEventListener?.("release", () => {
          this.state.active = false;
          this.wakeLock = void 0;
        });
        return this.getState();
      } catch (e) {
        this.state.lastError = e?.message || String(e);
      }
    }
    const audio = this.ensureAudioElement();
    try {
      await audio.play();
      this.state = { supported: true, active: true, strategy: "audio" };
    } catch (e) {
      this.state = { supported: false, active: false, lastError: e?.message || String(e) };
      this.teardownAudio();
    }
    return this.getState();
  }
  disable() {
    if (this.wakeLock) {
      try {
        this.wakeLock.release?.();
      } catch {
      }
      this.wakeLock = void 0;
    }
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {
      }
    }
    this.state.active = false;
  }
  ensureAudioElement() {
    if (this.audio) return this.audio;
    const audio = document.createElement("audio");
    audio.src = SILENT_AUDIO_SRC;
    audio.loop = true;
    audio.muted = true;
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");
    audio.style.position = "fixed";
    audio.style.opacity = "0";
    audio.style.pointerEvents = "none";
    audio.style.width = "1px";
    audio.style.height = "1px";
    document.body.appendChild(audio);
    this.audio = audio;
    return audio;
  }
  teardownAudio() {
    if (this.audio?.parentElement) this.audio.parentElement.removeChild(this.audio);
    this.audio = void 0;
  }
};

// src/main.ts
var AITranscriptPlugin = class extends import_obsidian5.Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS, promptPresets: [...DEFAULT_SETTINGS.promptPresets] };
    this.errorLog = [];
    this.keepAwake = new KeepAwakeManager();
    this.handleVisibilityChange = () => {
      if (document.hidden) {
        if (this.keepAwake.getState().active) this.keepAwake.disable();
        return;
      }
      if (this.recorder && this.shouldUseKeepAwake()) {
        void this.keepAwake.enableFromUserGesture();
      }
    };
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
    this.keepAwake.init();
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
    this.registerDomEvent(document, "visibilitychange", this.handleVisibilityChange);
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
    try {
      this.keepAwake.disable();
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
          await this.enableKeepAwake();
        } catch (e) {
          console.error(e);
          modal.setPhase("error");
          modal.setStatus("Microphone permission or recorder error.");
          modal.setActionButtonsEnabled(false, false, true);
          modal.setDiscardLabel("Close");
          this.recorder?.discard();
          this.recorder = void 0;
          this.disableKeepAwake();
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
          this.disableKeepAwake();
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
          this.disableKeepAwake();
        } finally {
        }
      },
      onDiscard: () => {
        try {
          this.recorder?.discard();
        } catch {
        }
        this.recorder = void 0;
        this.disableKeepAwake();
        modal.close();
        this.modal = void 0;
      },
      onPause: () => this.recorder?.pause(),
      onResume: () => {
        this.recorder?.resume();
        void this.enableKeepAwake();
      },
      onClose: () => {
        try {
          this.recorder?.discard();
        } catch {
        }
        this.recorder = void 0;
        this.disableKeepAwake();
        if (this.modal === modal) this.modal = void 0;
      }
    });
    this.modal = modal;
    modal.open();
  }
  shouldUseKeepAwake() {
    return this.keepAwake.isLikelyIos();
  }
  async enableKeepAwake() {
    if (!this.shouldUseKeepAwake()) return;
    await this.keepAwake.enableFromUserGesture();
  }
  disableKeepAwake() {
    try {
      this.keepAwake.disable();
    } catch {
    }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9yZWNvcmRlci50cyIsICJzcmMvcG9zdHByb2Nlc3MudHMiLCAic3JjL2xvZ2dpbmcudHMiLCAic3JjL3RyYW5zY3JpYmUudHMiLCAic3JjL3R5cGVzLnRzIiwgInNyYy91aS9SZWNvcmRpbmdNb2RhbC50cyIsICJzcmMva2VlcEF3YWtlLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBBcHAsIE1hcmtkb3duVmlldywgUGx1Z2luLCB0eXBlIEVkaXRvclBvc2l0aW9uIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgQUlUcmFuc2NyaXB0U2V0dGluZ1RhYiB9IGZyb20gJy4vc2V0dGluZ3MnO1xuaW1wb3J0IHsgQXVkaW9SZWNvcmRlciB9IGZyb20gJy4vcmVjb3JkZXInO1xuaW1wb3J0IHsgcG9zdHByb2Nlc3NUcmFuc2NyaXB0IH0gZnJvbSAnLi9wb3N0cHJvY2Vzcyc7XG5pbXBvcnQgeyB0cmFuc2NyaWJlV2l0aEdyb3EgfSBmcm9tICcuL3RyYW5zY3JpYmUnO1xuaW1wb3J0IHsgcmVnaXN0ZXJFcnJvckxvZ1NpbmssIHR5cGUgVm94aWRpYW5FcnJvckxvZ0VudHJ5IH0gZnJvbSAnLi9sb2dnaW5nJztcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIHR5cGUgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIHR5cGUgUHJvbXB0UHJlc2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSZWNvcmRpbmdNb2RhbCB9IGZyb20gJy4vdWkvUmVjb3JkaW5nTW9kYWwnO1xuaW1wb3J0IHsgS2VlcEF3YWtlTWFuYWdlciB9IGZyb20gJy4va2VlcEF3YWtlJztcblxuaW50ZXJmYWNlIFZveGlkaWFuUGVyc2lzdGVudERhdGEge1xuICBzZXR0aW5ncz86IEFJVHJhbnNjcmlwdFNldHRpbmdzO1xuICBlcnJvckxvZz86IFZveGlkaWFuRXJyb3JMb2dFbnRyeVtdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBSVRyYW5zY3JpcHRQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MgPSB7IC4uLkRFRkFVTFRfU0VUVElOR1MsIHByb21wdFByZXNldHM6IFsuLi5ERUZBVUxUX1NFVFRJTkdTLnByb21wdFByZXNldHNdIH07XG4gIGVycm9yTG9nOiBWb3hpZGlhbkVycm9yTG9nRW50cnlbXSA9IFtdO1xuICBwcml2YXRlIHJlY29yZGVyPzogQXVkaW9SZWNvcmRlcjtcbiAgcHJpdmF0ZSBtb2RhbD86IFJlY29yZGluZ01vZGFsO1xuICBwcml2YXRlIGtlZXBBd2FrZSA9IG5ldyBLZWVwQXdha2VNYW5hZ2VyKCk7XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIGNvbnN0IHJhdyA9IChhd2FpdCB0aGlzLmxvYWREYXRhKCkpIGFzIFZveGlkaWFuUGVyc2lzdGVudERhdGEgfCBBSVRyYW5zY3JpcHRTZXR0aW5ncyB8IG51bGw7XG4gICAgaWYgKHJhdyAmJiAocmF3IGFzIFZveGlkaWFuUGVyc2lzdGVudERhdGEpLnNldHRpbmdzKSB7XG4gICAgICBjb25zdCBkYXRhID0gcmF3IGFzIFZveGlkaWFuUGVyc2lzdGVudERhdGE7XG4gICAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgZGF0YS5zZXR0aW5ncyB8fCB7fSk7XG4gICAgICB0aGlzLmVycm9yTG9nID0gQXJyYXkuaXNBcnJheShkYXRhLmVycm9yTG9nKSA/IGRhdGEuZXJyb3JMb2cgOiBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIHJhdyB8fCB7fSk7XG4gICAgICB0aGlzLmVycm9yTG9nID0gW107XG4gICAgfVxuICAgIHRoaXMua2VlcEF3YWtlLmluaXQoKTtcblxuICAgIHJlZ2lzdGVyRXJyb3JMb2dTaW5rKChlbnRyeSkgPT4ge1xuICAgICAgdGhpcy5hcHBlbmRFcnJvckxvZyhlbnRyeSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZFJpYmJvbkljb24oJ21pYycsICdSZWNvcmQgJiBUcmFuc2NyaWJlJywgKCkgPT4gdGhpcy50b2dnbGVSZWNvcmRpbmcoKSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICd2b3hpZGlhbi1zdGFydC1zdG9wJyxcbiAgICAgIG5hbWU6ICdTdGFydC9TdG9wIFJlY29yZGluZycsXG4gICAgICBob3RrZXlzOiBbeyBtb2RpZmllcnM6IFsnTW9kJywgJ1NoaWZ0J10sIGtleTogJ00nIH1dLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMudG9nZ2xlUmVjb3JkaW5nKCksXG4gICAgfSk7XG5cbiAgICAvLyBNb2JpbGUgdG9vbGJhciBhY3Rpb246IGFwcGVhcnMgaW4gT2JzaWRpYW4gTW9iaWxlIGVkaXRvciB0b29sYmFyXG4gICAgLy8gVXNlcnMgY2FuIGFkZCB0aGlzIGNvbW1hbmQgdG8gdGhlIG1vYmlsZSB0b29sYmFyIHZpYSBTZXR0aW5ncyBcdTIxOTIgTW9iaWxlIFx1MjE5MiBUb29sYmFyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAncmVjb3JkLXRyYW5zY3JpYmUtaW5zZXJ0JyxcbiAgICAgIG5hbWU6ICdSZWNvcmQgXHUyMDIyIFRyYW5zY3JpYmUgXHUyMDIyIEluc2VydCcsXG4gICAgICBpY29uOiAnbWljJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoKSA9PiB0aGlzLnRvZ2dsZVJlY29yZGluZygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKFxuICAgICAgbmV3IEFJVHJhbnNjcmlwdFNldHRpbmdUYWIoXG4gICAgICAgIHRoaXMuYXBwLFxuICAgICAgICB0aGlzLFxuICAgICAgICAoKSA9PiB0aGlzLnNldHRpbmdzLFxuICAgICAgICBhc3luYyAocGFydGlhbCkgPT4ge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5zZXR0aW5ncywgcGFydGlhbCk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5zYXZlQWxsRGF0YSgpO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB0aGlzLmVycm9yTG9nLFxuICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5jbGVhckVycm9yTG9nKCk7XG4gICAgICAgIH0sXG4gICAgICApLFxuICAgICk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyRG9tRXZlbnQoZG9jdW1lbnQsICd2aXNpYmlsaXR5Y2hhbmdlJywgdGhpcy5oYW5kbGVWaXNpYmlsaXR5Q2hhbmdlKTtcbiAgfVxuXG4gIG9udW5sb2FkKCkge1xuICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7IH1cbiAgICB0cnkgeyB0aGlzLm1vZGFsPy5jbG9zZSgpOyB9IGNhdGNoIHsgfVxuICAgIHRyeSB7IHRoaXMua2VlcEF3YWtlLmRpc2FibGUoKTsgfSBjYXRjaCB7IH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdG9nZ2xlUmVjb3JkaW5nKCkge1xuICAgIC8vIElmIG1vZGFsIGlzIG9wZW4sIHN0b3Agbm93IChzaW11bGF0ZSBjbGlja2luZyBTdG9wKVxuICAgIGlmICh0aGlzLm1vZGFsKSB7XG4gICAgICAvLyBub29wIFx1MjAxNCBzdG9wcGluZyBpcyBkcml2ZW4gdmlhIG1vZGFsIGJ1dHRvbiB0byBwcmVzZXJ2ZSBwcmVzZXQvYXBwbHkgc3RhdGVcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgd2UgaGF2ZSBhbiBlZGl0b3IgdG8gaW5zZXJ0IGludG8gbGF0ZXIgKG5vdCBzdHJpY3RseSByZXF1aXJlZCBidXQgaGVscHMgVVgpXG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgaWYgKCF2aWV3KSByZXR1cm47IC8vIE1WUDogcmVxdWlyZSBhY3RpdmUgbWFya2Rvd24gdmlld1xuXG4gICAgLy8gUHJlcGFyZSByZWNvcmRlciBhbmQgbW9kYWxcbiAgICB0aGlzLnJlY29yZGVyID0gbmV3IEF1ZGlvUmVjb3JkZXIoKTtcbiAgICBjb25zdCBwcmVzZXRzID0gdGhpcy5zZXR0aW5ncy5wcm9tcHRQcmVzZXRzLm1hcChwID0+ICh7IGlkOiBwLmlkLCBuYW1lOiBwLm5hbWUgfSkpO1xuICAgIGNvbnN0IG1vZGFsID0gbmV3IFJlY29yZGluZ01vZGFsKHRoaXMuYXBwLCB7XG4gICAgICBwcmVzZXRzLFxuICAgICAgZGVmYXVsdFByZXNldElkOiB0aGlzLnNldHRpbmdzLmxhc3RVc2VkUHJvbXB0SWQgfHwgdGhpcy5zZXR0aW5ncy5kZWZhdWx0UHJvbXB0SWQsXG4gICAgICBtYXhEdXJhdGlvblNlYzogdGhpcy5zZXR0aW5ncy5tYXhEdXJhdGlvblNlYyxcbiAgICAgIG9uU3RhcnQ6IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLnJlY29yZGVyIS5zdGFydCgpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuZW5hYmxlS2VlcEF3YWtlKCk7XG4gICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ2Vycm9yJyk7XG4gICAgICAgICAgbW9kYWwuc2V0U3RhdHVzKCdNaWNyb3Bob25lIHBlcm1pc3Npb24gb3IgcmVjb3JkZXIgZXJyb3IuJyk7XG4gICAgICAgICAgbW9kYWwuc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQoZmFsc2UsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBtb2RhbC5zZXREaXNjYXJkTGFiZWwoJ0Nsb3NlJyk7XG4gICAgICAgICAgdGhpcy5yZWNvcmRlcj8uZGlzY2FyZCgpO1xuICAgICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgdGhpcy5kaXNhYmxlS2VlcEF3YWtlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvblN0b3A6IGFzeW5jIChhcHBseVBvc3QsIHByZXNldElkKSA9PiB7XG4gICAgICAgIG1vZGFsLnNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICBtb2RhbC5zZXRQaGFzZSgndHJhbnNjcmliaW5nJyk7XG4gICAgICAgIG1vZGFsLnNldFN0YXR1cygnVHJhbnNjcmliaW5nXHUyMDI2Jyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IHByZXNldDogUHJvbXB0UHJlc2V0IHwgdW5kZWZpbmVkO1xuICAgICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCB0aGlzLnJlY29yZGVyIS5zdG9wKCk7XG4gICAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB0aGlzLmRpc2FibGVLZWVwQXdha2UoKTtcbiAgICAgICAgICBjb25zdCByYXcgPSBhd2FpdCB0cmFuc2NyaWJlV2l0aEdyb3EoYmxvYiwgdGhpcy5zZXR0aW5ncyk7XG4gICAgICAgICAgbGV0IHRleHQgPSByYXc7XG4gICAgICAgICAgaWYgKGFwcGx5UG9zdCkge1xuICAgICAgICAgICAgcHJlc2V0ID0gdGhpcy5zZXR0aW5ncy5wcm9tcHRQcmVzZXRzLmZpbmQocCA9PiBwLmlkID09PSBwcmVzZXRJZCkgYXMgUHJvbXB0UHJlc2V0IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5sYXN0VXNlZFByb21wdElkID0gcHJlc2V0Py5pZCB8fCBwcmVzZXRJZCB8fCB0aGlzLnNldHRpbmdzLmxhc3RVc2VkUHJvbXB0SWQ7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVBbGxEYXRhKCk7XG4gICAgICAgICAgICBtb2RhbC5zZXRQaGFzZSgncG9zdHByb2Nlc3NpbmcnKTtcbiAgICAgICAgICAgIG1vZGFsLnNldFN0YXR1cygnQ2xlYW5pbmcgdHJhbnNjcmlwdFx1MjAyNicpO1xuICAgICAgICAgICAgLy8gQ2FwdHVyZSBjdXJyZW50IHNlbGVjdGlvbiBmcm9tIGFjdGl2ZSBlZGl0b3IgdG8gaW5jbHVkZSBhcyBjb250ZXh0IG9yIGlubGluZSBpbiBzeXN0ZW1cbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZVZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gYWN0aXZlVmlldz8uZWRpdG9yPy5nZXRTZWxlY3Rpb24oKSB8fCAnJztcbiAgICAgICAgICAgIHRleHQgPSBhd2FpdCBwb3N0cHJvY2Vzc1RyYW5zY3JpcHQocmF3LCB0aGlzLnNldHRpbmdzLCBwcmVzZXQsIHNlbGVjdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGZpbmFsT3V0cHV0ID0gdGhpcy5jb21iaW5lVHJhbnNjcmlwdHMocmF3LCB0ZXh0LCBhcHBseVBvc3QsIHByZXNldCk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5pbnNlcnRUZXh0KGZpbmFsT3V0cHV0LCBwcmVzZXQ/LnJlcGxhY2VTZWxlY3Rpb24pO1xuICAgICAgICAgIG1vZGFsLnNldFBoYXNlKCdkb25lJyk7XG4gICAgICAgICAgbW9kYWwuc2V0U3RhdHVzKCdUcmFuc2NyaXB0IGluc2VydGVkIGludG8gdGhlIG5vdGUuJyk7XG4gICAgICAgICAgbW9kYWwuc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQoZmFsc2UsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBtb2RhbC5zZXREaXNjYXJkTGFiZWwoJ0Nsb3NlJyk7XG4gICAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgICBpZiAodGhpcy5tb2RhbCA9PT0gbW9kYWwpIHRoaXMubW9kYWwgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ2Vycm9yJyk7XG4gICAgICAgICAgbW9kYWwuc2V0U3RhdHVzKGBFcnJvcjogJHtlPy5tZXNzYWdlIHx8IGV9YCk7XG4gICAgICAgICAgbW9kYWwuc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQoZmFsc2UsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBtb2RhbC5zZXREaXNjYXJkTGFiZWwoJ0Nsb3NlJyk7XG4gICAgICAgICAgdHJ5IHsgdGhpcy5yZWNvcmRlcj8uZGlzY2FyZCgpOyB9IGNhdGNoIHsgfVxuICAgICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgdGhpcy5kaXNhYmxlS2VlcEF3YWtlKCk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgLy8ga2VlcCBtb2RhbCBvcGVuIGZvciB1c2VyIHRvIHJlYWQvY2xvc2VcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uRGlzY2FyZDogKCkgPT4ge1xuICAgICAgICB0cnkgeyB0aGlzLnJlY29yZGVyPy5kaXNjYXJkKCk7IH0gY2F0Y2ggeyB9XG4gICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZGlzYWJsZUtlZXBBd2FrZSgpO1xuICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgICAgICB0aGlzLm1vZGFsID0gdW5kZWZpbmVkO1xuICAgICAgfSxcbiAgICAgIG9uUGF1c2U6ICgpID0+IHRoaXMucmVjb3JkZXI/LnBhdXNlKCksXG4gICAgICBvblJlc3VtZTogKCkgPT4ge1xuICAgICAgICB0aGlzLnJlY29yZGVyPy5yZXN1bWUoKTtcbiAgICAgICAgdm9pZCB0aGlzLmVuYWJsZUtlZXBBd2FrZSgpO1xuICAgICAgfSxcbiAgICAgIG9uQ2xvc2U6ICgpID0+IHtcbiAgICAgICAgdHJ5IHsgdGhpcy5yZWNvcmRlcj8uZGlzY2FyZCgpOyB9IGNhdGNoIHsgfVxuICAgICAgICB0aGlzLnJlY29yZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmRpc2FibGVLZWVwQXdha2UoKTtcbiAgICAgICAgaWYgKHRoaXMubW9kYWwgPT09IG1vZGFsKSB0aGlzLm1vZGFsID0gdW5kZWZpbmVkO1xuICAgICAgfSxcbiAgICB9KTtcbiAgICB0aGlzLm1vZGFsID0gbW9kYWw7XG5cbiAgICAvLyBNVlAgdXNlcyBtb2RhbCB0byBwcmVzZW50IGFsbCBzdGF0dXMgYW5kIGFuaW1hdGlvbnNcbiAgICBtb2RhbC5vcGVuKCk7XG4gIH1cblxuICBwcml2YXRlIHNob3VsZFVzZUtlZXBBd2FrZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5rZWVwQXdha2UuaXNMaWtlbHlJb3MoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5hYmxlS2VlcEF3YWtlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5zaG91bGRVc2VLZWVwQXdha2UoKSkgcmV0dXJuO1xuICAgIGF3YWl0IHRoaXMua2VlcEF3YWtlLmVuYWJsZUZyb21Vc2VyR2VzdHVyZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBkaXNhYmxlS2VlcEF3YWtlKCk6IHZvaWQge1xuICAgIHRyeSB7IHRoaXMua2VlcEF3YWtlLmRpc2FibGUoKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZVZpc2liaWxpdHlDaGFuZ2UgPSAoKTogdm9pZCA9PiB7XG4gICAgaWYgKGRvY3VtZW50LmhpZGRlbikge1xuICAgICAgaWYgKHRoaXMua2VlcEF3YWtlLmdldFN0YXRlKCkuYWN0aXZlKSB0aGlzLmtlZXBBd2FrZS5kaXNhYmxlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnJlY29yZGVyICYmIHRoaXMuc2hvdWxkVXNlS2VlcEF3YWtlKCkpIHtcbiAgICAgIHZvaWQgdGhpcy5rZWVwQXdha2UuZW5hYmxlRnJvbVVzZXJHZXN0dXJlKCk7XG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgYXN5bmMgaW5zZXJ0VGV4dCh0ZXh0OiBzdHJpbmcsIHJlcGxhY2VTZWxlY3Rpb25PdmVycmlkZT86IGJvb2xlYW4pIHtcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICBpZiAoIXZpZXcpIHRocm93IG5ldyBFcnJvcignTm8gYWN0aXZlIE1hcmtkb3duIGVkaXRvcicpO1xuICAgIGNvbnN0IGVkaXRvciA9IHZpZXcuZWRpdG9yO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSB0ZXh0LnN0YXJ0c1dpdGgoJyAnKSA/IHRleHQuc2xpY2UoMSkgOiB0ZXh0O1xuICAgIGNvbnN0IGJlZm9yZSA9IHRoaXMuc2V0dGluZ3MuYWRkTmV3bGluZUJlZm9yZSA/ICdcXG4nIDogJyc7XG4gICAgY29uc3QgYWZ0ZXIgPSB0aGlzLnNldHRpbmdzLmFkZE5ld2xpbmVBZnRlciA/ICdcXG4nIDogJyc7XG4gICAgY29uc3QgY29udGVudCA9IGAke2JlZm9yZX0ke25vcm1hbGl6ZWR9JHthZnRlcn1gO1xuXG4gICAgbGV0IHN0YXJ0OiBFZGl0b3JQb3NpdGlvbjtcbiAgICBjb25zdCByZXBsYWNlU2VsZWN0aW9uID0gcmVwbGFjZVNlbGVjdGlvbk92ZXJyaWRlID8/ICh0aGlzLnNldHRpbmdzLmluc2VydE1vZGUgPT09ICdyZXBsYWNlJyk7XG4gICAgaWYgKHJlcGxhY2VTZWxlY3Rpb24gJiYgZWRpdG9yLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHtcbiAgICAgIHN0YXJ0ID0gKGVkaXRvciBhcyBhbnkpLmdldEN1cnNvcignZnJvbScpIGFzIEVkaXRvclBvc2l0aW9uO1xuICAgICAgZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oY29udGVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0ID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZShjb250ZW50LCBzdGFydCk7XG4gICAgfVxuICAgIGNvbnN0IGNhcmV0ID0gdGhpcy5hZHZhbmNlUG9zKHN0YXJ0LCBgJHtiZWZvcmV9JHtub3JtYWxpemVkfWApO1xuICAgIGVkaXRvci5zZXRDdXJzb3IoY2FyZXQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZHZhbmNlUG9zKHN0YXJ0OiBFZGl0b3JQb3NpdGlvbiwgdGV4dDogc3RyaW5nKTogRWRpdG9yUG9zaXRpb24ge1xuICAgIGNvbnN0IHBhcnRzID0gdGV4dC5zcGxpdCgnXFxuJyk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkgcmV0dXJuIHsgbGluZTogc3RhcnQubGluZSwgY2g6IHN0YXJ0LmNoICsgcGFydHNbMF0ubGVuZ3RoIH07XG4gICAgY29uc3QgbGluZXNBZGRlZCA9IHBhcnRzLmxlbmd0aCAtIDE7XG4gICAgY29uc3QgbGFzdExlbiA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLmxlbmd0aDtcbiAgICByZXR1cm4geyBsaW5lOiBzdGFydC5saW5lICsgbGluZXNBZGRlZCwgY2g6IGxhc3RMZW4gfTtcbiAgfVxuXG4gIHByaXZhdGUgY29tYmluZVRyYW5zY3JpcHRzKHJhdzogc3RyaW5nLCBwcm9jZXNzZWQ6IHN0cmluZywgcG9zdHByb2Nlc3NlZEFwcGxpZWQ6IGJvb2xlYW4sIHByZXNldD86IFByb21wdFByZXNldCk6IHN0cmluZyB7XG4gICAgY29uc3QgaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZCA9IHByZXNldD8uaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZCA/PyB0cnVlO1xuICAgIGlmICghKHBvc3Rwcm9jZXNzZWRBcHBsaWVkICYmIGluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQpKSByZXR1cm4gcHJvY2Vzc2VkO1xuICAgIGNvbnN0IHF1b3RlZCA9IHRoaXMucXVvdGVUcmFuc2NyaXB0KHJhdyk7XG4gICAgaWYgKCFxdW90ZWQpIHJldHVybiBwcm9jZXNzZWQ7XG4gICAgcmV0dXJuIHByb2Nlc3NlZC50cmltKCkubGVuZ3RoID8gYCR7cXVvdGVkfVxcblxcbiR7cHJvY2Vzc2VkfWAgOiBxdW90ZWQ7XG4gIH1cblxuICBwcml2YXRlIHF1b3RlVHJhbnNjcmlwdChyYXc6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IHJhdy50cmltKCk7XG4gICAgaWYgKCFub3JtYWxpemVkKSByZXR1cm4gJyc7XG4gICAgY29uc3QgcGFyYWdyYXBocyA9IG5vcm1hbGl6ZWQuc3BsaXQoL1xcblxccypcXG4vKTtcbiAgICBjb25zdCBxdW90ZWRCbG9ja3MgPSBwYXJhZ3JhcGhzLm1hcCgocGFyYWdyYXBoKSA9PiB7XG4gICAgICBjb25zdCBsaW5lcyA9IHBhcmFncmFwaC5zcGxpdCgnXFxuJyk7XG4gICAgICByZXR1cm4gbGluZXMubWFwKGxpbmUgPT4gYD4gJHtsaW5lLnRyaW1FbmQoKX1gKS5qb2luKCdcXG4nKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcXVvdGVkQmxvY2tzLmpvaW4oJ1xcbj5cXG4nKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgc2F2ZUFsbERhdGEoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF5bG9hZDogVm94aWRpYW5QZXJzaXN0ZW50RGF0YSA9IHtcbiAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgZXJyb3JMb2c6IHRoaXMuZXJyb3JMb2csXG4gICAgfTtcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHBheWxvYWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhcHBlbmRFcnJvckxvZyhlbnRyeTogVm94aWRpYW5FcnJvckxvZ0VudHJ5KTogdm9pZCB7XG4gICAgdGhpcy5lcnJvckxvZy5wdXNoKGVudHJ5KTtcbiAgICBpZiAodGhpcy5lcnJvckxvZy5sZW5ndGggPiAyMDApIHtcbiAgICAgIHRoaXMuZXJyb3JMb2cgPSB0aGlzLmVycm9yTG9nLnNsaWNlKC0yMDApO1xuICAgIH1cbiAgICAvLyBGaXJlLWFuZC1mb3JnZXQ7IGxvZ2dpbmcgZmFpbHVyZSBzaG91bGQgbm90IGJyZWFrIFVYXG4gICAgdGhpcy5zYXZlQWxsRGF0YSgpLmNhdGNoKChlKSA9PiBjb25zb2xlLmVycm9yKCdbVm94aWRpYW5dIGZhaWxlZCB0byBwZXJzaXN0IGVycm9yIGxvZycsIGUpKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2xlYXJFcnJvckxvZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmVycm9yTG9nID0gW107XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHcgPSB3aW5kb3cgYXMgYW55O1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkody5Wb3hpZGlhbkVycm9yTG9nKSkge1xuICAgICAgICB3LlZveGlkaWFuRXJyb3JMb2cgPSBbXTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGlnbm9yZSB3aW5kb3cgYWNjZXNzIGlzc3Vlc1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnNhdmVBbGxEYXRhKCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIEJ1dHRvbkNvbXBvbmVudCwgTW9kYWwsIE5vdGljZSwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBWb3hpZGlhbkVycm9yTG9nRW50cnkgfSBmcm9tICcuL2xvZ2dpbmcnO1xuaW1wb3J0IHR5cGUgeyBBSVRyYW5zY3JpcHRTZXR0aW5ncywgUHJvbXB0UHJlc2V0IH0gZnJvbSAnLi90eXBlcyc7XG5cbmNsYXNzIFByZXNldEltcG9ydE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIHRleHRhcmVhRWw/OiBIVE1MVGV4dEFyZWFFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIG9uSW1wb3J0OiAodmFsdWU6IHVua25vd24pID0+IFByb21pc2U8dm9pZD4gfCB2b2lkKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnSW1wb3J0IHByZXNldCcgfSk7XG4gICAgY29udGVudEVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDogJ1Bhc3RlIGEgcHJlc2V0IEpTT04gZXhwb3J0ZWQgZnJvbSBWb3hpZGlhbiwgb3IgYW4gYXJyYXkgb2YgcHJlc2V0cy4nLFxuICAgIH0pO1xuICAgIGNvbnN0IHRleHRhcmVhID0gY29udGVudEVsLmNyZWF0ZUVsKCd0ZXh0YXJlYScsIHsgY2xzOiAnYWktcHJlc2V0LWpzb24tdGV4dGFyZWEnIH0pO1xuICAgIHRleHRhcmVhLnJvd3MgPSAxMDtcbiAgICB0aGlzLnRleHRhcmVhRWwgPSB0ZXh0YXJlYTtcbiAgICBjb25zdCBhY3Rpb25zID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2FpLXByZXNldC1qc29uLWFjdGlvbnMnIH0pO1xuICAgIGNvbnN0IHBhc3RlQnRuID0gYWN0aW9ucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnUGFzdGUnLCB0eXBlOiAnYnV0dG9uJyB9KTtcbiAgICBjb25zdCBpbXBvcnRCdG4gPSBhY3Rpb25zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdJbXBvcnQnLCB0eXBlOiAnYnV0dG9uJyB9KTtcbiAgICBjb25zdCBjYW5jZWxCdG4gPSBhY3Rpb25zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdDYW5jZWwnLCB0eXBlOiAnYnV0dG9uJyB9KTtcbiAgICBwYXN0ZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHsgdGhpcy5oYW5kbGVQYXN0ZSgpOyB9KTtcbiAgICBpbXBvcnRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmhhbmRsZUltcG9ydCgpKTtcbiAgICBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVQYXN0ZSgpIHtcbiAgICBpZiAoIXRoaXMudGV4dGFyZWFFbCkgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjbGlwYm9hcmQgPSAobmF2aWdhdG9yIGFzIGFueSk/LmNsaXBib2FyZDtcbiAgICAgIGlmICghY2xpcGJvYXJkPy5yZWFkVGV4dCkge1xuICAgICAgICBuZXcgTm90aWNlKCdDbGlwYm9hcmQgcGFzdGUgaXMgbm90IGF2YWlsYWJsZTsgcGFzdGUgbWFudWFsbHkuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCBjbGlwYm9hcmQucmVhZFRleHQoKTtcbiAgICAgIGlmICghdGV4dCkge1xuICAgICAgICBuZXcgTm90aWNlKCdDbGlwYm9hcmQgaXMgZW1wdHkuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMudGV4dGFyZWFFbC52YWx1ZSA9IHRleHQ7XG4gICAgICB0aGlzLnRleHRhcmVhRWwuZm9jdXMoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIG5ldyBOb3RpY2UoJ1VuYWJsZSB0byByZWFkIGZyb20gY2xpcGJvYXJkOyBwYXN0ZSBtYW51YWxseS4nKTtcbiAgICB9XG4gIH1cblxuICAvLyBTb21lIG1lc3NhZ2luZyBhcHBzIGluamVjdCBpbnZpc2libGUgb3Igbm9uLWJyZWFraW5nIGNoYXJhY3RlcnMgdGhhdCBKU09OLnBhcnNlIHJlamVjdHMuXG4gIHByaXZhdGUgc2FuaXRpemVKc29uSW5wdXQocmF3OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiByYXdcbiAgICAgIC5yZXBsYWNlKC9cXHVGRUZGL2csICcnKSAvLyBCT01cbiAgICAgIC5yZXBsYWNlKC9bXFx1MjAwQi1cXHUyMDBEXFx1MjA2MF0vZywgJycpIC8vIHplcm8td2lkdGggc3BhY2VzXG4gICAgICAucmVwbGFjZSgvW1xcdTAwQTBcXHUyMDA3XFx1MjAyRl0vZywgJyAnKSAvLyBub24tYnJlYWtpbmcgc3BhY2VzIC0+IHJlZ3VsYXIgc3BhY2VzXG4gICAgICAudHJpbSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVJbXBvcnQoKSB7XG4gICAgaWYgKCF0aGlzLnRleHRhcmVhRWwpIHJldHVybjtcbiAgICBjb25zdCBjbGVhbmVkID0gdGhpcy5zYW5pdGl6ZUpzb25JbnB1dCh0aGlzLnRleHRhcmVhRWwudmFsdWUpO1xuICAgIGlmICghY2xlYW5lZCkge1xuICAgICAgbmV3IE5vdGljZSgnUGFzdGUgcHJlc2V0IEpTT04gdG8gaW1wb3J0LicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShjbGVhbmVkKTtcbiAgICAgIGF3YWl0IHRoaXMub25JbXBvcnQocGFyc2VkKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgIG5ldyBOb3RpY2UoYEludmFsaWQgSlNPTjogJHtlPy5tZXNzYWdlID8/IGUgPz8gJ1Vua25vd24gZXJyb3InfWApO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQUlUcmFuc2NyaXB0U2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IEFwcCxcbiAgICBwbHVnaW46IFBsdWdpbixcbiAgICBwcml2YXRlIGdldFNldHRpbmdzOiAoKSA9PiBBSVRyYW5zY3JpcHRTZXR0aW5ncyxcbiAgICBwcml2YXRlIHNhdmVTZXR0aW5nczogKHM6IFBhcnRpYWw8QUlUcmFuc2NyaXB0U2V0dGluZ3M+KSA9PiBQcm9taXNlPHZvaWQ+LFxuICAgIHByaXZhdGUgZ2V0RXJyb3JMb2c/OiAoKSA9PiBWb3hpZGlhbkVycm9yTG9nRW50cnlbXSxcbiAgICBwcml2YXRlIGNsZWFyRXJyb3JMb2c/OiAoKSA9PiBQcm9taXNlPHZvaWQ+LFxuICApIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDEnLCB7IHRleHQ6ICdWb3hpZGlhbicgfSk7XG5cbiAgICBjb25zdCBzID0gdGhpcy5nZXRTZXR0aW5ncygpO1xuXG4gICAgLy8gR1JPUVxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ0dyb3EgV2hpc3BlcicgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnR3JvcSBBUEkgS2V5JylcbiAgICAgIC5zZXREZXNjKCdSZXF1aXJlZCB0byB0cmFuc2NyaWJlIGF1ZGlvIHZpYSBHcm9xIFdoaXNwZXIuJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2dza18uLi4nKVxuICAgICAgICAuc2V0VmFsdWUocy5ncm9xQXBpS2V5IHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBncm9xQXBpS2V5OiB2LnRyaW0oKSB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnR3JvcSBtb2RlbCcpXG4gICAgICAuc2V0RGVzYygnRGVmYXVsdDogd2hpc3Blci1sYXJnZS12MycpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFZhbHVlKHMuZ3JvcU1vZGVsKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBncm9xTW9kZWw6IHYudHJpbSgpIHx8ICd3aGlzcGVyLWxhcmdlLXYzJyB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnTGFuZ3VhZ2UgKG9wdGlvbmFsKScpXG4gICAgICAuc2V0RGVzYygnSVNPIGNvZGUgbGlrZSBlbiwgZXMsIGRlLiBMZWF2ZSBlbXB0eSBmb3IgYXV0by4nKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRWYWx1ZShzLmxhbmd1YWdlIHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBsYW5ndWFnZTogdi50cmltKCkgfHwgdW5kZWZpbmVkIH0pOyB9KSk7XG5cbiAgICAvLyBPcGVuQUlcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdPcGVuQUkgUG9zdHByb2Nlc3NpbmcgKG9wdGlvbmFsKScgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnT3BlbkFJIEFQSSBLZXknKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRQbGFjZWhvbGRlcignc2stLi4uJylcbiAgICAgICAgLnNldFZhbHVlKHMub3BlbmFpQXBpS2V5IHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBvcGVuYWlBcGlLZXk6IHYudHJpbSgpIH0pOyB9KSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdPcGVuQUkgbW9kZWwnKVxuICAgICAgLnNldERlc2MoJ0RlZmF1bHQ6IGdwdC00by1taW5pJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0VmFsdWUocy5vcGVuYWlNb2RlbClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgb3BlbmFpTW9kZWw6IHYudHJpbSgpIHx8ICdncHQtNG8tbWluaScgfSk7IH0pKTtcblxuICAgIC8vIEdlbWluaVxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ0dlbWluaSBQb3N0cHJvY2Vzc2luZyAob3B0aW9uYWwpJyB9KTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdHZW1pbmkgQVBJIEtleScpXG4gICAgICAuc2V0RGVzYygnUmVxdWlyZWQgdG8gcG9zdHByb2Nlc3MgdXNpbmcgR2VtaW5pLicpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdBSXphLi4uJylcbiAgICAgICAgLnNldFZhbHVlKHMuZ2VtaW5pQXBpS2V5IHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBnZW1pbmlBcGlLZXk6IHYudHJpbSgpIH0pOyB9KSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdHZW1pbmkgbW9kZWwnKVxuICAgICAgLnNldERlc2MoJ0RlZmF1bHQ6IGdlbWluaS0xLjUtZmxhc2gnKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRWYWx1ZShzLmdlbWluaU1vZGVsKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBnZW1pbmlNb2RlbDogdi50cmltKCkgfHwgJ2dlbWluaS0xLjUtZmxhc2gnIH0pOyB9KSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdQb3N0cHJvY2Vzc2luZyBwcm92aWRlcicpXG4gICAgICAuc2V0RGVzYygnV2hpY2ggQVBJIHRvIHVzZSB3aGVuIGFwcGx5aW5nIHBvc3Rwcm9jZXNzaW5nIHByZXNldHMuJylcbiAgICAgIC5hZGREcm9wZG93bihkID0+IGRcbiAgICAgICAgLmFkZE9wdGlvbignb3BlbmFpJywgJ09wZW5BSScpXG4gICAgICAgIC5hZGRPcHRpb24oJ2dlbWluaScsICdHZW1pbmknKVxuICAgICAgICAuc2V0VmFsdWUocy5wb3N0cHJvY2Vzc2luZ1Byb3ZpZGVyIHx8ICdvcGVuYWknKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwb3N0cHJvY2Vzc2luZ1Byb3ZpZGVyOiB2IGFzIGFueSB9KTsgfSkpO1xuXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2hyJyk7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2JyJyk7XG5cbiAgICAvLyBQcmVzZXRzXG4gICAgY29uc3QgcHJlc2V0U2VjdGlvbiA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ2FpLXByZXNldC1zZWN0aW9uJyB9KTtcbiAgICBwcmVzZXRTZWN0aW9uLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1Byb21wdCBwcmVzZXRzJywgY2xzOiAnYWktcHJlc2V0LXNlY3Rpb24tdGl0bGUnIH0pO1xuICAgIGNvbnN0IHByZXNldEFjdGlvbnMgPSBwcmVzZXRTZWN0aW9uLmNyZWF0ZURpdih7IGNsczogJ2FpLXByZXNldC1zZWN0aW9uLWFjdGlvbnMnIH0pO1xuXG4gICAgY29uc3QgbGlzdEVsID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KCk7XG4gICAgY29uc3QgcmVuZGVyUHJlc2V0cyA9ICgpID0+IHtcbiAgICAgIGxpc3RFbC5lbXB0eSgpO1xuICAgICAgY29uc3Qgc3QgPSB0aGlzLmdldFNldHRpbmdzKCk7XG4gICAgICBzdC5wcm9tcHRQcmVzZXRzLmZvckVhY2goKHApID0+IHtcbiAgICAgICAgY29uc3Qgd3JhcCA9IGxpc3RFbC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1wcmVzZXQnIH0pO1xuICAgICAgICBjb25zdCBoZWFkZXIgPSB3cmFwLmNyZWF0ZURpdih7IGNsczogJ2FpLXByZXNldC1oZWFkZXInIH0pO1xuICAgICAgICBjb25zdCB0aXRsZSA9IGhlYWRlci5jcmVhdGVEaXYoeyBjbHM6ICdhaS1wcmVzZXQtdGl0bGUnIH0pO1xuICAgICAgICB0aXRsZS5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6IHAubmFtZSwgY2xzOiAnYWktcHJlc2V0LW5hbWUnIH0pO1xuICAgICAgICBpZiAoc3QuZGVmYXVsdFByb21wdElkID09PSBwLmlkKSB0aXRsZS5jcmVhdGVTcGFuKHsgdGV4dDogJ0RlZmF1bHQnLCBjbHM6ICdhaS1wcmVzZXQtZGVmYXVsdCcgfSk7XG4gICAgICAgIGNvbnN0IGFjdGlvbnNFbCA9IGhlYWRlci5jcmVhdGVEaXYoeyBjbHM6ICdhaS1wcmVzZXQtYWN0aW9ucycgfSk7XG4gICAgICAgIG5ldyBCdXR0b25Db21wb25lbnQoYWN0aW9uc0VsKVxuICAgICAgICAgIC5zZXRCdXR0b25UZXh0KCdTZXQgYXMgRGVmYXVsdCcpXG4gICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBkZWZhdWx0UHJvbXB0SWQ6IHAuaWQgfSk7XG4gICAgICAgICAgICByZW5kZXJQcmVzZXRzKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIG5ldyBCdXR0b25Db21wb25lbnQoYWN0aW9uc0VsKVxuICAgICAgICAgIC5zZXRJY29uKCdjb3B5JylcbiAgICAgICAgICAuc2V0VG9vbHRpcCgnRXhwb3J0IHByZXNldCBhcyBKU09OJylcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleHBvcnRQcmVzZXQ6IFByb21wdFByZXNldCA9IHtcbiAgICAgICAgICAgICAgaWQ6IHAuaWQsXG4gICAgICAgICAgICAgIG5hbWU6IHAubmFtZSxcbiAgICAgICAgICAgICAgc3lzdGVtOiBwLnN5c3RlbSxcbiAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IHAudGVtcGVyYXR1cmUsXG4gICAgICAgICAgICAgIGluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQ6IHAuaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZCxcbiAgICAgICAgICAgICAgcmVwbGFjZVNlbGVjdGlvbjogcC5yZXBsYWNlU2VsZWN0aW9uLFxuICAgICAgICAgICAgICBtb2RlbDogcC5tb2RlbCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZXhwb3J0UHJlc2V0LCBudWxsLCAyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNsaXBib2FyZCA9IChuYXZpZ2F0b3IgYXMgYW55KT8uY2xpcGJvYXJkO1xuICAgICAgICAgICAgICBpZiAoY2xpcGJvYXJkPy53cml0ZVRleHQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBjbGlwYm9hcmQud3JpdGVUZXh0KGpzb24pO1xuICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoJ1ByZXNldCBKU09OIGNvcGllZCB0byBjbGlwYm9hcmQuJyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1ZveGlkaWFuIHByZXNldCBKU09OOicsIGpzb24pO1xuICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoJ0NsaXBib2FyZCB1bmF2YWlsYWJsZTsgSlNPTiBsb2dnZWQgdG8gY29uc29sZS4nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdWb3hpZGlhbiBwcmVzZXQgSlNPTiAoZmFpbGVkIGNsaXBib2FyZCk6JywganNvbik7XG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoJ1VuYWJsZSB0byBhY2Nlc3MgY2xpcGJvYXJkOyBKU09OIGxvZ2dlZCB0byBjb25zb2xlLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICBuZXcgQnV0dG9uQ29tcG9uZW50KGFjdGlvbnNFbClcbiAgICAgICAgICAuc2V0SWNvbigndHJhc2gnKVxuICAgICAgICAgIC5zZXRUb29sdGlwKCdEZWxldGUgcHJlc2V0JylcbiAgICAgICAgICAuc2V0V2FybmluZygpXG4gICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyZWQgPSBzdC5wcm9tcHRQcmVzZXRzLmZpbHRlcih4ID0+IHguaWQgIT09IHAuaWQpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBmaWx0ZXJlZCB9KTtcbiAgICAgICAgICAgIHJlbmRlclByZXNldHMoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnTmFtZScpXG4gICAgICAgICAgLmFkZFRleHQodCA9PiB0LnNldFZhbHVlKHAubmFtZSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgIHAubmFtZSA9IHY7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ1N5c3RlbSBwcm9tcHQnKVxuICAgICAgICAgIC5zZXREZXNjKCdTdXBwb3J0cyB7e3NlbGVjdGlvbn19IHBsYWNlaG9sZGVyOyB3aGVuIGFic2VudCwgY3VycmVudCBzZWxlY3Rpb24gaXMgcHJlcGVuZGVkIGFzIGNvbnRleHQuJylcbiAgICAgICAgICAuYWRkVGV4dEFyZWEodCA9PiB7XG4gICAgICAgICAgICB0LnNldFZhbHVlKHAuc3lzdGVtKTtcbiAgICAgICAgICAgIHQuaW5wdXRFbC5yb3dzID0gNjtcbiAgICAgICAgICAgIHQuaW5wdXRFbC5hZGRDbGFzcygnYWktc3lzdGVtLXRleHRhcmVhJyk7XG4gICAgICAgICAgICB0Lm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICAgIHAuc3lzdGVtID0gdjsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ1RlbXBlcmF0dXJlJylcbiAgICAgICAgICAuYWRkVGV4dCh0ID0+IHQuc2V0VmFsdWUoU3RyaW5nKHAudGVtcGVyYXR1cmUpKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKHYpOyBwLnRlbXBlcmF0dXJlID0gaXNGaW5pdGUobnVtKSA/IG51bSA6IDAuMjsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnTW9kZWwgb3ZlcnJpZGUgKG9wdGlvbmFsKScpXG4gICAgICAgICAgLmFkZFRleHQodCA9PiB0LnNldFBsYWNlaG9sZGVyKCdlLmcuLCBncHQtNG8tbWluaScpLnNldFZhbHVlKHAubW9kZWwgfHwgJycpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICBwLm1vZGVsID0gdi50cmltKCkgfHwgdW5kZWZpbmVkOyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IHN0LnByb21wdFByZXNldHMgfSk7XG4gICAgICAgICAgfSkpO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKCdJbmNsdWRlIHRyYW5zY3JpcHQgd2l0aCBwb3N0cHJvY2Vzc2VkIG1lc3NhZ2UnKVxuICAgICAgICAgIC5zZXREZXNjKCdQcmVwZW5kcyB0aGUgcmF3IHRyYW5zY3JpcHQgcXVvdGVkIHdpdGggXCI+XCIgd2hlbiBwb3N0cHJvY2Vzc2luZyBzdWNjZWVkcy4nKVxuICAgICAgICAgIC5hZGRUb2dnbGUodCA9PiB0XG4gICAgICAgICAgICAuc2V0VmFsdWUocC5pbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkID8/IHRydWUpXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgICAgcC5pbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkID0gdjtcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKCdSZXBsYWNlIHNlbGVjdGlvbicpXG4gICAgICAgICAgLnNldERlc2MoJ1doZW4gZW5hYmxlZCwgVm94aWRpYW4gcmVwbGFjZXMgdGhlIGN1cnJlbnQgZWRpdG9yIHNlbGVjdGlvbiB3aXRoIHRoaXMgcHJlc2V0XFwncyBvdXRwdXQuJylcbiAgICAgICAgICAuYWRkVG9nZ2xlKHQgPT4gdFxuICAgICAgICAgICAgLnNldFZhbHVlKHAucmVwbGFjZVNlbGVjdGlvbiA/PyAoc3QuaW5zZXJ0TW9kZSA9PT0gJ3JlcGxhY2UnKSlcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgICBwLnJlcGxhY2VTZWxlY3Rpb24gPSB2O1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IHN0LnByb21wdFByZXNldHMgfSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIC8vIEFkZCBzb21lIHNwYWNlIGFmdGVyIGVhY2ggcHJlc2V0XG4gICAgICAgIHdyYXAuY3JlYXRlRWwoJ2JyJyk7XG5cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBhZGRQcmVzZXQgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBzdCA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcbiAgICAgIGNvbnN0IGlkID0gYHByZXNldC0ke0RhdGUubm93KCl9YDtcbiAgICAgIGNvbnN0IHByZXNldDogUHJvbXB0UHJlc2V0ID0geyBpZCwgbmFtZTogJ05ldyBQcmVzZXQnLCBzeXN0ZW06ICdFZGl0IG1lXHUyMDI2JywgdGVtcGVyYXR1cmU6IDAuMiwgaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZDogdHJ1ZSB9O1xuICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBbLi4uc3QucHJvbXB0UHJlc2V0cywgcHJlc2V0XSB9KTtcbiAgICAgIHJlbmRlclByZXNldHMoKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb3BlbkltcG9ydE1vZGFsID0gKCkgPT4ge1xuICAgICAgY29uc3QgbW9kYWwgPSBuZXcgUHJlc2V0SW1wb3J0TW9kYWwodGhpcy5hcHAsIGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBzdCA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBbLi4uc3QucHJvbXB0UHJlc2V0c107XG4gICAgICAgIGNvbnN0IG5ld1ByZXNldHM6IFByb21wdFByZXNldFtdID0gW107XG4gICAgICAgIGNvbnN0IGFkZE9uZSA9IChyYXc6IGFueSkgPT4ge1xuICAgICAgICAgIGlmICghcmF3IHx8IHR5cGVvZiByYXcgIT09ICdvYmplY3QnKSByZXR1cm47XG4gICAgICAgICAgY29uc3QgYmFzZUlkID0gdHlwZW9mIHJhdy5pZCA9PT0gJ3N0cmluZycgJiYgcmF3LmlkLnRyaW0oKVxuICAgICAgICAgICAgPyByYXcuaWQudHJpbSgpXG4gICAgICAgICAgICA6IGBwcmVzZXQtJHtEYXRlLm5vdygpfS0ke25ld1ByZXNldHMubGVuZ3RofWA7XG4gICAgICAgICAgY29uc3QgaXNJZFVzZWQgPSAoaWQ6IHN0cmluZykgPT5cbiAgICAgICAgICAgIGV4aXN0aW5nLnNvbWUocCA9PiBwLmlkID09PSBpZCkgfHwgbmV3UHJlc2V0cy5zb21lKHAgPT4gcC5pZCA9PT0gaWQpO1xuICAgICAgICAgIGxldCBpZCA9IGJhc2VJZDtcbiAgICAgICAgICBsZXQgc3VmZml4ID0gMTtcbiAgICAgICAgICB3aGlsZSAoaXNJZFVzZWQoaWQpKSB7XG4gICAgICAgICAgICBpZCA9IGAke2Jhc2VJZH0tJHtzdWZmaXgrK31gO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBuYW1lID0gdHlwZW9mIHJhdy5uYW1lID09PSAnc3RyaW5nJyAmJiByYXcubmFtZS50cmltKCkgPyByYXcubmFtZS50cmltKCkgOiAnSW1wb3J0ZWQgcHJlc2V0JztcbiAgICAgICAgICBjb25zdCBzeXN0ZW0gPSB0eXBlb2YgcmF3LnN5c3RlbSA9PT0gJ3N0cmluZycgJiYgcmF3LnN5c3RlbS50cmltKCkgPyByYXcuc3lzdGVtIDogJ0VkaXQgbWVcdTIwMjYnO1xuICAgICAgICAgIGNvbnN0IHRlbXBlcmF0dXJlID0gdHlwZW9mIHJhdy50ZW1wZXJhdHVyZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUocmF3LnRlbXBlcmF0dXJlKSA/IHJhdy50ZW1wZXJhdHVyZSA6IDAuMjtcbiAgICAgICAgICBjb25zdCBpbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkID1cbiAgICAgICAgICAgIHR5cGVvZiByYXcuaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZCA9PT0gJ2Jvb2xlYW4nXG4gICAgICAgICAgICAgID8gcmF3LmluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWRcbiAgICAgICAgICAgICAgOiB0cnVlO1xuICAgICAgICAgIGNvbnN0IHJlcGxhY2VTZWxlY3Rpb24gPVxuICAgICAgICAgICAgdHlwZW9mIHJhdy5yZXBsYWNlU2VsZWN0aW9uID09PSAnYm9vbGVhbicgPyByYXcucmVwbGFjZVNlbGVjdGlvbiA6IHVuZGVmaW5lZDtcbiAgICAgICAgICBjb25zdCBtb2RlbCA9XG4gICAgICAgICAgICB0eXBlb2YgcmF3Lm1vZGVsID09PSAnc3RyaW5nJyAmJiByYXcubW9kZWwudHJpbSgpID8gcmF3Lm1vZGVsLnRyaW0oKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXdQcmVzZXRzLnB1c2goe1xuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgc3lzdGVtLFxuICAgICAgICAgICAgdGVtcGVyYXR1cmUsXG4gICAgICAgICAgICBpbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkLFxuICAgICAgICAgICAgcmVwbGFjZVNlbGVjdGlvbixcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICB2YWx1ZS5mb3JFYWNoKGFkZE9uZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWRkT25lKHZhbHVlIGFzIGFueSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFuZXdQcmVzZXRzLmxlbmd0aCkge1xuICAgICAgICAgIG5ldyBOb3RpY2UoJ05vIHZhbGlkIHByZXNldHMgZm91bmQgaW4gSlNPTi4nKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBbLi4uZXhpc3RpbmcsIC4uLm5ld1ByZXNldHNdIH0pO1xuICAgICAgICByZW5kZXJQcmVzZXRzKCk7XG4gICAgICAgIG5ldyBOb3RpY2UoXG4gICAgICAgICAgbmV3UHJlc2V0cy5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gJ0ltcG9ydGVkIDEgcHJlc2V0LidcbiAgICAgICAgICAgIDogYEltcG9ydGVkICR7bmV3UHJlc2V0cy5sZW5ndGh9IHByZXNldHMuYFxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgICBtb2RhbC5vcGVuKCk7XG4gICAgfTtcblxuICAgIHJlbmRlclByZXNldHMoKTtcblxuICAgIG5ldyBCdXR0b25Db21wb25lbnQocHJlc2V0QWN0aW9ucylcbiAgICAgIC5zZXRCdXR0b25UZXh0KCdBZGQgcHJlc2V0JylcbiAgICAgIC5vbkNsaWNrKGFkZFByZXNldCk7XG4gICAgbmV3IEJ1dHRvbkNvbXBvbmVudChwcmVzZXRBY3Rpb25zKVxuICAgICAgLnNldEJ1dHRvblRleHQoJ0ltcG9ydCcpXG4gICAgICAub25DbGljayhvcGVuSW1wb3J0TW9kYWwpO1xuXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2hyJyk7XG5cbiAgICAvLyBSZWNvcmRpbmcgYmVoYXZpb3JcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdSZWNvcmRpbmcgJiBJbnNlcnRpb24nIH0pO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1Nob3cgcmVjb3JkaW5nIG1vZGFsJylcbiAgICAgIC5hZGRUb2dnbGUodCA9PiB0LnNldFZhbHVlKHMuc2hvd01vZGFsV2hpbGVSZWNvcmRpbmcpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgc2hvd01vZGFsV2hpbGVSZWNvcmRpbmc6IHYgfSk7XG4gICAgICB9KSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnTWF4IGR1cmF0aW9uIChzZWNvbmRzKScpXG4gICAgICAuYWRkVGV4dCh0ID0+IHQuc2V0VmFsdWUoU3RyaW5nKHMubWF4RHVyYXRpb25TZWMpKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICBjb25zdCBuID0gTnVtYmVyKHYpOyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IG1heER1cmF0aW9uU2VjOiBpc0Zpbml0ZShuKSAmJiBuID4gMCA/IE1hdGguZmxvb3IobikgOiA5MDAgfSk7XG4gICAgICB9KSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnSW5zZXJ0IG1vZGUnKVxuICAgICAgLnNldERlc2MoJ0luc2VydCBhdCBjdXJzb3Igb3IgcmVwbGFjZSBzZWxlY3Rpb24nKVxuICAgICAgLmFkZERyb3Bkb3duKGQgPT4gZFxuICAgICAgICAuYWRkT3B0aW9uKCdpbnNlcnQnLCAnSW5zZXJ0IGF0IGN1cnNvcicpXG4gICAgICAgIC5hZGRPcHRpb24oJ3JlcGxhY2UnLCAnUmVwbGFjZSBzZWxlY3Rpb24nKVxuICAgICAgICAuc2V0VmFsdWUocy5pbnNlcnRNb2RlKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IGluc2VydE1vZGU6IHYgYXMgYW55IH0pO1xuICAgICAgICAgIHJlbmRlclByZXNldHMoKTtcbiAgICAgICAgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0FkZCBuZXdsaW5lIGJlZm9yZScpXG4gICAgICAuYWRkVG9nZ2xlKHQgPT4gdC5zZXRWYWx1ZShzLmFkZE5ld2xpbmVCZWZvcmUpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgYWRkTmV3bGluZUJlZm9yZTogdiB9KTsgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0FkZCBuZXdsaW5lIGFmdGVyJylcbiAgICAgIC5hZGRUb2dnbGUodCA9PiB0LnNldFZhbHVlKHMuYWRkTmV3bGluZUFmdGVyKS5vbkNoYW5nZShhc3luYyAodikgPT4geyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IGFkZE5ld2xpbmVBZnRlcjogdiB9KTsgfSkpO1xuXG4gICAgLy8gRXJyb3IgbG9nIChhdCB0aGUgYm90dG9tKVxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ0Vycm9yIGxvZycgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQ2xlYXIgZXJyb3IgbG9nJylcbiAgICAgIC5zZXREZXNjKCdSZW1vdmVzIHN0b3JlZCBWb3hpZGlhbiBlcnJvciBlbnRyaWVzIGZyb20gdGhpcyB2YXVsdC4nKVxuICAgICAgLmFkZEJ1dHRvbigoYikgPT5cbiAgICAgICAgYlxuICAgICAgICAgIC5zZXRCdXR0b25UZXh0KCdDbGVhciBsb2cnKVxuICAgICAgICAgIC5zZXRDdGEoKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jbGVhckVycm9yTG9nKSByZXR1cm47XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNsZWFyRXJyb3JMb2coKTtcbiAgICAgICAgICAgIG5ldyBOb3RpY2UoJ1ZveGlkaWFuIGVycm9yIGxvZyBjbGVhcmVkLicpO1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuICAgIGNvbnN0IGxvZ0NvbnRhaW5lciA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLWVycm9yLWxvZycgfSk7XG4gICAgY29uc3QgbG9nID0gdGhpcy5nZXRFcnJvckxvZyA/IHRoaXMuZ2V0RXJyb3JMb2coKSA6IFtdO1xuICAgIGlmICghbG9nIHx8ICFsb2cubGVuZ3RoKSB7XG4gICAgICBsb2dDb250YWluZXIuY3JlYXRlRWwoJ3AnLCB7IHRleHQ6ICdObyBlcnJvcnMgcmVjb3JkZWQgeWV0LicgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBsb2dDb250YWluZXIuY3JlYXRlRWwoJ3VsJywgeyBjbHM6ICd2b3hpZGlhbi1lcnJvci1sb2ctbGlzdCcgfSk7XG4gICAgICBjb25zdCBlbnRyaWVzID0gWy4uLmxvZ10uc29ydCgoYSwgYikgPT4gYi50cyAtIGEudHMpLnNsaWNlKDAsIDUwKTtcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICBjb25zdCBsaSA9IGxpc3QuY3JlYXRlRWwoJ2xpJywgeyBjbHM6ICd2b3hpZGlhbi1lcnJvci1sb2ctaXRlbScgfSk7XG4gICAgICAgIGNvbnN0IHRzID0gbmV3IERhdGUoZW50cnkudHMpLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IHR5cGVvZiBlbnRyeS5zdGF0dXMgPT09ICdudW1iZXInID8gYCAke2VudHJ5LnN0YXR1c31gIDogJyc7XG4gICAgICAgIGxpLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgICAgY2xzOiAndm94aWRpYW4tZXJyb3ItbG9nLW1ldGEnLFxuICAgICAgICAgIHRleHQ6IGAke3RzfSBcdTIwMTQgJHtlbnRyeS5zb3VyY2V9JHtzdGF0dXN9YCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChlbnRyeS5kZXRhaWwpIHtcbiAgICAgICAgICBjb25zdCBwcmUgPSBsaS5jcmVhdGVFbCgncHJlJywgeyBjbHM6ICd2b3hpZGlhbi1lcnJvci1sb2ctZGV0YWlsJyB9KTtcbiAgICAgICAgICBwcmUudGV4dENvbnRlbnQgPSBlbnRyeS5kZXRhaWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsICJleHBvcnQgY2xhc3MgQXVkaW9SZWNvcmRlciB7XG4gIHByaXZhdGUgbWVkaWFSZWNvcmRlcj86IE1lZGlhUmVjb3JkZXI7XG4gIHByaXZhdGUgY2h1bmtzOiBCbG9iUGFydFtdID0gW107XG4gIHByaXZhdGUgc3RyZWFtPzogTWVkaWFTdHJlYW07XG4gIHByaXZhdGUgc3RhcnRlZEF0ID0gMDtcbiAgcHJpdmF0ZSB0aW1lcj86IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9uVGljaz86IChlbGFwc2VkTXM6IG51bWJlcikgPT4gdm9pZCkge31cblxuICBhc3luYyBzdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5tZWRpYVJlY29yZGVyICYmIHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSA9PT0gJ3JlY29yZGluZycpIHJldHVybjtcbiAgICB0aGlzLmNodW5rcyA9IFtdO1xuICAgIHRoaXMuc3RyZWFtID0gYXdhaXQgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoeyBhdWRpbzogdHJ1ZSB9KTtcbiAgICBjb25zdCBtaW1lQ2FuZGlkYXRlcyA9IFtcbiAgICAgICdhdWRpby93ZWJtO2NvZGVjcz1vcHVzJyxcbiAgICAgICdhdWRpby93ZWJtJyxcbiAgICAgICdhdWRpby9vZ2c7Y29kZWNzPW9wdXMnLFxuICAgICAgJydcbiAgICBdO1xuICAgIGxldCBtaW1lVHlwZSA9ICcnO1xuICAgIGZvciAoY29uc3QgY2FuZCBvZiBtaW1lQ2FuZGlkYXRlcykge1xuICAgICAgaWYgKCFjYW5kIHx8ICh3aW5kb3cgYXMgYW55KS5NZWRpYVJlY29yZGVyPy5pc1R5cGVTdXBwb3J0ZWQ/LihjYW5kKSkgeyBtaW1lVHlwZSA9IGNhbmQ7IGJyZWFrOyB9XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy5tZWRpYVJlY29yZGVyID0gbmV3IE1lZGlhUmVjb3JkZXIodGhpcy5zdHJlYW0sIG1pbWVUeXBlID8geyBtaW1lVHlwZSB9IDogdW5kZWZpbmVkKTtcbiAgICB0aGlzLm1lZGlhUmVjb3JkZXIub25kYXRhYXZhaWxhYmxlID0gKGU6IEJsb2JFdmVudCkgPT4geyBpZiAoZS5kYXRhPy5zaXplKSB0aGlzLmNodW5rcy5wdXNoKGUuZGF0YSk7IH07XG4gICAgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXJ0KDI1MCk7IC8vIHNtYWxsIGNodW5rc1xuICAgIHRoaXMuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICBpZiAodGhpcy5vblRpY2spIHRoaXMudGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5vblRpY2shKERhdGUubm93KCkgLSB0aGlzLnN0YXJ0ZWRBdCksIDIwMCk7XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZWRpYVJlY29yZGVyICYmIHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSA9PT0gJ3JlY29yZGluZycgJiYgdHlwZW9mIHRoaXMubWVkaWFSZWNvcmRlci5wYXVzZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5tZWRpYVJlY29yZGVyLnBhdXNlKCk7XG4gICAgfVxuICB9XG5cbiAgcmVzdW1lKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1lZGlhUmVjb3JkZXIgJiYgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXRlID09PSAncGF1c2VkJyAmJiB0eXBlb2YgdGhpcy5tZWRpYVJlY29yZGVyLnJlc3VtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5tZWRpYVJlY29yZGVyLnJlc3VtZSgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN0b3AoKTogUHJvbWlzZTxCbG9iPiB7XG4gICAgY29uc3QgcmVjID0gdGhpcy5tZWRpYVJlY29yZGVyO1xuICAgIGlmICghcmVjKSB0aHJvdyBuZXcgRXJyb3IoJ1JlY29yZGVyIG5vdCBzdGFydGVkJyk7XG4gICAgY29uc3Qgc3RvcFByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgcmVjLm9uc3RvcCA9ICgpID0+IHJlc29sdmUoKTtcbiAgICB9KTtcbiAgICBpZiAocmVjLnN0YXRlICE9PSAnaW5hY3RpdmUnKSByZWMuc3RvcCgpO1xuICAgIGF3YWl0IHN0b3BQcm9taXNlO1xuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYih0aGlzLmNodW5rcywgeyB0eXBlOiB0aGlzLmNodW5rcy5sZW5ndGggPyAodGhpcy5jaHVua3NbMF0gYXMgYW55KS50eXBlIHx8ICdhdWRpby93ZWJtJyA6ICdhdWRpby93ZWJtJyB9KTtcbiAgICB0aGlzLmNsZWFudXAoKTtcbiAgICByZXR1cm4gYmxvYjtcbiAgfVxuXG4gIGRpc2NhcmQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVkaWFSZWNvcmRlciAmJiB0aGlzLm1lZGlhUmVjb3JkZXIuc3RhdGUgIT09ICdpbmFjdGl2ZScpIHRoaXMubWVkaWFSZWNvcmRlci5zdG9wKCk7XG4gICAgdGhpcy5jbGVhbnVwKCk7XG4gIH1cblxuICBwcml2YXRlIGNsZWFudXAoKSB7XG4gICAgaWYgKHRoaXMudGltZXIpIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuICAgIHRoaXMudGltZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5tZWRpYVJlY29yZGVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc3RhcnRlZEF0ID0gMDtcbiAgICBpZiAodGhpcy5zdHJlYW0pIHtcbiAgICAgIHRoaXMuc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2godCA9PiB0LnN0b3AoKSk7XG4gICAgICB0aGlzLnN0cmVhbSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5jaHVua3MgPSBbXTtcbiAgfVxufVxuIiwgImltcG9ydCB7IE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IGxvZ0Vycm9yIH0gZnJvbSAnLi9sb2dnaW5nJztcbmltcG9ydCB0eXBlIHsgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIFByb21wdFByZXNldCB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9zdHByb2Nlc3NUcmFuc2NyaXB0KFxuICByYXc6IHN0cmluZyxcbiAgc2V0dGluZ3M6IEFJVHJhbnNjcmlwdFNldHRpbmdzLFxuICBwcmVzZXQ/OiBQcm9tcHRQcmVzZXQsXG4gIHNlbGVjdGlvbj86IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHByb3ZpZGVyID0gc2V0dGluZ3MucG9zdHByb2Nlc3NpbmdQcm92aWRlciB8fCAnb3BlbmFpJztcbiAgaWYgKHByb3ZpZGVyID09PSAnZ2VtaW5pJykge1xuICAgIHJldHVybiBwb3N0cHJvY2Vzc1dpdGhHZW1pbmkocmF3LCBzZXR0aW5ncywgcHJlc2V0LCBzZWxlY3Rpb24pO1xuICB9XG4gIHJldHVybiBwb3N0cHJvY2Vzc1dpdGhPcGVuQUkocmF3LCBzZXR0aW5ncywgcHJlc2V0LCBzZWxlY3Rpb24pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9zdHByb2Nlc3NXaXRoT3BlbkFJKFxuICByYXc6IHN0cmluZyxcbiAgc2V0dGluZ3M6IEFJVHJhbnNjcmlwdFNldHRpbmdzLFxuICBwcmVzZXQ/OiBQcm9tcHRQcmVzZXQsXG4gIHNlbGVjdGlvbj86IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghc2V0dGluZ3Mub3BlbmFpQXBpS2V5KSByZXR1cm4gcmF3OyAvLyBzaWxlbnRseSBza2lwIGlmIG1pc3NpbmdcbiAgY29uc3QgeyBzeXN0ZW0sIHVzZXJDb250ZW50IH0gPSBidWlsZFN5c3RlbUFuZFVzZXJDb250ZW50KHJhdywgcHJlc2V0LCBzZWxlY3Rpb24pO1xuICBjb25zdCBtb2RlbCA9IHByZXNldD8ubW9kZWwgfHwgc2V0dGluZ3Mub3BlbmFpTW9kZWwgfHwgJ2dwdC00by1taW5pJztcbiAgY29uc3QgdGVtcGVyYXR1cmUgPSBjbGFtcCgocHJlc2V0Py50ZW1wZXJhdHVyZSA/PyAwLjIpLCAwLCAxKTtcblxuICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtzZXR0aW5ncy5vcGVuYWlBcGlLZXl9YCxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBtb2RlbCxcbiAgICAgIHRlbXBlcmF0dXJlLFxuICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3lzdGVtIH0sXG4gICAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyQ29udGVudCB9LFxuICAgICAgXSxcbiAgICB9KSxcbiAgfSk7XG4gIGlmICghcmVzcC5vaykge1xuICAgIC8vIElmIE9wZW5BSSBmYWlscywgc3VyZmFjZSBhIG5vdGljZSBhbmQgZmFsbCBiYWNrIHRvIHJhd1xuICAgIGxldCBkZXRhaWwgPSAnJztcbiAgICB0cnkge1xuICAgICAgY29uc3QgYm9keVRleHQgPSBhd2FpdCByZXNwLnRleHQoKTtcbiAgICAgIGRldGFpbCA9IGJvZHlUZXh0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShib2R5VGV4dCk7XG4gICAgICAgIGNvbnN0IGpzb25Nc2cgPSBwYXJzZWQ/LmVycm9yPy5tZXNzYWdlIHx8IHBhcnNlZD8ubWVzc2FnZTtcbiAgICAgICAgaWYgKHR5cGVvZiBqc29uTXNnID09PSAnc3RyaW5nJyAmJiBqc29uTXNnLnRyaW0oKSkge1xuICAgICAgICAgIGRldGFpbCA9IGpzb25Nc2c7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBpZ25vcmUgSlNPTiBwYXJzZSBlcnJvcnM7IGtlZXAgcmF3IGJvZHlUZXh0XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBpZ25vcmUgYm9keSByZWFkIGVycm9yc1xuICAgIH1cbiAgICBjb25zdCB0cmltbWVkID1cbiAgICAgIGRldGFpbCAmJiBkZXRhaWwubGVuZ3RoID4gMzAwID8gYCR7ZGV0YWlsLnNsaWNlKDAsIDI5Nyl9XHUyMDI2YCA6IGRldGFpbDtcbiAgICBsb2dFcnJvcignT3BlbkFJJywgcmVzcC5zdGF0dXMsIGRldGFpbCB8fCAnPG5vLWJvZHk+Jyk7XG4gICAgY29uc3Qgbm90aWNlTXNnID0gdHJpbW1lZFxuICAgICAgPyBgT3BlbkFJIHBvc3Rwcm9jZXNzaW5nIGZhaWxlZCAoJHtyZXNwLnN0YXR1c30pOiAke3RyaW1tZWR9YFxuICAgICAgOiBgT3BlbkFJIHBvc3Rwcm9jZXNzaW5nIGZhaWxlZCAoJHtyZXNwLnN0YXR1c30pLmA7XG4gICAgbmV3IE5vdGljZShub3RpY2VNc2csIDE1MDAwKTtcbiAgICByZXR1cm4gcmF3O1xuICB9XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgY29uc3QgY2xlYW5lZCA9IGRhdGE/LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudDtcbiAgcmV0dXJuIHR5cGVvZiBjbGVhbmVkID09PSAnc3RyaW5nJyAmJiBjbGVhbmVkLnRyaW0oKSA/IGNsZWFuZWQgOiByYXc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwb3N0cHJvY2Vzc1dpdGhHZW1pbmkoXG4gIHJhdzogc3RyaW5nLFxuICBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MsXG4gIHByZXNldD86IFByb21wdFByZXNldCxcbiAgc2VsZWN0aW9uPzogc3RyaW5nLFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgaWYgKCFzZXR0aW5ncy5nZW1pbmlBcGlLZXkpIHJldHVybiByYXc7IC8vIHNpbGVudGx5IHNraXAgaWYgbWlzc2luZ1xuICBjb25zdCB7IHN5c3RlbSwgdXNlckNvbnRlbnQgfSA9IGJ1aWxkU3lzdGVtQW5kVXNlckNvbnRlbnQocmF3LCBwcmVzZXQsIHNlbGVjdGlvbik7XG4gIGNvbnN0IG1vZGVsID0gcHJlc2V0Py5tb2RlbCB8fCBzZXR0aW5ncy5nZW1pbmlNb2RlbCB8fCAnZ2VtaW5pLTEuNS1mbGFzaCc7XG4gIGNvbnN0IHRlbXBlcmF0dXJlID0gY2xhbXAoKHByZXNldD8udGVtcGVyYXR1cmUgPz8gMC4yKSwgMCwgMSk7XG5cbiAgY29uc3QgdXJsID1cbiAgICBgaHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy9gICtcbiAgICBgJHtlbmNvZGVVUklDb21wb25lbnQobW9kZWwpfTpnZW5lcmF0ZUNvbnRlbnRgICtcbiAgICBgP2tleT0ke2VuY29kZVVSSUNvbXBvbmVudChzZXR0aW5ncy5nZW1pbmlBcGlLZXkpfWA7XG5cbiAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKFxuICAgIHVybCxcbiAgICB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHN5c3RlbUluc3RydWN0aW9uOiB7XG4gICAgICAgICAgcGFydHM6IFt7IHRleHQ6IHN5c3RlbSB9XSxcbiAgICAgICAgfSxcbiAgICAgICAgY29udGVudHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBwYXJ0czogW3sgdGV4dDogdXNlckNvbnRlbnQgfV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgZ2VuZXJhdGlvbkNvbmZpZzoge1xuICAgICAgICAgIHRlbXBlcmF0dXJlLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgfSxcbiAgKTtcbiAgaWYgKCFyZXNwLm9rKSB7XG4gICAgbGV0IGRldGFpbCA9ICcnO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBib2R5VGV4dCA9IGF3YWl0IHJlc3AudGV4dCgpO1xuICAgICAgZGV0YWlsID0gYm9keVRleHQ7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGJvZHlUZXh0KTtcbiAgICAgICAgY29uc3QganNvbk1zZyA9IHBhcnNlZD8uZXJyb3I/Lm1lc3NhZ2UgfHwgcGFyc2VkPy5tZXNzYWdlO1xuICAgICAgICBpZiAodHlwZW9mIGpzb25Nc2cgPT09ICdzdHJpbmcnICYmIGpzb25Nc2cudHJpbSgpKSB7XG4gICAgICAgICAgZGV0YWlsID0ganNvbk1zZztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgfVxuICAgIGNvbnN0IHRyaW1tZWQgPVxuICAgICAgZGV0YWlsICYmIGRldGFpbC5sZW5ndGggPiAzMDAgPyBgJHtkZXRhaWwuc2xpY2UoMCwgMjk3KX1cdTIwMjZgIDogZGV0YWlsO1xuICAgIGxvZ0Vycm9yKCdHZW1pbmknLCByZXNwLnN0YXR1cywgZGV0YWlsIHx8ICc8bm8tYm9keT4nKTtcbiAgICBjb25zdCBub3RpY2VNc2cgPSB0cmltbWVkXG4gICAgICA/IGBHZW1pbmkgcG9zdHByb2Nlc3NpbmcgZmFpbGVkICgke3Jlc3Auc3RhdHVzfSk6ICR7dHJpbW1lZH1gXG4gICAgICA6IGBHZW1pbmkgcG9zdHByb2Nlc3NpbmcgZmFpbGVkICgke3Jlc3Auc3RhdHVzfSkuYDtcbiAgICBuZXcgTm90aWNlKG5vdGljZU1zZywgMTUwMDApO1xuICAgIHJldHVybiByYXc7XG4gIH1cbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpO1xuICBjb25zdCBwYXJ0cyA9IGRhdGE/LmNhbmRpZGF0ZXM/LlswXT8uY29udGVudD8ucGFydHM7XG4gIGNvbnN0IGNsZWFuZWQgPVxuICAgIEFycmF5LmlzQXJyYXkocGFydHMpXG4gICAgICA/IHBhcnRzXG4gICAgICAgICAgLm1hcCgocDogYW55KSA9PiAodHlwZW9mIHA/LnRleHQgPT09ICdzdHJpbmcnID8gcC50ZXh0IDogJycpKVxuICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAgICAgICAuam9pbignXFxuJylcbiAgICAgIDogdW5kZWZpbmVkO1xuICByZXR1cm4gdHlwZW9mIGNsZWFuZWQgPT09ICdzdHJpbmcnICYmIGNsZWFuZWQudHJpbSgpID8gY2xlYW5lZCA6IHJhdztcbn1cblxuZnVuY3Rpb24gYnVpbGRTeXN0ZW1BbmRVc2VyQ29udGVudChcbiAgcmF3OiBzdHJpbmcsXG4gIHByZXNldD86IFByb21wdFByZXNldCxcbiAgc2VsZWN0aW9uPzogc3RyaW5nLFxuKTogeyBzeXN0ZW06IHN0cmluZzsgdXNlckNvbnRlbnQ6IHN0cmluZyB9IHtcbiAgbGV0IHN5c3RlbSA9XG4gICAgcHJlc2V0Py5zeXN0ZW0gfHxcbiAgICAnWW91IGNsZWFuIHVwIHNwb2tlbiB0ZXh0LiBGaXggY2FwaXRhbGl6YXRpb24gYW5kIHB1bmN0dWF0aW9uLCByZW1vdmUgZmlsbGVyIHdvcmRzLCBwcmVzZXJ2ZSBtZWFuaW5nLiBEbyBub3QgYWRkIGNvbnRlbnQuJztcblxuICBjb25zdCBzZWwgPSAoc2VsZWN0aW9uIHx8ICcnKS50cmltKCk7XG4gIGxldCB1c2VyQ29udGVudCA9IHJhdztcbiAgaWYgKHNlbCkge1xuICAgIGlmIChzeXN0ZW0uaW5jbHVkZXMoJ3t7c2VsZWN0aW9ufX0nKSkge1xuICAgICAgc3lzdGVtID0gc3lzdGVtLnNwbGl0KCd7e3NlbGVjdGlvbn19Jykuam9pbihzZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb250ZXh0QmxvY2sgPSBgQ29udGV4dCAoc2VsZWN0ZWQgdGV4dCk6XFxuLS0tXFxuJHtzZWx9XFxuLS0tXFxuXFxuYDtcbiAgICAgIHVzZXJDb250ZW50ID0gY29udGV4dEJsb2NrICsgcmF3O1xuICAgIH1cbiAgfVxuICByZXR1cm4geyBzeXN0ZW0sIHVzZXJDb250ZW50IH07XG59XG5cbmZ1bmN0aW9uIGNsYW1wKG46IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7IHJldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKG1heCwgbikpOyB9XG4iLCAiZXhwb3J0IHR5cGUgVm94aWRpYW5FcnJvclNvdXJjZSA9ICdHcm9xJyB8ICdPcGVuQUknIHwgJ0dlbWluaSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVm94aWRpYW5FcnJvckxvZ0VudHJ5IHtcbiAgdHM6IG51bWJlcjtcbiAgc291cmNlOiBWb3hpZGlhbkVycm9yU291cmNlO1xuICBzdGF0dXM/OiBudW1iZXI7XG4gIGRldGFpbD86IHN0cmluZztcbn1cblxubGV0IGVycm9yTG9nU2luazogKChlbnRyeTogVm94aWRpYW5FcnJvckxvZ0VudHJ5KSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRXJyb3JMb2dTaW5rKGZuOiAoZW50cnk6IFZveGlkaWFuRXJyb3JMb2dFbnRyeSkgPT4gdm9pZCk6IHZvaWQge1xuICBlcnJvckxvZ1NpbmsgPSBmbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0Vycm9yKHNvdXJjZTogVm94aWRpYW5FcnJvclNvdXJjZSwgc3RhdHVzOiBudW1iZXIsIGRldGFpbDogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGVudHJ5OiBWb3hpZGlhbkVycm9yTG9nRW50cnkgPSB7XG4gICAgdHM6IERhdGUubm93KCksXG4gICAgc291cmNlLFxuICAgIHN0YXR1cyxcbiAgICBkZXRhaWwsXG4gIH07XG4gIHRyeSB7XG4gICAgY29uc3QgdyA9IHdpbmRvdyBhcyBhbnk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHcuVm94aWRpYW5FcnJvckxvZykpIHtcbiAgICAgIHcuVm94aWRpYW5FcnJvckxvZyA9IFtdO1xuICAgIH1cbiAgICB3LlZveGlkaWFuRXJyb3JMb2cucHVzaChlbnRyeSk7XG4gIH0gY2F0Y2gge1xuICAgIC8vIE5vbi1icm93c2VyIGVudmlyb25tZW50OyBpZ25vcmUuXG4gIH1cbiAgdHJ5IHtcbiAgICBpZiAoZXJyb3JMb2dTaW5rKSBlcnJvckxvZ1NpbmsoZW50cnkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcignW1ZveGlkaWFuXSBlcnJvciBsb2cgc2luayBmYWlsZWQnLCBlKTtcbiAgfVxuICBjb25zb2xlLndhcm4oJ1tWb3hpZGlhbl0nLCBzb3VyY2UsICdlcnJvcicsIHN0YXR1cywgZGV0YWlsIHx8ICc8bm8tYm9keT4nKTtcbn1cblxuIiwgImltcG9ydCB7IE5vdGljZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IGxvZ0Vycm9yIH0gZnJvbSAnLi9sb2dnaW5nJztcbmltcG9ydCB0eXBlIHsgQUlUcmFuc2NyaXB0U2V0dGluZ3MgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRyYW5zY3JpYmVXaXRoR3JvcShibG9iOiBCbG9iLCBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MpOiBQcm9taXNlPHN0cmluZz4ge1xuICBpZiAoIXNldHRpbmdzLmdyb3FBcGlLZXkpIHRocm93IG5ldyBFcnJvcignR3JvcSBBUEkga2V5IGlzIG1pc3NpbmcgaW4gc2V0dGluZ3MuJyk7XG4gIGNvbnN0IGZkID0gbmV3IEZvcm1EYXRhKCk7XG4gIGZkLmFwcGVuZCgnZmlsZScsIG5ldyBGaWxlKFtibG9iXSwgJ2F1ZGlvLndlYm0nLCB7IHR5cGU6IGJsb2IudHlwZSB8fCAnYXVkaW8vd2VibScgfSkpO1xuICBmZC5hcHBlbmQoJ21vZGVsJywgc2V0dGluZ3MuZ3JvcU1vZGVsIHx8ICd3aGlzcGVyLWxhcmdlLXYzJyk7XG4gIGlmIChzZXR0aW5ncy5sYW5ndWFnZSkgZmQuYXBwZW5kKCdsYW5ndWFnZScsIHNldHRpbmdzLmxhbmd1YWdlKTtcblxuICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLmdyb3EuY29tL29wZW5haS92MS9hdWRpby90cmFuc2NyaXB0aW9ucycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3NldHRpbmdzLmdyb3FBcGlLZXl9YCB9LFxuICAgIGJvZHk6IGZkLFxuICB9KTtcbiAgaWYgKCFyZXNwLm9rKSB7XG4gICAgbGV0IGRldGFpbCA9IGF3YWl0IHNhZmVUZXh0KHJlc3ApO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGRldGFpbCk7XG4gICAgICBjb25zdCBqc29uTXNnID0gKHBhcnNlZCBhcyBhbnkpPy5lcnJvcj8ubWVzc2FnZSB8fCAocGFyc2VkIGFzIGFueSk/Lm1lc3NhZ2U7XG4gICAgICBpZiAodHlwZW9mIGpzb25Nc2cgPT09ICdzdHJpbmcnICYmIGpzb25Nc2cudHJpbSgpKSB7XG4gICAgICAgIGRldGFpbCA9IGpzb25Nc2c7XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBpZ25vcmUgSlNPTiBwYXJzZSBlcnJvcnM7IGtlZXAgcmF3IGRldGFpbFxuICAgIH1cbiAgICBjb25zdCB0cmltbWVkID1cbiAgICAgIGRldGFpbCAmJiBkZXRhaWwubGVuZ3RoID4gMzAwID8gYCR7ZGV0YWlsLnNsaWNlKDAsIDI5Nyl9XHUyMDI2YCA6IGRldGFpbDtcbiAgICBsb2dFcnJvcignR3JvcScsIHJlc3Auc3RhdHVzLCBkZXRhaWwgfHwgJzxuby1ib2R5PicpO1xuICAgIGNvbnN0IG5vdGljZU1zZyA9IHRyaW1tZWRcbiAgICAgID8gYEdyb3EgdHJhbnNjcmlwdGlvbiBmYWlsZWQgKCR7cmVzcC5zdGF0dXN9KTogJHt0cmltbWVkfWBcbiAgICAgIDogYEdyb3EgdHJhbnNjcmlwdGlvbiBmYWlsZWQgKCR7cmVzcC5zdGF0dXN9KS5gO1xuICAgIG5ldyBOb3RpY2Uobm90aWNlTXNnLCAxNTAwMCk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBHcm9xIHRyYW5zY3JpcHRpb24gZmFpbGVkICgke3Jlc3Auc3RhdHVzfSk6ICR7ZGV0YWlsIHx8ICc8bm8tYm9keT4nfWApO1xuICB9XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgaWYgKHR5cGVvZiBkYXRhPy50ZXh0ICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdHcm9xIHJlc3BvbnNlIG1pc3NpbmcgdGV4dCcpO1xuICByZXR1cm4gZGF0YS50ZXh0IGFzIHN0cmluZztcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2FmZVRleHQocmVzcDogUmVzcG9uc2UpIHtcbiAgdHJ5IHsgcmV0dXJuIGF3YWl0IHJlc3AudGV4dCgpOyB9IGNhdGNoIHsgcmV0dXJuICc8bm8tYm9keT4nOyB9XG59XG4iLCAiZXhwb3J0IHR5cGUgSW5zZXJ0TW9kZSA9ICdpbnNlcnQnIHwgJ3JlcGxhY2UnO1xuZXhwb3J0IHR5cGUgUG9zdHByb2Nlc3NpbmdQcm92aWRlciA9ICdvcGVuYWknIHwgJ2dlbWluaSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvbXB0UHJlc2V0IHtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBzeXN0ZW06IHN0cmluZztcbiAgdGVtcGVyYXR1cmU6IG51bWJlcjtcbiAgaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZD86IGJvb2xlYW47XG4gIHJlcGxhY2VTZWxlY3Rpb24/OiBib29sZWFuO1xuICBtb2RlbD86IHN0cmluZzsgLy8gb3B0aW9uYWwgT3BlbkFJIG1vZGVsIG92ZXJyaWRlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQUlUcmFuc2NyaXB0U2V0dGluZ3Mge1xuICBncm9xQXBpS2V5OiBzdHJpbmc7XG4gIGdyb3FNb2RlbDogc3RyaW5nOyAvLyBlLmcuLCAnd2hpc3Blci1sYXJnZS12MydcbiAgbGFuZ3VhZ2U/OiBzdHJpbmc7IC8vIElTTyBjb2RlLCBvcHRpb25hbFxuXG4gIG9wZW5haUFwaUtleT86IHN0cmluZztcbiAgb3BlbmFpTW9kZWw6IHN0cmluZzsgLy8gZS5nLiwgJ2dwdC00by1taW5pJ1xuXG4gICBnZW1pbmlBcGlLZXk/OiBzdHJpbmc7XG4gICBnZW1pbmlNb2RlbDogc3RyaW5nOyAvLyBlLmcuLCAnZ2VtaW5pLTEuNS1mbGFzaCdcblxuICAgcG9zdHByb2Nlc3NpbmdQcm92aWRlcjogUG9zdHByb2Nlc3NpbmdQcm92aWRlcjtcblxuICBwcm9tcHRQcmVzZXRzOiBQcm9tcHRQcmVzZXRbXTtcbiAgZGVmYXVsdFByb21wdElkPzogc3RyaW5nO1xuICBsYXN0VXNlZFByb21wdElkPzogc3RyaW5nO1xuXG4gIHNob3dNb2RhbFdoaWxlUmVjb3JkaW5nOiBib29sZWFuO1xuICBtYXhEdXJhdGlvblNlYzogbnVtYmVyO1xuICBpbnNlcnRNb2RlOiBJbnNlcnRNb2RlO1xuICBhZGROZXdsaW5lQmVmb3JlOiBib29sZWFuO1xuICBhZGROZXdsaW5lQWZ0ZXI6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BSRVNFVDogUHJvbXB0UHJlc2V0ID0ge1xuICBpZDogJ3BvbGlzaGVkJyxcbiAgbmFtZTogJ1BvbGlzaGVkJyxcbiAgc3lzdGVtOlxuICAgICdZb3UgY2xlYW4gdXAgc3Bva2VuIHRleHQuIEZpeCBjYXBpdGFsaXphdGlvbiBhbmQgcHVuY3R1YXRpb24sIHJlbW92ZSBmaWxsZXIgd29yZHMsIHByZXNlcnZlIG1lYW5pbmcuIERvIG5vdCBhZGQgY29udGVudC4nLFxuICB0ZW1wZXJhdHVyZTogMC4yLFxufTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IEFJVHJhbnNjcmlwdFNldHRpbmdzID0ge1xuICBncm9xQXBpS2V5OiAnJyxcbiAgZ3JvcU1vZGVsOiAnd2hpc3Blci1sYXJnZS12MycsXG4gIGxhbmd1YWdlOiB1bmRlZmluZWQsXG5cbiAgb3BlbmFpQXBpS2V5OiAnJyxcbiAgb3BlbmFpTW9kZWw6ICdncHQtNG8tbWluaScsXG5cbiAgZ2VtaW5pQXBpS2V5OiAnJyxcbiAgZ2VtaW5pTW9kZWw6ICdnZW1pbmktMS41LWZsYXNoJyxcblxuICBwb3N0cHJvY2Vzc2luZ1Byb3ZpZGVyOiAnb3BlbmFpJyxcblxuICBwcm9tcHRQcmVzZXRzOiBbREVGQVVMVF9QUkVTRVRdLFxuICBkZWZhdWx0UHJvbXB0SWQ6ICdwb2xpc2hlZCcsXG4gIGxhc3RVc2VkUHJvbXB0SWQ6ICdwb2xpc2hlZCcsXG5cbiAgc2hvd01vZGFsV2hpbGVSZWNvcmRpbmc6IHRydWUsXG4gIG1heER1cmF0aW9uU2VjOiA5MDAsXG4gIGluc2VydE1vZGU6ICdpbnNlcnQnLFxuICBhZGROZXdsaW5lQmVmb3JlOiBmYWxzZSxcbiAgYWRkTmV3bGluZUFmdGVyOiB0cnVlLFxufTtcbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBTZXR0aW5nLCBEcm9wZG93bkNvbXBvbmVudCB9IGZyb20gJ29ic2lkaWFuJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVjb3JkaW5nTW9kYWxPcHRpb25zIHtcbiAgcHJlc2V0czogeyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfVtdO1xuICBkZWZhdWx0UHJlc2V0SWQ/OiBzdHJpbmc7XG4gIG1heER1cmF0aW9uU2VjOiBudW1iZXI7XG4gIG9uU3RhcnQ/OiAoKSA9PiB2b2lkO1xuICBvblN0b3A6IChhcHBseVBvc3Q6IGJvb2xlYW4sIHByZXNldElkPzogc3RyaW5nKSA9PiB2b2lkO1xuICBvbkRpc2NhcmQ6ICgpID0+IHZvaWQ7XG4gIG9uUGF1c2U/OiAoKSA9PiB2b2lkO1xuICBvblJlc3VtZT86ICgpID0+IHZvaWQ7XG4gIG9uQ2xvc2U/OiAoKSA9PiB2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUmVjb3JkaW5nTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XHJcbiAgcHJpdmF0ZSByb290RWw/OiBIVE1MRGl2RWxlbWVudDtcclxuICBwcml2YXRlIGVsYXBzZWRFbD86IEhUTUxFbGVtZW50O1xyXG4gIHByaXZhdGUgdGltZXI/OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBzdGFydGVkQXQgPSAwO1xyXG4gIHByaXZhdGUgcHJlc2V0RHJvcGRvd24/OiBEcm9wZG93bkNvbXBvbmVudDtcbiAgcHJpdmF0ZSBwYXVzZUJ0bkVsPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gIHByaXZhdGUgdHJhbnNjcmliZUJ0bkVsPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gIHByaXZhdGUgcG9zdHByb2Nlc3NCdG5FbD86IEhUTUxCdXR0b25FbGVtZW50O1xuICBwcml2YXRlIHN0YXR1c1RleHRFbD86IEhUTUxFbGVtZW50O1xuICBwcml2YXRlIGRpc2NhcmRCdG5FbD86IEhUTUxCdXR0b25FbGVtZW50O1xuICBwcml2YXRlIGlzUGF1c2VkID0gZmFsc2U7XG4gIHByaXZhdGUgcGF1c2VTdGFydGVkQXQgPSAwO1xuICBwcml2YXRlIGFjY3VtdWxhdGVkUGF1c2VNcyA9IDA7XG4gIHByaXZhdGUgb3V0c2lkZUNhcHR1cmVPcHRzOiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyA9IHsgY2FwdHVyZTogdHJ1ZSB9O1xuICBwcml2YXRlIG91dHNpZGVUb3VjaE9wdHM6IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zID0geyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiBmYWxzZSB9O1xuICBwcml2YXRlIHByZXZlbnRPdXRzaWRlQ2xvc2UgPSAoZXZ0OiBFdmVudCkgPT4ge1xuICAgIGlmICghdGhpcy5tb2RhbEVsKSByZXR1cm47XG4gICAgaWYgKHRoaXMubW9kYWxFbC5jb250YWlucyhldnQudGFyZ2V0IGFzIE5vZGUpKSByZXR1cm47XG4gICAgLy8gQmxvY2sgZGVmYXVsdCBtb2RhbCBiZWhhdmlvciB0aGF0IGNsb3NlcyBvbiBiYWNrZHJvcCBpbnRlcmFjdGlvbnNcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZXZ0LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICB9O1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIG9wdHM6IFJlY29yZGluZ01vZGFsT3B0aW9ucykge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XHJcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xyXG5cclxuICAgIHRoaXMubW9kYWxFbC5hZGRDbGFzcygndm94aWRpYW4tbW9kYWwnKTtcclxuXHJcbiAgICB0aGlzLnJvb3RFbCA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1yb290JyB9KTtcclxuICAgIHRoaXMucm9vdEVsLnNldEF0dHJpYnV0ZSgnZGF0YS1waGFzZScsICdyZWNvcmRpbmcnKTtcclxuXHJcbiAgICBjb25zdCBoZWFkZXIgPSB0aGlzLnJvb3RFbC5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1oZWFkZXInIH0pO1xyXG4gICAgaGVhZGVyLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1ZveGlkaWFuJyB9KTtcclxuICAgIGNvbnN0IGhlYWRlclJpZ2h0ID0gaGVhZGVyLmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLWhlYWRlci1yaWdodCcgfSk7XHJcbiAgICBoZWFkZXJSaWdodC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1yZWMtaW5kaWNhdG9yJywgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICdSZWNvcmRpbmcgaW5kaWNhdG9yJyB9IH0pO1xyXG4gICAgdGhpcy5lbGFwc2VkRWwgPSBoZWFkZXJSaWdodC5jcmVhdGVEaXYoeyB0ZXh0OiAnMDA6MDAnLCBjbHM6ICd2b3hpZGlhbi10aW1lcicgfSk7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwgPSBoZWFkZXJSaWdodC5jcmVhdGVFbCgnYnV0dG9uJywge1xyXG4gICAgICB0ZXh0OiAnXHUyNzVBXHUyNzVBJyxcclxuICAgICAgdHlwZTogJ2J1dHRvbicsXHJcbiAgICAgIGNsczogJ3ZveGlkaWFuLXBhdXNlJyxcclxuICAgICAgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICdQYXVzZSByZWNvcmRpbmcnLCAnYXJpYS1wcmVzc2VkJzogJ2ZhbHNlJyB9LFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnRvZ2dsZVBhdXNlKCkpO1xyXG4gICAgdGhpcy5yZXNldFBhdXNlU3RhdGUoKTtcclxuXHJcbiAgICBjb25zdCBib2R5ID0gdGhpcy5yb290RWwuY3JlYXRlRGl2KHsgY2xzOiAndm94aWRpYW4tYm9keScgfSk7XHJcblxyXG4gICAgLy8gUHJlc2V0IHNlbGVjdGlvblxyXG4gICAgbmV3IFNldHRpbmcoYm9keSlcclxuICAgICAgLnNldE5hbWUoJ1Bvc3Rwcm9jZXNzaW5nIHByZXNldCcpXHJcbiAgICAgIC5hZGREcm9wZG93bihkID0+IHtcclxuICAgICAgICB0aGlzLnByZXNldERyb3Bkb3duID0gZDtcclxuICAgICAgICBmb3IgKGNvbnN0IHAgb2YgdGhpcy5vcHRzLnByZXNldHMpIGQuYWRkT3B0aW9uKHAuaWQsIHAubmFtZSk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5kZWZhdWx0UHJlc2V0SWQpIGQuc2V0VmFsdWUodGhpcy5vcHRzLmRlZmF1bHRQcmVzZXRJZCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGJ0bnMgPSBib2R5LmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLWJ1dHRvbnMnIH0pO1xyXG4gICAgdGhpcy50cmFuc2NyaWJlQnRuRWwgPSBidG5zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdUcmFuc2NyaWJlJywgdHlwZTogJ2J1dHRvbicgfSk7XHJcbiAgICB0aGlzLnBvc3Rwcm9jZXNzQnRuRWwgPSBidG5zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdQb3N0UHJvY2VzcycsIHR5cGU6ICdidXR0b24nIH0pO1xyXG4gICAgdGhpcy5kaXNjYXJkQnRuRWwgPSBidG5zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdDYW5jZWwnLCB0eXBlOiAnYnV0dG9uJyB9KTtcbiAgICB0aGlzLnRyYW5zY3JpYmVCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudHJpZ2dlclN0b3AoZmFsc2UpKTtcclxuICAgIHRoaXMucG9zdHByb2Nlc3NCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudHJpZ2dlclN0b3AodHJ1ZSkpO1xyXG4gICAgdGhpcy5kaXNjYXJkQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm9wdHMub25EaXNjYXJkKCkpO1xyXG5cclxuICAgIGNvbnN0IHN0YXR1c0JhciA9IHRoaXMucm9vdEVsLmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLXN0YXR1c2JhcicgfSk7XG4gICAgY29uc3Qgc3RhdHVzV3JhcCA9IHN0YXR1c0Jhci5jcmVhdGVEaXYoeyBjbHM6ICdhaS1zdGF0dXMtd3JhcCcgfSk7XG4gICAgc3RhdHVzV3JhcC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1zcGlubmVyJywgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICdXb3JraW5nXHUyMDI2JyB9IH0pO1xuICAgIHRoaXMuc3RhdHVzVGV4dEVsID0gc3RhdHVzV3JhcC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1zdGF0dXMtdGV4dCcsIHRleHQ6ICdMaXN0ZW5pbmdcdTIwMjYnIH0pO1xuXG4gICAgdGhpcy5tb2RhbEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgdGhpcy5vcHRzLm9uRGlzY2FyZCgpO1xuICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyU3RvcChmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5jb250YWluZXJFbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHRoaXMucHJldmVudE91dHNpZGVDbG9zZSwgdGhpcy5vdXRzaWRlQ2FwdHVyZU9wdHMpO1xuICAgIHRoaXMuY29udGFpbmVyRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnByZXZlbnRPdXRzaWRlQ2xvc2UsIHRoaXMub3V0c2lkZUNhcHR1cmVPcHRzKTtcbiAgICB0aGlzLmNvbnRhaW5lckVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLnByZXZlbnRPdXRzaWRlQ2xvc2UsIHRoaXMub3V0c2lkZVRvdWNoT3B0cyk7XG5cbiAgICAvLyBTdGFydCB0aW1lclxuICAgIHRoaXMuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHRoaXMudGljaygpLCAyMDApO1xuICAgIHRoaXMub3B0cy5vblN0YXJ0Py4oKTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250YWluZXJFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHRoaXMucHJldmVudE91dHNpZGVDbG9zZSwgdGhpcy5vdXRzaWRlQ2FwdHVyZU9wdHMpO1xuICAgIHRoaXMuY29udGFpbmVyRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnByZXZlbnRPdXRzaWRlQ2xvc2UsIHRoaXMub3V0c2lkZUNhcHR1cmVPcHRzKTtcbiAgICB0aGlzLmNvbnRhaW5lckVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLnByZXZlbnRPdXRzaWRlQ2xvc2UsIHRoaXMub3V0c2lkZVRvdWNoT3B0cyk7XG4gICAgaWYgKHRoaXMudGltZXIpIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuICAgIHRoaXMudGltZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgICB0aGlzLm9wdHMub25DbG9zZT8uKCk7XG4gIH1cblxyXG4gIHByaXZhdGUgdGljaygpOiB2b2lkIHtcclxuICAgIGNvbnN0IGVsYXBzZWRNcyA9IHRoaXMuZ2V0RWxhcHNlZE1zKCk7XHJcbiAgICBjb25zdCBzZWMgPSBNYXRoLmZsb29yKGVsYXBzZWRNcyAvIDEwMDApO1xyXG4gICAgY29uc3QgbW0gPSBNYXRoLmZsb29yKHNlYyAvIDYwKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XHJcbiAgICBjb25zdCBzcyA9IChzZWMgJSA2MCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xyXG4gICAgaWYgKHRoaXMuZWxhcHNlZEVsKSB0aGlzLmVsYXBzZWRFbC50ZXh0Q29udGVudCA9IGAke21tfToke3NzfWA7XHJcbiAgICBpZiAodGhpcy5vcHRzLm1heER1cmF0aW9uU2VjID4gMCAmJiAhdGhpcy5pc1BhdXNlZCAmJiBzZWMgPj0gdGhpcy5vcHRzLm1heER1cmF0aW9uU2VjKSB7XHJcbiAgICAgIHRoaXMudHJpZ2dlclN0b3AoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRFbGFwc2VkTXMoKTogbnVtYmVyIHtcclxuICAgIGlmICghdGhpcy5zdGFydGVkQXQpIHJldHVybiAwO1xyXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5zdGFydGVkQXQgLSB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcztcclxuICAgIGlmICh0aGlzLmlzUGF1c2VkICYmIHRoaXMucGF1c2VTdGFydGVkQXQpIHtcclxuICAgICAgZWxhcHNlZCAtPSBub3cgLSB0aGlzLnBhdXNlU3RhcnRlZEF0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIGVsYXBzZWQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0cmlnZ2VyU3RvcChhcHBseVBvc3Q6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuZmluYWxpemVQYXVzZVN0YXRlKCk7XHJcbiAgICBjb25zdCBwcmVzZXRJZCA9IHRoaXMucHJlc2V0RHJvcGRvd24/LmdldFZhbHVlKCk7XHJcbiAgICB0aGlzLm9wdHMub25TdG9wKGFwcGx5UG9zdCwgcHJlc2V0SWQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0b2dnbGVQYXVzZSgpIHtcclxuICAgIGlmICh0aGlzLmlzUGF1c2VkKSB7XHJcbiAgICAgIHRoaXMucmVzdW1lUmVjb3JkaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnBhdXNlUmVjb3JkaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBhdXNlUmVjb3JkaW5nKCkge1xyXG4gICAgaWYgKHRoaXMuaXNQYXVzZWQpIHJldHVybjtcclxuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5wYXVzZVN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XHJcbiAgICB0aGlzLnVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKTtcclxuICAgIHRoaXMub3B0cy5vblBhdXNlPy4oKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzdW1lUmVjb3JkaW5nKCkge1xyXG4gICAgaWYgKCF0aGlzLmlzUGF1c2VkKSByZXR1cm47XHJcbiAgICBpZiAodGhpcy5wYXVzZVN0YXJ0ZWRBdCkgdGhpcy5hY2N1bXVsYXRlZFBhdXNlTXMgKz0gRGF0ZS5ub3coKSAtIHRoaXMucGF1c2VTdGFydGVkQXQ7XHJcbiAgICB0aGlzLnBhdXNlU3RhcnRlZEF0ID0gMDtcclxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMudXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpO1xyXG4gICAgdGhpcy5vcHRzLm9uUmVzdW1lPy4oKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZmluYWxpemVQYXVzZVN0YXRlKCkge1xyXG4gICAgaWYgKHRoaXMuaXNQYXVzZWQgJiYgdGhpcy5wYXVzZVN0YXJ0ZWRBdCkge1xyXG4gICAgICB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcyArPSBEYXRlLm5vdygpIC0gdGhpcy5wYXVzZVN0YXJ0ZWRBdDtcclxuICAgIH1cclxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSAwO1xyXG4gICAgdGhpcy51cGRhdGVQYXVzZUJ1dHRvbkxhYmVsKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0UGF1c2VTdGF0ZSgpIHtcclxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSAwO1xyXG4gICAgdGhpcy5hY2N1bXVsYXRlZFBhdXNlTXMgPSAwO1xyXG4gICAgdGhpcy51cGRhdGVQYXVzZUJ1dHRvbkxhYmVsKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKSB7XHJcbiAgICBpZiAoIXRoaXMucGF1c2VCdG5FbCkgcmV0dXJuO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLmNsYXNzTGlzdC50b2dnbGUoJ2lzLXBhdXNlZCcsIHRoaXMuaXNQYXVzZWQpO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLnRleHRDb250ZW50ID0gdGhpcy5pc1BhdXNlZCA/ICdcdTI1QjYnIDogJ1x1Mjc1QVx1Mjc1QSc7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCB0aGlzLmlzUGF1c2VkID8gJ3RydWUnIDogJ2ZhbHNlJyk7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgdGhpcy5pc1BhdXNlZCA/ICdSZXN1bWUgcmVjb3JkaW5nJyA6ICdQYXVzZSByZWNvcmRpbmcnKTtcclxuICB9XHJcblxyXG4gIC8vIFB1YmxpYyBVSSBoZWxwZXJzXHJcbiAgc2V0UGhhc2UocGhhc2U6ICdyZWNvcmRpbmcnIHwgJ3RyYW5zY3JpYmluZycgfCAncG9zdHByb2Nlc3NpbmcnIHwgJ2RvbmUnIHwgJ2Vycm9yJykge1xyXG4gICAgdGhpcy5yb290RWw/LnNldEF0dHJpYnV0ZSgnZGF0YS1waGFzZScsIHBoYXNlKTtcclxuICAgIGlmIChwaGFzZSAhPT0gJ3JlY29yZGluZycpIHtcclxuICAgICAgdGhpcy5maW5hbGl6ZVBhdXNlU3RhdGUoKTtcclxuICAgICAgaWYgKHRoaXMudGltZXIpIHsgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7IHRoaXMudGltZXIgPSB1bmRlZmluZWQ7IH1cclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBhdXNlQnRuRWwpIHRoaXMucGF1c2VCdG5FbC5kaXNhYmxlZCA9IHBoYXNlICE9PSAncmVjb3JkaW5nJztcclxuICB9XHJcblxyXG4gIHNldFN0YXR1cyh0ZXh0OiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5zdGF0dXNUZXh0RWwpIHRoaXMuc3RhdHVzVGV4dEVsLnRleHRDb250ZW50ID0gdGV4dDtcbiAgfVxuXG4gIHNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKHRyYW5zY3JpYmVFbmFibGVkOiBib29sZWFuLCBwb3N0cHJvY2Vzc0VuYWJsZWQ6IGJvb2xlYW4sIGRpc2NhcmRFbmFibGVkOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMudHJhbnNjcmliZUJ0bkVsKSB0aGlzLnRyYW5zY3JpYmVCdG5FbC5kaXNhYmxlZCA9ICF0cmFuc2NyaWJlRW5hYmxlZDtcbiAgICBpZiAodGhpcy5wb3N0cHJvY2Vzc0J0bkVsKSB0aGlzLnBvc3Rwcm9jZXNzQnRuRWwuZGlzYWJsZWQgPSAhcG9zdHByb2Nlc3NFbmFibGVkO1xuICAgIGlmICh0aGlzLmRpc2NhcmRCdG5FbCkgdGhpcy5kaXNjYXJkQnRuRWwuZGlzYWJsZWQgPSAhZGlzY2FyZEVuYWJsZWQ7XG4gIH1cblxyXG4gIHNldERpc2NhcmRMYWJlbChsYWJlbDogc3RyaW5nKSB7XHJcbiAgICBpZiAodGhpcy5kaXNjYXJkQnRuRWwpIHRoaXMuZGlzY2FyZEJ0bkVsLnRleHRDb250ZW50ID0gbGFiZWw7XHJcbiAgfVxyXG59XHJcbiIsICJleHBvcnQgdHlwZSBLZWVwQXdha2VTdHJhdGVneSA9ICd3YWtlLWxvY2snIHwgJ2F1ZGlvJztcblxuZXhwb3J0IGludGVyZmFjZSBLZWVwQXdha2VTdGF0ZSB7XG4gIHN1cHBvcnRlZDogYm9vbGVhbjtcbiAgYWN0aXZlOiBib29sZWFuO1xuICBzdHJhdGVneT86IEtlZXBBd2FrZVN0cmF0ZWd5O1xuICBsYXN0RXJyb3I/OiBzdHJpbmc7XG59XG5cbmNvbnN0IFNJTEVOVF9BVURJT19TUkMgPSAnZGF0YTphdWRpby93YXY7YmFzZTY0LCdcbiAgKyAnVWtsR1JtUUdBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlVQUdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJ1xuICArICdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEnXG4gICsgJ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSdcbiAgKyAnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBJztcblxuZXhwb3J0IGNsYXNzIEtlZXBBd2FrZU1hbmFnZXIge1xuICBwcml2YXRlIHdha2VMb2NrPzogeyByZWxlYXNlPzogKCkgPT4gUHJvbWlzZTx2b2lkPiB9O1xuICBwcml2YXRlIGF1ZGlvPzogSFRNTEF1ZGlvRWxlbWVudDtcbiAgcHJpdmF0ZSBzdGF0ZTogS2VlcEF3YWtlU3RhdGUgPSB7IHN1cHBvcnRlZDogZmFsc2UsIGFjdGl2ZTogZmFsc2UgfTtcbiAgcHJpdmF0ZSBpc0lvc0NhY2hlPzogYm9vbGVhbjtcblxuICBpbml0KCk6IHZvaWQge1xuICAgIHRoaXMuc3RhdGUuc3VwcG9ydGVkID0gdGhpcy5pc0xpa2VseUlvcygpO1xuICB9XG5cbiAgaXNMaWtlbHlJb3MoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuaXNJb3NDYWNoZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5pc0lvc0NhY2hlO1xuICAgIGNvbnN0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcbiAgICBjb25zdCBwbGF0Zm9ybSA9IChuYXZpZ2F0b3IgYXMgYW55KS5wbGF0Zm9ybSB8fCAnJztcbiAgICBjb25zdCBtYXhUb3VjaFBvaW50cyA9IChuYXZpZ2F0b3IgYXMgYW55KS5tYXhUb3VjaFBvaW50cyB8fCAwO1xuICAgIGNvbnN0IGlzaU9TID0gL2lQKGFkfGhvbmV8b2QpL2kudGVzdCh1YSkgfHwgKC9NYWMvaS50ZXN0KHBsYXRmb3JtKSAmJiBtYXhUb3VjaFBvaW50cyA+IDIpO1xuICAgIHRoaXMuaXNJb3NDYWNoZSA9IGlzaU9TO1xuICAgIHJldHVybiBpc2lPUztcbiAgfVxuXG4gIGdldFN0YXRlKCk6IEtlZXBBd2FrZVN0YXRlIHtcbiAgICByZXR1cm4geyAuLi50aGlzLnN0YXRlIH07XG4gIH1cblxuICBhc3luYyBlbmFibGVGcm9tVXNlckdlc3R1cmUoKTogUHJvbWlzZTxLZWVwQXdha2VTdGF0ZT4ge1xuICAgIGlmICghdGhpcy5pc0xpa2VseUlvcygpKSB7XG4gICAgICB0aGlzLnN0YXRlID0geyBzdXBwb3J0ZWQ6IGZhbHNlLCBhY3RpdmU6IGZhbHNlLCBsYXN0RXJyb3I6ICdLZWVwLWF3YWtlIGlzIHNjb3BlZCB0byBpT1MuJyB9O1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlKSByZXR1cm4gdGhpcy5nZXRTdGF0ZSgpO1xuXG4gICAgY29uc3QgbmF2ID0gbmF2aWdhdG9yIGFzIGFueTtcbiAgICBjb25zdCB3YWtlTG9ja0FwaSA9IG5hdj8ud2FrZUxvY2s7XG4gICAgaWYgKHdha2VMb2NrQXBpPy5yZXF1ZXN0KSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLndha2VMb2NrID0gYXdhaXQgd2FrZUxvY2tBcGkucmVxdWVzdCgnc2NyZWVuJyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IHN1cHBvcnRlZDogdHJ1ZSwgYWN0aXZlOiB0cnVlLCBzdHJhdGVneTogJ3dha2UtbG9jaycgfTtcbiAgICAgICAgdGhpcy53YWtlTG9jaz8uYWRkRXZlbnRMaXN0ZW5lcj8uKCdyZWxlYXNlJywgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuc3RhdGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy53YWtlTG9jayA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXRlKCk7XG4gICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5sYXN0RXJyb3IgPSBlPy5tZXNzYWdlIHx8IFN0cmluZyhlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBhdWRpbyA9IHRoaXMuZW5zdXJlQXVkaW9FbGVtZW50KCk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGF1ZGlvLnBsYXkoKTtcbiAgICAgIHRoaXMuc3RhdGUgPSB7IHN1cHBvcnRlZDogdHJ1ZSwgYWN0aXZlOiB0cnVlLCBzdHJhdGVneTogJ2F1ZGlvJyB9O1xuICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgdGhpcy5zdGF0ZSA9IHsgc3VwcG9ydGVkOiBmYWxzZSwgYWN0aXZlOiBmYWxzZSwgbGFzdEVycm9yOiBlPy5tZXNzYWdlIHx8IFN0cmluZyhlKSB9O1xuICAgICAgdGhpcy50ZWFyZG93bkF1ZGlvKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldFN0YXRlKCk7XG4gIH1cblxuICBkaXNhYmxlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLndha2VMb2NrKSB7XG4gICAgICB0cnkgeyB0aGlzLndha2VMb2NrLnJlbGVhc2U/LigpOyB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cbiAgICAgIHRoaXMud2FrZUxvY2sgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICh0aGlzLmF1ZGlvKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmF1ZGlvLnBhdXNlKCk7XG4gICAgICAgIHRoaXMuYXVkaW8uY3VycmVudFRpbWUgPSAwO1xuICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gICAgfVxuICAgIHRoaXMuc3RhdGUuYWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIGVuc3VyZUF1ZGlvRWxlbWVudCgpOiBIVE1MQXVkaW9FbGVtZW50IHtcbiAgICBpZiAodGhpcy5hdWRpbykgcmV0dXJuIHRoaXMuYXVkaW87XG4gICAgY29uc3QgYXVkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuICAgIGF1ZGlvLnNyYyA9IFNJTEVOVF9BVURJT19TUkM7XG4gICAgYXVkaW8ubG9vcCA9IHRydWU7XG4gICAgYXVkaW8ubXV0ZWQgPSB0cnVlO1xuICAgIGF1ZGlvLnByZWxvYWQgPSAnYXV0byc7XG4gICAgYXVkaW8uc2V0QXR0cmlidXRlKCdwbGF5c2lubGluZScsICd0cnVlJyk7XG4gICAgYXVkaW8uc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgIGF1ZGlvLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgYXVkaW8uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICBhdWRpby5zdHlsZS53aWR0aCA9ICcxcHgnO1xuICAgIGF1ZGlvLnN0eWxlLmhlaWdodCA9ICcxcHgnO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXVkaW8pO1xuICAgIHRoaXMuYXVkaW8gPSBhdWRpbztcbiAgICByZXR1cm4gYXVkaW87XG4gIH1cblxuICBwcml2YXRlIHRlYXJkb3duQXVkaW8oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYXVkaW8/LnBhcmVudEVsZW1lbnQpIHRoaXMuYXVkaW8ucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmF1ZGlvKTtcbiAgICB0aGlzLmF1ZGlvID0gdW5kZWZpbmVkO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFBQSxtQkFBK0Q7OztBQ0EvRCxzQkFBdUY7QUFJdkYsSUFBTSxvQkFBTixjQUFnQyxzQkFBTTtBQUFBLEVBR3BDLFlBQVksS0FBa0IsVUFBb0Q7QUFDaEYsVUFBTSxHQUFHO0FBRG1CO0FBQUEsRUFFOUI7QUFBQSxFQUVBLFNBQWU7QUFDYixVQUFNLEVBQUUsVUFBVSxJQUFJO0FBQ3RCLGNBQVUsTUFBTTtBQUNoQixjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEQsY0FBVSxTQUFTLEtBQUs7QUFBQSxNQUN0QixNQUFNO0FBQUEsSUFDUixDQUFDO0FBQ0QsVUFBTSxXQUFXLFVBQVUsU0FBUyxZQUFZLEVBQUUsS0FBSywwQkFBMEIsQ0FBQztBQUNsRixhQUFTLE9BQU87QUFDaEIsU0FBSyxhQUFhO0FBQ2xCLFVBQU0sVUFBVSxVQUFVLFVBQVUsRUFBRSxLQUFLLHlCQUF5QixDQUFDO0FBQ3JFLFVBQU0sV0FBVyxRQUFRLFNBQVMsVUFBVSxFQUFFLE1BQU0sU0FBUyxNQUFNLFNBQVMsQ0FBQztBQUM3RSxVQUFNLFlBQVksUUFBUSxTQUFTLFVBQVUsRUFBRSxNQUFNLFVBQVUsTUFBTSxTQUFTLENBQUM7QUFDL0UsVUFBTSxZQUFZLFFBQVEsU0FBUyxVQUFVLEVBQUUsTUFBTSxVQUFVLE1BQU0sU0FBUyxDQUFDO0FBQy9FLGFBQVMsaUJBQWlCLFNBQVMsTUFBTTtBQUFFLFdBQUssWUFBWTtBQUFBLElBQUcsQ0FBQztBQUNoRSxjQUFVLGlCQUFpQixTQUFTLE1BQU0sS0FBSyxhQUFhLENB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RDtBQUFBLEVBRVEsbUJBQW1CLEtBQWEsV0FBbUIsc0JBQStCLFFBQStCO0FBQ3ZILFVBQU0scUNBQXFDLFFBQVEsc0NBQXNDO0FBQ3pGLFFBQUksRUFBRSx3QkFBd0Isb0NBQXFDLFFBQU87QUFDMUUsVUFBTSxTQUFTLEtBQUssZ0JBQWdCLEdBQUc7QUFDdkMsUUFBSSxDQUFDLE9BQVEsUUFBTztBQUNwQixXQUFPLFVBQVUsS0FBSyxFQUFFLFNBQVMsR0FBRyxNQUFNO0FBQUE7QUFBQSxFQUFPLFNBQVMsS0FBSztBQUFBLEVBQ2pFO0FBQUEsRUFFUSxnQkFBZ0IsS0FBcUI7QUFDM0MsVUFBTSxhQUFhLElBQUksS0FBSztBQUM1QixRQUFJLENBQUMsV0FBWSxRQUFPO0FBQ3hCLFVBQU0sYUFBYSxXQUFXLE1BQU0sU0FBUztBQUM3QyxVQUFNLGVBQWUsV0FBVyxJQUFJLENBQUMsY0FBYztBQUNqRCxZQUFNLFFBQVEsVUFBVSxNQUFNLElBQUk7QUFDbEMsYUFBTyxNQUFNLElBQUksVUFBUSxLQUFLLEtBQUssUUFBUSxDQUFDLEVBQUUsRUFBRSxLQUFLLElBQUk7QUFBQSxJQUMzRCxDQUFDO0FBQ0QsV0FBTyxhQUFhLEtBQUssT0FBTztBQUFBLEVBQ2xDO0FBQUEsRUFFQSxNQUFjLGNBQTZCO0FBQ3pDLFVBQU0sVUFBa0M7QUFBQSxNQUN0QyxVQUFVLEtBQUs7QUFBQSxNQUNmLFVBQVUsS0FBSztBQUFBLElBQ2pCO0FBQ0EsVUFBTSxLQUFLLFNBQVMsT0FBTztBQUFBLEVBQzdCO0FBQUEsRUFFUSxlQUFlLE9BQW9DO0FBQ3pELFNBQUssU0FBUyxLQUFLLEtBQUs7QUFDeEIsUUFBSSxLQUFLLFNBQVMsU0FBUyxLQUFLO0FBQzlCLFdBQUssV0FBVyxLQUFLLFNBQVMsTUFBTSxJQUFJO0FBQUEsSUFDMUM7QUFFQSxTQUFLLFlBQVksRUFBRSxNQUFNLENBQUMsTUFBTSxRQUFRLE1BQU0sMENBQTBDLENBQUMsQ0FBQztBQUFBLEVBQzVGO0FBQUEsRUFFQSxNQUFjLGdCQUErQjtBQUMzQyxTQUFLLFdBQVcsQ0FBQztBQUNqQixRQUFJO0FBQ0YsWUFBTSxJQUFJO0FBQ1YsVUFBSSxNQUFNLFFBQVEsRUFBRSxnQkFBZ0IsR0FBRztBQUNyQyxVQUFFLG1CQUFtQixDQUFDO0FBQUEsTUFDeEI7QUFBQSxJQUNGLFFBQVE7QUFBQSxJQUVSO0FBQ0EsVUFBTSxLQUFLLFlBQVk7QUFBQSxFQUN6QjtBQUNGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaWQiLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iXQp9Cg==
