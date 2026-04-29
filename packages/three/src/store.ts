/**
 * Global Zustand store for the 3D canvas layer.
 *
 * ARCHITECTURE NOTE (ADR 0007):
 * – useFrame callbacks MUST NOT call React setState.
 *   Use mutable refs for per-frame data; only commit to store for UI-relevant changes.
 * – Proximity map uses a mutable ref pattern (distanceRef), not reactive state,
 *   to prevent React re-render cascades at 60 FPS.
 * – Mode transitions are co-ordinated here; the DOM layer subscribes with shallow selectors.
 */
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type ThreeMode = "immersive" | "classic" | "transitioning";

export interface RoomConfig {
  id: string;
  slug: string;
  name: string;
  artworkIds: string[];
  sceneConfig?: Record<string, unknown>;
}

export interface ProximityEntry {
  /** distance in Three.js world units from camera to artwork */
  distance: number;
  artworkId: string;
}

export interface ThreeStore {
  /** Current active mode – drives Canvas opacity and pointer-events */
  mode: ThreeMode;
  /** ID of the currently visible room */
  currentRoomId: string | null;
  /** Rooms pushed by route components */
  rooms: RoomConfig[];
  /** Proximity data – written from useFrame, read by audio layer */
  proximity: Map<string, number>;
  /** Camera world position – set each frame, read by HUD */
  cameraPosition: [number, number, number];
  /** Whether asset preload is complete */
  preloaded: boolean;

  // Actions
  setMode: (mode: ThreeMode) => void;
  setCurrentRoom: (id: string | null) => void;
  registerRoom: (room: RoomConfig) => void;
  updateProximity: (artworkId: string, distance: number) => void;
  setCameraPosition: (pos: [number, number, number]) => void;
  setPreloaded: (val: boolean) => void;
}

export const useThreeStore = create<ThreeStore>()(
  subscribeWithSelector((set, get) => ({
    mode: "immersive",
    currentRoomId: null,
    rooms: [],
    proximity: new Map(),
    cameraPosition: [0, 0, 0],
    preloaded: false,

    setMode: (mode) => set({ mode }),
    setCurrentRoom: (id) => set({ currentRoomId: id }),
    registerRoom: (room) => {
      const existing = get().rooms.find((r) => r.id === room.id);
      if (!existing) {
        set((s) => ({ rooms: [...s.rooms, room] }));
      }
    },
    updateProximity: (artworkId, distance) => {
      // Mutate map in-place to avoid object allocation per frame.
      // Subscribers using shallow equality won't re-render from this.
      get().proximity.set(artworkId, distance);
    },
    setCameraPosition: (pos) => set({ cameraPosition: pos }),
    setPreloaded: (val) => set({ preloaded: val }),
  })),
);
