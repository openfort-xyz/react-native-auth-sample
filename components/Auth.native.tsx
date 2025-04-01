import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useOpenfort } from "@/hooks/useOpenfort";
import { useRouter } from "expo-router";

interface AuthProps {
  onDismiss?: () => void;
}

export function Auth({ onDismiss }: AuthProps) {
  const router = useRouter();
  const { auth } = useOpenfort();
  if (Platform.OS === "ios")
    return (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
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
              const data = await auth("ios", credential.identityToken);
              console.log(JSON.stringify(data, null, 2));
              router.push("/main");
            } else {
              throw new Error("No identityToken.");
            }
          } catch (e: any) {
            console.log("Error Auth.native: ", e);
            // Handle user cancellation or errors by calling the onDismiss callback
            // if (e.code === AppleAuthentication.) {
            //   if (onDismiss) onDismiss();
            // }
          }
        }}
      />
    );
  return <div></div>;
}
