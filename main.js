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
var import_obsidian3 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var AITranscriptSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin, getSettings, saveSettings) {
    super(app, plugin);
    this.getSettings = getSettings;
    this.saveSettings = saveSettings;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "AI Transcript" });
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
    new import_obsidian.Setting(containerEl).setName("Include transcript with postprocessed message").setDesc('Prepends the raw transcript quoted with ">" when postprocessing succeeds.').addToggle((t) => t.setValue(s.includeTranscriptWithPostprocessed).onChange(async (v) => {
      await this.saveSettings({ includeTranscriptWithPostprocessed: v });
    }));
    containerEl.createEl("h4", { text: "Prompt presets" });
    const listEl = containerEl.createDiv();
    const renderPresets = () => {
      listEl.empty();
      const st = this.getSettings();
      st.promptPresets.forEach((p) => {
        const wrap = listEl.createDiv({ cls: "ai-preset" });
        new import_obsidian.Setting(wrap).setName(p.name).setDesc("System prompt + temperature").addButton((b) => b.setButtonText("Set Default").onClick(async () => {
          await this.saveSettings({ defaultPromptId: p.id });
          renderPresets();
        })).addButton((b) => b.setButtonText("Delete").onClick(async () => {
          const filtered = st.promptPresets.filter((x) => x.id !== p.id);
          await this.saveSettings({ promptPresets: filtered });
          renderPresets();
        }));
        new import_obsidian.Setting(wrap).setName("Name").addText((t) => t.setValue(p.name).onChange(async (v) => {
          p.name = v;
          await this.saveSettings({ promptPresets: st.promptPresets });
        }));
        new import_obsidian.Setting(wrap).setName("System prompt").setDesc("Supports {{selection}} placeholder; when absent, current selection is prepended as context.").addTextArea((t) => t.setValue(p.system).onChange(async (v) => {
          p.system = v;
          await this.saveSettings({ promptPresets: st.promptPresets });
        }));
        new import_obsidian.Setting(wrap).setName("Temperature").addText((t) => t.setValue(String(p.temperature)).onChange(async (v) => {
          const num = Number(v);
          p.temperature = isFinite(num) ? num : 0.2;
          await this.saveSettings({ promptPresets: st.promptPresets });
        }));
        new import_obsidian.Setting(wrap).setName("Model override (optional)").addText((t) => t.setPlaceholder("e.g., gpt-4o-mini").setValue(p.model || "").onChange(async (v) => {
          p.model = v.trim() || void 0;
          await this.saveSettings({ promptPresets: st.promptPresets });
        }));
        if (st.defaultPromptId === p.id) wrap.createDiv({ text: "Default preset", cls: "ai-preset-default" });
      });
    };
    renderPresets();
    new import_obsidian.Setting(containerEl).setName("Add preset").addButton((b) => b.setButtonText("Add").onClick(async () => {
      const st = this.getSettings();
      const id = `preset-${Date.now()}`;
      const preset = { id, name: "New Preset", system: "Edit me\u2026", temperature: 0.2 };
      await this.saveSettings({ promptPresets: [...st.promptPresets, preset] });
      renderPresets();
    }));
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
    }));
    new import_obsidian.Setting(containerEl).setName("Add newline before").addToggle((t) => t.setValue(s.addNewlineBefore).onChange(async (v) => {
      await this.saveSettings({ addNewlineBefore: v });
    }));
    new import_obsidian.Setting(containerEl).setName("Add newline after").addToggle((t) => t.setValue(s.addNewlineAfter).onChange(async (v) => {
      await this.saveSettings({ addNewlineAfter: v });
    }));
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
async function postprocessWithOpenAI(raw, settings, preset, selection) {
  if (!settings.openaiApiKey) return raw;
  const model = preset?.model || settings.openaiModel || "gpt-4o-mini";
  const temperature = clamp(preset?.temperature ?? 0.2, 0, 1);
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
    try {
      console.warn("OpenAI postprocess failed", resp.status, await resp.text());
    } catch {
    }
    return raw;
  }
  const data = await resp.json();
  const cleaned = data?.choices?.[0]?.message?.content;
  return typeof cleaned === "string" && cleaned.trim() ? cleaned : raw;
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// src/transcribe.ts
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
    const text = await safeText(resp);
    throw new Error(`Groq transcription failed (${resp.status}): ${text}`);
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
  promptPresets: [DEFAULT_PRESET],
  defaultPromptId: "polished",
  lastUsedPromptId: "polished",
  showModalWhileRecording: true,
  maxDurationSec: 900,
  insertMode: "insert",
  addNewlineBefore: false,
  addNewlineAfter: true,
  includeTranscriptWithPostprocessed: false
};

