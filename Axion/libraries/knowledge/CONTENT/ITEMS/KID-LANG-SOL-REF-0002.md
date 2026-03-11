---
kid: "KID-LANG-SOL-REF-0002"
title: "Tooling Baseline (Foundry/Hardhat choices)"
content_type: "reference"
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
  - "references"
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
  - "o"
  - "o"
  - "l"
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
  - "h"
  - "a"
  - "r"
  - "d"
  - "h"
  - "a"
  - "t"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/solidity_evm/references/KID-LANG-SOL-REF-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Tooling Baseline (Foundry/Hardhat choices)

# Tooling Baseline (Foundry/Hardhat Choices)

## Summary
Foundry and Hardhat are two popular frameworks for developing, testing, and deploying Solidity-based smart contracts on the Ethereum Virtual Machine (EVM). Foundry emphasizes speed and simplicity with native Rust tooling, while Hardhat provides a more extensive JavaScript-based ecosystem with plugins and integrations. Choosing between them depends on project requirements, team expertise, and specific use cases.

## When to Use
- **Foundry**: Use when performance, native testing speed, and minimal dependencies are critical. Ideal for Rust-savvy teams or projects requiring fast iteration cycles.
- **Hardhat**: Use when extensive plugin support, JavaScript-based workflows, and integration with frontend tools are necessary. Suitable for teams with JavaScript expertise or projects with complex deployment needs.

## Do / Don't

### Do:
1. **Use Foundry** for projects requiring high-speed testing and minimal dependency overhead.
2. **Leverage Hardhat** for projects requiring plugin-heavy workflows, such as frontend integration or deployment automation.
3. **Maintain consistency** by aligning tooling choices with team expertise and project requirements.

### Don't:
1. **Use Foundry** if your team lacks familiarity with Rust or CLI-based workflows.
2. **Use Hardhat** if testing performance is a bottleneck or if minimal dependencies are a priority.
3. **Mix tooling** unless explicitly required; it introduces complexity and potential conflicts.

## Core Content

### Foundry Overview
Foundry is a Rust-based framework designed for Solidity development. It includes:
- **Forge**: A CLI tool for building, testing, and deploying smart contracts.
- **Cast**: A utility for interacting with contracts and performing chain queries.
- **Key Features**:
  - Extremely fast unit testing due to native Rust compilation.
  - Minimal dependencies, reducing setup complexity.
  - Built-in fuzz testing and property-based testing.
  - Compatibility with EVM chains and Solidity versions.

#### Configuration Options:
- `foundry.toml`: Central configuration file for Foundry projects.
  - **Example Parameters**:
    - `solc_version`: Specifies the Solidity compiler version.
    - `default_chain_id`: Sets the default chain ID for testing.
    - `optimizer_runs`: Configures the Solidity optimizer.
- Environment Variables:
  - `FOUNDRY_PROFILE`: Allows switching between profiles (e.g., development, production).

---

### Hardhat Overview
Hardhat is a JavaScript-based framework for Ethereum development. It provides:
- **Flexible Plugin System**: Integrates with tools like ethers.js, Waffle, and Truffle.
- **Built-in Network**: Hardhat Network for local testing and debugging.
- **Key Features**:
  - Rich plugin ecosystem for deployment, verification, and testing.
  - JavaScript/TypeScript support for scripting and integration.
  - Debugging tools like stack traces and error messages.

#### Configuration Options:
- `hardhat.config.js`: Central configuration file for Hardhat projects.
  - **Example Parameters**:
    - `defaultNetwork`: Specifies the default network (e.g., localhost, mainnet).
    - `networks`: Defines custom network configurations.
    - `solidity`: Configures Solidity compiler settings.
- Plugins:
  - `@nomiclabs/hardhat-ethers`: Integrates ethers.js.
  - `@nomiclabs/hardhat-waffle`: Adds Waffle testing support.

---

### Comparison Table

| Feature                | Foundry                      | Hardhat                     |
|------------------------|------------------------------|-----------------------------|
| Language Base          | Rust                        | JavaScript/TypeScript       |
| Testing Speed          | High                        | Moderate                    |
| Plugin Ecosystem       | Limited                     | Extensive                   |
| Debugging Tools        | Basic                       | Advanced                    |
| Learning Curve         | Steeper (Rust)              | Moderate (JavaScript)       |

## Links
- **Solidity Documentation**: Official reference for Solidity language features and compiler options.
- **Foundry Book**: Comprehensive guide to Foundry tools and workflows.
- **Hardhat Documentation**: Official documentation for Hardhat, including plugins and configuration.
- **Ethers.js**: Library for interacting with Ethereum and integrating with Hardhat.

## Proof / Confidence
Foundry's performance benchmarks demonstrate faster testing cycles, making it a preferred choice for high-speed workflows. Hardhat's extensive adoption in the JavaScript ecosystem is supported by its plugin ecosystem and integration capabilities. Both tools are widely used in industry, with active community support and regular updates.
