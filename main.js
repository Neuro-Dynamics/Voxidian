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
    containerEl.createEl("h3", { text: "Prompt presets" });
    const listEl = containerEl.createDiv();
    const renderPresets = () => {
      listEl.empty();
      const st = this.getSettings();
      st.promptPresets.forEach((p) => {
        const wrap = listEl.createDiv({ cls: "ai-preset" });
        const header = wrap.createDiv({ cls: "ai-preset-header" });
        const title = header.createDiv({ cls: "ai-preset-title" });
        title.createEl("h4", { text: p.name, cls: "ai-preset-name" });
        if (st.defaultPromptId === p.id) title.createSpan({ text: "Default preset", cls: "ai-preset-default" });
        const actionsEl = header.createDiv({ cls: "ai-preset-actions" });
        new import_obsidian.ButtonComponent(actionsEl).setButtonText("Set as Default").onClick(async () => {
          await this.saveSettings({ defaultPromptId: p.id });
          renderPresets();
        });
        new import_obsidian.ButtonComponent(actionsEl).setButtonText("Delete").setWarning().onClick(async () => {
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
        wrap.createEl("br");
      });
    };
    renderPresets();
    containerEl.createEl("hr");
    new import_obsidian.Setting(containerEl).setName("Add preset").addButton((b) => b.setButtonText("Add").onClick(async () => {
      const st = this.getSettings();
      const id = `preset-${Date.now()}`;
      const preset = { id, name: "New Preset", system: "Edit me\u2026", temperature: 0.2, includeTranscriptWithPostprocessed: true };
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
  addNewlineAfter: true
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
          let preset;
          const blob = await this.recorder.stop();
          this.recorder = void 0;
          const raw = await transcribeWithGroq(blob, this.settings);
          let text = raw;
          if (applyPost) {
            preset = this.settings.promptPresets.find((p) => p.id === presetId);
            this.settings.lastUsedPromptId = preset?.id || presetId || this.settings.lastUsedPromptId;
            await this.saveData(this.settings);
            modal.setPhase("postprocessing");
            modal.setStatus("Cleaning transcript\u2026");
            const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
            const selection = activeView?.editor?.getSelection() || "";
            text = await postprocessWithOpenAI(raw, this.settings, preset, selection);
          }
          const finalOutput = this.combineTranscripts(raw, text, applyPost, preset);
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
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9yZWNvcmRlci50cyIsICJzcmMvcG9zdHByb2Nlc3MudHMiLCAic3JjL3RyYW5zY3JpYmUudHMiLCAic3JjL3R5cGVzLnRzIiwgInNyYy91aS9SZWNvcmRpbmdNb2RhbC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQXBwLCBNYXJrZG93blZpZXcsIFBsdWdpbiwgdHlwZSBFZGl0b3JQb3NpdGlvbiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEFJVHJhbnNjcmlwdFNldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IEF1ZGlvUmVjb3JkZXIgfSBmcm9tICcuL3JlY29yZGVyJztcbmltcG9ydCB7IHBvc3Rwcm9jZXNzV2l0aE9wZW5BSSB9IGZyb20gJy4vcG9zdHByb2Nlc3MnO1xuaW1wb3J0IHsgdHJhbnNjcmliZVdpdGhHcm9xIH0gZnJvbSAnLi90cmFuc2NyaWJlJztcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIHR5cGUgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIHR5cGUgUHJvbXB0UHJlc2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSZWNvcmRpbmdNb2RhbCB9IGZyb20gJy4vdWkvUmVjb3JkaW5nTW9kYWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBSVRyYW5zY3JpcHRQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MgPSB7IC4uLkRFRkFVTFRfU0VUVElOR1MsIHByb21wdFByZXNldHM6IFsuLi5ERUZBVUxUX1NFVFRJTkdTLnByb21wdFByZXNldHNdIH07XG4gIHByaXZhdGUgcmVjb3JkZXI/OiBBdWRpb1JlY29yZGVyO1xuICBwcml2YXRlIG1vZGFsPzogUmVjb3JkaW5nTW9kYWw7XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuXG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdtaWMnLCAnUmVjb3JkICYgVHJhbnNjcmliZScsICgpID0+IHRoaXMudG9nZ2xlUmVjb3JkaW5nKCkpO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAndm94aWRpYW4tc3RhcnQtc3RvcCcsXG4gICAgICBuYW1lOiAnU3RhcnQvU3RvcCBSZWNvcmRpbmcnLFxuICAgICAgaG90a2V5czogW3sgbW9kaWZpZXJzOiBbJ01vZCcsICdTaGlmdCddLCBrZXk6ICdNJyB9XSxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnRvZ2dsZVJlY29yZGluZygpLFxuICAgIH0pO1xuXG4gICAgLy8gTW9iaWxlIHRvb2xiYXIgYWN0aW9uOiBhcHBlYXJzIGluIE9ic2lkaWFuIE1vYmlsZSBlZGl0b3IgdG9vbGJhclxuICAgIC8vIFVzZXJzIGNhbiBhZGQgdGhpcyBjb21tYW5kIHRvIHRoZSBtb2JpbGUgdG9vbGJhciB2aWEgU2V0dGluZ3MgXHUyMTkyIE1vYmlsZSBcdTIxOTIgVG9vbGJhclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3JlY29yZC10cmFuc2NyaWJlLWluc2VydCcsXG4gICAgICBuYW1lOiAnUmVjb3JkIFx1MjAyMiBUcmFuc2NyaWJlIFx1MjAyMiBJbnNlcnQnLFxuICAgICAgaWNvbjogJ21pYycsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKCkgPT4gdGhpcy50b2dnbGVSZWNvcmRpbmcoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgQUlUcmFuc2NyaXB0U2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcywgKCkgPT4gdGhpcy5zZXR0aW5ncywgYXN5bmMgKHBhcnRpYWwpID0+IHtcbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5zZXR0aW5ncywgcGFydGlhbCk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICAgIH0pKTtcbiAgfVxuXG4gIG9udW5sb2FkKCkge1xuICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7IH1cbiAgICB0cnkgeyB0aGlzLm1vZGFsPy5jbG9zZSgpOyB9IGNhdGNoIHsgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyB0b2dnbGVSZWNvcmRpbmcoKSB7XG4gICAgLy8gSWYgbW9kYWwgaXMgb3Blbiwgc3RvcCBub3cgKHNpbXVsYXRlIGNsaWNraW5nIFN0b3ApXG4gICAgaWYgKHRoaXMubW9kYWwpIHtcbiAgICAgIC8vIG5vb3AgXHUyMDE0IHN0b3BwaW5nIGlzIGRyaXZlbiB2aWEgbW9kYWwgYnV0dG9uIHRvIHByZXNlcnZlIHByZXNldC9hcHBseSBzdGF0ZVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB3ZSBoYXZlIGFuIGVkaXRvciB0byBpbnNlcnQgaW50byBsYXRlciAobm90IHN0cmljdGx5IHJlcXVpcmVkIGJ1dCBoZWxwcyBVWClcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICBpZiAoIXZpZXcpIHJldHVybjsgLy8gTVZQOiByZXF1aXJlIGFjdGl2ZSBtYXJrZG93biB2aWV3XG5cbiAgICAvLyBQcmVwYXJlIHJlY29yZGVyIGFuZCBtb2RhbFxuICAgIHRoaXMucmVjb3JkZXIgPSBuZXcgQXVkaW9SZWNvcmRlcigpO1xuICAgIGNvbnN0IHByZXNldHMgPSB0aGlzLnNldHRpbmdzLnByb21wdFByZXNldHMubWFwKHAgPT4gKHsgaWQ6IHAuaWQsIG5hbWU6IHAubmFtZSB9KSk7XG4gICAgY29uc3QgbW9kYWwgPSBuZXcgUmVjb3JkaW5nTW9kYWwodGhpcy5hcHAsIHtcbiAgICAgIHByZXNldHMsXG4gICAgICBkZWZhdWx0UHJlc2V0SWQ6IHRoaXMuc2V0dGluZ3MubGFzdFVzZWRQcm9tcHRJZCB8fCB0aGlzLnNldHRpbmdzLmRlZmF1bHRQcm9tcHRJZCxcbiAgICAgIG1heER1cmF0aW9uU2VjOiB0aGlzLnNldHRpbmdzLm1heER1cmF0aW9uU2VjLFxuICAgICAgb25TdGFydDogYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IHRoaXMucmVjb3JkZXIhLnN0YXJ0KCk7XG4gICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ2Vycm9yJyk7XG4gICAgICAgICAgbW9kYWwuc2V0U3RhdHVzKCdNaWNyb3Bob25lIHBlcm1pc3Npb24gb3IgcmVjb3JkZXIgZXJyb3IuJyk7XG4gICAgICAgICAgbW9kYWwuc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQoZmFsc2UsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBtb2RhbC5zZXREaXNjYXJkTGFiZWwoJ0Nsb3NlJyk7XG4gICAgICAgICAgdGhpcy5yZWNvcmRlcj8uZGlzY2FyZCgpO1xuICAgICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvblN0b3A6IGFzeW5jIChhcHBseVBvc3QsIHByZXNldElkKSA9PiB7XG4gICAgICAgIG1vZGFsLnNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICBtb2RhbC5zZXRQaGFzZSgndHJhbnNjcmliaW5nJyk7XG4gICAgICAgIG1vZGFsLnNldFN0YXR1cygnVHJhbnNjcmliaW5nXHUyMDI2Jyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IHByZXNldDogUHJvbXB0UHJlc2V0IHwgdW5kZWZpbmVkO1xuICAgICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCB0aGlzLnJlY29yZGVyIS5zdG9wKCk7XG4gICAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBjb25zdCByYXcgPSBhd2FpdCB0cmFuc2NyaWJlV2l0aEdyb3EoYmxvYiwgdGhpcy5zZXR0aW5ncyk7XG4gICAgICAgICAgbGV0IHRleHQgPSByYXc7XG4gICAgICAgICAgaWYgKGFwcGx5UG9zdCkge1xuICAgICAgICAgICAgcHJlc2V0ID0gdGhpcy5zZXR0aW5ncy5wcm9tcHRQcmVzZXRzLmZpbmQocCA9PiBwLmlkID09PSBwcmVzZXRJZCkgYXMgUHJvbXB0UHJlc2V0IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5sYXN0VXNlZFByb21wdElkID0gcHJlc2V0Py5pZCB8fCBwcmVzZXRJZCB8fCB0aGlzLnNldHRpbmdzLmxhc3RVc2VkUHJvbXB0SWQ7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICAgICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ3Bvc3Rwcm9jZXNzaW5nJyk7XG4gICAgICAgICAgICBtb2RhbC5zZXRTdGF0dXMoJ0NsZWFuaW5nIHRyYW5zY3JpcHRcdTIwMjYnKTtcbiAgICAgICAgICAgIC8vIENhcHR1cmUgY3VycmVudCBzZWxlY3Rpb24gZnJvbSBhY3RpdmUgZWRpdG9yIHRvIGluY2x1ZGUgYXMgY29udGV4dCBvciBpbmxpbmUgaW4gc3lzdGVtXG4gICAgICAgICAgICBjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGFjdGl2ZVZpZXc/LmVkaXRvcj8uZ2V0U2VsZWN0aW9uKCkgfHwgJyc7XG4gICAgICAgICAgICB0ZXh0ID0gYXdhaXQgcG9zdHByb2Nlc3NXaXRoT3BlbkFJKHJhdywgdGhpcy5zZXR0aW5ncywgcHJlc2V0LCBzZWxlY3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmaW5hbE91dHB1dCA9IHRoaXMuY29tYmluZVRyYW5zY3JpcHRzKHJhdywgdGV4dCwgYXBwbHlQb3N0LCBwcmVzZXQpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuaW5zZXJ0VGV4dChmaW5hbE91dHB1dCk7XG4gICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ2RvbmUnKTtcbiAgICAgICAgICBtb2RhbC5zZXRTdGF0dXMoJ1RyYW5zY3JpcHQgaW5zZXJ0ZWQgaW50byB0aGUgbm90ZS4nKTtcbiAgICAgICAgICBtb2RhbC5zZXRBY3Rpb25CdXR0b25zRW5hYmxlZChmYWxzZSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIG1vZGFsLnNldERpc2NhcmRMYWJlbCgnQ2xvc2UnKTtcbiAgICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgICAgICAgIGlmICh0aGlzLm1vZGFsID09PSBtb2RhbCkgdGhpcy5tb2RhbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICBtb2RhbC5zZXRQaGFzZSgnZXJyb3InKTtcbiAgICAgICAgICBtb2RhbC5zZXRTdGF0dXMoYEVycm9yOiAke2U/Lm1lc3NhZ2UgfHwgZX1gKTtcbiAgICAgICAgICBtb2RhbC5zZXRBY3Rpb25CdXR0b25zRW5hYmxlZChmYWxzZSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIG1vZGFsLnNldERpc2NhcmRMYWJlbCgnQ2xvc2UnKTtcbiAgICAgICAgICB0cnkgeyB0aGlzLnJlY29yZGVyPy5kaXNjYXJkKCk7IH0gY2F0Y2ggeyB9XG4gICAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAvLyBrZWVwIG1vZGFsIG9wZW4gZm9yIHVzZXIgdG8gcmVhZC9jbG9zZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25EaXNjYXJkOiAoKSA9PiB7XG4gICAgICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7IH1cbiAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5tb2RhbCA9IHVuZGVmaW5lZDtcbiAgICAgIH0sXG4gICAgICBvblBhdXNlOiAoKSA9PiB0aGlzLnJlY29yZGVyPy5wYXVzZSgpLFxuICAgICAgb25SZXN1bWU6ICgpID0+IHRoaXMucmVjb3JkZXI/LnJlc3VtZSgpLFxuICAgICAgb25DbG9zZTogKCkgPT4ge1xuICAgICAgICB0cnkgeyB0aGlzLnJlY29yZGVyPy5kaXNjYXJkKCk7IH0gY2F0Y2ggeyB9XG4gICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLm1vZGFsID09PSBtb2RhbCkgdGhpcy5tb2RhbCA9IHVuZGVmaW5lZDtcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgdGhpcy5tb2RhbCA9IG1vZGFsO1xuXG4gICAgLy8gTVZQIHVzZXMgbW9kYWwgdG8gcHJlc2VudCBhbGwgc3RhdHVzIGFuZCBhbmltYXRpb25zXG4gICAgbW9kYWwub3BlbigpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbnNlcnRUZXh0KHRleHQ6IHN0cmluZykge1xuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuICAgIGlmICghdmlldykgdGhyb3cgbmV3IEVycm9yKCdObyBhY3RpdmUgTWFya2Rvd24gZWRpdG9yJyk7XG4gICAgY29uc3QgZWRpdG9yID0gdmlldy5lZGl0b3I7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IHRleHQuc3RhcnRzV2l0aCgnICcpID8gdGV4dC5zbGljZSgxKSA6IHRleHQ7XG4gICAgY29uc3QgYmVmb3JlID0gdGhpcy5zZXR0aW5ncy5hZGROZXdsaW5lQmVmb3JlID8gJ1xcbicgOiAnJztcbiAgICBjb25zdCBhZnRlciA9IHRoaXMuc2V0dGluZ3MuYWRkTmV3bGluZUFmdGVyID8gJ1xcbicgOiAnJztcbiAgICBjb25zdCBjb250ZW50ID0gYCR7YmVmb3JlfSR7bm9ybWFsaXplZH0ke2FmdGVyfWA7XG5cbiAgICBsZXQgc3RhcnQ6IEVkaXRvclBvc2l0aW9uO1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmluc2VydE1vZGUgPT09ICdyZXBsYWNlJyAmJiBlZGl0b3Iuc29tZXRoaW5nU2VsZWN0ZWQoKSkge1xuICAgICAgc3RhcnQgPSAoZWRpdG9yIGFzIGFueSkuZ2V0Q3Vyc29yKCdmcm9tJykgYXMgRWRpdG9yUG9zaXRpb247XG4gICAgICBlZGl0b3IucmVwbGFjZVNlbGVjdGlvbihjb250ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhcnQgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XG4gICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKGNvbnRlbnQsIHN0YXJ0KTtcbiAgICB9XG4gICAgY29uc3QgY2FyZXQgPSB0aGlzLmFkdmFuY2VQb3Moc3RhcnQsIGAke2JlZm9yZX0ke25vcm1hbGl6ZWR9YCk7XG4gICAgZWRpdG9yLnNldEN1cnNvcihjYXJldCk7XG4gIH1cblxuICBwcml2YXRlIGFkdmFuY2VQb3Moc3RhcnQ6IEVkaXRvclBvc2l0aW9uLCB0ZXh0OiBzdHJpbmcpOiBFZGl0b3JQb3NpdGlvbiB7XG4gICAgY29uc3QgcGFydHMgPSB0ZXh0LnNwbGl0KCdcXG4nKTtcbiAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSByZXR1cm4geyBsaW5lOiBzdGFydC5saW5lLCBjaDogc3RhcnQuY2ggKyBwYXJ0c1swXS5sZW5ndGggfTtcbiAgICBjb25zdCBsaW5lc0FkZGVkID0gcGFydHMubGVuZ3RoIC0gMTtcbiAgICBjb25zdCBsYXN0TGVuID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0ubGVuZ3RoO1xuICAgIHJldHVybiB7IGxpbmU6IHN0YXJ0LmxpbmUgKyBsaW5lc0FkZGVkLCBjaDogbGFzdExlbiB9O1xuICB9XG5cbiAgcHJpdmF0ZSBjb21iaW5lVHJhbnNjcmlwdHMocmF3OiBzdHJpbmcsIHByb2Nlc3NlZDogc3RyaW5nLCBwb3N0cHJvY2Vzc2VkQXBwbGllZDogYm9vbGVhbiwgcHJlc2V0PzogUHJvbXB0UHJlc2V0KTogc3RyaW5nIHtcbiAgICBjb25zdCBpbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkID0gcHJlc2V0Py5pbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkID8/IHRydWU7XG4gICAgaWYgKCEocG9zdHByb2Nlc3NlZEFwcGxpZWQgJiYgaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZCkpIHJldHVybiBwcm9jZXNzZWQ7XG4gICAgY29uc3QgcXVvdGVkID0gdGhpcy5xdW90ZVRyYW5zY3JpcHQocmF3KTtcbiAgICBpZiAoIXF1b3RlZCkgcmV0dXJuIHByb2Nlc3NlZDtcbiAgICByZXR1cm4gcHJvY2Vzc2VkLnRyaW0oKS5sZW5ndGggPyBgJHtxdW90ZWR9XFxuXFxuJHtwcm9jZXNzZWR9YCA6IHF1b3RlZDtcbiAgfVxuXG4gIHByaXZhdGUgcXVvdGVUcmFuc2NyaXB0KHJhdzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gcmF3LnRyaW0oKTtcbiAgICBpZiAoIW5vcm1hbGl6ZWQpIHJldHVybiAnJztcbiAgICBjb25zdCBwYXJhZ3JhcGhzID0gbm9ybWFsaXplZC5zcGxpdCgvXFxuXFxzKlxcbi8pO1xuICAgIGNvbnN0IHF1b3RlZEJsb2NrcyA9IHBhcmFncmFwaHMubWFwKChwYXJhZ3JhcGgpID0+IHtcbiAgICAgIGNvbnN0IGxpbmVzID0gcGFyYWdyYXBoLnNwbGl0KCdcXG4nKTtcbiAgICAgIHJldHVybiBsaW5lcy5tYXAobGluZSA9PiBgPiAke2xpbmUudHJpbUVuZCgpfWApLmpvaW4oJ1xcbicpO1xuICAgIH0pO1xuICAgIHJldHVybiBxdW90ZWRCbG9ja3Muam9pbignXFxuPlxcbicpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBCdXR0b25Db21wb25lbnQsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIFByb21wdFByZXNldCB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgQUlUcmFuc2NyaXB0U2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBQbHVnaW4sIHByaXZhdGUgZ2V0U2V0dGluZ3M6ICgpID0+IEFJVHJhbnNjcmlwdFNldHRpbmdzLCBwcml2YXRlIHNhdmVTZXR0aW5nczogKHM6IFBhcnRpYWw8QUlUcmFuc2NyaXB0U2V0dGluZ3M+KSA9PiBQcm9taXNlPHZvaWQ+KSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gxJywgeyB0ZXh0OiAnVm94aWRpYW4nIH0pO1xuXG4gICAgY29uc3QgcyA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcblxuICAgIC8vIEdST1FcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdHcm9xIFdoaXNwZXInIH0pO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0dyb3EgQVBJIEtleScpXG4gICAgICAuc2V0RGVzYygnUmVxdWlyZWQgdG8gdHJhbnNjcmliZSBhdWRpbyB2aWEgR3JvcSBXaGlzcGVyLicpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdnc2tfLi4uJylcbiAgICAgICAgLnNldFZhbHVlKHMuZ3JvcUFwaUtleSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZ3JvcUFwaUtleTogdi50cmltKCkgfSk7IH0pKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0dyb3EgbW9kZWwnKVxuICAgICAgLnNldERlc2MoJ0RlZmF1bHQ6IHdoaXNwZXItbGFyZ2UtdjMnKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRWYWx1ZShzLmdyb3FNb2RlbClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZ3JvcU1vZGVsOiB2LnRyaW0oKSB8fCAnd2hpc3Blci1sYXJnZS12MycgfSk7IH0pKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0xhbmd1YWdlIChvcHRpb25hbCknKVxuICAgICAgLnNldERlc2MoJ0lTTyBjb2RlIGxpa2UgZW4sIGVzLCBkZS4gTGVhdmUgZW1wdHkgZm9yIGF1dG8uJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0VmFsdWUocy5sYW5ndWFnZSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgbGFuZ3VhZ2U6IHYudHJpbSgpIHx8IHVuZGVmaW5lZCB9KTsgfSkpO1xuXG4gICAgLy8gT3BlbkFJXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnT3BlbkFJIFBvc3Rwcm9jZXNzaW5nIChvcHRpb25hbCknIH0pO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ09wZW5BSSBBUEkgS2V5JylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ3NrLS4uLicpXG4gICAgICAgIC5zZXRWYWx1ZShzLm9wZW5haUFwaUtleSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgb3BlbmFpQXBpS2V5OiB2LnRyaW0oKSB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnT3BlbkFJIG1vZGVsJylcbiAgICAgIC5zZXREZXNjKCdEZWZhdWx0OiBncHQtNG8tbWluaScpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFZhbHVlKHMub3BlbmFpTW9kZWwpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IG9wZW5haU1vZGVsOiB2LnRyaW0oKSB8fCAnZ3B0LTRvLW1pbmknIH0pOyB9KSk7XG5cbiAgICAvLyBQcmVzZXRzXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnUHJvbXB0IHByZXNldHMnIH0pO1xuXG4gICAgY29uc3QgbGlzdEVsID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KCk7XG4gICAgY29uc3QgcmVuZGVyUHJlc2V0cyA9ICgpID0+IHtcbiAgICAgIGxpc3RFbC5lbXB0eSgpO1xuICAgICAgY29uc3Qgc3QgPSB0aGlzLmdldFNldHRpbmdzKCk7XG4gICAgICBzdC5wcm9tcHRQcmVzZXRzLmZvckVhY2goKHApID0+IHtcbiAgICAgICAgY29uc3Qgd3JhcCA9IGxpc3RFbC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1wcmVzZXQnIH0pO1xuICAgICAgICBjb25zdCBoZWFkZXIgPSB3cmFwLmNyZWF0ZURpdih7IGNsczogJ2FpLXByZXNldC1oZWFkZXInIH0pO1xuICAgICAgICBjb25zdCB0aXRsZSA9IGhlYWRlci5jcmVhdGVEaXYoeyBjbHM6ICdhaS1wcmVzZXQtdGl0bGUnIH0pO1xuICAgICAgICB0aXRsZS5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6IHAubmFtZSwgY2xzOiAnYWktcHJlc2V0LW5hbWUnIH0pO1xuICAgICAgICBpZiAoc3QuZGVmYXVsdFByb21wdElkID09PSBwLmlkKSB0aXRsZS5jcmVhdGVTcGFuKHsgdGV4dDogJ0RlZmF1bHQgcHJlc2V0JywgY2xzOiAnYWktcHJlc2V0LWRlZmF1bHQnIH0pO1xuICAgICAgICBjb25zdCBhY3Rpb25zRWwgPSBoZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiAnYWktcHJlc2V0LWFjdGlvbnMnIH0pO1xuICAgICAgICBuZXcgQnV0dG9uQ29tcG9uZW50KGFjdGlvbnNFbClcbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dCgnU2V0IGFzIERlZmF1bHQnKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZGVmYXVsdFByb21wdElkOiBwLmlkIH0pO1xuICAgICAgICAgICAgcmVuZGVyUHJlc2V0cygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBuZXcgQnV0dG9uQ29tcG9uZW50KGFjdGlvbnNFbClcbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dCgnRGVsZXRlJylcbiAgICAgICAgICAuc2V0V2FybmluZygpXG4gICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyZWQgPSBzdC5wcm9tcHRQcmVzZXRzLmZpbHRlcih4ID0+IHguaWQgIT09IHAuaWQpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBmaWx0ZXJlZCB9KTtcbiAgICAgICAgICAgIHJlbmRlclByZXNldHMoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnTmFtZScpXG4gICAgICAgICAgLmFkZFRleHQodCA9PiB0LnNldFZhbHVlKHAubmFtZSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgIHAubmFtZSA9IHY7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ1N5c3RlbSBwcm9tcHQnKVxuICAgICAgICAgIC5zZXREZXNjKCdTdXBwb3J0cyB7e3NlbGVjdGlvbn19IHBsYWNlaG9sZGVyOyB3aGVuIGFic2VudCwgY3VycmVudCBzZWxlY3Rpb24gaXMgcHJlcGVuZGVkIGFzIGNvbnRleHQuJylcbiAgICAgICAgICAuYWRkVGV4dEFyZWEodCA9PiB7XG4gICAgICAgICAgICB0LnNldFZhbHVlKHAuc3lzdGVtKTtcbiAgICAgICAgICAgIHQuaW5wdXRFbC5yb3dzID0gNjtcbiAgICAgICAgICAgIHQuaW5wdXRFbC5hZGRDbGFzcygnYWktc3lzdGVtLXRleHRhcmVhJyk7XG4gICAgICAgICAgICB0Lm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICAgIHAuc3lzdGVtID0gdjsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ1RlbXBlcmF0dXJlJylcbiAgICAgICAgICAuYWRkVGV4dCh0ID0+IHQuc2V0VmFsdWUoU3RyaW5nKHAudGVtcGVyYXR1cmUpKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKHYpOyBwLnRlbXBlcmF0dXJlID0gaXNGaW5pdGUobnVtKSA/IG51bSA6IDAuMjsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnTW9kZWwgb3ZlcnJpZGUgKG9wdGlvbmFsKScpXG4gICAgICAgICAgLmFkZFRleHQodCA9PiB0LnNldFBsYWNlaG9sZGVyKCdlLmcuLCBncHQtNG8tbWluaScpLnNldFZhbHVlKHAubW9kZWwgfHwgJycpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICBwLm1vZGVsID0gdi50cmltKCkgfHwgdW5kZWZpbmVkOyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IHN0LnByb21wdFByZXNldHMgfSk7XG4gICAgICAgICAgfSkpO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKCdJbmNsdWRlIHRyYW5zY3JpcHQgd2l0aCBwb3N0cHJvY2Vzc2VkIG1lc3NhZ2UnKVxuICAgICAgICAgIC5zZXREZXNjKCdQcmVwZW5kcyB0aGUgcmF3IHRyYW5zY3JpcHQgcXVvdGVkIHdpdGggXCI+XCIgd2hlbiBwb3N0cHJvY2Vzc2luZyBzdWNjZWVkcy4nKVxuICAgICAgICAgIC5hZGRUb2dnbGUodCA9PiB0XG4gICAgICAgICAgICAuc2V0VmFsdWUocC5pbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkID8/IHRydWUpXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgICAgcC5pbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkID0gdjtcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAvLyBBZGQgc29tZSBzcGFjZSBhZnRlciBlYWNoIHByZXNldFxuICAgICAgICB3cmFwLmNyZWF0ZUVsKCdicicpO1xuXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyUHJlc2V0cygpO1xuXG4gICAgLy8gQWRkIGEgc2VwYXJhdG9yIGJlZm9yZSB0aGUgQWRkIGJ1dHRvblxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdocicpO1xuXG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdBZGQgcHJlc2V0JylcbiAgICAgIC5hZGRCdXR0b24oYiA9PiBiLnNldEJ1dHRvblRleHQoJ0FkZCcpLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdCA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcbiAgICAgICAgY29uc3QgaWQgPSBgcHJlc2V0LSR7RGF0ZS5ub3coKX1gO1xuICAgICAgICBjb25zdCBwcmVzZXQ6IFByb21wdFByZXNldCA9IHsgaWQsIG5hbWU6ICdOZXcgUHJlc2V0Jywgc3lzdGVtOiAnRWRpdCBtZVx1MjAyNicsIHRlbXBlcmF0dXJlOiAwLjIsIGluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQ6IHRydWUgfTtcbiAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBbLi4uc3QucHJvbXB0UHJlc2V0cywgcHJlc2V0XSB9KTtcbiAgICAgICAgcmVuZGVyUHJlc2V0cygpO1xuICAgICAgfSkpO1xuXG4gICAgLy8gUmVjb3JkaW5nIGJlaGF2aW9yXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnUmVjb3JkaW5nICYgSW5zZXJ0aW9uJyB9KTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdTaG93IHJlY29yZGluZyBtb2RhbCcpXG4gICAgICAuYWRkVG9nZ2xlKHQgPT4gdC5zZXRWYWx1ZShzLnNob3dNb2RhbFdoaWxlUmVjb3JkaW5nKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHNob3dNb2RhbFdoaWxlUmVjb3JkaW5nOiB2IH0pO1xuICAgICAgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ01heCBkdXJhdGlvbiAoc2Vjb25kcyknKVxuICAgICAgLmFkZFRleHQodCA9PiB0LnNldFZhbHVlKFN0cmluZyhzLm1heER1cmF0aW9uU2VjKSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgY29uc3QgbiA9IE51bWJlcih2KTsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBtYXhEdXJhdGlvblNlYzogaXNGaW5pdGUobikgJiYgbiA+IDAgPyBNYXRoLmZsb29yKG4pIDogOTAwIH0pO1xuICAgICAgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0luc2VydCBtb2RlJylcbiAgICAgIC5zZXREZXNjKCdJbnNlcnQgYXQgY3Vyc29yIG9yIHJlcGxhY2Ugc2VsZWN0aW9uJylcbiAgICAgIC5hZGREcm9wZG93bihkID0+IGRcbiAgICAgICAgLmFkZE9wdGlvbignaW5zZXJ0JywgJ0luc2VydCBhdCBjdXJzb3InKVxuICAgICAgICAuYWRkT3B0aW9uKCdyZXBsYWNlJywgJ1JlcGxhY2Ugc2VsZWN0aW9uJylcbiAgICAgICAgLnNldFZhbHVlKHMuaW5zZXJ0TW9kZSlcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgaW5zZXJ0TW9kZTogdiBhcyBhbnkgfSk7IH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdBZGQgbmV3bGluZSBiZWZvcmUnKVxuICAgICAgLmFkZFRvZ2dsZSh0ID0+IHQuc2V0VmFsdWUocy5hZGROZXdsaW5lQmVmb3JlKS5vbkNoYW5nZShhc3luYyAodikgPT4geyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IGFkZE5ld2xpbmVCZWZvcmU6IHYgfSk7IH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdBZGQgbmV3bGluZSBhZnRlcicpXG4gICAgICAuYWRkVG9nZ2xlKHQgPT4gdC5zZXRWYWx1ZShzLmFkZE5ld2xpbmVBZnRlcikub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBhZGROZXdsaW5lQWZ0ZXI6IHYgfSk7IH0pKTtcbiAgfVxufVxuIiwgImV4cG9ydCBjbGFzcyBBdWRpb1JlY29yZGVyIHtcbiAgcHJpdmF0ZSBtZWRpYVJlY29yZGVyPzogTWVkaWFSZWNvcmRlcjtcbiAgcHJpdmF0ZSBjaHVua3M6IEJsb2JQYXJ0W10gPSBbXTtcbiAgcHJpdmF0ZSBzdHJlYW0/OiBNZWRpYVN0cmVhbTtcbiAgcHJpdmF0ZSBzdGFydGVkQXQgPSAwO1xuICBwcml2YXRlIHRpbWVyPzogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgb25UaWNrPzogKGVsYXBzZWRNczogbnVtYmVyKSA9PiB2b2lkKSB7fVxuXG4gIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLm1lZGlhUmVjb3JkZXIgJiYgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXRlID09PSAncmVjb3JkaW5nJykgcmV0dXJuO1xuICAgIHRoaXMuY2h1bmtzID0gW107XG4gICAgdGhpcy5zdHJlYW0gPSBhd2FpdCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSh7IGF1ZGlvOiB0cnVlIH0pO1xuICAgIGNvbnN0IG1pbWVDYW5kaWRhdGVzID0gW1xuICAgICAgJ2F1ZGlvL3dlYm07Y29kZWNzPW9wdXMnLFxuICAgICAgJ2F1ZGlvL3dlYm0nLFxuICAgICAgJ2F1ZGlvL29nZztjb2RlY3M9b3B1cycsXG4gICAgICAnJ1xuICAgIF07XG4gICAgbGV0IG1pbWVUeXBlID0gJyc7XG4gICAgZm9yIChjb25zdCBjYW5kIG9mIG1pbWVDYW5kaWRhdGVzKSB7XG4gICAgICBpZiAoIWNhbmQgfHwgKHdpbmRvdyBhcyBhbnkpLk1lZGlhUmVjb3JkZXI/LmlzVHlwZVN1cHBvcnRlZD8uKGNhbmQpKSB7IG1pbWVUeXBlID0gY2FuZDsgYnJlYWs7IH1cbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICB0aGlzLm1lZGlhUmVjb3JkZXIgPSBuZXcgTWVkaWFSZWNvcmRlcih0aGlzLnN0cmVhbSwgbWltZVR5cGUgPyB7IG1pbWVUeXBlIH0gOiB1bmRlZmluZWQpO1xuICAgIHRoaXMubWVkaWFSZWNvcmRlci5vbmRhdGFhdmFpbGFibGUgPSAoZTogQmxvYkV2ZW50KSA9PiB7IGlmIChlLmRhdGE/LnNpemUpIHRoaXMuY2h1bmtzLnB1c2goZS5kYXRhKTsgfTtcbiAgICB0aGlzLm1lZGlhUmVjb3JkZXIuc3RhcnQoMjUwKTsgLy8gc21hbGwgY2h1bmtzXG4gICAgdGhpcy5zdGFydGVkQXQgPSBEYXRlLm5vdygpO1xuICAgIGlmICh0aGlzLm9uVGljaykgdGhpcy50aW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB0aGlzLm9uVGljayEoRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnRlZEF0KSwgMjAwKTtcbiAgfVxuXG4gIHBhdXNlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1lZGlhUmVjb3JkZXIgJiYgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXRlID09PSAncmVjb3JkaW5nJyAmJiB0eXBlb2YgdGhpcy5tZWRpYVJlY29yZGVyLnBhdXNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLm1lZGlhUmVjb3JkZXIucGF1c2UoKTtcbiAgICB9XG4gIH1cblxuICByZXN1bWUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVkaWFSZWNvcmRlciAmJiB0aGlzLm1lZGlhUmVjb3JkZXIuc3RhdGUgPT09ICdwYXVzZWQnICYmIHR5cGVvZiB0aGlzLm1lZGlhUmVjb3JkZXIucmVzdW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLm1lZGlhUmVjb3JkZXIucmVzdW1lKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgc3RvcCgpOiBQcm9taXNlPEJsb2I+IHtcbiAgICBjb25zdCByZWMgPSB0aGlzLm1lZGlhUmVjb3JkZXI7XG4gICAgaWYgKCFyZWMpIHRocm93IG5ldyBFcnJvcignUmVjb3JkZXIgbm90IHN0YXJ0ZWQnKTtcbiAgICBjb25zdCBzdG9wUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICByZWMub25zdG9wID0gKCkgPT4gcmVzb2x2ZSgpO1xuICAgIH0pO1xuICAgIGlmIChyZWMuc3RhdGUgIT09ICdpbmFjdGl2ZScpIHJlYy5zdG9wKCk7XG4gICAgYXdhaXQgc3RvcFByb21pc2U7XG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKHRoaXMuY2h1bmtzLCB7IHR5cGU6IHRoaXMuY2h1bmtzLmxlbmd0aCA/ICh0aGlzLmNodW5rc1swXSBhcyBhbnkpLnR5cGUgfHwgJ2F1ZGlvL3dlYm0nIDogJ2F1ZGlvL3dlYm0nIH0pO1xuICAgIHRoaXMuY2xlYW51cCgpO1xuICAgIHJldHVybiBibG9iO1xuICB9XG5cbiAgZGlzY2FyZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZWRpYVJlY29yZGVyICYmIHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSAhPT0gJ2luYWN0aXZlJykgdGhpcy5tZWRpYVJlY29yZGVyLnN0b3AoKTtcbiAgICB0aGlzLmNsZWFudXAoKTtcbiAgfVxuXG4gIHByaXZhdGUgY2xlYW51cCgpIHtcbiAgICBpZiAodGhpcy50aW1lcikgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7XG4gICAgdGhpcy50aW1lciA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLm1lZGlhUmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zdGFydGVkQXQgPSAwO1xuICAgIGlmICh0aGlzLnN0cmVhbSkge1xuICAgICAgdGhpcy5zdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaCh0ID0+IHQuc3RvcCgpKTtcbiAgICAgIHRoaXMuc3RyZWFtID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB0aGlzLmNodW5rcyA9IFtdO1xuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBBSVRyYW5zY3JpcHRTZXR0aW5ncywgUHJvbXB0UHJlc2V0IH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwb3N0cHJvY2Vzc1dpdGhPcGVuQUkoXG4gIHJhdzogc3RyaW5nLFxuICBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MsXG4gIHByZXNldD86IFByb21wdFByZXNldCxcbiAgc2VsZWN0aW9uPzogc3RyaW5nLFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgaWYgKCFzZXR0aW5ncy5vcGVuYWlBcGlLZXkpIHJldHVybiByYXc7IC8vIHNpbGVudGx5IHNraXAgaWYgbWlzc2luZ1xuICBjb25zdCBtb2RlbCA9IHByZXNldD8ubW9kZWwgfHwgc2V0dGluZ3Mub3BlbmFpTW9kZWwgfHwgJ2dwdC00by1taW5pJztcbiAgY29uc3QgdGVtcGVyYXR1cmUgPSBjbGFtcCgocHJlc2V0Py50ZW1wZXJhdHVyZSA/PyAwLjIpLCAwLCAxKTtcbiAgbGV0IHN5c3RlbSA9IHByZXNldD8uc3lzdGVtIHx8ICdZb3UgY2xlYW4gdXAgc3Bva2VuIHRleHQuIEZpeCBjYXBpdGFsaXphdGlvbiBhbmQgcHVuY3R1YXRpb24sIHJlbW92ZSBmaWxsZXIgd29yZHMsIHByZXNlcnZlIG1lYW5pbmcuIERvIG5vdCBhZGQgY29udGVudC4nO1xuXG4gIGNvbnN0IHNlbCA9IChzZWxlY3Rpb24gfHwgJycpLnRyaW0oKTtcbiAgLy8gUHJlcGFyZSB1c2VyIGNvbnRlbnQ7IG9wdGlvbmFsbHkgcHJlcGVuZCBjb250ZXh0IGlmIHt7c2VsZWN0aW9ufX0gcGxhY2Vob2xkZXIgaXMgbm90IHVzZWQgaW4gc3lzdGVtXG4gIGxldCB1c2VyQ29udGVudCA9IHJhdztcbiAgaWYgKHNlbCkge1xuICAgIGlmIChzeXN0ZW0uaW5jbHVkZXMoJ3t7c2VsZWN0aW9ufX0nKSkge1xuICAgICAgc3lzdGVtID0gc3lzdGVtLnNwbGl0KCd7e3NlbGVjdGlvbn19Jykuam9pbihzZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb250ZXh0QmxvY2sgPSBgQ29udGV4dCAoc2VsZWN0ZWQgdGV4dCk6XFxuLS0tXFxuJHtzZWx9XFxuLS0tXFxuXFxuYDtcbiAgICAgIHVzZXJDb250ZW50ID0gY29udGV4dEJsb2NrICsgcmF3O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJywge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3NldHRpbmdzLm9wZW5haUFwaUtleX1gLFxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIG1vZGVsLFxuICAgICAgdGVtcGVyYXR1cmUsXG4gICAgICBtZXNzYWdlczogW1xuICAgICAgICB7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBzeXN0ZW0gfSxcbiAgICAgICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHVzZXJDb250ZW50IH0sXG4gICAgICBdLFxuICAgIH0pLFxuICB9KTtcbiAgaWYgKCFyZXNwLm9rKSB7XG4gICAgLy8gSWYgT3BlbkFJIGZhaWxzLCByZXR1cm4gcmF3IHJhdGhlciB0aGFuIGJyZWFraW5nIGluc2VydGlvblxuICAgIHRyeSB7IGNvbnNvbGUud2FybignT3BlbkFJIHBvc3Rwcm9jZXNzIGZhaWxlZCcsIHJlc3Auc3RhdHVzLCBhd2FpdCByZXNwLnRleHQoKSk7IH0gY2F0Y2gge31cbiAgICByZXR1cm4gcmF3O1xuICB9XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgY29uc3QgY2xlYW5lZCA9IGRhdGE/LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudDtcbiAgcmV0dXJuIHR5cGVvZiBjbGVhbmVkID09PSAnc3RyaW5nJyAmJiBjbGVhbmVkLnRyaW0oKSA/IGNsZWFuZWQgOiByYXc7XG59XG5cbmZ1bmN0aW9uIGNsYW1wKG46IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7IHJldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKG1heCwgbikpOyB9XG4iLCAiaW1wb3J0IHR5cGUgeyBBSVRyYW5zY3JpcHRTZXR0aW5ncyB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHJhbnNjcmliZVdpdGhHcm9xKGJsb2I6IEJsb2IsIHNldHRpbmdzOiBBSVRyYW5zY3JpcHRTZXR0aW5ncyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghc2V0dGluZ3MuZ3JvcUFwaUtleSkgdGhyb3cgbmV3IEVycm9yKCdHcm9xIEFQSSBrZXkgaXMgbWlzc2luZyBpbiBzZXR0aW5ncy4nKTtcbiAgY29uc3QgZmQgPSBuZXcgRm9ybURhdGEoKTtcbiAgZmQuYXBwZW5kKCdmaWxlJywgbmV3IEZpbGUoW2Jsb2JdLCAnYXVkaW8ud2VibScsIHsgdHlwZTogYmxvYi50eXBlIHx8ICdhdWRpby93ZWJtJyB9KSk7XG4gIGZkLmFwcGVuZCgnbW9kZWwnLCBzZXR0aW5ncy5ncm9xTW9kZWwgfHwgJ3doaXNwZXItbGFyZ2UtdjMnKTtcbiAgaWYgKHNldHRpbmdzLmxhbmd1YWdlKSBmZC5hcHBlbmQoJ2xhbmd1YWdlJywgc2V0dGluZ3MubGFuZ3VhZ2UpO1xuXG4gIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkuZ3JvcS5jb20vb3BlbmFpL3YxL2F1ZGlvL3RyYW5zY3JpcHRpb25zJywge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7c2V0dGluZ3MuZ3JvcUFwaUtleX1gIH0sXG4gICAgYm9keTogZmQsXG4gIH0pO1xuICBpZiAoIXJlc3Aub2spIHtcbiAgICBjb25zdCB0ZXh0ID0gYXdhaXQgc2FmZVRleHQocmVzcCk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBHcm9xIHRyYW5zY3JpcHRpb24gZmFpbGVkICgke3Jlc3Auc3RhdHVzfSk6ICR7dGV4dH1gKTtcbiAgfVxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gIGlmICh0eXBlb2YgZGF0YT8udGV4dCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignR3JvcSByZXNwb25zZSBtaXNzaW5nIHRleHQnKTtcbiAgcmV0dXJuIGRhdGEudGV4dCBhcyBzdHJpbmc7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhZmVUZXh0KHJlc3A6IFJlc3BvbnNlKSB7XG4gIHRyeSB7IHJldHVybiBhd2FpdCByZXNwLnRleHQoKTsgfSBjYXRjaCB7IHJldHVybiAnPG5vLWJvZHk+JzsgfVxufVxuXG4iLCAiZXhwb3J0IHR5cGUgSW5zZXJ0TW9kZSA9ICdpbnNlcnQnIHwgJ3JlcGxhY2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb21wdFByZXNldCB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgc3lzdGVtOiBzdHJpbmc7XG4gIHRlbXBlcmF0dXJlOiBudW1iZXI7XG4gIGluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQ/OiBib29sZWFuO1xuICBtb2RlbD86IHN0cmluZzsgLy8gb3B0aW9uYWwgT3BlbkFJIG1vZGVsIG92ZXJyaWRlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQUlUcmFuc2NyaXB0U2V0dGluZ3Mge1xuICBncm9xQXBpS2V5OiBzdHJpbmc7XG4gIGdyb3FNb2RlbDogc3RyaW5nOyAvLyBlLmcuLCAnd2hpc3Blci1sYXJnZS12MydcbiAgbGFuZ3VhZ2U/OiBzdHJpbmc7IC8vIElTTyBjb2RlLCBvcHRpb25hbFxuXG4gIG9wZW5haUFwaUtleT86IHN0cmluZztcbiAgb3BlbmFpTW9kZWw6IHN0cmluZzsgLy8gZS5nLiwgJ2dwdC00by1taW5pJ1xuXG4gIHByb21wdFByZXNldHM6IFByb21wdFByZXNldFtdO1xuICBkZWZhdWx0UHJvbXB0SWQ/OiBzdHJpbmc7XG4gIGxhc3RVc2VkUHJvbXB0SWQ/OiBzdHJpbmc7XG5cbiAgc2hvd01vZGFsV2hpbGVSZWNvcmRpbmc6IGJvb2xlYW47XG4gIG1heER1cmF0aW9uU2VjOiBudW1iZXI7XG4gIGluc2VydE1vZGU6IEluc2VydE1vZGU7XG4gIGFkZE5ld2xpbmVCZWZvcmU6IGJvb2xlYW47XG4gIGFkZE5ld2xpbmVBZnRlcjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJFU0VUOiBQcm9tcHRQcmVzZXQgPSB7XG4gIGlkOiAncG9saXNoZWQnLFxuICBuYW1lOiAnUG9saXNoZWQnLFxuICBzeXN0ZW06XG4gICAgJ1lvdSBjbGVhbiB1cCBzcG9rZW4gdGV4dC4gRml4IGNhcGl0YWxpemF0aW9uIGFuZCBwdW5jdHVhdGlvbiwgcmVtb3ZlIGZpbGxlciB3b3JkcywgcHJlc2VydmUgbWVhbmluZy4gRG8gbm90IGFkZCBjb250ZW50LicsXG4gIHRlbXBlcmF0dXJlOiAwLjIsXG59O1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQUlUcmFuc2NyaXB0U2V0dGluZ3MgPSB7XG4gIGdyb3FBcGlLZXk6ICcnLFxuICBncm9xTW9kZWw6ICd3aGlzcGVyLWxhcmdlLXYzJyxcbiAgbGFuZ3VhZ2U6IHVuZGVmaW5lZCxcblxuICBvcGVuYWlBcGlLZXk6ICcnLFxuICBvcGVuYWlNb2RlbDogJ2dwdC00by1taW5pJyxcblxuICBwcm9tcHRQcmVzZXRzOiBbREVGQVVMVF9QUkVTRVRdLFxuICBkZWZhdWx0UHJvbXB0SWQ6ICdwb2xpc2hlZCcsXG4gIGxhc3RVc2VkUHJvbXB0SWQ6ICdwb2xpc2hlZCcsXG5cbiAgc2hvd01vZGFsV2hpbGVSZWNvcmRpbmc6IHRydWUsXG4gIG1heER1cmF0aW9uU2VjOiA5MDAsXG4gIGluc2VydE1vZGU6ICdpbnNlcnQnLFxuICBhZGROZXdsaW5lQmVmb3JlOiBmYWxzZSxcbiAgYWRkTmV3bGluZUFmdGVyOiB0cnVlLFxufTtcbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBTZXR0aW5nLCBEcm9wZG93bkNvbXBvbmVudCB9IGZyb20gJ29ic2lkaWFuJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVjb3JkaW5nTW9kYWxPcHRpb25zIHtcbiAgcHJlc2V0czogeyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfVtdO1xuICBkZWZhdWx0UHJlc2V0SWQ/OiBzdHJpbmc7XG4gIG1heER1cmF0aW9uU2VjOiBudW1iZXI7XG4gIG9uU3RhcnQ/OiAoKSA9PiB2b2lkO1xuICBvblN0b3A6IChhcHBseVBvc3Q6IGJvb2xlYW4sIHByZXNldElkPzogc3RyaW5nKSA9PiB2b2lkO1xuICBvbkRpc2NhcmQ6ICgpID0+IHZvaWQ7XG4gIG9uUGF1c2U/OiAoKSA9PiB2b2lkO1xuICBvblJlc3VtZT86ICgpID0+IHZvaWQ7XG4gIG9uQ2xvc2U/OiAoKSA9PiB2b2lkO1xufVxuXHJcbmV4cG9ydCBjbGFzcyBSZWNvcmRpbmdNb2RhbCBleHRlbmRzIE1vZGFsIHtcclxuICBwcml2YXRlIHJvb3RFbD86IEhUTUxEaXZFbGVtZW50O1xyXG4gIHByaXZhdGUgZWxhcHNlZEVsPzogSFRNTEVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSB0aW1lcj86IG51bWJlcjtcclxuICBwcml2YXRlIHN0YXJ0ZWRBdCA9IDA7XHJcbiAgcHJpdmF0ZSBwcmVzZXREcm9wZG93bj86IERyb3Bkb3duQ29tcG9uZW50O1xyXG4gIHByaXZhdGUgcGF1c2VCdG5FbD86IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gIHByaXZhdGUgdHJhbnNjcmliZUJ0bkVsPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBwb3N0cHJvY2Vzc0J0bkVsPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBzdGF0dXNUZXh0RWw/OiBIVE1MRWxlbWVudDtcclxuICBwcml2YXRlIGRpc2NhcmRCdG5FbD86IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gIHByaXZhdGUgaXNQYXVzZWQgPSBmYWxzZTtcclxuICBwcml2YXRlIHBhdXNlU3RhcnRlZEF0ID0gMDtcclxuICBwcml2YXRlIGFjY3VtdWxhdGVkUGF1c2VNcyA9IDA7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIG9wdHM6IFJlY29yZGluZ01vZGFsT3B0aW9ucykge1xyXG4gICAgc3VwZXIoYXBwKTtcclxuICB9XHJcblxyXG4gIG9uT3BlbigpOiB2b2lkIHtcclxuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xyXG4gICAgY29udGVudEVsLmVtcHR5KCk7XHJcblxyXG4gICAgdGhpcy5tb2RhbEVsLmFkZENsYXNzKCd2b3hpZGlhbi1tb2RhbCcpO1xyXG5cclxuICAgIHRoaXMucm9vdEVsID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLXJvb3QnIH0pO1xyXG4gICAgdGhpcy5yb290RWwuc2V0QXR0cmlidXRlKCdkYXRhLXBoYXNlJywgJ3JlY29yZGluZycpO1xyXG5cclxuICAgIGNvbnN0IGhlYWRlciA9IHRoaXMucm9vdEVsLmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLWhlYWRlcicgfSk7XHJcbiAgICBoZWFkZXIuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnVm94aWRpYW4nIH0pO1xyXG4gICAgY29uc3QgaGVhZGVyUmlnaHQgPSBoZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiAndm94aWRpYW4taGVhZGVyLXJpZ2h0JyB9KTtcclxuICAgIGhlYWRlclJpZ2h0LmNyZWF0ZURpdih7IGNsczogJ2FpLXJlYy1pbmRpY2F0b3InLCBhdHRyOiB7ICdhcmlhLWxhYmVsJzogJ1JlY29yZGluZyBpbmRpY2F0b3InIH0gfSk7XHJcbiAgICB0aGlzLmVsYXBzZWRFbCA9IGhlYWRlclJpZ2h0LmNyZWF0ZURpdih7IHRleHQ6ICcwMDowMCcsIGNsczogJ3ZveGlkaWFuLXRpbWVyJyB9KTtcclxuICAgIHRoaXMucGF1c2VCdG5FbCA9IGhlYWRlclJpZ2h0LmNyZWF0ZUVsKCdidXR0b24nLCB7XHJcbiAgICAgIHRleHQ6ICdcdTI3NUFcdTI3NUEnLFxyXG4gICAgICB0eXBlOiAnYnV0dG9uJyxcclxuICAgICAgY2xzOiAndm94aWRpYW4tcGF1c2UnLFxyXG4gICAgICBhdHRyOiB7ICdhcmlhLWxhYmVsJzogJ1BhdXNlIHJlY29yZGluZycsICdhcmlhLXByZXNzZWQnOiAnZmFsc2UnIH0sXHJcbiAgICB9KTtcclxuICAgIHRoaXMucGF1c2VCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudG9nZ2xlUGF1c2UoKSk7XHJcbiAgICB0aGlzLnJlc2V0UGF1c2VTdGF0ZSgpO1xyXG5cclxuICAgIGNvbnN0IGJvZHkgPSB0aGlzLnJvb3RFbC5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1ib2R5JyB9KTtcclxuXHJcbiAgICAvLyBQcmVzZXQgc2VsZWN0aW9uXHJcbiAgICBuZXcgU2V0dGluZyhib2R5KVxyXG4gICAgICAuc2V0TmFtZSgnUG9zdHByb2Nlc3NpbmcgcHJlc2V0JylcclxuICAgICAgLmFkZERyb3Bkb3duKGQgPT4ge1xyXG4gICAgICAgIHRoaXMucHJlc2V0RHJvcGRvd24gPSBkO1xyXG4gICAgICAgIGZvciAoY29uc3QgcCBvZiB0aGlzLm9wdHMucHJlc2V0cykgZC5hZGRPcHRpb24ocC5pZCwgcC5uYW1lKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRzLmRlZmF1bHRQcmVzZXRJZCkgZC5zZXRWYWx1ZSh0aGlzLm9wdHMuZGVmYXVsdFByZXNldElkKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgY29uc3QgYnRucyA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiAndm94aWRpYW4tYnV0dG9ucycgfSk7XHJcbiAgICB0aGlzLnRyYW5zY3JpYmVCdG5FbCA9IGJ0bnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ1RyYW5zY3JpYmUnLCB0eXBlOiAnYnV0dG9uJyB9KTtcclxuICAgIHRoaXMucG9zdHByb2Nlc3NCdG5FbCA9IGJ0bnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ1Bvc3RQcm9jZXNzJywgdHlwZTogJ2J1dHRvbicgfSk7XHJcbiAgICB0aGlzLmRpc2NhcmRCdG5FbCA9IGJ0bnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ0Rpc2NhcmQnLCB0eXBlOiAnYnV0dG9uJyB9KTtcclxuICAgIHRoaXMudHJhbnNjcmliZUJ0bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy50cmlnZ2VyU3RvcChmYWxzZSkpO1xyXG4gICAgdGhpcy5wb3N0cHJvY2Vzc0J0bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy50cmlnZ2VyU3RvcCh0cnVlKSk7XHJcbiAgICB0aGlzLmRpc2NhcmRCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMub3B0cy5vbkRpc2NhcmQoKSk7XHJcblxyXG4gICAgY29uc3Qgc3RhdHVzQmFyID0gdGhpcy5yb290RWwuY3JlYXRlRGl2KHsgY2xzOiAndm94aWRpYW4tc3RhdHVzYmFyJyB9KTtcclxuICAgIGNvbnN0IHN0YXR1c1dyYXAgPSBzdGF0dXNCYXIuY3JlYXRlRGl2KHsgY2xzOiAnYWktc3RhdHVzLXdyYXAnIH0pO1xyXG4gICAgc3RhdHVzV3JhcC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1zcGlubmVyJywgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICdXb3JraW5nXHUyMDI2JyB9IH0pO1xyXG4gICAgdGhpcy5zdGF0dXNUZXh0RWwgPSBzdGF0dXNXcmFwLmNyZWF0ZURpdih7IGNsczogJ2FpLXN0YXR1cy10ZXh0JywgdGV4dDogJ0xpc3RlbmluZ1x1MjAyNicgfSk7XHJcblxyXG4gICAgdGhpcy5tb2RhbEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB0aGlzLm9wdHMub25EaXNjYXJkKCk7XHJcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB0aGlzLnRyaWdnZXJTdG9wKGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU3RhcnQgdGltZXJcclxuICAgIHRoaXMuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcclxuICAgIHRoaXMudGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy50aWNrKCksIDIwMCk7XHJcbiAgICB0aGlzLm9wdHMub25TdGFydD8uKCk7XHJcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudGltZXIpIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuICAgIHRoaXMudGltZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgICB0aGlzLm9wdHMub25DbG9zZT8uKCk7XG4gIH1cblxyXG4gIHByaXZhdGUgdGljaygpOiB2b2lkIHtcclxuICAgIGNvbnN0IGVsYXBzZWRNcyA9IHRoaXMuZ2V0RWxhcHNlZE1zKCk7XHJcbiAgICBjb25zdCBzZWMgPSBNYXRoLmZsb29yKGVsYXBzZWRNcyAvIDEwMDApO1xyXG4gICAgY29uc3QgbW0gPSBNYXRoLmZsb29yKHNlYyAvIDYwKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XHJcbiAgICBjb25zdCBzcyA9IChzZWMgJSA2MCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xyXG4gICAgaWYgKHRoaXMuZWxhcHNlZEVsKSB0aGlzLmVsYXBzZWRFbC50ZXh0Q29udGVudCA9IGAke21tfToke3NzfWA7XHJcbiAgICBpZiAodGhpcy5vcHRzLm1heER1cmF0aW9uU2VjID4gMCAmJiAhdGhpcy5pc1BhdXNlZCAmJiBzZWMgPj0gdGhpcy5vcHRzLm1heER1cmF0aW9uU2VjKSB7XHJcbiAgICAgIHRoaXMudHJpZ2dlclN0b3AoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRFbGFwc2VkTXMoKTogbnVtYmVyIHtcclxuICAgIGlmICghdGhpcy5zdGFydGVkQXQpIHJldHVybiAwO1xyXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5zdGFydGVkQXQgLSB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcztcclxuICAgIGlmICh0aGlzLmlzUGF1c2VkICYmIHRoaXMucGF1c2VTdGFydGVkQXQpIHtcclxuICAgICAgZWxhcHNlZCAtPSBub3cgLSB0aGlzLnBhdXNlU3RhcnRlZEF0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIGVsYXBzZWQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0cmlnZ2VyU3RvcChhcHBseVBvc3Q6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuZmluYWxpemVQYXVzZVN0YXRlKCk7XHJcbiAgICBjb25zdCBwcmVzZXRJZCA9IHRoaXMucHJlc2V0RHJvcGRvd24/LmdldFZhbHVlKCk7XHJcbiAgICB0aGlzLm9wdHMub25TdG9wKGFwcGx5UG9zdCwgcHJlc2V0SWQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0b2dnbGVQYXVzZSgpIHtcclxuICAgIGlmICh0aGlzLmlzUGF1c2VkKSB7XHJcbiAgICAgIHRoaXMucmVzdW1lUmVjb3JkaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnBhdXNlUmVjb3JkaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBhdXNlUmVjb3JkaW5nKCkge1xyXG4gICAgaWYgKHRoaXMuaXNQYXVzZWQpIHJldHVybjtcclxuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5wYXVzZVN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XHJcbiAgICB0aGlzLnVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKTtcclxuICAgIHRoaXMub3B0cy5vblBhdXNlPy4oKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzdW1lUmVjb3JkaW5nKCkge1xyXG4gICAgaWYgKCF0aGlzLmlzUGF1c2VkKSByZXR1cm47XHJcbiAgICBpZiAodGhpcy5wYXVzZVN0YXJ0ZWRBdCkgdGhpcy5hY2N1bXVsYXRlZFBhdXNlTXMgKz0gRGF0ZS5ub3coKSAtIHRoaXMucGF1c2VTdGFydGVkQXQ7XHJcbiAgICB0aGlzLnBhdXNlU3RhcnRlZEF0ID0gMDtcclxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMudXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpO1xyXG4gICAgdGhpcy5vcHRzLm9uUmVzdW1lPy4oKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZmluYWxpemVQYXVzZVN0YXRlKCkge1xyXG4gICAgaWYgKHRoaXMuaXNQYXVzZWQgJiYgdGhpcy5wYXVzZVN0YXJ0ZWRBdCkge1xyXG4gICAgICB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcyArPSBEYXRlLm5vdygpIC0gdGhpcy5wYXVzZVN0YXJ0ZWRBdDtcclxuICAgIH1cclxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSAwO1xyXG4gICAgdGhpcy51cGRhdGVQYXVzZUJ1dHRvbkxhYmVsKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0UGF1c2VTdGF0ZSgpIHtcclxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSAwO1xyXG4gICAgdGhpcy5hY2N1bXVsYXRlZFBhdXNlTXMgPSAwO1xyXG4gICAgdGhpcy51cGRhdGVQYXVzZUJ1dHRvbkxhYmVsKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKSB7XHJcbiAgICBpZiAoIXRoaXMucGF1c2VCdG5FbCkgcmV0dXJuO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLmNsYXNzTGlzdC50b2dnbGUoJ2lzLXBhdXNlZCcsIHRoaXMuaXNQYXVzZWQpO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLnRleHRDb250ZW50ID0gdGhpcy5pc1BhdXNlZCA/ICdcdTI1QjYnIDogJ1x1Mjc1QVx1Mjc1QSc7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCB0aGlzLmlzUGF1c2VkID8gJ3RydWUnIDogJ2ZhbHNlJyk7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgdGhpcy5pc1BhdXNlZCA/ICdSZXN1bWUgcmVjb3JkaW5nJyA6ICdQYXVzZSByZWNvcmRpbmcnKTtcclxuICB9XHJcblxyXG4gIC8vIFB1YmxpYyBVSSBoZWxwZXJzXHJcbiAgc2V0UGhhc2UocGhhc2U6ICdyZWNvcmRpbmcnIHwgJ3RyYW5zY3JpYmluZycgfCAncG9zdHByb2Nlc3NpbmcnIHwgJ2RvbmUnIHwgJ2Vycm9yJykge1xyXG4gICAgdGhpcy5yb290RWw/LnNldEF0dHJpYnV0ZSgnZGF0YS1waGFzZScsIHBoYXNlKTtcclxuICAgIGlmIChwaGFzZSAhPT0gJ3JlY29yZGluZycpIHtcclxuICAgICAgdGhpcy5maW5hbGl6ZVBhdXNlU3RhdGUoKTtcclxuICAgICAgaWYgKHRoaXMudGltZXIpIHsgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7IHRoaXMudGltZXIgPSB1bmRlZmluZWQ7IH1cclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBhdXNlQnRuRWwpIHRoaXMucGF1c2VCdG5FbC5kaXNhYmxlZCA9IHBoYXNlICE9PSAncmVjb3JkaW5nJztcclxuICB9XHJcblxyXG4gIHNldFN0YXR1cyh0ZXh0OiBzdHJpbmcpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1c1RleHRFbCkgdGhpcy5zdGF0dXNUZXh0RWwudGV4dENvbnRlbnQgPSB0ZXh0O1xyXG4gIH1cclxuXHJcbiAgc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQodHJhbnNjcmliZUVuYWJsZWQ6IGJvb2xlYW4sIHBvc3Rwcm9jZXNzRW5hYmxlZDogYm9vbGVhbiwgZGlzY2FyZEVuYWJsZWQ6IGJvb2xlYW4pIHtcclxuICAgIGlmICh0aGlzLnRyYW5zY3JpYmVCdG5FbCkgdGhpcy50cmFuc2NyaWJlQnRuRWwuZGlzYWJsZWQgPSAhdHJhbnNjcmliZUVuYWJsZWQ7XHJcbiAgICBpZiAodGhpcy5wb3N0cHJvY2Vzc0J0bkVsKSB0aGlzLnBvc3Rwcm9jZXNzQnRuRWwuZGlzYWJsZWQgPSAhcG9zdHByb2Nlc3NFbmFibGVkO1xyXG4gICAgaWYgKHRoaXMuZGlzY2FyZEJ0bkVsKSB0aGlzLmRpc2NhcmRCdG5FbC5kaXNhYmxlZCA9ICFkaXNjYXJkRW5hYmxlZDtcclxuICB9XHJcblxyXG4gIHNldERpc2NhcmRMYWJlbChsYWJlbDogc3RyaW5nKSB7XHJcbiAgICBpZiAodGhpcy5kaXNjYXJkQnRuRWwpIHRoaXMuZGlzY2FyZEJ0bkVsLnRleHRDb250ZW50ID0gbGFiZWw7XHJcbiAgfVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUErRDs7O0FDQS9ELHNCQUF3RTtBQUdqRSxJQUFNLHlCQUFOLGNBQXFDLGlDQUFpQjtBQUFBLEVBQzNELFlBQVksS0FBVSxRQUF3QixhQUFpRCxjQUFtRTtBQUNoSyxVQUFNLEtBQUssTUFBTTtBQUQyQjtBQUFpRDtBQUFBLEVBRS9GO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFVBQU0sRUFBRSxZQUFZLElBQUk7QUFDeEIsZ0JBQVksTUFBTTtBQUNsQixnQkFBWSxTQUFTLE1BQU0sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUUvQyxVQUFNLElBQUksS0FBSyxZQUFZO0FBRzNCLGdCQUFZLFNBQVMsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLGNBQWMsRUFDdEIsUUFBUSxnREFBZ0QsRUFDeEQsUUFB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cEIsVUFBTSxhQUFhLEtBQUssV0FBVyxHQUFHLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSTtBQUMxRCxVQUFNLFNBQVMsS0FBSyxTQUFTLG1CQUFtQixPQUFPO0FBQ3ZELFVBQU0sUUFBUSxLQUFLLFNBQVMsa0JBQWtCLE9BQU87QUFDckQsVUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLFVBQVUsR0FBRyxLQUFLO0FBRTlDLFFBQUk7QUFDSixRQUFJLEtBQUssU0FBUyxlQUFlLGFBQWEsT0FBTyxrQkFBa0IsR0FBRztBQUN4RSxjQUFTLE9BQWUsVUFBVSxNQUFNO0FBQ3hDLGFBQU8saUJBQWlCLE9BQU87QUFBQSxJQUNqQyxPQUFPO0FBQ0wsY0FBUSxPQUFPLFVBQVU7QUFDekIsYUFBTyxhQUFhLFNBQVMsS0FBSztBQUFBLElBQ3BDO0FBQ0EsVUFBTSxRQUFRLEtBQUssV0FBVyxPQUFPLEdBQUcsTUFBTSxHQUFHLFVBQVUsRUFBRTtBQUM3RCxXQUFPLFVBQVUsS0FBSztBQUFBLEVBQ3hCO0FBQUEsRUFFUSxXQUFXLE9BQXVCLE1BQThCO0FBQ3RFLFVBQU0sUUFBUSxLQUFLLE1BQU0sSUFBSTtBQUM3QixRQUFJLE1BQU0sV0FBVyxFQUFHLFFBQU8sRUFBRSxNQUFNLE1BQU0sTUFBTSxJQUFJLE1BQU0sS0FBSyxNQUFNLENBQUMsRUFBRSxPQUFPO0FBQ2xGLFVBQU0sYUFBYSxNQUFNLFNBQVM7QUFDbEMsVUFBTSxVQUFVLE1BQU0sTUFBTSxTQUFTLENBQUMsRUFBRTtBQUN4QyxXQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sWUFBWSxJQUFJLFFBQVE7QUFBQSxFQUN0RDtBQUFBLEVBRVEsbUJBQW1CLEtBQWEsV0FBbUIsc0JBQStCLFFBQStCO0FBQ3ZILFVBQU0scUNBQXFDLFFBQVEsc0NBQXNDO0FBQ3pGLFFBQUksRUFBRSx3QkFBd0Isb0NBQXFDLFFBQU87QUFDMUUsVUFBTSxTQUFTLEtBQUssZ0JBQWdCLEdBQUc7QUFDdkMsUUFBSSxDQUFDLE9BQVEsUUFBTztBQUNwQixXQUFPLFVBQVUsS0FBSyxFQUFFLFNBQVMsR0FBRyxNQUFNO0FBQUE7QUFBQSxFQUFPLFNBQVMsS0FBSztBQUFBLEVBQ2pFO0FBQUEsRUFFUSxnQkFBZ0IsS0FBcUI7QUFDM0MsVUFBTSxhQUFhLElBQUksS0FBSztBQUM1QixRQUFJLENBQUMsV0FBWSxRQUFPO0FBQ3hCLFVBQU0sYUFBYSxXQUFXLE1BQU0sU0FBUztBQUM3QyxVQUFNLGVBQWUsV0FBVyxJQUFJLENBQUMsY0FBYztBQUNqRCxZQUFNLFFBQVEsVUFBVSxNQUFNLElBQUk7QUFDbEMsYUFBTyxNQUFNLElBQUksVUFBUSxLQUFLLEtBQUssUUFBUSxDQUFDLEVBQUUsRUFBRSxLQUFLLElBQUk7QUFBQSxJQUMzRCxDQUFDO0FBQ0QsV0FBTyxhQUFhLEtBQUssT0FBTztBQUFBLEVBQ2xDO0FBQ0Y7IiwKICAibmFtZXMiOiBbImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iXQp9Cg==
