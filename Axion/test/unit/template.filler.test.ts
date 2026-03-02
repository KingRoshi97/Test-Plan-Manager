import { describe, it, expect } from "vitest";
import { parsePlaceholder } from "../../src/core/templates/filler.js";

describe("templates/filler", () => {
  it.todo("should parse direct placeholders");
  it.todo("should parse array placeholders");
  it.todo("should parse derived placeholders");
  it.todo("should resolve placeholders from spec context");
  it.todo("should handle UNKNOWN_ALLOWED placeholders");

  it("should throw NotImplementedError", () => {
    expect(() => parsePlaceholder("{{spec.meta.spec_id}}")).toThrow("NotImplementedError");
  });
});
