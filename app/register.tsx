import { Text, View, StyleSheet, Button, TextInput } from "react-native";
import { useOpenfort } from "../hooks/useOpenfort";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { commonStyles } from "../styles/styles";
import { Auth } from "../components/Auth.native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
  const { signUpWithEmailPassword } = useOpenfort();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showTraditionalSignup, setShowTraditionalSignup] = useState(false);

  const handleSignUp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    await signUpWithEmailPassword(email, password, name);
    router.push("/main");
  }

  const handleAuthCancellation = () => {
    setShowTraditionalSignup(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={commonStyles.title}>Register</Text>

        {!showTraditionalSignup ? (
          <View style={styles.nativeAuthContainer}>
            <Text style={styles.subtitle}>Sign up with:</Text>
            <Auth onDismiss={handleAuthCancellation} />
            <Button 
              title="Use email & password instead" 
              onPress={handleAuthCancellation} 
            />
          </View>
        ) : (
          <View style={styles.traditionalAuthContainer}>
            <TextInput
              style={commonStyles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={commonStyles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={commonStyles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Button title="Register" onPress={handleSignUp} />
            <Text style={{ marginTop: 10 }}>or</Text>
            <Button title="Login" onPress={() => router.push("/login")} />
            
            <View style={{ marginTop: 20 }}>
              <Button 
                title="Back to native signup" 
                onPress={() => setShowTraditionalSignup(false)} 
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  nativeAuthContainer: {
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
  },
  traditionalAuthContainer: {
    alignItems: 'center',
    width: '80%',
  }
});