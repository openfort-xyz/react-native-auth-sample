import { ThirdPartyOAuthProvider } from '@openfort/openfort-js';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from "react-native";
import { useOpenfort } from '../../hooks/useOpenfort';

// To enable Apple Authentication, you need to:
// 1. Install the expo-apple-authentication package
//   > yarn add expo-apple-authentication
// 2. Add "expo-apple-authentication" to plugins in app.json
// 3. Uncomment the import statement below
// Note: You may need to delete the iOS build and re-run it to see the changes

// import * as AppleAuthentication from "expo-apple-authentication";
const AppleAuthentication = null as any;

export function AppleAuth() {
  const router = useRouter();
  const { authenticateWithProvider } = useOpenfort();

  if (!AppleAuthentication)
    return (
      <View style={{ alignItems: "center", width: 200, height: 44, backgroundColor: "#666", borderRadius: 5, justifyContent: "center" }}>
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            textAlign: "center",
          }}
        >
          Apple (not enabled)
        </Text>
      </View>
    )

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={
        AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
      }
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={{ width: 200, height: 44 }}
      onPress={async () => {
        try {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });

          // Sign in via Openfort Auth.
          if (credential.identityToken) {
            try {
              // Pass the platform as 'ios' to indicate Apple authentication
              const data = await authenticateWithProvider(ThirdPartyOAuthProvider.APPLE_NATIVE, credential.identityToken);
              console.log("Authentication successful:", JSON.stringify(data, null, 2));

              // Ensure we navigate after a successful authentication
              // Wrap in setTimeout to ensure the auth state is updated before navigation
              setTimeout(() => {
                console.log("Navigating to main screen");
                router.navigate("/main");
              }, 300);
            } catch (authError) {
              console.error("Authentication error:", authError);
            }
          } else {
            throw new Error("No identityToken.");
          }
        } catch (e: any) {
          console.log("Error Auth.native: ", e);

        }
      }}
    />
  );

}
