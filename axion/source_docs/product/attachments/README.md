# Attachments Folder

This folder stores **user-uploaded documents** that are attached during form creation.

When users fill out the web form to create an assembly, they can attach supporting documents such as:
- Existing specifications
- Reference materials
- Design mockups
- Previous documentation
- Exported files from other tools

## Usage

Files uploaded through the web form are stored here with unique identifiers to prevent conflicts.

The pipeline can reference these attachments during the `draft` stage to extract additional context.

## File Naming

Uploaded files are stored as:
```
{assemblyId}_{originalFileName}
```

This ensures traceability back to the assembly that uploaded them.
