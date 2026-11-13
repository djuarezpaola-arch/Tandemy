import { describe, expect, it } from "vitest";
import { findShowcaseProjectByTitle, SHOWCASE_PROJECTS } from "@/lib/tandemy-showcase";

describe("SHOWCASE_PROJECTS", () => {
  it("contains all 7 initial Tandemy showcase projects with valid metadata", () => {
    expect(SHOWCASE_PROJECTS).toHaveLength(7);
    for (const project of SHOWCASE_PROJECTS) {
      expect(project.ownerId).toBe("demo-pyme");
      expect(project.status).toBe("open");
      expect(project.budget).toBeGreaterThanOrEqual(100);
      expect(project.title.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("matches showcase project titles case-insensitively", () => {
    const found = findShowcaseProjectByTitle("  orden de costos para una cafetería ");
    expect(found?.id).toBe("demo-cafe-aroma-costos");
    expect(findShowcaseProjectByTitle("Proyecto inexistente")).toBeNull();
  });
});
