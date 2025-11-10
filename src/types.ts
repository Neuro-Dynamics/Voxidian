export type InsertMode = 'insert' | 'replace';

export interface PromptPreset {
  id: string;
  name: string;
  system: string;
  temperature: number;
  model?: string; // optional OpenAI model override
}

export interface AITranscriptSettings {
  groqApiKey: string;
  groqModel: string; // e.g., 'whisper-large-v3'
  language?: string; // ISO code, optional

  openaiApiKey?: string;
  openaiModel: string; // e.g., 'gpt-4o-mini'

  promptPresets: PromptPreset[];
  defaultPromptId?: string;
  lastUsedPromptId?: string;

  showModalWhileRecording: boolean;
  maxDurationSec: number;
  insertMode: InsertMode;
  addNewlineBefore: boolean;
  addNewlineAfter: boolean;
  includeTranscriptWithPostprocessed: boolean;
}

export const DEFAULT_PRESET: PromptPreset = {
  id: 'polished',
  name: 'Polished',
  system:
    'You clean up spoken text. Fix capitalization and punctuation, remove filler words, preserve meaning. Do not add content.',
  temperature: 0.2,
};

export const DEFAULT_SETTINGS: AITranscriptSettings = {
  groqApiKey: '',
  groqModel: 'whisper-large-v3',
  language: undefined,

  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',

  promptPresets: [DEFAULT_PRESET],
  defaultPromptId: 'polished',
  lastUsedPromptId: 'polished',

  showModalWhileRecording: true,
  maxDurationSec: 900,
  insertMode: 'insert',
  addNewlineBefore: false,
  addNewlineAfter: true,
  includeTranscriptWithPostprocessed: false,
};
