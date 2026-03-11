---
kid: "KID-LANG-SOL-CORE-0001"
title: "Solidity Basics (types, storage/memory)"
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
  - "y"
  - "p"
  - "e"
  - "s"
  - ","
  - " "
  - "s"
  - "t"
  - "o"
  - "r"
  - "a"
  - "g"
  - "e"
  - ","
  - " "
  - "m"
  - "e"
  - "m"
  - "o"
  - "r"
  - "y"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/solidity_evm/language_core/KID-LANG-SOL-CORE-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Solidity Basics (types, storage/memory)

# Solidity Basics (types, storage/memory)

## Summary

Solidity is a statically-typed programming language used for writing smart contracts on the Ethereum Virtual Machine (EVM). Understanding data types and the distinction between storage and memory is crucial for efficient and secure contract design. These concepts directly impact gas costs, execution behavior, and the integrity of your smart contract.

## When to Use

- Writing smart contracts for Ethereum or EVM-compatible blockchains.
- Optimizing gas fees and storage usage in contract design.
- Debugging issues related to state persistence or temporary data handling.
- Designing contracts with complex data structures, such as arrays or mappings.

## Do / Don't

### Do:
1. **Use `storage` for persistent state**: Store variables that need to be retained across function calls in `storage`.
2. **Use `memory` for temporary data**: Allocate temporary variables or function parameters in `memory` to avoid unnecessary gas costs.
3. **Leverage Solidity's explicit type system**: Declare types explicitly to prevent unintended type conversions or errors.

### Don't:
1. **Don't misuse `storage` for temporary data**: Avoid storing temporary data in `storage`, as it incurs higher gas costs.
2. **Don't assume default values for uninitialized variables**: Always initialize variables explicitly to avoid unexpected behavior.
3. **Don't ignore gas implications of complex data structures**: Be mindful of the cost associated with deep copying or manipulating large arrays in `memory`.

## Core Content

### Data Types in Solidity

Solidity is statically typed, meaning every variable must have a defined type at compile time. Common types include:

- **Value Types**: These include `uint`, `int`, `bool`, `address`, and `bytes`. Value types are stored directly in memory or storage.
- **Reference Types**: These include arrays, mappings, and structs. Reference types store pointers to data locations in memory or storage.

#### Example:
```solidity
uint256 public myNumber = 42; // Value type
mapping(address => uint256) public balances; // Reference type
```

### Storage vs. Memory

Solidity uses two primary data locations: `storage` and `memory`. Understanding the distinction is critical for efficient contract design.

- **Storage**: Persistent data stored on the blockchain. Variables declared at the contract level are stored in `storage`. Accessing or modifying `storage` incurs significant gas costs.
  
- **Memory**: Temporary data used during function execution. Variables declared inside functions default to `memory`. Memory is cheaper than storage but is cleared after function execution.

#### Example:
```solidity
contract Example {
    uint256 public storedData; // Stored in `storage`

    function updateData(uint256 _newData) public {
        uint256 tempData = _newData + 1; // Stored in `memory`
        storedData = tempData; // Persistent update in `storage`
    }
}
```

### Practical Implications

1. **Gas Optimization**: Using `memory` for temporary variables reduces gas costs compared to `storage`. For example, copying large arrays into `storage` is more expensive than manipulating them in `memory`.
   
2. **State Persistence**: Variables in `storage` persist across function calls, making them suitable for contract state. Conversely, `memory` is ephemeral and ideal for intermediate computations.

3. **Default Behavior**: Function parameters of reference types (e.g., arrays) default to `memory`, unless explicitly marked as `storage` or `calldata`.

#### Example: Passing Arrays
```solidity
function processArray(uint256[] memory array) public pure returns (uint256) {
    return array.length * 2; // Operates on `memory` without modifying `storage`
}
```

### Advanced Considerations

- **Calldata**: A third data location used for function parameters in external calls. It is read-only and cheaper than `memory`.
- **Mappings**: Mappings are always stored in `storage` and cannot be passed to functions as `memory` or `calldata`.

#### Example: Calldata Usage
```solidity
function calculateSum(uint256[] calldata numbers) external pure returns (uint256 sum) {
    for (uint256 i = 0; i < numbers.length; i++) {
        sum += numbers[i];
    }
}
```

## Links

- **Solidity Documentation**: Official documentation for Solidity, including details on data types and memory/storage.
- **Gas Optimization in Solidity**: Best practices for reducing gas costs in smart contracts.
- **EVM Architecture**: Overview of the Ethereum Virtual Machine and its data handling mechanisms.
- **Solidity by Example**: Examples of Solidity concepts, including storage and memory usage.

## Proof / Confidence

This content is based on industry-standard practices outlined in the official Solidity documentation and widely accepted benchmarks for gas optimization. Solidity's behavior regarding types, storage, and memory is deterministic and verified through extensive use in production environments on Ethereum and other EVM-compatible chains.
