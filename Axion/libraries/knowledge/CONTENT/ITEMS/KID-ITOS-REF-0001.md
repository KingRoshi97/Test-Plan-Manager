---
kid: "KID-ITOS-REF-0001"
title: "Common Linux Commands Reference (ops focus)"
content_type: "reference"
primary_domain: "operating_systems"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "operating_systems"
  - "reference"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/operating_systems/references/KID-ITOS-REF-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Common Linux Commands Reference (ops focus)

```markdown
# Common Linux Commands Reference (Ops Focus)

## Summary
This document provides a concise reference for commonly used Linux commands in operations-focused tasks. It covers file management, process control, networking, and system monitoring commands, with an emphasis on practical usage in IT operations.

## When to Use
- Troubleshooting system performance or network issues.
- Managing files, directories, and permissions on Linux servers.
- Monitoring and controlling running processes.
- Configuring or inspecting network interfaces and connectivity.

## Do / Don't

### Do:
1. Use `sudo` for commands requiring elevated privileges instead of logging in as root.
2. Verify command syntax and options using `man` or `--help` before execution.
3. Redirect potentially destructive commands (e.g., `rm`, `dd`) to a test environment before applying to production.

### Don't:
1. Don't execute commands as root unless absolutely necessary.
2. Don't use `kill -9` on processes without first attempting a graceful termination.
3. Don't modify system-critical files (e.g., `/etc/passwd`) without creating a backup.

## Core Content

### File and Directory Management
| Command           | Description                                  | Key Options/Examples                          |
|-------------------|----------------------------------------------|-----------------------------------------------|
| `ls`             | List directory contents                      | `-l` (long format), `-a` (show hidden files)  |
| `cp`             | Copy files and directories                   | `-r` (recursive), `-p` (preserve attributes)  |
| `mv`             | Move/rename files and directories            | `mv file1 /path/to/destination`              |
| `rm`             | Remove files and directories                 | `-r` (recursive), `-f` (force)               |
| `chmod`          | Change file permissions                      | `chmod 755 file`                             |
| `chown`          | Change file ownership                        | `chown user:group file`                      |

### Process Management
| Command           | Description                                  | Key Options/Examples                          |
|-------------------|----------------------------------------------|-----------------------------------------------|
| `ps`             | Display running processes                    | `-aux` (detailed process list)               |
| `top`            | Interactive process viewer                   | `q` (quit), `k` (kill process)               |
| `kill`           | Terminate processes                          | `kill PID`                                   |
| `killall`        | Terminate processes by name                  | `killall process_name`                       |
| `jobs`           | List active background jobs                  | `jobs`                                       |
| `fg`/`bg`        | Bring jobs to foreground/background          | `fg %1`, `bg %1`                             |

### Networking
| Command           | Description                                  | Key Options/Examples                          |
|-------------------|----------------------------------------------|-----------------------------------------------|
| `ping`           | Test network connectivity                    | `ping google.com`                            |
| `ifconfig`       | Display or configure network interfaces       | Deprecated: use `ip`                         |
| `ip`             | Manage IP addresses and routes               | `ip addr`, `ip route`                        |
| `netstat`        | Display network connections                  | `-tuln` (list listening ports)               |
| `curl`           | Transfer data from/to a server               | `-I` (fetch headers), `-O` (download file)   |

### System Monitoring
| Command           | Description                                  | Key Options/Examples                          |
|-------------------|----------------------------------------------|-----------------------------------------------|
| `df`             | Display disk space usage                     | `-h` (human-readable)                        |
| `du`             | Estimate file/directory space usage          | `-sh` (summary, human-readable)              |
| `free`           | Display memory usage                         | `-h` (human-readable)                        |
| `uptime`         | Show system uptime and load average          | `uptime`                                     |
| `dmesg`          | View kernel ring buffer messages             | `dmesg | tail`                               |

### Permissions and Ownership
| Command           | Description                                  | Key Options/Examples                          |
|-------------------|----------------------------------------------|-----------------------------------------------|
| `chmod`          | Modify file permissions                      | `chmod 644 file`                             |
| `chown`          | Change file ownership                        | `chown user:group file`                      |
| `umask`          | Set default permissions for new files        | `umask 022`                                  |

## Links
- **Linux man pages**: Comprehensive documentation for Linux commands.
- **Filesystem Hierarchy Standard (FHS)**: Defines directory structure and contents in Linux.
- **GNU Core Utilities**: Core command-line utilities for Unix-like systems.
- **Linux Performance Tuning**: Guides for optimizing Linux systems.

## Proof / Confidence
This reference is based on widely accepted industry standards, including GNU Core Utilities and the Filesystem Hierarchy Standard (FHS). The commands listed are commonly used in Linux system administration and are supported by most distributions. Practical application is validated through extensive use in IT operations and troubleshooting scenarios.
```
