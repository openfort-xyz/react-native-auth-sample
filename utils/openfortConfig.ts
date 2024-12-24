import Openfort from "@openfort/openfort-js";

console.log("PUBLIC_OPENFORT_PUBLIC_KEY", process.env.EXPO_PUBLIC_OPENFORT_PUBLIC_KEY);
console.log("PUBLIC_SHIELD_API_KEY", process.env.EXPO_PUBLIC_SHIELD_API_KEY);
console.log("EXPO_PUBLIC_IFRAME_URL", process.env.EXPO_PUBLIC_IFRAME_URL);

export const openfort = new Openfort({
  overrides: {
    iframeUrl: process.env.EXPO_PUBLIC_IFRAME_URL,
  },
  baseConfiguration: {
    publishableKey: process.env.EXPO_PUBLIC_OPENFORT_PUBLIC_KEY!,
  },
  shieldConfiguration: {
    shieldPublishableKey: process.env.EXPO_PUBLIC_SHIELD_API_KEY!,
  },
});
