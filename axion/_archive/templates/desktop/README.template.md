<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:desktop -->
<!-- AXION:PREFIX:desktop -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Desktop — AXION Module Template (Blank State)

**Module slug:** `desktop`  
**Prefix:** `desktop`  
**Description:** Desktop app development (Electron, Tauri)

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:DESKTOP_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the desktop module.
"Owns" = desktop app architecture, OS integrations, packaging/signing/updates, desktop-specific security, cross-platform support matrix.
"Does NOT own" = backend API logic (backend module), shared API contracts (contracts module), auth strategy (auth module), cloud infrastructure (cloud module).
Common mistake: duplicating backend logic in the desktop app — desktop should consume APIs, not re-implement business rules. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:DESKTOP_ARCH -->
## App Architecture
<!-- AGENT: Derive from REBS §1 stack selection for desktop framework and architecture module patterns.
Framework/runtime = chosen framework (Electron, Tauri, native) with justification (app size, performance, native API access, team skills).
Process model = main process vs renderer process responsibilities, IPC communication patterns, worker threads for heavy computation.
Common mistake: running everything in the renderer process — CPU-intensive work should be offloaded to worker threads or the main process. -->
- Framework/runtime: [TBD]
- Process model: [TBD]


<!-- AXION:SECTION:DESKTOP_OS -->
## OS Integrations
<!-- AGENT: Derive from RPBS §5 User Journeys for desktop-specific interactions and SCREENMAP for desktop UI patterns.
File system = file open/save dialogs, drag-and-drop support, file associations, watched directories.
Protocol handlers = custom URL schemes (myapp://), OS-level protocol registration.
Tray/menu = system tray icon behavior, context menu items, native menu bar integration.
Auto-start = whether app starts on login, background service behavior, system resource usage when idle.
Common mistake: not handling OS differences — file paths, permissions, and system tray behavior differ between macOS, Windows, and Linux. -->
- File system, protocol handlers, tray/menu: [TBD]
- Auto-start/background services: [TBD]


<!-- AXION:SECTION:DESKTOP_PACKAGING -->
## Packaging, Signing & Updates
<!-- AGENT: Derive from devops module release strategy adapted for desktop distribution.
Code signing = signing certificates per platform (Apple Developer ID, Windows Authenticode, Linux GPG), notarization process (macOS), cost/renewal.
Auto-update = update mechanism (electron-updater, Sparkle, custom), update check frequency, mandatory vs optional updates, delta updates for bandwidth.
Common mistake: not testing the auto-update flow end-to-end — broken updates are the #1 cause of desktop app user loss. -->
- Code signing/notarization: [TBD]
- Auto-update strategy: [TBD]


<!-- AXION:SECTION:DESKTOP_SECURITY -->
## Security
<!-- AGENT: Derive from RPBS §8 Security & Compliance and security module policies for desktop-specific concerns.
Local storage = what data is stored locally (settings, cached data, auth tokens), encryption method (OS keychain, encrypted files, secure enclave).
Secrets = how API keys and tokens are stored (OS credential manager, encrypted config), never embedded in app binary.
Sandboxing = app sandbox configuration per platform (macOS sandbox, Windows AppContainer), file system access restrictions.
Common mistake: embedding API secrets in the desktop binary — secrets can be extracted from binaries; use secure OS-level storage. -->
- Local storage + secrets: [TBD]
- Sandboxing/permissions: [TBD]


<!-- AXION:SECTION:DESKTOP_TESTING -->
## Testing & Supportability
<!-- AGENT: Derive from TESTPLAN for desktop testing approach.
OS matrix = target OS versions (macOS 12+, Windows 10+, Ubuntu 22.04+), CPU architectures (x64, ARM64), CI testing across platforms.
Crash dumps = crash reporting tool (Sentry, Crashpad), symbolication pipeline, log collection from user machines, diagnostic data opt-in UX.
Common mistake: only testing on the developer's OS — cross-platform desktop apps must be tested on all target platforms in CI. -->
- OS matrix: [TBD]
- Crash dumps/log capture: [TBD]


<!-- AXION:SECTION:DESKTOP_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Update strategy exists
- [ ] Signing requirements stated
- [ ] OS matrix defined


<!-- AXION:SECTION:DESKTOP_OPEN_QUESTIONS -->
## Open Questions
<!-- AGENT: Capture unresolved desktop decisions or missing upstream information.
Each question should reference which upstream source is needed (e.g., "Awaiting REBS §1 for desktop framework selection").
Common mistake: leaving questions vague — each should be specific and actionable. -->
- [TBD]
