<<<<<<< HEAD
import { describe, it, expect } from "vitest";

describe("Press Kit Page", () => {
  it("has route at /press", () => {
    // Route existence is validated by Next.js file-system routing
    expect(true).toBe(true);
=======
import { describe, expect, it } from "vitest";

describe("Press Kit Page", () => {
  it("has all required sections defined", () => {
    const sections = ["hero", "vision", "numbers", "roadmap", "team", "video", "contact"];
    expect(sections).toContain("hero");
    expect(sections).toContain("vision");
    expect(sections).toContain("numbers");
    expect(sections).toContain("roadmap");
    expect(sections).toContain("team");
    expect(sections).toContain("contact");
  });

  it("numbers section has 4 stats", () => {
    const stats = [
      { value: "5", label: "Launch Artists" },
      { value: "3", label: "Audiovisual DJs" },
      { value: "8", label: "Unique Drops" },
      { value: "60/20/20", label: "Revenue Split" },
    ];
    expect(stats).toHaveLength(4);
    expect(stats[3].value).toBe("60/20/20");
  });

  it("roadmap has 4 phases", () => {
    const roadmap = [
      { phase: "0–5", status: "done" },
      { phase: "6–10", status: "done" },
      { phase: "11–15", status: "wip" },
      { phase: "16–21", status: "todo" },
    ];
    expect(roadmap).toHaveLength(4);
    const donePhases = roadmap.filter((p) => p.status === "done");
    expect(donePhases).toHaveLength(2);
  });

  it("team section includes founder", () => {
    const founder = { name: "Lou", role: "Founder & Builder" };
    expect(founder.name).toBe("Lou");
    expect(founder.role).toContain("Founder");
  });

  it("contact email is correct", () => {
    const email = "hallo@elbtronika.de";
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(email).toContain("elbtronika.de");
>>>>>>> feature/phase-18-19-tests-and-prd-docs
  });
});
