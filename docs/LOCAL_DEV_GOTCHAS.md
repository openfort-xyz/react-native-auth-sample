# Local Development Gotchas

This app is an Expo **development build** (passkeys need native modules — Expo Go won't work). The single biggest time-sink is applying a change with the *wrong kind of reload*. This page documents which change needs which action, and the toolchain traps we've hit.

## TL;DR — what to run after you change X

| You changed… | What it is | Run this | Why |
|---|---|---|---|
| `app.json` → `extra.*` — `openfortPublishableKey`, `openfortShieldPublishableKey`, `openfortPolicyId`, `passkeyRpId`/`Name` | Client config, read via `Constants.expoConfig.extra` | **Native rebuild:** `npx expo run:ios` (add `--no-bundler` to reuse a running Metro) | These are **baked into the native binary at build time** by the `Generate app.config for prebuilt Constants.manifest` phase. A reload / Metro restart / fast-refresh **cannot** change them. |
| `.env` used by API routes — `SHIELD_API_KEY`, `SHIELD_SECRET_KEY`, `SHIELD_ENCRYPTION_SHARE` | Server-side, read via `process.env` in `app/api/*+api.ts` | **Restart Metro:** `npx expo start --clear` | API routes run inside the dev server; `.env` is loaded at dev-server boot. |
| `metro.config.js` | Bundler / resolver config | **Restart Metro** (kill it, then `expo start --clear`) | Not hot-reloaded — Metro even prints *"Detected a change in metro.config.js. Restart the server."* |
| Native identity — `scheme`, `ios.bundleIdentifier`, `android.package`, `associatedDomains`, `plugins`, app icon, permissions, or adding a native module | Native project config | `npx expo prebuild --clean && npx expo run:ios` | Baked at prebuild/build time. |
| JS/TS in `app/`, `components/`, … | App code | **Nothing** — fast-refresh applies it. For provider or `Constants` changes, do a **full reload** (`r`), not just fast-refresh. | — |

## Mental model — the four "reload" levels

1. **Fast-refresh** (automatic on save): JS modules only. Does **not** re-run `Constants.expoConfig` and does **not** re-mount providers (e.g. `OpenfortProvider`). UI updates; config does not.
2. **Full reload** (`r` in the Metro terminal, shake → Reload, or relaunch the app): re-runs JS from scratch and re-reads the **embedded** `Constants` — but the embedded config only changes on a rebuild.
3. **Metro restart** (`expo start --clear`): re-reads `metro.config.js` and `.env`.
4. **Native rebuild** (`expo run:ios`): re-embeds `app.json` and recompiles native code.

> There are **no `EXPO_PUBLIC_*` variables** in this project. The client reads Openfort keys from `app.json` → `extra` (via `Constants`), **not** from `.env`. `.env` is for the server-side API routes only.

## Switching to a different Openfort project

1. Update `app.json` → `extra`: `openfortPublishableKey`, `openfortShieldPublishableKey`, `openfortPolicyId`.
2. Update `.env`: `SHIELD_API_KEY`, `SHIELD_SECRET_KEY`, `SHIELD_ENCRYPTION_SHARE`.
3. **Rebuild** (`npx expo run:ios`) — *not* a reload (see the table).
4. **Sign out and log in fresh.** The persisted session/wallet (SecureStore) belongs to the old project. Transaction intents only appear in the dashboard of the project that owns the **embedded publishable key**.
5. Verify against the dashboard project that matches the publishable key.

## Verifying which config the app actually loaded

Stale config is invisible — the app keeps running the old keys silently. Drop a temporary on-screen readout of the live values:

```tsx
const extra = Constants.expoConfig?.extra ?? {};
// <Text>pk: {String(extra.openfortPublishableKey)}</Text>
// <Text>policyId: {String(extra.openfortPolicyId ?? "none")}</Text>
```

If it still shows the old key after a full reload → the value is embedded → **rebuild**.

## Paymaster / gas sponsorship

- The Paymaster toggle is gated on `policyId = Constants.expoConfig.extra.openfortPolicyId` (`disabled={!policyId}`). Setting a policy in the **dashboard** does nothing for the button — the app reads the policy ID from `app.json` → `extra`. Empty ID → toggle disabled.
- Only **Smart Accounts** consume sponsorship (an EOA self-pays). Use `accountType: AccountTypeEnum.SMART_ACCOUNT`.
- `personal_sign` is **off-chain** — it never creates a transaction intent. Use a real transaction (mint / `sendTransaction`) to see intents in the dashboard.

## Toolchain traps

- **`ios/.xcode.env.local` node path.** `expo prebuild` writes an absolute Homebrew **Cellar** path, e.g. `/opt/homebrew/Cellar/node@24/24.16.0/bin/node`. A `brew upgrade` bumps the patch version, that exact path disappears, and the next Xcode build fails inside a Hermes/RN script phase with `… /bin/node: No such file or directory`. **Fix:** point it at the stable `opt` symlink instead — `export NODE_BINARY=/opt/homebrew/opt/node@24/bin/node`.
- **`osascript … "System Events" … (-1743)`** at the end of `expo run:ios` is **cosmetic**. The build and install already succeeded; only the auto-focus of the Simulator failed because the terminal lacks macOS **Automation** permission (System Settings → Privacy & Security → Automation). Launch the app manually instead:
  ```bash
  xcrun simctl openurl booted "com.openfort.exposample://expo-development-client/?url=http://localhost:8081"
  ```

## Consuming a local sibling SDK build (advanced)

`metro.config.js` can link `@openfort/openfort-js` to a local `../openfort-js/sdk` build via `resolver.resolveRequest` + `watchFolders` + `nodeModulesPaths`, resolving the package to its ESM entry (`dist/sdk/src/index.js`). After editing `metro.config.js`, fully restart Metro. Keep `@openfort/react-native` on the published version unless the local one is API-compatible with the installed Expo SDK.
