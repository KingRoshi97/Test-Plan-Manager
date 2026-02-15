# Accessibility Best Practices (WCAG 2.1 AA)

## 1. Core Principles (POUR)

### Perceivable
- All non-text content has text alternatives (alt text for images, labels for icons)
- Video has captions; audio has transcripts
- Content is readable without color as the sole indicator
- Minimum contrast ratios: 4.5:1 normal text, 3:1 large text, 3:1 UI components

### Operable
- All functionality available via keyboard
- No keyboard traps (user can always Tab away)
- No content that flashes more than 3 times per second
- Skip navigation link as first focusable element
- Focus indicators visible on all interactive elements

### Understandable
- Page language declared (`<html lang="en">`)
- Labels and instructions provided for all form inputs
- Error messages are specific and suggest corrections
- Consistent navigation and naming across pages

### Robust
- Valid, semantic HTML (headings in order, lists for lists, buttons for actions)
- ARIA used only when native HTML semantics are insufficient
- Content works with assistive technology (screen readers, magnifiers)

## 2. Semantic Structure and HTML

### Page Titles and Headings
- Every page has a unique, descriptive `<title>` reflecting current content
- One `<h1>` per page matching the page title / primary purpose
- Heading hierarchy is strictly sequential (`h1` → `h2` → `h3`, never skip levels)
- Headings are used for structure, not for visual styling — use CSS for sizing

### Landmark Completeness
- `<header>` or `role="banner"` — Page header (one per page)
- `<nav>` or `role="navigation"` — Navigation sections (label with `aria-label` if multiple)
- `<main>` or `role="main"` — Primary content (one per page)
- `<footer>` or `role="contentinfo"` — Page footer
- `<aside>` or `role="complementary"` — Supporting content related to main
- `<section>` with `aria-labelledby` — Distinct content regions
- Every visible region of the page should be within a landmark

### Meaningful Link Text
- Links describe their destination: "View order history" not "Click here"
- Avoid generic text like "Read more", "Learn more" without context
- If generic text is necessary, add `aria-label` with full context
- Links opening new windows include indication: `(opens in new tab)` or `aria-label`

### Descriptive Labels
- All interactive elements have accessible names (visible label, `aria-label`, or `aria-labelledby`)
- Group labels with `<fieldset>` + `<legend>` for related controls
- Icon-only buttons must have `aria-label` describing the action

### Native Controls First
- Use `<button>` for actions, `<a>` for navigation — never `<div>` or `<span>` with click handlers
- Use `<select>`, `<input>`, `<textarea>` before building custom equivalents
- Custom widgets must replicate full native keyboard and ARIA behavior
- If a native control can do the job, always prefer it over a custom widget

## 3. Keyboard Navigation

### Focus Management
- Visible focus indicator on all interactive elements (minimum 2px outline, 3:1 contrast)
- Logical tab order following visual layout (left-to-right, top-to-bottom)
- Focus trapped inside modals/dialogs (Tab cycles within, Escape closes)
- Focus returned to trigger element when modal closes
- Skip-to-main-content link as first element

### No Keyboard Traps
- Users must be able to navigate away from every component using standard keys
- Custom widgets must document any non-standard key interactions
- Test that Tab, Shift+Tab, and Escape always provide an exit path

### Focus Order Matches Visual Order
- CSS layout (flex order, grid placement, absolute positioning) must not break logical focus order
- If visual order differs from DOM order, use `tabindex` to correct, or restructure the DOM
- Dynamically inserted content should receive focus or announce itself appropriately

### Keyboard Support for Custom Widgets
- Tabs: Arrow keys switch tabs, Tab moves into panel content
- Menus: Arrow keys navigate items, Enter/Space selects, Escape closes
- Trees: Arrow keys expand/collapse and navigate, Enter activates
- Comboboxes: Arrow keys navigate options, Enter selects, Escape closes list
- Date pickers: Arrow keys navigate days, Page Up/Down for months

### Escape Key Behavior
- Escape closes the topmost dismissible UI (modal → dropdown → tooltip)
- Nested layers close one at a time, innermost first
- After closing, focus returns to the element that opened the layer

