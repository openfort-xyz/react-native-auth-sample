import { Text, View } from "react-native";
import { useOpenfort } from "../hooks/useOpenfort";

import React, { useState } from "react";
import { TextInput, Button } from "react-native";
import { useRouter } from "expo-router";
import { commonStyles } from "../styles/styles";

export default function Index() {
  const { signUpWithEmailPassword } = useOpenfort();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignUp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    await signUpWithEmailPassword(email, password, name);

    router.push("/main");
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Text style={commonStyles.title}>Register</Text>

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
    </View>
  );
}