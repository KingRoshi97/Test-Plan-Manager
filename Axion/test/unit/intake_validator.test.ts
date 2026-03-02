import { describe, it, expect } from "vitest";
import { validateIntake } from "../../src/core/intake/validator.js";

describe("intake/validator", () => {
  it.todo("should return valid for a complete submission");
  it.todo("should return errors for missing required fields");
  it.todo("should enforce skill-level thresholds");
  it.todo("should detect referential integrity violations");
  it.todo("should use locked error code catalog");

  it("should throw NotImplementedError", () => {
    expect(() => validateIntake({}, "1.0.0")).toThrow("NotImplementedError");
  });
});
