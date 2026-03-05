---
kid: "KID-ITTEST-PATTERN-0003"
title: "Property-Based Testing Pattern (high level)"
type: pattern
pillar: IT_END_TO_END
domains:
  - software_delivery
  - testing_qa
subdomains: []
tags: [testing, property-based, generative]
maturity: "reviewed"
use_policy: pattern_only
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# Property-Based Testing Pattern (high level)

# Property-Based Testing Pattern (High Level)

## Summary
Property-Based Testing (PBT) is a testing approach where tests validate the behavior of a system by asserting that certain properties hold true for a wide range of input data. Unlike example-based testing, which checks specific cases, PBT generates inputs automatically and evaluates the system against generalized rules. This pattern helps uncover edge cases and ensures robustness by testing with diverse inputs.

## When to Use
- When the system under test has well-defined properties or invariants that must always hold true (e.g., mathematical algorithms, data transformations, parsers).
- To complement example-based testing by exploring edge cases and unexpected input combinations.
- When the domain of possible inputs is large or complex, making manual test case creation impractical.
- For systems that must handle user-generated or external data, where input variability is high.
- During regression testing to ensure new changes do not violate established properties.

## Do / Don't

### Do:
1. **Define clear, testable properties** that describe the expected behavior of the system.
2. **Use a property-based testing framework** (e.g., Hypothesis for Python, QuickCheck for Haskell, or jqwik for Java) to automate input generation and test execution.
3. **Log failing cases** and minimize them to the smallest reproducible input for debugging.
4. **Combine PBT with example-based testing** to ensure both broad and specific coverage.
5. **Validate assumptions about input constraints** by explicitly encoding them in the property definitions.

### Don’t:
1. **Rely solely on property-based testing** without also using example-based tests for critical or known cases.
2. **Overcomplicate properties**—keep them simple and focused on key invariants to avoid false positives or negatives.
3. **Ignore shrinking** (the process of reducing failing inputs to minimal examples) as it is critical for debugging.
4. **Use PBT for purely UI or visual tests** where properties are hard to define or verify.
5. **Apply PBT to systems with undefined or ambiguous behavior**—it works best with deterministic systems.

## Core Content
Property-Based Testing works by automatically generating a wide range of inputs and verifying that the system satisfies certain properties for all of them. This approach is particularly effective for systems with a large input space or complex edge cases.

### Implementation Steps:
1. **Identify Properties**:
   - Define the invariants or rules that your system must always satisfy. For example, for a sorting function, a property might be: "The output list is sorted, and it contains the same elements as the input list."
   - Properties should be deterministic, unambiguous, and testable.

2. **Choose a PBT Framework**:
   - Select a framework compatible with your programming language (e.g., Hypothesis for Python, QuickCheck for Haskell, jqwik for Java, ScalaCheck for Scala).
   - Ensure the framework supports input generation, shrinking, and reporting.

3. **Generate Inputs**:
   - Use the framework to define the domain of inputs. For example, for a sorting function, the input domain might be lists of integers.
   - Specify constraints if necessary (e.g., "lists with at least 1 element").

4. **Write Property Tests**:
   - Implement tests that validate the properties against the generated inputs. For example:
     ```python
     from hypothesis import given
     from hypothesis.strategies import lists, integers

     @given(lists(integers()))
     def test_sorting_property(input_list):
         sorted_list = my_sort_function(input_list)
         assert sorted_list == sorted(input_list)  # Property: Output is sorted
         assert sorted_list == sorted(input_list)  # Property: Same elements as input
     ```

5. **Run Tests and Debug Failures**:
   - Execute the tests and let the framework generate diverse inputs.
   - When a failure occurs, use the framework's shrinking feature to identify the minimal failing case. For example, if a sorting function fails for `[3, 1, 2]`, shrinking might reduce it to `[2, 1]`.

6. **Iterate**:
   - Refine properties, constraints, and the system under test based on test results.
   - Add new properties as the system evolves.

### Tradeoffs:
- **Advantages**:
  - Uncovers edge cases that might not be considered during manual test design.
  - Reduces the effort of writing and maintaining individual test cases.
  - Improves confidence in the system's robustness across a wide range of inputs.

- **Disadvantages**:
  - Requires upfront effort to define meaningful properties.
  - Debugging failures can be challenging, especially for complex properties.
  - Not suitable for systems with undefined or non-deterministic behavior.

### Example Use Case:
For a financial application that calculates interest rates, a property might be: "The calculated interest is always non-negative." PBT can generate a wide range of inputs (e.g., loan amounts, interest rates, durations) to ensure this property holds.

## Links
- **Example-Based vs. Property-Based Testing**: A comparison of testing approaches and when to use each.
- **Hypothesis Documentation**: Comprehensive guide to using Hypothesis for property-based testing in Python.
- **QuickCheck Paper**: The original research paper introducing QuickCheck and the concept of property-based testing.
- **Test Shrinking Techniques**: An overview of how shrinking works and why it is essential for debugging.

## Proof / Confidence
Property-Based Testing is widely used in industry and academia to improve software reliability. Tools like QuickCheck and Hypothesis are considered standard for testing in functional programming and beyond. Studies and industry reports show that PBT uncovers edge cases missed by traditional testing approaches, making it a valuable addition to any testing strategy.
