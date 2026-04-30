import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WalkthroughTour, resetTour } from "@elbtronika/ui";

describe("WalkthroughTour", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("does not render before delay expires", () => {
    render(<WalkthroughTour delayMs={5000} />);
    expect(screen.queryByTestId("walkthrough-tour")).toBeNull();
  });

  it("renders after delay expires", async () => {
    render(<WalkthroughTour delayMs={0} />);
    await waitFor(() => {
      expect(screen.getByTestId("walkthrough-tour")).toBeTruthy();
    });
  });

  it("uses default German steps", async () => {
    render(<WalkthroughTour delayMs={0} locale="de" />);
    await waitFor(() => {
      expect(screen.getByText("Willkommen")).toBeTruthy();
    });
  });

  it("uses default English steps when locale is en", async () => {
    render(<WalkthroughTour delayMs={0} locale="en" />);
    await waitFor(() => {
      expect(screen.getByText("Welcome")).toBeTruthy();
    });
  });

  it("uses custom steps when provided", async () => {
    const customSteps = [
      { title: "Custom Step 1", description: "Description 1" },
      { title: "Custom Step 2", description: "Description 2" },
    ];
    render(<WalkthroughTour delayMs={0} steps={customSteps} />);
    await waitFor(() => {
      expect(screen.getByText("Custom Step 1")).toBeTruthy();
    });
  });

  it("advances to next step on Next click", async () => {
    render(<WalkthroughTour delayMs={0} locale="de" />);
    await waitFor(() => {
      expect(screen.getByText("Willkommen")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Weiter"));
    await waitFor(() => {
      expect(screen.getByText("3D-Navigation")).toBeTruthy();
    });
  });

  it("dismisses on Skip click", async () => {
    render(<WalkthroughTour delayMs={0} locale="de" />);
    await waitFor(() => {
      expect(screen.getByTestId("walkthrough-tour")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Tour überspringen"));
    await waitFor(() => {
      expect(screen.queryByTestId("walkthrough-tour")).toBeNull();
    });
  });

  it("does not render when previously dismissed", async () => {
    localStorage.setItem("elt-tour-dismissed", "true");
    render(<WalkthroughTour delayMs={0} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByTestId("walkthrough-tour")).toBeNull();
  });

  it("completes tour on last step Next click", async () => {
    const steps = [{ title: "Only Step", description: "Desc" }];
    render(<WalkthroughTour delayMs={0} steps={steps} locale="en" />);
    await waitFor(() => {
      expect(screen.getByText("Only Step")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Done"));
    await waitFor(() => {
      expect(screen.queryByTestId("walkthrough-tour")).toBeNull();
    });
  });

  it("resetTour clears localStorage", () => {
    localStorage.setItem("elt-tour-dismissed", "true");
    resetTour();
    expect(localStorage.getItem("elt-tour-dismissed")).toBeNull();
  });

  it("dismisses on backdrop click", async () => {
    render(<WalkthroughTour delayMs={0} locale="de" />);
    await waitFor(() => {
      expect(screen.getByTestId("walkthrough-tour")).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId("walkthrough-tour"));
    await waitFor(() => {
      expect(screen.queryByTestId("walkthrough-tour")).toBeNull();
    });
  });
});
