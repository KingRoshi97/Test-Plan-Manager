# Internationalization (i18n) & Localization Best Practices

## Translation Systems

### Message Catalogs
- Organize translations by namespace/feature: `auth.login.title`, `dashboard.header.welcome`
- Use structured keys (dot-notation), never raw strings as keys
- Store translations in JSON or YAML files per locale: `en.json`, `fr.json`, `ja.json`
- Keep one file per namespace per locale for large apps (lazy-loading friendly)

### Translation Workflow
- Author strings in default locale (usually English)
- Extract translatable strings from code (automated tooling: i18next-parser, formatjs CLI)
- Send to translators with context (screenshots, descriptions, max length)
- Review translated strings in-app (visual QA per locale)
- Ship translations as part of build or lazy-load from CDN

### String Externalization Rules
- Never hardcode user-visible strings in components — always use translation keys
- Includes: labels, buttons, headings, error messages, tooltips, placeholder text, alt text
- Excludes: log messages, dev-only strings, system identifiers
- Use translation function consistently: `t('key')` or `<Trans>` component

### Fallback Language Strategy
- Define fallback chain: `fr-CA` → `fr` → `en` (specific → general → default)
- Show default language string rather than empty/broken UI
- Log missing translation warnings in development (not production)
- Track missing translations as tech debt items

### Pluralization and Gender
- Use ICU MessageFormat or library-specific plural rules
- Support zero, one, few, many, other plural forms (varies by language)
- Handle gender-aware strings where languages require it (French, German, Arabic)
- Never build plurals via string concatenation (`count + " items"` breaks in most languages)

### Variable Interpolation
- Use named placeholders: `"Hello, {name}"` not positional `"Hello, %s"`
- Sanitize interpolated values (prevent XSS through translated strings)
- Provide translators with variable descriptions and examples
- Handle cases where interpolated values change string length dramatically

### Lazy-Loading Translation Bundles
- Load only the active locale's translations on initial load
- Lazy-load additional namespaces as user navigates to features
- Cache loaded translations in memory and localStorage
- Pre-fetch likely next locales (e.g., if user switches to settings page)

## RTL (Right-to-Left) Support

### Layout Mirroring Rules
- Use CSS logical properties: `margin-inline-start` not `margin-left`
- Use `dir="rtl"` on `<html>` element for RTL locales
- Flexbox and Grid handle RTL automatically with logical properties
- Mirror layout but NOT content (text flows RTL, but progress bars still fill left-to-right)

### RTL-Safe Component Styles
- Replace physical properties with logical equivalents:
  - `padding-left` → `padding-inline-start`
  - `border-right` → `border-inline-end`
  - `text-align: left` → `text-align: start`
  - `float: left` → `float: inline-start`
- Use `direction`-aware positioning for absolute/fixed elements

### Icon Direction Handling
- Mirror directional icons in RTL: arrows, chevrons, back/forward, reply
- Do NOT mirror: play/pause, checkmarks, clocks, non-directional icons
- Use CSS `transform: scaleX(-1)` for icon mirroring
- Handle bidirectional text icons (search, settings) — no mirroring needed

### Mixed-Direction Text
- Use `unicode-bidi: isolate` for embedded opposite-direction text
- Wrap LTR content in RTL context with `<bdi>` or `dir="ltr"` attribute
- Test email addresses, URLs, and code snippets in RTL layouts
- Handle number display (numbers are always LTR, even in RTL text)

### RTL Testing
- Test all key screens in RTL mode
- Verify scrollbar position (right side in LTR, left side in RTL)
- Check overflow and truncation behavior
- Verify modal/dialog positioning
- Test form layouts (labels, inputs, error messages)

## Date, Time, and Number Formatting

### Locale-Aware Date Formats
- Use `Intl.DateTimeFormat` for locale-appropriate formatting
- Common formats: short (`1/15/26`), medium (`Jan 15, 2026`), long (`January 15, 2026`)
- Respect locale conventions: MM/DD/YYYY (US) vs DD/MM/YYYY (EU) vs YYYY/MM/DD (JP)
- Never hardcode date format strings — always derive from locale

### Time Zone Handling
- Store all dates in UTC in database and API responses
- Convert to user's local timezone for display
- Distinguish: user timezone, event timezone, system timezone
- Show timezone indicator for ambiguous contexts ("3:00 PM EST")
- Handle daylight saving time transitions correctly
- Use `Intl.DateTimeFormat` with `timeZone` option

### Relative Time Formatting
- Use `Intl.RelativeTimeFormat` for "5 minutes ago", "in 3 days"
- Switch from relative to absolute after a threshold (e.g., > 7 days → show full date)
- Update relative times periodically (every 60 seconds for "minutes ago")
- Handle edge cases: "just now", "yesterday", "last week"

