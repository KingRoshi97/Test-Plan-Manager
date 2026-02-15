# Desktop / Client Application Best Practices

## Framework Selection

### Native Desktop
- **Windows**: WinUI 3 (modern), WPF (mature), WinForms (legacy)
- **macOS**: SwiftUI (modern, declarative), AppKit (mature, full control)
- **Linux**: GTK (GNOME ecosystem), Qt (cross-platform native)
- Use native when: maximum performance, deep OS integration, platform-specific features

### Cross-Platform Desktop
- **Electron**: Chromium + Node.js, largest ecosystem, higher memory usage
- **Tauri**: Rust backend + system webview, smaller binary, lower memory
- **.NET MAUI**: C#/.NET, targets Windows/macOS/mobile from single codebase
- **Qt**: C++/Python, true native rendering, complex build setup
- **Flutter Desktop**: Dart, consistent UI across all platforms including mobile

### Framework Decision Matrix
| Factor | Electron | Tauri | Native | Qt |
|--------|----------|-------|--------|-----|
| Binary size | Large (100MB+) | Small (5-10MB) | Smallest | Medium |
| Memory usage | High | Low-Medium | Lowest | Medium |
| Web tech stack | Yes (full) | Yes (frontend) | No | No |
| OS integration | Good | Good | Best | Good |
| Build complexity | Low | Medium | High | High |
| Ecosystem | Largest | Growing | Platform-specific | Mature |

## Window Management

### Multi-Window Applications
- Main window: primary application interface
- Secondary windows: detached panels, inspectors, preference dialogs
- Window state persistence: remember size, position, maximized state between sessions
- Multi-monitor support: respect monitor boundaries, handle DPI differences
- Handle window close vs. app quit (macOS: close window ≠ quit app)

### Docking and Layout
- Resizable panels with drag handles
- Collapsible/expandable sidebars and panels
- Panel docking: snap panels to edges, support floating panels
- Save and restore workspace layouts
- Reset to default layout option

### Window Chrome and Title Bar
- Custom title bar (if needed): include window controls (min/max/close), drag region
- Frameless windows: handle native drag, ensure window controls are accessible
- Transparent windows: for overlays, widgets, floating panels
- Respect system DPI and scaling settings

## Menu System and Shortcuts

