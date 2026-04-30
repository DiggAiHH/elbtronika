import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { CanvasRoot } from "./CanvasRoot";

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock R3F Canvas
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
}));

// Mock Drei
vi.mock("@react-three/drei", () => ({
  Preload: () => null,
  AdaptiveDpr: () => null,
  PerformanceMonitor: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Mock store
vi.mock("./store", () => ({
  useThreeStore: (selector: (s: { mode: string }) => string) =>
    selector({ mode: "classic" }),
}));

// Mock feature detection
vi.mock("./hooks/useWebGPUDetection", () => ({
  useWebGPUDetection: () => null,
}));

describe("CanvasRoot", () => {
  it("renders without crashing", () => {
    const { container } = render(<CanvasRoot />);
    expect(container.querySelector("[data-testid='canvas']")).not.toBeNull();
  });

  it("has aria-label for accessibility", () => {
    const { container } = render(<CanvasRoot />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute("aria-label")).toBe("3D Galerie-Ansicht");
    expect(wrapper.getAttribute("role")).toBe("img");
  });
});