### Key Bindings
| Key | Expected Behavior |
|-----|-------------------|
| Tab | Move to next interactive element |
| Shift+Tab | Move to previous interactive element |
| Enter | Activate buttons and links |
| Space | Activate buttons, toggle checkboxes |
| Escape | Close modals, dismiss menus, cancel actions |
| Arrow keys | Navigate within composite widgets (tabs, menus, radio groups) |

## 4. Screen Reader and ARIA Patterns

### ARIA Relationships
- Use `aria-labelledby` to associate headings/labels with regions or controls
- Use `aria-describedby` for supplementary help text, error messages, or hints
- Use `aria-owns` only when DOM structure prevents parent-child relationship
- Use `aria-controls` to link a control to the region it affects (e.g., tab → panel)

### Avoiding Redundant ARIA
- Do not add `role="button"` to a `<button>` — it is already implicit
- Do not add `role="navigation"` to a `<nav>` — use ARIA only to supplement, not duplicate
- Remove `aria-label` if it duplicates visible text content exactly

### Announcing Dynamic Content
- Use `aria-live="polite"` for non-urgent updates (new messages, data refreshes)
- Use `aria-live="assertive"` sparingly — only for critical alerts (errors, urgent notifications)
- Announce loading states: set `aria-busy="true"` on the updating region, announce completion
- For skeleton/loading screens, use `role="status"` with descriptive text or `aria-label`

### Dialog Semantics
- Use `role="dialog"` or `role="alertdialog"` with `aria-modal="true"`
- Every dialog must have `aria-labelledby` pointing to its title
- Optional `aria-describedby` pointing to descriptive content
- Focus moves into the dialog on open; focus traps within; Escape closes

### Table Semantics
- Use `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` for tabular data
- Use `<caption>` or `aria-labelledby` to describe the table purpose
- Use `scope="col"` and `scope="row"` on `<th>` elements
- For complex tables with merged cells, use `headers` attribute on `<td>`
- Never use tables for layout — use CSS Grid or Flexbox

### Common Widget Patterns
- **Tabs**: `role="tablist"` → `role="tab"` + `aria-selected` → `role="tabpanel"`
- **Modal**: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- **Menu**: `role="menu"` → `role="menuitem"` with arrow key navigation
- **Alert**: `role="alert"` for important messages (auto-announced by screen readers)
- **Live region**: `aria-live="polite"` for dynamic content updates

### ARIA Rules
1. Don't use ARIA if native HTML works (`<button>` not `<div role="button">`)
2. All interactive ARIA elements must be keyboard accessible
3. Don't use `role="presentation"` or `aria-hidden="true"` on focusable elements
4. All form inputs must have associated labels (`<label for>` or `aria-label`)
5. Use `aria-describedby` for supplementary help text or error messages

## 5. Forms

### Labels and Instructions
- Every input has a visible `<label>` associated via `for`/`id`
- Required fields marked with text ("Required"), not just an asterisk
- Group related fields with `<fieldset>` and `<legend>`
- Placeholder text is NOT a substitute for labels

### Error Handling
- Errors announced to screen readers (use `aria-live="assertive"` or `role="alert"`)
- Error messages associated with fields via `aria-describedby`
- Errors described in text (not just color — "Password must be 8+ characters")
- Focus moved to first error field on form submission failure
- Error messages explain what went wrong AND how to fix it

### Autocomplete
- Use `autocomplete` attribute for personal data fields (name, email, address, etc.)
- Helps password managers and assistive technology fill forms correctly

## 6. Images and Media

### Alt Text
- Decorative images: `alt=""` (empty alt, not missing alt)
- Informative images: Describe the content and function, not the appearance
- Complex images (charts, diagrams): Provide detailed description via `aria-describedby` or adjacent text
- Icons with meaning: Use `aria-label` on the icon or parent interactive element

### Video and Audio
- Captions for all video content (auto-generated captions are a start, not sufficient)
- Audio descriptions for video where visual content conveys information not in dialogue
- Transcript available for audio-only content
- Media player controls are keyboard accessible

