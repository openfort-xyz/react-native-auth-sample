// Apply polyfills for openfort-js
import "@openfort/react-native/polyfills";

import { Redirect, Slot } from "expo-router";
import React from "react";
import { ConsoleProvider } from "../hooks/useConsole";
import { OpenfortProvider } from "../hooks/useOpenfort";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {

  return (
    <SafeAreaProvider>
      <ConsoleProvider>
        <OpenfortProvider customUri={process.env.EXPO_PUBLIC_IFRAME_URL}>
          <Redirect href="/main" />
          <Slot />
        </OpenfortProvider>
      </ConsoleProvider>
    </SafeAreaProvider>
  );
}