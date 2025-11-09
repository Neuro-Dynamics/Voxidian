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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9yZWNvcmRlci50cyIsICJzcmMvcG9zdHByb2Nlc3MudHMiLCAic3JjL3RyYW5zY3JpYmUudHMiLCAic3JjL3R5cGVzLnRzIiwgInNyYy91aS9SZWNvcmRpbmdNb2RhbC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQXBwLCBNYXJrZG93blZpZXcsIFBsdWdpbiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEFJVHJhbnNjcmlwdFNldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IEF1ZGlvUmVjb3JkZXIgfSBmcm9tICcuL3JlY29yZGVyJztcbmltcG9ydCB7IHBvc3Rwcm9jZXNzV2l0aE9wZW5BSSB9IGZyb20gJy4vcG9zdHByb2Nlc3MnO1xuaW1wb3J0IHsgdHJhbnNjcmliZVdpdGhHcm9xIH0gZnJvbSAnLi90cmFuc2NyaWJlJztcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIHR5cGUgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIHR5cGUgUHJvbXB0UHJlc2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSZWNvcmRpbmdNb2RhbCB9IGZyb20gJy4vdWkvUmVjb3JkaW5nTW9kYWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBSVRyYW5zY3JpcHRQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MgPSB7IC4uLkRFRkFVTFRfU0VUVElOR1MsIHByb21wdFByZXNldHM6IFsuLi5ERUZBVUxUX1NFVFRJTkdTLnByb21wdFByZXNldHNdIH07XG4gIHByaXZhdGUgcmVjb3JkZXI/OiBBdWRpb1JlY29yZGVyO1xuICBwcml2YXRlIG1vZGFsPzogUmVjb3JkaW5nTW9kYWw7XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuXG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdtaWMnLCAnUmVjb3JkICYgVHJhbnNjcmliZScsICgpID0+IHRoaXMudG9nZ2xlUmVjb3JkaW5nKCkpO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAndm94aWRpYW4tc3RhcnQtc3RvcCcsXG4gICAgICBuYW1lOiAnU3RhcnQvU3RvcCBSZWNvcmRpbmcnLFxuICAgICAgaG90a2V5czogW3sgbW9kaWZpZXJzOiBbJ01vZCcsICdTaGlmdCddLCBrZXk6ICdNJyB9XSxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnRvZ2dsZVJlY29yZGluZygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBBSVRyYW5zY3JpcHRTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzLCAoKSA9PiB0aGlzLnNldHRpbmdzLCBhc3luYyAocGFydGlhbCkgPT4ge1xuICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnNldHRpbmdzLCBwYXJ0aWFsKTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gICAgfSkpO1xuICB9XG5cbiAgb251bmxvYWQoKSB7XG4gICAgdHJ5IHsgdGhpcy5yZWNvcmRlcj8uZGlzY2FyZCgpOyB9IGNhdGNoIHsgfVxuICAgIHRyeSB7IHRoaXMubW9kYWw/LmNsb3NlKCk7IH0gY2F0Y2ggeyB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHRvZ2dsZVJlY29yZGluZygpIHtcbiAgICAvLyBJZiBtb2RhbCBpcyBvcGVuLCBzdG9wIG5vdyAoc2ltdWxhdGUgY2xpY2tpbmcgU3RvcClcbiAgICBpZiAodGhpcy5tb2RhbCkge1xuICAgICAgLy8gbm9vcCBcdTIwMTQgc3RvcHBpbmcgaXMgZHJpdmVuIHZpYSBtb2RhbCBidXR0b24gdG8gcHJlc2VydmUgcHJlc2V0L2FwcGx5IHN0YXRlXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHdlIGhhdmUgYW4gZWRpdG9yIHRvIGluc2VydCBpbnRvIGxhdGVyIChub3Qgc3RyaWN0bHkgcmVxdWlyZWQgYnV0IGhlbHBzIFVYKVxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuICAgIGlmICghdmlldykgcmV0dXJuOyAvLyBNVlA6IHJlcXVpcmUgYWN0aXZlIG1hcmtkb3duIHZpZXdcblxuICAgIC8vIFByZXBhcmUgcmVjb3JkZXIgYW5kIG1vZGFsXG4gICAgdGhpcy5yZWNvcmRlciA9IG5ldyBBdWRpb1JlY29yZGVyKCk7XG4gICAgY29uc3QgcHJlc2V0cyA9IHRoaXMuc2V0dGluZ3MucHJvbXB0UHJlc2V0cy5tYXAocCA9PiAoeyBpZDogcC5pZCwgbmFtZTogcC5uYW1lIH0pKTtcbiAgICBjb25zdCBtb2RhbCA9IG5ldyBSZWNvcmRpbmdNb2RhbCh0aGlzLmFwcCwge1xuICAgICAgcHJlc2V0cyxcbiAgICAgIGRlZmF1bHRQcmVzZXRJZDogdGhpcy5zZXR0aW5ncy5sYXN0VXNlZFByb21wdElkIHx8IHRoaXMuc2V0dGluZ3MuZGVmYXVsdFByb21wdElkLFxuICAgICAgbWF4RHVyYXRpb25TZWM6IHRoaXMuc2V0dGluZ3MubWF4RHVyYXRpb25TZWMsXG4gICAgICBvblN0YXJ0OiBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5yZWNvcmRlciEuc3RhcnQoKTtcbiAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICBtb2RhbC5zZXRQaGFzZSgnZXJyb3InKTtcbiAgICAgICAgICBtb2RhbC5zZXRTdGF0dXMoJ01pY3JvcGhvbmUgcGVybWlzc2lvbiBvciByZWNvcmRlciBlcnJvci4nKTtcbiAgICAgICAgICBtb2RhbC5zZXRBY3Rpb25CdXR0b25zRW5hYmxlZChmYWxzZSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIG1vZGFsLnNldERpc2NhcmRMYWJlbCgnQ2xvc2UnKTtcbiAgICAgICAgICB0aGlzLnJlY29yZGVyPy5kaXNjYXJkKCk7XG4gICAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uU3RvcDogYXN5bmMgKGFwcGx5UG9zdCwgcHJlc2V0SWQpID0+IHtcbiAgICAgICAgbW9kYWwuc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQoZmFsc2UsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIG1vZGFsLnNldFBoYXNlKCd0cmFuc2NyaWJpbmcnKTtcbiAgICAgICAgbW9kYWwuc2V0U3RhdHVzKCdUcmFuc2NyaWJpbmdcdTIwMjYnKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBibG9iID0gYXdhaXQgdGhpcy5yZWNvcmRlciEuc3RvcCgpO1xuICAgICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgY29uc3QgcmF3ID0gYXdhaXQgdHJhbnNjcmliZVdpdGhHcm9xKGJsb2IsIHRoaXMuc2V0dGluZ3MpO1xuICAgICAgICAgIGxldCB0ZXh0ID0gcmF3O1xuICAgICAgICAgIGlmIChhcHBseVBvc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXNldCA9IHRoaXMuc2V0dGluZ3MucHJvbXB0UHJlc2V0cy5maW5kKHAgPT4gcC5pZCA9PT0gcHJlc2V0SWQpIGFzIFByb21wdFByZXNldCB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MubGFzdFVzZWRQcm9tcHRJZCA9IHByZXNldD8uaWQgfHwgcHJlc2V0SWQgfHwgdGhpcy5zZXR0aW5ncy5sYXN0VXNlZFByb21wdElkO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgICAgICAgICAgIG1vZGFsLnNldFBoYXNlKCdwb3N0cHJvY2Vzc2luZycpO1xuICAgICAgICAgICAgbW9kYWwuc2V0U3RhdHVzKCdDbGVhbmluZyB0cmFuc2NyaXB0XHUyMDI2Jyk7XG4gICAgICAgICAgICB0ZXh0ID0gYXdhaXQgcG9zdHByb2Nlc3NXaXRoT3BlbkFJKHJhdywgdGhpcy5zZXR0aW5ncywgcHJlc2V0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXdhaXQgdGhpcy5pbnNlcnRUZXh0KHRleHQpO1xuICAgICAgICAgIG1vZGFsLnNldFBoYXNlKCdkb25lJyk7XG4gICAgICAgICAgbW9kYWwuc2V0U3RhdHVzKCdUcmFuc2NyaXB0IGluc2VydGVkIGludG8gdGhlIG5vdGUuJyk7XG4gICAgICAgICAgbW9kYWwuc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQoZmFsc2UsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBtb2RhbC5zZXREaXNjYXJkTGFiZWwoJ0Nsb3NlJyk7XG4gICAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgICBpZiAodGhpcy5tb2RhbCA9PT0gbW9kYWwpIHRoaXMubW9kYWwgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ2Vycm9yJyk7XG4gICAgICAgICAgbW9kYWwuc2V0U3RhdHVzKGBFcnJvcjogJHtlPy5tZXNzYWdlIHx8IGV9YCk7XG4gICAgICAgICAgbW9kYWwuc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQoZmFsc2UsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBtb2RhbC5zZXREaXNjYXJkTGFiZWwoJ0Nsb3NlJyk7XG4gICAgICAgICAgdHJ5IHsgdGhpcy5yZWNvcmRlcj8uZGlzY2FyZCgpOyB9IGNhdGNoIHsgfVxuICAgICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgLy8ga2VlcCBtb2RhbCBvcGVuIGZvciB1c2VyIHRvIHJlYWQvY2xvc2VcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uRGlzY2FyZDogKCkgPT4ge1xuICAgICAgICB0cnkgeyB0aGlzLnJlY29yZGVyPy5kaXNjYXJkKCk7IH0gY2F0Y2ggeyB9XG4gICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIG1vZGFsLmNsb3NlKCk7XG4gICAgICAgIHRoaXMubW9kYWwgPSB1bmRlZmluZWQ7XG4gICAgICB9LFxuICAgICAgb25QYXVzZTogKCkgPT4gdGhpcy5yZWNvcmRlcj8ucGF1c2UoKSxcbiAgICAgIG9uUmVzdW1lOiAoKSA9PiB0aGlzLnJlY29yZGVyPy5yZXN1bWUoKSxcbiAgICB9KTtcbiAgICB0aGlzLm1vZGFsID0gbW9kYWw7XG5cbiAgICAvLyBNVlAgdXNlcyBtb2RhbCB0byBwcmVzZW50IGFsbCBzdGF0dXMgYW5kIGFuaW1hdGlvbnNcbiAgICBtb2RhbC5vcGVuKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluc2VydFRleHQodGV4dDogc3RyaW5nKSB7XG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgaWYgKCF2aWV3KSB0aHJvdyBuZXcgRXJyb3IoJ05vIGFjdGl2ZSBNYXJrZG93biBlZGl0b3InKTtcbiAgICBjb25zdCBlZGl0b3IgPSB2aWV3LmVkaXRvcjtcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLnNldHRpbmdzLmFkZE5ld2xpbmVCZWZvcmUgPyAnXFxuJyA6ICcnO1xuICAgIGNvbnN0IGFmdGVyID0gdGhpcy5zZXR0aW5ncy5hZGROZXdsaW5lQWZ0ZXIgPyAnXFxuJyA6ICcnO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBgJHtiZWZvcmV9JHt0ZXh0fSR7YWZ0ZXJ9YDtcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5pbnNlcnRNb2RlID09PSAncmVwbGFjZScgJiYgZWRpdG9yLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHtcbiAgICAgIGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKGNvbnRlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKGNvbnRlbnQsIGVkaXRvci5nZXRDdXJzb3IoKSk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBQbHVnaW4sIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IEFJVHJhbnNjcmlwdFNldHRpbmdzLCBQcm9tcHRQcmVzZXQgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGNsYXNzIEFJVHJhbnNjcmlwdFNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogUGx1Z2luLCBwcml2YXRlIGdldFNldHRpbmdzOiAoKSA9PiBBSVRyYW5zY3JpcHRTZXR0aW5ncywgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6IChzOiBQYXJ0aWFsPEFJVHJhbnNjcmlwdFNldHRpbmdzPikgPT4gUHJvbWlzZTx2b2lkPikge1xuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgfVxuXG4gIGRpc3BsYXkoKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ0FJIFRyYW5zY3JpcHQnIH0pO1xuXG4gICAgY29uc3QgcyA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcblxuICAgIC8vIEdST1FcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdHcm9xIFdoaXNwZXInIH0pO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0dyb3EgQVBJIEtleScpXG4gICAgICAuc2V0RGVzYygnUmVxdWlyZWQgdG8gdHJhbnNjcmliZSBhdWRpbyB2aWEgR3JvcSBXaGlzcGVyLicpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdnc2tfLi4uJylcbiAgICAgICAgLnNldFZhbHVlKHMuZ3JvcUFwaUtleSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZ3JvcUFwaUtleTogdi50cmltKCkgfSk7IH0pKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0dyb3EgbW9kZWwnKVxuICAgICAgLnNldERlc2MoJ0RlZmF1bHQ6IHdoaXNwZXItbGFyZ2UtdjMnKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRWYWx1ZShzLmdyb3FNb2RlbClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZ3JvcU1vZGVsOiB2LnRyaW0oKSB8fCAnd2hpc3Blci1sYXJnZS12MycgfSk7IH0pKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0xhbmd1YWdlIChvcHRpb25hbCknKVxuICAgICAgLnNldERlc2MoJ0lTTyBjb2RlIGxpa2UgZW4sIGVzLCBkZS4gTGVhdmUgZW1wdHkgZm9yIGF1dG8uJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0VmFsdWUocy5sYW5ndWFnZSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgbGFuZ3VhZ2U6IHYudHJpbSgpIHx8IHVuZGVmaW5lZCB9KTsgfSkpO1xuXG4gICAgLy8gT3BlbkFJXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnT3BlbkFJIFBvc3Rwcm9jZXNzaW5nIChvcHRpb25hbCknIH0pO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ09wZW5BSSBBUEkgS2V5JylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ3NrLS4uLicpXG4gICAgICAgIC5zZXRWYWx1ZShzLm9wZW5haUFwaUtleSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgb3BlbmFpQXBpS2V5OiB2LnRyaW0oKSB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnT3BlbkFJIG1vZGVsJylcbiAgICAgIC5zZXREZXNjKCdEZWZhdWx0OiBncHQtNG8tbWluaScpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFZhbHVlKHMub3BlbmFpTW9kZWwpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IG9wZW5haU1vZGVsOiB2LnRyaW0oKSB8fCAnZ3B0LTRvLW1pbmknIH0pOyB9KSk7XG5cbiAgICAvLyBQcmVzZXRzXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2g0JywgeyB0ZXh0OiAnUHJvbXB0IHByZXNldHMnIH0pO1xuXG4gICAgY29uc3QgbGlzdEVsID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KCk7XG4gICAgY29uc3QgcmVuZGVyUHJlc2V0cyA9ICgpID0+IHtcbiAgICAgIGxpc3RFbC5lbXB0eSgpO1xuICAgICAgY29uc3Qgc3QgPSB0aGlzLmdldFNldHRpbmdzKCk7XG4gICAgICBzdC5wcm9tcHRQcmVzZXRzLmZvckVhY2goKHApID0+IHtcbiAgICAgICAgY29uc3Qgd3JhcCA9IGxpc3RFbC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1wcmVzZXQnIH0pO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKHAubmFtZSlcbiAgICAgICAgICAuc2V0RGVzYygnU3lzdGVtIHByb21wdCArIHRlbXBlcmF0dXJlJylcbiAgICAgICAgICAuYWRkQnV0dG9uKGIgPT4gYi5zZXRCdXR0b25UZXh0KCdTZXQgRGVmYXVsdCcpLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBkZWZhdWx0UHJvbXB0SWQ6IHAuaWQgfSk7XG4gICAgICAgICAgICByZW5kZXJQcmVzZXRzKCk7XG4gICAgICAgICAgfSkpXG4gICAgICAgICAgLmFkZEJ1dHRvbihiID0+IGIuc2V0QnV0dG9uVGV4dCgnRGVsZXRlJykub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IHN0LnByb21wdFByZXNldHMuZmlsdGVyKHggPT4geC5pZCAhPT0gcC5pZCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IGZpbHRlcmVkIH0pO1xuICAgICAgICAgICAgcmVuZGVyUHJlc2V0cygpO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnTmFtZScpXG4gICAgICAgICAgLmFkZFRleHQodCA9PiB0LnNldFZhbHVlKHAubmFtZSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgIHAubmFtZSA9IHY7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ1N5c3RlbSBwcm9tcHQnKVxuICAgICAgICAgIC5hZGRUZXh0QXJlYSh0ID0+IHQuc2V0VmFsdWUocC5zeXN0ZW0pLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICBwLnN5c3RlbSA9IHY7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ1RlbXBlcmF0dXJlJylcbiAgICAgICAgICAuYWRkVGV4dCh0ID0+IHQuc2V0VmFsdWUoU3RyaW5nKHAudGVtcGVyYXR1cmUpKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKHYpOyBwLnRlbXBlcmF0dXJlID0gaXNGaW5pdGUobnVtKSA/IG51bSA6IDAuMjsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZSgnTW9kZWwgb3ZlcnJpZGUgKG9wdGlvbmFsKScpXG4gICAgICAgICAgLmFkZFRleHQodCA9PiB0LnNldFBsYWNlaG9sZGVyKCdlLmcuLCBncHQtNG8tbWluaScpLnNldFZhbHVlKHAubW9kZWwgfHwgJycpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICBwLm1vZGVsID0gdi50cmltKCkgfHwgdW5kZWZpbmVkOyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IHN0LnByb21wdFByZXNldHMgfSk7XG4gICAgICAgICAgfSkpO1xuICAgICAgICBpZiAoc3QuZGVmYXVsdFByb21wdElkID09PSBwLmlkKSB3cmFwLmNyZWF0ZURpdih7IHRleHQ6ICdEZWZhdWx0IHByZXNldCcsIGNsczogJ2FpLXByZXNldC1kZWZhdWx0JyB9KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXJQcmVzZXRzKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdBZGQgcHJlc2V0JylcbiAgICAgIC5hZGRCdXR0b24oYiA9PiBiLnNldEJ1dHRvblRleHQoJ0FkZCcpLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdCA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcbiAgICAgICAgY29uc3QgaWQgPSBgcHJlc2V0LSR7RGF0ZS5ub3coKX1gO1xuICAgICAgICBjb25zdCBwcmVzZXQ6IFByb21wdFByZXNldCA9IHsgaWQsIG5hbWU6ICdOZXcgUHJlc2V0Jywgc3lzdGVtOiAnRWRpdCBtZVx1MjAyNicsIHRlbXBlcmF0dXJlOiAwLjIgfTtcbiAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBbLi4uc3QucHJvbXB0UHJlc2V0cywgcHJlc2V0XSB9KTtcbiAgICAgICAgcmVuZGVyUHJlc2V0cygpO1xuICAgICAgfSkpO1xuXG4gICAgLy8gUmVjb3JkaW5nIGJlaGF2aW9yXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnUmVjb3JkaW5nICYgSW5zZXJ0aW9uJyB9KTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdTaG93IHJlY29yZGluZyBtb2RhbCcpXG4gICAgICAuYWRkVG9nZ2xlKHQgPT4gdC5zZXRWYWx1ZShzLnNob3dNb2RhbFdoaWxlUmVjb3JkaW5nKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHNob3dNb2RhbFdoaWxlUmVjb3JkaW5nOiB2IH0pO1xuICAgICAgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ01heCBkdXJhdGlvbiAoc2Vjb25kcyknKVxuICAgICAgLmFkZFRleHQodCA9PiB0LnNldFZhbHVlKFN0cmluZyhzLm1heER1cmF0aW9uU2VjKSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgY29uc3QgbiA9IE51bWJlcih2KTsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBtYXhEdXJhdGlvblNlYzogaXNGaW5pdGUobikgJiYgbiA+IDAgPyBNYXRoLmZsb29yKG4pIDogOTAwIH0pO1xuICAgICAgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0luc2VydCBtb2RlJylcbiAgICAgIC5zZXREZXNjKCdJbnNlcnQgYXQgY3Vyc29yIG9yIHJlcGxhY2Ugc2VsZWN0aW9uJylcbiAgICAgIC5hZGREcm9wZG93bihkID0+IGRcbiAgICAgICAgLmFkZE9wdGlvbignaW5zZXJ0JywgJ0luc2VydCBhdCBjdXJzb3InKVxuICAgICAgICAuYWRkT3B0aW9uKCdyZXBsYWNlJywgJ1JlcGxhY2Ugc2VsZWN0aW9uJylcbiAgICAgICAgLnNldFZhbHVlKHMuaW5zZXJ0TW9kZSlcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgaW5zZXJ0TW9kZTogdiBhcyBhbnkgfSk7IH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdBZGQgbmV3bGluZSBiZWZvcmUnKVxuICAgICAgLmFkZFRvZ2dsZSh0ID0+IHQuc2V0VmFsdWUocy5hZGROZXdsaW5lQmVmb3JlKS5vbkNoYW5nZShhc3luYyAodikgPT4geyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IGFkZE5ld2xpbmVCZWZvcmU6IHYgfSk7IH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdBZGQgbmV3bGluZSBhZnRlcicpXG4gICAgICAuYWRkVG9nZ2xlKHQgPT4gdC5zZXRWYWx1ZShzLmFkZE5ld2xpbmVBZnRlcikub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBhZGROZXdsaW5lQWZ0ZXI6IHYgfSk7IH0pKTtcbiAgfVxufVxuIiwgImV4cG9ydCBjbGFzcyBBdWRpb1JlY29yZGVyIHtcbiAgcHJpdmF0ZSBtZWRpYVJlY29yZGVyPzogTWVkaWFSZWNvcmRlcjtcbiAgcHJpdmF0ZSBjaHVua3M6IEJsb2JQYXJ0W10gPSBbXTtcbiAgcHJpdmF0ZSBzdHJlYW0/OiBNZWRpYVN0cmVhbTtcbiAgcHJpdmF0ZSBzdGFydGVkQXQgPSAwO1xuICBwcml2YXRlIHRpbWVyPzogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgb25UaWNrPzogKGVsYXBzZWRNczogbnVtYmVyKSA9PiB2b2lkKSB7fVxuXG4gIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLm1lZGlhUmVjb3JkZXIgJiYgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXRlID09PSAncmVjb3JkaW5nJykgcmV0dXJuO1xuICAgIHRoaXMuY2h1bmtzID0gW107XG4gICAgdGhpcy5zdHJlYW0gPSBhd2FpdCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSh7IGF1ZGlvOiB0cnVlIH0pO1xuICAgIGNvbnN0IG1pbWVDYW5kaWRhdGVzID0gW1xuICAgICAgJ2F1ZGlvL3dlYm07Y29kZWNzPW9wdXMnLFxuICAgICAgJ2F1ZGlvL3dlYm0nLFxuICAgICAgJ2F1ZGlvL29nZztjb2RlY3M9b3B1cycsXG4gICAgICAnJ1xuICAgIF07XG4gICAgbGV0IG1pbWVUeXBlID0gJyc7XG4gICAgZm9yIChjb25zdCBjYW5kIG9mIG1pbWVDYW5kaWRhdGVzKSB7XG4gICAgICBpZiAoIWNhbmQgfHwgKHdpbmRvdyBhcyBhbnkpLk1lZGlhUmVjb3JkZXI/LmlzVHlwZVN1cHBvcnRlZD8uKGNhbmQpKSB7IG1pbWVUeXBlID0gY2FuZDsgYnJlYWs7IH1cbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICB0aGlzLm1lZGlhUmVjb3JkZXIgPSBuZXcgTWVkaWFSZWNvcmRlcih0aGlzLnN0cmVhbSwgbWltZVR5cGUgPyB7IG1pbWVUeXBlIH0gOiB1bmRlZmluZWQpO1xuICAgIHRoaXMubWVkaWFSZWNvcmRlci5vbmRhdGFhdmFpbGFibGUgPSAoZTogQmxvYkV2ZW50KSA9PiB7IGlmIChlLmRhdGE/LnNpemUpIHRoaXMuY2h1bmtzLnB1c2goZS5kYXRhKTsgfTtcbiAgICB0aGlzLm1lZGlhUmVjb3JkZXIuc3RhcnQoMjUwKTsgLy8gc21hbGwgY2h1bmtzXG4gICAgdGhpcy5zdGFydGVkQXQgPSBEYXRlLm5vdygpO1xuICAgIGlmICh0aGlzLm9uVGljaykgdGhpcy50aW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB0aGlzLm9uVGljayEoRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnRlZEF0KSwgMjAwKTtcbiAgfVxuXG4gIHBhdXNlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1lZGlhUmVjb3JkZXIgJiYgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXRlID09PSAncmVjb3JkaW5nJyAmJiB0eXBlb2YgdGhpcy5tZWRpYVJlY29yZGVyLnBhdXNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLm1lZGlhUmVjb3JkZXIucGF1c2UoKTtcbiAgICB9XG4gIH1cblxuICByZXN1bWUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVkaWFSZWNvcmRlciAmJiB0aGlzLm1lZGlhUmVjb3JkZXIuc3RhdGUgPT09ICdwYXVzZWQnICYmIHR5cGVvZiB0aGlzLm1lZGlhUmVjb3JkZXIucmVzdW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLm1lZGlhUmVjb3JkZXIucmVzdW1lKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgc3RvcCgpOiBQcm9taXNlPEJsb2I+IHtcbiAgICBjb25zdCByZWMgPSB0aGlzLm1lZGlhUmVjb3JkZXI7XG4gICAgaWYgKCFyZWMpIHRocm93IG5ldyBFcnJvcignUmVjb3JkZXIgbm90IHN0YXJ0ZWQnKTtcbiAgICBjb25zdCBzdG9wUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICByZWMub25zdG9wID0gKCkgPT4gcmVzb2x2ZSgpO1xuICAgIH0pO1xuICAgIGlmIChyZWMuc3RhdGUgIT09ICdpbmFjdGl2ZScpIHJlYy5zdG9wKCk7XG4gICAgYXdhaXQgc3RvcFByb21pc2U7XG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKHRoaXMuY2h1bmtzLCB7IHR5cGU6IHRoaXMuY2h1bmtzLmxlbmd0aCA/ICh0aGlzLmNodW5rc1swXSBhcyBhbnkpLnR5cGUgfHwgJ2F1ZGlvL3dlYm0nIDogJ2F1ZGlvL3dlYm0nIH0pO1xuICAgIHRoaXMuY2xlYW51cCgpO1xuICAgIHJldHVybiBibG9iO1xuICB9XG5cbiAgZGlzY2FyZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZWRpYVJlY29yZGVyICYmIHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSAhPT0gJ2luYWN0aXZlJykgdGhpcy5tZWRpYVJlY29yZGVyLnN0b3AoKTtcbiAgICB0aGlzLmNsZWFudXAoKTtcbiAgfVxuXG4gIHByaXZhdGUgY2xlYW51cCgpIHtcbiAgICBpZiAodGhpcy50aW1lcikgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7XG4gICAgdGhpcy50aW1lciA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLm1lZGlhUmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zdGFydGVkQXQgPSAwO1xuICAgIGlmICh0aGlzLnN0cmVhbSkge1xuICAgICAgdGhpcy5zdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaCh0ID0+IHQuc3RvcCgpKTtcbiAgICAgIHRoaXMuc3RyZWFtID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB0aGlzLmNodW5rcyA9IFtdO1xuICB9XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBBSVRyYW5zY3JpcHRTZXR0aW5ncywgUHJvbXB0UHJlc2V0IH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwb3N0cHJvY2Vzc1dpdGhPcGVuQUkocmF3OiBzdHJpbmcsIHNldHRpbmdzOiBBSVRyYW5zY3JpcHRTZXR0aW5ncywgcHJlc2V0PzogUHJvbXB0UHJlc2V0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgaWYgKCFzZXR0aW5ncy5vcGVuYWlBcGlLZXkpIHJldHVybiByYXc7IC8vIHNpbGVudGx5IHNraXAgaWYgbWlzc2luZ1xuICBjb25zdCBtb2RlbCA9IHByZXNldD8ubW9kZWwgfHwgc2V0dGluZ3Mub3BlbmFpTW9kZWwgfHwgJ2dwdC00by1taW5pJztcbiAgY29uc3QgdGVtcGVyYXR1cmUgPSBjbGFtcCgocHJlc2V0Py50ZW1wZXJhdHVyZSA/PyAwLjIpLCAwLCAxKTtcbiAgY29uc3Qgc3lzdGVtID0gcHJlc2V0Py5zeXN0ZW0gfHwgJ1lvdSBjbGVhbiB1cCBzcG9rZW4gdGV4dC4gRml4IGNhcGl0YWxpemF0aW9uIGFuZCBwdW5jdHVhdGlvbiwgcmVtb3ZlIGZpbGxlciB3b3JkcywgcHJlc2VydmUgbWVhbmluZy4gRG8gbm90IGFkZCBjb250ZW50Lic7XG5cbiAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7c2V0dGluZ3Mub3BlbmFpQXBpS2V5fWAsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgbW9kZWwsXG4gICAgICB0ZW1wZXJhdHVyZSxcbiAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgIHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IHN5c3RlbSB9LFxuICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogcmF3IH0sXG4gICAgICBdLFxuICAgIH0pLFxuICB9KTtcbiAgaWYgKCFyZXNwLm9rKSB7XG4gICAgLy8gSWYgT3BlbkFJIGZhaWxzLCByZXR1cm4gcmF3IHJhdGhlciB0aGFuIGJyZWFraW5nIGluc2VydGlvblxuICAgIHRyeSB7IGNvbnNvbGUud2FybignT3BlbkFJIHBvc3Rwcm9jZXNzIGZhaWxlZCcsIHJlc3Auc3RhdHVzLCBhd2FpdCByZXNwLnRleHQoKSk7IH0gY2F0Y2gge31cbiAgICByZXR1cm4gcmF3O1xuICB9XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgY29uc3QgY2xlYW5lZCA9IGRhdGE/LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudDtcbiAgcmV0dXJuIHR5cGVvZiBjbGVhbmVkID09PSAnc3RyaW5nJyAmJiBjbGVhbmVkLnRyaW0oKSA/IGNsZWFuZWQgOiByYXc7XG59XG5cbmZ1bmN0aW9uIGNsYW1wKG46IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7IHJldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKG1heCwgbikpOyB9XG5cbiIsICJpbXBvcnQgdHlwZSB7IEFJVHJhbnNjcmlwdFNldHRpbmdzIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0cmFuc2NyaWJlV2l0aEdyb3EoYmxvYjogQmxvYiwgc2V0dGluZ3M6IEFJVHJhbnNjcmlwdFNldHRpbmdzKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgaWYgKCFzZXR0aW5ncy5ncm9xQXBpS2V5KSB0aHJvdyBuZXcgRXJyb3IoJ0dyb3EgQVBJIGtleSBpcyBtaXNzaW5nIGluIHNldHRpbmdzLicpO1xuICBjb25zdCBmZCA9IG5ldyBGb3JtRGF0YSgpO1xuICBmZC5hcHBlbmQoJ2ZpbGUnLCBuZXcgRmlsZShbYmxvYl0sICdhdWRpby53ZWJtJywgeyB0eXBlOiBibG9iLnR5cGUgfHwgJ2F1ZGlvL3dlYm0nIH0pKTtcbiAgZmQuYXBwZW5kKCdtb2RlbCcsIHNldHRpbmdzLmdyb3FNb2RlbCB8fCAnd2hpc3Blci1sYXJnZS12MycpO1xuICBpZiAoc2V0dGluZ3MubGFuZ3VhZ2UpIGZkLmFwcGVuZCgnbGFuZ3VhZ2UnLCBzZXR0aW5ncy5sYW5ndWFnZSk7XG5cbiAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5ncm9xLmNvbS9vcGVuYWkvdjEvYXVkaW8vdHJhbnNjcmlwdGlvbnMnLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtzZXR0aW5ncy5ncm9xQXBpS2V5fWAgfSxcbiAgICBib2R5OiBmZCxcbiAgfSk7XG4gIGlmICghcmVzcC5vaykge1xuICAgIGNvbnN0IHRleHQgPSBhd2FpdCBzYWZlVGV4dChyZXNwKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEdyb3EgdHJhbnNjcmlwdGlvbiBmYWlsZWQgKCR7cmVzcC5zdGF0dXN9KTogJHt0ZXh0fWApO1xuICB9XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgaWYgKHR5cGVvZiBkYXRhPy50ZXh0ICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdHcm9xIHJlc3BvbnNlIG1pc3NpbmcgdGV4dCcpO1xuICByZXR1cm4gZGF0YS50ZXh0IGFzIHN0cmluZztcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2FmZVRleHQocmVzcDogUmVzcG9uc2UpIHtcbiAgdHJ5IHsgcmV0dXJuIGF3YWl0IHJlc3AudGV4dCgpOyB9IGNhdGNoIHsgcmV0dXJuICc8bm8tYm9keT4nOyB9XG59XG5cbiIsICJleHBvcnQgdHlwZSBJbnNlcnRNb2RlID0gJ2luc2VydCcgfCAncmVwbGFjZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvbXB0UHJlc2V0IHtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBzeXN0ZW06IHN0cmluZztcbiAgdGVtcGVyYXR1cmU6IG51bWJlcjtcbiAgbW9kZWw/OiBzdHJpbmc7IC8vIG9wdGlvbmFsIE9wZW5BSSBtb2RlbCBvdmVycmlkZVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFJVHJhbnNjcmlwdFNldHRpbmdzIHtcbiAgZ3JvcUFwaUtleTogc3RyaW5nO1xuICBncm9xTW9kZWw6IHN0cmluZzsgLy8gZS5nLiwgJ3doaXNwZXItbGFyZ2UtdjMnXG4gIGxhbmd1YWdlPzogc3RyaW5nOyAvLyBJU08gY29kZSwgb3B0aW9uYWxcblxuICBvcGVuYWlBcGlLZXk/OiBzdHJpbmc7XG4gIG9wZW5haU1vZGVsOiBzdHJpbmc7IC8vIGUuZy4sICdncHQtNG8tbWluaSdcblxuICBwcm9tcHRQcmVzZXRzOiBQcm9tcHRQcmVzZXRbXTtcbiAgZGVmYXVsdFByb21wdElkPzogc3RyaW5nO1xuICBsYXN0VXNlZFByb21wdElkPzogc3RyaW5nO1xuXG4gIHNob3dNb2RhbFdoaWxlUmVjb3JkaW5nOiBib29sZWFuO1xuICBtYXhEdXJhdGlvblNlYzogbnVtYmVyO1xuICBpbnNlcnRNb2RlOiBJbnNlcnRNb2RlO1xuICBhZGROZXdsaW5lQmVmb3JlOiBib29sZWFuO1xuICBhZGROZXdsaW5lQWZ0ZXI6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BSRVNFVDogUHJvbXB0UHJlc2V0ID0ge1xuICBpZDogJ3BvbGlzaGVkJyxcbiAgbmFtZTogJ1BvbGlzaGVkJyxcbiAgc3lzdGVtOlxuICAgICdZb3UgY2xlYW4gdXAgc3Bva2VuIHRleHQuIEZpeCBjYXBpdGFsaXphdGlvbiBhbmQgcHVuY3R1YXRpb24sIHJlbW92ZSBmaWxsZXIgd29yZHMsIHByZXNlcnZlIG1lYW5pbmcuIERvIG5vdCBhZGQgY29udGVudC4nLFxuICB0ZW1wZXJhdHVyZTogMC4yLFxufTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IEFJVHJhbnNjcmlwdFNldHRpbmdzID0ge1xuICBncm9xQXBpS2V5OiAnJyxcbiAgZ3JvcU1vZGVsOiAnd2hpc3Blci1sYXJnZS12MycsXG4gIGxhbmd1YWdlOiB1bmRlZmluZWQsXG5cbiAgb3BlbmFpQXBpS2V5OiAnJyxcbiAgb3BlbmFpTW9kZWw6ICdncHQtNG8tbWluaScsXG5cbiAgcHJvbXB0UHJlc2V0czogW0RFRkFVTFRfUFJFU0VUXSxcbiAgZGVmYXVsdFByb21wdElkOiAncG9saXNoZWQnLFxuICBsYXN0VXNlZFByb21wdElkOiAncG9saXNoZWQnLFxuXG4gIHNob3dNb2RhbFdoaWxlUmVjb3JkaW5nOiB0cnVlLFxuICBtYXhEdXJhdGlvblNlYzogOTAwLFxuICBpbnNlcnRNb2RlOiAnaW5zZXJ0JyxcbiAgYWRkTmV3bGluZUJlZm9yZTogZmFsc2UsXG4gIGFkZE5ld2xpbmVBZnRlcjogdHJ1ZSxcbn07XG4iLCAiaW1wb3J0IHsgQXBwLCBNb2RhbCwgU2V0dGluZywgRHJvcGRvd25Db21wb25lbnQgfSBmcm9tICdvYnNpZGlhbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlY29yZGluZ01vZGFsT3B0aW9ucyB7XHJcbiAgcHJlc2V0czogeyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfVtdO1xyXG4gIGRlZmF1bHRQcmVzZXRJZD86IHN0cmluZztcclxuICBtYXhEdXJhdGlvblNlYzogbnVtYmVyO1xyXG4gIG9uU3RhcnQ/OiAoKSA9PiB2b2lkO1xyXG4gIG9uU3RvcDogKGFwcGx5UG9zdDogYm9vbGVhbiwgcHJlc2V0SWQ/OiBzdHJpbmcpID0+IHZvaWQ7XHJcbiAgb25EaXNjYXJkOiAoKSA9PiB2b2lkO1xyXG4gIG9uUGF1c2U/OiAoKSA9PiB2b2lkO1xyXG4gIG9uUmVzdW1lPzogKCkgPT4gdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFJlY29yZGluZ01vZGFsIGV4dGVuZHMgTW9kYWwge1xyXG4gIHByaXZhdGUgcm9vdEVsPzogSFRNTERpdkVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBlbGFwc2VkRWw/OiBIVE1MRWxlbWVudDtcclxuICBwcml2YXRlIHRpbWVyPzogbnVtYmVyO1xyXG4gIHByaXZhdGUgc3RhcnRlZEF0ID0gMDtcclxuICBwcml2YXRlIHByZXNldERyb3Bkb3duPzogRHJvcGRvd25Db21wb25lbnQ7XHJcbiAgcHJpdmF0ZSBwYXVzZUJ0bkVsPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSB0cmFuc2NyaWJlQnRuRWw/OiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBwcml2YXRlIHBvc3Rwcm9jZXNzQnRuRWw/OiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBwcml2YXRlIHN0YXR1c1RleHRFbD86IEhUTUxFbGVtZW50O1xyXG4gIHByaXZhdGUgZGlzY2FyZEJ0bkVsPzogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBpc1BhdXNlZCA9IGZhbHNlO1xyXG4gIHByaXZhdGUgcGF1c2VTdGFydGVkQXQgPSAwO1xyXG4gIHByaXZhdGUgYWNjdW11bGF0ZWRQYXVzZU1zID0gMDtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgb3B0czogUmVjb3JkaW5nTW9kYWxPcHRpb25zKSB7XHJcbiAgICBzdXBlcihhcHApO1xyXG4gIH1cclxuXHJcbiAgb25PcGVuKCk6IHZvaWQge1xyXG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XHJcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcclxuXHJcbiAgICB0aGlzLm1vZGFsRWwuYWRkQ2xhc3MoJ3ZveGlkaWFuLW1vZGFsJyk7XHJcblxyXG4gICAgdGhpcy5yb290RWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiAndm94aWRpYW4tcm9vdCcgfSk7XHJcbiAgICB0aGlzLnJvb3RFbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtcGhhc2UnLCAncmVjb3JkaW5nJyk7XHJcblxyXG4gICAgY29uc3QgaGVhZGVyID0gdGhpcy5yb290RWwuY3JlYXRlRGl2KHsgY2xzOiAndm94aWRpYW4taGVhZGVyJyB9KTtcclxuICAgIGhlYWRlci5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdWb3hpZGlhbicgfSk7XHJcbiAgICBjb25zdCBoZWFkZXJSaWdodCA9IGhlYWRlci5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1oZWFkZXItcmlnaHQnIH0pO1xyXG4gICAgaGVhZGVyUmlnaHQuY3JlYXRlRGl2KHsgY2xzOiAnYWktcmVjLWluZGljYXRvcicsIGF0dHI6IHsgJ2FyaWEtbGFiZWwnOiAnUmVjb3JkaW5nIGluZGljYXRvcicgfSB9KTtcclxuICAgIHRoaXMuZWxhcHNlZEVsID0gaGVhZGVyUmlnaHQuY3JlYXRlRGl2KHsgdGV4dDogJzAwOjAwJywgY2xzOiAndm94aWRpYW4tdGltZXInIH0pO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsID0gaGVhZGVyUmlnaHQuY3JlYXRlRWwoJ2J1dHRvbicsIHtcclxuICAgICAgdGV4dDogJ1x1Mjc1QVx1Mjc1QScsXHJcbiAgICAgIHR5cGU6ICdidXR0b24nLFxyXG4gICAgICBjbHM6ICd2b3hpZGlhbi1wYXVzZScsXHJcbiAgICAgIGF0dHI6IHsgJ2FyaWEtbGFiZWwnOiAnUGF1c2UgcmVjb3JkaW5nJywgJ2FyaWEtcHJlc3NlZCc6ICdmYWxzZScgfSxcclxuICAgIH0pO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy50b2dnbGVQYXVzZSgpKTtcclxuICAgIHRoaXMucmVzZXRQYXVzZVN0YXRlKCk7XHJcblxyXG4gICAgY29uc3QgYm9keSA9IHRoaXMucm9vdEVsLmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLWJvZHknIH0pO1xyXG5cclxuICAgIC8vIFByZXNldCBzZWxlY3Rpb25cclxuICAgIG5ldyBTZXR0aW5nKGJvZHkpXHJcbiAgICAgIC5zZXROYW1lKCdQb3N0cHJvY2Vzc2luZyBwcmVzZXQnKVxyXG4gICAgICAuYWRkRHJvcGRvd24oZCA9PiB7XHJcbiAgICAgICAgdGhpcy5wcmVzZXREcm9wZG93biA9IGQ7XHJcbiAgICAgICAgZm9yIChjb25zdCBwIG9mIHRoaXMub3B0cy5wcmVzZXRzKSBkLmFkZE9wdGlvbihwLmlkLCBwLm5hbWUpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdHMuZGVmYXVsdFByZXNldElkKSBkLnNldFZhbHVlKHRoaXMub3B0cy5kZWZhdWx0UHJlc2V0SWQpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICBjb25zdCBidG5zID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1idXR0b25zJyB9KTtcclxuICAgIHRoaXMudHJhbnNjcmliZUJ0bkVsID0gYnRucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnVHJhbnNjcmliZScsIHR5cGU6ICdidXR0b24nIH0pO1xyXG4gICAgdGhpcy5wb3N0cHJvY2Vzc0J0bkVsID0gYnRucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnUG9zdFByb2Nlc3MnLCB0eXBlOiAnYnV0dG9uJyB9KTtcclxuICAgIHRoaXMuZGlzY2FyZEJ0bkVsID0gYnRucy5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnRGlzY2FyZCcsIHR5cGU6ICdidXR0b24nIH0pO1xyXG4gICAgdGhpcy50cmFuc2NyaWJlQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnRyaWdnZXJTdG9wKGZhbHNlKSk7XHJcbiAgICB0aGlzLnBvc3Rwcm9jZXNzQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnRyaWdnZXJTdG9wKHRydWUpKTtcclxuICAgIHRoaXMuZGlzY2FyZEJ0bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5vcHRzLm9uRGlzY2FyZCgpKTtcclxuXHJcbiAgICBjb25zdCBzdGF0dXNCYXIgPSB0aGlzLnJvb3RFbC5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1zdGF0dXNiYXInIH0pO1xyXG4gICAgY29uc3Qgc3RhdHVzV3JhcCA9IHN0YXR1c0Jhci5jcmVhdGVEaXYoeyBjbHM6ICdhaS1zdGF0dXMtd3JhcCcgfSk7XHJcbiAgICBzdGF0dXNXcmFwLmNyZWF0ZURpdih7IGNsczogJ2FpLXNwaW5uZXInLCBhdHRyOiB7ICdhcmlhLWxhYmVsJzogJ1dvcmtpbmdcdTIwMjYnIH0gfSk7XHJcbiAgICB0aGlzLnN0YXR1c1RleHRFbCA9IHN0YXR1c1dyYXAuY3JlYXRlRGl2KHsgY2xzOiAnYWktc3RhdHVzLXRleHQnLCB0ZXh0OiAnTGlzdGVuaW5nXHUyMDI2JyB9KTtcclxuXHJcbiAgICB0aGlzLm1vZGFsRWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHRoaXMub3B0cy5vbkRpc2NhcmQoKTtcclxuICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHRoaXMudHJpZ2dlclN0b3AoZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTdGFydCB0aW1lclxyXG4gICAgdGhpcy5zdGFydGVkQXQgPSBEYXRlLm5vdygpO1xyXG4gICAgdGhpcy50aW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB0aGlzLnRpY2soKSwgMjAwKTtcclxuICAgIHRoaXMub3B0cy5vblN0YXJ0Py4oKTtcclxuICB9XHJcblxyXG4gIG9uQ2xvc2UoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy50aW1lcikgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7XHJcbiAgICB0aGlzLnRpbWVyID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdGljaygpOiB2b2lkIHtcclxuICAgIGNvbnN0IGVsYXBzZWRNcyA9IHRoaXMuZ2V0RWxhcHNlZE1zKCk7XHJcbiAgICBjb25zdCBzZWMgPSBNYXRoLmZsb29yKGVsYXBzZWRNcyAvIDEwMDApO1xyXG4gICAgY29uc3QgbW0gPSBNYXRoLmZsb29yKHNlYyAvIDYwKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XHJcbiAgICBjb25zdCBzcyA9IChzZWMgJSA2MCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xyXG4gICAgaWYgKHRoaXMuZWxhcHNlZEVsKSB0aGlzLmVsYXBzZWRFbC50ZXh0Q29udGVudCA9IGAke21tfToke3NzfWA7XHJcbiAgICBpZiAodGhpcy5vcHRzLm1heER1cmF0aW9uU2VjID4gMCAmJiAhdGhpcy5pc1BhdXNlZCAmJiBzZWMgPj0gdGhpcy5vcHRzLm1heER1cmF0aW9uU2VjKSB7XHJcbiAgICAgIHRoaXMudHJpZ2dlclN0b3AoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRFbGFwc2VkTXMoKTogbnVtYmVyIHtcclxuICAgIGlmICghdGhpcy5zdGFydGVkQXQpIHJldHVybiAwO1xyXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5zdGFydGVkQXQgLSB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcztcclxuICAgIGlmICh0aGlzLmlzUGF1c2VkICYmIHRoaXMucGF1c2VTdGFydGVkQXQpIHtcclxuICAgICAgZWxhcHNlZCAtPSBub3cgLSB0aGlzLnBhdXNlU3RhcnRlZEF0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIGVsYXBzZWQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0cmlnZ2VyU3RvcChhcHBseVBvc3Q6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuZmluYWxpemVQYXVzZVN0YXRlKCk7XHJcbiAgICBjb25zdCBwcmVzZXRJZCA9IHRoaXMucHJlc2V0RHJvcGRvd24/LmdldFZhbHVlKCk7XHJcbiAgICB0aGlzLm9wdHMub25TdG9wKGFwcGx5UG9zdCwgcHJlc2V0SWQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0b2dnbGVQYXVzZSgpIHtcclxuICAgIGlmICh0aGlzLmlzUGF1c2VkKSB7XHJcbiAgICAgIHRoaXMucmVzdW1lUmVjb3JkaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnBhdXNlUmVjb3JkaW5nKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBhdXNlUmVjb3JkaW5nKCkge1xyXG4gICAgaWYgKHRoaXMuaXNQYXVzZWQpIHJldHVybjtcclxuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5wYXVzZVN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XHJcbiAgICB0aGlzLnVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKTtcclxuICAgIHRoaXMub3B0cy5vblBhdXNlPy4oKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzdW1lUmVjb3JkaW5nKCkge1xyXG4gICAgaWYgKCF0aGlzLmlzUGF1c2VkKSByZXR1cm47XHJcbiAgICBpZiAodGhpcy5wYXVzZVN0YXJ0ZWRBdCkgdGhpcy5hY2N1bXVsYXRlZFBhdXNlTXMgKz0gRGF0ZS5ub3coKSAtIHRoaXMucGF1c2VTdGFydGVkQXQ7XHJcbiAgICB0aGlzLnBhdXNlU3RhcnRlZEF0ID0gMDtcclxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMudXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpO1xyXG4gICAgdGhpcy5vcHRzLm9uUmVzdW1lPy4oKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZmluYWxpemVQYXVzZVN0YXRlKCkge1xyXG4gICAgaWYgKHRoaXMuaXNQYXVzZWQgJiYgdGhpcy5wYXVzZVN0YXJ0ZWRBdCkge1xyXG4gICAgICB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcyArPSBEYXRlLm5vdygpIC0gdGhpcy5wYXVzZVN0YXJ0ZWRBdDtcclxuICAgIH1cclxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSAwO1xyXG4gICAgdGhpcy51cGRhdGVQYXVzZUJ1dHRvbkxhYmVsKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0UGF1c2VTdGF0ZSgpIHtcclxuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSAwO1xyXG4gICAgdGhpcy5hY2N1bXVsYXRlZFBhdXNlTXMgPSAwO1xyXG4gICAgdGhpcy51cGRhdGVQYXVzZUJ1dHRvbkxhYmVsKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKSB7XHJcbiAgICBpZiAoIXRoaXMucGF1c2VCdG5FbCkgcmV0dXJuO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLmNsYXNzTGlzdC50b2dnbGUoJ2lzLXBhdXNlZCcsIHRoaXMuaXNQYXVzZWQpO1xyXG4gICAgdGhpcy5wYXVzZUJ0bkVsLnRleHRDb250ZW50ID0gdGhpcy5pc1BhdXNlZCA/ICdcdTI1QjYnIDogJ1x1Mjc1QVx1Mjc1QSc7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCB0aGlzLmlzUGF1c2VkID8gJ3RydWUnIDogJ2ZhbHNlJyk7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgdGhpcy5pc1BhdXNlZCA/ICdSZXN1bWUgcmVjb3JkaW5nJyA6ICdQYXVzZSByZWNvcmRpbmcnKTtcclxuICB9XHJcblxyXG4gIC8vIFB1YmxpYyBVSSBoZWxwZXJzXHJcbiAgc2V0UGhhc2UocGhhc2U6ICdyZWNvcmRpbmcnIHwgJ3RyYW5zY3JpYmluZycgfCAncG9zdHByb2Nlc3NpbmcnIHwgJ2RvbmUnIHwgJ2Vycm9yJykge1xyXG4gICAgdGhpcy5yb290RWw/LnNldEF0dHJpYnV0ZSgnZGF0YS1waGFzZScsIHBoYXNlKTtcclxuICAgIGlmIChwaGFzZSAhPT0gJ3JlY29yZGluZycpIHtcclxuICAgICAgdGhpcy5maW5hbGl6ZVBhdXNlU3RhdGUoKTtcclxuICAgICAgaWYgKHRoaXMudGltZXIpIHsgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7IHRoaXMudGltZXIgPSB1bmRlZmluZWQ7IH1cclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBhdXNlQnRuRWwpIHRoaXMucGF1c2VCdG5FbC5kaXNhYmxlZCA9IHBoYXNlICE9PSAncmVjb3JkaW5nJztcclxuICB9XHJcblxyXG4gIHNldFN0YXR1cyh0ZXh0OiBzdHJpbmcpIHtcclxuICAgIGlmICh0aGlzLnN0YXR1c1RleHRFbCkgdGhpcy5zdGF0dXNUZXh0RWwudGV4dENvbnRlbnQgPSB0ZXh0O1xyXG4gIH1cclxuXHJcbiAgc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQodHJhbnNjcmliZUVuYWJsZWQ6IGJvb2xlYW4sIHBvc3Rwcm9jZXNzRW5hYmxlZDogYm9vbGVhbiwgZGlzY2FyZEVuYWJsZWQ6IGJvb2xlYW4pIHtcclxuICAgIGlmICh0aGlzLnRyYW5zY3JpYmVCdG5FbCkgdGhpcy50cmFuc2NyaWJlQnRuRWwuZGlzYWJsZWQgPSAhdHJhbnNjcmliZUVuYWJsZWQ7XHJcbiAgICBpZiAodGhpcy5wb3N0cHJvY2Vzc0J0bkVsKSB0aGlzLnBvc3Rwcm9jZXNzQnRuRWwuZGlzYWJsZWQgPSAhcG9zdHByb2Nlc3NFbmFibGVkO1xyXG4gICAgaWYgKHRoaXMuZGlzY2FyZEJ0bkVsKSB0aGlzLmRpc2NhcmRCdG5FbC5kaXNhYmxlZCA9ICFkaXNjYXJkRW5hYmxlZDtcclxuICB9XHJcblxyXG4gIHNldERpc2NhcmRMYWJlbChsYWJlbDogc3RyaW5nKSB7XHJcbiAgICBpZiAodGhpcy5kaXNjYXJkQnRuRWwpIHRoaXMuZGlzY2FyZEJ0bkVsLnRleHRDb250ZW50ID0gbGFiZWw7XHJcbiAgfVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUEwQzs7O0FDQTFDLHNCQUF1RDtBQUdoRCxJQUFNLHlCQUFOLGNBQXFDLGlDQUFpQjtBQUFBLEVBQzNELFlBQVksS0FBVSxRQUF3QixhQUFpRCxjQUFtRTtBQUNoSyxVQUFNLEtBQUssTUFBTTtBQUQyQjtBQUFpRDtBQUFBLEVBRS9GO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFVBQU0sRUFBRSxZQUFZLElBQUk7QUFDeEIs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QUFDMUIsZ0JBQU0sU0FBUyxNQUFNO0FBQ3JCLGdCQUFNLFVBQVUsb0NBQW9DO0FBQ3BELGdCQUFNLHdCQUF3QixPQUFPLE9BQU8sSUFBSTtBQUNoRCxnQkFBTSxnQkFBZ0IsT0FBTztBQUM3QixnQkFBTSxNQUFNO0FBQ1osY0FBSSxLQUFLLFVBQVUsTUFBTyxNQUFLLFFBQVE7QUFBQSxRQUN6QyxTQUFTLEdBQVE7QUFDZixrQkFBUSxNQUFNLENBQUM7QUFDZixnQkFBTSxTQUFTLE9BQU87QUFDdEIsZ0JBQU0sVUFBVSxVQUFVLEdBQUcsV0FBVyxDQUFDLEVBQUU7QUFDM0MsZ0JBQU0sd0JBQXdCLE9BQU8sT0FBTyxJQUFJO0FBQ2hELGdCQUFNLGdCQUFnQixPQUFPO0FBQzdCLGNBQUk7QUFBRSxpQkFBSyxVQUFVLFFBQVE7QUFBQSxVQUFHLFFBQVE7QUFBQSxVQUFFO0FBQzFDLGVBQUssV0FBVztBQUFBLFFBQ2xCLFVBQUU7QUFBQSxRQUVGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsV0FBVyxNQUFNO0FBQ2YsWUFBSTtBQUFFLGVBQUssVUFBVSxRQUFRO0FBQUEsUUFBRyxRQUFRO0FBQUEsUUFBRTtBQUMxQyxhQUFLLFdBQVc7QUFDaEIsY0FBTSxNQUFNO0FBQ1osYUFBSyxRQUFRO0FBQUEsTUFDZjtBQUFBLE1BQ0EsU0FBUyxNQUFNLEtBQUssVUFBVSxNQUFNO0FBQUEsTUFDcEMsVUFBVSxNQUFNLEtBQUssVUFBVSxPQUFPO0FBQUEsSUFDeEMsQ0FBQztBQUNELFNBQUssUUFBUTtBQUdiLFVBQU0sS0FBSztBQUFBLEVBQ2I7QUFBQSxFQUVBLE1BQWMsV0FBVyxNQUFjO0FBQ3JDLFVBQU0sT0FBTyxLQUFLLElBQUksVUFBVSxvQkFBb0IsNkJBQVk7QUFDaEUsUUFBSSxDQUFDLEtBQU0sT0FBTSxJQUFJLE1BQU0sMkJBQTJCO0FBQ3RELFVBQU0sU0FBUyxLQUFLO0FBQ3BCLFVBQU0sU0FBUyxLQUFLLFNBQVMsbUJBQW1CLE9BQU87QUFDdkQsVUFBTSxRQUFRLEtBQUssU0FBUyxrQkFBa0IsT0FBTztBQUNyRCxVQUFNLFVBQVUsR0FBRyxNQUFNLEdBQUcsSUFBSSxHQUFHLEtBQUs7QUFDeEMsUUFBSSxLQUFLLFNBQVMsZUFBZSxhQUFhLE9BQU8sa0JBQWtCLEdBQUc7QUFDeEUsYUFBTyxpQkFBaUIsT0FBTztBQUFBLElBQ2pDLE9BQU87QUFDTCxhQUFPLGFBQWEsU0FBUyxPQUFPLFVBQVUsQ0FBQztBQUFBLElBQ2pEO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIl0KfQo=
