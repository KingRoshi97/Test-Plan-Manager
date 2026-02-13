# Copy Guide — {{DOMAIN_NAME}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:COPY_GUIDE -->

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}
**Prefix:** {{DOMAIN_PREFIX}}
**Type:** {{DOMAIN_TYPE}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: COPY_GUIDE defines all user-facing text content for a domain: labels, messages,
error text, empty states, tooltips, and any other copy the user reads. This ensures
consistent voice, tone, and messaging across the product.

SOURCES TO DERIVE FROM:
1. RPBS §10 Copywriting & Content Strategy — voice, tone, formality, forbidden patterns
2. RPBS §15 Error Handling — error message style and recovery actions
3. BELS Reason Codes — every error code needs a user-facing message here
4. SCREENMAP — every screen needs labels, headings, and potentially empty states
5. UX_Foundations — interaction patterns define when success/error messages appear

RULES:
- Every BELS reason code MUST have a corresponding user-facing message in this document
- Copy MUST follow the voice/tone defined in RPBS §10
- Error messages MUST be actionable — tell the user what happened AND what to do about it
- Never use technical jargon in user-facing messages
- If RPBS §10 Copywriting Toggles say "No" for a surface, leave those entries as [TBD]
- Use {{PRODUCT_NAME}} placeholder for product name references

CASCADE POSITION (fill priority 11 of 13):
- Upstream (read from): RPBS (§10 copywriting & content strategy, §15 error handling), BELS (reason codes → error messages), SCREENMAP (screens → page titles, empty states), UX_Foundations (interaction patterns → feedback messaging)
- Downstream (feeds into): ERC (locked copy at lock time), frontend code generation (string constants, i18n keys, error messages)
- COPY_GUIDE is filled late because it depends on knowing all screens (SCREENMAP), all error codes (BELS), and the voice/tone rules (RPBS) before writing user-facing text
-->

> Define all user-facing copy, labels, and messaging for this domain.
> Replace `[TBD]` with concrete content. Use `UNKNOWN` only when upstream truth is missing.

---

## Tone & Voice

<!-- AGENT: Copy these rules from RPBS §10 Copywriting & Content Strategy.
Every piece of copy in this document must follow these rules. -->

- **Voice characteristics:** UNKNOWN (e.g., friendly and encouraging, professional and concise)
- **Formality level:** UNKNOWN (e.g., casual — use contractions, avoid jargon)
- **Target reading level:** UNKNOWN (e.g., 8th grade / general audience)
- **Brand personality:** UNKNOWN (e.g., helpful expert, friendly companion)

### Forbidden Patterns
<!-- AGENT: Copy from RPBS §10 Forbidden Patterns. Never use these in any copy. -->
- UNKNOWN

### Writing Rules
<!-- AGENT: Domain-specific writing rules that apply to all copy below. -->
- Sentence case for all headings (not Title Case)
- UNKNOWN

---

## Page Titles & Headings

<!-- AGENT: For each screen in SCREENMAP, define the page title and main heading.
These must be consistent with navigation labels.

EXAMPLE:
| Screen Ref | Page Title (browser tab) | Main Heading | Subheading |
| fe_SCR_001 | Recipes — {{PRODUCT_NAME}} | Recipes | Discover and save your favorite recipes |
| fe_SCR_002 | {{Recipe Title}} — {{PRODUCT_NAME}} | {{Recipe Title}} | By {{Author Name}} |
| fe_SCR_003 | New recipe — {{PRODUCT_NAME}} | Create a new recipe | Share your culinary creation |
-->

| Screen Ref | Page Title (browser tab) | Main Heading | Subheading |
|-----------|------------------------|-------------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Labels & Headings

<!-- AGENT: Define labels for all UI controls, navigation items, and section headings.

EXAMPLE:
| Element ID | Context | Copy Text | Notes |
| fe_LBL_001 | Nav item | Recipes | Primary navigation |
| fe_LBL_002 | Button | Save recipe | Primary CTA on recipe detail |
| fe_LBL_003 | Form label | Recipe title | Required field |
| fe_LBL_004 | Tab label | Ingredients | Tab in recipe detail |
-->

| Element ID | Context | Copy Text | Notes |
|-----------|---------|-----------|-------|
| {{DOMAIN_PREFIX}}_LBL_001 | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Error Messages

<!-- AGENT: For EVERY reason code in BELS, define the user-facing message.
Messages must be: (1) understandable by non-technical users, (2) actionable (tell them what to do),
(3) honest about what happened without exposing internals.

EXAMPLE:
| Error Code | User-Facing Message | Recovery Action Text | Severity |
| RECIPE_NOT_FOUND | We couldn't find that recipe. It may have been deleted. | Browse other recipes | error |
| FORBIDDEN_NOT_OWNER | You don't have permission to edit this recipe. | Contact the recipe author | warning |
| VALIDATION_TITLE_REQUIRED | Please give your recipe a title. | — (inline, near field) | validation |
| TIER_LIMIT_REACHED | You've reached the limit for your current plan. Upgrade to create more recipes. | Upgrade plan | warning |
-->

| Error Code | User-Facing Message | Recovery Action Text | Severity |
|-----------|-------------------|---------------------|----------|
| UNKNOWN | UNKNOWN | UNKNOWN | error/warning/validation |

---

## Success Messages

<!-- AGENT: Define success feedback for completed actions.

EXAMPLE:
| Action | Message | Display Method | Duration |
| Recipe created | Recipe published successfully! | Toast | 3s auto-dismiss |
| Recipe saved | Changes saved | Toast | 2s auto-dismiss |
| Account created | Welcome to {{PRODUCT_NAME}}! | Page redirect + toast | 5s |
-->

| Action | Message | Display Method | Duration |
|--------|---------|---------------|----------|
| UNKNOWN | UNKNOWN | Toast/Inline/Redirect | UNKNOWN |

---

## Empty States

<!-- AGENT: For every screen/component that can show an empty list or no data,
define the empty state message and call-to-action.

EXAMPLE:
| Screen/Component | Empty State Message | Call to Action | CTA Target |
| Recipe List | No recipes yet | Create your first recipe | /recipes/new |
| Search Results | No recipes match your search | Try different keywords | clear search |
| Saved Recipes | You haven't saved any recipes yet | Browse recipes | /recipes |
| Notifications | You're all caught up! | — | — |
-->

| Screen/Component | Empty State Message | Call to Action | CTA Target |
|-----------------|-------------------|---------------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Confirmation Dialogs

<!-- AGENT: Destructive or significant actions that require user confirmation.

EXAMPLE:
| Action | Dialog Title | Dialog Message | Confirm Button | Cancel Button |
| Delete recipe | Delete this recipe? | This action cannot be undone. Your recipe and all its comments will be permanently deleted. | Delete recipe | Keep recipe |
| Leave page (unsaved) | Unsaved changes | You have unsaved changes. Are you sure you want to leave? | Leave without saving | Stay on page |
-->

| Action | Dialog Title | Dialog Message | Confirm Button | Cancel Button |
|--------|-------------|---------------|---------------|--------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Tooltips & Help Text

<!-- AGENT: Contextual help for UI elements that may not be self-explanatory.

EXAMPLE:
| Element | Tooltip/Help Text | Trigger |
| Visibility toggle | Make this recipe visible to everyone | hover |
| Difficulty selector | How challenging is this recipe for an average home cook? | hover/focus |
-->

| Element | Tooltip/Help Text | Trigger |
|---------|------------------|---------|
| UNKNOWN | UNKNOWN | hover/focus/click |

---

## Placeholder Text

<!-- AGENT: Placeholder/hint text for form inputs.

EXAMPLE:
| Input | Placeholder Text |
| Recipe title | e.g., "Grandma's chocolate chip cookies" |
| Search | Search recipes, ingredients, or chefs... |
| Description | Describe your recipe in a few sentences |
-->

| Input | Placeholder Text |
|-------|-----------------|
| UNKNOWN | UNKNOWN |

---

## Loading & Progress Messages

<!-- AGENT: What does the user see while waiting?

EXAMPLE:
| Action | Loading Message | Long Wait Message (>5s) |
| Page load | — (show skeleton) | — |
| Recipe save | Saving your recipe... | Still saving — hang tight! |
| Image upload | Uploading image... | Processing your image... |
-->

| Action | Loading Message | Long Wait Message (>5s) |
|--------|----------------|----------------------|
| UNKNOWN | UNKNOWN | UNKNOWN |

---

## Notification Copy

<!-- AGENT: Text for push notifications, email subjects, and in-app notification items.
Derive from BELS side effects that generate user-visible notifications.

RULES:
- Push notification titles should be under 50 characters
- Email subjects should be under 60 characters
- In-app notifications should include a verb and the relevant entity name
- All notification copy must follow the voice/tone rules above

EXAMPLE:
| Trigger Event | Channel | Title/Subject | Body | CTA |
| New follower | In-app | {{User}} started following you | — | View profile |
| Recipe published | Email | Your recipe "{{Title}}" is live! | Your recipe has been published and is now visible... | View recipe |
| Comment reply | Push | {{User}} replied to your comment | "{{Preview}}..." | View comment |
-->

| Trigger Event | Channel | Title/Subject | Body | CTA |
|--------------|---------|--------------|------|-----|
| UNKNOWN | In-app/Email/Push | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Accessibility Copy

<!-- AGENT: Text specifically for screen readers, ARIA labels, and alt text patterns.
These are NOT visible to sighted users but are critical for accessibility compliance.

RULES:
- Every interactive element without visible text needs an aria-label
- Every image needs an alt text pattern (can include dynamic values)
- Status changes must have aria-live region announcements
- Form errors must be announced to screen readers

EXAMPLE:
| Element | ARIA Label / Alt Text | Context |
| Close button (X icon) | Close dialog | Modal close button |
| User avatar | Profile picture of {{username}} | Comment thread |
| Sort button | Sort by {{column}}, currently {{direction}} | Data table header |
| Loading spinner | Loading content, please wait | Page load |
-->

| Element | ARIA Label / Alt Text | Context |
|---------|---------------------|---------|
| UNKNOWN | UNKNOWN | UNKNOWN |

---

## Localization Notes

<!-- AGENT: Guidelines for future internationalization (i18n) even if not launching multi-language.
These rules help the agent write copy that is easy to localize later.

RULES:
- Avoid concatenating strings with variables in the middle (hard to translate)
- Use ICU MessageFormat for plurals: "{count, plural, one {# item} other {# items}}"
- Date/time formats should use the user's locale, not hardcoded formats
- Currency display should use Intl.NumberFormat, not manual formatting
- Avoid idioms and cultural references that don't translate -->

- **Primary language:** UNKNOWN
- **Plural-sensitive strings:** UNKNOWN (list any strings that change based on count)
- **Date/time format:** UNKNOWN (e.g., user locale via Intl.DateTimeFormat)
- **Number format:** UNKNOWN (e.g., user locale via Intl.NumberFormat)
- **String concatenation policy:** UNKNOWN (e.g., use template literals with full sentences, avoid fragment concatenation)

---

## Open Questions
- UNKNOWN
