import { App, ButtonComponent, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import type { VoxidianErrorLogEntry } from './logging';
import type { AITranscriptSettings, PromptPreset } from './types';

class PresetImportModal extends Modal {
  private textareaEl?: HTMLTextAreaElement;

  constructor(app: App, private onImport: (value: unknown) => Promise<void> | void) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h3', { text: 'Import JSON preset' });
    contentEl.createEl('p', {
      text: 'Paste a preset JSON exported from Voxidian, or an array of presets.',
    });
    const textarea = contentEl.createEl('textarea', { cls: 'ai-preset-json-textarea' });
    textarea.rows = 10;
    this.textareaEl = textarea;
    const actions = contentEl.createDiv({ cls: 'ai-preset-json-actions' });
    const pasteBtn = actions.createEl('button', { text: 'Paste', type: 'button' });
    const importBtn = actions.createEl('button', { text: 'Import', type: 'button' });
    const cancelBtn = actions.createEl('button', { text: 'Cancel', type: 'button' });
    pasteBtn.addEventListener('click', () => { this.handlePaste(); });
    importBtn.addEventListener('click', () => this.handleImport());
    cancelBtn.addEventListener('click', () => this.close());
  }

  private async handlePaste() {
    if (!this.textareaEl) return;
    try {
      const clipboard = (navigator as any)?.clipboard;
      if (!clipboard?.readText) {
        new Notice('Clipboard paste is not available; paste manually.');
        return;
      }
      const text = await clipboard.readText();
      if (!text) {
        new Notice('Clipboard is empty.');
        return;
      }
      this.textareaEl.value = text;
      this.textareaEl.focus();
    } catch {
      new Notice('Unable to read from clipboard; paste manually.');
    }
  }

  private async handleImport() {
    if (!this.textareaEl) return;
    const raw = this.textareaEl.value.trim();
    if (!raw) {
      new Notice('Paste preset JSON to import.');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      await this.onImport(parsed);
      this.close();
    } catch (e: any) {
      new Notice(`Invalid JSON: ${e?.message ?? e ?? 'Unknown error'}`);
    }
  }
}

