# Accessibility Best Practices (WCAG 2.1 AA)

## Core Principles (POUR)

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

## Keyboard Navigation

### Focus Management
- Visible focus indicator on all interactive elements (minimum 2px outline)
- Logical tab order following visual layout (left-to-right, top-to-bottom)
- Focus trapped inside modals/dialogs (Tab cycles within, Escape closes)
- Focus returned to trigger element when modal closes
- Skip-to-main-content link as first element

### Key Bindings
| Key | Expected Behavior |
|-----|-------------------|
| Tab | Move to next interactive element |
| Shift+Tab | Move to previous interactive element |
| Enter | Activate buttons and links |
| Space | Activate buttons, toggle checkboxes |
| Escape | Close modals, dismiss menus, cancel actions |
| Arrow keys | Navigate within composite widgets (tabs, menus, radio groups) |

## ARIA Patterns

### Landmark Roles
- `<header>` or `role="banner"` — Page header (one per page)
- `<nav>` or `role="navigation"` — Navigation sections (label if multiple)
- `<main>` or `role="main"` — Primary content (one per page)
- `<footer>` or `role="contentinfo"` — Page footer

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

## Forms

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

### Autocomplete
- Use `autocomplete` attribute for personal data fields (name, email, address, etc.)
- Helps password managers and assistive technology fill forms correctly

## Images and Media

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

## Color and Contrast

### Text Contrast
- Normal text (< 18px): minimum 4.5:1 contrast ratio
- Large text (≥ 18px or ≥ 14px bold): minimum 3:1 contrast ratio
- UI components and graphical objects: minimum 3:1 contrast ratio

### Color Usage
- Never use color as the only way to convey information
- Error states: Use red color + icon + text description
- Status indicators: Use color + shape/icon + text label
- Links: Use color + underline (or other non-color indicator)

## Testing Checklist

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

## Reduced Motion
- Respect `prefers-reduced-motion` media query
- Provide `@media (prefers-reduced-motion: reduce)` overrides for all animations
- Essential animations (progress indicators) can remain, decorative animations should stop
