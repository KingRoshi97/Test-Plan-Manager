---
kid: "KID-LANG-SOL-PATTERN-0003"
title: "Pausable/Emergency Stop Pattern"
type: pattern
pillar: LANGUAGES_AND_LIBRARIES
domains: [solidity_evm]
subdomains: []
tags: [solidity, patterns, pausable, emergency]
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

# Pausable/Emergency Stop Pattern

# Pausable/Emergency Stop Pattern

## Summary
The Pausable/Emergency Stop pattern is a design pattern in Solidity used to temporarily halt critical functionality in a smart contract during unforeseen circumstances, such as security vulnerabilities or operational errors. It provides a mechanism for contract owners or authorized entities to disable specific features, ensuring safety and preventing further damage.

## When to Use
- When developing contracts that handle sensitive operations, such as token transfers, staking, or withdrawals, where halting functionality can mitigate risks during emergencies.
- For contracts deployed in production environments where quick response mechanisms are necessary to address bugs, exploits, or external threats.
- In systems requiring compliance with regulations that may mandate temporary suspension of operations.

## Do / Don't

### Do
- **Implement Access Control:** Ensure only authorized entities (e.g., the contract owner or multisig wallet) can toggle the pause state.
- **Use Modifiers:** Apply `whenNotPaused` or `whenPaused` modifiers to critical functions to enforce the pause logic.
- **Test Thoroughly:** Validate the pausable functionality in unit tests to ensure expected behavior during pause/unpause states.

### Don't
- **Overuse the Pattern:** Avoid pausing trivial functions that don’t pose a significant risk during emergencies.
- **Hardcode Pause Logic:** Use configurable variables instead of hardcoding conditions to allow flexibility in managing the pause state.
- **Ignore Gas Costs:** Be mindful of the additional gas costs introduced by modifiers and state checks.

## Core Content

### Problem
Smart contracts are immutable, meaning their code cannot be changed once deployed. This immutability introduces risks during emergencies, such as security vulnerabilities or operational errors, where immediate remediation is required. Without a mechanism to halt operations, malicious actors or unintended bugs can exploit critical functions, leading to financial losses or system failures.

### Solution
The Pausable/Emergency Stop pattern introduces a state variable (`paused`) that tracks whether the contract is in a paused state. Functions critical to the contract's operation are gated by modifiers (`whenNotPaused` or `whenPaused`) that check the state of the `paused` variable. Only authorized entities can toggle the pause state, ensuring controlled access.

### Implementation Steps
1. **Define the State Variable:**
   ```solidity
   bool private paused;
   ```

2. **Implement Access Control:**
   Use a role-based access control mechanism, such as OpenZeppelin’s `Ownable` or `AccessControl`, to restrict who can toggle the pause state.
   ```solidity
   function pause() external onlyOwner {
       paused = true;
   }

   function unpause() external onlyOwner {
       paused = false;
   }
   ```

3. **Create Modifiers:**
   Define modifiers to enforce pause checks on critical functions.
   ```solidity
   modifier whenNotPaused() {
       require(!paused, "Contract is paused");
       _;
   }

   modifier whenPaused() {
       require(paused, "Contract is not paused");
       _;
   }
   ```

4. **Apply Modifiers to Functions:**
   Use the modifiers on functions that should be restricted during pause/unpause states.
   ```solidity
   function transfer(address to, uint256 amount) external whenNotPaused {
       // Transfer logic
   }
   ```

5. **Test the Implementation:**
   Write unit tests to verify the behavior of the pause/unpause functionality and ensure modifiers enforce the expected restrictions.

### Tradeoffs
- **Benefits:**
  - Provides a safety mechanism to prevent further damage during emergencies.
  - Enables compliance with regulations requiring operational halts.
  - Simple to implement and widely supported by libraries like OpenZeppelin.

- **Drawbacks:**
  - Introduces additional gas costs for modifier checks.
  - Can be misused by malicious or negligent contract owners to disrupt operations.
  - Requires careful access control to prevent unauthorized toggling of the pause state.

### Alternatives
- **Circuit Breaker Pattern:** Similar to the Pausable pattern but often includes finer-grained control over specific functions or subsystems.
- **Upgradeable Contracts:** Use proxy contracts to deploy fixes or disable vulnerable functionality, though this is more complex and requires additional infrastructure.

## Links
- OpenZeppelin's Pausable Contract: A widely-used implementation of the Pausable pattern.
- Circuit Breaker Pattern: A related pattern for halting operations in smart contracts.
- Solidity Documentation on Modifiers: Official documentation explaining function modifiers.
- Access Control in Solidity: Best practices for implementing role-based access control.

## Proof / Confidence
The Pausable/Emergency Stop pattern is a widely recognized best practice in Solidity development, supported by industry-standard libraries like OpenZeppelin. It is commonly used in production contracts, including major DeFi protocols, to mitigate risks during emergencies. OpenZeppelin’s implementation has been audited and battle-tested, providing confidence in its reliability and security.
