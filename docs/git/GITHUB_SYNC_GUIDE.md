---
title: "GitHub Sync Guide"
version: v2.0.0
created: 2024-12-22
updated: 2025-12-29
status: current
category: git
tags: [github, git, sync, workflow]
---

# ?? GitHub Sync Guide

**Version:** v2.0.0  
**Last Updated:** December 29, 2025  
**Status:** ?? Current

## ?? **Table of Contents**

- [TL;DR](#tldr)
- [Basic Git Workflow](#basic-git-workflow)
- [Daily Commands](#daily-commands)
- [Common Scenarios](#common-scenarios)
- [Troubleshooting](#troubleshooting)
- [Git Best Practices](#git-best-practices)

---

## ?? **TL;DR**

**?? Basic workflow:** Pull ? Make changes ? Add ? Commit ? Push

**Common commands:** `git pull`, `git add .`, `git commit -m "message"`, `git push`

**Branch:** Always work on `main` branch for this project

---

## ?? **Basic Git Workflow**

**?? TL;DR:** Four-step process - pull latest, make changes, commit with message, push to GitHub.

1. **Pull the latest changes:**
    ```bash
    git pull origin main
    ```
2. **Make your changes.**  
3. **Stage your changes:**
    ```bash
    git add .
    ```
4. **Commit with a message:**
    ```bash
    git commit -m "Description of changes"
    ```
5. **Push to GitHub:**
    ```bash
    git push origin main
    ```

---

## ?? **Daily Commands**

**?? TL;DR:** Essential commands for everyday Git usage - status, add, commit, push, pull.

- **Check status:** See current branch and changes
    ```bash
    git status
    ```
- **Stage changes:** Add file changes to staging
    ```bash
    git add <file>
    ```
- **Commit changes:** Save staged changes with a message
    ```bash
    git commit -m "Message"
    ```
- **Push changes:** Upload local commits to GitHub
    ```bash
    git push origin main
    ```
- **Pull changes:** Fetch and merge changes from GitHub
    ```bash
    git pull origin main
    ```

---

## ?? **Common Scenarios**

**?? TL;DR:** How to handle typical situations - first commit, adding files, undoing changes, resolving conflicts.

- **First commit:** Initialize repository and commit all files
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
- **Adding new files:** Stage and commit new files
    ```bash
    git add newfile.txt
    git commit -m "Add newfile.txt"
    ```
- **Undoing changes:** Revert changes in a file
    ```bash
    git checkout -- file.txt
    ```
- **Resolving conflicts:** Edit files to resolve merge conflicts, then commit
    ```bash
    git add resolved_file.txt
    git commit -m "Resolve merge conflict"
    ```

---

## ?? **Troubleshooting**

**?? TL;DR:** Solutions for common Git problems - conflicts, rejected pushes, authentication issues.

- **Conflict during merge:** Manual intervention required, edit files to resolve
- **Push rejected:** Remote branch is ahead, pull first then push
    ```bash
    git pull origin main
    git push origin main
    ```
- **Authentication failed:** Check GitHub credentials, update if necessary
- **Permission denied:** Ensure correct SSH key is used or HTTPS URL is correct

---

## ? **Git Best Practices**

**?? TL;DR:** Commit often, write clear messages, pull before push, never commit secrets.

- **Commit often:** Small, frequent commits are easier to manage
- **Clear commit messages:** Write meaningful messages that explain the changes
- **Pull before push:** Always update your branch with the latest changes before pushing
- **Ignore sensitive files:** Use `.gitignore` to exclude files with sensitive information

---

## ? **Questions?**

If you have any questions or need further clarification on any Git topics, feel free to ask! Let's get your GitHub repo synced and up-to-date!
