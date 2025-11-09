Obsidian Plugin API — Quick References

Core Classes/Interfaces
- `Plugin`: base for your plugin. Lifecycle: `onload`, `onunload`.
- `Modal`: lightweight modal dialog UI; override `onOpen`/`onClose`.
- `PluginSettingTab` + `Setting`: build settings UI in Preferences.
- `MarkdownView`: access the active editor for the current note.
- `Editor` (interface): text operations (`getSelection`, `replaceSelection`, `replaceRange`, `getCursor`).

Typical Imports (TypeScript)
```ts
import { App, Plugin, PluginSettingTab, Setting, Modal, MarkdownView } from 'obsidian';
```

Commands & Hotkeys
```ts
this.addCommand({
  id: 'voxidian-toggle-recording',
  name: 'Start/Stop Recording',
  hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'M' }],
  callback: () => this.toggleRecording(),
});
```

Ribbon Button
```ts
this.addRibbonIcon('microphone', 'Record & Transcribe', () => this.toggleRecording());
```

Active Editor & Insertion
```ts
const view = this.app.workspace.getActiveViewOfType(MarkdownView);
if (!view) throw new Error('No active Markdown editor');
const editor = view.editor;
// Replace selection or insert at cursor
if (editor.somethingSelected()) editor.replaceSelection(text);
else editor.replaceRange(text, editor.getCursor());
```

Recording Modal Skeleton
```ts
class RecordingModal extends Modal {
  constructor(app: App, private opts: {
    onStop: (applyPost: boolean, presetId?: string) => void,
    onDiscard: () => void,
    presets: { id: string; name: string }[],
    defaultPresetId?: string,
  }) { super(app); }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h3', { text: 'Recording…' });
    // render dropdown, timer, Stop & Transcribe / Discard buttons
  }
}
```

Settings Tab Skeleton
```ts
class AITranscriptSettingTab extends PluginSettingTab {
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'AI Transcript Settings' });
    new Setting(containerEl)
      .setName('Groq API Key')
      .addText(t => t.setPlaceholder('gsk_…').onChange(v => {/* save */}));
    // add OpenAI key, models, presets list, etc.
  }
}
```

Reference Links (downloaded locally)
- Getting Started: `docs/sources/obsidian/build_a_plugin.html`
- Manifests: `docs/sources/obsidian/manifests.html`
- API TypeDoc (HTML stubs saved): `docs/sources/obsidian/Plugin.html`, `Modal.html`, `PluginSettingTab.html`, `MarkdownView.html`, `Editor.html`

