import { describe, it, expect } from "vitest";
import { buildSpec } from "../../src/core/canonical/specBuilder.js";

describe("canonical/specBuilder", () => {
  it.todo("should produce CanonicalSpec from normalized input");
  it.todo("should generate stable entity IDs");
  it.todo("should build cross-map indexes");
  it.todo("should extract unknowns");
  it.todo("should enforce referential integrity");

  it("should throw NotImplementedError", () => {
    expect(() => buildSpec({}, {})).toThrow("NotImplementedError");
  });
});