### Number Formatting
- Use `Intl.NumberFormat` for locale-specific formatting
- Thousands separator: comma (US), period (DE), space (FR)
- Decimal separator: period (US), comma (DE/FR)
- Never assume `1,234.56` format — always use `Intl.NumberFormat`

### Currency Formatting
- Use `Intl.NumberFormat` with `style: 'currency'`
- Store amounts as integers (cents) — format only for display
- Show currency symbol in locale-appropriate position ($100 vs 100€ vs ¥100)
- Handle currency-specific decimal rules (JPY has no decimals, BHD has 3)
- Display amounts with proper rounding rules per currency

### Unit Formatting
- Use `Intl.NumberFormat` with `style: 'unit'` for distances, weights, temperatures
- Support metric and imperial based on locale or user preference
- Handle unit conversions server-side or client-side with a consistent strategy
- Display units with proper abbreviations per locale

## Locale-Aware Sorting and Search

### Collation-Aware Sorting
- Use `Intl.Collator` for locale-correct string comparison
- Handle accented characters: é = e in French sorting
- Handle case sensitivity per locale conventions
- Sort names by locale rules (family name first in CJK cultures)

### Search and Filtering
- Normalize search input and content (Unicode NFC normalization)
- Handle diacritic-insensitive search (resume matches résumé)
- Handle CJK tokenization (word boundaries differ from Latin scripts)
- Implement locale-aware case folding (Turkish İ ↔ i is different from English I ↔ i)

## Content and Layout Resilience

### Text Expansion Handling
- German and Finnish can be 30-40% longer than English
- CJK text may be shorter but taller (different line height needs)
- Test with pseudo-localization (expand all strings by 30-50% with markers)
- Use flexible layouts that accommodate varying text lengths
- Set max-widths and truncation with ellipsis for constrained spaces

### Line Wrapping and Truncation
- Prefer wrapping over truncation (truncation loses information)
- When truncating: add ellipsis and show full text on hover/tooltip
- Handle word-break rules per language (CJK allows break anywhere, Latin at word boundaries)
- Use `overflow-wrap: break-word` for long unbreakable strings (URLs, emails)

### Font Coverage
- Choose fonts with broad Unicode coverage for multi-language support
- Provide font fallback stacks per script (Latin, CJK, Arabic, Devanagari)
- Test special characters: accented letters, non-Latin scripts, emoji
- Consider font file size (CJK fonts are large — subset or lazy-load)

## Input and Typography Localization

### Localized Input Formats
- Phone numbers: vary by country (use libphonenumber for validation/formatting)
- Addresses: field order and requirements vary by country
- Postal codes: format varies (US: 5-digit/ZIP+4, UK: alphanumeric, JP: 7-digit)
- Names: not all cultures have first/last name (use full name field or flexible structure)

### Localized Keyboards and IME
- Support IME input (composition events) for CJK languages
- Don't restrict input length during IME composition
- Handle composition start/end events correctly
- Test autocomplete and autofill with non-Latin keyboards

### Locale-Specific Punctuation
- Quotation marks: "English" vs «French» vs „German" vs 「Japanese」
- List separators: comma (English) vs semicolon (some European locales)
- Use locale-aware formatting functions, not hardcoded punctuation

## Locale and Preference Management

### Locale Detection Strategy
1. User's explicit setting (highest priority)
2. Stored preference (localStorage or user profile)
3. Browser/device language (`navigator.languages`)
4. IP-based geolocation (lowest priority, least reliable)
- Allow user to override auto-detected locale at any time

### Persisted Locale Settings
- Save locale preference in user profile (server-side for cross-device)
- Fallback to localStorage for anonymous users
- Apply locale immediately (no page reload — update `lang` attribute and reload translations)
- Sync locale change across open tabs (storage event listener)

## Testing and QA for i18n

### Pseudo-Localization Testing
- Expand all strings by 30-50% with markers: `[!!! Ÿőűŕ Ŧĕxŧ !!!]`
- Catches: truncation issues, hardcoded strings, layout breakage, concatenation bugs
- Run pseudo-locale in CI to prevent regressions
- Use as a visual QA step before sending to real translators

### RTL Regression Tests
- Automated visual regression tests for RTL layouts
- Check key screens in both LTR and RTL
- Verify icon mirroring, text alignment, scroll direction

### Locale Coverage Matrix
- Define tier-1 locales (fully tested, highest quality)
- Define tier-2 locales (functional, limited visual QA)
- Track translation completeness per locale (dashboard or CI check)
- Block release if tier-1 locale coverage drops below threshold

### Date/Time and Currency Checks
- Verify date formatting in each supported locale
- Verify currency display for each supported currency
- Test with various timezone offsets
- Verify number formatting (thousands, decimals)

### Screenshot/Visual Checks
- Generate screenshots for key screens in each locale
- Visual diff against baseline for regression detection
- Manual review for RTL and non-Latin scripts
- Check for overlapping text, broken layouts, invisible characters
