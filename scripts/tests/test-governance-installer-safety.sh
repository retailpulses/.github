#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# Loading definitions without running the network-facing CLI keeps this test local.
source "$repo_root/bin/rp-governance-install"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/repo"
printf 'v1\n' > "$tmp/source"

# Fresh install and repeat are both safe and idempotent.
guarded_install "$tmp/source" "$tmp/repo/managed"
before="$(shasum -a 256 "$tmp/repo/managed")"
guarded_install "$tmp/source" "$tmp/repo/managed"
after="$(shasum -a 256 "$tmp/repo/managed")"
[[ "$before" == "$after" ]]

# A changed existing file is treated as product-owned/customized by default.
printf 'product policy\n' > "$tmp/repo/managed"
if guarded_install "$tmp/source" "$tmp/repo/managed" 2>"$tmp/error"; then
  echo 'FAIL: collision unexpectedly overwrote existing content' >&2; exit 1
fi
grep -q 'Collision:' "$tmp/error"
grep -q 'product policy' "$tmp/repo/managed"

# Upgrade is possible only with explicit opt-in.
FORCE=true guarded_install "$tmp/source" "$tmp/repo/managed"
cmp -s "$tmp/source" "$tmp/repo/managed"

# The installer checksum manifest makes non-obvious drift visible on repeat.
mkdir -p "$tmp/repo/.github"
(cd "$tmp/repo" && shasum -a 256 managed > .github/governance-managed.sha256 && shasum -a 256 -c .github/governance-managed.sha256 >/dev/null)
printf 'drift\n' >> "$tmp/repo/managed"
if (cd "$tmp/repo" && shasum -a 256 -c .github/governance-managed.sha256 >/dev/null 2>&1); then
  echo 'FAIL: managed file drift was not detected' >&2; exit 1
fi

echo 'PASS: new install, repeat, collision refusal, opted-in upgrade, and drift detection'
