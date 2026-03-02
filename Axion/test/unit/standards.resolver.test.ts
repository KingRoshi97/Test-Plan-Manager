import { describe, it, expect } from "vitest";
import { resolveStandards } from "../../src/core/standards/resolver.js";

describe("standards/resolver", () => {
  it.todo("should select applicable packs from index");
  it.todo("should merge rules with correct precedence");
  it.todo("should block overrides on fixed rules");
  it.todo("should emit conflict log when packs conflict");
  it.todo("should produce deterministic output");

  it("should throw NotImplementedError", () => {
    expect(() => resolveStandards({}, "")).toThrow("NotImplementedError");
  });
});
