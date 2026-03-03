import type { TestUpdateReport } from "./types.js";
import { isoNow } from "../../utils/time.js";
import { shortHash } from "../../utils/hash.js";

export interface FailureInfo {
  test_id: string;
  failure_cause: string;
  file_path: string;
}

export interface TestResult {
  test_id: string;
  status: "pass" | "fail" | "flake";
  runs: number;
  passes: number;
}

export function addRegressionTests(
  failures: FailureInfo[],
): Array<{ test_id: string; linked_failure: string; path: string }> {
  return failures.map((f) => ({
    test_id: `REG-${shortHash(f.test_id + f.failure_cause)}`,
    linked_failure: f.failure_cause,
    path: f.file_path,
  }));
}

export function triageFlakes(
  testResults: TestResult[],
): Array<{ test_id: string; action: "fixed" | "quarantined" | "skipped"; reason: string }> {
  return testResults
    .filter((t) => t.status === "flake")
    .map((t) => {
      const passRate = t.runs > 0 ? t.passes / t.runs : 0;
      const action: "fixed" | "quarantined" | "skipped" =
        passRate > 0.8 ? "fixed" : passRate > 0.5 ? "quarantined" : "skipped";
      return {
        test_id: t.test_id,
        action,
        reason: `Pass rate ${(passRate * 100).toFixed(0)}% over ${t.runs} runs`,
      };
    });
}

export function assessCoverage(
  suite: { total_tests: number; passing_tests: number },
  target: number,
): { current: number; target: number; delta: number } {
  const current = suite.total_tests > 0 ? (suite.passing_tests / suite.total_tests) * 100 : 0;
  return {
    current: Math.round(current * 100) / 100,
    target,
    delta: Math.round((current - target) * 100) / 100,
  };
}

export function buildTestUpdateReport(
  runId: string,
  failures: FailureInfo[],
  testResults: TestResult[],
  coverageSuite: { total_tests: number; passing_tests: number },
  coverageTarget: number,
): TestUpdateReport {
  return {
    run_id: runId,
    regression_tests_added: addRegressionTests(failures),
    flakes_triaged: triageFlakes(testResults),
    coverage_assessment: assessCoverage(coverageSuite, coverageTarget),
    created_at: isoNow(),
  };
}
