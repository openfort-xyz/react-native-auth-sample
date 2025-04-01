import React from 'react';
import { Platform, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useOpenfort } from "../hooks/useOpenfort";
import { useRouter } from "expo-router";

interface AuthProps {
  onDismiss?: () => void;
  type?: 'login' | 'register';
}

export function Auth({ onDismiss, type = 'login' }: AuthProps) {
  const router = useRouter();
  const { auth } = useOpenfort();

  if (Platform.OS === "ios") {
    return (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={
          type === 'login'
            ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            : AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
        }
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={{ width: 200, height: 64 }}
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
                const data = await auth("ios", credential.identityToken);
                console.log("Authentication successful:", JSON.stringify(data, null, 2));
                
                // Ensure we navigate after a successful authentication
                // Wrap in setTimeout to ensure the auth state is updated before navigation
                setTimeout(() => {
                  console.log("Navigating to main screen");
                  router.navigate("/main");
                }, 300);
              } catch (authError) {
                console.error("Authentication error:", authError);
                if (onDismiss) onDismiss();
              }
            } else {
              throw new Error("No identityToken.");
            }
          } catch (e: any) {
            console.log("Error Auth.native: ", e);
            
            // Handle user cancellation by calling the onDismiss callback
            if (e.code === 'ERR_CANCELED') {
              if (onDismiss) onDismiss();
            } else {
              // Handle other errors
              if (onDismiss) onDismiss();
            }
          }
        }}
      />
    );
  }
  
  // Return an empty View for Android instead of div
  return <View />;
}