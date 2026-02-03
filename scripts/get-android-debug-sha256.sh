#!/usr/bin/env bash
# Prints the SHA256 fingerprint of the Android debug keystore (lowercase, no colons).
# Paste this value into public/.well-known/assetlinks.json → sha256_cert_fingerprints.
# Requires: keytool (from JDK).

set -e
KEYSTORE="${HOME}/.android/debug.keystore"

# Find keytool: prefer Homebrew openjdk (keg-only), then Android Studio JDK, then PATH
# macOS may have a "keytool" stub on PATH that fails with "Unable to locate a Java Runtime".
KEYTOOL=""
if [[ -x "/opt/homebrew/opt/openjdk/bin/keytool" ]]; then
  KEYTOOL="/opt/homebrew/opt/openjdk/bin/keytool"
elif [[ -x "/usr/local/opt/openjdk/bin/keytool" ]]; then
  KEYTOOL="/usr/local/opt/openjdk/bin/keytool"
elif [[ -x "/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/keytool" ]]; then
  KEYTOOL="/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/keytool"
elif command -v keytool &>/dev/null; then
  KEYTOOL="keytool"
fi
if [[ -z "$KEYTOOL" ]]; then
  echo "keytool (Java JDK) not found." >&2
  echo "" >&2
  echo "Install Java: brew install openjdk" >&2
  echo "Then add to PATH (or open a new terminal): export PATH=\"/opt/homebrew/opt/openjdk/bin:\$PATH\"" >&2
  echo "" >&2
  echo "If you install from EAS Build only, get SHA256 from: eas credentials (Android)." >&2
  exit 1
fi

if [[ ! -f "$KEYSTORE" ]]; then
  echo "Debug keystore not found at $KEYSTORE" >&2
  echo "" >&2
  echo "Create it (requires Java/JDK):" >&2
  echo "  mkdir -p ~/.android" >&2
  echo "  $KEYTOOL -genkey -v -keystore $KEYSTORE -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname \"CN=Android Debug,O=Android,C=US\"" >&2
  echo "" >&2
  echo "No Java? Install with: brew install openjdk" >&2
  echo "Or run a local build once: npx expo run:android" >&2
  echo "EAS Build only? Get SHA256 from: eas credentials (Android)" >&2
  exit 1
fi

"$KEYTOOL" -list -v -alias androiddebugkey -keystore "$KEYSTORE" -storepass android 2>/dev/null \
  | grep -i "SHA256:" \
  | sed 's/.*SHA256: //' \
  | tr -d ':' \
  | tr '[:upper:]' '[:lower:]'
