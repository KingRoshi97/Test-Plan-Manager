<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:mobile -->
<!-- AXION:PREFIX:mobile -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Mobile — AXION Module Template (Blank State)

**Module slug:** `mobile`  
**Prefix:** `mobile`  
**Description:** Mobile app development (iOS, Android, React Native)

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:MOBILE_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the mobile module.
"Owns" = mobile app architecture, offline/sync strategy, platform integrations (push, deep links), mobile-specific performance, app store release process.
"Does NOT own" = backend API logic (backend module), shared API contracts (contracts module), auth strategy (auth module), cloud infrastructure (cloud module).
Common mistake: duplicating backend logic in the mobile app — mobile should consume APIs, not re-implement business rules. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:MOBILE_ARCH -->
## App Architecture
<!-- AGENT: Derive from REBS §1 stack selection for mobile framework and architecture module patterns.
Architecture pattern = chosen pattern (MVVM, MVI, Clean Architecture) with justification tied to team experience and product requirements.
Navigation structure = screen hierarchy (tab bar, stack navigation, drawer), deep link URL scheme mapping to screens.
Reference SCREENMAP for screen inventory and navigation flows.
Common mistake: not defining navigation structure upfront — retrofitting navigation in mobile apps is significantly more expensive than planning it. -->
- Architecture pattern: [TBD]
- Navigation structure: [TBD]


<!-- AXION:SECTION:MOBILE_DATA -->
## Data, Sync & Offline
<!-- AGENT: Derive from RPBS §7 Non-Functional Profile for offline requirements and BELS for conflict resolution rules.
Offline behavior = which features work offline, what data is cached locally, how the app communicates offline state to users.
Sync strategy = how local changes sync to server (queue-based, background sync), conflict resolution (last-write-wins, merge, user choice).
Common mistake: designing for always-online first and adding offline later — offline support must be architected from the start. -->
- Offline behavior: [TBD]
- Sync strategy + conflicts: [TBD]


<!-- AXION:SECTION:MOBILE_PLATFORM -->
## Platform Integrations
<!-- AGENT: Derive from RPBS §11 Notifications for push notification requirements and RPBS §5 for deep link entry points.
Push notifications = provider (APNs/FCM), notification types (transactional, marketing), payload structure, user opt-in/opt-out flow.
Deep links = URL scheme (universal links/app links), mapping of URLs to screens, deferred deep linking for uninstalled users.
Permissions = which OS permissions are needed (camera, location, contacts), progressive permission request strategy, degraded UX when denied.
Common mistake: requesting all permissions at app launch — request permissions contextually when the user needs the feature. -->
- Push notifications: [TBD]
- Deep links: [TBD]
- Permissions: [TBD]


<!-- AXION:SECTION:MOBILE_PERF -->
## Performance & Battery
<!-- AGENT: Derive from RPBS §7 Non-Functional Profile for mobile performance targets.
Startup targets = cold start time budget (e.g., < 2s), warm start budget, app size limits, initial render time.
Background work = what runs in the background (sync, notifications, location tracking), battery impact constraints, OS-imposed limits (Android Doze, iOS Background App Refresh).
Common mistake: not measuring startup time from the user's perspective — measure from tap to interactive, not just app launch to first frame. -->
- Startup targets: [TBD]
- Background work constraints: [TBD]


<!-- AXION:SECTION:MOBILE_SECURITY -->
## Security & Privacy
<!-- AGENT: Derive from RPBS §8 Security & Compliance and security module policies for mobile-specific concerns.
Local storage encryption = what data is stored locally (tokens, cached data, user preferences), encryption method (Keychain/Keystore, encrypted SQLite).
Privacy permissions UX = how permission requests are presented (pre-permission dialogs explaining why), what happens when permissions are revoked.
Reference RPBS §29 Privacy Controls for data deletion/export requirements on mobile.
Common mistake: storing auth tokens in plain SharedPreferences/UserDefaults — always use platform secure storage (Keychain/Keystore). -->
- Local storage encryption: [TBD]
- Privacy permissions UX: [TBD]


<!-- AXION:SECTION:MOBILE_RELEASE -->
## Release & Distribution
<!-- AGENT: Derive from devops module release strategy adapted for app store constraints.
Store release process = build → test → submit → review → phased rollout, code signing setup, metadata/screenshots management.
Crash reporting = crash reporting tool (Crashlytics, Sentry), symbolication/dSYM upload, crash-free rate targets, alerting thresholds.
Common mistake: not planning for app store review times — factor 1-3 day review periods into release timelines, especially for critical fixes. -->
- Store release process: [TBD]
- Crash reporting: [TBD]


<!-- AXION:SECTION:MOBILE_TESTING -->
## Testing
<!-- AGENT: Derive from TESTPLAN for mobile testing approach.
Device matrix = target OS versions (min iOS/Android version), device types (phone, tablet), screen sizes, testing on real devices vs simulators/emulators.
Automation strategy = UI testing framework (XCTest, Espresso, Detox, Appium), test coverage targets, CI integration for mobile tests.
Common mistake: only testing on simulators — real device testing catches performance and hardware-specific issues that simulators miss. -->
- Device matrix: [TBD]
- Automation strategy: [TBD]


<!-- AXION:SECTION:MOBILE_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Offline behavior documented
- [ ] Release process documented
- [ ] Device matrix defined


<!-- AXION:SECTION:MOBILE_OPEN_QUESTIONS -->
## Open Questions
<!-- AGENT: Capture unresolved mobile decisions or missing upstream information.
Each question should reference which upstream source is needed (e.g., "Awaiting REBS §1 for mobile framework selection").
Common mistake: leaving questions vague — each should be specific and actionable. -->
- [TBD]