## 7. Color, Contrast, and Visual Design

### Text Contrast
- Normal text (< 18px): minimum 4.5:1 contrast ratio
- Large text (≥ 18px or ≥ 14px bold): minimum 3:1 contrast ratio
- UI components and graphical objects: minimum 3:1 contrast ratio

### Color Usage
- Never use color as the only way to convey information
- Error states: Use red color + icon + text description
- Status indicators: Use color + shape/icon + text label
- Links: Use color + underline (or other non-color indicator)

### Readable Layout
- Maximum line length: 65-75 characters for comfortable reading
- Consistent spacing between elements for visual parsing
- Minimum line height of 1.5 for body text
- Paragraph spacing at least 1.5x the font size

### High Contrast Mode
- Test with Windows High Contrast mode and forced-colors media query
- Use `@media (forced-colors: active)` to adjust styles as needed
- Ensure borders and outlines remain visible in high contrast mode
- Avoid using `background-image` for essential information (invisible in high contrast)

### Placeholder and Label Rules
- Never rely on placeholder text as the only label — it disappears on input
- Visible labels must remain visible at all times, even when fields have values
- Floating labels are acceptable only if they remain visible after input

### Font and Readability
- Provide font fallbacks in font stacks for robust rendering
- Avoid thin font weights (< 400) for body text — reduces readability
- Text placed over images must have sufficient contrast (use overlay/scrim)
- Avoid justified text alignment — uneven spacing harms readability for dyslexic users

## 8. Content and Language Accessibility

### Plain Language
- Write at an 8th-grade reading level or below for general audiences
- Use short sentences and paragraphs
- Avoid jargon, abbreviations, and technical terms without explanation
- Define acronyms on first use: "Web Content Accessibility Guidelines (WCAG)"

### Consistent Terminology
- Use the same term for the same concept throughout the application
- Label matching: button text, page titles, and navigation links should use identical terms
- Avoid synonyms for the same action ("Save" vs "Submit" vs "Confirm" for the same operation)

### Error Messages That Explain Fixes
- Bad: "Invalid input" — Good: "Email must include @ and a domain (e.g., name@example.com)"
- Always tell users what to do, not just what went wrong
- Provide examples of valid input where appropriate

### Language and Locale Tagging
- Set `lang` attribute on `<html>` and on inline content in a different language
- Use `hreflang` on links pointing to content in other languages
- Format dates, numbers, and currency according to user locale

### Icon Clarity
- Avoid ambiguous icons without accompanying text labels
- If space is constrained, use `aria-label` or tooltip for icon meaning
- Ensure icons are consistent with established conventions (e.g., trash = delete)

## 9. Accessible Components

### Modals and Dialogs
- Focus trap: Tab cycles within the modal, not behind it
- Label: `aria-labelledby` pointing to the modal title
- Close: X button, Escape key, and optional backdrop click
- Focus returns to the trigger element on close
- Background content is inert (`aria-hidden="true"` or `inert` attribute on siblings)

### Menus and Dropdowns
- Trigger button has `aria-haspopup="true"` and `aria-expanded`
- Arrow keys navigate menu items; Enter/Space activates
- Escape closes the menu and returns focus to trigger
- `role="menu"` with `role="menuitem"` children

### Toasts and Notifications
- Use `role="status"` or `aria-live="polite"` for non-critical notifications
- Use `role="alert"` for urgent notifications requiring attention
- Persistent error toasts must be dismissible and focusable
- Auto-dismissing toasts should have sufficient display time (5+ seconds)

### Drag and Drop
- Always provide a keyboard alternative (move up/down buttons, reorder via menu)
- Announce drag state to screen readers: "Item grabbed", "Item dropped at position 3"
- Use `aria-grabbed` and `aria-dropeffect` (or custom live region announcements)

### Infinite Scroll
- Provide a "Load more" button as an alternative to automatic infinite scroll
- Announce loaded content to screen readers via live region
- Ensure focus management does not reset to top of page on content load
- Preserve scroll position and focus when new content loads

