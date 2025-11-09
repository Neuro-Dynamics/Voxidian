import { App, MarkdownView, Plugin, type EditorPosition } from 'obsidian';
import { AITranscriptSettingTab } from './settings';
import { AudioRecorder } from './recorder';
import { postprocessWithOpenAI } from './postprocess';
import { transcribeWithGroq } from './transcribe';
import { DEFAULT_SETTINGS, type AITranscriptSettings, type PromptPreset } from './types';
import { RecordingModal } from './ui/RecordingModal';

export default class AITranscriptPlugin extends Plugin {
  settings: AITranscriptSettings = { ...DEFAULT_SETTINGS, promptPresets: [...DEFAULT_SETTINGS.promptPresets] };
  private recorder?: AudioRecorder;
  private modal?: RecordingModal;

  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    this.addRibbonIcon('mic', 'Record & Transcribe', () => this.toggleRecording());

    this.addCommand({
      id: 'voxidian-start-stop',
      name: 'Start/Stop Recording',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'M' }],
      callback: () => this.toggleRecording(),
    });

    // Mobile toolbar action: appears in Obsidian Mobile editor toolbar
    // Users can add this command to the mobile toolbar via Settings → Mobile → Toolbar
    this.addCommand({
      id: 'record-transcribe-insert',
      name: 'Record • Transcribe • Insert',
      icon: 'mic',
      editorCallback: () => this.toggleRecording(),
    });

    this.addSettingTab(new AITranscriptSettingTab(this.app, this, () => this.settings, async (partial) => {
      Object.assign(this.settings, partial);
      await this.saveData(this.settings);
    }));
  }

  onunload() {
    try { this.recorder?.discard(); } catch { }
    try { this.modal?.close(); } catch { }
  }

  private async toggleRecording() {
    // If modal is open, stop now (simulate clicking Stop)
    if (this.modal) {
      // noop — stopping is driven via modal button to preserve preset/apply state
      return;
    }

    // Ensure we have an editor to insert into later (not strictly required but helps UX)
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return; // MVP: require active markdown view

    // Prepare recorder and modal
    this.recorder = new AudioRecorder();
    const presets = this.settings.promptPresets.map(p => ({ id: p.id, name: p.name }));
    const modal = new RecordingModal(this.app, {
      presets,
      defaultPresetId: this.settings.lastUsedPromptId || this.settings.defaultPromptId,
      maxDurationSec: this.settings.maxDurationSec,
      onStart: async () => {
        try {
          await this.recorder!.start();
        } catch (e: any) {
          console.error(e);
          modal.setPhase('error');
          modal.setStatus('Microphone permission or recorder error.');
          modal.setActionButtonsEnabled(false, false, true);
          modal.setDiscardLabel('Close');
          this.recorder?.discard();
          this.recorder = undefined;
        }
      },
      onStop: async (applyPost, presetId) => {
        modal.setActionButtonsEnabled(false, false, false);
        modal.setPhase('transcribing');
        modal.setStatus('Transcribing…');
        try {
          const blob = await this.recorder!.stop();
          this.recorder = undefined;
          const raw = await transcribeWithGroq(blob, this.settings);
          let text = raw;
          if (applyPost) {
            const preset = this.settings.promptPresets.find(p => p.id === presetId) as PromptPreset | undefined;
            this.settings.lastUsedPromptId = preset?.id || presetId || this.settings.lastUsedPromptId;
            await this.saveData(this.settings);
            modal.setPhase('postprocessing');
            modal.setStatus('Cleaning transcript…');
            text = await postprocessWithOpenAI(raw, this.settings, preset);
          }
          await this.insertText(text);
          modal.setPhase('done');
          modal.setStatus('Transcript inserted into the note.');
          modal.setActionButtonsEnabled(false, false, true);
          modal.setDiscardLabel('Close');
          modal.close();
          if (this.modal === modal) this.modal = undefined;
        } catch (e: any) {
          console.error(e);
          modal.setPhase('error');
          modal.setStatus(`Error: ${e?.message || e}`);
          modal.setActionButtonsEnabled(false, false, true);
          modal.setDiscardLabel('Close');
          try { this.recorder?.discard(); } catch { }
          this.recorder = undefined;
        } finally {
          // keep modal open for user to read/close
        }
      },
      onDiscard: () => {
        try { this.recorder?.discard(); } catch { }
        this.recorder = undefined;
        modal.close();
        this.modal = undefined;
      },
      onPause: () => this.recorder?.pause(),
      onResume: () => this.recorder?.resume(),
    });
    this.modal = modal;

    // MVP uses modal to present all status and animations
    modal.open();
  }

  private async insertText(text: string) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) throw new Error('No active Markdown editor');
    const editor = view.editor;
    const normalized = text.startsWith(' ') ? text.slice(1) : text;
    const before = this.settings.addNewlineBefore ? '\n' : '';
    const after = this.settings.addNewlineAfter ? '\n' : '';
    const content = `${before}${normalized}${after}`;

    let start: EditorPosition;
    if (this.settings.insertMode === 'replace' && editor.somethingSelected()) {
      start = (editor as any).getCursor('from') as EditorPosition;
      editor.replaceSelection(content);
    } else {
      start = editor.getCursor();
      editor.replaceRange(content, start);
    }
    const caret = this.advancePos(start, `${before}${normalized}`);
    editor.setCursor(caret);
  }

  private advancePos(start: EditorPosition, text: string): EditorPosition {
    const parts = text.split('\n');
    if (parts.length === 1) return { line: start.line, ch: start.ch + parts[0].length };
    const linesAdded = parts.length - 1;
    const lastLen = parts[parts.length - 1].length;
    return { line: start.line + linesAdded, ch: lastLen };
  }
}
