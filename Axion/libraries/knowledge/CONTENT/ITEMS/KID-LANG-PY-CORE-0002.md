---
kid: "KID-LANG-PY-CORE-0002"
title: "Project Structure Norms (venv, deps)"
content_type: "concept"
primary_domain: "["
secondary_domains:
  - "p"
  - "y"
  - "t"
  - "h"
  - "o"
  - "n"
  - "]"
industry_refs: []
stack_family_refs:
  - "language_core"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "p"
  - "y"
  - "t"
  - "h"
  - "o"
  - "n"
  - ","
  - " "
  - "p"
  - "r"
  - "o"
  - "j"
  - "e"
  - "c"
  - "t"
  - "-"
  - "s"
  - "t"
  - "r"
  - "u"
  - "c"
  - "t"
  - "u"
  - "r"
  - "e"
  - ","
  - " "
  - "v"
  - "e"
  - "n"
  - "v"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/python/language_core/KID-LANG-PY-CORE-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Project Structure Norms (venv, deps)

# Project Structure Norms (venv, deps)

## Summary

A well-structured Python project ensures maintainability, reproducibility, and ease of collaboration. Key components of a Python project structure include the use of a virtual environment (`venv`) to isolate dependencies and a clear approach to managing and documenting those dependencies (`deps`). These practices are essential for avoiding conflicts, ensuring compatibility, and adhering to Python development standards.

## When to Use

- **Developing Python projects**: Any Python project, whether a small script or a large application, benefits from a structured approach to dependencies and environments.
- **Collaborative development**: When working in teams, using `venv` and dependency management ensures consistency across developers' environments.
- **Deploying applications**: Isolating dependencies prevents conflicts with system-installed packages during deployment.
- **Testing and debugging**: Reproducible environments make it easier to replicate issues and test solutions.

## Do / Don't

### Do
1. **Use `venv` for every project**: Create a virtual environment for each project to isolate dependencies.
2. **Pin dependencies**: Use tools like `pip freeze` to generate a `requirements.txt` file with exact versions of dependencies.
3. **Document the setup process**: Provide clear instructions for setting up the environment, including activating the `venv` and installing dependencies.

### Don't
1. **Install dependencies globally**: Avoid installing project-specific packages globally, as this can lead to version conflicts.
2. **Ignore dependency updates**: Regularly update dependencies to avoid security vulnerabilities and maintain compatibility.
3. **Commit the `venv` directory to version control**: Exclude the virtual environment directory (e.g., `venv/`) from your repository using `.gitignore`.

## Core Content

### What is a Virtual Environment (`venv`)?

A virtual environment in Python is an isolated environment that allows you to install and manage dependencies specific to a project without affecting the global Python installation. This is crucial for avoiding conflicts between dependencies required by different projects.

To create a virtual environment:
```bash
python -m venv venv
```

To activate the virtual environment:
- On Windows:
  ```bash
  venv\Scripts\activate
  ```
- On macOS/Linux:
  ```bash
  source venv/bin/activate
  ```

To deactivate the virtual environment:
```bash
deactivate
```

### Dependency Management (`deps`)

Dependencies are external libraries or packages that your project requires. Managing these dependencies involves specifying, installing, and updating them in a controlled manner. The most common approach is to use a `requirements.txt` file.

To generate a `requirements.txt` file:
```bash
pip freeze > requirements.txt
```

To install dependencies from a `requirements.txt` file:
```bash
pip install -r requirements.txt
```

For larger projects, tools like `pip-tools` or `Poetry` can provide more advanced dependency management features, such as resolving conflicts and specifying development vs. production dependencies.

### Why Does This Matter?

1. **Reproducibility**: Using `venv` and `requirements.txt` ensures that anyone working on the project has the same environment and dependencies, reducing "it works on my machine" issues.
2. **Isolation**: Virtual environments prevent conflicts between dependencies required by different projects or the system Python installation.
3. **Security**: Pinning dependencies to specific versions helps avoid introducing vulnerabilities from untested or incompatible updates.

### Broader Context in Python Development

The use of `venv` and dependency management is a foundational practice in Python development. It aligns with Python's philosophy of simplicity and explicitness, as outlined in the Zen of Python. These practices are also critical for CI/CD pipelines, containerization (e.g., Docker), and deployment workflows, where reproducibility and isolation are paramount.

## Links

- **PEP 405**: Python Virtual Environments — the official Python Enhancement Proposal that introduced `venv`.
- **Best Practices for Python Dependency Management**: Guidelines for managing dependencies effectively.
- **Poetry**: A tool for dependency management and packaging in Python.
- **pip-tools**: A set of tools to help manage Python dependencies more effectively.

## Proof / Confidence

The practices described here are widely adopted in the Python community and supported by industry standards such as PEP 405. Tools like `venv`, `pip`, and `requirements.txt` are built into Python or officially recommended. Dependency isolation and management are also integral to modern development workflows, as evidenced by their use in popular frameworks, CI/CD pipelines, and cloud deployment platforms.
