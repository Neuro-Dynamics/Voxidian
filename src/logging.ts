export type VoxidianErrorSource = 'Groq' | 'OpenAI' | 'Gemini';

export interface VoxidianErrorLogEntry {
  ts: number;
  source: VoxidianErrorSource;
  status?: number;
  detail?: string;
}

let errorLogSink: ((entry: VoxidianErrorLogEntry) => void) | undefined;

export function registerErrorLogSink(fn: (entry: VoxidianErrorLogEntry) => void): void {
  errorLogSink = fn;
}

export function logError(source: VoxidianErrorSource, status: number, detail: string): void {
  const entry: VoxidianErrorLogEntry = {
    ts: Date.now(),
    source,
    status,
    detail,
  };
  try {
    const w = window as any;
    if (!Array.isArray(w.VoxidianErrorLog)) {
      w.VoxidianErrorLog = [];
    }
    w.VoxidianErrorLog.push(entry);
  } catch {
    // Non-browser environment; ignore.
  }
  try {
    if (errorLogSink) errorLogSink(entry);
  } catch (e) {
    console.error('[Voxidian] error log sink failed', e);
  }
  console.warn('[Voxidian]', source, 'error', status, detail || '<no-body>');
}

