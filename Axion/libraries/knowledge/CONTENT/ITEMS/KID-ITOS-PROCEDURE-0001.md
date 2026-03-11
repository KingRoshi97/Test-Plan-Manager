---
kid: "KID-ITOS-PROCEDURE-0001"
title: "Basic Linux Debug Workflow (logs, ps, netstat)"
content_type: "workflow"
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
  - "procedure"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/operating_systems/procedures/KID-ITOS-PROCEDURE-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Basic Linux Debug Workflow (logs, ps, netstat)

# Basic Linux Debug Workflow (logs, ps, netstat)

## Summary
This article outlines a step-by-step procedure for debugging common issues on Linux systems using logs, `ps`, and `netstat`. These tools help identify process-related issues, network connectivity problems, and system anomalies. The workflow is designed for IT professionals troubleshooting Linux servers or workstations.

## When to Use
- When a Linux system is experiencing performance degradation, crashes, or unexpected behavior.
- To investigate network connectivity issues or identify rogue processes.
- During routine system monitoring or post-incident analysis.

## Do / Don't

### Do:
1. Use `sudo` or root privileges when accessing system logs or running commands that require elevated permissions.
2. Document findings during the debug process for future reference.
3. Cross-reference log timestamps with system events for accurate debugging.

### Don't:
1. Modify or delete logs unless absolutely necessary; they may be required for further analysis.
2. Kill processes without understanding their purpose or dependencies.
3. Assume network issues are always external; check local configurations first.

## Core Content

### Prerequisites
- Access to the Linux system (local or remote via SSH).
- Basic familiarity with Linux commands (`cat`, `grep`, `ps`, `netstat`).
- Elevated privileges (e.g., `sudo`) to access restricted logs or run privileged commands.

---

### Step-by-Step Procedure

#### Step 1: Check System Logs
1. **Command**:  
   Use `journalctl` or access log files in `/var/log/`. Common logs include:
   - `/var/log/syslog` (general system logs)
   - `/var/log/auth.log` (authentication logs)
   - `/var/log/dmesg` (kernel logs)  

   Example:  
   ```bash
   sudo journalctl -xe
   sudo cat /var/log/syslog | grep "error"
   ```

2. **Expected Outcome**:  
   Identify errors, warnings, or anomalies in the logs related to the issue.

3. **Common Failure Modes**:  
   - Logs are rotated or missing; ensure log rotation settings are configured correctly.
   - Permissions errors accessing logs; use `sudo` if necessary.

---

#### Step 2: Inspect Running Processes
1. **Command**:  
   Use `ps` to list processes and their resource usage.  
   Example:  
   ```bash
   ps aux | grep <process_name>
   ps aux --sort=-%cpu | head -n 10
   ```

2. **Expected Outcome**:  
   Identify high CPU/memory-consuming processes or rogue processes.

3. **Common Failure Modes**:  
   - Process names may not match expectations; use `grep` with partial names or IDs.
   - Zombie processes may appear; investigate their parent processes.

---

#### Step 3: Analyze Network Connections
1. **Command**:  
   Use `netstat` or `ss` to check active network connections and listening ports.  
   Example:  
   ```bash
   netstat -tuln
   netstat -anp | grep <port_number>
   ss -tuln
   ```

2. **Expected Outcome**:  
   Identify open ports, active connections, or potential network bottlenecks.

3. **Common Failure Modes**:  
   - `netstat` may not be installed on newer systems; use `ss` as an alternative.
   - Misinterpreting connection states (e.g., `CLOSE_WAIT`, `LISTEN`).

---

#### Step 4: Correlate Findings
1. **Action**:  
   Combine insights from logs, processes, and network connections to identify root causes. Look for patterns such as:
   - A process consuming excessive resources correlating with system errors in logs.
   - Network connection failures matching timestamps in logs.

2. **Expected Outcome**:  
   A clear understanding of the issue and potential solutions.

3. **Common Failure Modes**:  
   - Misalignment of timestamps between logs and observed behavior.
   - Overlooking dependencies between processes and network services.

---

## Links
- **Linux System Logs Overview**: Detailed explanation of common Linux log files and their purposes.  
- **Using `ps` for Process Management**: Best practices for inspecting and managing Linux processes.  
- **Network Debugging with `netstat` and `ss`**: Comprehensive guide to analyzing network connections in Linux.  
- **Log Rotation Best Practices**: Ensure critical logs are preserved and rotated properly.

## Proof / Confidence
This workflow is based on widely accepted Linux system administration practices. Tools like `journalctl`, `ps`, and `netstat` are foundational utilities recommended in industry standards such as the Linux Foundation’s Certified System Administrator (LFCS) curriculum. Debugging via logs, processes, and network analysis is a common approach in IT troubleshooting frameworks like ITIL and DevOps incident management.
