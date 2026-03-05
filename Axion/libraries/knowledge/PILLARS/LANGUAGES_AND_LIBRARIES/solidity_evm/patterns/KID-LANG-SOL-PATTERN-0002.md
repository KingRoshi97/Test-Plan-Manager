---
kid: "KID-LANG-SOL-PATTERN-0002"
title: "Role-Based Access Pattern (contracts)"
type: pattern
pillar: LANGUAGES_AND_LIBRARIES
domains: [solidity_evm]
subdomains: []
tags: [solidity, patterns, access-control, roles]
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

# Role-Based Access Pattern (contracts)

# Role-Based Access Pattern (contracts)

## Summary
The Role-Based Access Pattern is a design approach in Solidity for managing permissions and access control within Ethereum smart contracts. It allows developers to define roles and assign them to specific addresses, enabling granular control over who can execute specific functions. This pattern is essential for ensuring security and preventing unauthorized access to critical contract functionality.

## When to Use
- When your smart contract requires multiple levels of access control (e.g., admin, user, operator).
- When you need to delegate specific permissions to external parties or subsystems.
- When your contract has sensitive functions that should only be accessible by certain entities.
- When managing complex workflows where different roles interact with the contract in predefined ways.

## Do / Don't

### Do
1. **Use libraries like OpenZeppelin's `AccessControl`**: Leverage well-tested libraries to implement role-based access patterns securely.
2. **Define roles explicitly**: Use `bytes32` constants to define roles clearly (e.g., `ADMIN_ROLE`, `MINTER_ROLE`).
3. **Restrict sensitive functions**: Use `require` statements or modifiers to check roles before executing critical functions.

### Don't
1. **Hardcode addresses for access control**: Avoid embedding specific addresses directly in the contract logic; use roles instead for flexibility.
2. **Grant roles without validation**: Ensure role assignments are intentional and validated to avoid accidental privilege escalation.
3. **Overcomplicate role hierarchy**: Keep the role system simple to avoid introducing unnecessary complexity and potential bugs.

## Core Content

### Problem
In Solidity smart contracts, functions are public by default, meaning anyone can call them unless explicitly restricted. This poses security risks, especially for contracts handling sensitive operations like transferring funds, minting tokens, or modifying state variables. Hardcoding access control logic for individual addresses can be inflexible and error-prone, especially as the contract evolves or interacts with external systems.

### Solution
The Role-Based Access Pattern solves this problem by introducing roles as abstractions for access control. Roles are defined as `bytes32` identifiers, and addresses can be assigned or removed from roles dynamically. This approach decouples access control from specific addresses, allowing for scalable and maintainable permission management.

### Implementation Steps

#### Step 1: Import AccessControl
Use OpenZeppelin's `AccessControl` library to simplify role management. Import the library in your contract:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
```

#### Step 2: Define Roles
Create `bytes32` constants for each role:
```solidity
contract MyContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() {
        // Grant the deployer the admin role
        _setupRole(ADMIN_ROLE, msg.sender);
    }
}
```

#### Step 3: Restrict Functions with Roles
Use the `onlyRole` modifier provided by `AccessControl` to restrict access to specific functions:
```solidity
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        // Mint logic
    }

    function setAdmin(address newAdmin) external onlyRole(ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, newAdmin);
    }
```

#### Step 4: Manage Roles Dynamically
Allow the admin to assign or revoke roles dynamically:
```solidity
    function grantMinterRole(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
    }

    function revokeMinterRole(address account) external onlyRole(ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, account);
    }
```

### Tradeoffs
#### Pros:
- **Flexibility**: Roles can be reassigned dynamically, making the contract adaptable.
- **Security**: Fine-grained access control reduces the risk of unauthorized function calls.
- **Maintainability**: Decoupling access control from addresses simplifies upgrades and role management.

#### Cons:
- **Gas Costs**: Managing roles involves additional storage and computation, increasing gas usage.
- **Complexity**: Introducing roles can make the contract logic harder to follow for developers unfamiliar with the pattern.

### Alternatives
- **Ownable Pattern**: For simple access control where only one admin is required, the `Ownable` pattern from OpenZeppelin may suffice.
- **Custom Access Control Logic**: In cases where roles are highly specific or dynamic, implementing custom access control logic may be more appropriate.

## Links
- [OpenZeppelin AccessControl Documentation](https://docs.openzeppelin.com/contracts/4.x/access-control): Comprehensive guide on implementing role-based access control.
- [Solidity Security Best Practices](https://consensys.github.io/smart-contract-best-practices/): Industry standards for secure smart contract development.
- [Ownable Pattern](https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable): Alternative for single-admin access control.

## Proof / Confidence
The Role-Based Access Pattern is widely adopted in the Ethereum ecosystem and supported by OpenZeppelin, a leading library for secure smart contract development. It is used in production-grade projects, including token standards like ERC20 and ERC721, and aligns with best practices for secure and maintainable smart contracts.
