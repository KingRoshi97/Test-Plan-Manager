---
kid: "KID-LANGREAC-CHECK-0001"
title: "React Production Readiness Checklist"
content_type: "checklist"
primary_domain: "react"
industry_refs: []
stack_family_refs:
  - "react"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "react"
  - "checklist"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/02_web_frameworks/react/checklists/KID-LANGREAC-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# React Production Readiness Checklist

```markdown
# React Production Readiness Checklist

## Summary
This checklist ensures your React application is ready for production deployment by addressing performance, security, reliability, and maintainability. Following these steps will help you deliver a robust and scalable application that meets industry standards and provides a seamless user experience.

## When to Use
Use this checklist before deploying a React application to production. It is particularly relevant for:
- Applications serving end-users in production environments.
- Projects requiring high performance and reliability.
- Software subject to strict security or compliance requirements.

## Do / Don't

### Do
- **Do optimize your bundle size.** Use tools like Webpack or Vite to reduce unused code and enable tree-shaking.
- **Do implement error boundaries.** Catch runtime errors in React components to prevent application crashes.
- **Do use environment variables.** Store sensitive data like API keys securely using `.env` files.

### Don't
- **Don't use `console.log` in production.** Remove debugging statements to avoid leaking sensitive information.
- **Don't hardcode sensitive information.** Never store API keys or secrets directly in source code.
- **Don't ignore accessibility.** Ensure your app complies with WCAG standards for usability.

## Core Content

### Code Quality
- **Run a static code analysis.** Use tools like ESLint and Prettier to enforce coding standards and catch potential issues early.
- **Check PropTypes or TypeScript types.** Validate component props with PropTypes or TypeScript to ensure proper data flow.

### Performance Optimization
- **Analyze bundle size.** Use tools like `webpack-bundle-analyzer` to identify and reduce large dependencies.
- **Lazy load components.** Use React's `Suspense` and dynamic imports to load components only when needed.
- **Enable production mode.** Ensure your app is running in production mode by setting `NODE_ENV=production` to enable optimizations.

### Security
- **Sanitize user inputs.** Use libraries like DOMPurify to prevent XSS attacks.
- **Secure API calls.** Use HTTPS and authentication mechanisms (e.g., OAuth) for all network requests.
- **Audit dependencies.** Regularly check for vulnerabilities using tools like `npm audit` or `yarn audit`.

### Reliability
- **Add error boundaries.** Wrap critical components with error boundaries to handle runtime errors gracefully.
- **Monitor application health.** Integrate monitoring tools like Sentry or LogRocket to track errors and performance in production.
- **Test thoroughly.** Run unit, integration, and end-to-end tests using tools like Jest, React Testing Library, and Cypress.

### Accessibility
- **Test for accessibility.** Use tools like Axe or Lighthouse to ensure compliance with WCAG standards.
- **Provide keyboard navigation.** Ensure all interactive elements can be accessed via keyboard.
- **Use semantic HTML.** Leverage proper HTML tags for better accessibility and SEO.

### Deployment
- **Set up CI/CD pipelines.** Automate testing and deployment using tools like GitHub Actions, CircleCI, or Jenkins.
- **Use a CDN.** Host static assets on a Content Delivery Network for faster load times.
- **Enable caching.** Configure proper caching headers for assets to improve performance.

## Links
- [React Documentation: Optimizing Performance](https://react.dev/learn/optimizing-performance) - Official guide on improving React app performance.
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) - Tool for visualizing bundle size.
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/) - Industry-standard security practices.
- [Axe Accessibility Tool](https://www.deque.com/axe/) - Tool for testing web accessibility.

## Proof / Confidence
React production readiness practices are widely adopted by industry leaders. Bundling and lazy loading are recommended by the React team for performance optimization. Security measures like sanitizing inputs and auditing dependencies align with OWASP standards. Accessibility testing tools like Axe are used by major organizations to ensure compliance with WCAG guidelines. Following this checklist ensures alignment with best practices, reducing risks and improving application quality.
```
