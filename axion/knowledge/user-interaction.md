# User Interaction Best Practices

## Interaction Design Implementation

### Click/Tap/Hover Behaviors
- Click targets: minimum 44x44px (WCAG), recommended 48x48px for touch
- Hover effects: visual feedback only, never gate functionality behind hover (mobile has no hover)
- Active state (press): subtle scale or color shift for tactile feedback
- Double-click: avoid as primary interaction (unreliable on touch devices)
- Right-click / long-press: use for contextual menus (provide alternative access paths)

### Focus States and Keyboard Interactions
- Visible focus indicator on all interactive elements (minimum 2px outline, 3:1 contrast)
- Never remove outline without providing a visible replacement
- Focus-visible: apply focus ring only for keyboard users (`:focus-visible`), not mouse clicks
- Tab order matches visual layout (left-to-right, top-to-bottom)
- Custom focus management for modals, dialogs, drawers (trap and restore)

### Drag-and-Drop
- Provide keyboard alternative for all drag-and-drop interactions
- Show visual affordance (drag handle icon, cursor change)
- Provide drop zone feedback (highlight valid targets, reject invalid)
- Support both mouse and touch drag (pointer events)
- Announce drag state changes to screen readers
- Handle edge cases: dropping outside valid zone, rapid dragging, scroll-while-dragging

### Gestures (Mobile)
- Swipe: use for navigation (back), reveal actions (swipe-to-delete), dismiss
- Pinch-to-zoom: enable for images and maps, disable for general UI
- Long-press: use for context menus or selection mode
- Pull-to-refresh: standard pattern for list/feed refreshing
- Always provide button/tap alternatives to all gesture interactions

### Scroll Behaviors
- Scroll position restoration on back navigation
- Scroll snap for carousels and paginated content
- Infinite scroll: provide "Load more" button alternative for accessibility
- Smooth scroll for anchor links (respect `prefers-reduced-motion`)
- Sticky headers/toolbars during scroll (high z-index, shadow on scroll)
- Prevent body scroll when modal/drawer is open (scroll lock)

### Touch Target Sizing and Spacing
- Minimum touch target: 48x48px (including padding/hit area)
- Minimum spacing between touch targets: 8px
- Hit slop: extend tappable area beyond visual bounds for small elements
- Disabled elements: maintain size but reduce opacity and remove hit target

### Selection Patterns
- Single select: radio buttons, dropdown, segmented control
- Multi-select: checkboxes, chips with toggle, shift-click for range
- Select all / deselect all for bulk operations
- Show selection count and provide bulk action bar

## Input Handling

### Keyboard Shortcuts / Hotkeys
- Document all shortcuts in an accessible help dialog (usually `?` key)
- Don't override browser/OS shortcuts (Ctrl+C, Ctrl+V, Ctrl+Z)
- Use modifier keys for app shortcuts (Ctrl/Cmd + key)
- Make shortcuts discoverable (show in tooltips, menu items)
- Allow customization for power users (optional, advanced feature)

### Pointer Events
- Use pointer events API (covers mouse, touch, and stylus)
- Handle `pointerdown`, `pointermove`, `pointerup` for custom interactions
- Use `touch-action: none` only when implementing custom touch handling
- Handle multi-touch carefully (two-finger scroll should not trigger single-tap actions)

### Input Debouncing and Throttling
- **Debounce** search inputs: 300ms (wait for user to stop typing)
- **Throttle** scroll/resize handlers: 100-200ms (process periodically)
- **Debounce** window resize: 250ms (layout recalculation)
- **Throttle** drag/pointermove: 16ms (match frame rate, 60fps)
- Use `requestAnimationFrame` for visual updates instead of setTimeout

### Preventing Double-Submit
- Disable submit button immediately on click
- Show loading indicator on the button
- Use idempotency keys for critical operations (payments, transfers)
- Re-enable button on error (allow retry)
- Server-side deduplication as safety net (idempotency key in header)

### Copy/Paste Patterns
- Enable paste in all text inputs (never disable paste, especially for passwords)
- Sanitize pasted content: strip formatting for plain text fields
- Support paste of structured data (email lists, CSV data) where appropriate
- Provide "Copy to clipboard" buttons for shareable content (show confirmation toast)

