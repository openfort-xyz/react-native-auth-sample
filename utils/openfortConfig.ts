import { Openfort } from "@openfort/openfort-js";

export const openfort = new Openfort({
  baseConfiguration: {
    publishableKey: process.env.EXPO_PUBLIC_OPENFORT_PUBLIC_KEY!,
  },
  shieldConfiguration: {
    shieldPublishableKey: process.env.EXPO_PUBLIC_SHIELD_API_KEY!,
  },
  overrides: {
    iframeUrl: process.env.EXPO_PUBLIC_IFRAME_URL, // optional
  }
});
