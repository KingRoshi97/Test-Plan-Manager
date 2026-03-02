import { describe, it, expect } from "vitest";
import { generateWorkBreakdown } from "../../src/core/planning/workBreakdown.js";

describe("planning/workBreakdown", () => {
  it.todo("should decompose spec into work units");
  it.todo("should assign stable unit IDs");
  it.todo("should map units to scope refs");
  it.todo("should track dependencies between units");

  it("should throw NotImplementedError", () => {
    expect(() => generateWorkBreakdown("", {})).toThrow("NotImplementedError");
  });
});
