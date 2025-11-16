import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import type { AITranscriptSettings, PromptPreset } from './types';

export class AITranscriptSettingTab extends PluginSettingTab {
  constructor(app: App, plugin: Plugin, private getSettings: () => AITranscriptSettings, private saveSettings: (s: Partial<AITranscriptSettings>) => Promise<void>) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Voxidian' });

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
    new Setting(containerEl)
      .setName('Include transcript with postprocessed message')
      .setDesc('Prepends the raw transcript quoted with ">" when postprocessing succeeds.')
      .addToggle(t => t
        .setValue(s.includeTranscriptWithPostprocessed)
        .onChange(async (v) => { await this.saveSettings({ includeTranscriptWithPostprocessed: v }); }));

    // Presets
    containerEl.createEl('h4', { text: 'Prompt presets' });

    const listEl = containerEl.createDiv();
    const renderPresets = () => {
      listEl.empty();
      const st = this.getSettings();
      st.promptPresets.forEach((p) => {
        const wrap = listEl.createDiv({ cls: 'ai-preset' });
        if (st.defaultPromptId === p.id) wrap.createDiv({ text: 'Default preset', cls: 'ai-preset-default' });
        new Setting(wrap)
          .setName(p.name)
          .setDesc('System prompt + temperature')
          .addButton(b => b.setButtonText('Set as Default').onClick(async () => {
            await this.saveSettings({ defaultPromptId: p.id });
            renderPresets();
          }))
          .addButton(b => b.setButtonText('Delete').onClick(async () => {
            const filtered = st.promptPresets.filter(x => x.id !== p.id);
            await this.saveSettings({ promptPresets: filtered });
            renderPresets();
          }));
        new Setting(wrap)
          .setName('Name')
          .addText(t => t.setValue(p.name).onChange(async (v) => {
            p.name = v; await this.saveSettings({ promptPresets: st.promptPresets });
          }));
        new Setting(wrap)
          .setName('System prompt')
          .setDesc('Supports {{selection}} placeholder; when absent, current selection is prepended as context.')
          .addTextArea(t => t.setValue(p.system).onChange(async (v) => {
            p.system = v; await this.saveSettings({ promptPresets: st.promptPresets });
          }));
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

      });
    };

    renderPresets();

    new Setting(containerEl)
      .setName('Add preset')
      .addButton(b => b.setButtonText('Add').onClick(async () => {
        const st = this.getSettings();
        const id = `preset-${Date.now()}`;
        const preset: PromptPreset = { id, name: 'New Preset', system: 'Edit me…', temperature: 0.2 };
        await this.saveSettings({ promptPresets: [...st.promptPresets, preset] });
        renderPresets();
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
        .onChange(async (v) => { await this.saveSettings({ insertMode: v as any }); }));
    new Setting(containerEl)
      .setName('Add newline before')
      .addToggle(t => t.setValue(s.addNewlineBefore).onChange(async (v) => { await this.saveSettings({ addNewlineBefore: v }); }));
    new Setting(containerEl)
      .setName('Add newline after')
      .addToggle(t => t.setValue(s.addNewlineAfter).onChange(async (v) => { await this.saveSettings({ addNewlineAfter: v }); }));
  }
}
