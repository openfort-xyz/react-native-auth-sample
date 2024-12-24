import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Console } from "../../components/console";
import SetSigner from "../../components/setSigner";
import { ConsoleProvider } from "../../hooks/useConsole";
import { useOpenfort } from "../../hooks/useOpenfort";

function RootLayout() {

  const { authState } = useOpenfort();
  const router = useRouter();

  useEffect(() => {
    if (authState === "unauthenticated") {
      router.push("/login");
    }
  }, [authState]);

  if (authState === "recovery") {
    return (
      <SetSigner />
    )
  }

  if (authState != "authenticated") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs safeAreaInsets={{ bottom: 10 }} >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: () => (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>🏠</Text>
              </View>
            ),
          }}
        />
      </Tabs>
      <SafeAreaView edges={{ bottom: "additive" }} style={{ flex: .5 }}>
        <Console />
      </SafeAreaView>
    </View>
  );
}

export default function RootLayoutWrapper() {
  return (
    <ConsoleProvider>
      <RootLayout />
    </ConsoleProvider>
  )
}