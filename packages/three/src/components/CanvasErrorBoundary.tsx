"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for the R3F Canvas.
 * Prevents WebGL/WebGPU crashes from taking down the entire Next.js app.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[CanvasErrorBoundary] R3F crash captured:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0a0a0b",
              color: "rgba(255,255,255,0.55)",
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              zIndex: -1,
            }}
            role="alert"
            aria-label="3D-Ansicht nicht verfügbar"
          >
            <p>3D-Galerie vorübergehend nicht verfügbar. Bitte Seite neu laden.</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
