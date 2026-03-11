---
kid: "KID-LANG-SOL-CORE-0002"
title: "Contract Architecture Patterns (modules, libraries)"
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
  - "a"
  - "r"
  - "c"
  - "h"
  - "i"
  - "t"
  - "e"
  - "c"
  - "t"
  - "u"
  - "r"
  - "e"
  - ","
  - " "
  - "m"
  - "o"
  - "d"
  - "u"
  - "l"
  - "e"
  - "s"
  - ","
  - " "
  - "l"
  - "i"
  - "b"
  - "r"
  - "a"
  - "r"
  - "i"
  - "e"
  - "s"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/solidity_evm/language_core/KID-LANG-SOL-CORE-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Contract Architecture Patterns (modules, libraries)

# Contract Architecture Patterns (Modules, Libraries)

## Summary
In Solidity and Ethereum Virtual Machine (EVM) development, modularizing contracts using modules and libraries is a critical pattern for creating reusable, maintainable, and gas-efficient smart contracts. This pattern separates logic into distinct components, reducing code duplication and improving security by isolating functionality. It is particularly useful for complex systems like decentralized finance (DeFi) protocols, token standards, and governance systems.

## When to Use
- When building large, complex systems that require separation of concerns (e.g., DeFi platforms, DAOs).
- When you need to reuse common functionality across multiple contracts, such as math operations or token standard implementations.
- When optimizing for gas efficiency by reducing contract size and leveraging library deployment.
- When you want to improve maintainability by isolating logic into smaller, testable components.
- When you aim to minimize attack surfaces by isolating critical logic in libraries or modules.

## Do / Don't
### Do:
1. **Do use libraries for stateless utility functions** like mathematical operations or string manipulations.
2. **Do modularize contracts into distinct modules** for core logic, access control, and external integrations.
3. **Do use `delegatecall` cautiously** when implementing upgradable proxy patterns to ensure storage layout compatibility.

### Don't:
1. **Don't duplicate logic across multiple contracts**, as it increases maintenance overhead and gas costs.
2. **Don't use libraries for stateful operations** unless you fully understand the implications of `delegatecall` and storage manipulation.
3. **Don't over-modularize contracts**, as this can increase deployment complexity and gas costs during execution.

## Core Content
### Problem
Smart contracts on the EVM are constrained by size limits (24 KB) and high gas costs. Writing monolithic contracts leads to bloated, hard-to-maintain codebases with duplicated logic. This increases the risk of bugs, security vulnerabilities, and inefficiencies. Additionally, large contracts may exceed the EVM's size limit, preventing deployment.

### Solution
Contract architecture patterns using modules and libraries solve these problems by splitting functionality into reusable, isolated components. Modules are separate contracts that interact with the main contract, while libraries provide reusable, stateless functions. This approach improves maintainability, reduces gas costs, and enhances security.

### Implementation Steps
#### 1. **Identify Core Functional Areas**
   - Break down your system into logical components, such as access control, token management, and external integrations.
   - For example, in a DeFi protocol, separate modules could handle lending, borrowing, and liquidation logic.

#### 2. **Use Libraries for Reusable Logic**
   - Create libraries for shared, stateless functionality like math operations, string manipulation, or token transfers.
   - Example: A library for safe math operations:
     ```solidity
     library SafeMath {
         function add(uint256 a, uint256 b) internal pure returns (uint256) {
             uint256 c = a + b;
             require(c >= a, "Addition overflow");
             return c;
         }
     }
     ```
   - Import the library into your contracts:
     ```solidity
     import "./SafeMath.sol";

     contract MyContract {
         using SafeMath for uint256;

         function calculate(uint256 a, uint256 b) public pure returns (uint256) {
             return a.add(b);
         }
     }
     ```

#### 3. **Implement Modular Contracts**
   - Create separate contracts for distinct logic and interact with them using function calls.
   - Example: A governance module interacting with a token module:
     ```solidity
     contract Governance {
         TokenModule private tokenModule;

         constructor(address tokenModuleAddress) {
             tokenModule = TokenModule(tokenModuleAddress);
         }

         function vote(uint256 proposalId) public {
             require(tokenModule.balanceOf(msg.sender) > 0, "No voting power");
             // Voting logic here
         }
     }

     contract TokenModule {
         mapping(address => uint256) public balances;

         function balanceOf(address account) public view returns (uint256) {
             return balances[account];
         }
     }
     ```

#### 4. **Optimize Gas Usage**
   - Deploy libraries once and link them to multiple contracts, reducing deployment costs.
   - Use `delegatecall` for upgradable proxy patterns but ensure storage layout compatibility.

#### 5. **Test and Audit**
   - Test each module and library independently.
   - Audit the interactions between modules to ensure security and correctness.

### Tradeoffs
- **Gas Efficiency vs. Complexity**: While libraries reduce gas costs, modular contracts may increase runtime gas usage due to inter-contract calls.
- **Maintainability vs. Deployment Overhead**: Modular contracts are easier to maintain but require careful deployment and address management.
- **Security vs. Flexibility**: Libraries reduce attack surfaces but require careful handling of `delegatecall` to avoid storage collisions.

### When to Use Alternatives
- For simple contracts with limited functionality, a monolithic design may suffice.
- Use inheritance instead of libraries when stateful logic is tightly coupled to the main contract.
- Consider external off-chain computation for highly complex logic that is expensive to execute on-chain.

## Links
- **Solidity Documentation on Libraries**: Learn about the syntax and best practices for libraries in Solidity.
- **EIP-2535: Diamond Standard**: A modular contract standard for building complex systems.
- **OpenZeppelin Contracts**: A library of reusable, audited smart contract components.
- **Delegatecall Security Risks**: A detailed explanation of `delegatecall` and its implications.

## Proof / Confidence
This pattern is widely adopted in the Ethereum ecosystem, with examples like OpenZeppelin's library contracts and modular DeFi protocols such as Compound and Aave. Industry standards like EIP-2535 (Diamond Standard) formalize modular contract architecture, and audits consistently highlight the benefits of separating concerns to improve security and maintainability.
