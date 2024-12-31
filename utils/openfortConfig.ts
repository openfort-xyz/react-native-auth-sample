import Openfort from "@openfort/react-native";

export const openfort = new Openfort({
  baseConfiguration: {
    publishableKey: process.env.EXPO_PUBLIC_OPENFORT_PUBLIC_KEY!,
  },
  shieldConfiguration: {
    shieldPublishableKey: process.env.EXPO_PUBLIC_SHIELD_API_KEY!,
  },
});
