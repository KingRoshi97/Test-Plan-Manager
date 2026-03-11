---
kid: "KID-LANG-SOL-PATTERN-0001"
title: "Checks-Effects-Interactions Pattern"
content_type: "pattern"
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
  - "patterns"
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
  - "p"
  - "a"
  - "t"
  - "t"
  - "e"
  - "r"
  - "n"
  - "s"
  - ","
  - " "
  - "r"
  - "e"
  - "e"
  - "n"
  - "t"
  - "r"
  - "a"
  - "n"
  - "c"
  - "y"
  - "-"
  - "g"
  - "u"
  - "a"
  - "r"
  - "d"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/solidity_evm/patterns/KID-LANG-SOL-PATTERN-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Checks-Effects-Interactions Pattern

# Checks-Effects-Interactions Pattern

## Summary
The Checks-Effects-Interactions pattern is a best practice in Solidity development used to prevent reentrancy attacks and ensure safe contract interactions. It enforces a structured approach where state changes (effects) are made before external calls (interactions), minimizing the risk of malicious behavior. This pattern is critical for writing secure and predictable smart contracts on the Ethereum Virtual Machine (EVM).

---

## When to Use
- When your smart contract interacts with external contracts or user-controlled addresses.
- When transferring Ether or tokens to external addresses.
- When designing contracts that modify state variables before making external calls.
- In any scenario where reentrancy vulnerabilities might arise due to external contract behavior.

---

## Do / Don't

### Do:
1. **Do validate inputs first (Checks):** Ensure that all preconditions, such as sender permissions, balances, or input ranges, are verified before proceeding.
2. **Do update state variables before external calls (Effects):** Modify contract state (e.g., balances or flags) before making any external interactions.
3. **Do minimize external calls:** Keep external calls to a minimum and avoid relying on external contract behavior.

### Don't:
1. **Don't call external contracts before updating state:** This can leave your contract vulnerable to reentrancy attacks.
2. **Don't assume external calls will always succeed:** External contracts may fail or behave unpredictably, so always handle failures gracefully.
3. **Don't use low-level calls (`call`, `delegatecall`) without fallback handling:** These can introduce additional risks if not implemented carefully.

---

## Core Content

### Problem
In Solidity, external calls to other contracts or addresses can introduce vulnerabilities, especially reentrancy attacks. A reentrancy attack occurs when an external contract calls back into the original contract before the initial execution is complete, potentially manipulating state in unintended ways. Without proper safeguards, attackers can exploit this to drain funds or corrupt state.

### Solution
The Checks-Effects-Interactions pattern mitigates this risk by enforcing a strict order of operations:
1. **Checks:** Validate all inputs and preconditions before proceeding.
2. **Effects:** Update the contract's internal state to reflect the intended changes.
3. **Interactions:** Make external calls only after the state has been updated.

This order ensures that even if an external call reenters the contract, the internal state remains consistent and cannot be exploited.

### Implementation Steps
1. **Validate Preconditions (Checks):**
   - Verify user permissions, balances, or other requirements.
   - Use `require` statements to enforce conditions.
   ```solidity
   require(balances[msg.sender] >= amount, "Insufficient balance");
   ```

2. **Update State Variables (Effects):**
   - Adjust internal state to reflect the intended operation.
   - For example, deduct the sender's balance before transferring funds.
   ```solidity
   balances[msg.sender] -= amount;
   ```

3. **Make External Calls (Interactions):**
   - Interact with external contracts or transfer Ether only after the state has been updated.
   - Use `call` or `transfer` carefully, and handle failures.
   ```solidity
   (bool success, ) = recipient.call{value: amount}("");
   require(success, "Transfer failed");
   ```

### Example
Below is a simple implementation of the Checks-Effects-Interactions pattern:

```solidity
pragma solidity ^0.8.0;

contract SecureContract {
    mapping(address => uint256) public balances;

    function withdraw(uint256 amount) public {
        // Checks
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Effects
        balances[msg.sender] -= amount;

        // Interactions
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    receive() external payable {
        balances[msg.sender] += msg.value;
    }
}
```

### Tradeoffs
- **Pros:**
  - Reduces the risk of reentrancy attacks.
  - Ensures predictable and secure contract behavior.
- **Cons:**
  - May require additional gas due to structured implementation.
  - Limits flexibility in certain complex contract designs.

### When to Use Alternatives
- If your contract does not make external calls or handle Ether, this pattern may not be necessary.
- For contracts requiring advanced interaction logic, consider using reentrancy guards (`ReentrancyGuard` from OpenZeppelin) as an additional layer of protection.

---

## Links
- **Reentrancy Attacks:** Learn about reentrancy vulnerabilities and how they occur in Solidity contracts.
- **Solidity Security Best Practices:** A comprehensive guide to writing secure smart contracts.
- **OpenZeppelin ReentrancyGuard:** A utility contract for preventing reentrant calls.
- **Solidity Documentation on `call`:** Official Solidity documentation for low-level calls.

---

## Proof / Confidence
The Checks-Effects-Interactions pattern is widely recognized as a standard practice in Solidity development. It is recommended in the official Solidity documentation and employed in industry-standard libraries like OpenZeppelin. High-profile incidents, such as the 2016 DAO hack, underscore the importance of using this pattern to prevent reentrancy vulnerabilities.