### Menu Bar
- Follow platform conventions: File, Edit, View, Window, Help (standard order)
- Show keyboard shortcuts in menu items
- Disable (don't hide) menu items that are not available in current context
- macOS: app menu is first (before File), includes About and Preferences
- Windows/Linux: no app menu, Preferences in Tools or Edit

### Context Menus
- Right-click context menus for contextual actions
- Include relevant actions based on selection/target element
- Keyboard accessible: Shift+F10 or Menu key
- Consistent structure with menu bar where actions overlap

### Keyboard Shortcuts
- Follow platform conventions: Ctrl+C/V/Z (Windows/Linux), Cmd+C/V/Z (macOS)
- Document all shortcuts in Help menu or preferences
- Don't override system shortcuts
- Support customizable shortcuts for power users (optional)
- Use consistent modifier key patterns throughout the app

## System Integration

### Notifications
- Use native notification APIs (Windows Toast, macOS NSUserNotification/UNUserNotificationCenter)
- Respect Do Not Disturb mode
- Action buttons in notifications for quick responses
- Badge/bounce dock icon for attention (macOS), flash taskbar (Windows)

### Clipboard
- Support copy/paste for all content types (text, images, files, rich content)
- Handle paste sanitization (strip formatting when appropriate)
- Support drag-and-drop to/from system clipboard
- Custom clipboard formats for app-specific data

### File System Access
- Open/save dialogs: use native file dialogs, apply file type filters
- Recent files: maintain and display recently opened files
- File watchers: detect external changes to open files (offer reload)
- File associations: register app as handler for file types
- Sandboxing: respect OS sandboxing restrictions (macOS App Sandbox)

### Drag-and-Drop
- Support system-level drag and drop (files, text, images from other apps)
- Visual feedback: drop zone highlight, cursor change, preview thumbnail
- Handle multiple file drops
- Support dragging content from app to system (export to Finder/Explorer)

## Desktop UX Patterns

### High-Density Layouts
- Tables with sortable columns, resizable columns, fixed headers
- Split panes for master-detail views
- Inspector panels for property editing
- Status bar for contextual information and actions
- Multi-pane layouts with adjustable proportions

### Precision Input
- Mouse-first interaction design (hover states, right-click, drag-and-drop)
- Keyboard-first workflows for power users
- Scroll wheel support (zoom, scroll, value adjustment)
- Selection: click, shift-click range, ctrl-click toggle, rubber-band select

### Power User Features
- Command palette (Ctrl/Cmd+K or Ctrl/Cmd+Shift+P): quick access to all commands
- Keyboard shortcut system with discoverability
- Customizable toolbars and layouts
- Macro/automation support (optional)
- Recent files and pinned items

### Multi-Monitor
- Remember window position per monitor
- Handle monitor connect/disconnect gracefully
- Support different DPI/scaling per monitor
- Dialog positioning: center on parent window, not on primary monitor

### Offline Expectations
- Desktop apps are expected to work offline by default
- Sync when online, work from local data when offline
- Clear indication of online/offline state and sync status
- Conflict resolution when reconnecting

## Desktop Performance

### Startup Performance
- Cold start target: < 2 seconds to interactive
- Warm start (from memory): < 500ms
- Lazy load non-essential features (load after initial UI is shown)
- Show splash screen for cold start > 1 second (with progress indicator)
- Pre-load frequently used resources in background after startup

### Memory Management
- Desktop apps may run for hours or days — prevent memory leaks
- Monitor memory usage over time (memory profiler)
- Release large objects when no longer needed (image buffers, parsed data)
- Implement memory pressure handling (reduce caches, release non-essential data)
- Set memory budgets by component (editor: 100MB, preview: 50MB)

### Rendering Performance
- Use GPU acceleration for graphics-heavy applications (canvas, WebGL, native GPU APIs)
- Target 60fps for animations and scrolling
- Virtualize large lists and grids (render only visible items)
- Debounce expensive layout recalculations on window resize

### Background Work
- Use worker threads for CPU-intensive operations
- Show progress and allow cancellation for long operations
- Don't block the main/UI thread (keep UI responsive at all times)
- Schedule non-urgent work for idle periods

### Large File Handling
- Stream large files rather than loading entirely into memory
- Support incremental loading (show first page while loading rest)
- Use memory-mapped files for read-heavy access patterns
- Chunked processing for large data sets (progress reporting)

## Desktop Security

### Secure Local Storage
- Use OS credential manager: Windows Credential Manager, macOS Keychain
- Encrypt sensitive local data at rest
- Don't store secrets in plain text config files
- Clear sensitive data from memory after use

### Sandboxing and Permissions
- macOS: App Sandbox for App Store distribution, or hardened runtime
- Windows: consider MSIX packaging with capability declarations
- Principle of least privilege: request only needed file system and network access
- Handle permission prompts gracefully

### Code Signing
- Sign all executables and installers
- macOS: notarization required for Gatekeeper approval
- Windows: EV code signing for SmartScreen trust
- Verify signatures of downloaded updates before applying

### Safe Update Mechanism
- Auto-update with signature verification (Squirrel, electron-updater, Sparkle)
- Support delta updates (download only changed bytes)
- Rollback capability if update fails
- User notification and consent for updates (don't surprise users)

## Data and Syncing

### Local Database
- SQLite for structured local data (robust, zero-config, cross-platform)
- Handle database migrations (version schema, apply migrations on startup)
- Backup database before migrations (user data safety)
- Support data export (JSON, CSV, proprietary format)

### Sync Engine
- Conflict resolution: last-write-wins (simple), operational transform (collaborative)
- Delta sync: send only changes, not full dataset
- Handle interrupted sync (resume from last successful point)
- Sync queue: batch changes, sync periodically or on user action

### Import/Export
- Support common formats: CSV, JSON, XML, PDF export
- Support proprietary format for full-fidelity export/import
- Handle large imports with progress indication
- Validate imported data before applying

## Desktop Testing

### Test Types
- Unit tests for core business logic
- UI automation tests (where feasible): Playwright (Electron), XCTest (macOS), WinAppDriver (Windows)
- Integration tests for data layer and file operations
- Manual testing on all target platforms and OS versions

### OS Version Matrix
- Test on minimum supported OS version and latest
- Test on major updates during beta period
- Handle OS-specific behaviors (window management, notifications, file system)

### Installer Testing
- Test fresh install (clean machine)
- Test upgrade from previous version (data migration)
- Test uninstall (clean removal, no orphaned files)
- Test on different disk configurations and user permissions

## Build, Release, and Distribution

### Platform Builds
- CI builds for all target platforms (Windows, macOS, Linux)
- Cross-compilation or platform-specific build agents
- Reproducible builds (same source → same binary)
- Cache build dependencies for faster CI runs

### Distribution Channels
- **Direct download**: website download with auto-update
- **App stores**: Mac App Store, Microsoft Store (additional review process)
- **Enterprise**: MDM deployment, MSI/PKG for IT distribution
- **Package managers**: Homebrew (macOS), winget/chocolatey (Windows), snap/flatpak (Linux)

### Auto-Update
- Check for updates on startup and periodically
- Download in background, apply on next launch (or offer to restart)
- Show changelog / release notes before update
- Support forced updates for critical security patches

## Observability

### Crash Reporting
- Integrate crash reporting (Sentry, Crashpad, Breakpad)
- Include: OS version, app version, crash stack trace, user-consented system info
- Symbol server for crash symbolication
- Monitor crash-free rate

### Telemetry
- Privacy-safe usage analytics (opt-in or anonymized)
- Track: feature usage, performance metrics, error rates
- Respect user preference to disable telemetry
- No PII in telemetry data

### User Diagnostics
- "Generate support bundle" feature: collect logs, system info, app state
- Log rotation: don't fill disk with unbounded logs
- Clear delineation between debug/verbose and production logging
- Include: app version, OS version, hardware info, recent actions (anonymized)
