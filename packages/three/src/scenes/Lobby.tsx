"use client";

/**
 * Lobby scene – the entry point to the 3D gallery.
 *
 * Shown on initial load and when no room is active.
 * Contains a central portal leading to Room1.
 */
import { useEffect } from "react";
import { Html } from "@react-three/drei";
import { useThreeStore } from "../store.js";

export function LobbyScene() {
  const currentRoomId = useThreeStore((s) => s.currentRoomId);
  const setCurrentRoom = useThreeStore((s) => s.setCurrentRoom);

  // Register lobby as the default starting room
  useEffect(() => {
    if (!currentRoomId) {
      setCurrentRoom("lobby");
    }
  }, [currentRoomId, setCurrentRoom]);

  return (
    <group>
      {/* Dark atmospheric floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0a0a0b" roughness={1} />
      </mesh>

      {/* Distant fog plane */}
      <fog attach="fog" args={["#0a0a0b", 15, 60]} />

      {/* Ambient + subtle point lights */}
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 3, -2]} intensity={1.5} color="#00f5d4" />
      <pointLight position={[-3, 2, 2]} intensity={0.8} color="#f720b8" />

      {/* Portal marker – click enters Room1 */}
      <mesh
        position={[0, 1.5, -5]}
        onClick={() => setCurrentRoom("room-1")}
      >
        <planeGeometry args={[2.5, 3.5]} />
        <meshStandardMaterial
          color="#00f5d4"
          emissive="#00f5d4"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Label above portal */}
      <Html position={[0, 3.5, -5]} center>
        <div
          style={{
            color: "rgba(0,245,212,0.9)",
            fontSize: "14px",
            fontFamily: "inherit",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            pointerEvents: "none",
          }}
        >
          Enter Gallery
        </div>
      </Html>
    </group>
  );
}
