// Apply polyfills for openfort-js
import "@openfort/react-native/polyfills";

import { Slot } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {

  return (
    <SafeAreaView style={{
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      gap: 10,
    }}>
      <Slot />
    </SafeAreaView>
  );
}