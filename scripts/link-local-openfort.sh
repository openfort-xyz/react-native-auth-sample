#!/usr/bin/env bash
set -euo pipefail

# Overlay LOCAL openfort sibling-repo builds onto this app's pnpm store, so
# unpublished SDK / react-native changes are testable here without publishing.
#
# Why overlay-dist instead of symlinking the repos: the published install lays
# down a complete, Metro-traversable pnpm tree (openfort-js + all @ethersproject
# deps as declared siblings). We swap ONLY the build output, keeping that tree
# intact. No cross-repo Metro resolution, no metro.config hacks.
#
# Usage:
#   pnpm build           (in ../openfort-js)        # rebuild SDK first
#   scripts/link-local-openfort.sh                  # overlay openfort-js
#   scripts/link-local-openfort.sh --with-rn        # also overlay @openfort/react-native
#   pnpm expo start --clear                          # restart Metro

SAMPLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CODE_DIR="$(cd "$SAMPLE_DIR/.." && pwd)"

STORE="$SAMPLE_DIR/node_modules/.pnpm"

overlay() {
  local name="$1" src="$2" pkgglob="$3" subpath="$4"
  if [[ ! -d "$src" ]]; then
    echo "SKIP $name: build output missing at $src (run its build first)" >&2
    return 1
  fi
  local pkgdir
  pkgdir="$(find "$STORE" -maxdepth 1 -type d -name "$pkgglob" | sort | head -1)"
  if [[ -z "$pkgdir" || ! -d "$pkgdir/$subpath" ]]; then
    echo "SKIP $name: not installed in store (looked for $pkgglob)" >&2
    return 1
  fi
  echo "$name: $src -> $pkgdir/$subpath/dist"
  rsync -a --delete "$src/" "$pkgdir/$subpath/dist/"
  # Sync package.json from the same local build so the in-store version label
  # reflects the code actually running (avoids "says 1.3.1 but runs 1.3.9").
  local pkgjson
  pkgjson="$(dirname "$src")/package.json"
  if [[ -f "$pkgjson" ]]; then
    cp "$pkgjson" "$pkgdir/$subpath/package.json"
  fi
}

# openfort-js: local sdk/dist -> in-store @openfort/openfort-js/dist
overlay "openfort-js" \
  "$CODE_DIR/openfort-js/sdk/dist" \
  "@openfort+openfort-js@*" "node_modules/@openfort/openfort-js"

# @openfort/react-native (opt-in): local dist -> in-store react-native/dist
if [[ "${1:-}" == "--with-rn" ]]; then
  overlay "react-native" \
    "$CODE_DIR/react-native/dist" \
    "@openfort+react-native@*" "node_modules/@openfort/react-native"
fi

echo "done. restart Metro: pnpm expo start --clear"
