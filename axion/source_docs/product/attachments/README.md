# Attachments Folder

This folder stores **user input documents** for the AXION documentation pipeline.

## For IDE-Only Users (No Web App)

If you're using AXION directly from your IDE without the web application, this is where you provide your project information:

1. **Start with `START_HERE.txt`** - Open this file and paste your project idea, requirements, or any existing documentation
2. **Add supporting files** - Drop any additional materials here:
   - Existing specifications
   - Reference materials  
   - Design mockups or wireframes
   - API documentation
   - Database schemas
   - Previous documentation
   - Exported files from other tools

## How AXION Uses These Files

The AXION pipeline reads files from this folder during the `draft` stage to extract context for generating your documentation. The more detail you provide, the better your Agent Kit will be.

## Recommended Input Structure

In `START_HERE.txt`, include:

```markdown
# Project Name

## What are you building?
[Describe your idea in plain language]

## Who is it for?
[Describe your target users]

## Core Features
- Feature 1
- Feature 2
- Feature 3

## Technical Preferences (Optional)
- Frontend: [React, Vue, etc.]
- Backend: [Node, Python, etc.]
- Database: [PostgreSQL, MongoDB, etc.]

## Additional Context
[Any other details, constraints, or requirements]
```

## File Types Supported

- `.txt` - Plain text (recommended - editable in Replit)
- `.md` - Markdown (read-only preview in Replit)
- `.json` - Structured data
- `.yaml` / `.yml` - Configuration
- `.png`, `.jpg`, `.svg` - Images/mockups
- `.pdf` - Documents

## Next Steps

After adding your input files:

1. Run `npx tsx axion/scripts/axion-init.ts --mode fresh` to initialize
2. Run `npx tsx axion/scripts/axion-generate.ts --all` to generate docs
3. Follow the pipeline stages: seed → draft → review → verify → lock

See `axion/QUICKSTART.md` for detailed instructions.
