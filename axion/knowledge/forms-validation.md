# Forms & Validation Best Practices

## Form State Management

### Controlled vs. Uncontrolled
- Prefer controlled forms for complex validation and dynamic behavior
- Use React Hook Form (controlled with minimal rerenders) as default
- Uncontrolled only for simple, one-off inputs with no cross-field logic
- Register all form fields with the form library (avoid orphaned state)

### Form Libraries
- **React Hook Form**: Default choice — minimal rerenders, Zod integration, excellent DX
- **Formik**: Legacy alternative, more verbose but well-documented
- **Native forms**: Only for simple single-field forms (search, newsletter signup)
- Always use `zodResolver` to tie form validation to shared schema types

### Form State Shape
- Track: values, errors, touched/dirty, isSubmitting, isValid, submitCount
- Distinguish "pristine" from "dirty" (has the user changed anything?)
- Track field-level state: value, error, isTouched, isDirty
- Reset form state after successful submission or on explicit user action

### Default Values
- Always provide default values for all fields (even empty string for text inputs)
- Load defaults from server data for edit forms (pre-populate on mount)
- Handle async default loading (show skeleton until defaults are ready)
- Distinguish between "no value" (empty default) and "null value" (explicit null from server)

## Field Validation

### Validation Timing
| Strategy | When to Validate | Best For |
|----------|-----------------|----------|
| On submit | Only when user submits | Simple forms, fewer fields |
| On blur | When user leaves field | Medium complexity forms |
| On change | As user types | Real-time feedback, search |
| Debounced | After typing pause (300ms) | Async validation, search |
| On blur + on change after first error | Blur first, then change | Best UX for most forms |

### Sync Validation Rules
- Required: field must have a non-empty value
- Type: email, URL, phone number, date format
- Length: minLength, maxLength for strings
- Range: min, max for numbers and dates
- Pattern: regex for custom formats (postal codes, license plates)
- Custom: business rules (password strength, username availability)

