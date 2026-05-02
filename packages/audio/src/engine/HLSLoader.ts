/**
 * HLSLoader – wraps hls.js for audio streaming.
 *
 * SAFARI DEADLOCK PROTECTION:
 * createMediaElementSource() is called ONLY after Hls.Events.MANIFEST_PARSED.
 * This prevents the Safari bug where creating MES before manifest ready
 * causes the audio element to stall permanently.
 */

import Hls from "hls.js";

export interface HLSLoadOptions {
  src: string;
  autoPlay?: boolean;
  onManifestParsed?: () => void;
  onError?: (err: Error) => void;
}

export class HLSLoader {
  private hls: Hls | null = null;
  private audioEl: HTMLAudioElement;
  constructor() {
    this.audioEl = document.createElement("audio");
    this.audioEl.crossOrigin = "anonymous";
    this.audioEl.style.display = "none";
    document.body.appendChild(this.audioEl);
  }

  /** Load an HLS manifest and return the underlying <audio> element. */
  load(opts: HLSLoadOptions): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      if (this.audioEl.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        this.audioEl.src = opts.src;
        this.audioEl.addEventListener(
          "loadedmetadata",
          () => {
            opts.onManifestParsed?.();
            resolve(this.audioEl);
          },
          { once: true },
        );
        this.audioEl.addEventListener(
          "error",
          (e) => {
            opts.onError?.(new Error(`Native HLS error: ${e.type}`));
            reject(e);
          },
          { once: true },
        );
        return;
      }

      if (!Hls.isSupported()) {
        const err = new Error("HLS not supported in this browser");
        opts.onError?.(err);
        reject(err);
        return;
      }

      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxMaxBufferLength: 30,
      });

      this.hls.attachMedia(this.audioEl);

      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this.hls?.loadSource(opts.src);
      });

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        opts.onManifestParsed?.();
        if (opts.autoPlay) {
          this.audioEl.play().catch(() => {});
        }
        resolve(this.audioEl);
      });

      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          const err = new Error(`HLS fatal error: ${data.type}`);
          opts.onError?.(err);
          reject(err);
        }
      });
    });
  }

  /** Destroy hls.js instance and remove audio element. */
  destroy(): void {
    this.hls?.destroy();
    this.audioEl.pause();
    this.audioEl.src = "";
    this.audioEl.remove();
  }

  get audioElement(): HTMLAudioElement {
    return this.audioEl;
  }
}
