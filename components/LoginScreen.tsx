import { Button, Text, View } from "react-native";
import Constants from "expo-constants";
import { useState } from "react";
import * as Application from "expo-application";
import { OAuthProvider, useCreateGuestAccount, useLoginWithOAuth } from "@openfort/react-native";

export default function LoginScreen() {
  const [error, setError] = useState("");
  const { create} = useCreateGuestAccount({
    onError: (err) => {
      console.log("Error creating guest account:", err);
      setError(err.message);
    },
    onSuccess: (user) => {
      console.log("Success creating guest account: ", user);
    },
  })
  const { login } = useLoginWithOAuth();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        marginHorizontal: 10,
      }}
    >
      <Text style={{ fontSize: 10 }}>{Application.applicationId}</Text>
      <Text style={{ fontSize: 10 }}>
        {Application.applicationId === "host.exp.Exponent"
          ? "exp"
          : Constants.expoConfig?.scheme}
      </Text>

      <Button
        title="Login as Guest"
        onPress={() =>
          create()
        }
      />

      <View
        style={{ display: "flex", flexDirection: "column", gap: 5, margin: 10 }}
      >
        {["twitter", "google", "discord", "apple"].map((provider) => (
          <View key={provider}>
            <Button
              title={`Login with ${provider}`}
              onPress={async() => {
                try {
                  await login({ provider: provider as OAuthProvider})
                } catch (error) {
                  console.error("Error logging in with OAuth:", error);
                }
              }
            }
            ></Button>
          </View>
        ))}
      </View>
      {error && <Text style={{ color: "red" }}>Error: {error}</Text>}
    </View>
  );
}
