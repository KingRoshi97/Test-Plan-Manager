---
kid: "KID-LANG-EVM-CORE-0001"
title: "EVM Mental Model (state, gas, transactions)"
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
  - "e"
  - "v"
  - "m"
  - ","
  - " "
  - "g"
  - "a"
  - "s"
  - ","
  - " "
  - "t"
  - "r"
  - "a"
  - "n"
  - "s"
  - "a"
  - "c"
  - "t"
  - "i"
  - "o"
  - "n"
  - "s"
  - ","
  - " "
  - "s"
  - "t"
  - "a"
  - "t"
  - "e"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/solidity_evm/language_core/KID-LANG-EVM-CORE-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# EVM Mental Model (state, gas, transactions)

# EVM Mental Model (state, gas, transactions)

## Summary

The Ethereum Virtual Machine (EVM) is the runtime environment for executing smart contracts on the Ethereum blockchain. It operates based on three key components: **state**, **gas**, and **transactions**. Understanding these components is critical for writing efficient and secure Solidity code, as they define how the EVM processes and validates computations, manages resources, and updates the blockchain state.

---

## When to Use

- When designing and implementing smart contracts in Solidity.
- When optimizing gas costs to ensure efficient execution of smart contracts.
- When debugging or analyzing transaction failures or unexpected state changes in the EVM.
- When building tools or services that interact with Ethereum, such as wallets, dApps, or layer-2 scaling solutions.

---

## Do / Don't

### Do:
1. **Optimize gas usage** by minimizing unnecessary computations and storage writes in smart contracts.
2. **Understand state changes** to ensure your contract logic updates storage variables correctly and securely.
3. **Handle transaction reverts gracefully** by using mechanisms like `require`, `assert`, and `revert` to validate inputs and execution conditions.

### Don't:
1. **Ignore gas limits** when deploying or interacting with contracts, as exceeding the gas limit will cause the transaction to fail.
2. **Assume state changes are immediate**; state updates only persist after the transaction is mined successfully.
3. **Write unbounded loops** or expensive operations, as they can lead to excessive gas costs or failed transactions.

---

## Core Content

The EVM is a stack-based virtual machine that executes smart contracts in a deterministic manner. To understand its operation, developers must internalize three fundamental aspects: **state**, **gas**, and **transactions**.

### **State**
The EVM maintains a global state, which consists of all accounts and their associated data. Accounts are of two types:
1. **Externally Owned Accounts (EOAs):** Controlled by private keys, these accounts initiate transactions.
2. **Contract Accounts:** Controlled by smart contract code, these accounts execute logic when triggered.

Each account has:
- A balance (in wei).
- A nonce (to prevent replay attacks).
- Storage (key-value pairs for contract accounts).
- Code (for contract accounts).

State changes occur when transactions are executed. For example, updating a mapping or transferring Ether modifies the global state. However, state changes are only finalized once the transaction is mined and included in a block.

### **Gas**
Gas is a measure of computational work required to execute operations in the EVM. Every operation (e.g., addition, storage write, function call) has an associated gas cost. Gas serves two purposes:
1. **Preventing resource abuse:** By requiring gas for computation, the EVM ensures that malicious actors cannot execute infinite loops or consume excessive resources.
2. **Incentivizing miners:** Gas fees are paid to miners for including transactions in blocks.

Gas costs are deducted from the sender's balance, and any unused gas is refunded. For example:
```solidity
function addToMapping(uint key, uint value) public {
    myMapping[key] = value; // Writing to storage incurs a high gas cost
}
```
Writing to storage is expensive because it alters the global state, whereas operations like addition or reading from memory are cheaper.

### **Transactions**
Transactions are the primary mechanism for interacting with the EVM. They are initiated by EOAs and can:
1. Transfer Ether between accounts.
2. Deploy smart contracts.
3. Call functions within smart contracts.

Each transaction has:
- A sender and recipient.
- A value (amount of Ether transferred).
- Data (optional input for contract calls).
- A gas limit and gas price.

Transactions are atomic: they either succeed entirely or fail (revert). For example:
```solidity
function transferEther(address payable recipient, uint amount) public {
    require(amount <= address(this).balance, "Insufficient balance");
    recipient.transfer(amount); // Transfers Ether to the recipient
}
```
If the `require` condition fails, the transaction reverts, and no state changes occur.

### Interplay of State, Gas, and Transactions
When a transaction is executed:
1. The EVM reads the current state.
2. It executes the transaction using the provided gas.
3. If successful, the state is updated, and unused gas is refunded.
4. If the gas is exhausted or an error occurs, the transaction reverts, and no state changes are applied.

Understanding this interplay is crucial for writing reliable and efficient smart contracts.

---

## Links

- **Ethereum Yellow Paper**: The formal specification of the EVM.
- **Solidity Documentation**: Comprehensive guide to writing smart contracts.
- **Gas Optimization Techniques**: Best practices for reducing gas costs in Solidity.
- **Etherscan**: A tool for analyzing transactions and state changes on the Ethereum blockchain.

---

## Proof / Confidence

This content is based on the Ethereum Yellow Paper, the Solidity documentation, and established industry practices. Gas costs and transaction behavior are well-documented and consistently observed in live Ethereum networks. Developers widely adopt these principles to ensure efficient, secure, and predictable smart contract behavior.
