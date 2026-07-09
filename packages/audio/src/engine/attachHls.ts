/**
 * attachHlsToElement – minimal HLS wiring for a VISIBLE audio element.
 *
 * HLSLoader (same directory) owns a hidden element for the spatial engine;
 * this helper instead attaches hls.js to an element the UI controls (e.g. the
 * shop preview player). Safari plays HLS natively; Chrome/Firefox need hls.js
 * — a bare `<audio src="….m3u8">` stays silent there.
 */

import Hls from "hls.js";

export function isHlsUrl(src: string): boolean {
  return /\.m3u8(\?|#|$)/i.test(src);
}

/**
 * Attach an HLS source to an existing <audio>/<video> element.
 * Returns a cleanup function (detaches hls.js / clears the source).
 */
export function attachHlsToElement(
  el: HTMLMediaElement,
  src: string,
  onError?: (err: Error) => void,
): () => void {
  if (el.canPlayType("application/vnd.apple.mpegurl")) {
    // Native HLS (Safari)
    el.src = src;
    return () => {
      el.removeAttribute("src");
      el.load();
    };
  }

  if (!Hls.isSupported()) {
    onError?.(new Error("HLS is not supported in this browser"));
    return () => {};
  }

  const hls = new Hls({ enableWorker: true });
  hls.loadSource(src);
  hls.attachMedia(el);
  if (onError) {
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        onError(new Error(`HLS fatal error: ${data.type}`));
      }
    });
  }

  return () => {
    hls.destroy();
  };
}
