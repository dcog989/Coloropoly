#!/usr/bin/env bash
set -euo pipefail

version="${1:?usage: sync_version.sh <version>}"
file="package.json"

sed -i "s|\"version\": \"[0-9][0-9.]*\"|\"version\": \"$version\"|" "$file"

if ! grep -q "\"version\": \"$version\"" "$file"; then
  echo "error: no version replacement matched in $file" >&2
  exit 1
fi