// src/ui/RecordingModal.ts
var import_obsidian2 = require("obsidian");
var RecordingModal = class extends import_obsidian2.Modal {
  constructor(app, opts) {
    super(app);
    this.opts = opts;
    this.startedAt = 0;
    this.isPaused = false;
    this.pauseStartedAt = 0;
    this.accumulatedPauseMs = 0;
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
    new import_obsidian2.Setting(body).setName("Postprocessing preset").addDropdown((d) => {
      this.presetDropdown = d;
      for (const p of this.opts.presets) d.addOption(p.id, p.name);
      if (this.opts.defaultPresetId) d.setValue(this.opts.defaultPresetId);
    });
    const btns = body.createDiv({ cls: "voxidian-buttons" });
    this.transcribeBtnEl = btns.createEl("button", { text: "Transcribe", type: "button" });
    this.postprocessBtnEl = btns.createEl("button", { text: "PostProcess", type: "button" });
    this.discardBtnEl = btns.createEl("button", { text: "Discard", type: "button" });
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
    this.startedAt = Date.now();
    this.timer = window.setInterval(() => this.tick(), 200);
    this.opts.onStart?.();
  }
  onClose() {
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
var AITranscriptPlugin = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS, promptPresets: [...DEFAULT_SETTINGS.promptPresets] };
  }
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
    this.addSettingTab(new AITranscriptSettingTab(this.app, this, () => this.settings, async (partial) => {
      Object.assign(this.settings, partial);
      await this.saveData(this.settings);
    }));
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
    const view = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
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
          const blob = await this.recorder.stop();
          this.recorder = void 0;
          const raw = await transcribeWithGroq(blob, this.settings);
          let text = raw;
          if (applyPost) {
            const preset = this.settings.promptPresets.find((p) => p.id === presetId);
            this.settings.lastUsedPromptId = preset?.id || presetId || this.settings.lastUsedPromptId;
            await this.saveData(this.settings);
            modal.setPhase("postprocessing");
            modal.setStatus("Cleaning transcript\u2026");
            const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
            const selection = activeView?.editor?.getSelection() || "";
            text = await postprocessWithOpenAI(raw, this.settings, preset, selection);
          }
          const finalOutput = this.combineTranscripts(raw, text, applyPost);
          await this.insertText(finalOutput);
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
  async insertText(text) {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    if (!view) throw new Error("No active Markdown editor");
    const editor = view.editor;
    const normalized = text.startsWith(" ") ? text.slice(1) : text;
    const before = this.settings.addNewlineBefore ? "\n" : "";
    const after = this.settings.addNewlineAfter ? "\n" : "";
    const content = `${before}${normalized}${after}`;
    let start;
    if (this.settings.insertMode === "replace" && editor.somethingSelected()) {
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
  combineTranscripts(raw, processed, postprocessedApplied) {
    if (!(postprocessedApplied && this.settings.includeTranscriptWithPostprocessed)) return processed;
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
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9yZWNvcmRlci50cyIsICJzcmMvcG9zdHByb2Nlc3MudHMiLCAic3JjL3RyYW5zY3JpYmUudHMiLCAic3JjL3R5cGVzLnRzIiwgInNyYy91aS9SZWNvcmRpbmdNb2RhbC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQXBwLCBNYXJrZG93blZpZXcsIFBsdWdpbiwgdHlwZSBFZGl0b3JQb3NpdGlvbiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEFJVHJhbnNjcmlwdFNldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IEF1ZGlvUmVjb3JkZXIgfSBmcm9tICcuL3JlY29yZGVyJztcbmltcG9ydCB7IHBvc3Rwcm9jZXNzV2l0aE9wZW5BSSB9IGZyb20gJy4vcG9zdHByb2Nlc3MnO1xuaW1wb3J0IHsgdHJhbnNjcmliZVdpdGhHcm9xIH0gZnJvbSAnLi90cmFuc2NyaWJlJztcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIHR5cGUgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIHR5cGUgUHJvbXB0UHJlc2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSZWNvcmRpbmdNb2RhbCB9IGZyb20gJy4vdWkvUmVjb3JkaW5nTW9kYWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBSVRyYW5zY3JpcHRQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MgPSB7IC4uLkRFRkFVTFRfU0VUVElOR1MsIHByb21wdFByZXNldHM6IFsuLi5ERUZBVUxUX1NFVFRJTkdTLnByb21wdFByZXNldHNdIH07XG4gIHByaXZhdGUgcmVjb3JkZXI/OiBBdWRpb1JlY29yZGVyO1xuICBwcml2YXRlIG1vZGFsPzogUmVjb3JkaW5nTW9kYWw7XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuXG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdtaWMnLCAnUmVjb3JkICYgVHJhbnNjcmliZScsICgpID0+IHRoaXMudG9nZ2xlUmVjb3JkaW5nKCkpO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAndm94aWRpYW4tc3RhcnQtc3RvcCcsXG4gICAgICBuYW1lOiAnU3RhcnQvU3RvcCBSZWNvcmRpbmcnLFxuICAgICAgaG90a2V5czogW3sgbW9kaWZpZXJzOiBbJ01vZCcsICdTaGlmdCddLCBrZXk6ICdNJyB9XSxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnRvZ2dsZVJlY29yZGluZygpLFxuICAgIH0pO1xuXG4gICAgLy8gTW9iaWxlIHRvb2xiYXIgYWN0aW9uOiBhcHBlYXJzIGluIE9ic2lkaWFuIE1vYmlsZSBlZGl0b3IgdG9vbGJhclxuICAgIC8vIFVzZXJzIGNhbiBhZGQgdGhpcyBjb21tYW5kIHRvIHRoZSBtb2JpbGUgdG9vbGJhciB2aWEgU2V0dGluZ3MgXHUyMTkyIE1vYmlsZSBcdTIxOTIgVG9vbGJhclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3JlY29yZC10cmFuc2NyaWJlLWluc2VydCcsXG4gICAgICBuYW1lOiAnUmVjb3JkIFx1MjAyMiBUcmFuc2NyaWJlIFx1MjAyMiBJbnNlcnQnLFxuICAgICAgaWNvbjogJ21pYycsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKCkgPT4gdGhpcy50b2dnbGVSZWNvcmRpbmcoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgQUlUcmFuc2NyaXB0U2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcywgKCkgPT4gdGhpcy5zZXR0aW5ncywgYXN5bmMgKHBhcnRpYWwpID0+IHtcbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5zZXR0aW5ncywgcGFydGlhbCk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICAgIH0pKTtcbiAgfVxuXG4gIG9udW5sb2FkKCkge1xuICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7IH1cbiAgICB0cnkgeyB0aGlzLm1vZGFsPy5jbG9zZSgpOyB9IGNhdGNoIHsgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyB0b2dnbGVSZWNvcmRpbmcoKSB7XG4gICAgLy8gSWYgbW9kYWwgaXMgb3Blbiwgc3RvcCBub3cgKHNpbXVsYXRlIGNsaWNraW5nIFN0b3ApXG4gICAgaWYgKHRoaXMubW9kYWwpIHtcbiAgICAgIC8vIG5vb3AgXHUyMDE0IHN0b3BwaW5nIGlzIGRyaXZlbiB2aWEgbW9kYWwgYnV0dG9uIHRvIHByZXNlcnZlIHByZXNldC9hcHBseSBzdGF0ZVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB3ZSBoYXZlIGFuIGVkaXRvciB0byBpbnNlcnQgaW50byBsYXRlciAobm90IHN0cmljdGx5IHJlcXVpcmVkIGJ1dCBoZWxwcyBVWClcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICBpZiAoIXZpZXcpIHJldHVybjsgLy8gTVZQOiByZXF1aXJlIGFjdGl2ZSBtYXJrZG93biB2aWV3XG5cbiAgICAvLyBQcmVwYXJlIHJlY29yZGVyIGFuZCBtb2RhbFxuICAgIHRoaXMucmVjb3JkZXIgPSBuZXcgQXVkaW9SZWNvcmRlcigpO1xuICAgIGNvbnN0IHByZXNldHMgPSB0aGlzLnNldHRpbmdzLnByb21wdFByZXNldHMubWFwKHAgPT4gKHsgaWQ6IHAuaWQsIG5hbWU6IHAubmFtZSB9KSk7XG4gICAgY29uc3QgbW9kYWwgPSBuZXcgUmVjb3JkaW5nTW9kYWwodGhpcy5hcHAsIHtcbiAgICAgIHByZXNldHMsXG4gICAgICBkZWZhdWx0UHJlc2V0SWQ6IHRoaXMuc2V0dGluZ3MubGFzdFVzZWRQcm9tcHRJZCB8fCB0aGlzLnNldHRpbmdzLmRlZmF1bHRQcm9tcHRJZCxcbiAgICAgIG1heER1cmF0aW9uU2VjOiB0aGlzLnNldHRpbmdzLm1heER1cmF0aW9uU2VjLFxuICAgICAgb25TdGFydDogYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IHRoaXMucmVjb3JkZXIhLnN0YXJ0KCk7XG4gICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ2Vycm9yJyk7XG4gICAgICAgICAgbW9kYWwuc2V0U3RhdHVzKCdNaWNyb3Bob25lIHBlcm1pc3Npb24gb3IgcmVjb3JkZXIgZXJyb3IuJyk7XG4gICAgICAgICAgbW9kYWwuc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQoZmFsc2UsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBtb2RhbC5zZXREaXNjYXJkTGFiZWwoJ0Nsb3NlJyk7XG4gICAgICAgICAgdGhpcy5yZWNvcmRlcj8uZGlzY2FyZCgpO1xuICAgICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvblN0b3A6IGFzeW5jIChhcHBseVBvc3QsIHByZXNldElkKSA9PiB7XG4gICAgICAgIG1vZGFsLnNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICBtb2RhbC5zZXRQaGFzZSgndHJhbnNjcmliaW5nJyk7XG4gICAgICAgIG1vZGFsLnNldFN0YXR1cygnVHJhbnNjcmliaW5nXHUyMDI2Jyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IHRoaXMucmVjb3JkZXIhLnN0b3AoKTtcbiAgICAgICAgICB0aGlzLnJlY29yZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGNvbnN0IHJhdyA9IGF3YWl0IHRyYW5zY3JpYmVXaXRoR3JvcShibG9iLCB0aGlzLnNldHRpbmdzKTtcbiAgICAgICAgICBsZXQgdGV4dCA9IHJhdztcbiAgICAgICAgICBpZiAoYXBwbHlQb3N0KSB7XG4gICAgICAgICAgICBjb25zdCBwcmVzZXQgPSB0aGlzLnNldHRpbmdzLnByb21wdFByZXNldHMuZmluZChwID0+IHAuaWQgPT09IHByZXNldElkKSBhcyBQcm9tcHRQcmVzZXQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLmxhc3RVc2VkUHJvbXB0SWQgPSBwcmVzZXQ/LmlkIHx8IHByZXNldElkIHx8IHRoaXMuc2V0dGluZ3MubGFzdFVzZWRQcm9tcHRJZDtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gICAgICAgICAgICBtb2RhbC5zZXRQaGFzZSgncG9zdHByb2Nlc3NpbmcnKTtcbiAgICAgICAgICAgIG1vZGFsLnNldFN0YXR1cygnQ2xlYW5pbmcgdHJhbnNjcmlwdFx1MjAyNicpO1xuICAgICAgICAgICAgLy8gQ2FwdHVyZSBjdXJyZW50IHNlbGVjdGlvbiBmcm9tIGFjdGl2ZSBlZGl0b3IgdG8gaW5jbHVkZSBhcyBjb250ZXh0IG9yIGlubGluZSBpbiBzeXN0ZW1cbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZVZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gYWN0aXZlVmlldz8uZWRpdG9yPy5nZXRTZWxlY3Rpb24oKSB8fCAnJztcbiAgICAgICAgICAgIHRleHQgPSBhd2FpdCBwb3N0cHJvY2Vzc1dpdGhPcGVuQUkocmF3LCB0aGlzLnNldHRpbmdzLCBwcmVzZXQsIHNlbGVjdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGZpbmFsT3V0cHV0ID0gdGhpcy5jb21iaW5lVHJhbnNjcmlwdHMocmF3LCB0ZXh0LCBhcHBseVBvc3QpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuaW5zZXJ0VGV4dChmaW5hbE91dHB1dCk7XG4gICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ2RvbmUnKTtcbiAgICAgICAgICBtb2RhbC5zZXRTdGF0dXMoJ1RyYW5zY3JpcHQgaW5zZXJ0ZWQgaW50byB0aGUgbm90ZS4nKTtcbiAgICAgICAgICBtb2RhbC5zZXRBY3Rpb25CdXR0b25zRW5hYmxlZChmYWxzZSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIG1vZGFsLnNldERpc2NhcmRMYWJlbCgnQ2xvc2UnKTtcbiAgICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgICAgICAgIGlmICh0aGlzLm1vZGFsID09PSBtb2RhbCkgdGhpcy5tb2RhbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICBtb2RhbC5zZXRQaGFzZSgnZXJyb3InKTtcbiAgICAgICAgICBtb2RhbC5zZXRTdGF0dXMoYEVycm9yOiAke2U/Lm1lc3NhZ2UgfHwgZX1gKTtcbiAgICAgICAgICBtb2RhbC5zZXRBY3Rpb25CdXR0b25zRW5hYmxlZChmYWxzZSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIG1vZGFsLnNldERpc2NhcmRMYWJlbCgnQ2xvc2UnKTtcbiAgICAgICAgICB0cnkgeyB0aGlzLnJlY29yZGVyPy5kaXNjYXJkKCk7IH0gY2F0Y2ggeyB9XG4gICAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAvLyBrZWVwIG1vZGFsIG9wZW4gZm9yIHVzZXIgdG8gcmVhZC9jbG9zZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25EaXNjYXJkOiAoKSA9PiB7XG4gICAgICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7IH1cbiAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5tb2RhbCA9IHVuZGVmaW5lZDtcbiAgICAgIH0sXG4gICAgICBvblBhdXNlOiAoKSA9PiB0aGlzLnJlY29yZGVyPy5wYXVzZSgpLFxuICAgICAgb25SZXN1bWU6ICgpID0+IHRoaXMucmVjb3JkZXI/LnJlc3VtZSgpLFxuICAgICAgb25DbG9zZTogKCkgPT4ge1xuICAgICAgICB0cnkgeyB0aGlzLnJlY29yZGVyPy5kaXNjYXJkKCk7IH0gY2F0Y2ggeyB9XG4gICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLm1vZGFsID09PSBtb2RhbCkgdGhpcy5tb2RhbCA9IHVuZGVmaW5lZDtcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgdGhpcy5tb2RhbCA9IG1vZGFsO1xuXG4gICAgLy8gTVZQIHVzZXMgbW9kYWwgdG8gcHJlc2VudCBhbGwgc3RhdHVzIGFuZCBhbmltYXRpb25zXG4gICAgbW9kYWwub3BlbigpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbnNlcnRUZXh0KHRleHQ6IHN0cmluZykge1xuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuICAgIGlmICghdmlldykgdGhyb3cgbmV3IEVycm9yKCdObyBhY3RpdmUgTWFya2Rvd24gZWRpdG9yJyk7XG4gICAgY29uc3QgZWRpdG9yID0gdmlldy5lZGl0b3I7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IHRleHQuc3RhcnRzV2l0aCgnICcpID8gdGV4dC5zbGljZSgxKSA6IHRleHQ7XG4gICAgY29uc3QgYmVmb3JlID0gdGhpcy5zZXR0aW5ncy5hZGROZXdsaW5lQmVmb3JlID8gJ1xcbicgOiAnJztcbiAgICBjb25zdCBhZnRlciA9IHRoaXMuc2V0dGluZ3MuYWRkTmV3bGluZUFmdGVyID8gJ1xcbicgOiAnJztcbiAgICBjb25zdCBjb250ZW50ID0gYCR7YmVmb3JlfSR7bm9ybWFsaXplZH0ke2FmdGVyfWA7XG5cbiAgICBsZXQgc3RhcnQ6IEVkaXRvclBvc2l0aW9uO1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmluc2VydE1vZGUgPT09ICdyZXBsYWNlJyAmJiBlZGl0b3Iuc29tZXRoaW5nU2VsZWN0ZWQoKSkge1xuICAgICAgc3RhcnQgPSAoZWRpdG9yIGFzIGFueSkuZ2V0Q3Vyc29yKCdmcm9tJykgYXMgRWRpdG9yUG9zaXRpb247XG4gICAgICBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihjb250ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhcnQgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XG4gICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKGNvbnRlbnQsIHN0YXJ0KTtcbiAgICB9XG4gICAgY29uc3QgY2FyZXQgPSB0aGlzLmFkdmFuY2VQb3Moc3RhcnQsIGAke2JlZm9yZX0ke25vcm1hbGl6ZWR9YCk7XG4gICAgZWRpdG9yLnNldEN1cnNvcihjYXJldCk7XG4gIH1cblxuICBwcml2YXRlIGFkdmFuY2VQb3Moc3RhcnQ6IEVkaXRvclBvc2l0aW9uLCB0ZXh0OiBzdHJpbmcpOiBFZGl0b3JQb3NpdGlvbiB7XG4gICAgY29uc3QgcGFydHMgPSB0ZXh0LnNwbGl0KCdcXG4nKTtcbiAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSByZXR1cm4geyBsaW5lOiBzdGFydC5saW5lLCBjaDogc3RhcnQuY2ggKyBwYXJ0c1swXS5sZW5ndGggfTtcbiAgICBjb25zdCBsaW5lc0FkZGVkID0gcGFydHMubGVuZ3RoIC0gMTtcbiAgICBjb25zdCBsYXN0TGVuID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0ubGVuZ3RoO1xuICAgIHJldHVybiB7IGxpbmU6IHN0YXJ0LmxpbmUgKyBsaW5lc0FkZGVkLCBjaDogbGFzdExlbiB9O1xuICB9XG5cbiAgcHJpdmF0ZSBjb21iaW5lVHJhbnNjcmlwdHMocmF3OiBzdHJpbmcsIHByb2Nlc3NlZDogc3RyaW5nLCBwb3N0cHJvY2Vzc2VkQXBwbGllZDogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgaWYgKCEocG9zdHByb2Nlc3NlZEFwcGxpZWQgJiYgdGhpcy5zZXR0aW5ncy5pbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkKSkgcmV0dXJuIHByb2Nlc3NlZDtcbiAgICBjb25zdCBxdW90ZWQgPSB0aGlzLnF1b3RlVHJhbnNjcmlwdChyYXcpO1xuICAgIGlmICghcXVvdGVkKSByZXR1cm4gcHJvY2Vzc2VkO1xuICAgIHJldHVybiBwcm9jZXNzZWQudHJpbSgpLmxlbmd0aCA/IGAke3F1b3RlZH1cXG5cXG4ke3Byb2Nlc3NlZH1gIDogcXVvdGVkO1xuICB9XG5cbiAgcHJpdmF0ZSBxdW90ZVRyYW5zY3JpcHQocmF3OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSByYXcudHJpbSgpO1xuICAgIGlmICghbm9ybWFsaXplZCkgcmV0dXJuICcnO1xuICAgIGNvbnN0IHBhcmFncmFwaHMgPSBub3JtYWxpemVkLnNwbGl0KC9cXG5cXHMqXFxuLyk7XG4gICAgY29uc3QgcXVvdGVkQmxvY2tzID0gcGFyYWdyYXBocy5tYXAoKHBhcmFncmFwaCkgPT4ge1xuICAgICAgY29uc3QgbGluZXMgPSBwYXJhZ3JhcGguc3BsaXQoJ1xcbicpO1xuICAgICAgcmV0dXJuIGxpbmVzLm1hcChsaW5lID0+IGA+ICR7bGluZS50cmltRW5kKCl9YCkuam9pbignXFxuJyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHF1b3RlZEJsb2Nrcy5qb2luKCdcXG4+XFxuJyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIFByb21wdFByZXNldCB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgQUlUcmFuc2NyaXB0U2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBQbHVnaW4sIHByaXZhdGUgZ2V0U2V0dGluZ3M6ICgpID0+IEFJVHJhbnNjcmlwdFNldHRpbmdzLCBwcml2YXRlIHNhdmVTZXR0aW5nczogKHM6IFBhcnRpYWw8QUlUcmFuc2NyaXB0U2V0dGluZ3M+KSA9PiBQcm9taXNlPHZvaWQ+KSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnQUkgVHJhbnNjcmlwdCcgfSk7XG5cbiAgICBjb25zdCBzID0gdGhpcy5nZXRTZXR0aW5ncygpO1xuXG4gICAgLy8gR1JPUVxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ0dyb3EgV2hpc3BlcicgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnR3JvcSBBUEkgS2V5JylcbiAgICAgIC5zZXREZXNjKCdSZXF1aXJlZCB0byB0cmFuc2NyaWJlIGF1ZGlvIHZpYSBHcm9xIFdoaXNwZXIuJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2dza18uLi4nKVxuICAgICAgICAuc2V0VmFsdWUocy5ncm9xQXBpS2V5IHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBncm9xQXBpS2V5OiB2LnRyaW0oKSB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnR3JvcSBtb2RlbCcpXG4gICAgICAuc2V0RGVzYygnRGVmYXVsdDogd2hpc3Blci1sYXJnZS12MycpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFZhbHVlKHMuZ3JvcU1vZGVsKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBncm9xTW9kZWw6IHYudHJpbSgpIHx8ICd3aGlzcGVyLWxhcmdlLXYzJyB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnTGFuZ3VhZ2UgKG9wdGlvbmFsKScpXG4gICAgICAuc2V0RGVzYygnSVNPIGNvZGUgbGlrZSBlbiwgZXMsIGRlLiBMZWF2ZSBlbXB0eSBmb3IgYXV0by4nKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRWYWx1ZShzLmxhbmd1YWdlIHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBsYW5ndWFnZTogdi50cmltKCkgfHwgdW5kZWZpbmVkIH0pOyB9KSk7XG5cbiAgICAvLyBPcGVuQUlcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdPcGVuQUkgUG9zdHByb2Nlc3NpbmcgKG9wdGlvbmFsKScgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnT3BlbkFJIEFQSSBLZXknKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRQbGFjZWhvbGRlcignc2stLi4uJylcbiAgICAgICAgLnNldFZhbHVlKHMub3BlbmFpQXBpS2V5IHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBvcGVuYWlBcGlLZXk6IHYudHJpbSgpIH0pOyB9KSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdPcGVuQUkgbW9kZWwnKVxuICAgICAgLnNldERlc2MoJ0RlZmF1bHQ6IGdwdC00by1taW5pJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0VmFsdWUocy5vcGVuYWlNb2RlbClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgb3BlbmFpTW9kZWw6IHYudHJpbSgpIHx8ICdncHQtNG8tbWluaScgfSk7IH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdJbmNsdWRlIHRyYW5zY3JpcHQgd2l0aCBwb3N0cHJvY2Vzc2VkIG1lc3NhZ2UnKVxuICAgICAgLnNldERlc2MoJ1ByZXBlbmRzIHRoZSByYXcgdHJhbnNjcmlwdCBxdW90ZWQgd2l0aCBcIj5cIiB3aGVuIHBvc3Rwcm9jZXNzaW5nIHN1Y2NlZWRzLicpXG4gICAgICAuYWRkVG9nZ2xlKHQgPT4gdFxuICAgICAgICAuc2V0VmFsdWUocy5pbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBpbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkOiB2IH0pOyB9KSk7XG5cbiAgICAvLyBQcmVzZXRzXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2g0JywgeyB0ZXh0OiAnUHJvbXB0IHByZXNldHMnIH0pO1xuXG4gICAgY29uc3QgbGlzdEVsID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KCk7XG4gICAgY29uc3QgcmVuZGVyUHJlc2V0cyA9ICgpID0+IHtcbiAgICAgIGxpc3RFbC5lbXB0eSgpO1xuICAgICAgY29uc3Qgc3QgPSB0aGlzLmdldFNldHRpbmdzKCk7XG4gICAgICBzdC5wcm9tcHRQcmVzZXRzLmZvckVhY2goKHApID0+IHtcbiAgICAgICAgY29uc3Qgd3JhcCA9IGxpc3RFbC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1wcmVzZXQnIH0pO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKHAubmFtZSlcbiAgICAgICAgICAuc2V0RGVzYygnU3lzdGVtIHByb21wdCArIHRlbXBlcmF0dXJlJylcbiAgICAgICAgICAuYWRkQnV0dG9uKGIgPT4gYi5zZXRCdXR0b25UZXh0KCdTZXQgRGVmYXVsdCcpLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBkZWZhdWx0UHJvbXB0SWQ6IHAuaWQgfSk7XG4gICAgICAgICAgICByZW5kZXJQcmVzZXRzKCk7XG4gICAgICAgICAgfSkpXG4gICAgICAgICAgLmFkZEJ1dHRvbihiID0+IGIuc2V0QnV0dG9uVGV4dCgnRGVsZXRlJykub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IHN0LnByb21wdFByZXNldHMuZmlsdGVyKHggPT4geC5pZCAhPT0gcC5pZCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IGZpbHRlcmVkIH0pO1xuICAgICAgICAgICAgcmVuZGVyUHJlc2V0cygpO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnTmFtZScpXG4gICAgICAgICAgLmFkZFRleHQodCA9PiB0LnNldFZhbHVlKHAubmFtZSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgIHAubmFtZSA9IHY7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ1N5c3RlbSBwcm9tcHQnKVxuICAgICAgICAgIC5zZXREZXNjKCdTdXBwb3J0cyB7e3NlbGVjdGlvbn19IHBsYWNlaG9sZGVyOyB3aGVuIGFic2VudCwgY3VycmVudCBzZWxlY3Rpb24gaXMgcHJlcGVuZGVkIGFzIGNvbnRleHQuJylcbiAgICAgICAgICAuYWRkVGV4dEFyZWEodCA9PiB0LnNldFZhbHVlKHAuc3lzdGVtKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgcC5zeXN0ZW0gPSB2OyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IHN0LnByb21wdFByZXNldHMgfSk7XG4gICAgICAgICAgfSkpO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKCdUZW1wZXJhdHVyZScpXG4gICAgICAgICAgLmFkZFRleHQodCA9PiB0LnNldFZhbHVlKFN0cmluZyhwLnRlbXBlcmF0dXJlKSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG51bSA9IE51bWJlcih2KTsgcC50ZW1wZXJhdHVyZSA9IGlzRmluaXRlKG51bSkgPyBudW0gOiAwLjI7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ01vZGVsIG92ZXJyaWRlIChvcHRpb25hbCknKVxuICAgICAgICAgIC5hZGRUZXh0KHQgPT4gdC5zZXRQbGFjZWhvbGRlcignZS5nLiwgZ3B0LTRvLW1pbmknKS5zZXRWYWx1ZShwLm1vZGVsIHx8ICcnKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgcC5tb2RlbCA9IHYudHJpbSgpIHx8IHVuZGVmaW5lZDsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgaWYgKHN0LmRlZmF1bHRQcm9tcHRJZCA9PT0gcC5pZCkgd3JhcC5jcmVhdGVEaXYoeyB0ZXh0OiAnRGVmYXVsdCBwcmVzZXQnLCBjbHM6ICdhaS1wcmVzZXQtZGVmYXVsdCcgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyUHJlc2V0cygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQWRkIHByZXNldCcpXG4gICAgICAuYWRkQnV0dG9uKGIgPT4gYi5zZXRCdXR0b25UZXh0KCdBZGQnKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3QgPSB0aGlzLmdldFNldHRpbmdzKCk7XG4gICAgICAgIGNvbnN0IGlkID0gYHByZXNldC0ke0RhdGUubm93KCl9YDtcbiAgICAgICAgY29uc3QgcHJlc2V0OiBQcm9tcHRQcmVzZXQgPSB7IGlkLCBuYW1lOiAnTmV3IFByZXNldCcsIHN5c3RlbTogJ0VkaXQgbWVcdTIwMjYnLCB0ZW1wZXJhdHVyZTogMC4yIH07XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogWy4uLnN0LnByb21wdFByZXNldHMsIHByZXNldF0gfSk7XG4gICAgICAgIHJlbmRlclByZXNldHMoKTtcbiAgICAgIH0pKTtcblxuICAgIC8vIFJlY29yZGluZyBiZWhhdmlvclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1JlY29yZGluZyAmIEluc2VydGlvbicgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnU2hvdyByZWNvcmRpbmcgbW9kYWwnKVxuICAgICAgLmFkZFRvZ2dsZSh0ID0+IHQuc2V0VmFsdWUocy5zaG93TW9kYWxXaGlsZVJlY29yZGluZykub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBzaG93TW9kYWxXaGlsZVJlY29yZGluZzogdiB9KTtcbiAgICAgIH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdNYXggZHVyYXRpb24gKHNlY29uZHMpJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdC5zZXRWYWx1ZShTdHJpbmcocy5tYXhEdXJhdGlvblNlYykpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgIGNvbnN0IG4gPSBOdW1iZXIodik7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgbWF4RHVyYXRpb25TZWM6IGlzRmluaXRlKG4pICYmIG4gPiAwID8gTWF0aC5mbG9vcihuKSA6IDkwMCB9KTtcbiAgICAgIH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdJbnNlcnQgbW9kZScpXG4gICAgICAuc2V0RGVzYygnSW5zZXJ0IGF0IGN1cnNvciBvciByZXBsYWNlIHNlbGVjdGlvbicpXG4gICAgICAuYWRkRHJvcGRvd24oZCA9PiBkXG4gICAgICAgIC5hZGRPcHRpb24oJ2luc2VydCcsICdJbnNlcnQgYXQgY3Vyc29yJylcbiAgICAgICAgLmFkZE9wdGlvbigncmVwbGFjZScsICdSZXBsYWNlIHNlbGVjdGlvbicpXG4gICAgICAgIC5zZXRWYWx1ZShzLmluc2VydE1vZGUpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IGluc2VydE1vZGU6IHYgYXMgYW55IH0pOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQWRkIG5ld2xpbmUgYmVmb3JlJylcbiAgICAgIC5hZGRUb2dnbGUodCA9PiB0LnNldFZhbHVlKHMuYWRkTmV3bGluZUJlZm9yZSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBhZGROZXdsaW5lQmVmb3JlOiB2IH0pOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQWRkIG5ld2xpbmUgYWZ0ZXInKVxuICAgICAgLmFkZFRvZ2dsZSh0ID0+IHQuc2V0VmFsdWUocy5hZGROZXdsaW5lQWZ0ZXIpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgYWRkTmV3bGluZUFmdGVyOiB2IH0pOyB9KSk7XG4gIH1cbn1cbiIsICJleHBvcnQgY2xhc3MgQXVkaW9SZWNvcmRlciB7XG4gIHByaXZhdGUgbWVkaWFSZWNvcmRlcj86IE1lZGlhUmVjb3JkZXI7XG4gIHByaXZhdGUgY2h1bmtzOiBCbG9iUGFydFtdID0gW107XG4gIHByaXZhdGUgc3RyZWFtPzogTWVkaWFTdHJlYW07XG4gIHByaXZhdGUgc3RhcnRlZEF0ID0gMDtcbiAgcHJpdmF0ZSB0aW1lcj86IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9uVGljaz86IChlbGFwc2VkTXM6IG51bWJlcikgPT4gdm9pZCkge31cblxuICBhc3luYyBzdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5tZWRpYVJlY29yZGVyICYmIHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSA9PT0gJ3JlY29yZGluZycpIHJldHVybjtcbiAgICB0aGlzLmNodW5rcyA9IFtdO1xuICAgIHRoaXMuc3RyZWFtID0gYXdhaXQgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoeyBhdWRpbzogdHJ1ZSB9KTtcbiAgICBjb25zdCBtaW1lQ2FuZGlkYXRlcyA9IFtcbiAgICAgICdhdWRpby93ZWJtO2NvZGVjcz1vcHVzJyxcbiAgICAgICdhdWRpby93ZWJtJyxcbiAgICAgICdhdWRpby9vZ2c7Y29kZWNzPW9wdXMnLFxuICAgICAgJydcbiAgICBdO1xuICAgIGxldCBtaW1lVHlwZSA9ICcnO1xuICAgIGZvciAoY29uc3QgY2FuZCBvZiBtaW1lQ2FuZGlkYXRlcykge1xuICAgICAgaWYgKCFjYW5kIHx8ICh3aW5kb3cgYXMgYW55KS5NZWRpYVJlY29yZGVyPy5pc1R5cGVTdXBwb3J0ZWQ/LihjYW5kKSkgeyBtaW1lVHlwZSA9IGNhbmQ7IGJyZWFrOyB9XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy5tZWRpYVJlY29yZGVyID0gbmV3IE1lZGlhUmVjb3JkZXIodGhpcy5zdHJlYW0sIG1pbWVUeXBlID8geyBtaW1lVHlwZSB9IDogdW5kZWZpbmVkKTtcbiAgICB0aGlzLm1lZGlhUmVjb3JkZXIub25kYXRhYXZhaWxhYmxlID0gKGU6IEJsb2JFdmVudCkgPT4geyBpZiAoZS5kYXRhPy5zaXplKSB0aGlzLmNodW5rcy5wdXNoKGUuZGF0YSk7IH07XG4gICAgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXJ0KDI1MCk7IC8vIHNtYWxsIGNodW5rc1xuICAgIHRoaXMuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICBpZiAodGhpcy5vblRpY2spIHRoaXMudGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5vblRpY2shKERhdGUubm93KCkgLSB0aGlzLnN0YXJ0ZWRBdCksIDIwMCk7XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZWRpYVJlY29yZGVyICYmIHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSA9PT0gJ3JlY29yZGluZycgJiYgdHlwZW9mIHRoaXMubWVkaWFSZWNvcmRlci5wYXVzZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5tZWRpYVJlY29yZGVyLnBhdXNlKCk7XG4gICAgfVxuICB9XG5cbiAgcmVzdW1lKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1lZGlhUmVjb3JkZXIgJiYgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXRlID09PSAncGF1c2VkJyAmJiB0eXBlb2YgdGhpcy5tZWRpYVJlY29yZGVyLnJlc3VtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5tZWRpYVJlY29yZGVyLnJlc3VtZSgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN0b3AoKTogUHJvbWlzZTxCbG9iPiB7XG4gICAgY29uc3QgcmVjID0gdGhpcy5tZWRpYVJlY29yZGVyO1xuICAgIGlmICghcmVjKSB0aHJvdyBuZXcgRXJyb3IoJ1JlY29yZGVyIG5vdCBzdGFydGVkJyk7XG4gICAgY29uc3Qgc3RvcFByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgcmVjLm9uc3RvcCA9ICgpID0+IHJlc29sdmUoKTtcbiAgICB9KTtcbiAgICBpZiAocmVjLnN0YXRlICE9PSAnaW5hY3RpdmUnKSByZWMuc3RvcCgpO1xuICAgIGF3YWl0IHN0b3BQcm9taXNlO1xuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYih0aGlzLmNodW5rcywgeyB0eXBlOiB0aGlzLmNodW5rcy5sZW5ndGggPyAodGhpcy5jaHVua3NbMF0gYXMgYW55KS50eXBlIHx8ICdhdWRpby93ZWJtJyA6ICdhdWRpby93ZWJtJyB9KTtcbiAgICB0aGlzLmNsZWFudXAoKTtcbiAgICByZXR1cm4gYmxvYjtcbiAgfVxuXG4gIGRpc2NhcmQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVkaWFSZWNvcmRlciAmJiB0aGlzLm1lZGlhUmVjb3JkZXIuc3RhdGUgIT09ICdpbmFjdGl2ZScpIHRoaXMubWVkaWFSZWNvcmRlci5zdG9wKCk7XG4gICAgdGhpcy5jbGVhbnVwKCk7XG4gIH1cblxuICBwcml2YXRlIGNsZWFudXAoKSB7XG4gICAgaWYgKHRoaXMudGltZXIpIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuICAgIHRoaXMudGltZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5tZWRpYVJlY29yZGVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc3RhcnRlZEF0ID0gMDtcbiAgICBpZiAodGhpcy5zdHJlYW0pIHtcbiAgICAgIHRoaXMuc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2godCA9PiB0LnN0b3AoKSk7XG4gICAgICB0aGlzLnN0cmVhbSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5jaHVua3MgPSBbXTtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIFByb21wdFByZXNldCB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9zdHByb2Nlc3NXaXRoT3BlbkFJKFxuICByYXc6IHN0cmluZyxcbiAgc2V0dGluZ3M6IEFJVHJhbnNjcmlwdFNldHRpbmdzLFxuICBwcmVzZXQ/OiBQcm9tcHRQcmVzZXQsXG4gIHNlbGVjdGlvbj86IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghc2V0dGluZ3Mub3BlbmFpQXBpS2V5KSByZXR1cm4gcmF3OyAvLyBzaWxlbnRseSBza2lwIGlmIG1pc3NpbmdcbiAgY29uc3QgbW9kZWwgPSBwcmVzZXQ/Lm1vZGVsIHx8IHNldHRpbmdzLm9wZW5haU1vZGVsIHx8ICdncHQtNG8tbWluaSc7XG4gIGNvbnN0IHRlbXBlcmF0dXJlID0gY2xhbXAoKHByZXNldD8udGVtcGVyYXR1cmUgPz8gMC4yKSwgMCwgMSk7XG4gIGxldCBzeXN0ZW0gPSBwcmVzZXQ/LnN5c3RlbSB8fCAnWW91IGNsZWFuIHVwIHNwb2tlbiB0ZXh0LiBGaXggY2FwaXRhbGl6YXRpb24gYW5kIHB1bmN0dWF0aW9uLCByZW1vdmUgZmlsbGVyIHdvcmRzLCBwcmVzZXJ2ZSBtZWFuaW5nLiBEbyBub3QgYWRkIGNvbnRlbnQuJztcblxuICBjb25zdCBzZWwgPSAoc2VsZWN0aW9uIHx8ICcnKS50cmltKCk7XG4gIC8vIFByZXBhcmUgdXNlciBjb250ZW50OyBvcHRpb25hbGx5IHByZXBlbmQgY29udGV4dCBpZiB7e3NlbGVjdGlvbn19IHBsYWNlaG9sZGVyIGlzIG5vdCB1c2VkIGluIHN5c3RlbVxuICBsZXQgdXNlckNvbnRlbnQgPSByYXc7XG4gIGlmIChzZWwpIHtcbiAgICBpZiAoc3lzdGVtLmluY2x1ZGVzKCd7e3NlbGVjdGlvbn19JykpIHtcbiAgICAgIHN5c3RlbSA9IHN5c3RlbS5zcGxpdCgne3tzZWxlY3Rpb259fScpLmpvaW4oc2VsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY29udGV4dEJsb2NrID0gYENvbnRleHQgKHNlbGVjdGVkIHRleHQpOlxcbi0tLVxcbiR7c2VsfVxcbi0tLVxcblxcbmA7XG4gICAgICB1c2VyQ29udGVudCA9IGNvbnRleHRCbG9jayArIHJhdztcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtzZXR0aW5ncy5vcGVuYWlBcGlLZXl9YCxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBtb2RlbCxcbiAgICAgIHRlbXBlcmF0dXJlLFxuICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3lzdGVtIH0sXG4gICAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyQ29udGVudCB9LFxuICAgICAgXSxcbiAgICB9KSxcbiAgfSk7XG4gIGlmICghcmVzcC5vaykge1xuICAgIC8vIElmIE9wZW5BSSBmYWlscywgcmV0dXJuIHJhdyByYXRoZXIgdGhhbiBicmVha2luZyBpbnNlcnRpb25cbiAgICB0cnkgeyBjb25zb2xlLndhcm4oJ09wZW5BSSBwb3N0cHJvY2VzcyBmYWlsZWQnLCByZXNwLnN0YXR1cywgYXdhaXQgcmVzcC50ZXh0KCkpOyB9IGNhdGNoIHt9XG4gICAgcmV0dXJuIHJhdztcbiAgfVxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gIGNvbnN0IGNsZWFuZWQgPSBkYXRhPy5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQ7XG4gIHJldHVybiB0eXBlb2YgY2xlYW5lZCA9PT0gJ3N0cmluZycgJiYgY2xlYW5lZC50cmltKCkgPyBjbGVhbmVkIDogcmF3O1xufVxuXG5mdW5jdGlvbiBjbGFtcChuOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikgeyByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIG4pKTsgfVxuIiwgImltcG9ydCB0eXBlIHsgQUlUcmFuc2NyaXB0U2V0dGluZ3MgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRyYW5zY3JpYmVXaXRoR3JvcShibG9iOiBCbG9iLCBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MpOiBQcm9taXNlPHN0cmluZz4ge1xuICBpZiAoIXNldHRpbmdzLmdyb3FBcGlLZXkpIHRocm93IG5ldyBFcnJvcignR3JvcSBBUEkga2V5IGlzIG1pc3NpbmcgaW4gc2V0dGluZ3MuJyk7XG4gIGNvbnN0IGZkID0gbmV3IEZvcm1EYXRhKCk7XG4gIGZkLmFwcGVuZCgnZmlsZScsIG5ldyBGaWxlKFtibG9iXSwgJ2F1ZGlvLndlYm0nLCB7IHR5cGU6IGJsb2IudHlwZSB8fCAnYXVkaW8vd2VibScgfSkpO1xuICBmZC5hcHBlbmQoJ21vZGVsJywgc2V0dGluZ3MuZ3JvcU1vZGVsIHx8ICd3aGlzcGVyLWxhcmdlLXYzJyk7XG4gIGlmIChzZXR0aW5ncy5sYW5ndWFnZSkgZmQuYXBwZW5kKCdsYW5ndWFnZScsIHNldHRpbmdzLmxhbmd1YWdlKTtcblxuICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLmdyb3EuY29tL29wZW5haS92MS9hdWRpby90cmFuc2NyaXB0aW9ucycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3NldHRpbmdzLmdyb3FBcGlLZXl9YCB9LFxuICAgIGJvZHk6IGZkLFxuICB9KTtcbiAgaWYgKCFyZXNwLm9rKSB7XG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IHNhZmVUZXh0KHJlc3ApO1xuICAgIHRocm93IG5ldyBFcnJvcihgR3JvcSB0cmFuc2NyaXB0aW9uIGZhaWxlZCAoJHtyZXNwLnN0YXR1c30pOiAke3RleHR9YCk7XG4gIH1cbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpO1xuICBpZiAodHlwZW9mIGRhdGE/LnRleHQgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ0dyb3EgcmVzcG9uc2UgbWlzc2luZyB0ZXh0Jyk7XG4gIHJldHVybiBkYXRhLnRleHQgYXMgc3RyaW5nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYWZlVGV4dChyZXNwOiBSZXNwb25zZSkge1xuICB0cnkgeyByZXR1cm4gYXdhaXQgcmVzcC50ZXh0KCk7IH0gY2F0Y2ggeyByZXR1cm4gJzxuby1ib2R5Pic7IH1cbn1cblxuIiwgImV4cG9ydCB0eXBlIEluc2VydE1vZGUgPSAnaW5zZXJ0JyB8ICdyZXBsYWNlJztcblxuZXhwb3J0IGludGVyZmFjZSBQcm9tcHRQcmVzZXQge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHN5c3RlbTogc3RyaW5nO1xuICB0ZW1wZXJhdHVyZTogbnVtYmVyO1xuICBtb2RlbD86IHN0cmluZzsgLy8gb3B0aW9uYWwgT3BlbkFJIG1vZGVsIG92ZXJyaWRlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQUlUcmFuc2NyaXB0U2V0dGluZ3Mge1xuICBncm9xQXBpS2V5OiBzdHJpbmc7XG4gIGdyb3FNb2RlbDogc3RyaW5nOyAvLyBlLmcuLCAnd2hpc3Blci1sYXJnZS12MydcbiAgbGFuZ3VhZ2U/OiBzdHJpbmc7IC8vIElTTyBjb2RlLCBvcHRpb25hbFxuXG4gIG9wZW5haUFwaUtleT86IHN0cmluZztcbiAgb3BlbmFpTW9kZWw6IHN0cmluZzsgLy8gZS5nLiwgJ2dwdC00by1taW5pJ1xuXG4gIHByb21wdFByZXNldHM6IFByb21wdFByZXNldFtdO1xuICBkZWZhdWx0UHJvbXB0SWQ/OiBzdHJpbmc7XG4gIGxhc3RVc2VkUHJvbXB0SWQ/OiBzdHJpbmc7XG5cbiAgc2hvd01vZGFsV2hpbGVSZWNvcmRpbmc6IGJvb2xlYW47XG4gIG1heER1cmF0aW9uU2VjOiBudW1iZXI7XG4gIGluc2VydE1vZGU6IEluc2VydE1vZGU7XG4gIGFkZE5ld2xpbmVCZWZvcmU6IGJvb2xlYW47XG4gIGFkZE5ld2xpbmVBZnRlcjogYm9vbGVhbjtcbiAgaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJFU0VUOiBQcm9tcHRQcmVzZXQgPSB7XG4gIGlkOiAncG9saXNoZWQnLFxuICBuYW1lOiAnUG9saXNoZWQnLFxuICBzeXN0ZW06XG4gICAgJ1lvdSBjbGVhbiB1cCBzcG9rZW4gdGV4dC4gRml4IGNhcGl0YWxpemF0aW9uIGFuZCBwdW5jdHVhdGlvbiwgcmVtb3ZlIGZpbGxlciB3b3JkcywgcHJlc2VydmUgbWVhbmluZy4gRG8gbm90IGFkZCBjb250ZW50LicsXG4gIHRlbXBlcmF0dXJlOiAwLjIsXG59O1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQUlUcmFuc2NyaXB0U2V0dGluZ3MgPSB7XG4gIGdyb3FBcGlLZXk6ICcnLFxuICBncm9xTW9kZWw6ICd3aGlzcGVyLWxhcmdlLXYzJyxcbiAgbGFuZ3VhZ2U6IHVuZGVmaW5lZCxcblxuICBvcGVuYWlBcGlLZXk6ICcnLFxuICBvcGVuYWlNb2RlbDogJ2dwdC00by1taW5pJyxcblxuICBwcm9tcHRQcmVzZXRzOiBbREVGQVVMVF9QUkVTRVRdLFxuICBkZWZhdWx0UHJvbXB0SWQ6ICdwb2xpc2hlZCcsXG4gIGxhc3RVc2VkUHJvbXB0SWQ6ICdwb2xpc2hlZCcsXG5cbiAgc2hvd01vZGFsV2hpbGVSZWNvcmRpbmc6IHRydWUsXG4gIG1heER1cmF0aW9uU2VjOiA5MDAsXG4gIGluc2VydE1vZGU6ICdpbnNlcnQnLFxuICBhZGROZXdsaW5lQmVmb3JlOiBmYWxzZSxcbiAgYWRkTmV3bGluZUFmdGVyOiB0cnVlLFxuICBpbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkOiBmYWxzZSxcbn07XG4iLCAiaW1wb3J0IHsgQXBwLCBNb2RhbCwgU2V0dGluZywgRHJvcGRvd25Db21wb25lbnQgfSBmcm9tICdvYnNpZGlhbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlY29yZGluZ01vZGFsT3B0aW9ucyB7XG4gIHByZXNldHM6IHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH1bXTtcbiAgZGVmYXVsdFByZXNldElkPzogc3RyaW5nO1xuICBtYXhEdXJhdGlvblNlYzogbnVtYmVyO1xuICBvblN0YXJ0PzogKCkgPT4gdm9pZDtcbiAgb25TdG9wOiAoYXBwbHlQb3N0OiBib29sZWFuLCBwcmVzZXRJZD86IHN0cmluZykgPT4gdm9pZDtcbiAgb25EaXNjYXJkOiAoKSA9PiB2b2lkO1xuICBvblBhdXNlPzogKCkgPT4gdm9pZDtcbiAgb25SZXN1bWU/OiAoKSA9PiB2b2lkO1xuICBvbkNsb3NlPzogKCkgPT4gdm9pZDtcbn1cblxyXG5leHBvcnQgY2xhc3MgUmVjb3JkaW5nTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XHJcbiAgcHJpdmF0ZSByb290RWw/OiBIVE1MRGl2RWxlbWVudDtcclxuICBwcml2YXRlIGVsYXBzZWRFbD86IEhUTUxFbGVtZW50O1xyXG4gIHByaXZhdGUgdGltZXI/OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBzdGFydGVkQXQgPSAwO1xyXG4gIHByaXZhdGUgcHJlc2V0RHJvcGRvd24/OiBEcm9wZG93bkNvbXBvbmVudDtcclxuICBwcml2YXRlIHBhdXNlQnRuRWw/OiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBwcml2YXRlIHRyYW5zY3JpYmVCdG5FbD86IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gIHByaXZhdGUgcG9zdHByb2Nlc3NCdG5FbD86IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gIHByaXZhdGUgc3RhdHVzVGV4dEVsPzogSFRNTEVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBkaXNjYXJkQnRuRWw/OiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBwcml2YXRlIGlzUGF1c2VkID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBwYXVzZVN0YXJ0ZWRBdCA9IDA7XHJcbiAgcHJpdmF0ZSBhY2N1bXVsYXRlZFBhdXNlTXMgPSAwO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvcHRzOiBSZWNvcmRpbmdNb2RhbE9wdGlvbnMpIHtcclxuICAgIHN1cGVyKGFwcCk7XHJcbiAgfVxyXG5cclxuICBvbk9wZW4oKTogdm9pZCB7XHJcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xyXG5cclxuICAgIHRoaXMubW9kYWxFbC5hZGRDbGFzcygndm94aWRpYW4tbW9kYWwnKTtcclxuXHJcbiAgICB0aGlzLnJvb3RFbCA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1yb290JyB9KTtcclxuICAgIHRoaXMucm9vdEVsLnNldEF0dHJpYnV0ZSgnZGF0YS1waGFzZScsICdyZWNvcmRpbmcnKTtcclxuXHJcbiAgICBjb25zdCBoZWFkZXIgPSB0aGlzLnJvb3RFbC5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1oZWFkZXInIH0pO1xyXG4gICAgaGVhZGVyLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1ZveGlkaWFuJyB9KTtcclxuICAgIGNvbnN0IGhlYWRlclJpZ2h0ID0gaGVhZGVyLmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLWhlYWRlci1yaWdodCcgfSk7XHJcbiAgICBoZWFkZXJSaWdodC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1yZWMtaW5kaWNhdG9yJywgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICdSZWNvcmRpbmcgaW5kaWNhdG9yJyB9IH0pO1xyXG4gICAgdGhpcy5lbGFwc2VkRWwgPSBoZWFkZXJSaWdodC5jcmVhdGVEaXYoeyB0ZXh0OiAnMDA6MDAnLCBjbHM6ICd2b3hpZGlhbi10aW1lcicgfSk7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwgPSBoZWFkZXJSaWdodC5jcmVhdGVFbCgnYnV0dG9uJywge1xyXG4gICAgICB0ZXh0OiAnXHUyNzVBXHUyNzVBJyxcclxuICAgICAgdHlwZTogJ2J1dHRvbicsXHJcbiAgICAgIGNsczogJ3ZveGlkaWFuLXBhdXNlJyxcclxuICAgICAgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICdQYXVzZSByZWNvcmRpbmcnLCAnYXJpYS1wcmVzc2VkJzogJ2ZhbHNlJyB9LFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnRvZ2dsZVBhdXNlKCkpO1xyXG4gICAgdGhpcy5yZXNldFBhdXNlU3RhdGUoKTtcclxuXHJcbiAgICBjb25zdCBib2R5ID0gdGhpcy5yb290RWwuY3JlYXRlRGl2KHsgY2xzOiAndm94aWRpYW4tYm9keScgfSk7XHJcblxyXG4gICAgLy8gUHJlc2V0IHNlbGVjdGlvblxyXG4gICAgbmV3IFNldHRpbmcoYm9keSlcclxuICAgICAgLnNldE5hbWUoJ1Bvc3Rwcm9jZXNzaW5nIHByZXNldCcpXHJcbiAgICAgIC5hZGREcm9wZG93bihkID0+IHtcclxuICAgICAgICB0aGlzLnByZXNldERyb3Bkb3duID0gZDtcclxuICAgICAgICBmb3IgKGNvbnN0IHAgb2YgdGhpcy5vcHRzLnByZXNldHMpIGQuYWRkT3B0aW9uKHAuaWQsIHAubmFtZSk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5kZWZhdWx0UHJlc2V0SWQpIGQuc2V0VmFsdWUodGhpcy5vcHRzLmRlZmF1bHRQcmVzZXRJZCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGJ0bnMgPSBib2R5LmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLWJ1dHRvbnMnIH0pO1xyXG4gICAgdGhpcy50cmFuc2NyaWJlQnRuRWwgPSBidG5zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdUcmFuc2NyaWJlJywgdHlwZTogJ2J1dHRvbicgfSk7XHJcbiAgICB0aGlzLnBvc3Rwcm9jZXNzQnRuRWwgPSBidG5zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdQb3N0UHJvY2VzcycsIHR5cGU6ICdidXR0b24nIH0pO1xyXG4gICAgdGhpcy5kaXNjYXJkQnRuRWwgPSBidG5zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdEaXNjYXJkJywgdHlwZTogJ2J1dHRvbicgfSk7XHJcbiAgICB0aGlzLnRyYW5zY3JpYmVCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudHJpZ2dlclN0b3AoZmFsc2UpKTtcclxuICAgIHRoaXMucG9zdHByb2Nlc3NCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudHJpZ2dlclN0b3AodHJ1ZSkpO1xyXG4gICAgdGhpcy5kaXNjYXJkQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm9wdHMub25EaXNjYXJkKCkpO1xyXG5cclxuICAgIGNvbnN0IHN0YXR1c0JhciA9IHRoaXMucm9vdEVsLmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLXN0YXR1c2JhcicgfSk7XHJcbiAgICBjb25zdCBzdGF0dXNXcmFwID0gc3RhdHVzQmFyLmNyZWF0ZURpdih7IGNsczogJ2FpLXN0YXR1cy13cmFwJyB9KTtcclxuICAgIHN0YXR1c1dyYXAuY3JlYXRlRGl2KHsgY2xzOiAnYWktc3Bpbm5lcicsIGF0dHI6IHsgJ2FyaWEtbGFiZWwnOiAnV29ya2luZ1x1MjAyNicgfSB9KTtcclxuICAgIHRoaXMuc3RhdHVzVGV4dEVsID0gc3RhdHVzV3JhcC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1zdGF0dXMtdGV4dCcsIHRleHQ6ICdMaXN0ZW5pbmdcdTIwMjYnIH0pO1xyXG5cclxuICAgIHRoaXMubW9kYWxFbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgdGhpcy5vcHRzLm9uRGlzY2FyZCgpO1xyXG4gICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyU3RvcChmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFN0YXJ0IHRpbWVyXHJcbiAgICB0aGlzLnN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XHJcbiAgICB0aGlzLnRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHRoaXMudGljaygpLCAyMDApO1xyXG4gICAgdGhpcy5vcHRzLm9uU3RhcnQ/LigpO1xyXG4gIH1cblxuICBvbkNsb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnRpbWVyKSB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcbiAgICB0aGlzLnRpbWVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gICAgdGhpcy5vcHRzLm9uQ2xvc2U/LigpO1xuICB9XG5cclxuICBwcml2YXRlIHRpY2soKTogdm9pZCB7XHJcbiAgICBjb25zdCBlbGFwc2VkTXMgPSB0aGlzLmdldEVsYXBzZWRNcygpO1xyXG4gICAgY29uc3Qgc2VjID0gTWF0aC5mbG9vcihlbGFwc2VkTXMgLyAxMDAwKTtcclxuICAgIGNvbnN0IG1tID0gTWF0aC5mbG9vcihzZWMgLyA2MCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xyXG4gICAgY29uc3Qgc3MgPSAoc2VjICUgNjApLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcclxuICAgIGlmICh0aGlzLmVsYXBzZWRFbCkgdGhpcy5lbGFwc2VkRWwudGV4dENvbnRlbnQgPSBgJHttbX06JHtzc31gO1xyXG4gICAgaWYgKHRoaXMub3B0cy5tYXhEdXJhdGlvblNlYyA+IDAgJiYgIXRoaXMuaXNQYXVzZWQgJiYgc2VjID49IHRoaXMub3B0cy5tYXhEdXJhdGlvblNlYykge1xyXG4gICAgICB0aGlzLnRyaWdnZXJTdG9wKGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RWxhcHNlZE1zKCk6IG51bWJlciB7XHJcbiAgICBpZiAoIXRoaXMuc3RhcnRlZEF0KSByZXR1cm4gMDtcclxuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuc3RhcnRlZEF0IC0gdGhpcy5hY2N1bXVsYXRlZFBhdXNlTXM7XHJcbiAgICBpZiAodGhpcy5pc1BhdXNlZCAmJiB0aGlzLnBhdXNlU3RhcnRlZEF0KSB7XHJcbiAgICAgIGVsYXBzZWQgLT0gbm93IC0gdGhpcy5wYXVzZVN0YXJ0ZWRBdDtcclxuICAgIH1cclxuICAgIHJldHVybiBNYXRoLm1heCgwLCBlbGFwc2VkKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdHJpZ2dlclN0b3AoYXBwbHlQb3N0OiBib29sZWFuKSB7XHJcbiAgICB0aGlzLmZpbmFsaXplUGF1c2VTdGF0ZSgpO1xyXG4gICAgY29uc3QgcHJlc2V0SWQgPSB0aGlzLnByZXNldERyb3Bkb3duPy5nZXRWYWx1ZSgpO1xyXG4gICAgdGhpcy5vcHRzLm9uU3RvcChhcHBseVBvc3QsIHByZXNldElkKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdG9nZ2xlUGF1c2UoKSB7XHJcbiAgICBpZiAodGhpcy5pc1BhdXNlZCkge1xyXG4gICAgICB0aGlzLnJlc3VtZVJlY29yZGluZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wYXVzZVJlY29yZGluZygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwYXVzZVJlY29yZGluZygpIHtcclxuICAgIGlmICh0aGlzLmlzUGF1c2VkKSByZXR1cm47XHJcbiAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcclxuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSBEYXRlLm5vdygpO1xyXG4gICAgdGhpcy51cGRhdGVQYXVzZUJ1dHRvbkxhYmVsKCk7XHJcbiAgICB0aGlzLm9wdHMub25QYXVzZT8uKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc3VtZVJlY29yZGluZygpIHtcclxuICAgIGlmICghdGhpcy5pc1BhdXNlZCkgcmV0dXJuO1xyXG4gICAgaWYgKHRoaXMucGF1c2VTdGFydGVkQXQpIHRoaXMuYWNjdW11bGF0ZWRQYXVzZU1zICs9IERhdGUubm93KCkgLSB0aGlzLnBhdXNlU3RhcnRlZEF0O1xyXG4gICAgdGhpcy5wYXVzZVN0YXJ0ZWRBdCA9IDA7XHJcbiAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLnVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKTtcclxuICAgIHRoaXMub3B0cy5vblJlc3VtZT8uKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGZpbmFsaXplUGF1c2VTdGF0ZSgpIHtcclxuICAgIGlmICh0aGlzLmlzUGF1c2VkICYmIHRoaXMucGF1c2VTdGFydGVkQXQpIHtcclxuICAgICAgdGhpcy5hY2N1bXVsYXRlZFBhdXNlTXMgKz0gRGF0ZS5ub3coKSAtIHRoaXMucGF1c2VTdGFydGVkQXQ7XHJcbiAgICB9XHJcbiAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLnBhdXNlU3RhcnRlZEF0ID0gMDtcclxuICAgIHRoaXMudXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldFBhdXNlU3RhdGUoKSB7XHJcbiAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLnBhdXNlU3RhcnRlZEF0ID0gMDtcclxuICAgIHRoaXMuYWNjdW11bGF0ZWRQYXVzZU1zID0gMDtcclxuICAgIHRoaXMudXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVQYXVzZUJ1dHRvbkxhYmVsKCkge1xyXG4gICAgaWYgKCF0aGlzLnBhdXNlQnRuRWwpIHJldHVybjtcclxuICAgIHRoaXMucGF1c2VCdG5FbC5jbGFzc0xpc3QudG9nZ2xlKCdpcy1wYXVzZWQnLCB0aGlzLmlzUGF1c2VkKTtcclxuICAgIHRoaXMucGF1c2VCdG5FbC50ZXh0Q29udGVudCA9IHRoaXMuaXNQYXVzZWQgPyAnXHUyNUI2JyA6ICdcdTI3NUFcdTI3NUEnO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgdGhpcy5pc1BhdXNlZCA/ICd0cnVlJyA6ICdmYWxzZScpO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHRoaXMuaXNQYXVzZWQgPyAnUmVzdW1lIHJlY29yZGluZycgOiAnUGF1c2UgcmVjb3JkaW5nJyk7XHJcbiAgfVxyXG5cclxuICAvLyBQdWJsaWMgVUkgaGVscGVyc1xyXG4gIHNldFBoYXNlKHBoYXNlOiAncmVjb3JkaW5nJyB8ICd0cmFuc2NyaWJpbmcnIHwgJ3Bvc3Rwcm9jZXNzaW5nJyB8ICdkb25lJyB8ICdlcnJvcicpIHtcclxuICAgIHRoaXMucm9vdEVsPy5zZXRBdHRyaWJ1dGUoJ2RhdGEtcGhhc2UnLCBwaGFzZSk7XHJcbiAgICBpZiAocGhhc2UgIT09ICdyZWNvcmRpbmcnKSB7XHJcbiAgICAgIHRoaXMuZmluYWxpemVQYXVzZVN0YXRlKCk7XHJcbiAgICAgIGlmICh0aGlzLnRpbWVyKSB7IHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGltZXIpOyB0aGlzLnRpbWVyID0gdW5kZWZpbmVkOyB9XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5wYXVzZUJ0bkVsKSB0aGlzLnBhdXNlQnRuRWwuZGlzYWJsZWQgPSBwaGFzZSAhPT0gJ3JlY29yZGluZyc7XHJcbiAgfVxyXG5cclxuICBzZXRTdGF0dXModGV4dDogc3RyaW5nKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0dXNUZXh0RWwpIHRoaXMuc3RhdHVzVGV4dEVsLnRleHRDb250ZW50ID0gdGV4dDtcclxuICB9XHJcblxyXG4gIHNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKHRyYW5zY3JpYmVFbmFibGVkOiBib29sZWFuLCBwb3N0cHJvY2Vzc0VuYWJsZWQ6IGJvb2xlYW4sIGRpc2NhcmRFbmFibGVkOiBib29sZWFuKSB7XHJcbiAgICBpZiAodGhpcy50cmFuc2NyaWJlQnRuRWwpIHRoaXMudHJhbnNjcmliZUJ0bkVsLmRpc2FibGVkID0gIXRyYW5zY3JpYmVFbmFibGVkO1xyXG4gICAgaWYgKHRoaXMucG9zdHByb2Nlc3NCdG5FbCkgdGhpcy5wb3N0cHJvY2Vzc0J0bkVsLmRpc2FibGVkID0gIXBvc3Rwcm9jZXNzRW5hYmxlZDtcclxuICAgIGlmICh0aGlzLmRpc2NhcmRCdG5FbCkgdGhpcy5kaXNjYXJkQnRuRWwuZGlzYWJsZWQgPSAhZGlzY2FyZEVuYWJsZWQ7XHJcbiAgfVxyXG5cclxuICBzZXREaXNjYXJkTGFiZWwobGFiZWw6IHN0cmluZykge1xyXG4gICAgaWYgKHRoaXMuZGlzY2FyZEJ0bkVsKSB0aGlzLmRpc2NhcmRCdG5FbC50ZXh0Q29udGVudCA9IGxhYmVsO1xyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFBQSxtQkFBK0Q7OztBQ0EvRCxzQkFBdUQ7QUFHaEQsSUFBTSx5QkFBTixjQUFxQyxpQ0FBaUI7QUFBQSxFQUMzRCxZQUFZLEtBQVUsUUFBd0IsYUFBaUQsY0FBbUU7QUFDaEssVUFBTSxLQUFLLE1BQU07QUFEMkI7QUFBaUQ7QUFBQSxFQUUvRjtBQUFBLEVBRUEsVUFBZ0I7QUFDZCxVQUFNLEVBQUUsWUFBWSxJQUFJO0FBQ3hCLGdCQUFZLE1BQU07QUFDbEIsZ0JBQVksU0FBUyxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRCxVQUFNLElBQUksS0FBSyxZQUFZO0FBRzNCLGdCQUFZLFNBQVMsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELFFBQUks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
