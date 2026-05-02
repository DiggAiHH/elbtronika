import * as fs from "node:fs";
import * as path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvestorWelcomeModal } from "@/app/[locale]/pitch/InvestorWelcomeModal";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));

const pitchPath = path.join(__dirname, "../../app/[locale]/pitch/page.tsx");
const pitchSource = fs.readFileSync(pitchPath, "utf-8");
const investorModalPath = path.join(__dirname, "../../app/[locale]/pitch/InvestorWelcomeModal.tsx");
const investorModalSource = fs.readFileSync(investorModalPath, "utf-8");

describe("Pitch Dashboard", () => {
  it("requires investor role for access", () => {
    expect(pitchSource).toContain('"investor"');
    expect(pitchSource).toContain('role !== "investor"');
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

  it("dismisses when press link is clicked", () => {
    render(<InvestorWelcomeModal locale="en" />);
    fireEvent.click(screen.getByText("View Press Kit"));
    expect(screen.queryByTestId("investor-welcome-modal")).toBeNull();
    expect(localStorage.getItem("elt-investor-welcomed")).toBe("true");
  });

  it("keeps tour-reset plus locale redirect logic in Take the Tour path", () => {
    expect(investorModalSource).toContain('localStorage.removeItem("elt-tour-dismissed")');
    expect(investorModalSource).toContain("window.location.href = `/${locale}`");
  });
});
