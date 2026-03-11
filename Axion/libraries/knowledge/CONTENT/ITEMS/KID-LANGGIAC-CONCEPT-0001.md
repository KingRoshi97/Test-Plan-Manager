---
kid: "KID-LANGGIAC-CONCEPT-0001"
title: "Github Actions Fundamentals and Mental Model"
content_type: "concept"
primary_domain: "github_actions"
industry_refs: []
stack_family_refs:
  - "github_actions"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "github_actions"
  - "concept"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/05_cloud_and_devops_tooling/github_actions/concepts/KID-LANGGIAC-CONCEPT-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Github Actions Fundamentals and Mental Model

# Github Actions Fundamentals and Mental Model

## Summary

GitHub Actions is a powerful CI/CD (Continuous Integration and Continuous Deployment) tool that allows developers to automate software workflows directly within their GitHub repositories. It enables teams to build, test, deploy, and manage projects seamlessly by defining workflows in YAML configuration files. Understanding its mental model is essential for creating efficient, maintainable workflows that align with modern software engineering practices.

## When to Use

- **Automating CI/CD pipelines**: Use GitHub Actions to automate tasks such as running tests, building artifacts, and deploying applications whenever code is pushed or merged.
- **Custom workflows**: When you need to define bespoke automation processes tailored to your project, such as linting, code formatting, or dependency updates.
- **Event-driven automation**: Trigger workflows based on GitHub events, such as `push`, `pull_request`, `release`, or `issue_comment` to improve team productivity.
- **Cross-platform builds**: Run workflows on multiple operating systems (Linux, macOS, Windows) to ensure compatibility across environments.

## Do / Don't

### Do
1. **Use reusable workflows**: Modularize workflows and reuse them across repositories to reduce duplication and improve maintainability.
2. **Leverage caching**: Use caching strategies (e.g., `actions/cache`) to speed up builds by storing dependencies and artifacts.
3. **Secure secrets**: Store sensitive data like API keys and tokens in GitHub Secrets to avoid exposing them in your repository.

### Don't
1. **Overcomplicate workflows**: Avoid overly complex workflows with excessive steps or branching. Keep workflows simple and modular.
2. **Hardcode secrets**: Never include sensitive information directly in your workflow files; always use GitHub Secrets.
3. **Ignore resource limits**: Be mindful of GitHub Actions' usage limits (e.g., job runtime, storage, and API calls) to avoid disruptions.

## Core Content

GitHub Actions revolves around the concept of **workflows**, which are defined in YAML files stored in the `.github/workflows/` directory of a repository. A workflow is a sequence of jobs triggered by specific events, such as a code push or a pull request. Each job consists of **steps**, which are individual tasks executed in a defined order. These steps can run shell commands, invoke pre-built actions, or call reusable workflows.

### Mental Model
The mental model for GitHub Actions can be broken down into key components:
1. **Events**: Triggers that start workflows, e.g., `push`, `pull_request`, `schedule`.
2. **Jobs**: Independent units of work, each running in its own virtual environment (runner).
3. **Steps**: Tasks within a job, such as executing commands or running actions.
4. **Actions**: Predefined or custom reusable units of functionality, like `actions/checkout` or `actions/setup-node`.
5. **Runners**: Virtual machines or containers where jobs are executed. GitHub provides hosted runners, or you can use self-hosted ones.

### Why It Matters
GitHub Actions simplifies and centralizes automation within the repository, reducing the need for external CI/CD tools. It integrates tightly with GitHub, making it easy to trigger workflows based on repository activity. This seamless integration improves developer productivity, accelerates delivery cycles, and ensures high-quality software through automated testing and deployment.

### Example Workflow
Here’s a simple workflow to run unit tests on a Node.js project:

```yaml
name: Node.js CI

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
```

This workflow triggers on pushes to the `main` branch, checks out the code, sets up Node.js, installs dependencies, and runs tests.

## Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions) - Official documentation for GitHub Actions.
- [Reusable Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows) - Guide to modularizing workflows for reuse.
- [Caching Dependencies](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows) - Best practices for caching in GitHub Actions.
- [GitHub Actions Limits](https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration) - Details on resource limits for GitHub Actions.

## Proof / Confidence

GitHub Actions is widely adopted across the software industry, with support for major programming languages and frameworks. It is an industry-standard CI/CD tool integrated into GitHub, which is the most popular platform for hosting code repositories. Benchmarks show that GitHub Actions provides competitive performance compared to other CI/CD tools like Jenkins, CircleCI, and Travis CI, while offering unmatched simplicity and integration.