### Input Validation Timing
- Validate on blur for first interaction (don't show errors while user is still typing)
- Switch to onChange validation after first error (immediate feedback on corrections)
- Validate on submit as a final safety net
- Show inline validation status (checkmark for valid, error for invalid)

### Autofill and IME Support
- Don't fight browser autofill — use correct `autocomplete` attributes
- Support IME (Input Method Editor) for international keyboards
- Handle composition events (`compositionstart`, `compositionend`) for CJK input
- Style autofilled fields to match design (override browser's yellow background)

### File Inputs
- Drag-and-drop zone with click-to-browse fallback
- Show file type restrictions and size limits before selection
- Support camera roll and capture on mobile (accept attribute)
- Multi-file: show list of selected files with individual remove buttons
- Preview images inline, show icon + name for other file types

## Micro-Interactions and Feedback

### Loading States
- **Skeleton screens**: preferred for content areas (matches layout shape)
- **Spinners**: for discrete actions (button press, form submit)
- **Progress bars**: for operations with known duration (upload, multi-step process)
- **Inline**: small spinner next to the triggering element
- Minimum display time: 300ms to avoid loading flash

### Progress Indicators
- Determinate: show percentage for operations with known total (file upload, data import)
- Indeterminate: show activity for unknown duration (searching, processing)
- Step indicator: show current step for multi-step workflows
- Always show progress for operations > 1 second

### Toast/Snackbar Notifications
- Position: top-right desktop, bottom-center mobile
- Duration: 3-5 seconds for success/info, persistent for errors requiring action
- Max visible: 3 stacked, queue additional
- Dismissible: X button and/or swipe gesture
- Action: optional inline action (e.g., "Undo" after delete)

### Confirm Dialogs
- Use for destructive actions (delete, discard unsaved changes, leave page)
- Action button text describes the action ("Delete Project" not "OK")
- Destructive action button uses danger/destructive color variant
- Provide cancel as the safest default (Escape key, click backdrop)
- For very destructive actions: require typing confirmation text

### Undo/Redo Patterns
- Prefer undo over confirmation dialogs (less disruptive workflow)
- Show undo option in toast notification (5-10 second window)
- Implement undo stack for content editing (Ctrl+Z/Cmd+Z)
- Limit undo history (20-50 actions) to prevent memory issues

### Status Indicators
- Online/offline: dot indicator (green/grey) with label
- Syncing: animated sync icon or "Saving..." text
- Saved: checkmark with "Saved" text (fade after 2-3 seconds)
- Error: persistent red indicator with retry action
- Unread/new: badge counter or dot indicator

### Empty States
- First-run/new user: welcoming message with getting-started action
- No data: helpful message with creation action ("No projects yet. Create your first project.")
- No search results: suggest alternative search terms or clearing filters
- Error state: explain what went wrong, provide retry or alternative actions

### Notification Badges and Counters
- Position: top-right corner of the icon/avatar
- Show count for small numbers (1-99), "99+" for larger
- Dot only (no count) for binary new/unread state
- Clear badge on view/dismiss
- Update in real-time (WebSocket/polling)

## Animations and Transitions

### Page Transitions
- Fade in/out for route changes (200-300ms)
- Slide for hierarchical navigation (push forward, slide back)
- Shared element transitions for visual continuity (expand card → full page)
- Keep transitions brief: 200-400ms total duration

### Component Entrance/Exit
- Fade + slight translate for appearing elements (opacity 0→1, translateY 10px→0)
- Use `AnimatePresence` (Framer Motion) or CSS transitions for exit animations
- Stagger list item animations (50-100ms delay between items, cap at 5-6 items)
- Don't animate elements that appear above the fold on initial load (hurts perceived performance)

### Motion Accessibility
- Respect `prefers-reduced-motion`: disable decorative animations, keep functional ones
- Functional animations: loading spinners, progress bars, page transitions (reduce, don't eliminate)
- Decorative animations: parallax, background motion, hover effects (disable entirely)
- Never auto-play animations without user control
- Avoid flashing more than 3 times per second (seizure trigger risk)

### Animation Performance
- Use GPU-friendly properties only: `transform`, `opacity` (avoid animating layout properties)
- Use `will-change` sparingly and only for known-to-animate elements
- Prefer CSS transitions over JavaScript animations for simple cases
- Use `requestAnimationFrame` for JavaScript animations (never `setInterval`)
- Test animation performance on low-end devices

### Timing Standards
| Speed | Duration | Use Case |
|-------|----------|----------|
| Instant | 0-100ms | Button press feedback, toggle |
| Fast | 100-200ms | Tooltip show/hide, dropdown open |
| Normal | 200-400ms | Modal open/close, page transition |
| Slow | 400-700ms | Complex layout changes, drawer slide |

### Motion Consistency
- Use consistent easing across the app (ease-out for entrances, ease-in for exits)
- Match animation direction to interaction (swipe right → slide right)
- Keep animation style consistent (don't mix bounce and linear in the same app)
- Define motion tokens in design system (duration, easing, distance)

## UX Reliability Patterns

### Optimistic UI
- Apply change immediately on user action (before server confirms)
- Revert on server error with clear feedback (toast with error message)
- Use for frequent, low-risk actions: like, bookmark, mark as read, toggle
- Avoid for irreversible or high-value actions: payments, account deletion, sending messages

### Idempotent Actions in UI
- Repeat clicking a "like" button should toggle, not create multiple likes
- Retry actions should not create duplicate resources (use idempotency keys)
- Show action state clearly so user knows if action was already performed

### Race Condition Handling
- Cancel stale requests when new ones are initiated (AbortController)
- Use request IDs or sequence numbers to ignore out-of-order responses
- TanStack Query handles this automatically with queryKey-based cancellation
- For mutations: disable trigger until previous mutation completes, or queue

### Retry UX Patterns
- Auto-retry transient failures (network timeout) with exponential backoff
- Show manual retry button for persistent failures ("Something went wrong. Try again")
- Distinguish auto-retry (show "Retrying...") from user-initiated retry (show "Try Again" button)
- After max retries, show clear failure state with alternative actions

### Safe Destructive Actions
- Require explicit confirmation for irreversible actions (delete account, purge data)
- Prefer soft delete with undo over hard delete with confirmation
- Time-delayed execution: "This action will take effect in 30 seconds. [Undo]"
- Type-to-confirm for the most dangerous operations

### Reconnect and Recovery
- Auto-reconnect WebSocket connections with exponential backoff
- Show connection status indicator during disconnection
- Queue offline actions and sync when connection restores
- Handle session expiration gracefully (re-auth prompt, not silent failure)

## Personalization and Preferences

### Saved Preferences
- Theme (light/dark/system)
- Language / locale
- Display density (compact/comfortable/spacious)
- Default views (landing page, default filters, sort order)
- Notification preferences (channels, frequency)
- Accessibility preferences (font size, contrast, reduce motion)

### Persistence
- Store preferences in user profile (server-side) for cross-device sync
- Fallback to localStorage for anonymous users
- Apply preferences immediately (no page reload required)
- Provide reset-to-defaults option
- Respect OS-level preferences as defaults (color scheme, language, reduce motion)

## Navigation Interaction Patterns

### Back Behavior
- Browser back button should always work predictably
- Modals: back should close modal (not navigate away from page)
- Multi-step flows: back returns to previous step (not previous page)
- Search results: back restores previous search and scroll position
- Use `history.replaceState` for state that shouldn't create back-button entries

### Deep Linking
- Every meaningful view should have a unique URL
- Share URLs should restore full view state (filters, selected item, active tab)
- Handle invalid deep links gracefully (redirect to parent, show 404)
- Open-in-new-tab should work for all navigable links (use `<a>` elements, not onClick handlers)

### Modal Navigation
- Modals should not create history entries (unless deep-linkable)
- Stacking: avoid more than 2 levels of modals (use navigation instead)
- Dismissal: Escape key, click backdrop, X button
- Large content: use a full-page drawer or separate route instead of a modal

## Onboarding and Learnability

### Tooltips and Coach Marks
- Show on first visit, don't repeat (persist dismissal state)
- Highlight one feature at a time (sequential, not all-at-once)
- Provide "Skip tour" and "Next" controls
- Don't block critical interactions with tooltip overlays

### Progressive Disclosure
- Show essential controls by default, reveal advanced options on demand
- Use "Advanced settings" expandable sections
- Show simplified view for new users, full view for power users
- Feature hints: "Did you know?" contextual tips (non-blocking)

### First-Time User Experience (FTUE)
- Minimize steps to first value (reduce time-to-wow)
- Provide sample data or templates to explore immediately
- Guide user through first critical action (create first project, send first message)
- Celebrate completion of onboarding milestones (subtle, not obnoxious)

### Error Education
- First-time errors: include extra context and help link
- Repeated errors: offer alternative approaches or link to documentation
- Complex features: provide inline help toggle (expand/collapse help text)
