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
            text = await postprocessWithOpenAI(raw, this.settings, preset);
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
      onResume: () => this.recorder?.resume()
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9yZWNvcmRlci50cyIsICJzcmMvcG9zdHByb2Nlc3MudHMiLCAic3JjL3RyYW5zY3JpYmUudHMiLCAic3JjL3R5cGVzLnRzIiwgInNyYy91aS9SZWNvcmRpbmdNb2RhbC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQXBwLCBNYXJrZG93blZpZXcsIFBsdWdpbiwgdHlwZSBFZGl0b3JQb3NpdGlvbiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEFJVHJhbnNjcmlwdFNldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IEF1ZGlvUmVjb3JkZXIgfSBmcm9tICcuL3JlY29yZGVyJztcbmltcG9ydCB7IHBvc3Rwcm9jZXNzV2l0aE9wZW5BSSB9IGZyb20gJy4vcG9zdHByb2Nlc3MnO1xuaW1wb3J0IHsgdHJhbnNjcmliZVdpdGhHcm9xIH0gZnJvbSAnLi90cmFuc2NyaWJlJztcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIHR5cGUgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIHR5cGUgUHJvbXB0UHJlc2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSZWNvcmRpbmdNb2RhbCB9IGZyb20gJy4vdWkvUmVjb3JkaW5nTW9kYWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBSVRyYW5zY3JpcHRQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MgPSB7IC4uLkRFRkFVTFRfU0VUVElOR1MsIHByb21wdFByZXNldHM6IFsuLi5ERUZBVUxUX1NFVFRJTkdTLnByb21wdFByZXNldHNdIH07XG4gIHByaXZhdGUgcmVjb3JkZXI/OiBBdWRpb1JlY29yZGVyO1xuICBwcml2YXRlIG1vZGFsPzogUmVjb3JkaW5nTW9kYWw7XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuXG4gICAgdGhpcy5hZGRSaWJib25JY29uKCdtaWMnLCAnUmVjb3JkICYgVHJhbnNjcmliZScsICgpID0+IHRoaXMudG9nZ2xlUmVjb3JkaW5nKCkpO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAndm94aWRpYW4tc3RhcnQtc3RvcCcsXG4gICAgICBuYW1lOiAnU3RhcnQvU3RvcCBSZWNvcmRpbmcnLFxuICAgICAgaG90a2V5czogW3sgbW9kaWZpZXJzOiBbJ01vZCcsICdTaGlmdCddLCBrZXk6ICdNJyB9XSxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnRvZ2dsZVJlY29yZGluZygpLFxuICAgIH0pO1xuXG4gICAgLy8gTW9iaWxlIHRvb2xiYXIgYWN0aW9uOiBhcHBlYXJzIGluIE9ic2lkaWFuIE1vYmlsZSBlZGl0b3IgdG9vbGJhclxuICAgIC8vIFVzZXJzIGNhbiBhZGQgdGhpcyBjb21tYW5kIHRvIHRoZSBtb2JpbGUgdG9vbGJhciB2aWEgU2V0dGluZ3MgXHUyMTkyIE1vYmlsZSBcdTIxOTIgVG9vbGJhclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3JlY29yZC10cmFuc2NyaWJlLWluc2VydCcsXG4gICAgICBuYW1lOiAnUmVjb3JkIFx1MjAyMiBUcmFuc2NyaWJlIFx1MjAyMiBJbnNlcnQnLFxuICAgICAgaWNvbjogJ21pYycsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKCkgPT4gdGhpcy50b2dnbGVSZWNvcmRpbmcoKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgQUlUcmFuc2NyaXB0U2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcywgKCkgPT4gdGhpcy5zZXR0aW5ncywgYXN5bmMgKHBhcnRpYWwpID0+IHtcbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5zZXR0aW5ncywgcGFydGlhbCk7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICAgIH0pKTtcbiAgfVxuXG4gIG9udW5sb2FkKCkge1xuICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7IH1cbiAgICB0cnkgeyB0aGlzLm1vZGFsPy5jbG9zZSgpOyB9IGNhdGNoIHsgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyB0b2dnbGVSZWNvcmRpbmcoKSB7XG4gICAgLy8gSWYgbW9kYWwgaXMgb3Blbiwgc3RvcCBub3cgKHNpbXVsYXRlIGNsaWNraW5nIFN0b3ApXG4gICAgaWYgKHRoaXMubW9kYWwpIHtcbiAgICAgIC8vIG5vb3AgXHUyMDE0IHN0b3BwaW5nIGlzIGRyaXZlbiB2aWEgbW9kYWwgYnV0dG9uIHRvIHByZXNlcnZlIHByZXNldC9hcHBseSBzdGF0ZVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB3ZSBoYXZlIGFuIGVkaXRvciB0byBpbnNlcnQgaW50byBsYXRlciAobm90IHN0cmljdGx5IHJlcXVpcmVkIGJ1dCBoZWxwcyBVWClcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICBpZiAoIXZpZXcpIHJldHVybjsgLy8gTVZQOiByZXF1aXJlIGFjdGl2ZSBtYXJrZG93biB2aWV3XG5cbiAgICAvLyBQcmVwYXJlIHJlY29yZGVyIGFuZCBtb2RhbFxuICAgIHRoaXMucmVjb3JkZXIgPSBuZXcgQXVkaW9SZWNvcmRlcigpO1xuICAgIGNvbnN0IHByZXNldHMgPSB0aGlzLnNldHRpbmdzLnByb21wdFByZXNldHMubWFwKHAgPT4gKHsgaWQ6IHAuaWQsIG5hbWU6IHAubmFtZSB9KSk7XG4gICAgY29uc3QgbW9kYWwgPSBuZXcgUmVjb3JkaW5nTW9kYWwodGhpcy5hcHAsIHtcbiAgICAgIHByZXNldHMsXG4gICAgICBkZWZhdWx0UHJlc2V0SWQ6IHRoaXMuc2V0dGluZ3MubGFzdFVzZWRQcm9tcHRJZCB8fCB0aGlzLnNldHRpbmdzLmRlZmF1bHRQcm9tcHRJZCxcbiAgICAgIG1heER1cmF0aW9uU2VjOiB0aGlzLnNldHRpbmdzLm1heER1cmF0aW9uU2VjLFxuICAgICAgb25TdGFydDogYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IHRoaXMucmVjb3JkZXIhLnN0YXJ0KCk7XG4gICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ2Vycm9yJyk7XG4gICAgICAgICAgbW9kYWwuc2V0U3RhdHVzKCdNaWNyb3Bob25lIHBlcm1pc3Npb24gb3IgcmVjb3JkZXIgZXJyb3IuJyk7XG4gICAgICAgICAgbW9kYWwuc2V0QWN0aW9uQnV0dG9uc0VuYWJsZWQoZmFsc2UsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICBtb2RhbC5zZXREaXNjYXJkTGFiZWwoJ0Nsb3NlJyk7XG4gICAgICAgICAgdGhpcy5yZWNvcmRlcj8uZGlzY2FyZCgpO1xuICAgICAgICAgIHRoaXMucmVjb3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvblN0b3A6IGFzeW5jIChhcHBseVBvc3QsIHByZXNldElkKSA9PiB7XG4gICAgICAgIG1vZGFsLnNldEFjdGlvbkJ1dHRvbnNFbmFibGVkKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICBtb2RhbC5zZXRQaGFzZSgndHJhbnNjcmliaW5nJyk7XG4gICAgICAgIG1vZGFsLnNldFN0YXR1cygnVHJhbnNjcmliaW5nXHUyMDI2Jyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IHRoaXMucmVjb3JkZXIhLnN0b3AoKTtcbiAgICAgICAgICB0aGlzLnJlY29yZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGNvbnN0IHJhdyA9IGF3YWl0IHRyYW5zY3JpYmVXaXRoR3JvcShibG9iLCB0aGlzLnNldHRpbmdzKTtcbiAgICAgICAgICBsZXQgdGV4dCA9IHJhdztcbiAgICAgICAgICBpZiAoYXBwbHlQb3N0KSB7XG4gICAgICAgICAgICBjb25zdCBwcmVzZXQgPSB0aGlzLnNldHRpbmdzLnByb21wdFByZXNldHMuZmluZChwID0+IHAuaWQgPT09IHByZXNldElkKSBhcyBQcm9tcHRQcmVzZXQgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLmxhc3RVc2VkUHJvbXB0SWQgPSBwcmVzZXQ/LmlkIHx8IHByZXNldElkIHx8IHRoaXMuc2V0dGluZ3MubGFzdFVzZWRQcm9tcHRJZDtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gICAgICAgICAgICBtb2RhbC5zZXRQaGFzZSgncG9zdHByb2Nlc3NpbmcnKTtcbiAgICAgICAgICAgIG1vZGFsLnNldFN0YXR1cygnQ2xlYW5pbmcgdHJhbnNjcmlwdFx1MjAyNicpO1xuICAgICAgICAgICAgdGV4dCA9IGF3YWl0IHBvc3Rwcm9jZXNzV2l0aE9wZW5BSShyYXcsIHRoaXMuc2V0dGluZ3MsIHByZXNldCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGZpbmFsT3V0cHV0ID0gdGhpcy5jb21iaW5lVHJhbnNjcmlwdHMocmF3LCB0ZXh0LCBhcHBseVBvc3QpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuaW5zZXJ0VGV4dChmaW5hbE91dHB1dCk7XG4gICAgICAgICAgbW9kYWwuc2V0UGhhc2UoJ2RvbmUnKTtcbiAgICAgICAgICBtb2RhbC5zZXRTdGF0dXMoJ1RyYW5zY3JpcHQgaW5zZXJ0ZWQgaW50byB0aGUgbm90ZS4nKTtcbiAgICAgICAgICBtb2RhbC5zZXRBY3Rpb25CdXR0b25zRW5hYmxlZChmYWxzZSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIG1vZGFsLnNldERpc2NhcmRMYWJlbCgnQ2xvc2UnKTtcbiAgICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgICAgICAgIGlmICh0aGlzLm1vZGFsID09PSBtb2RhbCkgdGhpcy5tb2RhbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICBtb2RhbC5zZXRQaGFzZSgnZXJyb3InKTtcbiAgICAgICAgICBtb2RhbC5zZXRTdGF0dXMoYEVycm9yOiAke2U/Lm1lc3NhZ2UgfHwgZX1gKTtcbiAgICAgICAgICBtb2RhbC5zZXRBY3Rpb25CdXR0b25zRW5hYmxlZChmYWxzZSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIG1vZGFsLnNldERpc2NhcmRMYWJlbCgnQ2xvc2UnKTtcbiAgICAgICAgICB0cnkgeyB0aGlzLnJlY29yZGVyPy5kaXNjYXJkKCk7IH0gY2F0Y2ggeyB9XG4gICAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAvLyBrZWVwIG1vZGFsIG9wZW4gZm9yIHVzZXIgdG8gcmVhZC9jbG9zZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25EaXNjYXJkOiAoKSA9PiB7XG4gICAgICAgIHRyeSB7IHRoaXMucmVjb3JkZXI/LmRpc2NhcmQoKTsgfSBjYXRjaCB7IH1cbiAgICAgICAgdGhpcy5yZWNvcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5tb2RhbCA9IHVuZGVmaW5lZDtcbiAgICAgIH0sXG4gICAgICBvblBhdXNlOiAoKSA9PiB0aGlzLnJlY29yZGVyPy5wYXVzZSgpLFxuICAgICAgb25SZXN1bWU6ICgpID0+IHRoaXMucmVjb3JkZXI/LnJlc3VtZSgpLFxuICAgIH0pO1xuICAgIHRoaXMubW9kYWwgPSBtb2RhbDtcblxuICAgIC8vIE1WUCB1c2VzIG1vZGFsIHRvIHByZXNlbnQgYWxsIHN0YXR1cyBhbmQgYW5pbWF0aW9uc1xuICAgIG1vZGFsLm9wZW4oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5zZXJ0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICBpZiAoIXZpZXcpIHRocm93IG5ldyBFcnJvcignTm8gYWN0aXZlIE1hcmtkb3duIGVkaXRvcicpO1xuICAgIGNvbnN0IGVkaXRvciA9IHZpZXcuZWRpdG9yO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSB0ZXh0LnN0YXJ0c1dpdGgoJyAnKSA/IHRleHQuc2xpY2UoMSkgOiB0ZXh0O1xuICAgIGNvbnN0IGJlZm9yZSA9IHRoaXMuc2V0dGluZ3MuYWRkTmV3bGluZUJlZm9yZSA/ICdcXG4nIDogJyc7XG4gICAgY29uc3QgYWZ0ZXIgPSB0aGlzLnNldHRpbmdzLmFkZE5ld2xpbmVBZnRlciA/ICdcXG4nIDogJyc7XG4gICAgY29uc3QgY29udGVudCA9IGAke2JlZm9yZX0ke25vcm1hbGl6ZWR9JHthZnRlcn1gO1xuXG4gICAgbGV0IHN0YXJ0OiBFZGl0b3JQb3NpdGlvbjtcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5pbnNlcnRNb2RlID09PSAncmVwbGFjZScgJiYgZWRpdG9yLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHtcbiAgICAgIHN0YXJ0ID0gKGVkaXRvciBhcyBhbnkpLmdldEN1cnNvcignZnJvbScpIGFzIEVkaXRvclBvc2l0aW9uO1xuICAgICAgZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oY29udGVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0ID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZShjb250ZW50LCBzdGFydCk7XG4gICAgfVxuICAgIGNvbnN0IGNhcmV0ID0gdGhpcy5hZHZhbmNlUG9zKHN0YXJ0LCBgJHtiZWZvcmV9JHtub3JtYWxpemVkfWApO1xuICAgIGVkaXRvci5zZXRDdXJzb3IoY2FyZXQpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZHZhbmNlUG9zKHN0YXJ0OiBFZGl0b3JQb3NpdGlvbiwgdGV4dDogc3RyaW5nKTogRWRpdG9yUG9zaXRpb24ge1xuICAgIGNvbnN0IHBhcnRzID0gdGV4dC5zcGxpdCgnXFxuJyk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkgcmV0dXJuIHsgbGluZTogc3RhcnQubGluZSwgY2g6IHN0YXJ0LmNoICsgcGFydHNbMF0ubGVuZ3RoIH07XG4gICAgY29uc3QgbGluZXNBZGRlZCA9IHBhcnRzLmxlbmd0aCAtIDE7XG4gICAgY29uc3QgbGFzdExlbiA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLmxlbmd0aDtcbiAgICByZXR1cm4geyBsaW5lOiBzdGFydC5saW5lICsgbGluZXNBZGRlZCwgY2g6IGxhc3RMZW4gfTtcbiAgfVxuXG4gIHByaXZhdGUgY29tYmluZVRyYW5zY3JpcHRzKHJhdzogc3RyaW5nLCBwcm9jZXNzZWQ6IHN0cmluZywgcG9zdHByb2Nlc3NlZEFwcGxpZWQ6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIGlmICghKHBvc3Rwcm9jZXNzZWRBcHBsaWVkICYmIHRoaXMuc2V0dGluZ3MuaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZCkpIHJldHVybiBwcm9jZXNzZWQ7XG4gICAgY29uc3QgcXVvdGVkID0gdGhpcy5xdW90ZVRyYW5zY3JpcHQocmF3KTtcbiAgICBpZiAoIXF1b3RlZCkgcmV0dXJuIHByb2Nlc3NlZDtcbiAgICByZXR1cm4gcHJvY2Vzc2VkLnRyaW0oKS5sZW5ndGggPyBgJHtxdW90ZWR9XFxuXFxuJHtwcm9jZXNzZWR9YCA6IHF1b3RlZDtcbiAgfVxuXG4gIHByaXZhdGUgcXVvdGVUcmFuc2NyaXB0KHJhdzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gcmF3LnRyaW0oKTtcbiAgICBpZiAoIW5vcm1hbGl6ZWQpIHJldHVybiAnJztcbiAgICBjb25zdCBwYXJhZ3JhcGhzID0gbm9ybWFsaXplZC5zcGxpdCgvXFxuXFxzKlxcbi8pO1xuICAgIGNvbnN0IHF1b3RlZEJsb2NrcyA9IHBhcmFncmFwaHMubWFwKChwYXJhZ3JhcGgpID0+IHtcbiAgICAgIGNvbnN0IGxpbmVzID0gcGFyYWdyYXBoLnNwbGl0KCdcXG4nKTtcbiAgICAgIHJldHVybiBsaW5lcy5tYXAobGluZSA9PiBgPiAke2xpbmUudHJpbUVuZCgpfWApLmpvaW4oJ1xcbicpO1xuICAgIH0pO1xuICAgIHJldHVybiBxdW90ZWRCbG9ja3Muam9pbignXFxuPlxcbicpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBQbHVnaW4sIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IEFJVHJhbnNjcmlwdFNldHRpbmdzLCBQcm9tcHRQcmVzZXQgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGNsYXNzIEFJVHJhbnNjcmlwdFNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogUGx1Z2luLCBwcml2YXRlIGdldFNldHRpbmdzOiAoKSA9PiBBSVRyYW5zY3JpcHRTZXR0aW5ncywgcHJpdmF0ZSBzYXZlU2V0dGluZ3M6IChzOiBQYXJ0aWFsPEFJVHJhbnNjcmlwdFNldHRpbmdzPikgPT4gUHJvbWlzZTx2b2lkPikge1xuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgfVxuXG4gIGRpc3BsYXkoKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ0FJIFRyYW5zY3JpcHQnIH0pO1xuXG4gICAgY29uc3QgcyA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcblxuICAgIC8vIEdST1FcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdHcm9xIFdoaXNwZXInIH0pO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0dyb3EgQVBJIEtleScpXG4gICAgICAuc2V0RGVzYygnUmVxdWlyZWQgdG8gdHJhbnNjcmliZSBhdWRpbyB2aWEgR3JvcSBXaGlzcGVyLicpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdnc2tfLi4uJylcbiAgICAgICAgLnNldFZhbHVlKHMuZ3JvcUFwaUtleSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZ3JvcUFwaUtleTogdi50cmltKCkgfSk7IH0pKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0dyb3EgbW9kZWwnKVxuICAgICAgLnNldERlc2MoJ0RlZmF1bHQ6IHdoaXNwZXItbGFyZ2UtdjMnKVxuICAgICAgLmFkZFRleHQodCA9PiB0XG4gICAgICAgIC5zZXRWYWx1ZShzLmdyb3FNb2RlbClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZ3JvcU1vZGVsOiB2LnRyaW0oKSB8fCAnd2hpc3Blci1sYXJnZS12MycgfSk7IH0pKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0xhbmd1YWdlIChvcHRpb25hbCknKVxuICAgICAgLnNldERlc2MoJ0lTTyBjb2RlIGxpa2UgZW4sIGVzLCBkZS4gTGVhdmUgZW1wdHkgZm9yIGF1dG8uJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0VmFsdWUocy5sYW5ndWFnZSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgbGFuZ3VhZ2U6IHYudHJpbSgpIHx8IHVuZGVmaW5lZCB9KTsgfSkpO1xuXG4gICAgLy8gT3BlbkFJXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnT3BlbkFJIFBvc3Rwcm9jZXNzaW5nIChvcHRpb25hbCknIH0pO1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ09wZW5BSSBBUEkgS2V5JylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdFxuICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ3NrLS4uLicpXG4gICAgICAgIC5zZXRWYWx1ZShzLm9wZW5haUFwaUtleSB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgb3BlbmFpQXBpS2V5OiB2LnRyaW0oKSB9KTsgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnT3BlbkFJIG1vZGVsJylcbiAgICAgIC5zZXREZXNjKCdEZWZhdWx0OiBncHQtNG8tbWluaScpXG4gICAgICAuYWRkVGV4dCh0ID0+IHRcbiAgICAgICAgLnNldFZhbHVlKHMub3BlbmFpTW9kZWwpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IG9wZW5haU1vZGVsOiB2LnRyaW0oKSB8fCAnZ3B0LTRvLW1pbmknIH0pOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnSW5jbHVkZSB0cmFuc2NyaXB0IHdpdGggcG9zdHByb2Nlc3NlZCBtZXNzYWdlJylcbiAgICAgIC5zZXREZXNjKCdQcmVwZW5kcyB0aGUgcmF3IHRyYW5zY3JpcHQgcXVvdGVkIHdpdGggXCI+XCIgd2hlbiBwb3N0cHJvY2Vzc2luZyBzdWNjZWVkcy4nKVxuICAgICAgLmFkZFRvZ2dsZSh0ID0+IHRcbiAgICAgICAgLnNldFZhbHVlKHMuaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgaW5jbHVkZVRyYW5zY3JpcHRXaXRoUG9zdHByb2Nlc3NlZDogdiB9KTsgfSkpO1xuXG4gICAgLy8gUHJlc2V0c1xuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoNCcsIHsgdGV4dDogJ1Byb21wdCBwcmVzZXRzJyB9KTtcblxuICAgIGNvbnN0IGxpc3RFbCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdigpO1xuICAgIGNvbnN0IHJlbmRlclByZXNldHMgPSAoKSA9PiB7XG4gICAgICBsaXN0RWwuZW1wdHkoKTtcbiAgICAgIGNvbnN0IHN0ID0gdGhpcy5nZXRTZXR0aW5ncygpO1xuICAgICAgc3QucHJvbXB0UHJlc2V0cy5mb3JFYWNoKChwKSA9PiB7XG4gICAgICAgIGNvbnN0IHdyYXAgPSBsaXN0RWwuY3JlYXRlRGl2KHsgY2xzOiAnYWktcHJlc2V0JyB9KTtcbiAgICAgICAgbmV3IFNldHRpbmcod3JhcClcbiAgICAgICAgICAuc2V0TmFtZShwLm5hbWUpXG4gICAgICAgICAgLnNldERlc2MoJ1N5c3RlbSBwcm9tcHQgKyB0ZW1wZXJhdHVyZScpXG4gICAgICAgICAgLmFkZEJ1dHRvbihiID0+IGIuc2V0QnV0dG9uVGV4dCgnU2V0IERlZmF1bHQnKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgZGVmYXVsdFByb21wdElkOiBwLmlkIH0pO1xuICAgICAgICAgICAgcmVuZGVyUHJlc2V0cygpO1xuICAgICAgICAgIH0pKVxuICAgICAgICAgIC5hZGRCdXR0b24oYiA9PiBiLnNldEJ1dHRvblRleHQoJ0RlbGV0ZScpLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyZWQgPSBzdC5wcm9tcHRQcmVzZXRzLmZpbHRlcih4ID0+IHguaWQgIT09IHAuaWQpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBmaWx0ZXJlZCB9KTtcbiAgICAgICAgICAgIHJlbmRlclByZXNldHMoKTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ05hbWUnKVxuICAgICAgICAgIC5hZGRUZXh0KHQgPT4gdC5zZXRWYWx1ZShwLm5hbWUpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgICBwLm5hbWUgPSB2OyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IHN0LnByb21wdFByZXNldHMgfSk7XG4gICAgICAgICAgfSkpO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKCdTeXN0ZW0gcHJvbXB0JylcbiAgICAgICAgICAuYWRkVGV4dEFyZWEodCA9PiB0LnNldFZhbHVlKHAuc3lzdGVtKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgcC5zeXN0ZW0gPSB2OyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IHByb21wdFByZXNldHM6IHN0LnByb21wdFByZXNldHMgfSk7XG4gICAgICAgICAgfSkpO1xuICAgICAgICBuZXcgU2V0dGluZyh3cmFwKVxuICAgICAgICAgIC5zZXROYW1lKCdUZW1wZXJhdHVyZScpXG4gICAgICAgICAgLmFkZFRleHQodCA9PiB0LnNldFZhbHVlKFN0cmluZyhwLnRlbXBlcmF0dXJlKSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG51bSA9IE51bWJlcih2KTsgcC50ZW1wZXJhdHVyZSA9IGlzRmluaXRlKG51bSkgPyBudW0gOiAwLjI7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogc3QucHJvbXB0UHJlc2V0cyB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIG5ldyBTZXR0aW5nKHdyYXApXG4gICAgICAgICAgLnNldE5hbWUoJ01vZGVsIG92ZXJyaWRlIChvcHRpb25hbCknKVxuICAgICAgICAgIC5hZGRUZXh0KHQgPT4gdC5zZXRQbGFjZWhvbGRlcignZS5nLiwgZ3B0LTRvLW1pbmknKS5zZXRWYWx1ZShwLm1vZGVsIHx8ICcnKS5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgcC5tb2RlbCA9IHYudHJpbSgpIHx8IHVuZGVmaW5lZDsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBwcm9tcHRQcmVzZXRzOiBzdC5wcm9tcHRQcmVzZXRzIH0pO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgaWYgKHN0LmRlZmF1bHRQcm9tcHRJZCA9PT0gcC5pZCkgd3JhcC5jcmVhdGVEaXYoeyB0ZXh0OiAnRGVmYXVsdCBwcmVzZXQnLCBjbHM6ICdhaS1wcmVzZXQtZGVmYXVsdCcgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyUHJlc2V0cygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQWRkIHByZXNldCcpXG4gICAgICAuYWRkQnV0dG9uKGIgPT4gYi5zZXRCdXR0b25UZXh0KCdBZGQnKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3QgPSB0aGlzLmdldFNldHRpbmdzKCk7XG4gICAgICAgIGNvbnN0IGlkID0gYHByZXNldC0ke0RhdGUubm93KCl9YDtcbiAgICAgICAgY29uc3QgcHJlc2V0OiBQcm9tcHRQcmVzZXQgPSB7IGlkLCBuYW1lOiAnTmV3IFByZXNldCcsIHN5c3RlbTogJ0VkaXQgbWVcdTIwMjYnLCB0ZW1wZXJhdHVyZTogMC4yIH07XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgcHJvbXB0UHJlc2V0czogWy4uLnN0LnByb21wdFByZXNldHMsIHByZXNldF0gfSk7XG4gICAgICAgIHJlbmRlclByZXNldHMoKTtcbiAgICAgIH0pKTtcblxuICAgIC8vIFJlY29yZGluZyBiZWhhdmlvclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1JlY29yZGluZyAmIEluc2VydGlvbicgfSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnU2hvdyByZWNvcmRpbmcgbW9kYWwnKVxuICAgICAgLmFkZFRvZ2dsZSh0ID0+IHQuc2V0VmFsdWUocy5zaG93TW9kYWxXaGlsZVJlY29yZGluZykub25DaGFuZ2UoYXN5bmMgKHYpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBzaG93TW9kYWxXaGlsZVJlY29yZGluZzogdiB9KTtcbiAgICAgIH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdNYXggZHVyYXRpb24gKHNlY29uZHMpJylcbiAgICAgIC5hZGRUZXh0KHQgPT4gdC5zZXRWYWx1ZShTdHJpbmcocy5tYXhEdXJhdGlvblNlYykpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgIGNvbnN0IG4gPSBOdW1iZXIodik7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgbWF4RHVyYXRpb25TZWM6IGlzRmluaXRlKG4pICYmIG4gPiAwID8gTWF0aC5mbG9vcihuKSA6IDkwMCB9KTtcbiAgICAgIH0pKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdJbnNlcnQgbW9kZScpXG4gICAgICAuc2V0RGVzYygnSW5zZXJ0IGF0IGN1cnNvciBvciByZXBsYWNlIHNlbGVjdGlvbicpXG4gICAgICAuYWRkRHJvcGRvd24oZCA9PiBkXG4gICAgICAgIC5hZGRPcHRpb24oJ2luc2VydCcsICdJbnNlcnQgYXQgY3Vyc29yJylcbiAgICAgICAgLmFkZE9wdGlvbigncmVwbGFjZScsICdSZXBsYWNlIHNlbGVjdGlvbicpXG4gICAgICAgIC5zZXRWYWx1ZShzLmluc2VydE1vZGUpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncyh7IGluc2VydE1vZGU6IHYgYXMgYW55IH0pOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQWRkIG5ld2xpbmUgYmVmb3JlJylcbiAgICAgIC5hZGRUb2dnbGUodCA9PiB0LnNldFZhbHVlKHMuYWRkTmV3bGluZUJlZm9yZSkub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoeyBhZGROZXdsaW5lQmVmb3JlOiB2IH0pOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQWRkIG5ld2xpbmUgYWZ0ZXInKVxuICAgICAgLmFkZFRvZ2dsZSh0ID0+IHQuc2V0VmFsdWUocy5hZGROZXdsaW5lQWZ0ZXIpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKHsgYWRkTmV3bGluZUFmdGVyOiB2IH0pOyB9KSk7XG4gIH1cbn1cbiIsICJleHBvcnQgY2xhc3MgQXVkaW9SZWNvcmRlciB7XG4gIHByaXZhdGUgbWVkaWFSZWNvcmRlcj86IE1lZGlhUmVjb3JkZXI7XG4gIHByaXZhdGUgY2h1bmtzOiBCbG9iUGFydFtdID0gW107XG4gIHByaXZhdGUgc3RyZWFtPzogTWVkaWFTdHJlYW07XG4gIHByaXZhdGUgc3RhcnRlZEF0ID0gMDtcbiAgcHJpdmF0ZSB0aW1lcj86IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9uVGljaz86IChlbGFwc2VkTXM6IG51bWJlcikgPT4gdm9pZCkge31cblxuICBhc3luYyBzdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5tZWRpYVJlY29yZGVyICYmIHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSA9PT0gJ3JlY29yZGluZycpIHJldHVybjtcbiAgICB0aGlzLmNodW5rcyA9IFtdO1xuICAgIHRoaXMuc3RyZWFtID0gYXdhaXQgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoeyBhdWRpbzogdHJ1ZSB9KTtcbiAgICBjb25zdCBtaW1lQ2FuZGlkYXRlcyA9IFtcbiAgICAgICdhdWRpby93ZWJtO2NvZGVjcz1vcHVzJyxcbiAgICAgICdhdWRpby93ZWJtJyxcbiAgICAgICdhdWRpby9vZ2c7Y29kZWNzPW9wdXMnLFxuICAgICAgJydcbiAgICBdO1xuICAgIGxldCBtaW1lVHlwZSA9ICcnO1xuICAgIGZvciAoY29uc3QgY2FuZCBvZiBtaW1lQ2FuZGlkYXRlcykge1xuICAgICAgaWYgKCFjYW5kIHx8ICh3aW5kb3cgYXMgYW55KS5NZWRpYVJlY29yZGVyPy5pc1R5cGVTdXBwb3J0ZWQ/LihjYW5kKSkgeyBtaW1lVHlwZSA9IGNhbmQ7IGJyZWFrOyB9XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy5tZWRpYVJlY29yZGVyID0gbmV3IE1lZGlhUmVjb3JkZXIodGhpcy5zdHJlYW0sIG1pbWVUeXBlID8geyBtaW1lVHlwZSB9IDogdW5kZWZpbmVkKTtcbiAgICB0aGlzLm1lZGlhUmVjb3JkZXIub25kYXRhYXZhaWxhYmxlID0gKGU6IEJsb2JFdmVudCkgPT4geyBpZiAoZS5kYXRhPy5zaXplKSB0aGlzLmNodW5rcy5wdXNoKGUuZGF0YSk7IH07XG4gICAgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXJ0KDI1MCk7IC8vIHNtYWxsIGNodW5rc1xuICAgIHRoaXMuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICBpZiAodGhpcy5vblRpY2spIHRoaXMudGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5vblRpY2shKERhdGUubm93KCkgLSB0aGlzLnN0YXJ0ZWRBdCksIDIwMCk7XG4gIH1cblxuICBwYXVzZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tZWRpYVJlY29yZGVyICYmIHRoaXMubWVkaWFSZWNvcmRlci5zdGF0ZSA9PT0gJ3JlY29yZGluZycgJiYgdHlwZW9mIHRoaXMubWVkaWFSZWNvcmRlci5wYXVzZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5tZWRpYVJlY29yZGVyLnBhdXNlKCk7XG4gICAgfVxuICB9XG5cbiAgcmVzdW1lKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1lZGlhUmVjb3JkZXIgJiYgdGhpcy5tZWRpYVJlY29yZGVyLnN0YXRlID09PSAncGF1c2VkJyAmJiB0eXBlb2YgdGhpcy5tZWRpYVJlY29yZGVyLnJlc3VtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5tZWRpYVJlY29yZGVyLnJlc3VtZSgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN0b3AoKTogUHJvbWlzZTxCbG9iPiB7XG4gICAgY29uc3QgcmVjID0gdGhpcy5tZWRpYVJlY29yZGVyO1xuICAgIGlmICghcmVjKSB0aHJvdyBuZXcgRXJyb3IoJ1JlY29yZGVyIG5vdCBzdGFydGVkJyk7XG4gICAgY29uc3Qgc3RvcFByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgcmVjLm9uc3RvcCA9ICgpID0+IHJlc29sdmUoKTtcbiAgICB9KTtcbiAgICBpZiAocmVjLnN0YXRlICE9PSAnaW5hY3RpdmUnKSByZWMuc3RvcCgpO1xuICAgIGF3YWl0IHN0b3BQcm9taXNlO1xuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYih0aGlzLmNodW5rcywgeyB0eXBlOiB0aGlzLmNodW5rcy5sZW5ndGggPyAodGhpcy5jaHVua3NbMF0gYXMgYW55KS50eXBlIHx8ICdhdWRpby93ZWJtJyA6ICdhdWRpby93ZWJtJyB9KTtcbiAgICB0aGlzLmNsZWFudXAoKTtcbiAgICByZXR1cm4gYmxvYjtcbiAgfVxuXG4gIGRpc2NhcmQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWVkaWFSZWNvcmRlciAmJiB0aGlzLm1lZGlhUmVjb3JkZXIuc3RhdGUgIT09ICdpbmFjdGl2ZScpIHRoaXMubWVkaWFSZWNvcmRlci5zdG9wKCk7XG4gICAgdGhpcy5jbGVhbnVwKCk7XG4gIH1cblxuICBwcml2YXRlIGNsZWFudXAoKSB7XG4gICAgaWYgKHRoaXMudGltZXIpIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuICAgIHRoaXMudGltZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5tZWRpYVJlY29yZGVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc3RhcnRlZEF0ID0gMDtcbiAgICBpZiAodGhpcy5zdHJlYW0pIHtcbiAgICAgIHRoaXMuc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2godCA9PiB0LnN0b3AoKSk7XG4gICAgICB0aGlzLnN0cmVhbSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5jaHVua3MgPSBbXTtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgQUlUcmFuc2NyaXB0U2V0dGluZ3MsIFByb21wdFByZXNldCB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9zdHByb2Nlc3NXaXRoT3BlbkFJKHJhdzogc3RyaW5nLCBzZXR0aW5nczogQUlUcmFuc2NyaXB0U2V0dGluZ3MsIHByZXNldD86IFByb21wdFByZXNldCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghc2V0dGluZ3Mub3BlbmFpQXBpS2V5KSByZXR1cm4gcmF3OyAvLyBzaWxlbnRseSBza2lwIGlmIG1pc3NpbmdcbiAgY29uc3QgbW9kZWwgPSBwcmVzZXQ/Lm1vZGVsIHx8IHNldHRpbmdzLm9wZW5haU1vZGVsIHx8ICdncHQtNG8tbWluaSc7XG4gIGNvbnN0IHRlbXBlcmF0dXJlID0gY2xhbXAoKHByZXNldD8udGVtcGVyYXR1cmUgPz8gMC4yKSwgMCwgMSk7XG4gIGNvbnN0IHN5c3RlbSA9IHByZXNldD8uc3lzdGVtIHx8ICdZb3UgY2xlYW4gdXAgc3Bva2VuIHRleHQuIEZpeCBjYXBpdGFsaXphdGlvbiBhbmQgcHVuY3R1YXRpb24sIHJlbW92ZSBmaWxsZXIgd29yZHMsIHByZXNlcnZlIG1lYW5pbmcuIERvIG5vdCBhZGQgY29udGVudC4nO1xuXG4gIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJywge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3NldHRpbmdzLm9wZW5haUFwaUtleX1gLFxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIG1vZGVsLFxuICAgICAgdGVtcGVyYXR1cmUsXG4gICAgICBtZXNzYWdlczogW1xuICAgICAgICB7IHJvbGU6ICdzeXN0ZW0nLCBjb250ZW50OiBzeXN0ZW0gfSxcbiAgICAgICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHJhdyB9LFxuICAgICAgXSxcbiAgICB9KSxcbiAgfSk7XG4gIGlmICghcmVzcC5vaykge1xuICAgIC8vIElmIE9wZW5BSSBmYWlscywgcmV0dXJuIHJhdyByYXRoZXIgdGhhbiBicmVha2luZyBpbnNlcnRpb25cbiAgICB0cnkgeyBjb25zb2xlLndhcm4oJ09wZW5BSSBwb3N0cHJvY2VzcyBmYWlsZWQnLCByZXNwLnN0YXR1cywgYXdhaXQgcmVzcC50ZXh0KCkpOyB9IGNhdGNoIHt9XG4gICAgcmV0dXJuIHJhdztcbiAgfVxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gIGNvbnN0IGNsZWFuZWQgPSBkYXRhPy5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQ7XG4gIHJldHVybiB0eXBlb2YgY2xlYW5lZCA9PT0gJ3N0cmluZycgJiYgY2xlYW5lZC50cmltKCkgPyBjbGVhbmVkIDogcmF3O1xufVxuXG5mdW5jdGlvbiBjbGFtcChuOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikgeyByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIG4pKTsgfVxuXG4iLCAiaW1wb3J0IHR5cGUgeyBBSVRyYW5zY3JpcHRTZXR0aW5ncyB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHJhbnNjcmliZVdpdGhHcm9xKGJsb2I6IEJsb2IsIHNldHRpbmdzOiBBSVRyYW5zY3JpcHRTZXR0aW5ncyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghc2V0dGluZ3MuZ3JvcUFwaUtleSkgdGhyb3cgbmV3IEVycm9yKCdHcm9xIEFQSSBrZXkgaXMgbWlzc2luZyBpbiBzZXR0aW5ncy4nKTtcbiAgY29uc3QgZmQgPSBuZXcgRm9ybURhdGEoKTtcbiAgZmQuYXBwZW5kKCdmaWxlJywgbmV3IEZpbGUoW2Jsb2JdLCAnYXVkaW8ud2VibScsIHsgdHlwZTogYmxvYi50eXBlIHx8ICdhdWRpby93ZWJtJyB9KSk7XG4gIGZkLmFwcGVuZCgnbW9kZWwnLCBzZXR0aW5ncy5ncm9xTW9kZWwgfHwgJ3doaXNwZXItbGFyZ2UtdjMnKTtcbiAgaWYgKHNldHRpbmdzLmxhbmd1YWdlKSBmZC5hcHBlbmQoJ2xhbmd1YWdlJywgc2V0dGluZ3MubGFuZ3VhZ2UpO1xuXG4gIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkuZ3JvcS5jb20vb3BlbmFpL3YxL2F1ZGlvL3RyYW5zY3JpcHRpb25zJywge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7c2V0dGluZ3MuZ3JvcUFwaUtleX1gIH0sXG4gICAgYm9keTogZmQsXG4gIH0pO1xuICBpZiAoIXJlc3Aub2spIHtcbiAgICBjb25zdCB0ZXh0ID0gYXdhaXQgc2FmZVRleHQocmVzcCk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBHcm9xIHRyYW5zY3JpcHRpb24gZmFpbGVkICgke3Jlc3Auc3RhdHVzfSk6ICR7dGV4dH1gKTtcbiAgfVxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gIGlmICh0eXBlb2YgZGF0YT8udGV4dCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignR3JvcSByZXNwb25zZSBtaXNzaW5nIHRleHQnKTtcbiAgcmV0dXJuIGRhdGEudGV4dCBhcyBzdHJpbmc7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhZmVUZXh0KHJlc3A6IFJlc3BvbnNlKSB7XG4gIHRyeSB7IHJldHVybiBhd2FpdCByZXNwLnRleHQoKTsgfSBjYXRjaCB7IHJldHVybiAnPG5vLWJvZHk+JzsgfVxufVxuXG4iLCAiZXhwb3J0IHR5cGUgSW5zZXJ0TW9kZSA9ICdpbnNlcnQnIHwgJ3JlcGxhY2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb21wdFByZXNldCB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgc3lzdGVtOiBzdHJpbmc7XG4gIHRlbXBlcmF0dXJlOiBudW1iZXI7XG4gIG1vZGVsPzogc3RyaW5nOyAvLyBvcHRpb25hbCBPcGVuQUkgbW9kZWwgb3ZlcnJpZGVcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBSVRyYW5zY3JpcHRTZXR0aW5ncyB7XG4gIGdyb3FBcGlLZXk6IHN0cmluZztcbiAgZ3JvcU1vZGVsOiBzdHJpbmc7IC8vIGUuZy4sICd3aGlzcGVyLWxhcmdlLXYzJ1xuICBsYW5ndWFnZT86IHN0cmluZzsgLy8gSVNPIGNvZGUsIG9wdGlvbmFsXG5cbiAgb3BlbmFpQXBpS2V5Pzogc3RyaW5nO1xuICBvcGVuYWlNb2RlbDogc3RyaW5nOyAvLyBlLmcuLCAnZ3B0LTRvLW1pbmknXG5cbiAgcHJvbXB0UHJlc2V0czogUHJvbXB0UHJlc2V0W107XG4gIGRlZmF1bHRQcm9tcHRJZD86IHN0cmluZztcbiAgbGFzdFVzZWRQcm9tcHRJZD86IHN0cmluZztcblxuICBzaG93TW9kYWxXaGlsZVJlY29yZGluZzogYm9vbGVhbjtcbiAgbWF4RHVyYXRpb25TZWM6IG51bWJlcjtcbiAgaW5zZXJ0TW9kZTogSW5zZXJ0TW9kZTtcbiAgYWRkTmV3bGluZUJlZm9yZTogYm9vbGVhbjtcbiAgYWRkTmV3bGluZUFmdGVyOiBib29sZWFuO1xuICBpbmNsdWRlVHJhbnNjcmlwdFdpdGhQb3N0cHJvY2Vzc2VkOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9QUkVTRVQ6IFByb21wdFByZXNldCA9IHtcbiAgaWQ6ICdwb2xpc2hlZCcsXG4gIG5hbWU6ICdQb2xpc2hlZCcsXG4gIHN5c3RlbTpcbiAgICAnWW91IGNsZWFuIHVwIHNwb2tlbiB0ZXh0LiBGaXggY2FwaXRhbGl6YXRpb24gYW5kIHB1bmN0dWF0aW9uLCByZW1vdmUgZmlsbGVyIHdvcmRzLCBwcmVzZXJ2ZSBtZWFuaW5nLiBEbyBub3QgYWRkIGNvbnRlbnQuJyxcbiAgdGVtcGVyYXR1cmU6IDAuMixcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBBSVRyYW5zY3JpcHRTZXR0aW5ncyA9IHtcbiAgZ3JvcUFwaUtleTogJycsXG4gIGdyb3FNb2RlbDogJ3doaXNwZXItbGFyZ2UtdjMnLFxuICBsYW5ndWFnZTogdW5kZWZpbmVkLFxuXG4gIG9wZW5haUFwaUtleTogJycsXG4gIG9wZW5haU1vZGVsOiAnZ3B0LTRvLW1pbmknLFxuXG4gIHByb21wdFByZXNldHM6IFtERUZBVUxUX1BSRVNFVF0sXG4gIGRlZmF1bHRQcm9tcHRJZDogJ3BvbGlzaGVkJyxcbiAgbGFzdFVzZWRQcm9tcHRJZDogJ3BvbGlzaGVkJyxcblxuICBzaG93TW9kYWxXaGlsZVJlY29yZGluZzogdHJ1ZSxcbiAgbWF4RHVyYXRpb25TZWM6IDkwMCxcbiAgaW5zZXJ0TW9kZTogJ2luc2VydCcsXG4gIGFkZE5ld2xpbmVCZWZvcmU6IGZhbHNlLFxuICBhZGROZXdsaW5lQWZ0ZXI6IHRydWUsXG4gIGluY2x1ZGVUcmFuc2NyaXB0V2l0aFBvc3Rwcm9jZXNzZWQ6IGZhbHNlLFxufTtcbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBTZXR0aW5nLCBEcm9wZG93bkNvbXBvbmVudCB9IGZyb20gJ29ic2lkaWFuJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVjb3JkaW5nTW9kYWxPcHRpb25zIHtcclxuICBwcmVzZXRzOiB7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9W107XHJcbiAgZGVmYXVsdFByZXNldElkPzogc3RyaW5nO1xyXG4gIG1heER1cmF0aW9uU2VjOiBudW1iZXI7XHJcbiAgb25TdGFydD86ICgpID0+IHZvaWQ7XHJcbiAgb25TdG9wOiAoYXBwbHlQb3N0OiBib29sZWFuLCBwcmVzZXRJZD86IHN0cmluZykgPT4gdm9pZDtcclxuICBvbkRpc2NhcmQ6ICgpID0+IHZvaWQ7XHJcbiAgb25QYXVzZT86ICgpID0+IHZvaWQ7XHJcbiAgb25SZXN1bWU/OiAoKSA9PiB2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUmVjb3JkaW5nTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XHJcbiAgcHJpdmF0ZSByb290RWw/OiBIVE1MRGl2RWxlbWVudDtcclxuICBwcml2YXRlIGVsYXBzZWRFbD86IEhUTUxFbGVtZW50O1xyXG4gIHByaXZhdGUgdGltZXI/OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBzdGFydGVkQXQgPSAwO1xyXG4gIHByaXZhdGUgcHJlc2V0RHJvcGRvd24/OiBEcm9wZG93bkNvbXBvbmVudDtcclxuICBwcml2YXRlIHBhdXNlQnRuRWw/OiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBwcml2YXRlIHRyYW5zY3JpYmVCdG5FbD86IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gIHByaXZhdGUgcG9zdHByb2Nlc3NCdG5FbD86IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gIHByaXZhdGUgc3RhdHVzVGV4dEVsPzogSFRNTEVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBkaXNjYXJkQnRuRWw/OiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBwcml2YXRlIGlzUGF1c2VkID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBwYXVzZVN0YXJ0ZWRBdCA9IDA7XHJcbiAgcHJpdmF0ZSBhY2N1bXVsYXRlZFBhdXNlTXMgPSAwO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvcHRzOiBSZWNvcmRpbmdNb2RhbE9wdGlvbnMpIHtcclxuICAgIHN1cGVyKGFwcCk7XHJcbiAgfVxyXG5cclxuICBvbk9wZW4oKTogdm9pZCB7XHJcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xyXG5cclxuICAgIHRoaXMubW9kYWxFbC5hZGRDbGFzcygndm94aWRpYW4tbW9kYWwnKTtcclxuXHJcbiAgICB0aGlzLnJvb3RFbCA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1yb290JyB9KTtcclxuICAgIHRoaXMucm9vdEVsLnNldEF0dHJpYnV0ZSgnZGF0YS1waGFzZScsICdyZWNvcmRpbmcnKTtcclxuXHJcbiAgICBjb25zdCBoZWFkZXIgPSB0aGlzLnJvb3RFbC5jcmVhdGVEaXYoeyBjbHM6ICd2b3hpZGlhbi1oZWFkZXInIH0pO1xyXG4gICAgaGVhZGVyLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1ZveGlkaWFuJyB9KTtcclxuICAgIGNvbnN0IGhlYWRlclJpZ2h0ID0gaGVhZGVyLmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLWhlYWRlci1yaWdodCcgfSk7XHJcbiAgICBoZWFkZXJSaWdodC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1yZWMtaW5kaWNhdG9yJywgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICdSZWNvcmRpbmcgaW5kaWNhdG9yJyB9IH0pO1xyXG4gICAgdGhpcy5lbGFwc2VkRWwgPSBoZWFkZXJSaWdodC5jcmVhdGVEaXYoeyB0ZXh0OiAnMDA6MDAnLCBjbHM6ICd2b3hpZGlhbi10aW1lcicgfSk7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwgPSBoZWFkZXJSaWdodC5jcmVhdGVFbCgnYnV0dG9uJywge1xyXG4gICAgICB0ZXh0OiAnXHUyNzVBXHUyNzVBJyxcclxuICAgICAgdHlwZTogJ2J1dHRvbicsXHJcbiAgICAgIGNsczogJ3ZveGlkaWFuLXBhdXNlJyxcclxuICAgICAgYXR0cjogeyAnYXJpYS1sYWJlbCc6ICdQYXVzZSByZWNvcmRpbmcnLCAnYXJpYS1wcmVzc2VkJzogJ2ZhbHNlJyB9LFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnRvZ2dsZVBhdXNlKCkpO1xyXG4gICAgdGhpcy5yZXNldFBhdXNlU3RhdGUoKTtcclxuXHJcbiAgICBjb25zdCBib2R5ID0gdGhpcy5yb290RWwuY3JlYXRlRGl2KHsgY2xzOiAndm94aWRpYW4tYm9keScgfSk7XHJcblxyXG4gICAgLy8gUHJlc2V0IHNlbGVjdGlvblxyXG4gICAgbmV3IFNldHRpbmcoYm9keSlcclxuICAgICAgLnNldE5hbWUoJ1Bvc3Rwcm9jZXNzaW5nIHByZXNldCcpXHJcbiAgICAgIC5hZGREcm9wZG93bihkID0+IHtcclxuICAgICAgICB0aGlzLnByZXNldERyb3Bkb3duID0gZDtcclxuICAgICAgICBmb3IgKGNvbnN0IHAgb2YgdGhpcy5vcHRzLnByZXNldHMpIGQuYWRkT3B0aW9uKHAuaWQsIHAubmFtZSk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0cy5kZWZhdWx0UHJlc2V0SWQpIGQuc2V0VmFsdWUodGhpcy5vcHRzLmRlZmF1bHRQcmVzZXRJZCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGJ0bnMgPSBib2R5LmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLWJ1dHRvbnMnIH0pO1xyXG4gICAgdGhpcy50cmFuc2NyaWJlQnRuRWwgPSBidG5zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdUcmFuc2NyaWJlJywgdHlwZTogJ2J1dHRvbicgfSk7XHJcbiAgICB0aGlzLnBvc3Rwcm9jZXNzQnRuRWwgPSBidG5zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdQb3N0UHJvY2VzcycsIHR5cGU6ICdidXR0b24nIH0pO1xyXG4gICAgdGhpcy5kaXNjYXJkQnRuRWwgPSBidG5zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdEaXNjYXJkJywgdHlwZTogJ2J1dHRvbicgfSk7XHJcbiAgICB0aGlzLnRyYW5zY3JpYmVCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudHJpZ2dlclN0b3AoZmFsc2UpKTtcclxuICAgIHRoaXMucG9zdHByb2Nlc3NCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudHJpZ2dlclN0b3AodHJ1ZSkpO1xyXG4gICAgdGhpcy5kaXNjYXJkQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm9wdHMub25EaXNjYXJkKCkpO1xyXG5cclxuICAgIGNvbnN0IHN0YXR1c0JhciA9IHRoaXMucm9vdEVsLmNyZWF0ZURpdih7IGNsczogJ3ZveGlkaWFuLXN0YXR1c2JhcicgfSk7XHJcbiAgICBjb25zdCBzdGF0dXNXcmFwID0gc3RhdHVzQmFyLmNyZWF0ZURpdih7IGNsczogJ2FpLXN0YXR1cy13cmFwJyB9KTtcclxuICAgIHN0YXR1c1dyYXAuY3JlYXRlRGl2KHsgY2xzOiAnYWktc3Bpbm5lcicsIGF0dHI6IHsgJ2FyaWEtbGFiZWwnOiAnV29ya2luZ1x1MjAyNicgfSB9KTtcclxuICAgIHRoaXMuc3RhdHVzVGV4dEVsID0gc3RhdHVzV3JhcC5jcmVhdGVEaXYoeyBjbHM6ICdhaS1zdGF0dXMtdGV4dCcsIHRleHQ6ICdMaXN0ZW5pbmdcdTIwMjYnIH0pO1xyXG5cclxuICAgIHRoaXMubW9kYWxFbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgdGhpcy5vcHRzLm9uRGlzY2FyZCgpO1xyXG4gICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyU3RvcChmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFN0YXJ0IHRpbWVyXHJcbiAgICB0aGlzLnN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XHJcbiAgICB0aGlzLnRpbWVyID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHRoaXMudGljaygpLCAyMDApO1xyXG4gICAgdGhpcy5vcHRzLm9uU3RhcnQ/LigpO1xyXG4gIH1cclxuXHJcbiAgb25DbG9zZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnRpbWVyKSB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcclxuICAgIHRoaXMudGltZXIgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0aWNrKCk6IHZvaWQge1xyXG4gICAgY29uc3QgZWxhcHNlZE1zID0gdGhpcy5nZXRFbGFwc2VkTXMoKTtcclxuICAgIGNvbnN0IHNlYyA9IE1hdGguZmxvb3IoZWxhcHNlZE1zIC8gMTAwMCk7XHJcbiAgICBjb25zdCBtbSA9IE1hdGguZmxvb3Ioc2VjIC8gNjApLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcclxuICAgIGNvbnN0IHNzID0gKHNlYyAlIDYwKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XHJcbiAgICBpZiAodGhpcy5lbGFwc2VkRWwpIHRoaXMuZWxhcHNlZEVsLnRleHRDb250ZW50ID0gYCR7bW19OiR7c3N9YDtcclxuICAgIGlmICh0aGlzLm9wdHMubWF4RHVyYXRpb25TZWMgPiAwICYmICF0aGlzLmlzUGF1c2VkICYmIHNlYyA+PSB0aGlzLm9wdHMubWF4RHVyYXRpb25TZWMpIHtcclxuICAgICAgdGhpcy50cmlnZ2VyU3RvcChmYWxzZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEVsYXBzZWRNcygpOiBudW1iZXIge1xyXG4gICAgaWYgKCF0aGlzLnN0YXJ0ZWRBdCkgcmV0dXJuIDA7XHJcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgbGV0IGVsYXBzZWQgPSBub3cgLSB0aGlzLnN0YXJ0ZWRBdCAtIHRoaXMuYWNjdW11bGF0ZWRQYXVzZU1zO1xyXG4gICAgaWYgKHRoaXMuaXNQYXVzZWQgJiYgdGhpcy5wYXVzZVN0YXJ0ZWRBdCkge1xyXG4gICAgICBlbGFwc2VkIC09IG5vdyAtIHRoaXMucGF1c2VTdGFydGVkQXQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTWF0aC5tYXgoMCwgZWxhcHNlZCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHRyaWdnZXJTdG9wKGFwcGx5UG9zdDogYm9vbGVhbikge1xyXG4gICAgdGhpcy5maW5hbGl6ZVBhdXNlU3RhdGUoKTtcclxuICAgIGNvbnN0IHByZXNldElkID0gdGhpcy5wcmVzZXREcm9wZG93bj8uZ2V0VmFsdWUoKTtcclxuICAgIHRoaXMub3B0cy5vblN0b3AoYXBwbHlQb3N0LCBwcmVzZXRJZCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHRvZ2dsZVBhdXNlKCkge1xyXG4gICAgaWYgKHRoaXMuaXNQYXVzZWQpIHtcclxuICAgICAgdGhpcy5yZXN1bWVSZWNvcmRpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucGF1c2VSZWNvcmRpbmcoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGF1c2VSZWNvcmRpbmcoKSB7XHJcbiAgICBpZiAodGhpcy5pc1BhdXNlZCkgcmV0dXJuO1xyXG4gICAgdGhpcy5pc1BhdXNlZCA9IHRydWU7XHJcbiAgICB0aGlzLnBhdXNlU3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcclxuICAgIHRoaXMudXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpO1xyXG4gICAgdGhpcy5vcHRzLm9uUGF1c2U/LigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXN1bWVSZWNvcmRpbmcoKSB7XHJcbiAgICBpZiAoIXRoaXMuaXNQYXVzZWQpIHJldHVybjtcclxuICAgIGlmICh0aGlzLnBhdXNlU3RhcnRlZEF0KSB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcyArPSBEYXRlLm5vdygpIC0gdGhpcy5wYXVzZVN0YXJ0ZWRBdDtcclxuICAgIHRoaXMucGF1c2VTdGFydGVkQXQgPSAwO1xyXG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy51cGRhdGVQYXVzZUJ1dHRvbkxhYmVsKCk7XHJcbiAgICB0aGlzLm9wdHMub25SZXN1bWU/LigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmaW5hbGl6ZVBhdXNlU3RhdGUoKSB7XHJcbiAgICBpZiAodGhpcy5pc1BhdXNlZCAmJiB0aGlzLnBhdXNlU3RhcnRlZEF0KSB7XHJcbiAgICAgIHRoaXMuYWNjdW11bGF0ZWRQYXVzZU1zICs9IERhdGUubm93KCkgLSB0aGlzLnBhdXNlU3RhcnRlZEF0O1xyXG4gICAgfVxyXG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5wYXVzZVN0YXJ0ZWRBdCA9IDA7XHJcbiAgICB0aGlzLnVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzZXRQYXVzZVN0YXRlKCkge1xyXG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5wYXVzZVN0YXJ0ZWRBdCA9IDA7XHJcbiAgICB0aGlzLmFjY3VtdWxhdGVkUGF1c2VNcyA9IDA7XHJcbiAgICB0aGlzLnVwZGF0ZVBhdXNlQnV0dG9uTGFiZWwoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlUGF1c2VCdXR0b25MYWJlbCgpIHtcclxuICAgIGlmICghdGhpcy5wYXVzZUJ0bkVsKSByZXR1cm47XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtcGF1c2VkJywgdGhpcy5pc1BhdXNlZCk7XHJcbiAgICB0aGlzLnBhdXNlQnRuRWwudGV4dENvbnRlbnQgPSB0aGlzLmlzUGF1c2VkID8gJ1x1MjVCNicgOiAnXHUyNzVBXHUyNzVBJztcclxuICAgIHRoaXMucGF1c2VCdG5FbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIHRoaXMuaXNQYXVzZWQgPyAndHJ1ZScgOiAnZmFsc2UnKTtcclxuICAgIHRoaXMucGF1c2VCdG5FbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCB0aGlzLmlzUGF1c2VkID8gJ1Jlc3VtZSByZWNvcmRpbmcnIDogJ1BhdXNlIHJlY29yZGluZycpO1xyXG4gIH1cclxuXHJcbiAgLy8gUHVibGljIFVJIGhlbHBlcnNcclxuICBzZXRQaGFzZShwaGFzZTogJ3JlY29yZGluZycgfCAndHJhbnNjcmliaW5nJyB8ICdwb3N0cHJvY2Vzc2luZycgfCAnZG9uZScgfCAnZXJyb3InKSB7XHJcbiAgICB0aGlzLnJvb3RFbD8uc2V0QXR0cmlidXRlKCdkYXRhLXBoYXNlJywgcGhhc2UpO1xyXG4gICAgaWYgKHBoYXNlICE9PSAncmVjb3JkaW5nJykge1xyXG4gICAgICB0aGlzLmZpbmFsaXplUGF1c2VTdGF0ZSgpO1xyXG4gICAgICBpZiAodGhpcy50aW1lcikgeyB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTsgdGhpcy50aW1lciA9IHVuZGVmaW5lZDsgfVxyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucGF1c2VCdG5FbCkgdGhpcy5wYXVzZUJ0bkVsLmRpc2FibGVkID0gcGhhc2UgIT09ICdyZWNvcmRpbmcnO1xyXG4gIH1cclxuXHJcbiAgc2V0U3RhdHVzKHRleHQ6IHN0cmluZykge1xyXG4gICAgaWYgKHRoaXMuc3RhdHVzVGV4dEVsKSB0aGlzLnN0YXR1c1RleHRFbC50ZXh0Q29udGVudCA9IHRleHQ7XHJcbiAgfVxyXG5cclxuICBzZXRBY3Rpb25CdXR0b25zRW5hYmxlZCh0cmFuc2NyaWJlRW5hYmxlZDogYm9vbGVhbiwgcG9zdHByb2Nlc3NFbmFibGVkOiBib29sZWFuLCBkaXNjYXJkRW5hYmxlZDogYm9vbGVhbikge1xyXG4gICAgaWYgKHRoaXMudHJhbnNjcmliZUJ0bkVsKSB0aGlzLnRyYW5zY3JpYmVCdG5FbC5kaXNhYmxlZCA9ICF0cmFuc2NyaWJlRW5hYmxlZDtcclxuICAgIGlmICh0aGlzLnBvc3Rwcm9jZXNzQnRuRWwpIHRoaXMucG9zdHByb2Nlc3NCdG5FbC5kaXNhYmxlZCA9ICFwb3N0cHJvY2Vzc0VuYWJsZWQ7XHJcbiAgICBpZiAodGhpcy5kaXNjYXJkQnRuRWwpIHRoaXMuZGlzY2FyZEJ0bkVsLmRpc2FibGVkID0gIWRpc2NhcmRFbmFibGVkO1xyXG4gIH1cclxuXHJcbiAgc2V0RGlzY2FyZExhYmVsKGxhYmVsOiBzdHJpbmcpIHtcclxuICAgIGlmICh0aGlzLmRpc2NhcmRCdG5FbCkgdGhpcy5kaXNjYXJkQnRuRWwudGV4dENvbnRlbnQgPSBsYWJlbDtcclxuICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQUEsbUJBQStEOzs7QUNBL0Qsc0JBQXVEO0FBR2hELElBQU0seUJBQU4sY0FBcUMsaUNBQWlCO0FBQUEsRUFDM0QsWUFBWSxLQUFVLFFBQXdCLGFBQWlELGNBQW1FO0FBQ2hLLFVBQU0sS0FBSyxNQUFNO0FBRDJCO0FBQWlEO0FBQUEsRUFFL0Y7QUFBQSxFQUVBLFVBQWdCO0FBQ2QsVUFBTSxFQUFFLFlBQVksSUFBSTtBQUN4QixnQkFBWSxNQUFNO0FBQ2xCLGdCQUFZLFNBQVMsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFcEQsVUFBTSxJQUFJLEtBQUssWUFBWTtBQUczQixnQkFBWSxTQUFTLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxjQUFjLEVBQ3RCLFFBQVEsZ0RBQWdELEVBQ3hELFFBQVEsT0FBSyxFQUNYLGVBQWUsU0FBUyxFQUN4QixTQUFTLEVBQUUsY0FBYyxFQUFFLEVBQzNCLFNBQVMsT0FBTyxNQUFNO0FBQUUsWUFBTSxLQUFLLGFBQWEsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLENB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QUksS0FBSyxNQUFNLENBQUMsSUFBSTtBQUMxRCxVQUFNLFNBQVMsS0FBSyxTQUFTLG1CQUFtQixPQUFPO0FBQ3ZELFVBQU0sUUFBUSxLQUFLLFNBQVMsa0JBQWtCLE9BQU87QUFDckQsVUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLFVBQVUsR0FBRyxLQUFLO0FBRTlDLFFBQUk7QUFDSixRQUFJLEtBQUssU0FBUyxlQUFlLGFBQWEsT0FBTyxrQkFBa0IsR0FBRztBQUN4RSxjQUFTLE9BQWUsVUFBVSxNQUFNO0FBQ3hDLGFBQU8saUJBQWlCLE9BQU87QUFBQSxJQUNqQyxPQUFPO0FBQ0wsY0FBUSxPQUFPLFVBQVU7QUFDekIsYUFBTyxhQUFhLFNBQVMsS0FBSztBQUFBLElBQ3BDO0FBQ0EsVUFBTSxRQUFRLEtBQUssV0FBVyxPQUFPLEdBQUcsTUFBTSxHQUFHLFVBQVUsRUFBRTtBQUM3RCxXQUFPLFVBQVUsS0FBSztBQUFBLEVBQ3hCO0FBQUEsRUFFUSxXQUFXLE9BQXVCLE1BQThCO0FBQ3RFLFVBQU0sUUFBUSxLQUFLLE1BQU0sSUFBSTtBQUM3QixRQUFJLE1BQU0sV0FBVyxFQUFHLFFBQU8sRUFBRSxNQUFNLE1BQU0sTUFBTSxJQUFJLE1BQU0sS0FBSyxNQUFNLENBQUMsRUFBRSxPQUFPO0FBQ2xGLFVBQU0sYUFBYSxNQUFNLFNBQVM7QUFDbEMsVUFBTSxVQUFVLE1BQU0sTUFBTSxTQUFTLENBQUMsRUFBRTtBQUN4QyxXQUFPLEVBQUUsTUFBTSxNQUFNLE9BQU8sWUFBWSxJQUFJLFFBQVE7QUFBQSxFQUN0RDtBQUFBLEVBRVEsbUJBQW1CLEtBQWEsV0FBbUIsc0JBQXVDO0FBQ2hHLFFBQUksRUFBRSx3QkFBd0IsS0FBSyxTQUFTLG9DQUFxQyxRQUFPO0FBQ3hGLFVBQU0sU0FBUyxLQUFLLGdCQUFnQixHQUFHO0FBQ3ZDLFFBQUksQ0FBQyxPQUFRLFFBQU87QUFDcEIsV0FBTyxVQUFVLEtBQUssRUFBRSxTQUFTLEdBQUcsTUFBTTtBQUFBO0FBQUEsRUFBTyxTQUFTLEtBQUs7QUFBQSxFQUNqRTtBQUFBLEVBRVEsZ0JBQWdCLEtBQXFCO0FBQzNDLFVBQU0sYUFBYSxJQUFJLEtBQUs7QUFDNUIsUUFBSSxDQUFDLFdBQVksUUFBTztBQUN4QixVQUFNLGFBQWEsV0FBVyxNQUFNLFNBQVM7QUFDN0MsVUFBTSxlQUFlLFdBQVcsSUFBSSxDQUFDLGNBQWM7QUFDakQsWUFBTSxRQUFRLFVBQVUsTUFBTSxJQUFJO0FBQ2xDLGFBQU8sTUFBTSxJQUFJLFVBQVEsS0FBSyxLQUFLLFFBQVEsQ0FBQyxFQUFFLEVBQUUsS0FBSyxJQUFJO0FBQUEsSUFDM0QsQ0FBQztBQUNELFdBQU8sYUFBYSxLQUFLLE9BQU87QUFBQSxFQUNsQztBQUNGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIl0KfQo=
