---
kid: "KID-LANG-SOL-SEC-0002"
title: "Common Vulnerabilities Reference (reentrancy, access control)"
type: reference
pillar: LANGUAGES_AND_LIBRARIES
domains: [solidity_evm]
subdomains: []
tags: [solidity, security, reentrancy, access-control]
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

# Common Vulnerabilities Reference (reentrancy, access control)

# Common Vulnerabilities Reference (Reentrancy, Access Control)

## Summary
Reentrancy and access control vulnerabilities are critical security concerns in Solidity and Ethereum Virtual Machine (EVM) development. Reentrancy occurs when a contract's external call allows malicious re-entry into its execution flow, while access control flaws arise from improper permission management. Both vulnerabilities can lead to unauthorized fund transfers, data manipulation, or contract compromise.

---

## When to Use
- **Reentrancy:** When designing contracts that interact with external contracts or users, especially those involving token transfers, Ether withdrawals, or external callbacks.
- **Access Control:** When implementing role-based permissions, managing administrative functions, or restricting sensitive operations to specific users.

---

## Do / Don't

### Do:
1. **Use `Checks-Effects-Interactions` Pattern:** Ensure state changes occur before external calls to minimize reentrancy risks.
2. **Implement `ReentrancyGuard`:** Use OpenZeppelin's `ReentrancyGuard` or similar mechanisms to prevent multiple entries into critical functions.
3. **Validate Permissions:** Use `require` statements or modifiers like `onlyOwner` to enforce access control.

### Don't:
1. **Don't Trust External Calls:** Avoid assuming external contract behavior; malicious contracts can exploit vulnerabilities.
2. **Don't Hardcode Addresses:** Use configurable parameters for privileged addresses to avoid hardcoding and potential errors.
3. **Don't Overlook Fallback Functions:** Ensure fallback functions are secure and cannot be exploited for unauthorized access or reentrancy.

---

## Core Content

### Reentrancy Vulnerability
Reentrancy occurs when a contract makes an external call to another contract, and the external contract calls back into the original contract before its execution completes. This can lead to unexpected state changes or fund depletion. 

#### Example:
```solidity
function withdraw(uint amount) public {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    (bool success,) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
    balances[msg.sender] -= amount; // Vulnerable: State change occurs after external call
}
```

#### Mitigation:
- **Checks-Effects-Interactions Pattern:** Update contract state before making external calls.
- **ReentrancyGuard:** Use libraries like OpenZeppelin's `ReentrancyGuard` to prevent nested calls:
```solidity
contract SecureContract is ReentrancyGuard {
    function withdraw(uint amount) public nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
```

---

### Access Control Vulnerability
Access control flaws occur when privileged operations are not properly restricted, allowing unauthorized users to execute sensitive functions.

#### Example:
```solidity
function setAdmin(address _admin) public {
    admin = _admin; // Vulnerable: No access control
}
```

#### Mitigation:
- **Role-Based Access Control:** Use modifiers to restrict access:
```solidity
address private admin;

modifier onlyAdmin() {
    require(msg.sender == admin, "Not authorized");
    _;
}

function setAdmin(address _admin) public onlyAdmin {
    admin = _admin;
}
```
- **Use Libraries:** OpenZeppelin's `AccessControl` provides robust role management:
```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract RoleBasedAccess is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor() {
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function setAdmin(address _admin) public onlyRole(ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, _admin);
    }
}
```

---

## Links
- **OpenZeppelin ReentrancyGuard:** A widely used library for preventing reentrancy attacks.
- **Solidity Documentation - Security Considerations:** Official guidelines for secure contract development.
- **EVM Security Best Practices:** Industry standards for mitigating vulnerabilities in Ethereum-based applications.
- **Access Control Patterns:** Design patterns for implementing secure role-based permissions.

---

## Proof / Confidence
Reentrancy and access control vulnerabilities are well-documented in the Ethereum ecosystem, with notable incidents like the DAO hack (2016) highlighting their impact. OpenZeppelin libraries and industry best practices are widely adopted for mitigation, supported by audits and security benchmarks from leading blockchain firms such as ConsenSys Diligence and Trail of Bits.
