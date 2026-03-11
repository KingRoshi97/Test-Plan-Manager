---
kid: "KID-ITOS-CONCEPT-0002"
title: "Filesystems + Permissions (ownership, modes)"
content_type: "concept"
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
  - "concept"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/operating_systems/concepts/KID-ITOS-CONCEPT-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Filesystems + Permissions (ownership, modes)

# Filesystems + Permissions (Ownership, Modes)

## Summary
Filesystems are critical components of operating systems that manage how data is stored and accessed on storage devices. Permissions, including ownership and modes, dictate who can read, write, or execute files and directories. Understanding these concepts ensures secure and efficient data management within multi-user environments.

## When to Use
- Configuring access control for sensitive files or directories in multi-user systems.
- Debugging permission errors that prevent applications or users from accessing files.
- Setting up secure environments for web servers, databases, or shared resources.
- Enforcing compliance with security policies or regulatory standards.

## Do / Don't

### Do:
1. **Use proper ownership settings**: Assign ownership to the correct user and group to prevent unauthorized access.
2. **Apply least privilege principles**: Set permissions to the minimum required for functionality (e.g., avoid granting write access unless necessary).
3. **Regularly audit permissions**: Periodically check and adjust file and directory permissions to maintain security.

### Don’t:
1. **Use overly permissive modes**: Avoid `777` (read, write, execute for everyone) unless absolutely necessary; it exposes files to potential misuse.
2. **Ignore ownership conflicts**: Failing to set correct ownership can lead to errors or security vulnerabilities.
3. **Modify system-critical files carelessly**: Changing permissions on system files (e.g., `/etc/passwd`) can break functionality or compromise security.

## Core Content

### Filesystems Overview
A filesystem organizes and stores data on a storage device, such as a hard drive or SSD. Common filesystems include ext4 (Linux), NTFS (Windows), and APFS (macOS). Filesystems structure data into files and directories, enabling efficient storage, retrieval, and management.

### Permissions: Ownership and Modes
Permissions are a mechanism to control access to files and directories. They consist of:
1. **Ownership**:
   - **User (owner)**: The individual user who owns the file.
   - **Group**: A collection of users who share access rights to the file.

2. **Modes**:
   Permissions are defined using three categories:
   - **Read (`r`)**: Ability to view file contents or list directory contents.
   - **Write (`w`)**: Ability to modify file contents or create/delete files within a directory.
   - **Execute (`x`)**: Ability to run executable files or traverse directories.

Modes are represented numerically (e.g., `644`) or symbolically (e.g., `rw-r--r--`). The numeric representation uses octal values:
- User: First digit (e.g., `6` for `rw-`)
- Group: Second digit (e.g., `4` for `r--`)
- Others: Third digit (e.g., `4` for `r--`)

### Why Permissions Matter
Permissions are essential for:
- **Security**: Prevent unauthorized access to sensitive data.
- **Stability**: Avoid accidental modification or deletion of critical files.
- **Multi-user environments**: Ensure proper isolation and collaboration among users.

### Practical Examples
1. **Setting ownership**:
   ```bash
   chown user:group file.txt
   ```
   Assigns `user` as the owner and `group` as the group for `file.txt`.

2. **Changing permissions**:
   ```bash
   chmod 644 file.txt
   ```
   Sets `file.txt` to be readable and writable by the owner, readable by the group, and readable by others.

3. **Checking permissions**:
   ```bash
   ls -l file.txt
   ```
   Outputs:
   ```
   -rw-r--r-- 1 user group 1024 Oct 10 12:00 file.txt
   ```
   This indicates the file is owned by `user`, belongs to `group`, and has `rw-`, `r--`, and `r--` permissions.

4. **Restricting access to a directory**:
   ```bash
   chmod 750 /secure_dir
   ```
   Grants full access to the owner, read/execute access to the group, and no access to others.

### Advanced Use Case
On web servers, permissions must be carefully configured to secure files:
- **Public HTML files**: Use `644` to allow read access for the web server and others but restrict write access.
- **Configuration files**: Use `600` to ensure only the owner can read/write sensitive data.

## Links
- **POSIX File Permissions**: Learn about standardized permissions in Unix-like systems.
- **Linux `chmod` Command**: Detailed guide on changing file modes.
- **Filesystem Hierarchy Standard (FHS)**: Overview of directory structures in Linux.

## Proof / Confidence
This content is based on established operating system practices and standards, including POSIX and FHS. Permission management is a foundational concept in Linux, macOS, and Windows systems, supported by industry benchmarks and security guidelines.
