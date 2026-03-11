---
kid: "KID-LANG-SOL-CORE-0003"
title: "Testing Norms (unit tests + forks)"
content_type: "concept"
primary_domain: "["
secondary_domains:
  - "s"
  - "o"
  - "l"
  - "i"
  - "d"
  - "i"
  - "t"
  - "y"
  - "_"
  - "e"
  - "v"
  - "m"
  - "]"
industry_refs: []
stack_family_refs:
  - "language_core"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "s"
  - "o"
  - "l"
  - "i"
  - "d"
  - "i"
  - "t"
  - "y"
  - ","
  - " "
  - "t"
  - "e"
  - "s"
  - "t"
  - "i"
  - "n"
  - "g"
  - ","
  - " "
  - "f"
  - "o"
  - "u"
  - "n"
  - "d"
  - "r"
  - "y"
  - ","
  - " "
  - "f"
  - "o"
  - "r"
  - "k"
  - "s"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/solidity_evm/language_core/KID-LANG-SOL-CORE-0003.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Testing Norms (unit tests + forks)

# Testing Norms (Unit Tests + Forks)

## Summary

Testing in Solidity and the Ethereum Virtual Machine (EVM) domain is critical to ensure the correctness, security, and reliability of smart contracts. Unit tests validate isolated pieces of code, while fork-based testing simulates real-world blockchain states. Together, these approaches create a robust testing framework for decentralized applications (dApps).

---

## When to Use

- **Unit Tests**: Use unit tests during the development of individual smart contract functions to verify correctness and edge-case handling in isolation.
- **Fork-Based Testing**: Use forks when testing interactions with live blockchain data, such as verifying integrations with external protocols, handling real-world token balances, or simulating mainnet conditions without deploying to production.

---

## Do / Don't

### Do
1. **Write unit tests for every public and external function** to ensure correctness and guard against regressions.
2. **Use forks to test interactions with live blockchain data**, such as Uniswap pools or token balances, to ensure compatibility with real-world conditions.
3. **Mock external dependencies in unit tests** to isolate the function under test and avoid unnecessary complexity.

### Don't
1. **Don’t rely solely on fork-based testing**; it is slower and less deterministic than unit tests.
2. **Don’t skip edge-case testing in unit tests**, such as boundary values, underflows, or overflows.
3. **Don’t assume mainnet conditions will remain static**; always refresh forked states to reflect the latest blockchain data.

---

## Core Content

Testing in Solidity and the EVM domain is essential for building secure and reliable smart contracts. Two key testing strategies are **unit tests** and **fork-based testing**. Each serves a distinct purpose and complements the other.

### Unit Tests

Unit tests are designed to test individual functions in isolation. They are executed in a controlled environment, typically using a testing framework like Hardhat or Foundry. Unit tests are fast, deterministic, and ideal for covering edge cases, ensuring that your code behaves as expected under all conditions.

#### Example: Unit Test for a Token Transfer Function
```solidity
function testTransfer() public {
    token.mint(address(this), 1000);
    token.transfer(address(1), 500);
    assertEq(token.balanceOf(address(1)), 500);
    assertEq(token.balanceOf(address(this)), 500);
}
```
This test ensures that the `transfer` function correctly updates balances and handles basic token transfers.

### Fork-Based Testing

Fork-based testing creates a local copy of the blockchain state, allowing developers to test interactions with real-world data. This is especially useful for simulating mainnet conditions without deploying to production. Tools like Hardhat and Foundry support forking from mainnet or testnets.

#### Example: Fork-Based Test for Uniswap Interaction
```solidity
function testSwapOnUniswap() public {
    vm.createFork("https://mainnet.infura.io/v3/YOUR_API_KEY", 17000000); // Fork at block 17,000,000
    vm.selectFork(1); // Use the forked blockchain
    uint256 initialBalance = token.balanceOf(address(this));
    uniswapRouter.swapExactTokensForTokens(100, 0, path, address(this), block.timestamp + 60);
    uint256 finalBalance = token.balanceOf(address(this));
    assert(finalBalance > initialBalance);
}
```
This test verifies that a token swap on Uniswap behaves as expected under real-world conditions.

### Combining Both Approaches

While unit tests are faster and more deterministic, they cannot simulate real-world blockchain states. Fork-based testing, on the other hand, is slower but provides a more accurate representation of mainnet conditions. Combining both approaches ensures comprehensive test coverage.

---

## Links

- **Hardhat Documentation**: Learn how to write unit tests and fork mainnet using Hardhat.
- **Foundry Testing Framework**: Explore Foundry’s advanced testing capabilities, including fork-based testing.
- **Solidity Testing Best Practices**: Guidelines for writing secure and effective tests in Solidity.
- **Uniswap Smart Contract Integration**: Learn how to test interactions with Uniswap’s decentralized exchange.

---

## Proof / Confidence

The importance of unit tests and fork-based testing is supported by industry standards and best practices in blockchain development. Tools like Hardhat and Foundry are widely adopted in the Ethereum ecosystem for their robust testing capabilities. Additionally, major projects like Uniswap, Aave, and Compound rely on similar testing methodologies to ensure the reliability of their smart contracts. Combining unit tests and forks is a proven strategy for achieving comprehensive test coverage.
