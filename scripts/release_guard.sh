#!/usr/bin/env bash
set -euo pipefail

branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" != "main" ]; then
  echo "error: releases run from main, not $branch" >&2
  exit 1
fi

# cog writes CHANGELOG.md before pre-bump hooks, so it is expected to be dirty.
if [ -n "$(git status --porcelain -- ':!CHANGELOG.md')" ]; then
  echo "error: working tree is dirty; commit or stash first" >&2
  exit 1
fi

# Local commits ahead of origin are fine: the bump pushes them.
git fetch --quiet origin main
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo "error: local main has diverged from origin/main; pull --rebase first" >&2
  exit 1
fi
