---
kid: "KID-LANG-SOL-REF-0001"
title: "Gas Cost Awareness Reference (practical)"
type: reference
pillar: LANGUAGES_AND_LIBRARIES
domains: [solidity_evm]
subdomains: []
tags: [solidity, gas, optimization]
maturity: "reviewed"
use_policy: pattern_only
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# Gas Cost Awareness Reference (practical)

```markdown
# Gas Cost Awareness Reference (Practical)

## Summary

Gas costs in Solidity and the Ethereum Virtual Machine (EVM) directly impact the efficiency and expense of smart contract execution. This reference provides practical guidance for understanding and optimizing gas usage in Solidity development, including key definitions, common pitfalls, and best practices.

## When to Use

- When developing or optimizing Solidity smart contracts to ensure cost-efficiency.
- When debugging high gas consumption in deployed contracts.
- During code reviews to identify and mitigate gas-heavy operations.
- When estimating transaction costs for users of your dApp.

## Do / Don't

### Do
- **Use fixed-size data types**: Favor `uint256` or `uint8` over dynamically sized types like `bytes` or `string` when possible.
- **Minimize state changes**: Group state updates to reduce storage writes.
- **Leverage `calldata` for external function inputs**: Use `calldata` instead of `memory` for function parameters to save gas.

### Don't
- **Don't use loops with unbounded iterations**: Avoid `for` or `while` loops that depend on user input or dynamic array lengths.
- **Don't store redundant data**: Avoid storing data in state variables if it can be derived or calculated on-chain.
- **Don't use expensive operations unnecessarily**: Avoid operations like `SLOAD` or `CREATE2` unless absolutely required.

## Core Content

### Key Definitions
- **Gas**: A unit of computational work in the EVM. Each operation in a smart contract consumes a specific amount of gas.
- **Gas Limit**: The maximum amount of gas a transaction can consume.
- **Gas Price**: The amount of Ether the user is willing to pay per unit of gas.

### Parameters Affecting Gas Cost
1. **Storage Operations**:
   - Writing to storage (`SSTORE`) is one of the most expensive operations, costing up to 20,000 gas.
   - Reading from storage (`SLOAD`) costs 2,100 gas.
2. **Memory vs. Calldata**:
   - Memory allocation costs increase with the size of the data.
   - Calldata is cheaper as it does not require copying data into memory.
3. **Control Flow**:
   - Conditional statements (`if`, `else`) and loops consume gas proportional to the number of iterations or branches executed.
4. **Function Visibility**:
   - External function calls are cheaper than internal calls when passing large data structures.

### Practical Optimization Techniques
1. **Batch Operations**:
   - Combine multiple state changes into a single transaction to reduce gas costs.
   - Example: Instead of updating multiple state variables in separate transactions, group them in one.
2. **Use Events for Logging**:
   - Emit events instead of storing logs on-chain, as logs are cheaper than storage.
3. **Precompute Values**:
   - Store precomputed values if they are reused frequently, but balance this against the cost of additional storage.
4. **Short-Circuit Logic**:
   - Use short-circuiting (`&&` and `||`) to minimize unnecessary evaluations in conditional statements.

### Common Gas Costs (Lookup Table)
| Operation       | Gas Cost      |
|-----------------|---------------|
| `SSTORE` (write)| Up to 20,000  |
| `SLOAD` (read)  | 2,100         |
| `CALL`          | 700           |
| `CREATE`        | 32,000        |
| `ADD`/`SUB`     | 3             |
| `LOG` (event)   | 375 + 8/byte  |

### Configuration Options
- **Optimizer**: Enable the Solidity compiler optimizer (`--optimize`) to reduce gas costs. Use `--optimize-runs` to specify the number of expected contract executions.
- **Gas Estimation Tools**: Use tools like `eth-gas-reporter` or `hardhat-gas-reporter` to measure gas usage during development.

## Links

- **Solidity Documentation**: Official Solidity documentation on gas optimization techniques.
- **EIP-150**: Ethereum Improvement Proposal detailing gas cost changes.
- **Gas Benchmarking Tools**: Tools like `eth-gas-reporter` for real-time gas usage analysis.
- **EVM Opcodes Reference**: Comprehensive list of EVM opcodes and their gas costs.

## Proof / Confidence

This content is based on industry standards outlined in the Solidity documentation, Ethereum Improvement Proposals (EIPs), and benchmarking tools like `eth-gas-reporter`. Best practices are derived from widely accepted patterns in the Ethereum developer community and verified through gas profiling in production environments.
```
