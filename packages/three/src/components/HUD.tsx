"use client";

/**
 * GalleryHUD – DOM overlay for minimap and room navigation indicator.
 *
 * ARCHITECTURE NOTE (ADR 0007):
 * This is a pure DOM component (NOT R3F), mounted inside the locale layout.
 * It subscribes to the ThreeStore for camera position and current room.
 * Renders only when mode === "immersive".
 */
import { useThreeStore } from "../store";

export function GalleryHUD() {
  const mode = useThreeStore((s) => s.mode);
  const rooms = useThreeStore((s) => s.rooms);
  const currentRoomId = useThreeStore((s) => s.currentRoomId);
  const cameraPosition = useThreeStore((s) => s.cameraPosition);

  if (mode !== "immersive") return null;

  const currentRoom = rooms.find((r) => r.id === currentRoomId);

  return (
    <div
      aria-label="Gallery navigation"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        pointerEvents: "none",
      }}
    >
      {/* Room label */}
      {currentRoom && (
        <div
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontFamily: "inherit",
          }}
        >
          {currentRoom.name}
        </div>
      )}

      {/* Minimap dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {rooms.map((room) => (
          <div
            key={room.id}
            title={room.name}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: room.id === currentRoomId ? "#00f5d4" : "rgba(255,255,255,0.25)",
              boxShadow: room.id === currentRoomId ? "0 0 6px #00f5d4" : "none",
              transition: "background 0.3s ease, box-shadow 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Scroll progress indicator */}
      <div
        style={{
          width: 120,
          height: 2,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "#00f5d4",
            width: `${Math.round(cameraPosition[2] * 10)}%`,
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </div>
  );
}