### Async Validation
- Use for server-side checks (email uniqueness, username availability, address verification)
- Debounce async validators (300-500ms) to avoid excessive API calls
- Show inline loading indicator during async validation
- Cache results to avoid re-validating unchanged values
- Handle network errors gracefully (don't block submission on validation timeout)

### Cross-Field Validation
- Password confirmation: match against password field
- Date ranges: end date must be after start date
- Conditional required: field required only when another field has certain value
- Sum constraints: percentages must total 100%, budget allocation must not exceed total
- Implement at form level, not field level (needs access to multiple values)

### Validation with Zod
- Define schemas in shared module (used by both frontend and backend)
- Use `.refine()` for custom validation rules
- Use `.superRefine()` for cross-field validation
- Use `.transform()` to normalize data before submission
- Use `.extend()` to add frontend-only validation (confirm password) to shared schemas

## Input Masking and Formatting

### Common Masks
- **Phone**: `(555) 555-5555` — format on blur, strip formatting before submission
- **Credit card**: `4111 1111 1111 1111` — format as user types, detect card type
- **Currency**: `$1,234.56` — format display, store as integer cents
- **Date**: `MM/DD/YYYY` — use date picker component, validate range
- **SSN**: `***-**-1234` — mask on blur, show on focus for editing

### Formatting Rules
- Format for display, submit raw/unformatted values to API
- Don't fight the user: allow pasting formatted or unformatted values
- Show format hint in placeholder or helper text (not as the only label)
- Handle international formats (phone numbers, postal codes, dates)
- Use `Intl` API for locale-aware number and date formatting

## Error Messaging

### Error Message Guidelines
- Be specific: "Email must be a valid email address" not "Invalid input"
- Be helpful: suggest correction ("Did you mean gmail.com?")
- Be concise: one sentence, no jargon
- Use positive framing when possible: "Enter at least 8 characters" not "Too short"
- Never blame the user: "Password needs a number" not "You forgot a number"

### Error Display Patterns
- **Inline**: Show error below the field, associated via `aria-describedby`
- **Summary**: Show all errors at top of form (with links to fields) for long forms
- **Toast**: Only for submission-level server errors, not field validation
- Color: red/destructive color for errors, but always include text (not just color)
- Icon: error icon alongside text for additional visual cue

### Error Timing
- Don't show errors before user has interacted with the field
- Show errors on blur for first interaction, then on change for corrections
- Clear error immediately when user corrects the value
- On form submit: focus first error field, show all field errors simultaneously

### Server-Side Error Mapping
- Map server error codes to user-friendly messages on the frontend
- Associate server field errors with form fields (match field names)
- Handle generic server errors (500) with a fallback message and retry option
- Display server validation errors inline just like client errors

## Multi-Step Forms (Wizards)

### Step Navigation
- Show progress indicator (step dots, progress bar, or numbered steps)
- Allow backward navigation to review/edit previous steps
- Validate current step before allowing forward navigation
- Persist step data so back/forward doesn't lose input

### State Persistence Across Steps
- Store all step data in a single form state or context (not separate forms per step)
- Allow partial completion (user can save draft and return)
- Handle step dependencies (step 3 depends on step 1 answers)
- Reset downstream steps if upstream answers change (with user warning)

### Step Validation
- Validate only current step fields before advancing
- Show validation summary before final submission
- Allow "skip for now" for optional steps
- Re-validate all steps on final submission (server-side)

### Conditional Steps
- Show/hide steps based on previous answers (dynamic step flow)
- Update progress indicator to reflect actual (not maximum) steps
- Handle branching paths (different flows for different user types)

## Draft Saving and Autosave

### Autosave Patterns
- Save to localStorage on field blur or after debounced typing pause (2-3 seconds)
- Show "Saved" / "Saving..." / "Unsaved changes" indicator
- Prompt user before navigating away with unsaved changes ("Unsaved changes" guard)
- Restore draft on return (with "Resume draft?" prompt if data exists)

### Draft Lifecycle
- Clear draft on successful submission
- Set TTL on drafts (expire after 7-30 days)
- Handle conflicts between draft and server data (draft is stale)
- Allow explicit "Discard draft" action

### Server-Side Drafts
- Save drafts to server for cross-device access
- Use explicit "Save Draft" action (not automatic for server saves)
- Version drafts to handle concurrent editing
- Show draft list for users with multiple in-progress forms

## File Upload in Forms

### Upload UX
- Drag-and-drop zone with fallback file input button
- Show file preview (images) or file name/size (documents)
- Progress indicator for large uploads (percentage, bytes transferred)
- Allow removing selected files before submission
- Support multi-file selection where appropriate

### Upload Validation
- Client-side: file type (check extension AND MIME type), file size limit
- Show validation errors before upload begins (instant feedback)
- Server-side: re-validate type (magic bytes), scan for malware, enforce size limits
- Handle upload failures with retry option (don't lose other form data)

### Upload Patterns
- **Immediate upload**: Upload file on selection, get URL, submit URL with form
- **With form submission**: Upload file as part of multipart form submission
- **Chunked upload**: For large files, upload in chunks with resume capability
- Always show upload progress and allow cancellation

## Accessibility in Forms

### Labels and Instructions
- Every input has a visible `<label>` associated via `for`/`id`
- Required fields marked with text ("Required"), not just asterisk
- Group related fields with `<fieldset>` and `<legend>`
- Placeholder text is NOT a substitute for labels
- Provide help text via `aria-describedby` for complex fields

### Error Accessibility
- Errors announced to screen readers (use `aria-live="assertive"` or `role="alert"`)
- Error messages associated with fields via `aria-describedby`
- Focus moved to first error field on form submission failure
- Error state indicated by `aria-invalid="true"` on the field

### Keyboard Support
- Tab order follows visual layout
- Enter submits the form (unless in a textarea)
- Escape cancels/closes if form is in a modal
- Custom inputs (date pickers, comboboxes) support full keyboard navigation
- Don't override browser autocomplete/autofill unless necessary

## Form Performance

### Render Optimization
- Use React Hook Form (isolates rerenders to individual fields)
- Avoid controlled inputs for large forms (100+ fields) — use uncontrolled with register
- Virtualize long field lists (dynamic form builders)
- Debounce validation for expensive rules (async checks, complex computations)

### Submission Performance
- Disable submit button during submission (prevent double-submit)
- Show loading state on submit button (spinner or "Submitting...")
- Handle timeout: show error after 30 seconds, allow retry
- Idempotent submissions: use idempotency key for critical forms (payments, registrations)

## Complex Form Patterns

### Dynamic Fields
- Add/remove repeating field groups (addresses, phone numbers, line items)
- Use `useFieldArray` (React Hook Form) for managed dynamic lists
- Validate each item in the array independently
- Support reordering via drag-and-drop or move up/down buttons

### Dependent Fields
- Update field options based on other field values (country → state → city)
- Clear dependent field values when parent changes
- Show loading state while fetching dependent options
- Cache dependent options to avoid repeated fetches

### Read-Only and Disabled States
- Read-only: user can see and copy but not edit (use for confirmed data)
- Disabled: field is not applicable in current context (grey out, skip in tab order)
- Never disable the submit button based on form validity — let user attempt and show errors
- Show explanatory text for why a field is disabled ("Upgrade to unlock this feature")

### Confirmation Patterns
- Preview/review step before destructive or irreversible actions
- Type-to-confirm for dangerous actions ("Type 'DELETE' to confirm")
- Double-submit protection (disable button, show spinner, use idempotency key)
- Undo option after submission (for non-destructive actions)
