// Apply polyfills for openfort-js
import "@openfort/react-native/polyfills";

import { Redirect, Slot } from "expo-router";
import React from "react";
import { ConsoleProvider } from "../hooks/useConsole";
import { OpenfortProvider } from "../hooks/useOpenfort";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";

export default function RootLayout() {

  return (
    <SafeAreaProvider>
      <ConsoleProvider>
        <OpenfortProvider customUri={process.env.EXPO_PUBLIC_IFRAME_URL}>
          <Redirect href="/main" />
          <SafeAreaView style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            gap: 10,
          }}>
            <Slot />
          </SafeAreaView>
        </OpenfortProvider>
      </ConsoleProvider>
    </SafeAreaProvider>
  );
}