export class AITranscriptSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    plugin: Plugin,
    private getSettings: () => AITranscriptSettings,
    private saveSettings: (s: Partial<AITranscriptSettings>) => Promise<void>,
    private getErrorLog?: () => VoxidianErrorLogEntry[],
    private clearErrorLog?: () => Promise<void>,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h1', { text: 'Voxidian' });

    const s = this.getSettings();

    // GROQ
    containerEl.createEl('h3', { text: 'Groq Whisper' });
    new Setting(containerEl)
      .setName('Groq API Key')
      .setDesc('Required to transcribe audio via Groq Whisper.')
      .addText(t => t
        .setPlaceholder('gsk_...')
        .setValue(s.groqApiKey || '')
        .onChange(async (v) => { await this.saveSettings({ groqApiKey: v.trim() }); }));

    new Setting(containerEl)
      .setName('Groq model')
      .setDesc('Default: whisper-large-v3')
      .addText(t => t
        .setValue(s.groqModel)
        .onChange(async (v) => { await this.saveSettings({ groqModel: v.trim() || 'whisper-large-v3' }); }));

    new Setting(containerEl)
      .setName('Language (optional)')
      .setDesc('ISO code like en, es, de. Leave empty for auto.')
      .addText(t => t
        .setValue(s.language || '')
        .onChange(async (v) => { await this.saveSettings({ language: v.trim() || undefined }); }));

    // OpenAI
    containerEl.createEl('h3', { text: 'OpenAI Postprocessing (optional)' });
    new Setting(containerEl)
      .setName('OpenAI API Key')
      .addText(t => t
        .setPlaceholder('sk-...')
        .setValue(s.openaiApiKey || '')
        .onChange(async (v) => { await this.saveSettings({ openaiApiKey: v.trim() }); }));

    new Setting(containerEl)
      .setName('OpenAI model')
      .setDesc('Default: gpt-4o-mini')
      .addText(t => t
        .setValue(s.openaiModel)
        .onChange(async (v) => { await this.saveSettings({ openaiModel: v.trim() || 'gpt-4o-mini' }); }));

    // Gemini
    containerEl.createEl('h3', { text: 'Gemini Postprocessing (optional)' });
    new Setting(containerEl)
      .setName('Gemini API Key')
      .setDesc('Required to postprocess using Gemini.')
      .addText(t => t
        .setPlaceholder('AIza...')
        .setValue(s.geminiApiKey || '')
        .onChange(async (v) => { await this.saveSettings({ geminiApiKey: v.trim() }); }));

    new Setting(containerEl)
      .setName('Gemini model')
      .setDesc('Default: gemini-1.5-flash')
      .addText(t => t
        .setValue(s.geminiModel)
        .onChange(async (v) => { await this.saveSettings({ geminiModel: v.trim() || 'gemini-1.5-flash' }); }));

    new Setting(containerEl)
      .setName('Postprocessing provider')
      .setDesc('Which API to use when applying postprocessing presets.')
      .addDropdown(d => d
        .addOption('openai', 'OpenAI')
        .addOption('gemini', 'Gemini')
        .setValue(s.postprocessingProvider || 'openai')
        .onChange(async (v) => { await this.saveSettings({ postprocessingProvider: v as any }); }));

    // Presets
    containerEl.createEl('h3', { text: 'Prompt presets' });

    const listEl = containerEl.createDiv();
    const renderPresets = () => {
      listEl.empty();
      const st = this.getSettings();
      st.promptPresets.forEach((p) => {
        const wrap = listEl.createDiv({ cls: 'ai-preset' });
        const header = wrap.createDiv({ cls: 'ai-preset-header' });
        const title = header.createDiv({ cls: 'ai-preset-title' });
        title.createEl('h4', { text: p.name, cls: 'ai-preset-name' });
        if (st.defaultPromptId === p.id) title.createSpan({ text: 'Default preset', cls: 'ai-preset-default' });
        const actionsEl = header.createDiv({ cls: 'ai-preset-actions' });
        new ButtonComponent(actionsEl)
          .setButtonText('Set as Default')
          .onClick(async () => {
            await this.saveSettings({ defaultPromptId: p.id });
            renderPresets();
          });
        new ButtonComponent(actionsEl)
          .setIcon('copy')
          .setTooltip('Export preset as JSON')
          .onClick(async () => {
            const exportPreset: PromptPreset = {
              id: p.id,
              name: p.name,
              system: p.system,
              temperature: p.temperature,
              includeTranscriptWithPostprocessed: p.includeTranscriptWithPostprocessed,
              replaceSelection: p.replaceSelection,
              model: p.model,
            };
            const json = JSON.stringify(exportPreset, null, 2);
            try {
              const clipboard = (navigator as any)?.clipboard;
              if (clipboard?.writeText) {
                await clipboard.writeText(json);
                new Notice('Preset JSON copied to clipboard.');
              } else {
                console.log('Voxidian preset JSON:', json);
                new Notice('Clipboard unavailable; JSON logged to console.');
              }
            } catch {
              console.log('Voxidian preset JSON (failed clipboard):', json);
              new Notice('Unable to access clipboard; JSON logged to console.');
            }
          });
        new ButtonComponent(actionsEl)
          .setIcon('trash')
          .setTooltip('Delete preset')
          .setWarning()
          .onClick(async () => {
            const filtered = st.promptPresets.filter(x => x.id !== p.id);
            await this.saveSettings({ promptPresets: filtered });
            renderPresets();
          });
        new Setting(wrap)
          .setName('Name')
          .addText(t => t.setValue(p.name).onChange(async (v) => {
            p.name = v; await this.saveSettings({ promptPresets: st.promptPresets });
          }));
        new Setting(wrap)
          .setName('System prompt')
          .setDesc('Supports {{selection}} placeholder; when absent, current selection is prepended as context.')
          .addTextArea(t => {
            t.setValue(p.system);
            t.inputEl.rows = 6;
            t.inputEl.addClass('ai-system-textarea');
            t.onChange(async (v) => {
              p.system = v; await this.saveSettings({ promptPresets: st.promptPresets });
            });
          });
        new Setting(wrap)
          .setName('Temperature')
          .addText(t => t.setValue(String(p.temperature)).onChange(async (v) => {
            const num = Number(v); p.temperature = isFinite(num) ? num : 0.2; await this.saveSettings({ promptPresets: st.promptPresets });
          }));
        new Setting(wrap)
          .setName('Model override (optional)')
          .addText(t => t.setPlaceholder('e.g., gpt-4o-mini').setValue(p.model || '').onChange(async (v) => {
            p.model = v.trim() || undefined; await this.saveSettings({ promptPresets: st.promptPresets });
          }));
        new Setting(wrap)
          .setName('Include transcript with postprocessed message')
          .setDesc('Prepends the raw transcript quoted with ">" when postprocessing succeeds.')
          .addToggle(t => t
            .setValue(p.includeTranscriptWithPostprocessed ?? true)
            .onChange(async (v) => {
              p.includeTranscriptWithPostprocessed = v;
              await this.saveSettings({ promptPresets: st.promptPresets });
            }));
        new Setting(wrap)
          .setName('Replace selection')
          .setDesc('When enabled, Voxidian replaces the current editor selection with this preset\'s output.')
          .addToggle(t => t
            .setValue(p.replaceSelection ?? (st.insertMode === 'replace'))
            .onChange(async (v) => {
              p.replaceSelection = v;
              await this.saveSettings({ promptPresets: st.promptPresets });
            }));
        // Add some space after each preset
        wrap.createEl('br');

      });
    };

    renderPresets();

    // Add a separator before the Add button
    containerEl.createEl('hr');


    new Setting(containerEl)
      .setName('Add preset')
      .addButton(b => b.setButtonText('Add').onClick(async () => {
        const st = this.getSettings();
        const id = `preset-${Date.now()}`;
        const preset: PromptPreset = { id, name: 'New Preset', system: 'Edit me…', temperature: 0.2, includeTranscriptWithPostprocessed: true };
        await this.saveSettings({ promptPresets: [...st.promptPresets, preset] });
        renderPresets();
      }))
      .addButton(b => b.setButtonText('Import JSON preset').onClick(() => {
        const modal = new PresetImportModal(this.app, async (value) => {
          const st = this.getSettings();
          const existing = [...st.promptPresets];
          const newPresets: PromptPreset[] = [];
          const addOne = (raw: any) => {
            if (!raw || typeof raw !== 'object') return;
            const baseId = typeof raw.id === 'string' && raw.id.trim()
              ? raw.id.trim()
              : `preset-${Date.now()}-${newPresets.length}`;
            const isIdUsed = (id: string) =>
              existing.some(p => p.id === id) || newPresets.some(p => p.id === id);
            let id = baseId;
            let suffix = 1;
            while (isIdUsed(id)) {
              id = `${baseId}-${suffix++}`;
            }
            const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : 'Imported preset';
            const system = typeof raw.system === 'string' && raw.system.trim() ? raw.system : 'Edit me…';
            const temperature = typeof raw.temperature === 'number' && isFinite(raw.temperature) ? raw.temperature : 0.2;
            const includeTranscriptWithPostprocessed =
              typeof raw.includeTranscriptWithPostprocessed === 'boolean'
                ? raw.includeTranscriptWithPostprocessed
                : true;
            const replaceSelection =
              typeof raw.replaceSelection === 'boolean' ? raw.replaceSelection : undefined;
            const model =
              typeof raw.model === 'string' && raw.model.trim() ? raw.model.trim() : undefined;
            newPresets.push({
              id,
              name,
              system,
              temperature,
              includeTranscriptWithPostprocessed,
              replaceSelection,
              model,
            });
          };
          if (Array.isArray(value)) {
            value.forEach(addOne);
          } else {
            addOne(value as any);
          }
          if (!newPresets.length) {
            new Notice('No valid presets found in JSON.');
            return;
          }
          await this.saveSettings({ promptPresets: [...existing, ...newPresets] });
          renderPresets();
          new Notice(
            newPresets.length === 1
              ? 'Imported 1 preset.'
              : `Imported ${newPresets.length} presets.`
          );
        });
        modal.open();
      }));

    // Recording behavior
    containerEl.createEl('h3', { text: 'Recording & Insertion' });
    new Setting(containerEl)
      .setName('Show recording modal')
      .addToggle(t => t.setValue(s.showModalWhileRecording).onChange(async (v) => {
        await this.saveSettings({ showModalWhileRecording: v });
      }));
    new Setting(containerEl)
      .setName('Max duration (seconds)')
      .addText(t => t.setValue(String(s.maxDurationSec)).onChange(async (v) => {
        const n = Number(v); await this.saveSettings({ maxDurationSec: isFinite(n) && n > 0 ? Math.floor(n) : 900 });
      }));
    new Setting(containerEl)
      .setName('Insert mode')
      .setDesc('Insert at cursor or replace selection')
      .addDropdown(d => d
        .addOption('insert', 'Insert at cursor')
        .addOption('replace', 'Replace selection')
        .setValue(s.insertMode)
        .onChange(async (v) => {
          await this.saveSettings({ insertMode: v as any });
          renderPresets();
        }));
    new Setting(containerEl)
      .setName('Add newline before')
      .addToggle(t => t.setValue(s.addNewlineBefore).onChange(async (v) => { await this.saveSettings({ addNewlineBefore: v }); }));
    new Setting(containerEl)
      .setName('Add newline after')
      .addToggle(t => t.setValue(s.addNewlineAfter).onChange(async (v) => { await this.saveSettings({ addNewlineAfter: v }); }));

    // Error log (at the bottom)
    containerEl.createEl('h3', { text: 'Error log' });
    new Setting(containerEl)
      .setName('Clear error log')
      .setDesc('Removes stored Voxidian error entries from this vault.')
      .addButton((b) =>
        b
          .setButtonText('Clear log')
          .setCta()
          .onClick(async () => {
            if (!this.clearErrorLog) return;
            await this.clearErrorLog();
            new Notice('Voxidian error log cleared.');
            this.display();
          }),
      );
    const logContainer = containerEl.createDiv({ cls: 'voxidian-error-log' });
    const log = this.getErrorLog ? this.getErrorLog() : [];
    if (!log || !log.length) {
      logContainer.createEl('p', { text: 'No errors recorded yet.' });
    } else {
      const list = logContainer.createEl('ul', { cls: 'voxidian-error-log-list' });
      const entries = [...log].sort((a, b) => b.ts - a.ts).slice(0, 50);
      for (const entry of entries) {
        const li = list.createEl('li', { cls: 'voxidian-error-log-item' });
        const ts = new Date(entry.ts).toLocaleString();
        const status = typeof entry.status === 'number' ? ` ${entry.status}` : '';
        li.createEl('div', {
          cls: 'voxidian-error-log-meta',
          text: `${ts} — ${entry.source}${status}`,
        });
        if (entry.detail) {
          const pre = li.createEl('pre', { cls: 'voxidian-error-log-detail' });
          pre.textContent = entry.detail;
        }
      }
    }
  }
}
