# Serving assetlinks.json for Android passkeys

**DataError on Test PRF?** Your `assetlinks.json` still has the placeholder SHA256. Android only accepts the **real** fingerprint of the key that signed your APK.

1. **Get your debug SHA256:** From project root run:
   ```bash
   bash scripts/get-android-debug-sha256.sh
   ```
   Copy the single line it prints (e.g. `a1b2c3d4...`). Replace `YOUR_SHA256_FINGERPRINT_LOWERCASE_NO_COLONS` in `.well-known/assetlinks.json` with that value.
2. From project root: `npx serve public -p 3456`
3. Expose with ngrok: `ngrok http 3456`
4. Set in `.env`: `PASSKEY_RP_ID=<ngrok-hostname>` (e.g. `abc123.ngrok-free.app`)

Then restart Expo so the app uses the new RP ID.
