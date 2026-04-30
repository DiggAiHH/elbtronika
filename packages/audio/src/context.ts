/**
 * Global AudioContext singleton with user-gesture unlock.
 *
 * ARCHITECTURE RULES:
 * 1. AudioContext is NEVER created before a user gesture.
 * 2. unlockAudioContext() must be called from a click/tap handler.
 * 3. Session storage persists unlock state across reloads (not localStorage).
 */

const SESSION_KEY = "elt_audio_unlocked";

let audioContext: AudioContext | null = null;

/** Lazy singleton – creates on first call, not on module load. */
export function getAudioContext(): AudioContext {
  if (audioContext === null) {
    try {
      audioContext = new AudioContext({ latencyHint: "interactive" });
    } catch (err) {
      console.error("[audio] Failed to create AudioContext:", err);
      throw new Error("AudioContext not supported in this browser");
    }
  }
  return audioContext;
}

/** Returns true if the context has already been resumed by a user gesture. */
export function isUnlocked(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

/**
 * Resume AudioContext after a user gesture.
 * Idempotent: safe to call multiple times.
 */
export async function unlockAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === "running") {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
    return;
  }
  await ctx.resume();
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, "1");
  }
}

/** Call on app mount to auto-resume if previously unlocked this session. */
export async function tryResumeFromSession(): Promise<void> {
  if (!isUnlocked()) return;
  await unlockAudioContext();
}
