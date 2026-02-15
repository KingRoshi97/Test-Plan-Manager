# Mobile Development Best Practices

## iOS / Android Native

### Native UI Implementation
- **iOS**: SwiftUI for new projects, UIKit for legacy or complex custom UI
- **Android**: Jetpack Compose for new projects, Views/XML for legacy
- Follow platform design guidelines (Human Interface Guidelines for iOS, Material Design for Android)
- Use platform-native navigation patterns (UINavigationController, NavHost)
- Respect platform conventions: gestures, spacing, typography, iconography

### Platform Navigation
- Tab bar (iOS) / Bottom navigation (Android): 3-5 primary destinations
- Stack navigation: push/pop for hierarchical content
- Deep linking: support universal links (iOS) and app links (Android)
- Handle back button correctly on Android (don't break navigation stack)
- Preserve navigation state on process death (save/restore instance state)

### Native Storage
- **Keychain** (iOS) / **Keystore** (Android): for secrets, tokens, credentials
- **UserDefaults** (iOS) / **SharedPreferences** (Android): for user preferences
- **Core Data** (iOS) / **Room** (Android): for structured local data
- **SQLite**: cross-platform local database
- Never store secrets in plain text files or preferences

### Push Notifications
- **APNs** (iOS) / **FCM** (Android): platform push services
- Request notification permission at the right time (after user understands value)
- Handle notification tap (deep link to relevant screen)
- Support rich notifications (images, action buttons)
- Handle silent push for background data sync
- Manage notification channels (Android) and categories (iOS)

### App Lifecycle
- Handle foreground/background transitions cleanly
- Save critical state before entering background
- Resume gracefully on return to foreground (refresh stale data)
- Handle process termination and restoration (don't lose user work)
- Background processing: use platform APIs (BackgroundTasks iOS, WorkManager Android)

### Permissions
- Request permissions just-in-time (when feature needs it, not on app launch)
- Explain why the permission is needed before requesting (pre-permission dialog)
- Handle permission denial gracefully (provide alternative or explain impact)
- Support: camera, location, contacts, microphone, photo library, notifications
- Respect "Don't ask again" — direct user to system settings

### Background Tasks
- Background fetch: periodic data sync (controlled by OS scheduler)
- Upload/download: use background transfer APIs (continue after app suspension)
- Background processing: time-limited tasks (30s iOS, WorkManager Android)
- Geofencing and location updates in background (if justified by use case)
- Minimize battery impact: batch operations, respect low-power mode

## Cross-Platform Development

### Framework Selection
- **React Native + Expo**: recommended for teams with React/web experience
- **Flutter**: recommended for custom UI-heavy apps, widget-first architecture
- **Kotlin Multiplatform**: share business logic, native UI per platform
- Choose based on team skills, UI complexity, and platform-specific needs

### Shared UI Layer
- Build common components that adapt to platform conventions
- Use conditional rendering for platform-specific differences
- Test on both platforms (don't assume Android works because iOS works)
- Use platform extensions (`.ios.tsx`, `.android.tsx`) for divergent implementations

### Platform Bridges / Native Modules
- Use native modules for: camera, biometrics, Bluetooth, NFC, ARKit/ARCore
- Prefer community-maintained modules over building your own
- Encapsulate native code behind a clean API
- Test native modules on actual devices (not just simulators)

### Navigation (Cross-Platform)
- React Navigation (React Native) or GoRouter (Flutter) for cross-platform routing
- Support: tab navigation, stack navigation, drawer, deep linking
- Handle safe areas and notch/punch-hole consistently
- Test navigation on both platforms with different screen sizes

### Design System (Cross-Platform)
- Shared design tokens (colors, spacing, typography) across platforms
- Platform-adaptive components (iOS-style vs Material Design switches, pickers)
- Consistent spacing and sizing using platform-independent units
- Dark mode support on both platforms

## Mobile UX Specifics

### Touch-First Interaction
- Touch targets: minimum 48x48dp (Android), 44x44pt (iOS)
- Spacing between targets: minimum 8dp
- Thumb zone optimization: primary actions in bottom third of screen
- Swipe gestures: swipe to delete, swipe to reveal actions, pull to refresh
- Long-press: context menu or selection mode

### Keyboard Handling
- Keyboard avoidance: scroll content so active input is visible above keyboard
- Dismiss keyboard on tap outside input area
- Input accessory view (iOS) for toolbar above keyboard
- Handle hardware keyboard on tablets and desktop mode
- Next/Done button on keyboard for form navigation

### Gestures and Haptics
- Standard gestures: tap, long-press, swipe, pinch, rotate, drag
- Provide haptic feedback for significant actions (success, error, toggle)
- Don't override system gestures (edge swipe back on iOS, system navigation on Android)
- Gesture conflict resolution when multiple gestures could match

### Safe Area and Notch Handling
- Use safe area insets for content positioning (no content behind notch or home indicator)
- Handle both portrait and landscape orientations
- Dynamic Island (iOS 14 Pro+) — ensure content doesn't overlap
- Camera punch-hole (Android) — avoid placing content behind cutout

### Offline-First UX
- Show cached content immediately, refresh in background
- Indicate offline state (banner, dimmed sync icon)
- Queue user actions taken offline (sync when connection returns)
- Handle sync conflicts (last-write-wins or user-resolved merge)
- Graceful degradation: disable features that require network, not the whole app

### Low Connectivity
- Detect network quality (WiFi vs cellular vs offline)
- Reduce payload size on slow connections (lower resolution images, paginate smaller)
- Show progress for slow operations (don't let user wonder if it's working)
- Timeout and retry with clear feedback
- Airplane mode handling (detect and show appropriate state)

## Data and Networking

### API Client Configuration
- Set timeouts: connect (5s), read (30s), configurable per endpoint
- Enable retry for transient failures (exponential backoff, max 3 retries)
- Cache responses with appropriate TTL per endpoint
- Certificate pinning for high-security apps (banking, healthcare)
- Handle authentication token refresh transparently (interceptor pattern)

### Offline Caching and Sync
- Cache critical data locally (SQLite, Core Data, Room)
- Sync queue: store pending mutations, replay on reconnection
- Conflict detection: compare versions, timestamps, or hashes
- Sync status UI: show pending, syncing, synced, failed states
- Handle large offline datasets (paginated sync, delta updates)

### Media Handling
- Image loading: use lazy loading, placeholder, cache (SDWebImage, Glide, Coil)
- Image optimization: download appropriate size for device screen
- Video: streaming over download, adaptive quality (HLS/DASH)
- Upload: chunked upload for large files, resume on failure
- Minimize memory usage for media (release bitmaps, use thumbnails)

### Battery and Data Optimization
- Batch network requests where possible
- Use efficient serialization (protobuf, MessagePack) for high-volume data
- Minimize polling frequency (use push notifications or WebSocket instead)
- Respect low-power mode (reduce background activity)
- Monitor network data usage and provide data-saving options

## Mobile Security

### Secure Storage
- Tokens: Keychain (iOS), EncryptedSharedPreferences (Android)
- API keys: never embed in client code (use server-side proxy)
- Biometric auth: Face ID, Touch ID, Fingerprint — gate sensitive data access
- Clear sensitive data on logout and account switch

### Certificate Pinning
- Pin to public key (more flexible than certificate pinning)
- Handle pin rotation (trust both old and new pins during transition)
- Use for high-security apps only (banking, healthcare) — adds update complexity

### App Security
- Jailbreak/root detection: warn user, restrict features if needed (not foolproof)
- Prevent sensitive data in screenshots/app switcher (blur overlay on background)
- Code obfuscation for sensitive business logic
- Secure WebView: restrict JavaScript execution, validate URLs

### Data Privacy
- Request only necessary permissions
- Anonymize/pseudonymize data before sending to analytics
- Support data export and deletion (GDPR, CCPA)
- Privacy-safe logging (no PII in crash reports)

## Mobile Testing

### Test Types
- Unit tests: business logic, state management, utilities
- UI tests: XCTest (iOS), Espresso (Android), or cross-platform (Detox, Appium)
- E2E tests: critical user journeys on real devices
- Snapshot tests: UI component regression detection

### Device and OS Matrix
- Test on minimum supported OS version and latest
- Test on smallest and largest supported screen sizes
- Test on both phone and tablet form factors
- Include at least one low-end device in test matrix

### Network Testing
- Test with: WiFi, cellular (3G/4G/5G), offline, airplane mode
- Simulate slow networks: throttle connection in dev tools
- Test reconnection flows after network loss
- Verify timeout and retry behavior

### Accessibility Testing
- VoiceOver (iOS), TalkBack (Android): navigate full app with screen reader
- Large text / Dynamic Type: verify layout doesn't break
- Switch Control: verify all actions accessible via switch input
- Color blind simulation: verify no information conveyed by color alone

## Build, Release, and Distribution

### CI Builds
- Automated builds for both platforms on every PR
- Run unit tests, lint, and type checks in CI
- Build signed release candidates for testing
- Cache build artifacts (Gradle, CocoaPods, node_modules)

### Testing Tracks
- **TestFlight** (iOS) / **Internal Testing** (Android): dev team testing
- **Beta testing**: external testers with opt-in
- **Phased rollout**: release to 1%, 5%, 25%, 50%, 100% over days/weeks
- Monitor crash rate at each rollout stage (halt if rate increases)

### Versioning
- Semantic versioning: MAJOR.MINOR.PATCH (1.2.3)
- Build number: auto-incrementing per CI build
- Minimum OS version: update annually, support current-2 major versions
- Handle force-upgrade: show update prompt for critical updates

### Store Compliance
- Follow App Store Review Guidelines (iOS) and Play Store policies (Android)
- Handle: in-app purchases, subscriptions, content ratings, privacy disclosures
- Prepare store listing: screenshots, description, keywords, promotional text
- Plan for review time (1-3 days iOS, 1-7 days Android)

## Monitoring and Maintenance

### Crash Reporting
- Integrate crash reporting SDK (Firebase Crashlytics, Sentry, Bugsnag)
- Symbolicate crash logs (dSYMs iOS, ProGuard mappings Android)
- Monitor crash-free rate target: > 99.5%
- Prioritize top crashers by user impact

### Performance Monitoring
- Track: app startup time, screen render time, frame drops, memory usage
- Set budgets: cold start < 2s, screen transition < 300ms, 60fps for scrolling
- Monitor battery usage impact
- Track app size (download size and installed size)

### Hotfix Strategy
- iOS: expedited review available for critical fixes
- Android: staged rollout, can be halted/increased
- React Native / Flutter: over-the-air updates for JavaScript/Dart changes (CodePush, Shorebird)
- Plan hotfix workflow: branch, fix, test, release, monitor

### Dependency Maintenance
- Update SDKs when new OS versions release (annual cycle)
- Update third-party libraries regularly (security patches, compatibility)
- Test against upcoming OS betas during developer preview period
- Remove deprecated API usage before OS release deadline
