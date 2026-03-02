import { describe, it, expect } from "vitest";
import { parseGate } from "../../src/core/gates/dsl.js";

describe("gates/runner", () => {
  it.todo("should parse gate DSL into AST");
  it.todo("should evaluate AND conditions");
  it.todo("should evaluate OR conditions");
  it.todo("should evaluate THRESHOLD conditions");
  it.todo("should produce GateReport with pass/fail");

  it("should throw NotImplementedError", () => {
    expect(() => parseGate({})).toThrow("NotImplementedError");
  });
});
