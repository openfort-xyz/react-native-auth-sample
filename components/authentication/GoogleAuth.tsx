import { ThirdPartyOAuthProvider } from '@openfort/openfort-js';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from "react-native";
import { useOpenfort } from '../../hooks/useOpenfort';

// To enable Apple Authentication, you need to:
// 1. Install the @react-native-google-signin/google-signin package
//   > yarn add @react-native-google-signin/google-signin
// 2. Configure react native sign in: https://react-native-google-signin.github.io/docs/setting-up/expo
// 3. Uncomment the import statement below
// Note: You may need to delete the build and re-run it to see the changes

// import * as GoogleAuthentication from '@react-native-google-signin/google-signin';
const GoogleAuthentication = null as any;

export function GoogleAuth() {
  const router = useRouter();
  const { authenticateWithProvider } = useOpenfort();

  if (!GoogleAuthentication)
    return (
      <View style={{ alignItems: "center", width: 220, height: 40, backgroundColor: "#4285f4", borderRadius: 3, justifyContent: "center" }}>
        <Text
          style={{
            color: "#fff",
            fontSize: 14,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Google (not enabled)
        </Text>
      </View>
    )

  return (
    <GoogleAuthentication.GoogleSigninButton
      size={GoogleAuthentication.GoogleSigninButton.Size.Standard}
      color={GoogleAuthentication.GoogleSigninButton.Color.Dark}
      onPress={async () => {
        try {
          await GoogleAuthentication.GoogleSignin.hasPlayServices()
          const userInfo = await GoogleAuthentication.GoogleSignin.signIn()
          console.log("Google Sign-In successful:", JSON.stringify(userInfo, null, 2));
          if (userInfo.data?.idToken) {
            const data = await authenticateWithProvider(ThirdPartyOAuthProvider.GOOGLE_NATIVE, userInfo.data.idToken);
            console.log("Authentication successful:", JSON.stringify(data, null, 2));

            setTimeout(() => {
              console.log("Navigating to main screen");
              router.navigate("/main");
            }, 300);
          } else {
            throw new Error('no ID token present!')
          }
        } catch (error: any) {
          console.error("Google Sign-In error:", error);
          if (error.code === GoogleAuthentication.statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
          } else if (error.code === GoogleAuthentication.statusCodes.IN_PROGRESS) {
            // operation (e.g. sign in) is in progress already
          } else if (error.code === GoogleAuthentication.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
          } else {
            // some other error happened
          }
        }
      }}
    />
  )

}
