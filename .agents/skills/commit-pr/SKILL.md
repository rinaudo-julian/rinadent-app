---
name: commit-pr
description: >
  Execute git commit with conventional commits followed by PR creation.
  Trigger: When user asks to commit changes and push, or mentions "commit and push", "commit and PR".
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Overview

This skill combines [git-commit](../git-commit/SKILL.md) workflow with automatic PR creation to main. All work is done in `develop` branch and merged via PR.

## Workflow

### 1. Run git-commit (from git-commit skill)

Follow the git-commit skill to:
- Analyze diff
- Stage files
- Generate conventional commit message
- Execute commit

### 2. Push to Remote

```bash
# Check if push rejected (remote has new changes)
git push || (git pull --rebase && git push)
```

### 3. Create PR to main

Always create PR from current branch (`develop`) to `main`:

```bash
# Get branch info and diff for PR body
git log --oneline origin/main..HEAD

# Create PR (GitHub CLI)
gh pr create \
  --base main \
  --head develop \
  --title "$(git log -1 --format='%s')" \
  --body "## Summary
$(git log --format='- %s' origin/main..HEAD | head -10)"
```

## Branch Convention

- **Working branch**: `develop`
- **Target branch**: `main`
- **Never push directly to main**

## Critical Patterns

- ALWAYS create PR after commit+push
- NEVER commit directly to main
- If remote has changes, rebase before push
- Include meaningful PR description with commit summary

## Commands Summary

```bash
# Full workflow
git add .
git commit -m "feat: description"
git push || (git pull --rebase && git push)
gh pr create --base main --head develop --title "feat: description" --body "## Summary..."
```