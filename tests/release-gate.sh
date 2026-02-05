#!/bin/bash
# AXION Release Gate
# Run this before considering any upgrade complete.
# All checks must pass for the release gate to succeed.

set -e

echo "============================================"
echo "        AXION RELEASE GATE"
echo "============================================"
echo ""

FAILED=0
PASSED=0
LOGDIR="/tmp/release-gate-logs"
mkdir -p "$LOGDIR"

run_check() {
    local name="$1"
    local command="$2"
    local logfile="$LOGDIR/${name}.log"
    
    echo -n "  [$name] ... "
    
    if timeout 120 bash -c "$command" > "$logfile" 2>&1; then
        echo "✅ PASS"
        ((PASSED++)) || true
    else
        echo "❌ FAIL (see $logfile)"
        ((FAILED++)) || true
    fi
}

echo "1. Core Contract Tests"
echo "   (Pipeline order, blocked_by, stdout JSON)"
run_check "core-contracts" "npx vitest run tests/core --passWithNoTests --testTimeout=60000"

echo ""
echo "2. Unit Tests"
echo "   (Individual script validation)"
run_check "unit-tests" "npx vitest run tests/unit --passWithNoTests --testTimeout=30000"

echo ""
echo "3. Integration Tests"
echo "   (Module dependencies, pipeline flow)"
run_check "integration-tests" "npx vitest run tests/integration --passWithNoTests --testTimeout=30000"

echo ""
echo "4. Validation Tests"
echo "   (Scripts, templates, config files)"
run_check "validation-tests" "npx vitest run tests/validation --passWithNoTests --testTimeout=30000"

echo ""
echo "5. End-to-End Tests"
echo "   (Full workflows: kit-create → verify)"
run_check "e2e-tests" "npx vitest run tests/e2e --passWithNoTests --testTimeout=60000"

echo ""
echo "5b. E2E Two-Root Golden Path"
echo "   (Real workflow: kit → scaffold → build → test → activate)"
run_check "e2e-golden" "npx vitest run tests/suites/e2e.two-root.test.ts --passWithNoTests --testTimeout=180000"

echo ""
echo "6. Doctor Extension Tests"
echo "   (Active build, pollution, run lock checks)"
run_check "doctor-tests" "npx vitest run tests/suites/doctor-extensions.test.ts --passWithNoTests --testTimeout=60000"

echo ""
echo "7. Documentation Drift Check"
echo "   (Script inventory, contamination scan)"
run_check "docs-check" "npx tsx axion/scripts/axion-docs-check.ts --json"

echo ""
echo "8. No Pollution Check"
echo "   (No writes into system root)"
run_check "no-pollution" "test ! -d ./axion/test-output"

echo ""
echo "============================================"
echo "        RELEASE GATE SUMMARY"
echo "============================================"
echo ""
echo "  Passed: $PASSED"
echo "  Failed: $FAILED"
echo "  Logs:   $LOGDIR/"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ RELEASE GATE PASSED"
    echo ""
    echo "Safe to proceed with:"
    echo "  - Flip feature flags on"
    echo "  - Update CHANGELOG.md"
    echo "  - Mark change contract as Implemented"
    exit 0
else
    echo "❌ RELEASE GATE FAILED"
    echo ""
    echo "Review logs for details:"
    for logfile in "$LOGDIR"/*.log; do
        if [ -f "$logfile" ]; then
            echo "  - $logfile"
        fi
    done
    exit 1
fi
