---
kid: "KID-LANGWARA-CHECK-0001"
title: "Wagmi Rainbowkit Production Readiness Checklist"
type: "checklist"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "wagmi_rainbowkit"
subdomains: []
tags:
  - "wagmi_rainbowkit"
  - "checklist"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Wagmi Rainbowkit Production Readiness Checklist

# Wagmi Rainbowkit Production Readiness Checklist

## Summary
This checklist ensures your application using Wagmi and Rainbowkit is production-ready. It covers essential configuration, security, and performance considerations for deploying web3 applications. Following this checklist will help reduce risks, improve reliability, and enhance the user experience.

## When to Use
- When deploying a web3 application that uses Wagmi and Rainbowkit for wallet connection and blockchain interaction.
- Before transitioning from development/staging environments to production environments.
- During pre-launch audits or periodic production reviews of web3 applications.

## Do / Don't

### Do
1. **Do configure environment variables securely**: Use `.env` files or a secrets manager to store sensitive keys (e.g., RPC URLs, API keys).
2. **Do test wallet connection flows**: Verify all supported wallets function correctly across browsers and devices.
3. **Do enable chain fallback logic**: Ensure your app gracefully handles unsupported chains or network changes.
4. **Do optimize RPC endpoints**: Use high-performance RPC providers like Alchemy or Infura to minimize latency.
5. **Do monitor blockchain interactions**: Implement logging for transactions and wallet events to debug issues.

### Don't
1. **Don't hardcode sensitive information**: Avoid embedding private keys, RPC URLs, or API keys directly in source code.
2. **Don't ignore unsupported browsers**: Test compatibility and inform users of browser limitations.
3. **Don't skip rate-limiting**: Ensure your app doesn't exceed RPC provider limits, which can lead to downtime.
4. **Don't rely on default configurations**: Customize Wagmi and Rainbowkit settings to match your app's requirements.
5. **Don't neglect accessibility**: Ensure wallet connection UI is usable for all users, including those with disabilities.

## Core Content

### Environment Configuration
- **Set up environment variables securely**: Store RPC URLs, API keys, and other sensitive information in `.env` files or a secrets manager. Never commit these files to version control.
- **Verify chain configuration**: Ensure Wagmi is configured with the correct chains and fallback logic for unsupported networks. For example:
  ```typescript
  const { chains, provider } = configureChains(
    [mainnet, polygon],
    [alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY })]
  );
  ```
- **Enable production mode**: Set the `NODE_ENV` environment variable to `production` to optimize performance.

### Wallet Connection Testing
- **Test wallet compatibility**: Verify functionality with major wallets like MetaMask, WalletConnect, Coinbase Wallet, and Ledger across browsers (Chrome, Firefox, Safari) and devices (desktop, mobile).
- **Handle wallet disconnection gracefully**: Implement logic to detect and manage wallet disconnection events.
- **Provide clear error messages**: Ensure users receive actionable feedback when wallet connection fails.

### Security Best Practices
- **Use HTTPS for RPC URLs**: Ensure all RPC endpoints use HTTPS to prevent data interception.
- **Rate-limit RPC requests**: Implement rate-limiting to avoid exceeding provider limits and triggering downtime.
- **Audit dependencies**: Regularly check Wagmi and Rainbowkit versions for security updates and bug fixes.

### Performance Optimization
- **Optimize RPC providers**: Use high-performance providers like Alchemy or Infura to reduce latency.
- **Cache chain data**: Cache frequently accessed chain information to reduce redundant API calls.
- **Minimize bundle size**: Use tree-shaking to exclude unused Wagmi and Rainbowkit features.

### Accessibility and UX
- **Ensure responsive design**: Test wallet connection UI on various screen sizes and resolutions.
- **Provide fallback options**: Offer alternative wallet connection methods for unsupported devices or browsers.
- **Enable dark mode**: Support dark mode for better usability in low-light conditions.

## Links
- [Wagmi Documentation](https://wagmi.sh/docs): Official documentation for Wagmi library.
- [Rainbowkit Documentation](https://www.rainbowkit.com/docs): Official documentation for Rainbowkit.
- [Alchemy RPC Provider](https://www.alchemy.com/): High-performance blockchain infrastructure provider.
- [Web3 Security Best Practices](https://consensys.net/blog/security/): Industry guidelines for securing web3 applications.

## Proof / Confidence
- **Industry Standards**: Wagmi and Rainbowkit are widely adopted libraries in the web3 ecosystem, with active developer communities and regular updates.
- **Benchmarks**: High-performance RPC providers like Alchemy and Infura are trusted by leading blockchain applications.
- **Common Practice**: Secure environment configuration, wallet compatibility testing, and accessibility optimization are standard practices for production-grade web3 applications.
