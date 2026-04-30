import { DemoBanner } from "@elbtronika/ui";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("DemoBanner", () => {
  it("renders null in live mode", () => {
    const { container } = render(<DemoBanner mode="live" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders demo banner in demo mode", () => {
    render(<DemoBanner mode="demo" version="v0.13.0-demo" />);
    const banner = screen.getByTestId("demo-banner");
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain("Demo Environment");
    expect(banner.textContent).toContain("v0.13.0-demo");
  });

  it("renders staging banner in staging mode", () => {
    render(<DemoBanner mode="staging" />);
    const banner = screen.getByTestId("staging-banner");
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain("Internal Staging");
  });

  it("uses default version when not provided", () => {
    render(<DemoBanner mode="demo" />);
    const banner = screen.getByTestId("demo-banner");
    expect(banner.textContent).toContain("v0.13");
  });

  it("has tooltip explaining demo nature", () => {
    render(<DemoBanner mode="demo" />);
    const banner = screen.getByTestId("demo-banner");
    expect(banner.getAttribute("title")).toBe(
      "This is a fully-functional pitch demo. Real launch coming soon.",
    );
  });
});
