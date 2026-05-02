/**
 * useProximityAudio – reads proximity data from ThreeStore and drives
 * spatial audio playback with throttled updates.
 *
 * RULES:
 * - 100ms throttle (NOT 60fps).
 * - Max 10 active streams (hardware node limit).
 * - Fade-in when distance < refDistance, fade-out when > maxDistance + 2s grace.
 * - Reads proximity Map directly (no duplicate state).
 */

import { useEffect, useRef } from "react";
import { HLSLoader } from "../engine/HLSLoader";
import { computeGain, SpatialAudioEngine } from "../engine/SpatialAudioEngine";
import { useAudioStore } from "../store";

interface ProximityEntry {
  artworkId: string;
  distance: number;
  hlsManifestUrl?: string;
  position?: [number, number, number];
}

const THROTTLE_MS = 100;
const MAX_STREAMS = 10;
const REF_DISTANCE = 2;
const MAX_DISTANCE = 50;
const GRACE_MS = 2000;

export function useProximityAudio(
  getProximity: () => Map<string, number>,
  getCameraPosition: () => [number, number, number],
  getCameraOrientation: () => [number, number, number, number, number, number],
  artworks: ProximityEntry[],
) {
  const engineRef = useRef<SpatialAudioEngine | null>(null);
  const loadersRef = useRef<Map<string, HLSLoader>>(new Map());
  const lastActiveRef = useRef<Map<string, number>>(new Map());
  const spatialEnabled = useAudioStore((s) => s.spatialEnabled);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const masterVolume = useAudioStore((s) => s.masterVolume);

  // Initialise engine once
  useEffect(() => {
    engineRef.current = new SpatialAudioEngine({
      refDistance: REF_DISTANCE,
      maxDistance: MAX_DISTANCE,
    });
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  // Update master volume when store changes
  useEffect(() => {
    engineRef.current?.setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Main proximity loop – throttled to 100ms
  useEffect(() => {
    if (!spatialEnabled || !isPlaying) {
      // Pause all loaders
      for (const loader of loadersRef.current.values()) {
        loader.audioElement.pause();
      }
      return;
    }

    const engine = engineRef.current;
    if (!engine) return;

    let rafId = 0;
    let lastTime = 0;

    const tick = (time: number) => {
      rafId = requestAnimationFrame(tick);
      if (time - lastTime < THROTTLE_MS) return;
      lastTime = time;

      const proximity = getProximity();
      const camPos = getCameraPosition();
      engine.setListenerPosition(camPos[0], camPos[1], camPos[2]);

      const camOrient = getCameraOrientation();
      engine.setListenerOrientation(
        camOrient[0],
        camOrient[1],
        camOrient[2],
        camOrient[3],
        camOrient[4],
        camOrient[5],
      );

      const now = Date.now();
      const activeIds = new Set<string>();

      for (const art of artworks) {
        if (!art.hlsManifestUrl) continue;
        const distance = proximity.get(art.artworkId) ?? Infinity;
        const isNear = distance < MAX_DISTANCE;

        if (isNear) {
          activeIds.add(art.artworkId);
          lastActiveRef.current.set(art.artworkId, now);

          // Lazy-create loader
          if (!loadersRef.current.has(art.artworkId)) {
            if (engine.activeCount >= MAX_STREAMS) continue;
            const loader = new HLSLoader();
            loadersRef.current.set(art.artworkId, loader);
            loader
              .load({ src: art.hlsManifestUrl, autoPlay: true })
              .then((audioEl) => {
                engine.addSource(art.artworkId, audioEl, { directional: true });
                if (art.position) {
                  engine.setSourcePosition(
                    art.artworkId,
                    art.position[0],
                    art.position[1],
                    art.position[2],
                  );
                }
              })
              .catch((err: unknown) => {
                console.error(`[useProximityAudio] Failed to load HLS for ${art.artworkId}:`, err);
              });
          } else {
            // Update existing source
            const loader = loadersRef.current.get(art.artworkId);
            if (loader) {
              const gain = computeGain(distance);
              engine.setSourceGain(art.artworkId, gain);
              if (art.position) {
                engine.setSourcePosition(
                  art.artworkId,
                  art.position[0],
                  art.position[1],
                  art.position[2],
                );
              }
              if (loader.audioElement.paused) {
                loader.audioElement.play().catch((err: unknown) => {
                  console.warn(`[useProximityAudio] Play failed for ${art.artworkId}:`, err);
                });
              }
            }
          }
        } else {
          // Check grace period
          const lastActive = lastActiveRef.current.get(art.artworkId) ?? 0;
          if (now - lastActive < GRACE_MS) {
            activeIds.add(art.artworkId);
            const gain = computeGain(distance);
            engine.setSourceGain(art.artworkId, gain);
          } else {
            // Fade out and remove
            engine.setSourceGain(art.artworkId, 0);
            const loader = loadersRef.current.get(art.artworkId);
            if (loader) {
              loader.audioElement.pause();
            }
          }
        }
      }

      // Cleanup streams that are no longer needed
      for (const [id, loader] of loadersRef.current) {
        if (!activeIds.has(id)) {
          engine.removeSource(id);
          loader.destroy();
          loadersRef.current.delete(id);
          lastActiveRef.current.delete(id);
        }
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [spatialEnabled, isPlaying, getProximity, getCameraPosition, getCameraOrientation, artworks]);
}
