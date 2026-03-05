---
kid: "KID-LANG-REACT-REACT-0004"
title: "Accessibility Checklist (React UI)"
type: checklist
pillar: LANGUAGES_AND_LIBRARIES
domains: [javascript_typescript, react]
subdomains: []
tags: [react, accessibility, a11y]
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

# Accessibility Checklist (React UI)

# Accessibility Checklist (React UI)

## Summary
This checklist provides actionable steps to ensure accessibility compliance in React-based user interfaces. It covers critical aspects such as semantic HTML, keyboard navigation, ARIA roles, and color contrast. Following these guidelines will help create inclusive applications that meet accessibility standards like WCAG 2.1.

## When to Use
Use this checklist when developing, reviewing, or auditing React components for accessibility compliance. It is applicable during feature development, code reviews, and pre-release testing to ensure your UI is usable by individuals with disabilities.

## Do / Don't

### Do
- **Do** use semantic HTML elements (`<button>`, `<nav>`, `<header>`) instead of generic `<div>` or `<span>` for meaningful content.
- **Do** ensure all interactive elements are keyboard-accessible (e.g., focusable via `tab` and operable via `Enter` or `Space`).
- **Do** use ARIA roles, states, and properties only when native HTML elements cannot achieve the desired accessibility.
- **Do** test your UI with screen readers (e.g., NVDA, JAWS, VoiceOver) to verify the experience for visually impaired users.
- **Do** ensure sufficient color contrast between text and background (e.g., at least 4.5:1 for normal text as per WCAG 2.1).

### Don't
- **Don't** rely solely on visual cues (e.g., color or icons) to convey information; always provide text alternatives.
- **Don't** use `tabIndex` values greater than `0` unless absolutely necessary, as it disrupts natural tab order.
- **Don't** use ARIA roles redundantly on elements that already have implicit roles (e.g., avoid `role="button"` on a `<button>`).
- **Don't** disable focus outlines with `outline: none;` unless replaced with an accessible alternative.
- **Don't** use animations that flash or blink excessively, as they can trigger seizures in users with photosensitive epilepsy.

## Core Content

### Semantic HTML
- Use semantic HTML elements wherever possible. For example:
  - Replace `<div>` with `<button>` for clickable elements.
  - Use `<nav>` for navigation menus and `<header>` for page headers.
- Rationale: Semantic HTML improves accessibility by providing built-in roles and behaviors, reducing the need for ARIA attributes.

### Keyboard Navigation
- Ensure all interactive elements are focusable via the `tab` key.
- Use the `onKeyDown` or `onKeyPress` event handlers to enable keyboard interaction for custom components.
- Avoid removing focus outlines (`outline: none`) unless you replace them with a visually distinct alternative.
- Rationale: Keyboard navigation is essential for users who cannot use a mouse.

### ARIA Roles and Attributes
- Use ARIA roles only when necessary. For example:
  - Use `role="alert"` for dynamic error messages.
  - Use `aria-expanded` for collapsible components like dropdowns.
- Avoid redundant ARIA roles (e.g., `role="button"` on `<button>`).
- Test ARIA attributes with screen readers to ensure they provide meaningful context.
- Rationale: ARIA roles supplement HTML but should not replace it. Misuse can harm accessibility.

### Color Contrast
- Ensure text and background colors meet WCAG 2.1 contrast ratios:
  - Normal text: 4.5:1
  - Large text (18pt or 14pt bold): 3:1
- Use tools like Chrome DevTools or online contrast checkers to validate.
- Rationale: Proper contrast ensures readability for users with visual impairments.

### Labels and Instructions
- Provide clear, descriptive labels for all form fields and interactive elements using `label` tags or `aria-label`.
- Include instructions or error messages that are accessible via screen readers.
- Use `aria-describedby` to associate additional context with form fields.
- Rationale: Labels and instructions help users understand the purpose and state of elements.

### Testing and Validation
- Test your application with screen readers like NVDA, JAWS, and VoiceOver.
- Use automated accessibility testing tools like Axe or Lighthouse to identify common issues.
- Conduct manual testing for keyboard navigation and focus management.
- Rationale: Automated tools can catch many issues, but manual testing ensures a complete user experience.

## Links
- **Web Content Accessibility Guidelines (WCAG) 2.1**: Industry-standard guidelines for accessible web design.
- **WAI-ARIA Authoring Practices**: Best practices for using ARIA roles and attributes effectively.
- **Axe Accessibility Testing Tool**: A popular tool for automated accessibility audits.
- **React Accessibility Documentation**: Official React guidance on building accessible components.

## Proof / Confidence
This checklist is based on WCAG 2.1 standards, which are widely adopted across industries for accessibility compliance. It incorporates best practices from WAI-ARIA guidelines and React's official documentation. Tools like Axe and Lighthouse are commonly used by developers to validate accessibility, and manual testing with screen readers is a standard practice in inclusive design workflows.
