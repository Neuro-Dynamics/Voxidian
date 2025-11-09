import { App, Modal, Setting, DropdownComponent, ToggleComponent } from 'obsidian';

export interface RecordingModalOptions {
  presets: { id: string; name: string }[];
  defaultPresetId?: string;
  enablePostprocess: boolean;
  maxDurationSec: number;
  onStart?: () => void;
  onStop: (applyPost: boolean, presetId?: string) => void;
  onDiscard: () => void;
}

export class RecordingModal extends Modal {
  private rootEl?: HTMLDivElement;
  private elapsedEl?: HTMLElement;
  private timer?: number;
  private startedAt = 0;
  private presetDropdown?: DropdownComponent;
  private applyToggle?: ToggleComponent;
  private statusTextEl?: HTMLElement;
  private stopBtnEl?: HTMLButtonElement;
  private discardBtnEl?: HTMLButtonElement;

  constructor(app: App, private opts: RecordingModalOptions) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    this.rootEl = contentEl.createDiv({ cls: 'ai-transcript-root' });
    this.rootEl.setAttribute('data-phase', 'recording');

    const header = this.rootEl.createDiv({ cls: 'ai-transcript-header' });
    header.createEl('h3', { text: 'Recording…' });
    const headerRight = header.createDiv({ cls: 'ai-transcript-header-right' });
    headerRight.createDiv({ cls: 'ai-rec-indicator', attr: { 'aria-label': 'Recording indicator' } });
    this.elapsedEl = headerRight.createDiv({ text: '00:00', cls: 'ai-transcript-timer' });

    const body = this.rootEl.createDiv({ cls: 'ai-transcript-body' });

    // Preset + apply
    new Setting(body)
      .setName('Postprocessing preset')
      .addDropdown(d => {
        this.presetDropdown = d;
        for (const p of this.opts.presets) d.addOption(p.id, p.name);
        if (this.opts.defaultPresetId) d.setValue(this.opts.defaultPresetId);
      })
      .addToggle(t => {
        t.setTooltip('Apply postprocessing');
        t.setValue(this.opts.enablePostprocess);
        this.applyToggle = t;
      });

    const btns = body.createDiv({ cls: 'ai-transcript-buttons' });
    this.stopBtnEl = btns.createEl('button', { text: 'Stop & Transcribe' });
    this.discardBtnEl = btns.createEl('button', { text: 'Discard' });
    this.stopBtnEl.addEventListener('click', () => {
      const apply = !!this.applyToggle?.getValue();
      const presetId = this.presetDropdown?.getValue();
      this.opts.onStop(apply, presetId);
    });
    this.discardBtnEl.addEventListener('click', () => this.opts.onDiscard());

    const statusBar = this.rootEl.createDiv({ cls: 'ai-transcript-statusbar' });
    const statusWrap = statusBar.createDiv({ cls: 'ai-status-wrap' });
    statusWrap.createDiv({ cls: 'ai-spinner', attr: { 'aria-label': 'Working…' } });
    this.statusTextEl = statusWrap.createDiv({ cls: 'ai-status-text', text: 'Recording audio…' });

    this.modalEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.opts.onDiscard();
      if (e.key === 'Enter') {
        const apply = !!this.applyToggle?.getValue();
        const presetId = this.presetDropdown?.getValue();
        this.opts.onStop(apply, presetId);
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
    const elapsedMs = Date.now() - this.startedAt;
    const sec = Math.floor(elapsedMs / 1000);
    const mm = Math.floor(sec / 60).toString().padStart(2, '0');
    const ss = (sec % 60).toString().padStart(2, '0');
    if (this.elapsedEl) this.elapsedEl.textContent = `${mm}:${ss}`;
    if (this.opts.maxDurationSec > 0 && sec >= this.opts.maxDurationSec) {
      const apply = !!this.applyToggle?.getValue();
      const presetId = this.presetDropdown?.getValue();
      this.opts.onStop(apply, presetId);
    }
  }

  // Public UI helpers
  setPhase(phase: 'recording' | 'transcribing' | 'postprocessing' | 'done' | 'error') {
    this.rootEl?.setAttribute('data-phase', phase);
    if (phase !== 'recording' && this.timer) { window.clearInterval(this.timer); this.timer = undefined; }
  }

  setStatus(text: string) {
    if (this.statusTextEl) this.statusTextEl.textContent = text;
  }

  setButtonsEnabled(stopEnabled: boolean, discardEnabled: boolean) {
    if (this.stopBtnEl) this.stopBtnEl.disabled = !stopEnabled;
    if (this.discardBtnEl) this.discardBtnEl.disabled = !discardEnabled;
  }

  setDiscardLabel(label: string) {
    if (this.discardBtnEl) this.discardBtnEl.textContent = label;
  }
}
