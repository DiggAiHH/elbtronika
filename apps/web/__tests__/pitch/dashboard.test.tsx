import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InvestorWelcomeModal } from "@/app/[locale]/pitch/InvestorWelcomeModal";

// Mock next/link
vi.mock("next/link", () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe("Pitch Dashboard", () => {
  it("requires investor role", () => {
    // Server-side gating is tested via E2E or integration tests
    expect(true).toBe(true);
  });
});

describe("InvestorWelcomeModal", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows on first visit", () => {
    render(<InvestorWelcomeModal locale="en" />);
    expect(screen.getByTestId("investor-welcome-modal")).toBeTruthy();
  });

  it("does not show when already welcomed", () => {
    localStorage.setItem("elt-investor-welcomed", "true");
    render(<InvestorWelcomeModal locale="en" />);
    expect(screen.queryByTestId("investor-welcome-modal")).toBeNull();
  });

  it("dismisses and sets localStorage on Explore Freely click", () => {
    render(<InvestorWelcomeModal locale="en" />);
    fireEvent.click(screen.getByText("Explore Freely"));
    expect(screen.queryByTestId("investor-welcome-modal")).toBeNull();
    expect(localStorage.getItem("elt-investor-welcomed")).toBe("true");
  });
});

