export class AudioRecorder {
  private mediaRecorder?: MediaRecorder;
  private chunks: BlobPart[] = [];
  private stream?: MediaStream;
  private startedAt = 0;
  private timer?: number;

  constructor(private onTick?: (elapsedMs: number) => void) {}

  async start(): Promise<void> {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') return;
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeCandidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      ''
    ];
    let mimeType = '';
    for (const cand of mimeCandidates) {
      if (!cand || (window as any).MediaRecorder?.isTypeSupported?.(cand)) { mimeType = cand; break; }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.mediaRecorder.ondataavailable = (e: BlobEvent) => { if (e.data?.size) this.chunks.push(e.data); };
    this.mediaRecorder.start(250); // small chunks
    this.startedAt = Date.now();
    if (this.onTick) this.timer = window.setInterval(() => this.onTick!(Date.now() - this.startedAt), 200);
  }

  async stop(): Promise<Blob> {
    const rec = this.mediaRecorder;
    if (!rec) throw new Error('Recorder not started');
    const stopPromise = new Promise<void>((resolve) => {
      rec.onstop = () => resolve();
    });
    if (rec.state !== 'inactive') rec.stop();
    await stopPromise;
    const blob = new Blob(this.chunks, { type: this.chunks.length ? (this.chunks[0] as any).type || 'audio/webm' : 'audio/webm' });
    this.cleanup();
    return blob;
  }

  discard(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') this.mediaRecorder.stop();
    this.cleanup();
  }

  private cleanup() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = undefined;
    this.mediaRecorder = undefined;
    this.startedAt = 0;
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = undefined;
    }
    this.chunks = [];
  }
}

