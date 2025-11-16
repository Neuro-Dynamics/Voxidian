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
        new import_obsidian.Setting(wrap).setName("Replace selection").setDesc("When enabled, Voxidian replaces the current editor selection with this preset's output.").addToggle((t) => t.setValue(p.replaceSelection ?? st.insertMode === "replace").onChange(async (v) => {
          p.replaceSelection = v;
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
      renderPresets();
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
    const view = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
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
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9yZWNvcmRlci50cyIsICJzcmMvcG9zdHByb2Nlc3MudHMiLCAic3JjL3RyYW5zY3JpYmUudHMiLCAic3JjL3R5cGVzLnRzIiwgInNyYy91aS9SZWNvcmRpbmdNb2RhbC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQXBwLCBNYXJrZG93blZpZXcsIFBsdWdpbiwgdHlwZSBFZGl0b3JQb3NpdGlvbiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEFJVHJhbnNjcmlwdFNldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IEF1ZGlvUmVjb3JkZXIgfSBmcm9tICcuL3JlY29yZGVyJztcbmltcG9ydCB7IHBvc3Rwcm9jZXNzV2l0aE9wZW5BSSB9IGZyb20gJy4vcG9zdHByb2Nlc3MnO1xuaW1wb3J0IHsgdHJhbnNjcmliZVdpdGhHcm9xIH0gZnJvbSAnLi90cmFuc2NyaWJlJztcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIHR5cGUgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIHR5cGUgUHJvbXB0UHJlc2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSZWNvcmRpbmdNb2RhbCB9IGZyb20gJy4vdWkvUmVjb3JkaW5nTW9kYWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBSVRyYW5zY3JpcHRQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MgPSB7IC4uLkRFRkFVTFRfU0VUVElOR1MsIHByb21wdFByZXNldHM6IFsuLi5ERUZBVUxUX1NFVFRJTkdTLnByb21wdFByZXNldHNdIH07XG4gIHByaXZhdGUgcmVjb3JkZXI/OiBBdWRpb1JlY29yZGVyO1xuICBwcml2YXRlIG1vZGFsPzogUmVjb3JkaW5nTW9kYWw7XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuXG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdtaWMnLCAnUmVjb3JkICYgVHJhbnNjcmliZScsICgpID0+IHRoaXMudG9nZ2xlUmVjb3JkaW5nKCkpO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAndm94aWRpYW4tc3RhcnQtc3RvcCcsXG4gICAgICBuYW1lOiAnU3RhcnQvU3RvcCBSZWNvcmRpbmcnLFxuICAgICAgaG90a2V5czogW3sgbW9kaWZpZXJzOiBbJ01vZCcsICdTaGlmdCddLCBrZXk6ICdNJyB9XSxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnRvZ2dsZVJlY29yZGluZygpLFxuICAgIH0pO1xuXG4gICAgLy8gTW9iaWxlIHRvb2xiYXIgYWN0aW9uOiBhcHBlYXJzIGluIE9ic2lkaWFuIE1vYmlsZSBlZGl0b3IgdG9vbGJhclxuICAgIC8vIFVzZXJzIGNhbiBhZGQgdGhpcyBjb21tYW5kIHRvIHRoZSBtb2JpbGUgdG9vbGJhciB2aWEgU2V0dGluZ3MgXHUyMTkyIE1vYmlsZSBcdTIxOTIgVG9vbGJhclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3JlY29yZC10cmFuc2NyaWJlLWluc2VydCcsXG4gICAgICBuYW1lOiAnUmVjb3JkIFx1MjAyMiBUcmFuc2NyaWJlIFx1MjAyMiBJbnNlcnQnLFxuICAgICAgaWNvbjogJ21pYycsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKCkgPT4gdGhpcy50b2dnbGVSZWNvcmRpbmcoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgQUlUcmFuc2NyaXB0U2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcywgKCkgPT4gdGhpcy5zZXR0aW5ncywgYXN5bmMgKHBhcnRpYWwpID0+IHtcbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5zZXR0aW5ncywgcGFydGlhbCk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICAgIH0pKTtcbiAgfVxuXG4gIG9udW5sb2FkKCkge1xuICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7IH1cbiAgICB0cnkgeyB0aGlzLm1vZGFsPy5jbG9zZSgpOyB9IGNhdGNoIHsgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyB0b2dnbGVSZWNvcmRpbmcoKSB7XG4gICAgLy8gSWYgbW9kYWwgaXMgb3Blbiwgc3RvcCBub3cgKHNpbXVsYXRlIGNsaWNraW5nIFN0b3ApXG4gICAgaWYgKHRoaXMubW9kYWwpIHtcbiAgICAgIC8vIG5vb3AgXHUyMDE0IHN0b3BwaW5nIGlzIGRyaXZlbiB2aWEgbW9kYWwgYnV0dG9uIHRvIHByZXNlcnZlIHByZXNldC9hcHBseSBzdGF0ZVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB3ZSBoYXZlIGFuIGVkaXRvciB0byBpbnNlcnQgaW50byBsYXRlciAobm90IHN0cmljdGx5IHJlcXVpcmVkIGJ1dCBoZWxwcyBVWClcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICBpZiAoIXZpZXcpIHJldHVybjsgLy8gTVZQOiByZXF1aXJlIGFjdGl2ZSBtYXJrZG93biB2aWV3XG5cbiAgICAvLyBQcmVwYXJlIHJlY29yZGVyIGFuZCBtb2RhbFxuICAgIHRoaXMucmVjb3JkZXIgPSBuZXcgQXVkaW9SZWNvcmRlcigpO1xuICAgIGNvbnN0IHByZXNldHMgPSB0aGlzLnNldHRpbmdzLnByb21wdFByZXNldHMubWFwKHAgPT4gKHsgaWQ6IHAuaWQsIG5hbWU6IHAubmFtZSB9KSk7XG4gICAgY29uc3QgbW9kYWwgPSBuZXcgUmVjb3JkaW5nTW9kYWwodGhpcy5hcHAsIHtcbiAgICAgIHByZXNldHMsXG4gICAgICBkZWZhdWx0UHJlc2V0SWQ6IHRoaXMuc2V0dGluZ3MubGFzdFVzZWRQcm9tcHRJZCB8fCB0aGlzLnNldHRpbmdzLmRlZmF1bHRQcm9tcHRJZCxcbiAgICAgIG1heER1cmF0aW9uU2VjOiB0aGlzLnNldHRpbmdzLm1heER1cmF0aW9uU2VjLFxuICAgICAgb25TdGFydDogYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IHRoaXMucmVjb3JkZXIhLnN0YXJ0KCk7XG4gICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ2Vycm9yJyk7XG4gICAgICAgICAgbW9kYWwuc2V0U3RhdHVzKCdNaWNyb3Bob25lIHBlcm1pc3Npb24gb3IgcmVjb3JkZXIgZXJyb3IuJyk7XG4gICAgICAgICAgbW9kYWwuc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQoZmFsc2UsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBtb2RhbC5zZXREaXNjYXJkTGFiZWwoJ0Nsb3NlJyk7XG4gICAgICAgICAgdGhpcy5yZWNvcmRlcj8uZGlzY2FyZCgpO1xuICAgICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvblN0b3A6IGFzeW5jIChhcHBseVBvc3QsIHByZXNldElkKSA9PiB7XG4gICAgICAgIG1vZGFsLnNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICBtb2RhbC5zZXRQaGFzZSgndHJhbnNjcmliaW5nJyk7XG4gICAgICAgIG1vZGFsLnNldFN0YXR1cygnVHJhbnNjcmliaW5nXHUyMDI2Jyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IHByZXNldDogUHJvbXB0UHJlc2V0IHwgdW5kZWZpbmVkO1xuICAgICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCB0aGlzLnJlY29yZGVyIS5zdG9wKCk7XG4gICAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBjb25zdCByYXcgPSBhd2FpdCB0cmFuc2NyaWJlV2l0aEdyb3EoYmxvYiwgdGhpcy5zZXR0aW5ncyk7XG4gICAgICAgICAgbGV0IHRleHQgPSByYXc7XG4gICAgICAgICAgaWYgKGFwcGx5UG9zdCkge1xuICAgICAgICAgICAgcHJlc2V0ID0gdGhpcy5zZXR0aW5ncy5wcm9tcHRQcmVzZXRzLmZpbmQocCA9PiBwLmlkID09PSBwcmVzZXRJZCkgYXMgUHJvbXB0UHJlc2V0IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5sYXN0VXNlZFByb21wdElkID0gcHJlc2V0Py5pZCB8fCBwcmVzZXRJZCB8fCB0aGlzLnNldHRpbmdzLmxhc3RVc2VkUHJvbXB0SWQ7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICAgICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ3Bvc3Rwcm9jZXNzaW5nJyk7XG4gICAgICAgICAgICBtb2RhbC5zZXRTdGF0dXMoJ0NsZWFuaW5nIHRyYW5zY3JpcHRcdTIwMjYnKTtcbiAgICAgICAgICAgIC8vIENhcHR1cmUgY3VycmVudCBzZWxlY3Rpb24gZnJvbSBhY3RpdmUgZWRpdG9yIHRvIGluY2x1ZGUgYXMgY29udGV4dCBvciBpbmxpbmUgaW4gc3lzdGVtXG4gICAgICAgICAgICBjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGFjdGl2ZVZpZXc/LmVkaXRvcj8uZ2V0U2VsZWN0aW9uKCkgfHwgJyc7XG4gICAgICAgICAgICB0ZXh0ID0gYXdhaXQgcG9zdHByb2Nlc3NXaXRoT3BlbkFJKHJhdywgdGhpcy5zZXR0aW5ncywgcHJlc2V0LCBzZWxlY3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmaW5hbE91dHB1dCA9IHRoaXMuY29tYmluZVRyYW5zY3JpcHRzKHJhdywgdGV4dCwgYXBwbHlQb3N0LCBwcmVzZXQpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuaW5zZXJ0VGV4dChmaW5hbE91dHB1dCwgcHJlc2V0Py5yZXBsYWNlU2VsZWN0aW9uKTtcbiAgICAgICAgICBtb2RhbC5zZXRQaGFzZSgnZG9uZScpO1xuICAgICAgICAgIG1vZGFsLnNldFN0YXR1cygnVHJhbnNjcmlwdCBpbnNlcnRlZCBpbnRvIHRoZSBub3RlLicpO1xuICAgICAgICAgIG1vZGFsLnNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgbW9kYWwuc2V0RGlzY2FyZExhYmVsKCdDbG9zZScpO1xuICAgICAgICAgIG1vZGFsLmNsb3NlKCk7XG4gICAgICAgICAgaWYgKHRoaXMubW9kYWwgPT09IG1vZGFsKSB0aGlzLm1vZGFsID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgIG1vZGFsLnNldFBoYXNlKCdlcnJvcicpO1xuICAgICAgICAgIG1vZGFsLnNldFN0YXR1cyhgRXJyb3I6ICR7ZT8ubWVzc2FnZSB8fCBlfWApO1xuICAgICAgICAgIG1vZGFsLnNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgbW9kYWwuc2V0RGlzY2FyZExhYmVsKCdDbG9zZScpO1xuICAgICAgICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7IH1cbiAgICAgICAgICB0aGlzLnJlY29yZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIC8vIGtlZXAgbW9kYWwgb3BlbiBmb3IgdXNlciB0byByZWFkL2Nsb3NlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbkRpc2NhcmQ6ICgpID0+IHtcbiAgICAgICAgdHJ5IHsgdGhpcy5yZWNvcmRlcj8uZGlzY2FyZCgpOyB9IGNhdGNoIHsgfVxuICAgICAgICB0aGlzLnJlY29yZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgICAgICB0aGlzLm1vZGFsID0gdW5kZWZpbmVkO1xuICAgICAgfSxcbiAgICAgIG9uUGF1c2U6ICgpID0+IHRoaXMucmVjb3JkZXI/LnBhdXNlKCksXG4gICAgICBvblJlc3VtZTogKCkgPT4gdGhpcy5yZWNvcmRlcj8ucmVzdW1lKCksXG4gICAgICBvbkNsb3NlOiAoKSA9PiB7XG4gICAgICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7IH1cbiAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMubW9kYWwgPT09IG1vZGFsKSB0aGlzLm1vZGFsID0gdW5kZWZpbmVkO1xuICAgICAgfSxcbiAgICB9KTtcbiAgICB0aGlzLm1vZGFsID0gbW9kYWw7XG5cbiAgICAvLyBNVlAgdXNlcyBtb2RhbCB0byBwcmVzZW50IGFsbCBzdGF0dXMgYW5kIGFuaW1hdGlvbnNcbiAgICBtb2RhbC5vcGVuKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluc2VydFRleHQodGV4dDogc3RyaW5nLCByZXBsYWNlU2VsZWN0aW9uT3ZlcnJpZGU/OiBib29sZWFuKSB7XG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgaWYgKCF2aWV3KSB0aHJvdyBuZXcgRXJyb3IoJ05vIGFjdGl2ZSBNYXJrZG93biBlZGl0b3InKTtcbiAgICBjb25zdCBlZGl0b3IgPSB2aWV3LmVkaXRvcjtcbiAgICBjb25zdCBub3JtYWxpemVkID0gdGV4dC5zdGFydHNXaXRoKCcgJykgPyB0ZXh0LnNsaWNlKDEpIDogdGV4dDtcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLnNldHRpbmdzLmFkZE5ld2xpbmVCZWZvcmUgPyAnXFxuJyA6ICcnO1xuICAgIGNvbnN0IGFmdGVyID0gdGhpcy5zZXR0aW5ncy5hZGROZXdsaW5lQWZ0ZXIgPyAnXFxuJyA6ICcnO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBgJHtiZWZvcmV9JHtub3JtYWxpemVkfSR7YWZ0ZXJ9YDtcblxuICAgIGxldCBzdGFydDogRWRpdG9yUG9zaXRpb247XG4gICAgY29uc3QgcmVwbGFjZVNlbGVjdGlvbiA9IHJlcGxhY2VTZWxlY3Rpb25PdmVycmlkZSA/PyAodGhpcy5zZXR0aW5ncy5pbnNlcnRNb2RlID09PSAncmVwbGFjZScpO1xuICAgIGlmIChyZXBsYWNlU2VsZWN0aW9uICYmIGVkaXRvci5zb21ldGhpbmdTZWxlY3RlZCgpKSB7XG4gICAgICBzdGFydCA9IChlZGl0b3IgYXMgYW55KS5nZXRDdXJzb3IoJ2Zyb20nKSBhcyBFZGl0b3JQb3NpdGlvbjtcbiAgICAgIGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKGNvbnRlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGFydCA9IGVkaXRvci5nZXRDdXJzb3IoKTtcbiAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoY29udGVudCwgc3RhcnQpO1xuICAgIH1cbiAgICBjb25zdCBjYXJldCA9IHRoaXMuYWR2YW5jZVBvcyhzdGFydCwgYCR7YmVmb3JlfSR7bm9ybWFsaXplZH1gKTtcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yKGNhcmV0KTtcbiAgfVxuXG4gIHByaXZhdGUgYWR2YW5jZVBvcyhzdGFydDogRWRpdG9yUG9zaXRpb24sIHRleHQ6IHN0cmluZyk6IEVkaXRvclBvc2l0aW9uIHtcbiAgICBjb25zdCBwYXJ0cyA9IHRleHQuc3BsaXQoJ1xcbicpO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHJldHVybiB7IGxpbmU6IHN0YXJ0LmxpbmUsIGNoOiBzdGFydC5jaCArIHBhcnRzWzBdLmxlbmd0aCB9O1xuICAgIGNvbnN0IGxpbmVzQWRkZWQgPSBwYXJ0cy5sZW5ndGggLSAxO1xuICAgIGNvbnN0IGxhc3RMZW4gPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS5sZW5ndGg7XG4gICAgcmV0dXJuIHsgbGluZTogc3RhcnQubGluZSArIGxpbmVzQWRkZWQsIGNoOiBsYXN0TGVuIH07XG4gIH1cblxuICBwcml2YXRlIGNvbWJpbmVUcmFuc2NyaXB0cyhyYXc6IHN0cmluZywgcHJvY2Vzc2VkOiBzdHJpbmcsIHBvc3Rwcm9jZXNzZWRBcHBsaWVkOiBib29sZWFuLCBwcmVzZXQ/OiBQcm9tcHRQcmVzZXQpOiBzdHJpbmcge1xuICAgIGNvbnN0IGluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQgPSBwcmVzZXQ/LmluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQgPz8gdHJ1ZTtcbiAgICBpZiAoIShwb3N0cHJvY2Vzc2VkQXBwbGllZCAmJiBpbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkKSkgcmV0dXJuIHByb2Nlc3NlZDtcbiAgICBjb25zdCBxdW90ZWQgPSB0aGlzLnF1b3RlVHJhbnNjcmlwdChyYXcpO1xuICAgIGlmICghcXVvdGVkKSByZXR1cm4gcHJvY2Vzc2VkO1xuICAgIHJldHVybiBwcm9jZXNzZWQudHJpbSgpLmxlbmd0aCA/IGAke3F1b3RlZH1cXG5cXG4ke3Byb2Nlc3NlZH1gIDogcXVvdGVkO1xuICB9XG5cbiAgcHJpdmF0ZSBxdW90ZVRyYW5zY3JpcHQocmF3OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSByYXcudHJpbSgpO1xuICAgIGlmICghbm9ybWFsaXplZCkgcmV0dXJuICcnO1xuICAgIGNvbnN0IHBhcmFncmFwaHMgPSBub3JtYWxpemVkLnNwbGl0KC9cXG5cXHMqXFxuLyk7XG4gICAgY29uc3QgcXVvdGVkQmxvY2tzID0gcGFyYWdyYXBocy5tYXAoKHBhcmFncmFwaCkgPT4ge1xuICAgICAgY29uc3QgbGluZXMgPSBwYXJhZ3JhcGguc3BsaXQoJ1xcbicpO1xuICAgICAgcmV0dXJuIGxpbmVzLm1hcChsaW5lID0+IGA+ICR7bGluZS50cmltRW5kKCl9YCkuam9pbignXFxuJyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHF1b3RlZEJsb2Nrcy5qb2luKCdcXG4+XFxuJyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIEJ1dHRvbkNvbXBvbmVudCwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBBSVRyYW5zY3JpcHRTZXR0aW5ncywgUHJvbXB0UHJlc2V0IH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBBSVRyYW5zY3JpcHRTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFBsdWdpbiwgcHJpdmF0ZSBnZXRTZXR0aW5nczogKCkgPT4gQUlUcmFuc2NyaXB0U2V0dGluZ3MsIHByaXZhdGUgc2F2ZVNldHRpbmdzOiAoczogUGFydGlhbDxBSVRyYW5zY3JpcHRTZXR0aW5ncz4pID0+IFByb21pc2U8dm9pZD4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDEnLCB7IHRleHQ6ICdWb3hpZGlhbicgfSk7XG5cbiAgICBjb25zdCBzID0gdGhpcy5nZXRTZXR0aW5ncygpO1xuXG4gICAgLy8gR1JPUVxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ0dyb3EgV2hpc3BlcicgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnR3JvcSBBUEkgS2V5JylcbiAgICAgIC5zZXREZXNjKCdSZXF1aXJlZCB0byB0cmFuc2NyaWJlIGF1ZGlvIHZpYSBHcm9xIFdoaXNwZXIuJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2dza18uLi4nKVxuICAgICAgICAuc2V0VmFsdWUocy5ncm9xQXBpS2V5IHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBncm9xQXBpS2V5OiB2LnRyaW0oKSB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnR3JvcSBtb2RlbCcpXG4gICAgICAuc2V0RGVzYygnRGVmYXVsdDogd2hpc3Blci1sYXJnZS12MycpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFZhbHVlKHMuZ3JvcU1vZGVsKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBncm9xTW9kZWw6IHYudHJpbSgpIHx8ICd3aGlzcGVyLWxhcmdlLXYzJyB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnTGFuZ3VhZ2UgKG9wdGlvbmFsKScpXG4gICAgICAuc2V0RGVzYygnSVNPIGNvZGUgbGlrZSBlbiwgZXMsIGRlLiBMZWF2ZSBlbXB0eSBmb3IgYXV0by4nKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRWYWx1ZShzLmxhbmd1YWdlIHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBsYW5ndWFnZTogdi50cmltKCkgfHwgdW5kZWZpbmVkIH0pOyB9KSk7XG5cbiAgICAvLyBPcGVuQUlcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdPcGVuQUkgUG9zdHByb2Nlc3NpbmcgKG9wdGlvbmFsKScgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnT3BlbkFJIEFQSSBLZXknKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRQbGFjZWhvbGRlcignc2stLi4uJylcbiAgICAgICAgLnNldFZhbHVlKHMub3BlbmFpQXBpS2V5IHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBvcGVuYWlBcGlLZXk6IHYudHJpbSgpIH0pOyB9KSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdPcGVuQUkgbW9kZWwnKVxuICAgICAgLnNldERlc2MoJ0RlZmF1bHQ6IGdwdC00by1taW5pJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0VmFsdWUocy5vcGVuYWlNb2RlbClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgb3BlbmFpTW9kZWw6IHYudHJpbSgpIHx8ICdncHQtNG8tbWluaScgfSk7IH0pKTtcblxuICAgIC8vIFByZXNldHNcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdQcm9tcHQgcHJlc2V0cycgfSk7XG5cbiAgICBjb25zdCBsaXN0RWwgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoKTtcbiAgICBjb25zdCByZW5kZXJQcmVzZXRzID0gKCkgPT4ge1xuICAgICAgbGlzdEVsLmVtcHR5KCk7XG4gICAgICBjb25zdCBzdCA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcbiAgICAgIHN0LnByb21wdFByZXNldHMuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgICBjb25zdCB3cmFwID0gbGlzdEVsLmNyZWF0ZURpdih7IGNsczogJ2FpLXByZXNldCcgfSk7XG4gICAgICAgIGNvbnN0IGhlYWRlciA9IHdyYXAuY3JlYXRlRGl2KHsgY2xzOiAnYWktcHJlc2V0LWhlYWRlcicgfSk7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gaGVhZGVyLmNyZWF0ZURpdih7IGNsczogJ2FpLXByZXNldC10aXRsZScgfSk7XG4gICAgICAgIHRpdGxlLmNyZWF0ZUVsKCdoNCcsIHsgdGV4dDogcC5uYW1lLCBjbHM6ICdhaS1wcmVzZXQtbmFtZScgfSk7XG4gICAgICAgIGlmIChzdC5kZWZhdWx0UHJvbXB0SWQgPT09IHAuaWQpIHRpdGxlLmNyZWF0ZVNwYW4oeyB0ZXh0OiAnRGVmYXVsdCBwcmVzZXQnLCBjbHM6ICdhaS1wcmVzZXQtZGVmYXVsdCcgfSk7XG4gICAgICAgIGNvbnN0IGFjdGlvbnNFbCA9IGhlYWRlci5jcmVhdGVEaXYoeyBjbHM6ICdhaS1wcmVzZXQtYWN0aW9ucycgfSk7XG4gICAgICAgIG5ldyBCdXR0b25Db21wb25lbnQoYWN0aW9uc0VsKVxuICAgICAgICAgIC5zZXRCdXR0b25UZXh0KCdTZXQgYXMgRGVmYXVsdCcpXG4gICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBkZWZhdWx0UHJvbXB0SWQ6IHAuaWQgfSk7XG4gICAgICAgICAgICByZW5kZXJQcmVzZXRzKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIG5ldyBCdXR0b25Db21wb25lbnQoYWN0aW9uc0VsKVxuICAgICAgICAgIC5zZXRCdXR0b25UZXh0KCdEZWxldGUnKVxuICAgICAgICAgIC5zZXRXYXJuaW5nKClcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IHN0LnByb21wdFByZXNldHMuZmlsdGVyKHggPT4geC5pZCAhPT0gcC5pZCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IGZpbHRlcmVkIH0pO1xuICAgICAgICAgICAgcmVuZGVyUHJlc2V0cygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKCdOYW1lJylcbiAgICAgICAgICAuYWRkVGV4dCh0ID0+IHQuc2V0VmFsdWUocC5uYW1lKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgcC5uYW1lID0gdjsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnU3lzdGVtIHByb21wdCcpXG4gICAgICAgICAgLnNldERlc2MoJ1N1cHBvcnRzIHt7c2VsZWN0aW9ufX0gcGxhY2Vob2xkZXI7IHdoZW4gYWJzZW50LCBjdXJyZW50IHNlbGVjdGlvbiBpcyBwcmVwZW5kZWQgYXMgY29udGV4dC4nKVxuICAgICAgICAgIC5hZGRUZXh0QXJlYSh0ID0+IHtcbiAgICAgICAgICAgIHQuc2V0VmFsdWUocC5zeXN0ZW0pO1xuICAgICAgICAgICAgdC5pbnB1dEVsLnJvd3MgPSA2O1xuICAgICAgICAgICAgdC5pbnB1dEVsLmFkZENsYXNzKCdhaS1zeXN0ZW0tdGV4dGFyZWEnKTtcbiAgICAgICAgICAgIHQub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgICAgcC5zeXN0ZW0gPSB2OyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IHN0LnByb21wdFByZXNldHMgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnVGVtcGVyYXR1cmUnKVxuICAgICAgICAgIC5hZGRUZXh0KHQgPT4gdC5zZXRWYWx1ZShTdHJpbmcocC50ZW1wZXJhdHVyZSkpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIodik7IHAudGVtcGVyYXR1cmUgPSBpc0Zpbml0ZShudW0pID8gbnVtIDogMC4yOyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IHN0LnByb21wdFByZXNldHMgfSk7XG4gICAgICAgICAgfSkpO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKCdNb2RlbCBvdmVycmlkZSAob3B0aW9uYWwpJylcbiAgICAgICAgICAuYWRkVGV4dCh0ID0+IHQuc2V0UGxhY2Vob2xkZXIoJ2UuZy4sIGdwdC00by1taW5pJykuc2V0VmFsdWUocC5tb2RlbCB8fCAnJykub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgIHAubW9kZWwgPSB2LnRyaW0oKSB8fCB1bmRlZmluZWQ7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ0luY2x1ZGUgdHJhbnNjcmlwdCB3aXRoIHBvc3Rwcm9jZXNzZWQgbWVzc2FnZScpXG4gICAgICAgICAgLnNldERlc2MoJ1ByZXBlbmRzIHRoZSByYXcgdHJhbnNjcmlwdCBxdW90ZWQgd2l0aCBcIj5cIiB3aGVuIHBvc3Rwcm9jZXNzaW5nIHN1Y2NlZWRzLicpXG4gICAgICAgICAgLmFkZFRvZ2dsZSh0ID0+IHRcbiAgICAgICAgICAgIC5zZXRWYWx1ZShwLmluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQgPz8gdHJ1ZSlcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgICBwLmluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQgPSB2O1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IHN0LnByb21wdFByZXNldHMgfSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ1JlcGxhY2Ugc2VsZWN0aW9uJylcbiAgICAgICAgICAuc2V0RGVzYygnV2hlbiBlbmFibGVkLCBWb3hpZGlhbiByZXBsYWNlcyB0aGUgY3VycmVudCBlZGl0b3Igc2VsZWN0aW9uIHdpdGggdGhpcyBwcmVzZXRcXCdzIG91dHB1dC4nKVxuICAgICAgICAgIC5hZGRUb2dnbGUodCA9PiB0XG4gICAgICAgICAgICAuc2V0VmFsdWUocC5yZXBsYWNlU2VsZWN0aW9uID8/IChzdC5pbnNlcnRNb2RlID09PSAncmVwbGFjZScpKVxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICAgIHAucmVwbGFjZVNlbGVjdGlvbiA9IHY7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgLy8gQWRkIHNvbWUgc3BhY2UgYWZ0ZXIgZWFjaCBwcmVzZXRcbiAgICAgICAgd3JhcC5jcmVhdGVFbCgnYnInKTtcblxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlclByZXNldHMoKTtcblxuICAgIC8vIEFkZCBhIHNlcGFyYXRvciBiZWZvcmUgdGhlIEFkZCBidXR0b25cbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaHInKTtcblxuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQWRkIHByZXNldCcpXG4gICAgICAuYWRkQnV0dG9uKGIgPT4gYi5zZXRCdXR0b25UZXh0KCdBZGQnKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3QgPSB0aGlzLmdldFNldHRpbmdzKCk7XG4gICAgICAgIGNvbnN0IGlkID0gYHByZXNldC0ke0RhdGUubm93KCl9YDtcbiAgICAgICAgY29uc3QgcHJlc2V0OiBQcm9tcHRQcmVzZXQgPSB7IGlkLCBuYW1lOiAnTmV3IFByZXNldCcsIHN5c3RlbTogJ0VkaXQgbWVcdTIwMjYnLCB0ZW1wZXJhdHVyZTogMC4yLCBpbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkOiB0cnVlIH07XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogWy4uLnN0LnByb21wdFByZXNldHMsIHByZXNldF0gfSk7XG4gICAgICAgIHJlbmRlclByZXNldHMoKTtcbiAgICAgIH0pKTtcblxuICAgIC8vIFJlY29yZGluZyBiZWhhdmlvclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1JlY29yZGluZyAmIEluc2VydGlvbicgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnU2hvdyByZWNvcmRpbmcgbW9kYWwnKVxuICAgICAgLmFkZFRvZ2dsZSh0ID0+IHQuc2V0VmFsdWUocy5zaG93TW9kYWxXaGlsZVJlY29yZGluZykub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBzaG93TW9kYWxXaGlsZVJlY29yZGluZzogdiB9KTtcbiAgICAgIH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdNYXggZHVyYXRpb24gKHNlY29uZHMpJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdC5zZXRWYWx1ZShTdHJpbmcocy5tYXhEdXJhdGlvblNlYykpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgIGNvbnN0IG4gPSBOdW1iZXIodik7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgbWF4RHVyYXRpb25TZWM6IGlzRmluaXRlKG4pICYmIG4gPiAwID8gTWF0aC5mbG9vcihuKSA6IDkwMCB9KTtcbiAgICAgIH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdJbnNlcnQgbW9kZScpXG4gICAgICAuc2V0RGVzYygnSW5zZXJ0IGF0IGN1cnNvciBvciByZXBsYWNlIHNlbGVjdGlvbicpXG4gICAgICAuYWRkRHJvcGRvd24oZCA9PiBkXG4gICAgICAgIC5hZGRPcHRpb24oJ2luc2VydCcsICdJbnNlcnQgYXQgY3Vyc29yJylcbiAgICAgICAgLmFkZE9wdGlvbigncmVwbGFjZScsICdSZXBsYWNlIHNlbGVjdGlvbicpXG4gICAgICAgIC5zZXRWYWx1ZShzLmluc2VydE1vZGUpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgaW5zZXJ0TW9kZTogdiBhcyBhbnkgfSk7XG4gICAgICAgICAgcmVuZGVyUHJlc2V0cygpO1xuICAgICAgICB9KSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQWRkIG5ld2xpbmUgYmVmb3JlJylcbiAgICAgIC5hZGRUb2dnbGUodCA9PiB0LnNldFZhbHVlKHMuYWRkTmV3bGluZUJlZm9yZSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBhZGROZXdsaW5lQmVmb3JlOiB2IH0pOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQWRkIG5ld2xpbmUgYWZ0ZXInKVxuICAgICAgLmFkZFRvZ2dsZSh0ID0+IHQuc2V0VmFsdWUocy5hZGROZXdsaW5lQWZ0ZXIpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgYWRkTmV3bGluZUFmdGVyOiB2IH0pOyB9KSk7XG4gIH1cbn1cbiIsICJleHBvcnQgY2xhc3MgQXVkaW9SZWNvcmRlciB7XG4gIHByaXZhdGUgbWVkaWFSZWNvcmRlcj86IE1lZGlhUmVjb3JkZXI7XG4gIHByaXZhdGUgY2h1bmtzOiBCbG9iUGFydFtdID0gW107XG4gIHByaXZhdGUgc3RyZWFtPzogTWVkaWFTdHJlYW07XG4gIHByaXZhdGUgc3RhcnRlZEF0ID0gMDtcbiAgcHJpdmF0ZSB0aW1lcj86IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9uVGljaz86IChlbGFwc2VkTXM6IG51bWJlcikgPT4gdm9pZCkge31cblxuICBhc3luYyBzdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5tZWRpYVJlY29yZGVyICYmIHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSA9PT0gJ3JlY29yZGluZycpIHJldHVybjtcbiAgICB0aGlzLmNodW5rcyA9IFtdO1xuICAgIHRoaXMuc3RyZWFtID0gYXdhaXQgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoeyBhdWRpbzogdHJ1ZSB9KTtcbiAgICBjb25zdCBtaW1lQ2FuZGlkYXRlcyA9IFtcbiAgICAgICdhdWRpby93ZWJtO2NvZGVjcz1vcHVzJyxcbiAgICAgICdhdWRpby93ZWJtJyxcbiAgICAgICdhdWRpby9vZ2c7Y29kZWNzPW9wdXMnLFxuICAgICAgJydcbiAgICBdO1xuICAgIGxldCBtaW1lVHlwZSA9ICcnO1xuICAgIGZvciAoY29uc3QgY2FuZCBvZiBtaW1lQ2FuZGlkYXRlcykge1xuICAgICAgaWYgKCFjYW5kIHx8ICh3aW5kb3cgYXMgYW55KS5NZWRpYVJlY29yZGVyPy5pc1R5cGVTdXBwb3J0ZWQ/LihjYW5kKSkgeyBtaW1lVHlwZSA9IGNhbmQ7IGJyZWFrOyB9XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy5tZWRpYVJlY29yZGVyID0gbmV3IE1lZGlhUmVjb3JkZXIodGhpcy5zdHJlYW0sIG1pbWVUeXBlID8geyBtaW1lVHlwZSB9IDogdW5kZWZpbmVkKTtcbiAgICB0aGlzLm1lZGlhUmVjb3JkZXIub25kYXRhYXZhaWxhYmxlID0gKGU6IEJsb2JFdmVudCkgPT4geyBpZiAoZS5kYXRhPy5zaXplKSB0aGlzLmNodW5rcy5wdXNoKGUuZGF0YSk7IH07XG4gICAgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXJ0KDI1MCk7IC8vIHNtYWxsIGNodW5rc1xuICAgIHRoaXMuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICBpZiAodGhpcy5vblRpY2spIHRoaXMudGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5vblRpY2shKERhdGUubm93KCkgLSB0aGlzLnN0YXJ0ZWRBdCksIDIwMCk7XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZWRpYVJlY29yZGVyICYmIHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSA9PT0gJ3JlY29yZGluZycgJiYgdHlwZW9mIHRoaXMubWVkaWFSZWNvcmRlci5wYXVzZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5tZWRpYVJlY29yZGVyLnBhdXNlKCk7XG4gICAgfVxuICB9XG5cbiAgcmVzdW1lKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1lZGlhUmVjb3JkZXIgJiYgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXRlID09PSAncGF1c2VkJyAmJiB0eXBlb2YgdGhpcy5tZWRpYVJlY29yZGVyLnJlc3VtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5tZWRpYVJlY29yZGVyLnJlc3VtZSgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN0b3AoKTogUHJvbWlzZTxCbG9iPiB7XG4gICAgY29uc3QgcmVjID0gdGhpcy5tZWRpYVJlY29yZGVyO1xuICAgIGlmICghcmVjKSB0aHJvdyBuZXcgRXJyb3IoJ1JlY29yZGVyIG5vdCBzdGFydGVkJyk7XG4gICAgY29uc3Qgc3RvcFByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgcmVjLm9uc3RvcCA9ICgpID0+IHJlc29sdmUoKTtcbiAgICB9KTtcbiAgICBpZiAocmVjLnN0YXRlICE9PSAnaW5hY3RpdmUnKSByZWMuc3RvcCgpO1xuICAgIGF3YWl0IHN0b3BQcm9taXNlO1xuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYih0aGlzLmNodW5rcywgeyB0eXBlOiB0aGlzLmNodW5rcy5sZW5ndGggPyAodGhpcy5jaHVua3NbMF0gYXMgYW55KS50eXBlIHx8ICdhdWRpby93ZWJtJyA6ICdhdWRpby93ZWJtJyB9KTtcbiAgICB0aGlzLmNsZWFudXAoKTtcbiAgICByZXR1cm4gYmxvYjtcbiAgfVxuXG4gIGRpc2NhcmQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVkaWFSZWNvcmRlciAmJiB0aGlzLm1lZGlhUmVjb3JkZXIuc3RhdGUgIT09ICdpbmFjdGl2ZScpIHRoaXMubWVkaWFSZWNvcmRlci5zdG9wKCk7XG4gICAgdGhpcy5jbGVhbnVwKCk7XG4gIH1cblxuICBwcml2YXRlIGNsZWFudXAoKSB7XG4gICAgaWYgKHRoaXMudGltZXIpIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuICAgIHRoaXMudGltZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5tZWRpYVJlY29yZGVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc3RhcnRlZEF0ID0gMDtcbiAgICBpZiAodGhpcy5zdHJlYW0pIHtcbiAgICAgIHRoaXMuc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2godCA9PiB0LnN0b3AoKSk7XG4gICAgICB0aGlzLnN0cmVhbSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5jaHVua3MgPSBbXTtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIFByb21wdFByZXNldCB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9zdHByb2Nlc3NXaXRoT3BlbkFJKFxuICByYXc6IHN0cmluZyxcbiAgc2V0dGluZ3M6IEFJVHJhbnNjcmlwdFNldHRpbmdzLFxuICBwcmVzZXQ/OiBQcm9tcHRQcmVzZXQsXG4gIHNlbGVjdGlvbj86IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghc2V0dGluZ3Mub3BlbmFpQXBpS2V5KSByZXR1cm4gcmF3OyAvLyBzaWxlbnRseSBza2lwIGlmIG1pc3NpbmdcbiAgY29uc3QgbW9kZWwgPSBwcmVzZXQ/Lm1vZGVsIHx8IHNldHRpbmdzLm9wZW5haU1vZGVsIHx8ICdncHQtNG8tbWluaSc7XG4gIGNvbnN0IHRlbXBlcmF0dXJlID0gY2xhbXAoKHByZXNldD8udGVtcGVyYXR1cmUgPz8gMC4yKSwgMCwgMSk7XG4gIGxldCBzeXN0ZW0gPSBwcmVzZXQ/LnN5c3RlbSB8fCAnWW91IGNsZWFuIHVwIHNwb2tlbiB0ZXh0LiBGaXggY2FwaXRhbGl6YXRpb24gYW5kIHB1bmN0dWF0aW9uLCByZW1vdmUgZmlsbGVyIHdvcmRzLCBwcmVzZXJ2ZSBtZWFuaW5nLiBEbyBub3QgYWRkIGNvbnRlbnQuJztcblxuICBjb25zdCBzZWwgPSAoc2VsZWN0aW9uIHx8ICcnKS50cmltKCk7XG4gIC8vIFByZXBhcmUgdXNlciBjb250ZW50OyBvcHRpb25hbGx5IHByZXBlbmQgY29udGV4dCBpZiB7e3NlbGVjdGlvbn19IHBsYWNlaG9sZGVyIGlzIG5vdCB1c2VkIGluIHN5c3RlbVxuICBsZXQgdXNlckNvbnRlbnQgPSByYXc7XG4gIGlmIChzZWwpIHtcbiAgICBpZiAoc3lzdGVtLmluY2x1ZGVzKCd7e3NlbGVjdGlvbn19JykpIHtcbiAgICAgIHN5c3RlbSA9IHN5c3RlbS5zcGxpdCgne3tzZWxlY3Rpb259fScpLmpvaW4oc2VsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY29udGV4dEJsb2NrID0gYENvbnRleHQgKHNlbGVjdGVkIHRleHQpOlxcbi0tLVxcbiR7c2VsfVxcbi0tLVxcblxcbmA7XG4gICAgICB1c2VyQ29udGVudCA9IGNvbnRleHRCbG9jayArIHJhdztcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtzZXR0aW5ncy5vcGVuYWlBcGlLZXl9YCxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBtb2RlbCxcbiAgICAgIHRlbXBlcmF0dXJlLFxuICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3lzdGVtIH0sXG4gICAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyQ29udGVudCB9LFxuICAgICAgXSxcbiAgICB9KSxcbiAgfSk7XG4gIGlmICghcmVzcC5vaykge1xuICAgIC8vIElmIE9wZW5BSSBmYWlscywgcmV0dXJuIHJhdyByYXRoZXIgdGhhbiBicmVha2luZyBpbnNlcnRpb25cbiAgICB0cnkgeyBjb25zb2xlLndhcm4oJ09wZW5BSSBwb3N0cHJvY2VzcyBmYWlsZWQnLCByZXNwLnN0YXR1cywgYXdhaXQgcmVzcC50ZXh0KCkpOyB9IGNhdGNoIHt9XG4gICAgcmV0dXJuIHJhdztcbiAgfVxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gIGNvbnN0IGNsZWFuZWQgPSBkYXRhPy5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQ7XG4gIHJldHVybiB0eXBlb2YgY2xlYW5lZCA9PT0gJ3N0cmluZycgJiYgY2xlYW5lZC50cmltKCkgPyBjbGVhbmVkIDogcmF3O1xufVxuXG5mdW5jdGlvbiBjbGFtcChuOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikgeyByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIG4pKTsgfVxuIiwgImltcG9ydCB0eXBlIHsgQUlUcmFuc2NyaXB0U2V0dGluZ3MgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRyYW5zY3JpYmVXaXRoR3JvcShibG9iOiBCbG9iLCBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MpOiBQcm9taXNlPHN0cmluZz4ge1xuICBpZiAoIXNldHRpbmdzLmdyb3FBcGlLZXkpIHRocm93IG5ldyBFcnJvcignR3JvcSBBUEkga2V5IGlzIG1pc3NpbmcgaW4gc2V0dGluZ3MuJyk7XG4gIGNvbnN0IGZkID0gbmV3IEZvcm1EYXRhKCk7XG4gIGZkLmFwcGVuZCgnZmlsZScsIG5ldyBGaWxlKFtibG9iXSwgJ2F1ZGlvLndlYm0nLCB7IHR5cGU6IGJsb2IudHlwZSB8fCAnYXVkaW8vd2VibScgfSkpO1xuICBmZC5hcHBlbmQoJ21vZGVsJywgc2V0dGluZ3MuZ3JvcU1vZGVsIHx8ICd3aGlzcGVyLWxhcmdlLXYzJyk7XG4gIGlmIChzZXR0aW5ncy5sYW5ndWFnZSkgZmQuYXBwZW5kKCdsYW5ndWFnZScsIHNldHRpbmdzLmxhbmd1YWdlKTtcblxuICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLmdyb3EuY29tL29wZW5haS92MS9hdWRpby90cmFuc2NyaXB0aW9ucycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3NldHRpbmdzLmdyb3FBcGlLZXl9YCB9LFxuICAgIGJvZHk6IGZkLFxuICB9KTtcbiAgaWYgKCFyZXNwLm9rKSB7XG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IHNhZmVUZXh0KHJlc3ApO1xuICAgIHRocm93IG5ldyBFcnJvcihgR3JvcSB0cmFuc2NyaXB0aW9uIGZhaWxlZCAoJHtyZXNwLnN0YXR1c30pOiAke3RleHR9YCk7XG4gIH1cbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpO1xuICBpZiAodHlwZW9mIGRhdGE/LnRleHQgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ0dyb3EgcmVzcG9uc2UgbWlzc2luZyB0ZXh0Jyk7XG4gIHJldHVybiBkYXRhLnRleHQgYXMgc3RyaW5nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYWZlVGV4dChyZXNwOiBSZXNwb25zZSkge1xuICB0cnkgeyByZXR1cm4gYXdhaXQgcmVzcC50ZXh0KCk7IH0gY2F0Y2ggeyByZXR1cm4gJzxuby1ib2R5Pic7IH1cbn1cblxuIiwgImV4cG9ydCB0eXBlIEluc2VydE1vZGUgPSAnaW5zZXJ0JyB8ICdyZXBsYWNlJztcblxuZXhwb3J0IGludGVyZmFjZSBQcm9tcHRQcmVzZXQge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHN5c3RlbTogc3RyaW5nO1xuICB0ZW1wZXJhdHVyZTogbnVtYmVyO1xuICBpbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkPzogYm9vbGVhbjtcbiAgcmVwbGFjZVNlbGVjdGlvbj86IGJvb2xlYW47XG4gIG1vZGVsPzogc3RyaW5nOyAvLyBvcHRpb25hbCBPcGVuQUkgbW9kZWwgb3ZlcnJpZGVcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBSVRyYW5zY3JpcHRTZXR0aW5ncyB7XG4gIGdyb3FBcGlLZXk6IHN0cmluZztcbiAgZ3JvcU1vZGVsOiBzdHJpbmc7IC8vIGUuZy4sICd3aGlzcGVyLWxhcmdlLXYzJ1xuICBsYW5ndWFnZT86IHN0cmluZzsgLy8gSVNPIGNvZGUsIG9wdGlvbmFsXG5cbiAgb3BlbmFpQXBpS2V5Pzogc3RyaW5nO1xuICBvcGVuYWlNb2RlbDogc3RyaW5nOyAvLyBlLmcuLCAnZ3B0LTRvLW1pbmknXG5cbiAgcHJvbXB0UHJlc2V0czogUHJvbXB0UHJlc2V0W107XG4gIGRlZmF1bHRQcm9tcHRJZD86IHN0cmluZztcbiAgbGFzdFVzZWRQcm9tcHRJZD86IHN0cmluZztcblxuICBzaG93TW9kYWxXaGlsZVJlY29yZGluZzogYm9vbGVhbjtcbiAgbWF4RHVyYXRpb25TZWM6IG51bWJlcjtcbiAgaW5zZXJ0TW9kZTogSW5zZXJ0TW9kZTtcbiAgYWRkTmV3bGluZUJlZm9yZTogYm9vbGVhbjtcbiAgYWRkTmV3bGluZUFmdGVyOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QUkVTRVQ6IFByb21wdFByZXNldCA9IHtcbiAgaWQ6ICdwb2xpc2hlZCcsXG4gIG5hbWU6ICdQb2xpc2hlZCcsXG4gIHN5c3RlbTpcbiAgICAnWW91IGNsZWFuIHVwIHNwb2tlbiB0ZXh0LiBGaXggY2FwaXRhbGl6YXRpb24gYW5kIHB1bmN0dWF0aW9uLCByZW1vdmUgZmlsbGVyIHdvcmRzLCBwcmVzZXJ2ZSBtZWFuaW5nLiBEbyBub3QgYWRkIGNvbnRlbnQuJyxcbiAgdGVtcGVyYXR1cmU6IDAuMixcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBBSVRyYW5zY3JpcHRTZXR0aW5ncyA9IHtcbiAgZ3JvcUFwaUtleTogJycsXG4gIGdyb3FNb2RlbDogJ3doaXNwZXItbGFyZ2UtdjMnLFxuICBsYW5ndWFnZTogdW5kZWZpbmVkLFxuXG4gIG9wZW5haUFwaUtleTogJycsXG4gIG9wZW5haU1vZGVsOiAnZ3B0LTRvLW1pbmknLFxuXG4gIHByb21wdFByZXNldHM6IFtERUZBVUxUX1BSRVNFVF0sXG4gIGRlZmF1bHRQcm9tcHRJZDogJ3BvbGlzaGVkJyxcbiAgbGFzdFVzZWRQcm9tcHRJZDogJ3BvbGlzaGVkJyxcblxuICBzaG93TW9kYWxXaGlsZVJlY29yZGluZzogdHJ1ZSxcbiAgbWF4RHVyYXRpb25TZWM6IDkwMCxcbiAgaW5zZXJ0TW9kZTogJ2luc2VydCcsXG4gIGFkZE5ld2xpbmVCZWZvcmU6IGZhbHNlLFxuICBhZGROZXdsaW5lQWZ0ZXI6IHRydWUsXG59O1xuIiwgImltcG9ydCB7IEFwcCwgTW9kYWwsIFNldHRpbmcsIERyb3Bkb3duQ29tcG9uZW50IH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZWNvcmRpbmdNb2RhbE9wdGlvbnMge1xuICBwcmVzZXRzOiB7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9W107XG4gIGRlZmF1bHRQcmVzZXRJZD86IHN0cmluZztcbiAgbWF4RHVyYXRpb25TZWM6IG51bWJlcjtcbiAgb25TdGFydD86ICgpID0+IHZvaWQ7XG4gIG9uU3RvcDogKGFwcGx5UG9zdDogYm9vbGVhbiwgcHJlc2V0SWQ/OiBzdHJpbmcpID0+IHZvaWQ7XG4gIG9uRGlzY2FyZDogKCkgPT4gdm9pZDtcbiAgb25QYXVzZT86ICgpID0+IHZvaWQ7XG4gIG9uUmVzdW1lPzogKCkgPT4gdm9pZDtcbiAgb25DbG9zZT86ICgpID0+IHZvaWQ7XG59XG5cclxuZXhwb3J0IGNsYXNzIFJlY29yZGluZ01vZGFsIGV4dGVuZHMgTW9kYWwge1xyXG4gIHByaXZhdGUgcm9vdEVsPzogSFRNTERpdkVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBlbGFwc2VkRWw/OiBIVE1MRWxlbWVudDtcclxuICBwcml2YXRlIHRpbWVyPzogbnVtYmVyO1xyXG4gIHByaXZhdGUgc3RhcnRlZEF0ID0gMDtcclxuICBwcml2YXRlIHByZXNldERyb3Bkb3duPzogRHJvcGRvd25Db21wb25lbnQ7XHJcbiAgcHJpdmF0ZSBwYXVzZUJ0bkVsPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSB0cmFuc2NyaWJlQnRuRWw/OiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBwcml2YXRlIHBvc3Rwcm9jZXNzQnRuRWw/OiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBwcml2YXRlIHN0YXR1c1RleHRFbD86IEhUTUxFbGVtZW50O1xyXG4gIHByaXZhdGUgZGlzY2FyZEJ0bkVsPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBpc1BhdXNlZCA9IGZhbHNlO1xyXG4gIHByaXZhdGUgcGF1c2VTdGFydGVkQXQgPSAwO1xyXG4gIHByaXZhdGUgYWNjdW11bGF0ZWRQYXVzZU1zID0gMDtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgb3B0czogUmVjb3JkaW5nTW9kYWxPcHRpb25zKSB7XHJcbiAgICBzdXBlcihhcHApO1xyXG4gIH1cclxuXHJcbiAgb25PcGVuKCk6IHZvaWQge1xyXG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XHJcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcclxuXHJcbiAgICB0aGlzLm1vZGFsRWwuYWRkQ2xhc3MoJ3ZveGlkaWFuLW1vZGFsJyk7XHJcblxyXG4gICAgdGhpcy5yb290RWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiAndm94aWRpYW4tcm9vdCcgfSk7XHJcbiAgICB0aGlzLnJvb3RFbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtcGhhc2UnLCAncmVjb3JkaW5nJyk7XHJcblxyXG4gICAgY29uc3QgaGVhZGVyID0gdGhpcy5yb290RWwuY3JlYXRlRGl2KHsgY2xzOiAndm94aWRpYW4taGVhZGVyJyB9KTtcclxuICAgIGhlYWRlci5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdWb3hpZGlhbicgfSk7XHJcbiAgICBjb25zdCBoZWFkZXJSaWdodCA9IGhlYWRlci5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1oZWFkZXItcmlnaHQnIH0pO1xyXG4gICAgaGVhZGVyUmlnaHQuY3JlYXRlRGl2KHsgY2xzOiAnYWktcmVjLWluZGljYXRvcicsIGF0dHI6IHsgJ2FyaWEtbGFiZWwnOiAnUmVjb3JkaW5nIGluZGljYXRvcicgfSB9KTtcclxuICAgIHRoaXMuZWxhcHNlZEVsID0gaGVhZGVyUmlnaHQuY3JlYXRlRGl2KHsgdGV4dDogJzAwOjAwJywgY2xzOiAndm94aWRpYW4tdGltZXInIH0pO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsID0gaGVhZGVyUmlnaHQuY3JlYXRlRWwoJ2J1dHRvbicsIHtcclxuICAgICAgdGV4dDogJ1x1Mjc1QVx1Mjc1QScsXHJcbiAgICAgIHR5cGU6ICdidXR0b24nLFxyXG4gICAgICBjbHM6ICd2b3hpZGlhbi1wYXVzZScsXHJcbiAgICAgIGF0dHI6IHsgJ2FyaWEtbGFiZWwnOiAnUGF1c2UgcmVjb3JkaW5nJywgJ2FyaWEtcHJlc3NlZCc6ICdmYWxzZScgfSxcclxuICAgIH0pO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy50b2dnbGVQYXVzZSgpKTtcclxuICAgIHRoaXMucmVzZXRQYXVzZVN0YXRlKCk7XHJcblxyXG4gICAgY29uc3QgYm9keSA9IHRoaXMucm9vdEVsLmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLWJvZHknIH0pO1xyXG5cclxuICAgIC8vIFByZXNldCBzZWxlY3Rpb25cclxuICAgIG5ldyBTZXR0aW5nKGJvZHkpXHJcbiAgICAgIC5zZXROYW1lKCdQb3N0cHJvY2Vzc2luZyBwcmVzZXQnKVxyXG4gICAgICAuYWRkRHJvcGRvd24oZCA9PiB7XHJcbiAgICAgICAgdGhpcy5wcmVzZXREcm9wZG93biA9IGQ7XHJcbiAgICAgICAgZm9yIChjb25zdCBwIG9mIHRoaXMub3B0cy5wcmVzZXRzKSBkLmFkZE9wdGlvbihwLmlkLCBwLm5hbWUpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuZGVmYXVsdFByZXNldElkKSBkLnNldFZhbHVlKHRoaXMub3B0cy5kZWZhdWx0UHJlc2V0SWQpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICBjb25zdCBidG5zID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1idXR0b25zJyB9KTtcclxuICAgIHRoaXMudHJhbnNjcmliZUJ0bkVsID0gYnRucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnVHJhbnNjcmliZScsIHR5cGU6ICdidXR0b24nIH0pO1xyXG4gICAgdGhpcy5wb3N0cHJvY2Vzc0J0bkVsID0gYnRucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnUG9zdFByb2Nlc3MnLCB0eXBlOiAnYnV0dG9uJyB9KTtcclxuICAgIHRoaXMuZGlzY2FyZEJ0bkVsID0gYnRucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnRGlzY2FyZCcsIHR5cGU6ICdidXR0b24nIH0pO1xyXG4gICAgdGhpcy50cmFuc2NyaWJlQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnRyaWdnZXJTdG9wKGZhbHNlKSk7XHJcbiAgICB0aGlzLnBvc3Rwcm9jZXNzQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnRyaWdnZXJTdG9wKHRydWUpKTtcclxuICAgIHRoaXMuZGlzY2FyZEJ0bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5vcHRzLm9uRGlzY2FyZCgpKTtcclxuXHJcbiAgICBjb25zdCBzdGF0dXNCYXIgPSB0aGlzLnJvb3RFbC5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1zdGF0dXNiYXInIH0pO1xyXG4gICAgY29uc3Qgc3RhdHVzV3JhcCA9IHN0YXR1c0Jhci5jcmVhdGVEaXYoeyBjbHM6ICdhaS1zdGF0dXMtd3JhcCcgfSk7XHJcbiAgICBzdGF0dXNXcmFwLmNyZWF0ZURpdih7IGNsczogJ2FpLXNwaW5uZXInLCBhdHRyOiB7ICdhcmlhLWxhYmVsJzogJ1dvcmtpbmdcdTIwMjYnIH0gfSk7XHJcbiAgICB0aGlzLnN0YXR1c1RleHRFbCA9IHN0YXR1c1dyYXAuY3JlYXRlRGl2KHsgY2xzOiAnYWktc3RhdHVzLXRleHQnLCB0ZXh0OiAnTGlzdGVuaW5nXHUyMDI2JyB9KTtcclxuXHJcbiAgICB0aGlzLm1vZGFsRWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHRoaXMub3B0cy5vbkRpc2NhcmQoKTtcclxuICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHRoaXMudHJpZ2dlclN0b3AoZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTdGFydCB0aW1lclxyXG4gICAgdGhpcy5zdGFydGVkQXQgPSBEYXRlLm5vdygpO1xyXG4gICAgdGhpcy50aW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB0aGlzLnRpY2soKSwgMjAwKTtcclxuICAgIHRoaXMub3B0cy5vblN0YXJ0Py4oKTtcclxuICB9XG5cbiAgb25DbG9zZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy50aW1lcikgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7XG4gICAgdGhpcy50aW1lciA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICAgIHRoaXMub3B0cy5vbkNsb3NlPy4oKTtcbiAgfVxuXHJcbiAgcHJpdmF0ZSB0aWNrKCk6IHZvaWQge1xyXG4gICAgY29uc3QgZWxhcHNlZE1zID0gdGhpcy5nZXRFbGFwc2VkTXMoKTtcclxuICAgIGNvbnN0IHNlYyA9IE1hdGguZmxvb3IoZWxhcHNlZE1zIC8gMTAwMCk7XHJcbiAgICBjb25zdCBtbSA9IE1hdGguZmxvb3Ioc2VjIC8gNjApLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcclxuICAgIGNvbnN0IHNzID0gKHNlYyAlIDYwKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XHJcbiAgICBpZiAodGhpcy5lbGFwc2VkRWwpIHRoaXMuZWxhcHNlZEVsLnRleHRDb250ZW50ID0gYCR7bW19OiR7c3N9YDtcclxuICAgIGlmICh0aGlzLm9wdHMubWF4RHVyYXRpb25TZWMgPiAwICYmICF0aGlzLmlzUGF1c2VkICYmIHNlYyA+PSB0aGlzLm9wdHMubWF4RHVyYXRpb25TZWMpIHtcclxuICAgICAgdGhpcy50cmlnZ2VyU3RvcChmYWxzZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEVsYXBzZWRNcygpOiBudW1iZXIge1xyXG4gICAgaWYgKCF0aGlzLnN0YXJ0ZWRBdCkgcmV0dXJuIDA7XHJcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgbGV0IGVsYXBzZWQgPSBub3cgLSB0aGlzLnN0YXJ0ZWRBdCAtIHRoaXMuYWNjdW11bGF0ZWRQYXVzZU1zO1xyXG4gICAgaWYgKHRoaXMuaXNQYXVzZWQgJiYgdGhpcy5wYXVzZVN0YXJ0ZWRBdCkge1xyXG4gICAgICBlbGFwc2VkIC09IG5vdyAtIHRoaXMucGF1c2VTdGFydGVkQXQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTWF0aC5tYXgoMCwgZWxhcHNlZCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHRyaWdnZXJTdG9wKGFwcGx5UG9zdDogYm9vbGVhbikge1xyXG4gICAgdGhpcy5maW5hbGl6ZVBhdXNlU3RhdGUoKTtcclxuICAgIGNvbnN0IHByZXNldElkID0gdGhpcy5wcmVzZXREcm9wZG93bj8uZ2V0VmFsdWUoKTtcclxuICAgIHRoaXMub3B0cy5vblN0b3AoYXBwbHlQb3N0LCBwcmVzZXRJZCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHRvZ2dsZVBhdXNlKCkge1xyXG4gICAgaWYgKHRoaXMuaXNQYXVzZWQpIHtcclxuICAgICAgdGhpcy5yZXN1bWVSZWNvcmRpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucGF1c2VSZWNvcmRpbmcoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGF1c2VSZWNvcmRpbmcoKSB7XHJcbiAgICBpZiAodGhpcy5pc1BhdXNlZCkgcmV0dXJuO1xyXG4gICAgdGhpcy5pc1BhdXNlZCA9IHRydWU7XHJcbiAgICB0aGlzLnBhdXNlU3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcclxuICAgIHRoaXMudXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpO1xyXG4gICAgdGhpcy5vcHRzLm9uUGF1c2U/LigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXN1bWVSZWNvcmRpbmcoKSB7XHJcbiAgICBpZiAoIXRoaXMuaXNQYXVzZWQpIHJldHVybjtcclxuICAgIGlmICh0aGlzLnBhdXNlU3RhcnRlZEF0KSB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcyArPSBEYXRlLm5vdygpIC0gdGhpcy5wYXVzZVN0YXJ0ZWRBdDtcclxuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSAwO1xyXG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy51cGRhdGVQYXVzZUJ1dHRvbkxhYmVsKCk7XHJcbiAgICB0aGlzLm9wdHMub25SZXN1bWU/LigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmaW5hbGl6ZVBhdXNlU3RhdGUoKSB7XHJcbiAgICBpZiAodGhpcy5pc1BhdXNlZCAmJiB0aGlzLnBhdXNlU3RhcnRlZEF0KSB7XHJcbiAgICAgIHRoaXMuYWNjdW11bGF0ZWRQYXVzZU1zICs9IERhdGUubm93KCkgLSB0aGlzLnBhdXNlU3RhcnRlZEF0O1xyXG4gICAgfVxyXG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5wYXVzZVN0YXJ0ZWRBdCA9IDA7XHJcbiAgICB0aGlzLnVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzZXRQYXVzZVN0YXRlKCkge1xyXG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5wYXVzZVN0YXJ0ZWRBdCA9IDA7XHJcbiAgICB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcyA9IDA7XHJcbiAgICB0aGlzLnVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpIHtcclxuICAgIGlmICghdGhpcy5wYXVzZUJ0bkVsKSByZXR1cm47XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtcGF1c2VkJywgdGhpcy5pc1BhdXNlZCk7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwudGV4dENvbnRlbnQgPSB0aGlzLmlzUGF1c2VkID8gJ1x1MjVCNicgOiAnXHUyNzVBXHUyNzVBJztcclxuICAgIHRoaXMucGF1c2VCdG5FbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIHRoaXMuaXNQYXVzZWQgPyAndHJ1ZScgOiAnZmFsc2UnKTtcclxuICAgIHRoaXMucGF1c2VCdG5FbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCB0aGlzLmlzUGF1c2VkID8gJ1Jlc3VtZSByZWNvcmRpbmcnIDogJ1BhdXNlIHJlY29yZGluZycpO1xyXG4gIH1cclxuXHJcbiAgLy8gUHVibGljIFVJIGhlbHBlcnNcclxuICBzZXRQaGFzZShwaGFzZTogJ3JlY29yZGluZycgfCAndHJhbnNjcmliaW5nJyB8ICdwb3N0cHJvY2Vzc2luZycgfCAnZG9uZScgfCAnZXJyb3InKSB7XHJcbiAgICB0aGlzLnJvb3RFbD8uc2V0QXR0cmlidXRlKCdkYXRhLXBoYXNlJywgcGhhc2UpO1xyXG4gICAgaWYgKHBoYXNlICE9PSAncmVjb3JkaW5nJykge1xyXG4gICAgICB0aGlzLmZpbmFsaXplUGF1c2VTdGF0ZSgpO1xyXG4gICAgICBpZiAodGhpcy50aW1lcikgeyB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTsgdGhpcy50aW1lciA9IHVuZGVmaW5lZDsgfVxyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucGF1c2VCdG5FbCkgdGhpcy5wYXVzZUJ0bkVsLmRpc2FibGVkID0gcGhhc2UgIT09ICdyZWNvcmRpbmcnO1xyXG4gIH1cclxuXHJcbiAgc2V0U3RhdHVzKHRleHQ6IHN0cmluZykge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzVGV4dEVsKSB0aGlzLnN0YXR1c1RleHRFbC50ZXh0Q29udGVudCA9IHRleHQ7XHJcbiAgfVxyXG5cclxuICBzZXRBY3Rpb25CdXR0b25zRW5hYmxlZCh0cmFuc2NyaWJlRW5hYmxlZDogYm9vbGVhbiwgcG9zdHByb2Nlc3NFbmFibGVkOiBib29sZWFuLCBkaXNjYXJkRW5hYmxlZDogYm9vbGVhbikge1xyXG4gICAgaWYgKHRoaXMudHJhbnNjcmliZUJ0bkVsKSB0aGlzLnRyYW5zY3JpYmVCdG5FbC5kaXNhYmxlZCA9ICF0cmFuc2NyaWJlRW5hYmxlZDtcclxuICAgIGlmICh0aGlzLnBvc3Rwcm9jZXNzQnRuRWwpIHRoaXMucG9zdHByb2Nlc3NCdG5FbC5kaXNhYmxlZCA9ICFwb3N0cHJvY2Vzc0VuYWJsZWQ7XHJcbiAgICBpZiAodGhpcy5kaXNjYXJkQnRuRWwpIHRoaXMuZGlzY2FyZEJ0bkVsLmRpc2FibGVkID0gIWRpc2NhcmRFbmFibGVkO1xyXG4gIH1cclxuXHJcbiAgc2V0RGlzY2FyZExhYmVsKGxhYmVsOiBzdHJpbmcpIHtcclxuICAgIGlmICh0aGlzLmRpc2NhcmRCdG5FbCkgdGhpcy5kaXNjYXJkQnRuRWwudGV4dENvbnRlbnQgPSBsYWJlbDtcclxuICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQUEsbUJBQStEOzs7QUNBL0Qsc0JBQXdFO0FBR2pFLElBQU0seUJBQU4sY0FBcUMsaUNBQWlCO0FBQUEsRUFDM0QsWUFBWSxLQUFVLFFBQXdCLGFBQWlELGNBQW1FO0FBQ2hLLFVBQU0sS0FBSyxNQUFNO0FBRDJCO0FBQWlEO0FBQUEsRUFFL0Y7QUFBQSxFQUVBLFVBQWdCO0FBQ2QsVUFBTSxFQUFFLFlBQVksSUFBSTtBQUN4QixnQkFBWSxNQUFNO0FBQ2xCLGdCQUFZLFNBQVMsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRS9DLFVBQU0sSUFBSSxLQUFLLFlBQVk7QUFHM0IsZ0JBQVksU0FBUyxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsY0FBYyxFQUN0QixRQUFRLGdEQUFnRCxFQUN4RCxRQUFRLE9BQUssRUFDWCxlQUFlLFNBQVMsRUFDeEIsU0FBUyxFQUFFLGNBQWMsRUFBRSxFQUMzQixTQUFTLE9BQU8sTUFBTTtBQUFFLFlBQU0sS0FBSyxhQUFhLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQUEsSUFBRyxDQUFDLENBQUM7QUFFbEYsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsWUFBWSxFQUNwQixRQUFRLDJCQUEyQixFQUNuQyxRQUFRLE9BQUssRUFDWCxTQUFTLEVB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O0FBQ3ZDLFFBQUksQ0FBQyxPQUFRLFFBQU87QUFDcEIsV0FBTyxVQUFVLEtBQUssRUFBRSxTQUFTLEdBQUcsTUFBTTtBQUFBO0FBQUEsRUFBTyxTQUFTLEtBQUs7QUFBQSxFQUNqRTtBQUFBLEVBRVEsZ0JBQWdCLEtBQXFCO0FBQzNDLFVBQU0sYUFBYSxJQUFJLEtBQUs7QUFDNUIsUUFBSSxDQUFDLFdBQVksUUFBTztBQUN4QixVQUFNLGFBQWEsV0FBVyxNQUFNLFNBQVM7QUFDN0MsVUFBTSxlQUFlLFdBQVcsSUFBSSxDQUFDLGNBQWM7QUFDakQsWUFBTSxRQUFRLFVBQVUsTUFBTSxJQUFJO0FBQ2xDLGFBQU8sTUFBTSxJQUFJLFVBQVEsS0FBSyxLQUFLLFFBQVEsQ0FBQyxFQUFFLEVBQUUsS0FBSyxJQUFJO0FBQUEsSUFDM0QsQ0FBQztBQUNELFdBQU8sYUFBYSxLQUFLLE9BQU87QUFBQSxFQUNsQztBQUNGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIl0KfQo=