### File Upload Controls
- Use native `<input type="file">` — can be visually styled with accessible overlay
- Announce selected file name to screen readers
- Provide clear instructions for acceptable file types and size limits
- Drag-and-drop upload must have a keyboard-accessible equivalent

## 10. Motion and Animation

### Reduced Motion
- Respect `prefers-reduced-motion` media query across the entire application
- Provide `@media (prefers-reduced-motion: reduce)` overrides for all animations
- Essential animations (progress indicators) can remain, decorative animations should stop

### Auto-Playing Content
- No auto-playing animations without user-accessible pause/stop controls
- No auto-playing audio — if audio plays, provide immediate mute/stop
- Limit or remove parallax effects — they cause motion sickness for some users

### Animation Guidelines
- Keep animations short (200-300ms for micro-interactions)
- Avoid animations that cover large portions of the screen
- Provide alternative static states when motion is reduced
- Use `will-change` and `transform` for hardware-accelerated animations (less jank)

## 11. Testing Checklist

### Automated Tools
- axe DevTools or Lighthouse accessibility audit
- HTML validator for semantic correctness
- Color contrast checker

### Manual Testing
- Navigate entire app using only keyboard (no mouse)
- Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- Zoom to 200% and verify layout doesn't break
- Test with high contrast mode enabled
- Verify focus management in modals, menus, and dynamic content

### Zoom Testing
- Test at 200%, 300%, and 400% zoom levels
- Verify no content is clipped or overlaps at high zoom
- Ensure horizontal scrolling is not required at 200% zoom (320px equivalent)
- Text reflows properly — no fixed-width containers that cause overflow

### Mobile Accessibility Testing
- Test with VoiceOver on iOS and TalkBack on Android
- Verify touch targets are at least 44x44px
- Test swipe gestures work with screen reader enabled
- Ensure custom gestures have alternative controls

### Reduced Motion Testing
- Enable `prefers-reduced-motion: reduce` in OS settings
- Verify all decorative animations stop
- Verify essential animations (progress, loading) continue
- Check that transitions are instant or very short

### High Contrast Mode Testing
- Test with Windows High Contrast mode
- Verify all text remains readable
- Verify focus indicators remain visible
- Verify icons and UI elements do not disappear

### Accessible Name/Role/Value Verification
- Every interactive element has an accessible name (check in accessibility tree)
- Roles match the element's purpose (button, link, checkbox, etc.)
- States (checked, expanded, selected, disabled) are correctly communicated
- Values (slider position, progress, selected option) are accessible

### Regression Checks
- Test focus behavior after code changes (focus order, focus return, traps)
- Verify ARIA attributes are correct after component refactors
- Run axe-core in CI to catch regressions automatically
- Include accessibility checks in E2E test suite

## 12. A11y Governance and Standards Compliance

### Target Standards
- WCAG 2.1 AA as the baseline for all projects
- WCAG 2.2 AA as the target for new features
- Section 508 compliance for government or public-sector projects
- EN 301 549 for European Union accessibility requirements

### Accessibility Acceptance Criteria
- Every user story includes a11y acceptance criteria
- Example: "User can complete checkout using keyboard only"
- Example: "Error messages are announced by screen readers"
- A11y criteria are tested before a story is marked complete

### Accessible Component Library Rules
- All shared components must pass axe-core with zero violations
- Components must include keyboard interaction documentation
- ARIA patterns must follow WAI-ARIA Authoring Practices Guide
- Component demos include screen reader testing notes

### Accessibility Review Process
- A11y review is a required step in code review for UI changes
- Use a11y checklist during design reviews (before implementation)
- Schedule periodic a11y audits (quarterly for mature products)
- Track and prioritize a11y issues alongside functional bugs

### Documented Accessibility Patterns
- Maintain an internal a11y pattern library with approved implementations
- Document keyboard interactions for every custom widget
- Provide code examples for common patterns (modals, tabs, forms)
- Reference WAI-ARIA Authoring Practices for standard widget patterns
