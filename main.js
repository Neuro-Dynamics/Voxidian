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
        new import_obsidian.Setting(wrap).setName("System prompt").addTextArea((t) => t.setValue(p.system).onChange(async (v) => {
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
async function postprocessWithOpenAI(raw, settings, preset) {
  if (!settings.openaiApiKey) return raw;
  const model = preset?.model || settings.openaiModel || "gpt-4o-mini";
  const temperature = clamp(preset?.temperature ?? 0.2, 0, 1);
  const system = preset?.system || "You clean up spoken text. Fix capitalization and punctuation, remove filler words, preserve meaning. Do not add content.";
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
        { role: "user", content: raw }
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
    this.rootEl = contentEl.createDiv({ cls: "ai-transcript-root" });
    this.rootEl.setAttribute("data-phase", "recording");
    const header = this.rootEl.createDiv({ cls: "ai-transcript-header" });
    header.createEl("h3", { text: "Recording\u2026" });
    const headerRight = header.createDiv({ cls: "ai-transcript-header-right" });
    headerRight.createDiv({ cls: "ai-rec-indicator", attr: { "aria-label": "Recording indicator" } });
    this.elapsedEl = headerRight.createDiv({ text: "00:00", cls: "ai-transcript-timer" });
    this.pauseBtnEl = headerRight.createEl("button", {
      text: "Pause",
      type: "button",
      cls: "ai-transcript-pause",
      attr: { "aria-label": "Pause recording", "aria-pressed": "false" }
    });
    this.pauseBtnEl.addEventListener("click", () => this.togglePause());
    this.resetPauseState();
    const body = this.rootEl.createDiv({ cls: "ai-transcript-body" });
    new import_obsidian2.Setting(body).setName("Postprocessing preset").addDropdown((d) => {
      this.presetDropdown = d;
      for (const p of this.opts.presets) d.addOption(p.id, p.name);
      if (this.opts.defaultPresetId) d.setValue(this.opts.defaultPresetId);
    });
    const btns = body.createDiv({ cls: "ai-transcript-buttons" });
    this.transcribeBtnEl = btns.createEl("button", { text: "Transcribe", type: "button" });
    this.postprocessBtnEl = btns.createEl("button", { text: "PostProcess", type: "button" });
    this.discardBtnEl = btns.createEl("button", { text: "Discard", type: "button" });
    this.transcribeBtnEl.addEventListener("click", () => this.triggerStop(false));
    this.postprocessBtnEl.addEventListener("click", () => this.triggerStop(true));
    this.discardBtnEl.addEventListener("click", () => this.opts.onDiscard());
    const statusBar = this.rootEl.createDiv({ cls: "ai-transcript-statusbar" });
    const statusWrap = statusBar.createDiv({ cls: "ai-status-wrap" });
    statusWrap.createDiv({ cls: "ai-spinner", attr: { "aria-label": "Working\u2026" } });
    this.statusTextEl = statusWrap.createDiv({ cls: "ai-status-text", text: "Recording audio\u2026" });
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
    this.pauseBtnEl.textContent = this.isPaused ? "Resume" : "Pause";
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
      id: "ai-transcript-start-stop",
      name: "Start/Stop Recording",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "M" }],
      callback: () => this.toggleRecording()
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
            text = await postprocessWithOpenAI(raw, this.settings, preset);
          }
          await this.insertText(text);
          modal.setPhase("done");
          modal.setStatus("Transcript inserted into the note.");
          modal.setActionButtonsEnabled(false, false, true);
          modal.setDiscardLabel("Close");
          window.setTimeout(() => {
            modal.close();
            if (this.modal === modal) this.modal = void 0;
          }, 600);
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
      onResume: () => this.recorder?.resume()
    });
    this.modal = modal;
    modal.open();
  }
  async insertText(text) {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    if (!view) throw new Error("No active Markdown editor");
    const editor = view.editor;
    const before = this.settings.addNewlineBefore ? "\n" : "";
    const after = this.settings.addNewlineAfter ? "\n" : "";
    const content = `${before}${text}${after}`;
    if (this.settings.insertMode === "replace" && editor.somethingSelected()) {
      editor.replaceSelection(content);
    } else {
      editor.replaceRange(content, editor.getCursor());
    }
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9yZWNvcmRlci50cyIsICJzcmMvcG9zdHByb2Nlc3MudHMiLCAic3JjL3RyYW5zY3JpYmUudHMiLCAic3JjL3R5cGVzLnRzIiwgInNyYy91aS9SZWNvcmRpbmdNb2RhbC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQXBwLCBNYXJrZG93blZpZXcsIFBsdWdpbiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEFJVHJhbnNjcmlwdFNldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IEF1ZGlvUmVjb3JkZXIgfSBmcm9tICcuL3JlY29yZGVyJztcbmltcG9ydCB7IHBvc3Rwcm9jZXNzV2l0aE9wZW5BSSB9IGZyb20gJy4vcG9zdHByb2Nlc3MnO1xuaW1wb3J0IHsgdHJhbnNjcmliZVdpdGhHcm9xIH0gZnJvbSAnLi90cmFuc2NyaWJlJztcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIHR5cGUgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIHR5cGUgUHJvbXB0UHJlc2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSZWNvcmRpbmdNb2RhbCB9IGZyb20gJy4vdWkvUmVjb3JkaW5nTW9kYWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBSVRyYW5zY3JpcHRQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MgPSB7IC4uLkRFRkFVTFRfU0VUVElOR1MsIHByb21wdFByZXNldHM6IFsuLi5ERUZBVUxUX1NFVFRJTkdTLnByb21wdFByZXNldHNdIH07XG4gIHByaXZhdGUgcmVjb3JkZXI/OiBBdWRpb1JlY29yZGVyO1xuICBwcml2YXRlIG1vZGFsPzogUmVjb3JkaW5nTW9kYWw7XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuXG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdtaWMnLCAnUmVjb3JkICYgVHJhbnNjcmliZScsICgpID0+IHRoaXMudG9nZ2xlUmVjb3JkaW5nKCkpO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnYWktdHJhbnNjcmlwdC1zdGFydC1zdG9wJyxcbiAgICAgIG5hbWU6ICdTdGFydC9TdG9wIFJlY29yZGluZycsXG4gICAgICBob3RrZXlzOiBbeyBtb2RpZmllcnM6IFsnTW9kJywgJ1NoaWZ0J10sIGtleTogJ00nIH1dLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMudG9nZ2xlUmVjb3JkaW5nKCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IEFJVHJhbnNjcmlwdFNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMsICgpID0+IHRoaXMuc2V0dGluZ3MsIGFzeW5jIChwYXJ0aWFsKSA9PiB7XG4gICAgICBPYmplY3QuYXNzaWduKHRoaXMuc2V0dGluZ3MsIHBhcnRpYWwpO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgICB9KSk7XG4gIH1cblxuICBvbnVubG9hZCgpIHtcbiAgICB0cnkgeyB0aGlzLnJlY29yZGVyPy5kaXNjYXJkKCk7IH0gY2F0Y2gge31cbiAgICB0cnkgeyB0aGlzLm1vZGFsPy5jbG9zZSgpOyB9IGNhdGNoIHt9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHRvZ2dsZVJlY29yZGluZygpIHtcbiAgICAvLyBJZiBtb2RhbCBpcyBvcGVuLCBzdG9wIG5vdyAoc2ltdWxhdGUgY2xpY2tpbmcgU3RvcClcbiAgICBpZiAodGhpcy5tb2RhbCkge1xuICAgICAgLy8gbm9vcCBcdTIwMTQgc3RvcHBpbmcgaXMgZHJpdmVuIHZpYSBtb2RhbCBidXR0b24gdG8gcHJlc2VydmUgcHJlc2V0L2FwcGx5IHN0YXRlXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHdlIGhhdmUgYW4gZWRpdG9yIHRvIGluc2VydCBpbnRvIGxhdGVyIChub3Qgc3RyaWN0bHkgcmVxdWlyZWQgYnV0IGhlbHBzIFVYKVxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuICAgIGlmICghdmlldykgcmV0dXJuOyAvLyBNVlA6IHJlcXVpcmUgYWN0aXZlIG1hcmtkb3duIHZpZXdcblxuICAgIC8vIFByZXBhcmUgcmVjb3JkZXIgYW5kIG1vZGFsXG4gICAgdGhpcy5yZWNvcmRlciA9IG5ldyBBdWRpb1JlY29yZGVyKCk7XG4gICAgY29uc3QgcHJlc2V0cyA9IHRoaXMuc2V0dGluZ3MucHJvbXB0UHJlc2V0cy5tYXAocCA9PiAoeyBpZDogcC5pZCwgbmFtZTogcC5uYW1lIH0pKTtcbiAgICBjb25zdCBtb2RhbCA9IG5ldyBSZWNvcmRpbmdNb2RhbCh0aGlzLmFwcCwge1xuICAgICAgcHJlc2V0cyxcbiAgICAgIGRlZmF1bHRQcmVzZXRJZDogdGhpcy5zZXR0aW5ncy5sYXN0VXNlZFByb21wdElkIHx8IHRoaXMuc2V0dGluZ3MuZGVmYXVsdFByb21wdElkLFxuICAgICAgbWF4RHVyYXRpb25TZWM6IHRoaXMuc2V0dGluZ3MubWF4RHVyYXRpb25TZWMsXG4gICAgICBvblN0YXJ0OiBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5yZWNvcmRlciEuc3RhcnQoKTtcbiAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICBtb2RhbC5zZXRQaGFzZSgnZXJyb3InKTtcbiAgICAgICAgICBtb2RhbC5zZXRTdGF0dXMoJ01pY3JvcGhvbmUgcGVybWlzc2lvbiBvciByZWNvcmRlciBlcnJvci4nKTtcbiAgICAgICAgICBtb2RhbC5zZXRBY3Rpb25CdXR0b25zRW5hYmxlZChmYWxzZSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIG1vZGFsLnNldERpc2NhcmRMYWJlbCgnQ2xvc2UnKTtcbiAgICAgICAgICB0aGlzLnJlY29yZGVyPy5kaXNjYXJkKCk7XG4gICAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uU3RvcDogYXN5bmMgKGFwcGx5UG9zdCwgcHJlc2V0SWQpID0+IHtcbiAgICAgICAgbW9kYWwuc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQoZmFsc2UsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIG1vZGFsLnNldFBoYXNlKCd0cmFuc2NyaWJpbmcnKTtcbiAgICAgICAgbW9kYWwuc2V0U3RhdHVzKCdUcmFuc2NyaWJpbmdcdTIwMjYnKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBibG9iID0gYXdhaXQgdGhpcy5yZWNvcmRlciEuc3RvcCgpO1xuICAgICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgY29uc3QgcmF3ID0gYXdhaXQgdHJhbnNjcmliZVdpdGhHcm9xKGJsb2IsIHRoaXMuc2V0dGluZ3MpO1xuICAgICAgICAgIGxldCB0ZXh0ID0gcmF3O1xuICAgICAgICAgIGlmIChhcHBseVBvc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXNldCA9IHRoaXMuc2V0dGluZ3MucHJvbXB0UHJlc2V0cy5maW5kKHAgPT4gcC5pZCA9PT0gcHJlc2V0SWQpIGFzIFByb21wdFByZXNldCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MubGFzdFVzZWRQcm9tcHRJZCA9IHByZXNldD8uaWQgfHwgcHJlc2V0SWQgfHwgdGhpcy5zZXR0aW5ncy5sYXN0VXNlZFByb21wdElkO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgICAgICAgICAgIG1vZGFsLnNldFBoYXNlKCdwb3N0cHJvY2Vzc2luZycpO1xuICAgICAgICAgICAgbW9kYWwuc2V0U3RhdHVzKCdDbGVhbmluZyB0cmFuc2NyaXB0XHUyMDI2Jyk7XG4gICAgICAgICAgICB0ZXh0ID0gYXdhaXQgcG9zdHByb2Nlc3NXaXRoT3BlbkFJKHJhdywgdGhpcy5zZXR0aW5ncywgcHJlc2V0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXdhaXQgdGhpcy5pbnNlcnRUZXh0KHRleHQpO1xuICAgICAgICAgIG1vZGFsLnNldFBoYXNlKCdkb25lJyk7XG4gICAgICAgICAgbW9kYWwuc2V0U3RhdHVzKCdUcmFuc2NyaXB0IGluc2VydGVkIGludG8gdGhlIG5vdGUuJyk7XG4gICAgICAgICAgbW9kYWwuc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQoZmFsc2UsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBtb2RhbC5zZXREaXNjYXJkTGFiZWwoJ0Nsb3NlJyk7XG4gICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGFsID09PSBtb2RhbCkgdGhpcy5tb2RhbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9LCA2MDApO1xuICAgICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgIG1vZGFsLnNldFBoYXNlKCdlcnJvcicpO1xuICAgICAgICAgIG1vZGFsLnNldFN0YXR1cyhgRXJyb3I6ICR7ZT8ubWVzc2FnZSB8fCBlfWApO1xuICAgICAgICAgIG1vZGFsLnNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgbW9kYWwuc2V0RGlzY2FyZExhYmVsKCdDbG9zZScpO1xuICAgICAgICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7fVxuICAgICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgLy8ga2VlcCBtb2RhbCBvcGVuIGZvciB1c2VyIHRvIHJlYWQvY2xvc2VcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uRGlzY2FyZDogKCkgPT4ge1xuICAgICAgICB0cnkgeyB0aGlzLnJlY29yZGVyPy5kaXNjYXJkKCk7IH0gY2F0Y2gge31cbiAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5tb2RhbCA9IHVuZGVmaW5lZDtcbiAgICAgIH0sXG4gICAgICBvblBhdXNlOiAoKSA9PiB0aGlzLnJlY29yZGVyPy5wYXVzZSgpLFxuICAgICAgb25SZXN1bWU6ICgpID0+IHRoaXMucmVjb3JkZXI/LnJlc3VtZSgpLFxuICAgIH0pO1xuICAgIHRoaXMubW9kYWwgPSBtb2RhbDtcblxuICAgIC8vIE1WUCB1c2VzIG1vZGFsIHRvIHByZXNlbnQgYWxsIHN0YXR1cyBhbmQgYW5pbWF0aW9uc1xuICAgIG1vZGFsLm9wZW4oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5zZXJ0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICBpZiAoIXZpZXcpIHRocm93IG5ldyBFcnJvcignTm8gYWN0aXZlIE1hcmtkb3duIGVkaXRvcicpO1xuICAgIGNvbnN0IGVkaXRvciA9IHZpZXcuZWRpdG9yO1xuICAgIGNvbnN0IGJlZm9yZSA9IHRoaXMuc2V0dGluZ3MuYWRkTmV3bGluZUJlZm9yZSA/ICdcXG4nIDogJyc7XG4gICAgY29uc3QgYWZ0ZXIgPSB0aGlzLnNldHRpbmdzLmFkZE5ld2xpbmVBZnRlciA/ICdcXG4nIDogJyc7XG4gICAgY29uc3QgY29udGVudCA9IGAke2JlZm9yZX0ke3RleHR9JHthZnRlcn1gO1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmluc2VydE1vZGUgPT09ICdyZXBsYWNlJyAmJiBlZGl0b3Iuc29tZXRoaW5nU2VsZWN0ZWQoKSkge1xuICAgICAgZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oY29udGVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoY29udGVudCwgZWRpdG9yLmdldEN1cnNvcigpKTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIFByb21wdFByZXNldCB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgQUlUcmFuc2NyaXB0U2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBQbHVnaW4sIHByaXZhdGUgZ2V0U2V0dGluZ3M6ICgpID0+IEFJVHJhbnNjcmlwdFNldHRpbmdzLCBwcml2YXRlIHNhdmVTZXR0aW5nczogKHM6IFBhcnRpYWw8QUlUcmFuc2NyaXB0U2V0dGluZ3M+KSA9PiBQcm9taXNlPHZvaWQ+KSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnQUkgVHJhbnNjcmlwdCcgfSk7XG5cbiAgICBjb25zdCBzID0gdGhpcy5nZXRTZXR0aW5ncygpO1xuXG4gICAgLy8gR1JPUVxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ0dyb3EgV2hpc3BlcicgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnR3JvcSBBUEkgS2V5JylcbiAgICAgIC5zZXREZXNjKCdSZXF1aXJlZCB0byB0cmFuc2NyaWJlIGF1ZGlvIHZpYSBHcm9xIFdoaXNwZXIuJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2dza18uLi4nKVxuICAgICAgICAuc2V0VmFsdWUocy5ncm9xQXBpS2V5IHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBncm9xQXBpS2V5OiB2LnRyaW0oKSB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnR3JvcSBtb2RlbCcpXG4gICAgICAuc2V0RGVzYygnRGVmYXVsdDogd2hpc3Blci1sYXJnZS12MycpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFZhbHVlKHMuZ3JvcU1vZGVsKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBncm9xTW9kZWw6IHYudHJpbSgpIHx8ICd3aGlzcGVyLWxhcmdlLXYzJyB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnTGFuZ3VhZ2UgKG9wdGlvbmFsKScpXG4gICAgICAuc2V0RGVzYygnSVNPIGNvZGUgbGlrZSBlbiwgZXMsIGRlLiBMZWF2ZSBlbXB0eSBmb3IgYXV0by4nKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRWYWx1ZShzLmxhbmd1YWdlIHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBsYW5ndWFnZTogdi50cmltKCkgfHwgdW5kZWZpbmVkIH0pOyB9KSk7XG5cbiAgICAvLyBPcGVuQUlcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdPcGVuQUkgUG9zdHByb2Nlc3NpbmcgKG9wdGlvbmFsKScgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnT3BlbkFJIEFQSSBLZXknKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRQbGFjZWhvbGRlcignc2stLi4uJylcbiAgICAgICAgLnNldFZhbHVlKHMub3BlbmFpQXBpS2V5IHx8ICcnKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBvcGVuYWlBcGlLZXk6IHYudHJpbSgpIH0pOyB9KSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdPcGVuQUkgbW9kZWwnKVxuICAgICAgLnNldERlc2MoJ0RlZmF1bHQ6IGdwdC00by1taW5pJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0VmFsdWUocy5vcGVuYWlNb2RlbClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgb3BlbmFpTW9kZWw6IHYudHJpbSgpIHx8ICdncHQtNG8tbWluaScgfSk7IH0pKTtcblxuICAgIC8vIFByZXNldHNcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6ICdQcm9tcHQgcHJlc2V0cycgfSk7XG5cbiAgICBjb25zdCBsaXN0RWwgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoKTtcbiAgICBjb25zdCByZW5kZXJQcmVzZXRzID0gKCkgPT4ge1xuICAgICAgbGlzdEVsLmVtcHR5KCk7XG4gICAgICBjb25zdCBzdCA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcbiAgICAgIHN0LnByb21wdFByZXNldHMuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgICBjb25zdCB3cmFwID0gbGlzdEVsLmNyZWF0ZURpdih7IGNsczogJ2FpLXByZXNldCcgfSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUocC5uYW1lKVxuICAgICAgICAgIC5zZXREZXNjKCdTeXN0ZW0gcHJvbXB0ICsgdGVtcGVyYXR1cmUnKVxuICAgICAgICAgIC5hZGRCdXR0b24oYiA9PiBiLnNldEJ1dHRvblRleHQoJ1NldCBEZWZhdWx0Jykub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IGRlZmF1bHRQcm9tcHRJZDogcC5pZCB9KTtcbiAgICAgICAgICAgIHJlbmRlclByZXNldHMoKTtcbiAgICAgICAgICB9KSlcbiAgICAgICAgICAuYWRkQnV0dG9uKGIgPT4gYi5zZXRCdXR0b25UZXh0KCdEZWxldGUnKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkID0gc3QucHJvbXB0UHJlc2V0cy5maWx0ZXIoeCA9PiB4LmlkICE9PSBwLmlkKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogZmlsdGVyZWQgfSk7XG4gICAgICAgICAgICByZW5kZXJQcmVzZXRzKCk7XG4gICAgICAgICAgfSkpO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKCdOYW1lJylcbiAgICAgICAgICAuYWRkVGV4dCh0ID0+IHQuc2V0VmFsdWUocC5uYW1lKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgcC5uYW1lID0gdjsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnU3lzdGVtIHByb21wdCcpXG4gICAgICAgICAgLmFkZFRleHRBcmVhKHQgPT4gdC5zZXRWYWx1ZShwLnN5c3RlbSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgIHAuc3lzdGVtID0gdjsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnVGVtcGVyYXR1cmUnKVxuICAgICAgICAgIC5hZGRUZXh0KHQgPT4gdC5zZXRWYWx1ZShTdHJpbmcocC50ZW1wZXJhdHVyZSkpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIodik7IHAudGVtcGVyYXR1cmUgPSBpc0Zpbml0ZShudW0pID8gbnVtIDogMC4yOyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IHN0LnByb21wdFByZXNldHMgfSk7XG4gICAgICAgICAgfSkpO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKCdNb2RlbCBvdmVycmlkZSAob3B0aW9uYWwpJylcbiAgICAgICAgICAuYWRkVGV4dCh0ID0+IHQuc2V0UGxhY2Vob2xkZXIoJ2UuZy4sIGdwdC00by1taW5pJykuc2V0VmFsdWUocC5tb2RlbCB8fCAnJykub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgIHAubW9kZWwgPSB2LnRyaW0oKSB8fCB1bmRlZmluZWQ7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIGlmIChzdC5kZWZhdWx0UHJvbXB0SWQgPT09IHAuaWQpIHdyYXAuY3JlYXRlRGl2KHsgdGV4dDogJ0RlZmF1bHQgcHJlc2V0JywgY2xzOiAnYWktcHJlc2V0LWRlZmF1bHQnIH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlclByZXNldHMoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0FkZCBwcmVzZXQnKVxuICAgICAgLmFkZEJ1dHRvbihiID0+IGIuc2V0QnV0dG9uVGV4dCgnQWRkJykub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ID0gdGhpcy5nZXRTZXR0aW5ncygpO1xuICAgICAgICBjb25zdCBpZCA9IGBwcmVzZXQtJHtEYXRlLm5vdygpfWA7XG4gICAgICAgIGNvbnN0IHByZXNldDogUHJvbXB0UHJlc2V0ID0geyBpZCwgbmFtZTogJ05ldyBQcmVzZXQnLCBzeXN0ZW06ICdFZGl0IG1lXHUyMDI2JywgdGVtcGVyYXR1cmU6IDAuMiB9O1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IFsuLi5zdC5wcm9tcHRQcmVzZXRzLCBwcmVzZXRdIH0pO1xuICAgICAgICByZW5kZXJQcmVzZXRzKCk7XG4gICAgICB9KSk7XG5cbiAgICAvLyBSZWNvcmRpbmcgYmVoYXZpb3JcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdSZWNvcmRpbmcgJiBJbnNlcnRpb24nIH0pO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1Nob3cgcmVjb3JkaW5nIG1vZGFsJylcbiAgICAgIC5hZGRUb2dnbGUodCA9PiB0LnNldFZhbHVlKHMuc2hvd01vZGFsV2hpbGVSZWNvcmRpbmcpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgc2hvd01vZGFsV2hpbGVSZWNvcmRpbmc6IHYgfSk7XG4gICAgICB9KSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnTWF4IGR1cmF0aW9uIChzZWNvbmRzKScpXG4gICAgICAuYWRkVGV4dCh0ID0+IHQuc2V0VmFsdWUoU3RyaW5nKHMubWF4RHVyYXRpb25TZWMpKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICBjb25zdCBuID0gTnVtYmVyKHYpOyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IG1heER1cmF0aW9uU2VjOiBpc0Zpbml0ZShuKSAmJiBuID4gMCA/IE1hdGguZmxvb3IobikgOiA5MDAgfSk7XG4gICAgICB9KSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnSW5zZXJ0IG1vZGUnKVxuICAgICAgLnNldERlc2MoJ0luc2VydCBhdCBjdXJzb3Igb3IgcmVwbGFjZSBzZWxlY3Rpb24nKVxuICAgICAgLmFkZERyb3Bkb3duKGQgPT4gZFxuICAgICAgICAuYWRkT3B0aW9uKCdpbnNlcnQnLCAnSW5zZXJ0IGF0IGN1cnNvcicpXG4gICAgICAgIC5hZGRPcHRpb24oJ3JlcGxhY2UnLCAnUmVwbGFjZSBzZWxlY3Rpb24nKVxuICAgICAgICAuc2V0VmFsdWUocy5pbnNlcnRNb2RlKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBpbnNlcnRNb2RlOiB2IGFzIGFueSB9KTsgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0FkZCBuZXdsaW5lIGJlZm9yZScpXG4gICAgICAuYWRkVG9nZ2xlKHQgPT4gdC5zZXRWYWx1ZShzLmFkZE5ld2xpbmVCZWZvcmUpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgYWRkTmV3bGluZUJlZm9yZTogdiB9KTsgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0FkZCBuZXdsaW5lIGFmdGVyJylcbiAgICAgIC5hZGRUb2dnbGUodCA9PiB0LnNldFZhbHVlKHMuYWRkTmV3bGluZUFmdGVyKS5vbkNoYW5nZShhc3luYyAodikgPT4geyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IGFkZE5ld2xpbmVBZnRlcjogdiB9KTsgfSkpO1xuICB9XG59XG4iLCAiZXhwb3J0IGNsYXNzIEF1ZGlvUmVjb3JkZXIge1xuICBwcml2YXRlIG1lZGlhUmVjb3JkZXI/OiBNZWRpYVJlY29yZGVyO1xuICBwcml2YXRlIGNodW5rczogQmxvYlBhcnRbXSA9IFtdO1xuICBwcml2YXRlIHN0cmVhbT86IE1lZGlhU3RyZWFtO1xuICBwcml2YXRlIHN0YXJ0ZWRBdCA9IDA7XG4gIHByaXZhdGUgdGltZXI/OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBvblRpY2s/OiAoZWxhcHNlZE1zOiBudW1iZXIpID0+IHZvaWQpIHt9XG5cbiAgYXN5bmMgc3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMubWVkaWFSZWNvcmRlciAmJiB0aGlzLm1lZGlhUmVjb3JkZXIuc3RhdGUgPT09ICdyZWNvcmRpbmcnKSByZXR1cm47XG4gICAgdGhpcy5jaHVua3MgPSBbXTtcbiAgICB0aGlzLnN0cmVhbSA9IGF3YWl0IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHsgYXVkaW86IHRydWUgfSk7XG4gICAgY29uc3QgbWltZUNhbmRpZGF0ZXMgPSBbXG4gICAgICAnYXVkaW8vd2VibTtjb2RlY3M9b3B1cycsXG4gICAgICAnYXVkaW8vd2VibScsXG4gICAgICAnYXVkaW8vb2dnO2NvZGVjcz1vcHVzJyxcbiAgICAgICcnXG4gICAgXTtcbiAgICBsZXQgbWltZVR5cGUgPSAnJztcbiAgICBmb3IgKGNvbnN0IGNhbmQgb2YgbWltZUNhbmRpZGF0ZXMpIHtcbiAgICAgIGlmICghY2FuZCB8fCAod2luZG93IGFzIGFueSkuTWVkaWFSZWNvcmRlcj8uaXNUeXBlU3VwcG9ydGVkPy4oY2FuZCkpIHsgbWltZVR5cGUgPSBjYW5kOyBicmVhazsgfVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHRoaXMubWVkaWFSZWNvcmRlciA9IG5ldyBNZWRpYVJlY29yZGVyKHRoaXMuc3RyZWFtLCBtaW1lVHlwZSA/IHsgbWltZVR5cGUgfSA6IHVuZGVmaW5lZCk7XG4gICAgdGhpcy5tZWRpYVJlY29yZGVyLm9uZGF0YWF2YWlsYWJsZSA9IChlOiBCbG9iRXZlbnQpID0+IHsgaWYgKGUuZGF0YT8uc2l6ZSkgdGhpcy5jaHVua3MucHVzaChlLmRhdGEpOyB9O1xuICAgIHRoaXMubWVkaWFSZWNvcmRlci5zdGFydCgyNTApOyAvLyBzbWFsbCBjaHVua3NcbiAgICB0aGlzLnN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgaWYgKHRoaXMub25UaWNrKSB0aGlzLnRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHRoaXMub25UaWNrIShEYXRlLm5vdygpIC0gdGhpcy5zdGFydGVkQXQpLCAyMDApO1xuICB9XG5cbiAgcGF1c2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVkaWFSZWNvcmRlciAmJiB0aGlzLm1lZGlhUmVjb3JkZXIuc3RhdGUgPT09ICdyZWNvcmRpbmcnICYmIHR5cGVvZiB0aGlzLm1lZGlhUmVjb3JkZXIucGF1c2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMubWVkaWFSZWNvcmRlci5wYXVzZSgpO1xuICAgIH1cbiAgfVxuXG4gIHJlc3VtZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZWRpYVJlY29yZGVyICYmIHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSA9PT0gJ3BhdXNlZCcgJiYgdHlwZW9mIHRoaXMubWVkaWFSZWNvcmRlci5yZXN1bWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMubWVkaWFSZWNvcmRlci5yZXN1bWUoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzdG9wKCk6IFByb21pc2U8QmxvYj4ge1xuICAgIGNvbnN0IHJlYyA9IHRoaXMubWVkaWFSZWNvcmRlcjtcbiAgICBpZiAoIXJlYykgdGhyb3cgbmV3IEVycm9yKCdSZWNvcmRlciBub3Qgc3RhcnRlZCcpO1xuICAgIGNvbnN0IHN0b3BQcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgIHJlYy5vbnN0b3AgPSAoKSA9PiByZXNvbHZlKCk7XG4gICAgfSk7XG4gICAgaWYgKHJlYy5zdGF0ZSAhPT0gJ2luYWN0aXZlJykgcmVjLnN0b3AoKTtcbiAgICBhd2FpdCBzdG9wUHJvbWlzZTtcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IodGhpcy5jaHVua3MsIHsgdHlwZTogdGhpcy5jaHVua3MubGVuZ3RoID8gKHRoaXMuY2h1bmtzWzBdIGFzIGFueSkudHlwZSB8fCAnYXVkaW8vd2VibScgOiAnYXVkaW8vd2VibScgfSk7XG4gICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgcmV0dXJuIGJsb2I7XG4gIH1cblxuICBkaXNjYXJkKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1lZGlhUmVjb3JkZXIgJiYgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXRlICE9PSAnaW5hY3RpdmUnKSB0aGlzLm1lZGlhUmVjb3JkZXIuc3RvcCgpO1xuICAgIHRoaXMuY2xlYW51cCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGVhbnVwKCkge1xuICAgIGlmICh0aGlzLnRpbWVyKSB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcbiAgICB0aGlzLnRpbWVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMubWVkaWFSZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnN0YXJ0ZWRBdCA9IDA7XG4gICAgaWYgKHRoaXMuc3RyZWFtKSB7XG4gICAgICB0aGlzLnN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKHQgPT4gdC5zdG9wKCkpO1xuICAgICAgdGhpcy5zdHJlYW0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMuY2h1bmtzID0gW107XG4gIH1cbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFJVHJhbnNjcmlwdFNldHRpbmdzLCBQcm9tcHRQcmVzZXQgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvc3Rwcm9jZXNzV2l0aE9wZW5BSShyYXc6IHN0cmluZywgc2V0dGluZ3M6IEFJVHJhbnNjcmlwdFNldHRpbmdzLCBwcmVzZXQ/OiBQcm9tcHRQcmVzZXQpOiBQcm9taXNlPHN0cmluZz4ge1xuICBpZiAoIXNldHRpbmdzLm9wZW5haUFwaUtleSkgcmV0dXJuIHJhdzsgLy8gc2lsZW50bHkgc2tpcCBpZiBtaXNzaW5nXG4gIGNvbnN0IG1vZGVsID0gcHJlc2V0Py5tb2RlbCB8fCBzZXR0aW5ncy5vcGVuYWlNb2RlbCB8fCAnZ3B0LTRvLW1pbmknO1xuICBjb25zdCB0ZW1wZXJhdHVyZSA9IGNsYW1wKChwcmVzZXQ/LnRlbXBlcmF0dXJlID8/IDAuMiksIDAsIDEpO1xuICBjb25zdCBzeXN0ZW0gPSBwcmVzZXQ/LnN5c3RlbSB8fCAnWW91IGNsZWFuIHVwIHNwb2tlbiB0ZXh0LiBGaXggY2FwaXRhbGl6YXRpb24gYW5kIHB1bmN0dWF0aW9uLCByZW1vdmUgZmlsbGVyIHdvcmRzLCBwcmVzZXJ2ZSBtZWFuaW5nLiBEbyBub3QgYWRkIGNvbnRlbnQuJztcblxuICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY2hhdC9jb21wbGV0aW9ucycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtzZXR0aW5ncy5vcGVuYWlBcGlLZXl9YCxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBtb2RlbCxcbiAgICAgIHRlbXBlcmF0dXJlLFxuICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3lzdGVtIH0sXG4gICAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiByYXcgfSxcbiAgICAgIF0sXG4gICAgfSksXG4gIH0pO1xuICBpZiAoIXJlc3Aub2spIHtcbiAgICAvLyBJZiBPcGVuQUkgZmFpbHMsIHJldHVybiByYXcgcmF0aGVyIHRoYW4gYnJlYWtpbmcgaW5zZXJ0aW9uXG4gICAgdHJ5IHsgY29uc29sZS53YXJuKCdPcGVuQUkgcG9zdHByb2Nlc3MgZmFpbGVkJywgcmVzcC5zdGF0dXMsIGF3YWl0IHJlc3AudGV4dCgpKTsgfSBjYXRjaCB7fVxuICAgIHJldHVybiByYXc7XG4gIH1cbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpO1xuICBjb25zdCBjbGVhbmVkID0gZGF0YT8uY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50O1xuICByZXR1cm4gdHlwZW9mIGNsZWFuZWQgPT09ICdzdHJpbmcnICYmIGNsZWFuZWQudHJpbSgpID8gY2xlYW5lZCA6IHJhdztcbn1cblxuZnVuY3Rpb24gY2xhbXAobjogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHsgcmV0dXJuIE1hdGgubWF4KG1pbiwgTWF0aC5taW4obWF4LCBuKSk7IH1cblxuIiwgImltcG9ydCB0eXBlIHsgQUlUcmFuc2NyaXB0U2V0dGluZ3MgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRyYW5zY3JpYmVXaXRoR3JvcShibG9iOiBCbG9iLCBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MpOiBQcm9taXNlPHN0cmluZz4ge1xuICBpZiAoIXNldHRpbmdzLmdyb3FBcGlLZXkpIHRocm93IG5ldyBFcnJvcignR3JvcSBBUEkga2V5IGlzIG1pc3NpbmcgaW4gc2V0dGluZ3MuJyk7XG4gIGNvbnN0IGZkID0gbmV3IEZvcm1EYXRhKCk7XG4gIGZkLmFwcGVuZCgnZmlsZScsIG5ldyBGaWxlKFtibG9iXSwgJ2F1ZGlvLndlYm0nLCB7IHR5cGU6IGJsb2IudHlwZSB8fCAnYXVkaW8vd2VibScgfSkpO1xuICBmZC5hcHBlbmQoJ21vZGVsJywgc2V0dGluZ3MuZ3JvcU1vZGVsIHx8ICd3aGlzcGVyLWxhcmdlLXYzJyk7XG4gIGlmIChzZXR0aW5ncy5sYW5ndWFnZSkgZmQuYXBwZW5kKCdsYW5ndWFnZScsIHNldHRpbmdzLmxhbmd1YWdlKTtcblxuICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLmdyb3EuY29tL29wZW5haS92MS9hdWRpby90cmFuc2NyaXB0aW9ucycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3NldHRpbmdzLmdyb3FBcGlLZXl9YCB9LFxuICAgIGJvZHk6IGZkLFxuICB9KTtcbiAgaWYgKCFyZXNwLm9rKSB7XG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IHNhZmVUZXh0KHJlc3ApO1xuICAgIHRocm93IG5ldyBFcnJvcihgR3JvcSB0cmFuc2NyaXB0aW9uIGZhaWxlZCAoJHtyZXNwLnN0YXR1c30pOiAke3RleHR9YCk7XG4gIH1cbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpO1xuICBpZiAodHlwZW9mIGRhdGE/LnRleHQgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ0dyb3EgcmVzcG9uc2UgbWlzc2luZyB0ZXh0Jyk7XG4gIHJldHVybiBkYXRhLnRleHQgYXMgc3RyaW5nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYWZlVGV4dChyZXNwOiBSZXNwb25zZSkge1xuICB0cnkgeyByZXR1cm4gYXdhaXQgcmVzcC50ZXh0KCk7IH0gY2F0Y2ggeyByZXR1cm4gJzxuby1ib2R5Pic7IH1cbn1cblxuIiwgImV4cG9ydCB0eXBlIEluc2VydE1vZGUgPSAnaW5zZXJ0JyB8ICdyZXBsYWNlJztcblxuZXhwb3J0IGludGVyZmFjZSBQcm9tcHRQcmVzZXQge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHN5c3RlbTogc3RyaW5nO1xuICB0ZW1wZXJhdHVyZTogbnVtYmVyO1xuICBtb2RlbD86IHN0cmluZzsgLy8gb3B0aW9uYWwgT3BlbkFJIG1vZGVsIG92ZXJyaWRlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQUlUcmFuc2NyaXB0U2V0dGluZ3Mge1xuICBncm9xQXBpS2V5OiBzdHJpbmc7XG4gIGdyb3FNb2RlbDogc3RyaW5nOyAvLyBlLmcuLCAnd2hpc3Blci1sYXJnZS12MydcbiAgbGFuZ3VhZ2U/OiBzdHJpbmc7IC8vIElTTyBjb2RlLCBvcHRpb25hbFxuXG4gIG9wZW5haUFwaUtleT86IHN0cmluZztcbiAgb3BlbmFpTW9kZWw6IHN0cmluZzsgLy8gZS5nLiwgJ2dwdC00by1taW5pJ1xuXG4gIHByb21wdFByZXNldHM6IFByb21wdFByZXNldFtdO1xuICBkZWZhdWx0UHJvbXB0SWQ/OiBzdHJpbmc7XG4gIGxhc3RVc2VkUHJvbXB0SWQ/OiBzdHJpbmc7XG5cbiAgc2hvd01vZGFsV2hpbGVSZWNvcmRpbmc6IGJvb2xlYW47XG4gIG1heER1cmF0aW9uU2VjOiBudW1iZXI7XG4gIGluc2VydE1vZGU6IEluc2VydE1vZGU7XG4gIGFkZE5ld2xpbmVCZWZvcmU6IGJvb2xlYW47XG4gIGFkZE5ld2xpbmVBZnRlcjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJFU0VUOiBQcm9tcHRQcmVzZXQgPSB7XG4gIGlkOiAncG9saXNoZWQnLFxuICBuYW1lOiAnUG9saXNoZWQnLFxuICBzeXN0ZW06XG4gICAgJ1lvdSBjbGVhbiB1cCBzcG9rZW4gdGV4dC4gRml4IGNhcGl0YWxpemF0aW9uIGFuZCBwdW5jdHVhdGlvbiwgcmVtb3ZlIGZpbGxlciB3b3JkcywgcHJlc2VydmUgbWVhbmluZy4gRG8gbm90IGFkZCBjb250ZW50LicsXG4gIHRlbXBlcmF0dXJlOiAwLjIsXG59O1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQUlUcmFuc2NyaXB0U2V0dGluZ3MgPSB7XG4gIGdyb3FBcGlLZXk6ICcnLFxuICBncm9xTW9kZWw6ICd3aGlzcGVyLWxhcmdlLXYzJyxcbiAgbGFuZ3VhZ2U6IHVuZGVmaW5lZCxcblxuICBvcGVuYWlBcGlLZXk6ICcnLFxuICBvcGVuYWlNb2RlbDogJ2dwdC00by1taW5pJyxcblxuICBwcm9tcHRQcmVzZXRzOiBbREVGQVVMVF9QUkVTRVRdLFxuICBkZWZhdWx0UHJvbXB0SWQ6ICdwb2xpc2hlZCcsXG4gIGxhc3RVc2VkUHJvbXB0SWQ6ICdwb2xpc2hlZCcsXG5cbiAgc2hvd01vZGFsV2hpbGVSZWNvcmRpbmc6IHRydWUsXG4gIG1heER1cmF0aW9uU2VjOiA5MDAsXG4gIGluc2VydE1vZGU6ICdpbnNlcnQnLFxuICBhZGROZXdsaW5lQmVmb3JlOiBmYWxzZSxcbiAgYWRkTmV3bGluZUFmdGVyOiB0cnVlLFxufTtcbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBTZXR0aW5nLCBEcm9wZG93bkNvbXBvbmVudCB9IGZyb20gJ29ic2lkaWFuJztcblxuZXhwb3J0IGludGVyZmFjZSBSZWNvcmRpbmdNb2RhbE9wdGlvbnMge1xuICBwcmVzZXRzOiB7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9W107XG4gIGRlZmF1bHRQcmVzZXRJZD86IHN0cmluZztcbiAgbWF4RHVyYXRpb25TZWM6IG51bWJlcjtcbiAgb25TdGFydD86ICgpID0+IHZvaWQ7XG4gIG9uU3RvcDogKGFwcGx5UG9zdDogYm9vbGVhbiwgcHJlc2V0SWQ/OiBzdHJpbmcpID0+IHZvaWQ7XG4gIG9uRGlzY2FyZDogKCkgPT4gdm9pZDtcbiAgb25QYXVzZT86ICgpID0+IHZvaWQ7XG4gIG9uUmVzdW1lPzogKCkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIFJlY29yZGluZ01vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIHJvb3RFbD86IEhUTUxEaXZFbGVtZW50O1xuICBwcml2YXRlIGVsYXBzZWRFbD86IEhUTUxFbGVtZW50O1xuICBwcml2YXRlIHRpbWVyPzogbnVtYmVyO1xuICBwcml2YXRlIHN0YXJ0ZWRBdCA9IDA7XG4gIHByaXZhdGUgcHJlc2V0RHJvcGRvd24/OiBEcm9wZG93bkNvbXBvbmVudDtcbiAgcHJpdmF0ZSBwYXVzZUJ0bkVsPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gIHByaXZhdGUgdHJhbnNjcmliZUJ0bkVsPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gIHByaXZhdGUgcG9zdHByb2Nlc3NCdG5FbD86IEhUTUxCdXR0b25FbGVtZW50O1xuICBwcml2YXRlIHN0YXR1c1RleHRFbD86IEhUTUxFbGVtZW50O1xuICBwcml2YXRlIGRpc2NhcmRCdG5FbD86IEhUTUxCdXR0b25FbGVtZW50O1xuICBwcml2YXRlIGlzUGF1c2VkID0gZmFsc2U7XG4gIHByaXZhdGUgcGF1c2VTdGFydGVkQXQgPSAwO1xuICBwcml2YXRlIGFjY3VtdWxhdGVkUGF1c2VNcyA9IDA7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgb3B0czogUmVjb3JkaW5nTW9kYWxPcHRpb25zKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcblxuICAgIHRoaXMucm9vdEVsID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2FpLXRyYW5zY3JpcHQtcm9vdCcgfSk7XG4gICAgdGhpcy5yb290RWwuc2V0QXR0cmlidXRlKCdkYXRhLXBoYXNlJywgJ3JlY29yZGluZycpO1xuXG4gICAgY29uc3QgaGVhZGVyID0gdGhpcy5yb290RWwuY3JlYXRlRGl2KHsgY2xzOiAnYWktdHJhbnNjcmlwdC1oZWFkZXInIH0pO1xuICAgIGhlYWRlci5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdSZWNvcmRpbmdcdTIwMjYnIH0pO1xuICAgIGNvbnN0IGhlYWRlclJpZ2h0ID0gaGVhZGVyLmNyZWF0ZURpdih7IGNsczogJ2FpLXRyYW5zY3JpcHQtaGVhZGVyLXJpZ2h0JyB9KTtcbiAgICBoZWFkZXJSaWdodC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1yZWMtaW5kaWNhdG9yJywgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICdSZWNvcmRpbmcgaW5kaWNhdG9yJyB9IH0pO1xuICAgIHRoaXMuZWxhcHNlZEVsID0gaGVhZGVyUmlnaHQuY3JlYXRlRGl2KHsgdGV4dDogJzAwOjAwJywgY2xzOiAnYWktdHJhbnNjcmlwdC10aW1lcicgfSk7XG4gICAgdGhpcy5wYXVzZUJ0bkVsID0gaGVhZGVyUmlnaHQuY3JlYXRlRWwoJ2J1dHRvbicsIHtcbiAgICAgIHRleHQ6ICdQYXVzZScsXG4gICAgICB0eXBlOiAnYnV0dG9uJyxcbiAgICAgIGNsczogJ2FpLXRyYW5zY3JpcHQtcGF1c2UnLFxuICAgICAgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICdQYXVzZSByZWNvcmRpbmcnLCAnYXJpYS1wcmVzc2VkJzogJ2ZhbHNlJyB9LFxuICAgIH0pO1xuICAgIHRoaXMucGF1c2VCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudG9nZ2xlUGF1c2UoKSk7XG4gICAgdGhpcy5yZXNldFBhdXNlU3RhdGUoKTtcblxuICAgIGNvbnN0IGJvZHkgPSB0aGlzLnJvb3RFbC5jcmVhdGVEaXYoeyBjbHM6ICdhaS10cmFuc2NyaXB0LWJvZHknIH0pO1xuXG4gICAgLy8gUHJlc2V0IHNlbGVjdGlvblxuICAgIG5ldyBTZXR0aW5nKGJvZHkpXG4gICAgICAuc2V0TmFtZSgnUG9zdHByb2Nlc3NpbmcgcHJlc2V0JylcbiAgICAgIC5hZGREcm9wZG93bihkID0+IHtcbiAgICAgICAgdGhpcy5wcmVzZXREcm9wZG93biA9IGQ7XG4gICAgICAgIGZvciAoY29uc3QgcCBvZiB0aGlzLm9wdHMucHJlc2V0cykgZC5hZGRPcHRpb24ocC5pZCwgcC5uYW1lKTtcbiAgICAgICAgaWYgKHRoaXMub3B0cy5kZWZhdWx0UHJlc2V0SWQpIGQuc2V0VmFsdWUodGhpcy5vcHRzLmRlZmF1bHRQcmVzZXRJZCk7XG4gICAgICB9KTtcblxuICAgIGNvbnN0IGJ0bnMgPSBib2R5LmNyZWF0ZURpdih7IGNsczogJ2FpLXRyYW5zY3JpcHQtYnV0dG9ucycgfSk7XG4gICAgdGhpcy50cmFuc2NyaWJlQnRuRWwgPSBidG5zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdUcmFuc2NyaWJlJywgdHlwZTogJ2J1dHRvbicgfSk7XG4gICAgdGhpcy5wb3N0cHJvY2Vzc0J0bkVsID0gYnRucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnUG9zdFByb2Nlc3MnLCB0eXBlOiAnYnV0dG9uJyB9KTtcbiAgICB0aGlzLmRpc2NhcmRCdG5FbCA9IGJ0bnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ0Rpc2NhcmQnLCB0eXBlOiAnYnV0dG9uJyB9KTtcbiAgICB0aGlzLnRyYW5zY3JpYmVCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudHJpZ2dlclN0b3AoZmFsc2UpKTtcbiAgICB0aGlzLnBvc3Rwcm9jZXNzQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnRyaWdnZXJTdG9wKHRydWUpKTtcbiAgICB0aGlzLmRpc2NhcmRCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMub3B0cy5vbkRpc2NhcmQoKSk7XG5cbiAgICBjb25zdCBzdGF0dXNCYXIgPSB0aGlzLnJvb3RFbC5jcmVhdGVEaXYoeyBjbHM6ICdhaS10cmFuc2NyaXB0LXN0YXR1c2JhcicgfSk7XG4gICAgY29uc3Qgc3RhdHVzV3JhcCA9IHN0YXR1c0Jhci5jcmVhdGVEaXYoeyBjbHM6ICdhaS1zdGF0dXMtd3JhcCcgfSk7XG4gICAgc3RhdHVzV3JhcC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1zcGlubmVyJywgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICdXb3JraW5nXHUyMDI2JyB9IH0pO1xuICAgIHRoaXMuc3RhdHVzVGV4dEVsID0gc3RhdHVzV3JhcC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1zdGF0dXMtdGV4dCcsIHRleHQ6ICdSZWNvcmRpbmcgYXVkaW9cdTIwMjYnIH0pO1xuXG4gICAgdGhpcy5tb2RhbEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgdGhpcy5vcHRzLm9uRGlzY2FyZCgpO1xuICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyU3RvcChmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBTdGFydCB0aW1lclxuICAgIHRoaXMuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHRoaXMudGljaygpLCAyMDApO1xuICAgIHRoaXMub3B0cy5vblN0YXJ0Py4oKTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudGltZXIpIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuICAgIHRoaXMudGltZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxuXG4gIHByaXZhdGUgdGljaygpOiB2b2lkIHtcbiAgICBjb25zdCBlbGFwc2VkTXMgPSB0aGlzLmdldEVsYXBzZWRNcygpO1xuICAgIGNvbnN0IHNlYyA9IE1hdGguZmxvb3IoZWxhcHNlZE1zIC8gMTAwMCk7XG4gICAgY29uc3QgbW0gPSBNYXRoLmZsb29yKHNlYyAvIDYwKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgY29uc3Qgc3MgPSAoc2VjICUgNjApLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICBpZiAodGhpcy5lbGFwc2VkRWwpIHRoaXMuZWxhcHNlZEVsLnRleHRDb250ZW50ID0gYCR7bW19OiR7c3N9YDtcbiAgICBpZiAodGhpcy5vcHRzLm1heER1cmF0aW9uU2VjID4gMCAmJiAhdGhpcy5pc1BhdXNlZCAmJiBzZWMgPj0gdGhpcy5vcHRzLm1heER1cmF0aW9uU2VjKSB7XG4gICAgICB0aGlzLnRyaWdnZXJTdG9wKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldEVsYXBzZWRNcygpOiBudW1iZXIge1xuICAgIGlmICghdGhpcy5zdGFydGVkQXQpIHJldHVybiAwO1xuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgbGV0IGVsYXBzZWQgPSBub3cgLSB0aGlzLnN0YXJ0ZWRBdCAtIHRoaXMuYWNjdW11bGF0ZWRQYXVzZU1zO1xuICAgIGlmICh0aGlzLmlzUGF1c2VkICYmIHRoaXMucGF1c2VTdGFydGVkQXQpIHtcbiAgICAgIGVsYXBzZWQgLT0gbm93IC0gdGhpcy5wYXVzZVN0YXJ0ZWRBdDtcbiAgICB9XG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIGVsYXBzZWQpO1xuICB9XG5cbiAgcHJpdmF0ZSB0cmlnZ2VyU3RvcChhcHBseVBvc3Q6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmZpbmFsaXplUGF1c2VTdGF0ZSgpO1xuICAgIGNvbnN0IHByZXNldElkID0gdGhpcy5wcmVzZXREcm9wZG93bj8uZ2V0VmFsdWUoKTtcbiAgICB0aGlzLm9wdHMub25TdG9wKGFwcGx5UG9zdCwgcHJlc2V0SWQpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b2dnbGVQYXVzZSgpIHtcbiAgICBpZiAodGhpcy5pc1BhdXNlZCkge1xuICAgICAgdGhpcy5yZXN1bWVSZWNvcmRpbmcoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYXVzZVJlY29yZGluZygpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGF1c2VSZWNvcmRpbmcoKSB7XG4gICAgaWYgKHRoaXMuaXNQYXVzZWQpIHJldHVybjtcbiAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgICB0aGlzLnBhdXNlU3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKTtcbiAgICB0aGlzLm9wdHMub25QYXVzZT8uKCk7XG4gIH1cblxuICBwcml2YXRlIHJlc3VtZVJlY29yZGluZygpIHtcbiAgICBpZiAoIXRoaXMuaXNQYXVzZWQpIHJldHVybjtcbiAgICBpZiAodGhpcy5wYXVzZVN0YXJ0ZWRBdCkgdGhpcy5hY2N1bXVsYXRlZFBhdXNlTXMgKz0gRGF0ZS5ub3coKSAtIHRoaXMucGF1c2VTdGFydGVkQXQ7XG4gICAgdGhpcy5wYXVzZVN0YXJ0ZWRBdCA9IDA7XG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMudXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpO1xuICAgIHRoaXMub3B0cy5vblJlc3VtZT8uKCk7XG4gIH1cblxuICBwcml2YXRlIGZpbmFsaXplUGF1c2VTdGF0ZSgpIHtcbiAgICBpZiAodGhpcy5pc1BhdXNlZCAmJiB0aGlzLnBhdXNlU3RhcnRlZEF0KSB7XG4gICAgICB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcyArPSBEYXRlLm5vdygpIC0gdGhpcy5wYXVzZVN0YXJ0ZWRBdDtcbiAgICB9XG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSAwO1xuICAgIHRoaXMudXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNldFBhdXNlU3RhdGUoKSB7XG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSAwO1xuICAgIHRoaXMuYWNjdW11bGF0ZWRQYXVzZU1zID0gMDtcbiAgICB0aGlzLnVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpIHtcbiAgICBpZiAoIXRoaXMucGF1c2VCdG5FbCkgcmV0dXJuO1xuICAgIHRoaXMucGF1c2VCdG5FbC50ZXh0Q29udGVudCA9IHRoaXMuaXNQYXVzZWQgPyAnUmVzdW1lJyA6ICdQYXVzZSc7XG4gICAgdGhpcy5wYXVzZUJ0bkVsLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgdGhpcy5pc1BhdXNlZCA/ICd0cnVlJyA6ICdmYWxzZScpO1xuICAgIHRoaXMucGF1c2VCdG5FbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCB0aGlzLmlzUGF1c2VkID8gJ1Jlc3VtZSByZWNvcmRpbmcnIDogJ1BhdXNlIHJlY29yZGluZycpO1xuICB9XG5cbiAgLy8gUHVibGljIFVJIGhlbHBlcnNcbiAgc2V0UGhhc2UocGhhc2U6ICdyZWNvcmRpbmcnIHwgJ3RyYW5zY3JpYmluZycgfCAncG9zdHByb2Nlc3NpbmcnIHwgJ2RvbmUnIHwgJ2Vycm9yJykge1xuICAgIHRoaXMucm9vdEVsPy5zZXRBdHRyaWJ1dGUoJ2RhdGEtcGhhc2UnLCBwaGFzZSk7XG4gICAgaWYgKHBoYXNlICE9PSAncmVjb3JkaW5nJykge1xuICAgICAgdGhpcy5maW5hbGl6ZVBhdXNlU3RhdGUoKTtcbiAgICAgIGlmICh0aGlzLnRpbWVyKSB7IHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGltZXIpOyB0aGlzLnRpbWVyID0gdW5kZWZpbmVkOyB9XG4gICAgfVxuICAgIGlmICh0aGlzLnBhdXNlQnRuRWwpIHRoaXMucGF1c2VCdG5FbC5kaXNhYmxlZCA9IHBoYXNlICE9PSAncmVjb3JkaW5nJztcbiAgfVxuXG4gIHNldFN0YXR1cyh0ZXh0OiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5zdGF0dXNUZXh0RWwpIHRoaXMuc3RhdHVzVGV4dEVsLnRleHRDb250ZW50ID0gdGV4dDtcbiAgfVxuXG4gIHNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKHRyYW5zY3JpYmVFbmFibGVkOiBib29sZWFuLCBwb3N0cHJvY2Vzc0VuYWJsZWQ6IGJvb2xlYW4sIGRpc2NhcmRFbmFibGVkOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMudHJhbnNjcmliZUJ0bkVsKSB0aGlzLnRyYW5zY3JpYmVCdG5FbC5kaXNhYmxlZCA9ICF0cmFuc2NyaWJlRW5hYmxlZDtcbiAgICBpZiAodGhpcy5wb3N0cHJvY2Vzc0J0bkVsKSB0aGlzLnBvc3Rwcm9jZXNzQnRuRWwuZGlzYWJsZWQgPSAhcG9zdHByb2Nlc3NFbmFibGVkO1xuICAgIGlmICh0aGlzLmRpc2NhcmRCdG5FbCkgdGhpcy5kaXNjYXJkQnRuRWwuZGlzYWJsZWQgPSAhZGlzY2FyZEVuYWJsZWQ7XG4gIH1cblxuICBzZXREaXNjYXJkTGFiZWwobGFiZWw6IHN0cmluZykge1xuICAgIGlmICh0aGlzLmRpc2NhcmRCdG5FbCkgdGhpcy5kaXNjYXJkQnRuRWwudGV4dENvbnRlbnQgPSBsYWJlbDtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQUEsbUJBQTBDOzs7QUNBMUMsc0JBQXVEO0FBR2hELElBQU0seUJBQU4sY0FBcUMsaUNBQWlCO0FBQUEsRUFDM0QsWUFBWSxLQUFVLFFBQXdCLGFBQWlELGNBQW1FO0FBQ2hLLFVBQU0sS0FBSyxNQUFNO0FBRDJCO0FBQWlEO0FBQUEsRUFFL0Y7QUFBQSxFQUVBLFVBQWdCO0FBQ2QsVUFBTSxFQUFFLFlBQVksSUFBSTtBQUN4QixnQkFBWSxNQUFNO0FBQ2xCLGdCQUFZLFNBQVMsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFcEQsVUFBTSxJQUFJLEtBQUssWUFBWTtBQUczQixnQkFBWSxTQUFTLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxjQUFjLEVBQ3RCLFFBQVEsZ0RBQWdELEVBQ3hELFFBQVEsT0FBSyxFQUNYLGVBQWUsU0FBUyxFQUN4QixTQUFTLEVBQUUsY0FBYyxFQUFFLEVBQzNCLFNBQVMsT0FBTyxNQUFNO0FBQUUsWUFBTSxLQUFLLGFBQWEsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFBQSxJQUFHLENBQUMsQ0FBQztBQUVsRixRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxZQUFZLEVBQ3BCLFFBQVEsMkJBQTJCLEVBQ25DLFFBQVEsT0FBSyxFQUNYLFNBQVMsRUFBRSxTQUFTLEVBQ3BCLFNBQVMsT0FBTyxNQUFNO0FBQUUsWUFBTSxLQUFLLGFBQWEsRUFBRSxXQUFXLEVBQUUsS0FBSyxLQUFLLG1CQUFtQixDQUFDO0FBQUEsSUFBRyxDQUFDLENBQUM7QUFFdkcsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEscUJBQXFCLEVBQzdCLFFBQVEsaURBQWlELEVBQ3pELFFBQVEsT0FBSyxFQUNYLFNBQVMsRUFBRSxZQUFZLEVBQUUsRUFDekIsU0FBUyxPQUFPLE1BQU07QUFBRSxZQUFNLEtBQUssYUFBYSxFQUFFLFVBQVUsRUFBRSxLQUFLLEtBQUssT0FBVSxDQUFDO0FBQUEsSUFBRyxDQUFDLENBQUM7QUFHN0YsZ0JBQVksU0FBUyxNQUFNLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUN2RSxRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxnQkFBZ0IsRUFDeEIsUUFBUSxPQUFLLEVBQ1gsZUFBZSxRQUFRLEVBQ3ZCLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxFQUM3QixTQUFTLE9BQU8sTUFBTTtBQUFFLFlBQU0sS0FBSyxhQUFhLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQUEsSUFBRyxDQUFDLENBQUM7QUFFcEYsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsY0FBYyxFQUN0QixRQUFRLHNCQUFzQixFQUM5QixRQUFRLE9BQUssRUFDWCxTQUFTLEVBQUUsV0FBVyxFQUN0QixTQUFTLE9BQU8sTUFBTTtBQUFFLFlBQU0sS0FBSyxhQUFhLEVBQUUsYUFBYSxFQUFFLEtBQUssS0FBSyxjQUFjLENBQUM7QUFBQSxJQUFHLENBQUMsQ0FBQztBQUdwRyxnQkFBWSxTQUFTLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRXJELFVBQU0sU0FBUyxZQUFZLFVBQVU7QUFDckMsVUFBTSxnQkFBZ0IsTUFBTTtBQUMxQixhQUFPLE1BQU07QUFDYixZQUFNLEtBQUssS0FBSyxZQUFZO0FBQzVCLFNBQUcsY0FBYyxRQUFRLENBQUMsTUFBTTtBQUM5QixjQUFNLE9BQU8sT0FBTyxVQUFVLEVBQUUsS0FBSyxZQUFZLENBQUM7QUFDbEQsWUFBSSx3QkFBUSxJQUFJLEVBQ2IsUUFBUSxFQUFFLElBQUksRUFDZCxRQUFRLDZCQUE2QixFQUNyQyxVQUFVLE9BQUssRUFBRSxjQUFjLGFBQWEsRUFBRSxRQUFRLFlBQVk7QUFDakUsZ0JBQU0sS0FBSyxhQUFhLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxDQUFDO0FBQ2pELHdCQUFjO0FBQUEsUUFDaEIsQ0FBQyxDQUFDLEVBQ0QsVUFBVSxPQUFLLEVBQUUsY0FBYyxRQUFRLEVBQUUsUUFBUSxZQUFZO0FBQzVELGdCQUFNLFdBQVcsR0FBRyxjQUFjLE9BQU8sT0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO0FBQzNELGdCQUFNLEtBQUssYUFBYSxFQUFFLGVBQWUsU0FBUyxDQUFDO0FBQ25ELHdCQUFjO0FBQUEsUUFDaEIsQ0FBQyxDQUFDO0FBQ0osWUFBSSx3QkFBUSxJQUFJLEVBQ2IsUUFBUSxNQUFNLEVBQ2QsUUFBUSxPQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLE9BQU8sTUFBTTtBQUNyRCxZQUFFLE9BQU87QUFBRyxnQkFBTSxLQUFLLGFBQWEsRUFBRSxlQUFlLEdBQUcsY0FBYyxDQUFDO0FBQUEsUUFDekUsQ0FBQyxDQUFDO0FBQ0osWUFBSSx3QkFBUSxJQUFJLEVBQ2IsUUFBUSxlQUFlLEVBQ3ZCLFlBQVksT0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxPQUFPLE1BQU07QUFDM0QsWUFBRSxTQUFTO0FBQUcsZ0JBQU0sS0FBSyxhQUFhLEVBQUUsZUFBZSxHQUFHLGNBQWMsQ0FBQztBQUFBLFFBQzNFLENBQUMsQ0FBQztBQUNKLFlBQUksd0JBQVEsSUFBSSxFQUNiLFFBQVEsYUFBYSxFQUNyQixRQUFRLE9BQUssRUFBRSxTQUFTLE9BQU8sRUFBRSxXQUFXLENBQUMsRUFBRSxTQUFTLE9BQU8sTUFBTTtBQUNwRSxnQkFBTSxNQUFNLE9BQU8sQ0FBQztBQUFHLFlBQUUsY0FBYyxTQUFTLEdBQUcsSUFBSSxNQUFNO0FBQUssZ0JBQU0sS0FBSyxhQUFhLEVBQUUsZUFBZSxHQUFHLGNBQWMsQ0FBQztBQUFBLFFBQy9ILENBQUMsQ0FBQztBQUNKLFlBQUksd0JBQVEsSUFBSSxFQUNiLFFBQVEsMkJBQTJCLEVBQ25DLFFBQVEsT0FBSyxFQUFFLGVBQWUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLFNBQVMsT0FBTyxNQUFNO0FBQ2hHLFlBQUUsUUFBUSxFQUFFLEtBQUssS0FBSztBQUFXLGdCQUFNLEtBQUssYUFBYSxFQUFFLGVBQWUsR0FBRyxjQUFjLENBQUM7QUFBQSxRQUM5RixDQUFDLENBQUM7QUFDSixZQUFJLEdBQUcsb0JBQW9CLEVBQUUsR0FBSSxNQUFLLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixLQUFLLG9CQUFvQixDQUFDO0FBQUEsTUFDdEcsQ0FBQztBQUFBLElBQ0g7QUFFQSxrQkFBYztBQUVkLFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLFlBQVksRUFDcEIsVUFBVSxPQUFLLEVBQUUsY0FBYyxLQUFLLEVBQUUsUUFBUSxZQUFZO0FBQ3pELFlBQU0sS0FBSyxLQUFLLFlBQVk7QUFDNUIsWUFBTSxLQUFLLFVBQVUsS0FBSyxJQUFJLENBQUM7QUFDL0IsWUFBTSxTQUF1QixFQUFFLElBQUksTUFBTSxjQUFjLFFBQVEsaUJBQVksYUFBYSxJQUFJO0FBQzVGLFlBQU0sS0FBSyxhQUFhLEVBQUUsZUFBZSxDQUFDLEdBQUcsR0FBRyxlQUFlLE1BQU0sRUFBRSxDQUFDO0FBQ3hFLG9CQUFjO0FBQUEsSUFDaEIsQ0FBQyxDQUFDO0FBR0osZ0JBQVksU0FBUyxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM1RCxRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxzQkFBc0IsRUFDOUIsVUFBVSxPQUFLLEVBQUUsU0FBUyxFQUFFLHVCQUF1QixFQUFFLFNBQVMsT0FBTyxNQUFNO0FBQzFFLFlBQU0sS0FBSyxhQUFhLEVBQUUseUJBQXlCLEVBQUUsQ0FBQztBQUFBLElBQ3hELENBQUMsQ0FBQztBQUNKLFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLHdCQUF3QixFQUNoQyxRQUFRLE9BQUssRUFBRSxTQUFTLE9BQU8sRUFBRSxjQUFjLENBQUMsRUFBRSxTQUFTLE9BQU8sTUFBTTtBQUN2RSxZQUFNLElBQUksT0FBTyxDQUFDO0FBQUcsWUFBTSxLQUFLLGFBQWEsRUFBRSxnQkFBZ0IsU0FBUyxDQUFDLEtBQUssSUFBSSxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDO0FBQUEsSUFDN0csQ0FBQyxDQUFDO0FBQ0osUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsYUFBYSxFQUNyQixRQUFRLHVDQUF1QyxFQUMvQyxZQUFZLE9BQUssRUFDZixVQUFVLFVBQVUsa0JBQWtCLEVBQ3RDLFVBQVUsV0FBVyxtQkFBbUIsRUFDeEMsU0FBUyxFQUFFLFVBQVUsRUFDckIsU0FBUyxPQUFPLE1BQU07QUFBRSxZQUFNLEtBQUssYUFBYSxFQUFFLFlBQVksRUFBUyxDQUFDO0FBQUEsSUFBRyxDQUFDLENBQUM7QUFDbEYsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsb0JBQW9CLEVBQzVCLFVBQVUsT0FBSyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLE9BQU8sTUFBTTtBQUFFLFlBQU0sS0FBSyxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQztBQUFBLElBQUcsQ0FBQyxDQUFDO0FBQzdILFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLG1CQUFtQixFQUMzQixVQUFVLE9BQUssRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLFNBQVMsT0FBTyxNQUFNO0FBQUUsWUFBTSxLQUFLLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxDQUFDO0FBQUEsSUFBRyxDQUFDLENBQUM7QUFBQSxFQUM3SDtBQUNGOzs7QUMzSU8sSUFBTSxnQkFBTixNQUFvQjtBQUFBLEVBT3pCLFlBQW9CLFFBQXNDO0FBQXRDO0FBTHBCLFNBQVEsU0FBcUIsQ0FBQztBQUU5QixTQUFRLFlBQVk7QUFBQSxFQUd1QztBQUFBLEVBRTNELE1BQU0sUUFBdUI7QUFDM0IsUUFBSSxLQUFLLGlCQUFpQixLQUFLLGNBQWMsVUFBVSxZQUFhO0FBQ3BFLFNBQUssU0FBUyxDQUFDO0FBQ2YsU0FBSyxTQUFTLE1BQU0sVUFBVSxhQUFhLGFBQWEsRUFBRSxPQUFPLEtBQUssQ0FBQztBQUN2RSxVQUFNLGlCQUFpQjtBQUFBLE1BQ3JCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUNBLFFBQUksV0FBVztBQUNmLGVBQVcsUUFBUSxnQkFBZ0I7QUFDakMsVUFBSSxDQUFDLFFBQVMsT0FBZSxlQUFlLGtCQUFrQixJQUFJLEdBQUc7QUFBRSxtQkFBVztBQUFNO0FBQUEsTUFBTztBQUFBLElBQ2pHO0FBR0EsU0FBSyxnQkFBZ0IsSUFBSSxjQUFjLEtBQUssUUFBUSxXQUFXLEVBQUUsU0FBUyxJQUFJLE1BQVM7QUFDdkYsU0FBSyxjQUFjLGtCQUFrQixDQUFDLE1BQWlCO0FBQUUsVUFBSSxFQUFFLE1BQU0sS0FBTSxNQUFLLE9BQU8sS0FBSyxFQUFFLElBQUk7QUFBQSxJQUFHO0FBQ3JHLFNBQUssY0FBYyxNQUFNLEdBQUc7QUFDNUIsU0FBSyxZQUFZLEtBQUssSUFBSTtBQUMxQixRQUFJLEtBQUssT0FBUSxNQUFLLFFBQVEsT0FBTyxZQUFZLE1BQU0sS0FBSyxPQUFRLEtBQUssSUFBSSxJQUFJLEtBQUssU0FBUyxHQUFHLEdBQUc7QUFBQSxFQUN2RztBQUFBLEVBRUEsUUFBYztBQUNaLFFBQUksS0FBSyxpQkFBaUIsS0FBSyxjQUFjLFVBQVUsZUFBZSxPQUFPLEtBQUssY0FBYyxVQUFVLFlBQVk7QUFDcEgsV0FBSyxjQUFjLE1BQU07QUFBQSxJQUMzQjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFNBQWU7QUFDYixRQUFJLEtBQUssaUJBQWlCLEtBQUssY0FBYyxVQUFVLFlBQVksT0FBTyxLQUFLLGNBQWMsV0FBVyxZQUFZO0FBQ2xILFdBQUssY0FBYyxPQUFPO0FBQUEsSUFDNUI7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLE9BQXNCO0FBQzFCLFVBQU0sTUFBTSxLQUFLO0FBQ2pCLFFBQUksQ0FBQyxJQUFLLE9BQU0sSUFBSSxNQUFNLHNCQUFzQjtBQUNoRCxVQUFNLGNBQWMsSUFBSSxRQUFjLENBQUMsWUFBWTtBQUNqRCxVQUFJLFNBQVMsTUFBTSxRQUFRO0FBQUEsSUFDN0IsQ0FBQztBQUNELFFBQUksSUFBSSxVQUFVLFdBQVksS0FBSSxLQUFLO0FBQ3ZDLFVBQU07QUFDTixVQUFNLE9BQU8sSUFBSSxLQUFLLEtBQUssUUFBUSxFQUFFLE1BQU0sS0FBSyxPQUFPLFNBQVUsS0FBSyxPQUFPLENBQUMsRUFBVSxRQUFRLGVBQWUsYUFBYSxDQUFDO0FBQzdILFNBQUssUUFBUTtBQUNiLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFFBQUksS0FBSyxpQkFBaUIsS0FBSyxjQUFjLFVBQVUsV0FBWSxNQUFLLGNBQWMsS0FBSztBQUMzRixTQUFLLFFBQVE7QUFBQSxFQUNmO0FBQUEsRUFFUSxVQUFVO0FBQ2hCLFFBQUksS0FBSyxNQUFPLFFBQU8sY0FBYyxLQUFLLEtBQUs7QUFDL0MsU0FBSyxRQUFRO0FBQ2IsU0FBSyxnQkFBZ0I7QUFDckIsU0FBSyxZQUFZO0FBQ2pCLFFBQUksS0FBSyxRQUFRO0FBQ2YsV0FBSyxPQUFPLFVBQVUsRUFBRSxRQUFRLE9BQUssRUFBRSxLQUFLLENBQUM7QUFDN0MsV0FBSyxTQUFTO0FBQUEsSUFDaEI7QUFDQSxTQUFLLFNBQVMsQ0FBQztBQUFBLEVBQ2pCO0FBQ0Y7OztBQ3ZFQSxlQUFzQixzQkFBc0IsS0FBYSxVQUFnQyxRQUF3QztBQUMvSCxNQUFJLENBQUMsU0FBUyxhQUFjLFFBQU87QUFDbkMsUUFBTSxRQUFRLFFBQVEsU0FBUyxTQUFTLGVBQWU7QUFDdkQsUUFBTSxjQUFjLE1BQU8sUUFBUSxlQUFlLEtBQU0sR0FBRyxDQUFDO0FBQzVELFFBQU0sU0FBUyxRQUFRLFVBQVU7QUFFakMsUUFBTSxPQUFPLE1BQU0sTUFBTSw4Q0FBOEM7QUFBQSxJQUNyRSxRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsTUFDUCxpQkFBaUIsVUFBVSxTQUFTLFlBQVk7QUFBQSxNQUNoRCxnQkFBZ0I7QUFBQSxJQUNsQjtBQUFBLElBQ0EsTUFBTSxLQUFLLFVBQVU7QUFBQSxNQUNuQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNSLEVBQUUsTUFBTSxVQUFVLFNBQVMsT0FBTztBQUFBLFFBQ2xDLEVBQUUsTUFBTSxRQUFRLFNBQVMsSUFBSTtBQUFBLE1BQy9CO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSCxDQUFDO0FBQ0QsTUFBSSxDQUFDLEtBQUssSUFBSTtBQUVaLFFBQUk7QUFBRSxjQUFRLEtBQUssNkJBQTZCLEtBQUssUUFBUSxNQUFNLEtBQUssS0FBSyxDQUFDO0FBQUEsSUFBRyxRQUFRO0FBQUEsSUFBQztBQUMxRixXQUFPO0FBQUEsRUFDVDtBQUNBLFFBQU0sT0FBTyxNQUFNLEtBQUssS0FBSztBQUM3QixRQUFNLFVBQVUsTUFBTSxVQUFVLENBQUMsR0FBRyxTQUFTO0FBQzdDLFNBQU8sT0FBTyxZQUFZLFlBQVksUUFBUSxLQUFLLElBQUksVUFBVTtBQUNuRTtBQUVBLFNBQVMsTUFBTSxHQUFXLEtBQWEsS0FBYTtBQUFFLFNBQU8sS0FBSyxJQUFJLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxDQUFDO0FBQUc7OztBQy9COUYsZUFBc0IsbUJBQW1CLE1BQVksVUFBaUQ7QUFDcEcsTUFBSSxDQUFDLFNBQVMsV0FBWSxPQUFNLElBQUksTUFBTSxzQ0FBc0M7QUFDaEYsUUFBTSxLQUFLLElBQUksU0FBUztBQUN4QixLQUFHLE9BQU8sUUFBUSxJQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsY0FBYyxFQUFFLE1BQU0sS0FBSyxRQUFRLGFBQWEsQ0FBQyxDQUFDO0FBQ3JGLEtBQUcsT0FBTyxTQUFTLFNBQVMsYUFBYSxrQkFBa0I7QUFDM0QsTUFBSSxTQUFTLFNBQVUsSUFBRyxPQUFPLFlBQVksU0FBUyxRQUFRO0FBRTlELFFBQU0sT0FBTyxNQUFNLE1BQU0sdURBQXVEO0FBQUEsSUFDOUUsUUFBUTtBQUFBLElBQ1IsU0FBUyxFQUFFLGlCQUFpQixVQUFVLFNBQVMsVUFBVSxHQUFHO0FBQUEsSUFDNUQsTUFBTTtBQUFBLEVBQ1IsQ0FBQztBQUNELE1BQUksQ0FBQyxLQUFLLElBQUk7QUFDWixVQUFNLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFDaEMsVUFBTSxJQUFJLE1BQU0sOEJBQThCLEtBQUssTUFBTSxNQUFNLElBQUksRUFBRTtBQUFBLEVBQ3ZFO0FBQ0EsUUFBTSxPQUFPLE1BQU0sS0FBSyxLQUFLO0FBQzdCLE1BQUksT0FBTyxNQUFNLFNBQVMsU0FBVSxPQUFNLElBQUksTUFBTSw0QkFBNEI7QUFDaEYsU0FBTyxLQUFLO0FBQ2Q7QUFFQSxlQUFlLFNBQVMsTUFBZ0I7QUFDdEMsTUFBSTtBQUFFLFdBQU8sTUFBTSxLQUFLLEtBQUs7QUFBQSxFQUFHLFFBQVE7QUFBRSxXQUFPO0FBQUEsRUFBYTtBQUNoRTs7O0FDSU8sSUFBTSxpQkFBK0I7QUFBQSxFQUMxQyxJQUFJO0FBQUEsRUFDSixNQUFNO0FBQUEsRUFDTixRQUNFO0FBQUEsRUFDRixhQUFhO0FBQ2Y7QUFFTyxJQUFNLG1CQUF5QztBQUFBLEVBQ3BELFlBQVk7QUFBQSxFQUNaLFdBQVc7QUFBQSxFQUNYLFVBQVU7QUFBQSxFQUVWLGNBQWM7QUFBQSxFQUNkLGFBQWE7QUFBQSxFQUViLGVBQWUsQ0FBQyxjQUFjO0FBQUEsRUFDOUIsaUJBQWlCO0FBQUEsRUFDakIsa0JBQWtCO0FBQUEsRUFFbEIseUJBQXlCO0FBQUEsRUFDekIsZ0JBQWdCO0FBQUEsRUFDaEIsWUFBWTtBQUFBLEVBQ1osa0JBQWtCO0FBQUEsRUFDbEIsaUJBQWlCO0FBQ25COzs7QUN0REEsSUFBQUMsbUJBQXVEO0FBYWhELElBQU0saUJBQU4sY0FBNkIsdUJBQU07QUFBQSxFQWV4QyxZQUFZLEtBQWtCLE1BQTZCO0FBQ3pELFVBQU0sR0FBRztBQURtQjtBQVg5QixTQUFRLFlBQVk7QUFPcEIsU0FBUSxXQUFXO0FBQ25CLFNBQVEsaUJBQWlCO0FBQ3pCLFNBQVEscUJBQXFCO0FBQUEsRUFJN0I7QUFBQSxFQUVBLFNBQWU7QUFDYixVQUFNLEVBQUUsVUFBVSxJQUFJO0FBQ3RCLGNBQVUsTUFBTTtBQUVoQixTQUFLLFNBQVMsVUFBVSxVQUFVLEVBQUUsS0FBSyxxQkFBcUIsQ0FBQztBQUMvRCxTQUFLLE9BQU8sYUFBYSxjQUFjLFdBQVc7QUFFbEQsVUFBTSxTQUFTLEtBQUssT0FBTyxVQUFVLEVBQUUsS0FBSyx1QkFBdUIsQ0FBQztBQUNwRSxXQUFPLFNBQVMsTUFBTSxFQUFFLE1BQU0sa0JBQWEsQ0FBQztBQUM1QyxVQUFNLGNBQWMsT0FBTyxVQUFVLEVBQUUsS0FBSyw2QkFBNkIsQ0FBQztBQUMxRSxnQkFBWSxVQUFVLEVBQUUsS0FBSyxvQkFBb0IsTUFBTSxFQUFFLGNBQWMsc0JBQXNCLEVBQUUsQ0FBQztBQUNoRyxTQUFLLFlBQVksWUFBWSxVQUFVLEVBQUUsTUFBTSxTQUFTLEtBQUssc0JBQXNCLENBQUM7QUFDcEYsU0FBSyxhQUFhLFlBQVksU0FBUyxVQUFVO0FBQUEsTUFDL0MsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLE1BQ0wsTUFBTSxFQUFFLGNBQWMsbUJBQW1CLGdCQUFnQixRQUFRO0FBQUEsSUFDbkUsQ0FBQztBQUNELFNBQUssV0FBVyxpQkFBaUIsU0FBUyxNQUFNLEtBQUssWUFBWSxDQUFDO0FBQ2xFLFNBQUssZ0JBQWdCO0FBRXJCLFVBQU0sT0FBTyxLQUFLLE9BQU8sVUFBVSxFQUFFLEtBQUsscUJBQXFCLENBQUM7QUFHaEUsUUFBSSx5QkFBUSxJQUFJLEVBQ2IsUUFBUSx1QkFBdUIsRUFDL0IsWUFBWSxPQUFLO0FBQ2hCLFdBQUssaUJBQWlCO0FBQ3RCLGlCQUFXLEtBQUssS0FBSyxLQUFLLFFBQVMsR0FBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUk7QUFDM0QsVUFBSSxLQUFLLEtBQUssZ0JBQWlCLEdBQUUsU0FBUyxLQUFLLEtBQUssZUFBZTtBQUFBLElBQ3JFLENBQUM7QUFFSCxVQUFNLE9BQU8sS0FBSyxVQUFVLEVBQUUsS0FBSyx3QkFBd0IsQ0FBQztBQUM1RCxTQUFLLGtCQUFrQixLQUFLLFNBQVMsVUFBVSxFQUFFLE1BQU0sY0FBYyxNQUFNLFNBQVMsQ0FBQztBQUNyRixTQUFLLG1CQUFtQixLQUFLLFNBQVMsVUFBVSxFQUFFLE1BQU0sZUFBZSxNQUFNLFNBQVMsQ0FBQztBQUN2RixTQUFLLGVBQWUsS0FBSyxTQUFTLFVBQVUsRUFBRSxNQUFNLFdBQVcsTUFBTSxTQUFTLENBQUM7QUFDL0UsU0FBSyxnQkFBZ0IsaUJBQWlCLFNBQVMsTUFBTSxLQUFLLFlBQVksS0FBSyxDQUFDO0FBQzVFLFNBQUssaUJBQWlCLGlCQUFpQixTQUFTLE1BQU0sS0FBSyxZQUFZLElBQUksQ0FBQztBQUM1RSxTQUFLLGFBQWEsaUJBQWlCLFNBQVMsTUFBTSxLQUFLLEtBQUssVUFBVSxDQUFDO0FBRXZFLFVBQU0sWUFBWSxLQUFLLE9BQU8sVUFBVSxFQUFFLEtBQUssMEJBQTBCLENBQUM7QUFDMUUsVUFBTSxhQUFhLFVBQVUsVUFBVSxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDaEUsZUFBVyxVQUFVLEVBQUUsS0FBSyxjQUFjLE1BQU0sRUFBRSxjQUFjLGdCQUFXLEVBQUUsQ0FBQztBQUM5RSxTQUFLLGVBQWUsV0FBVyxVQUFVLEVBQUUsS0FBSyxrQkFBa0IsTUFBTSx3QkFBbUIsQ0FBQztBQUU1RixTQUFLLFFBQVEsaUJBQWlCLFdBQVcsQ0FBQyxNQUFNO0FBQzlDLFVBQUksRUFBRSxRQUFRLFNBQVUsTUFBSyxLQUFLLFVBQVU7QUFDNUMsVUFBSSxFQUFFLFFBQVEsU0FBUztBQUNyQixVQUFFLGVBQWU7QUFDakIsYUFBSyxZQUFZLEtBQUs7QUFBQSxNQUN4QjtBQUFBLElBQ0YsQ0FBQztBQUdELFNBQUssWUFBWSxLQUFLLElBQUk7QUFDMUIsU0FBSyxRQUFRLE9BQU8sWUFBWSxNQUFNLEtBQUssS0FBSyxHQUFHLEdBQUc7QUFDdEQsU0FBSyxLQUFLLFVBQVU7QUFBQSxFQUN0QjtBQUFBLEVBRUEsVUFBZ0I7QUFDZCxRQUFJLEtBQUssTUFBTyxRQUFPLGNBQWMsS0FBSyxLQUFLO0FBQy9DLFNBQUssUUFBUTtBQUNiLFNBQUssVUFBVSxNQUFNO0FBQUEsRUFDdkI7QUFBQSxFQUVRLE9BQWE7QUFDbkIsVUFBTSxZQUFZLEtBQUssYUFBYTtBQUNwQyxVQUFNLE1BQU0sS0FBSyxNQUFNLFlBQVksR0FBSTtBQUN2QyxVQUFNLEtBQUssS0FBSyxNQUFNLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUMxRCxVQUFNLE1BQU0sTUFBTSxJQUFJLFNBQVMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNoRCxRQUFJLEtBQUssVUFBVyxNQUFLLFVBQVUsY0FBYyxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQzVELFFBQUksS0FBSyxLQUFLLGlCQUFpQixLQUFLLENBQUMsS0FBSyxZQUFZLE9BQU8sS0FBSyxLQUFLLGdCQUFnQjtBQUNyRixXQUFLLFlBQVksS0FBSztBQUFBLElBQ3hCO0FBQUEsRUFDRjtBQUFBLEVBRVEsZUFBdUI7QUFDN0IsUUFBSSxDQUFDLEtBQUssVUFBVyxRQUFPO0FBQzVCLFVBQU0sTUFBTSxLQUFLLElBQUk7QUFDckIsUUFBSSxVQUFVLE1BQU0sS0FBSyxZQUFZLEtBQUs7QUFDMUMsUUFBSSxLQUFLLFlBQVksS0FBSyxnQkFBZ0I7QUFDeEMsaUJBQVcsTUFBTSxLQUFLO0FBQUEsSUFDeEI7QUFDQSxXQUFPLEtBQUssSUFBSSxHQUFHLE9BQU87QUFBQSxFQUM1QjtBQUFBLEVBRVEsWUFBWSxXQUFvQjtBQUN0QyxTQUFLLG1CQUFtQjtBQUN4QixVQUFNLFdBQVcsS0FBSyxnQkFBZ0IsU0FBUztBQUMvQyxTQUFLLEtBQUssT0FBTyxXQUFXLFFBQVE7QUFBQSxFQUN0QztBQUFBLEVBRVEsY0FBYztBQUNwQixRQUFJLEtBQUssVUFBVTtBQUNqQixXQUFLLGdCQUFnQjtBQUFBLElBQ3ZCLE9BQU87QUFDTCxXQUFLLGVBQWU7QUFBQSxJQUN0QjtBQUFBLEVBQ0Y7QUFBQSxFQUVRLGlCQUFpQjtBQUN2QixRQUFJLEtBQUssU0FBVTtBQUNuQixTQUFLLFdBQVc7QUFDaEIsU0FBSyxpQkFBaUIsS0FBSyxJQUFJO0FBQy9CLFNBQUssdUJBQXVCO0FBQzVCLFNBQUssS0FBSyxVQUFVO0FBQUEsRUFDdEI7QUFBQSxFQUVRLGtCQUFrQjtBQUN4QixRQUFJLENBQUMsS0FBSyxTQUFVO0FBQ3BCLFFBQUksS0FBSyxlQUFnQixNQUFLLHNCQUFzQixLQUFLLElBQUksSUFBSSxLQUFLO0FBQ3RFLFNBQUssaUJBQWlCO0FBQ3RCLFNBQUssV0FBVztBQUNoQixTQUFLLHVCQUF1QjtBQUM1QixTQUFLLEtBQUssV0FBVztBQUFBLEVBQ3ZCO0FBQUEsRUFFUSxxQkFBcUI7QUFDM0IsUUFBSSxLQUFLLFlBQVksS0FBSyxnQkFBZ0I7QUFDeEMsV0FBSyxzQkFBc0IsS0FBSyxJQUFJLElBQUksS0FBSztBQUFBLElBQy9DO0FBQ0EsU0FBSyxXQUFXO0FBQ2hCLFNBQUssaUJBQWlCO0FBQ3RCLFNBQUssdUJBQXVCO0FBQUEsRUFDOUI7QUFBQSxFQUVRLGtCQUFrQjtBQUN4QixTQUFLLFdBQVc7QUFDaEIsU0FBSyxpQkFBaUI7QUFDdEIsU0FBSyxxQkFBcUI7QUFDMUIsU0FBSyx1QkFBdUI7QUFBQSxFQUM5QjtBQUFBLEVBRVEseUJBQXlCO0FBQy9CLFFBQUksQ0FBQyxLQUFLLFdBQVk7QUFDdEIsU0FBSyxXQUFXLGNBQWMsS0FBSyxXQUFXLFdBQVc7QUFDekQsU0FBSyxXQUFXLGFBQWEsZ0JBQWdCLEtBQUssV0FBVyxTQUFTLE9BQU87QUFDN0UsU0FBSyxXQUFXLGFBQWEsY0FBYyxLQUFLLFdBQVcscUJBQXFCLGlCQUFpQjtBQUFBLEVBQ25HO0FBQUE7QUFBQSxFQUdBLFNBQVMsT0FBMkU7QUFDbEYsU0FBSyxRQUFRLGFBQWEsY0FBYyxLQUFLO0FBQzdDLFFBQUksVUFBVSxhQUFhO0FBQ3pCLFdBQUssbUJBQW1CO0FBQ3hCLFVBQUksS0FBSyxPQUFPO0FBQUUsZUFBTyxjQUFjLEtBQUssS0FBSztBQUFHLGFBQUssUUFBUTtBQUFBLE1BQVc7QUFBQSxJQUM5RTtBQUNBLFFBQUksS0FBSyxXQUFZLE1BQUssV0FBVyxXQUFXLFVBQVU7QUFBQSxFQUM1RDtBQUFBLEVBRUEsVUFBVSxNQUFjO0FBQ3RCLFFBQUksS0FBSyxhQUFjLE1BQUssYUFBYSxjQUFjO0FBQUEsRUFDekQ7QUFBQSxFQUVBLHdCQUF3QixtQkFBNEIsb0JBQTZCLGdCQUF5QjtBQUN4RyxRQUFJLEtBQUssZ0JBQWlCLE1BQUssZ0JBQWdCLFdBQVcsQ0FBQztBQUMzRCxRQUFJLEtBQUssaUJBQWtCLE1BQUssaUJBQWlCLFdBQVcsQ0FBQztBQUM3RCxRQUFJLEtBQUssYUFBYyxNQUFLLGFBQWEsV0FBVyxDQUFDO0FBQUEsRUFDdkQ7QUFBQSxFQUVBLGdCQUFnQixPQUFlO0FBQzdCLFFBQUksS0FBSyxhQUFjLE1BQUssYUFBYSxjQUFjO0FBQUEsRUFDekQ7QUFDRjs7O0FOM0xBLElBQXFCLHFCQUFyQixjQUFnRCx3QkFBTztBQUFBLEVBQXZEO0FBQUE7QUFDRSxvQkFBaUMsRUFBRSxHQUFHLGtCQUFrQixlQUFlLENBQUMsR0FBRyxpQkFBaUIsYUFBYSxFQUFFO0FBQUE7QUFBQSxFQUkzRyxNQUFNLFNBQVM7QUFDYixTQUFLLFdBQVcsT0FBTyxPQUFPLENBQUMsR0FBRyxrQkFBa0IsTUFBTSxLQUFLLFNBQVMsQ0FBQztBQUV6RSxTQUFLLGNBQWMsT0FBTyx1QkFBdUIsTUFBTSxLQUFLLGdCQUFnQixDQUFDO0FBRTdFLFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLEVBQUUsV0FBVyxDQUFDLE9BQU8sT0FBTyxHQUFHLEtBQUssSUFBSSxDQUFDO0FBQUEsTUFDbkQsVUFBVSxNQUFNLEtBQUssZ0JBQWdCO0FBQUEsSUFDdkMsQ0FBQztBQUVELFNBQUssY0FBYyxJQUFJLHVCQUF1QixLQUFLLEtBQUssTUFBTSxNQUFNLEtBQUssVUFBVSxPQUFPLFlBQVk7QUFDcEcsYUFBTyxPQUFPLEtBQUssVUFBVSxPQUFPO0FBQ3BDLFlBQU0sS0FBSyxTQUFTLEtBQUssUUFBUTtBQUFBLElBQ25DLENBQUMsQ0FBQztBQUFBLEVBQ0o7QUFBQSxFQUVBLFdBQVc7QUFDVCxRQUFJO0FBQUUsV0FBSyxVQUFVLFFBQVE7QUFBQSxJQUFHLFFBQVE7QUFBQSxJQUFDO0FBQ3pDLFFBQUk7QUFBRSxXQUFLLE9BQU8sTUFBTTtBQUFBLElBQUcsUUFBUTtBQUFBLElBQUM7QUFBQSxFQUN0QztBQUFBLEVBRUEsTUFBYyxrQkFBa0I7QUFFOUIsUUFBSSxLQUFLLE9BQU87QUFFZDtBQUFBLElBQ0Y7QUFHQSxVQUFNLE9BQU8sS0FBSyxJQUFJLFVBQVUsb0JBQW9CLDZCQUFZO0FBQ2hFLFFBQUksQ0FBQyxLQUFNO0FBR1gsU0FBSyxXQUFXLElBQUksY0FBYztBQUNsQyxVQUFNLFVBQVUsS0FBSyxTQUFTLGNBQWMsSUFBSSxRQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksTUFBTSxFQUFFLEtBQUssRUFBRTtBQUNqRixVQUFNLFFBQVEsSUFBSSxlQUFlLEtBQUssS0FBSztBQUFBLE1BQ3pDO0FBQUEsTUFDQSxpQkFBaUIsS0FBSyxTQUFTLG9CQUFvQixLQUFLLFNBQVM7QUFBQSxNQUNqRSxnQkFBZ0IsS0FBSyxTQUFTO0FBQUEsTUFDOUIsU0FBUyxZQUFZO0FBQ25CLFlBQUk7QUFDRixnQkFBTSxLQUFLLFNBQVUsTUFBTTtBQUFBLFFBQzdCLFNBQVMsR0FBUTtBQUNmLGtCQUFRLE1BQU0sQ0FBQztBQUNmLGdCQUFNLFNBQVMsT0FBTztBQUN0QixnQkFBTSxVQUFVLDBDQUEwQztBQUMxRCxnQkFBTSx3QkFBd0IsT0FBTyxPQUFPLElBQUk7QUFDaEQsZ0JBQU0sZ0JBQWdCLE9BQU87QUFDN0IsZUFBSyxVQUFVLFFBQVE7QUFDdkIsZUFBSyxXQUFXO0FBQUEsUUFDbEI7QUFBQSxNQUNGO0FBQUEsTUFDQSxRQUFRLE9BQU8sV0FBVyxhQUFhO0FBQ3JDLGNBQU0sd0JBQXdCLE9BQU8sT0FBTyxLQUFLO0FBQ2pELGNBQU0sU0FBUyxjQUFjO0FBQzdCLGNBQU0sVUFBVSxvQkFBZTtBQUMvQixZQUFJO0FBQ0YsZ0JBQU0sT0FBTyxNQUFNLEtBQUssU0FBVSxLQUFLO0FBQ3ZDLGVBQUssV0FBVztBQUNoQixnQkFBTSxNQUFNLE1BQU0sbUJBQW1CLE1BQU0sS0FBSyxRQUFRO0FBQ3hELGNBQUksT0FBTztBQUNYLGNBQUksV0FBVztBQUNiLGtCQUFNLFNBQVMsS0FBSyxTQUFTLGNBQWMsS0FBSyxPQUFLLEVBQUUsT0FBTyxRQUFRO0FBQ3RFLGlCQUFLLFNBQVMsbUJBQW1CLFFBQVEsTUFBTSxZQUFZLEtBQUssU0FBUztBQUN6RSxrQkFBTSxLQUFLLFNBQVMsS0FBSyxRQUFRO0FBQ2pDLGtCQUFNLFNBQVMsZ0JBQWdCO0FBQy9CLGtCQUFNLFVBQVUsMkJBQXNCO0FBQ3RDLG1CQUFPLE1BQU0sc0JBQXNCLEtBQUssS0FBSyxVQUFVLE1BQU07QUFBQSxVQUMvRDtBQUNBLGdCQUFNLEtBQUssV0FBVyxJQUFJO0FBQzFCLGdCQUFNLFNBQVMsTUFBTTtBQUNyQixnQkFBTSxVQUFVLG9DQUFvQztBQUNwRCxnQkFBTSx3QkFBd0IsT0FBTyxPQUFPLElBQUk7QUFDaEQsZ0JBQU0sZ0JBQWdCLE9BQU87QUFDN0IsaUJBQU8sV0FBVyxNQUFNO0FBQ3RCLGtCQUFNLE1BQU07QUFDWixnQkFBSSxLQUFLLFVBQVUsTUFBTyxNQUFLLFFBQVE7QUFBQSxVQUN6QyxHQUFHLEdBQUc7QUFBQSxRQUNSLFNBQVMsR0FBUTtBQUNmLGtCQUFRLE1BQU0sQ0FBQztBQUNmLGdCQUFNLFNBQVMsT0FBTztBQUN0QixnQkFBTSxVQUFVLFVBQVUsR0FBRyxXQUFXLENBQUMsRUFBRTtBQUMzQyxnQkFBTSx3QkFBd0IsT0FBTyxPQUFPLElBQUk7QUFDaEQsZ0JBQU0sZ0JBQWdCLE9BQU87QUFDN0IsY0FBSTtBQUFFLGlCQUFLLFVBQVUsUUFBUTtBQUFBLFVBQUcsUUFBUTtBQUFBLFVBQUM7QUFDekMsZUFBSyxXQUFXO0FBQUEsUUFDbEIsVUFBRTtBQUFBLFFBRUY7QUFBQSxNQUNGO0FBQUEsTUFDQSxXQUFXLE1BQU07QUFDZixZQUFJO0FBQUUsZUFBSyxVQUFVLFFBQVE7QUFBQSxRQUFHLFFBQVE7QUFBQSxRQUFDO0FBQ3pDLGFBQUssV0FBVztBQUNoQixjQUFNLE1BQU07QUFDWixhQUFLLFFBQVE7QUFBQSxNQUNmO0FBQUEsTUFDQSxTQUFTLE1BQU0sS0FBSyxVQUFVLE1BQU07QUFBQSxNQUNwQyxVQUFVLE1BQU0sS0FBSyxVQUFVLE9BQU87QUFBQSxJQUN4QyxDQUFDO0FBQ0QsU0FBSyxRQUFRO0FBR2IsVUFBTSxLQUFLO0FBQUEsRUFDYjtBQUFBLEVBRUEsTUFBYyxXQUFXLE1BQWM7QUFDckMsVUFBTSxPQUFPLEtBQUssSUFBSSxVQUFVLG9CQUFvQiw2QkFBWTtBQUNoRSxRQUFJLENBQUMsS0FBTSxPQUFNLElBQUksTUFBTSwyQkFBMkI7QUFDdEQsVUFBTSxTQUFTLEtBQUs7QUFDcEIsVUFBTSxTQUFTLEtBQUssU0FBUyxtQkFBbUIsT0FBTztBQUN2RCxVQUFNLFFBQVEsS0FBSyxTQUFTLGtCQUFrQixPQUFPO0FBQ3JELFVBQU0sVUFBVSxHQUFHLE1BQU0sR0FBRyxJQUFJLEdBQUcsS0FBSztBQUN4QyxRQUFJLEtBQUssU0FBUyxlQUFlLGFBQWEsT0FBTyxrQkFBa0IsR0FBRztBQUN4RSxhQUFPLGlCQUFpQixPQUFPO0FBQUEsSUFDakMsT0FBTztBQUNMLGFBQU8sYUFBYSxTQUFTLE9BQU8sVUFBVSxDQUFDO0FBQUEsSUFDakQ7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iXQp9Cg==
