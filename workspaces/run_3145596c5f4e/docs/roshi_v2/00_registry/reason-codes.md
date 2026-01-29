# Reason Codes

Format
`{DOMAIN}_{CATEGORY}_{CODE}` — Example: AUTH_CREDENTIALS_001

Guidelines
- DOMAIN: one of AUTH, VAL, BIZ, SYS.
- CATEGORY: short descriptor in ALL_CAPS (e.g., CREDENTIALS, TOKEN, TASK, DATABASE).
- CODE: three digits, unique within the DOMAIN.
- Messages are user-facing and should be shown verbatim or mapped to localized messages by the client.
- HTTP Status is the suggested response status the API should return with this reason code.

Notes
- All codes below follow the format above.
- If a code's applicability is uncertain for your environment, mark it UNKNOWN in your implementation checklist for follow-up.

## Authentication (AUTH)
| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|
| AUTH_CREDENTIALS_001 | Invalid Credentials | Username or password is incorrect. | 401 |
| AUTH_TOKEN_EXPIRED_002 | Token Expired | Authentication token has expired. Please sign in again. | 401 |
| AUTH_TOKEN_INVALID_003 | Invalid Token | Authentication token is invalid. Re-authenticate required. | 401 |
| AUTH_ACCESS_DENIED_004 | Access Denied | You do not have permission to perform this action. | 403 |
| AUTH_RATE_LIMIT_005 | Too Many Attempts | Too many authentication attempts. Try again later. | 429 |

## Validation (VAL)
| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|
| VAL_REQUIRED_FIELD_001 | Required Field Missing | One or more required fields are missing: {fields}. | 400 |
| VAL_INVALID_FORMAT_002 | Invalid Field Format | Field "{field}" has an invalid format. | 400 |
| VAL_DUEDATE_PAST_003 | Due Date In Past | Due date must be in the future. | 400 |
| VAL_STATUS_INVALID_004 | Invalid Status Value | Provided status "{value}" is not valid for tasks. | 400 |
| VAL_ATTACHMENT_TOO_LARGE_005 | Attachment Too Large | Attachment exceeds maximum allowed size of {max_bytes} bytes. | 400 |

Examples for client substitution:
- {fields} => "title, board_id"
- {field} => "email"
- {value} => "archived"
- {max_bytes} => "5,242,880"

## Business Logic (BIZ)
| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|
| BIZ_TASK_NOT_FOUND_001 | Task Not Found | The requested task (id: {task_id}) does not exist. | 404 |
| BIZ_BOARD_NOT_FOUND_002 | Board Not Found | The requested board (id: {board_id}) does not exist. | 404 |
| BIZ_ASSIGNMENT_CONFLICT_003 | Assignment Conflict | Cannot assign user {user_id}: user is not a member of board {board_id}. | 409 |
| BIZ_DUEDATE_CONFLICT_004 | Scheduling Conflict | Due date conflicts with a blocked period for this project. | 409 |
| BIZ_MAX_TEAM_SIZE_005 | Team Size Limit Reached | Cannot add member: board team size limit ({limit}) reached. | 409 |

Use-case examples:
- Return BIZ_ASSIGNMENT_CONFLICT_003 when trying to assign a task to a user not added to the board/team.
- Return BIZ_MAX_TEAM_SIZE_005 when board membership limit is a business rule and would be exceeded.

## System (SYS)
| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|
| SYS_DATABASE_ERROR_001 | Database Error | Internal database error. Please try again. If the problem persists, contact support. | 500 |
| SYS_EXTERNAL_SERVICE_FAILURE_002 | External Service Failure | Failed to communicate with external service ({service}). Try again later. | 503 |
| SYS_TIMEOUT_003 | Operation Timeout | Operation timed out. Please retry. | 504 |
| SYS_CONCURRENCY_004 | Concurrency Conflict | Concurrent update conflict. Please refresh and retry your change. | 409 |
| SYS_UNKNOWN_999 | Unknown Server Error | An unexpected error occurred. Please try again or contact support with error id {error_id}. | 500 |

Follow-up items (UNKNOWN)
- If integration with third-party auth (SSO, OAuth providers) is added, additional AUTH_* codes for provider-specific failures should be added (e.g., AUTH_SSO_PROVIDER_010). Mark as UNKNOWN until provider list is defined.

Change history
- v1.0 — Initial catalog created for Untitled Project (task management app).