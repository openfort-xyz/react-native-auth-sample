import { useRouter } from "expo-router";
import { Button, Platform, Text, View } from "react-native";
import { AppleAuth } from "../../components/authentication/AppleAuth";
import { GoogleAuth } from "../../components/authentication/GoogleAuth";
import { commonStyles } from "../../styles/styles";

const Auth = () => {
  const router = useRouter();

  return (
    <>
      <View
        style={{
          marginBottom: "auto",
          alignItems: "center",
        }}>
        <Text style={commonStyles.title}>
          Openfort React Native Sample
        </Text>
        <Text>
          Please select an authentication method to continue.
        </Text>
      </View>

      <Button
        title="Email & Password"
        onPress={() => router.push("/auth/login")}
      />

      <GoogleAuth />

      {
        Platform.OS === "ios" && (
          <AppleAuth />
        )
      }
      <View style={{ marginTop: "auto" }} >
        <Text style={{ textAlign: "center", maxWidth: 270, color: "#888" }}>
          To enable and configure more authentication methods, please check the app/components/authentication.
        </Text>
      </View >
    </>
  );
};

export default Auth;