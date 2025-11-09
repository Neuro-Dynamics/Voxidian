import { App, Modal, Setting, DropdownComponent } from 'obsidian';

export interface RecordingModalOptions {
  presets: { id: string; name: string }[];
  defaultPresetId?: string;
  maxDurationSec: number;
  onStart?: () => void;
  onStop: (applyPost: boolean, presetId?: string) => void;
  onDiscard: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export class RecordingModal extends Modal {
  private rootEl?: HTMLDivElement;
  private elapsedEl?: HTMLElement;
  private timer?: number;
  private startedAt = 0;
  private presetDropdown?: DropdownComponent;
  private pauseBtnEl?: HTMLButtonElement;
  private transcribeBtnEl?: HTMLButtonElement;
  private postprocessBtnEl?: HTMLButtonElement;
  private statusTextEl?: HTMLElement;
  private discardBtnEl?: HTMLButtonElement;
  private isPaused = false;
  private pauseStartedAt = 0;
  private accumulatedPauseMs = 0;

  constructor(app: App, private opts: RecordingModalOptions) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    this.modalEl.addClass('voxidian-modal');

    this.rootEl = contentEl.createDiv({ cls: 'voxidian-root' });
    this.rootEl.setAttribute('data-phase', 'recording');

    const header = this.rootEl.createDiv({ cls: 'voxidian-header' });
    header.createEl('h3', { text: 'Voxidian' });
    const headerRight = header.createDiv({ cls: 'voxidian-header-right' });
    headerRight.createDiv({ cls: 'ai-rec-indicator', attr: { 'aria-label': 'Recording indicator' } });
    this.elapsedEl = headerRight.createDiv({ text: '00:00', cls: 'voxidian-timer' });
    this.pauseBtnEl = headerRight.createEl('button', {
      text: '❚❚',
      type: 'button',
      cls: 'voxidian-pause',
      attr: { 'aria-label': 'Pause recording', 'aria-pressed': 'false' },
    });
    this.pauseBtnEl.addEventListener('click', () => this.togglePause());
    this.resetPauseState();

    const body = this.rootEl.createDiv({ cls: 'voxidian-body' });

    // Preset selection
    new Setting(body)
      .setName('Postprocessing preset')
      .addDropdown(d => {
        this.presetDropdown = d;
        for (const p of this.opts.presets) d.addOption(p.id, p.name);
        if (this.opts.defaultPresetId) d.setValue(this.opts.defaultPresetId);
      });

    const btns = body.createDiv({ cls: 'voxidian-buttons' });
    this.transcribeBtnEl = btns.createEl('button', { text: 'Transcribe', type: 'button' });
    this.postprocessBtnEl = btns.createEl('button', { text: 'PostProcess', type: 'button' });
    this.discardBtnEl = btns.createEl('button', { text: 'Discard', type: 'button' });
    this.transcribeBtnEl.addEventListener('click', () => this.triggerStop(false));
    this.postprocessBtnEl.addEventListener('click', () => this.triggerStop(true));
    this.discardBtnEl.addEventListener('click', () => this.opts.onDiscard());

    const statusBar = this.rootEl.createDiv({ cls: 'voxidian-statusbar' });
    const statusWrap = statusBar.createDiv({ cls: 'ai-status-wrap' });
    statusWrap.createDiv({ cls: 'ai-spinner', attr: { 'aria-label': 'Working…' } });
    this.statusTextEl = statusWrap.createDiv({ cls: 'ai-status-text', text: 'Listening…' });

    this.modalEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.opts.onDiscard();
      if (e.key === 'Enter') {
        e.preventDefault();
        this.triggerStop(false);
      }
    });

    // Start timer
    this.startedAt = Date.now();
    this.timer = window.setInterval(() => this.tick(), 200);
    this.opts.onStart?.();
  }

  onClose(): void {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = undefined;
    this.contentEl.empty();
  }

  private tick(): void {
    const elapsedMs = this.getElapsedMs();
    const sec = Math.floor(elapsedMs / 1000);
    const mm = Math.floor(sec / 60).toString().padStart(2, '0');
    const ss = (sec % 60).toString().padStart(2, '0');
    if (this.elapsedEl) this.elapsedEl.textContent = `${mm}:${ss}`;
    if (this.opts.maxDurationSec > 0 && !this.isPaused && sec >= this.opts.maxDurationSec) {
      this.triggerStop(false);
    }
  }

  private getElapsedMs(): number {
    if (!this.startedAt) return 0;
    const now = Date.now();
    let elapsed = now - this.startedAt - this.accumulatedPauseMs;
    if (this.isPaused && this.pauseStartedAt) {
      elapsed -= now - this.pauseStartedAt;
    }
    return Math.max(0, elapsed);
  }

  private triggerStop(applyPost: boolean) {
    this.finalizePauseState();
    const presetId = this.presetDropdown?.getValue();
    this.opts.onStop(applyPost, presetId);
  }

  private togglePause() {
    if (this.isPaused) {
      this.resumeRecording();
    } else {
      this.pauseRecording();
    }
  }

  private pauseRecording() {
    if (this.isPaused) return;
    this.isPaused = true;
    this.pauseStartedAt = Date.now();
    this.updatePauseButtonLabel();
    this.opts.onPause?.();
  }

  private resumeRecording() {
    if (!this.isPaused) return;
    if (this.pauseStartedAt) this.accumulatedPauseMs += Date.now() - this.pauseStartedAt;
    this.pauseStartedAt = 0;
    this.isPaused = false;
    this.updatePauseButtonLabel();
    this.opts.onResume?.();
  }

  private finalizePauseState() {
    if (this.isPaused && this.pauseStartedAt) {
      this.accumulatedPauseMs += Date.now() - this.pauseStartedAt;
    }
    this.isPaused = false;
    this.pauseStartedAt = 0;
    this.updatePauseButtonLabel();
  }

  private resetPauseState() {
    this.isPaused = false;
    this.pauseStartedAt = 0;
    this.accumulatedPauseMs = 0;
    this.updatePauseButtonLabel();
  }

  private updatePauseButtonLabel() {
    if (!this.pauseBtnEl) return;
    this.pauseBtnEl.classList.toggle('is-paused', this.isPaused);
    this.pauseBtnEl.textContent = this.isPaused ? '▶' : '❚❚';
    this.pauseBtnEl.setAttribute('aria-pressed', this.isPaused ? 'true' : 'false');
    this.pauseBtnEl.setAttribute('aria-label', this.isPaused ? 'Resume recording' : 'Pause recording');
  }

  // Public UI helpers
  setPhase(phase: 'recording' | 'transcribing' | 'postprocessing' | 'done' | 'error') {
    this.rootEl?.setAttribute('data-phase', phase);
    if (phase !== 'recording') {
      this.finalizePauseState();
      if (this.timer) { window.clearInterval(this.timer); this.timer = undefined; }
    }
    if (this.pauseBtnEl) this.pauseBtnEl.disabled = phase !== 'recording';
  }

  setStatus(text: string) {
    if (this.statusTextEl) this.statusTextEl.textContent = text;
  }

  setActionButtonsEnabled(transcribeEnabled: boolean, postprocessEnabled: boolean, discardEnabled: boolean) {
    if (this.transcribeBtnEl) this.transcribeBtnEl.disabled = !transcribeEnabled;
    if (this.postprocessBtnEl) this.postprocessBtnEl.disabled = !postprocessEnabled;
    if (this.discardBtnEl) this.discardBtnEl.disabled = !discardEnabled;
  }

  setDiscardLabel(label: string) {
    if (this.discardBtnEl) this.discardBtnEl.textContent = label;
  }
}
