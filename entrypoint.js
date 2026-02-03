// entrypoint.js

// Import required polyfills first — must run before the app and Openfort client
// 1. Web Crypto polyfill (global.crypto.subtle for importKey etc.); then getRandomValues; then app
import { install as installQuickCrypto } from "react-native-quick-crypto";
installQuickCrypto();

import "react-native-get-random-values";
// Then import the expo router
import "expo-router/entry";
