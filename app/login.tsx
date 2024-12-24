import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useOpenfort } from '../hooks/useOpenfort';
import { commonStyles } from '../styles/styles';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { logInWithEmailPassword } = useOpenfort();
  const router = useRouter();

  const handleLogin = () => {
    logInWithEmailPassword(email, password);
    router.push("/main");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} >
      <View style={styles.container} >

        <Text style={commonStyles.title}>Login</Text>

        <TextInput
          style={commonStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={commonStyles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button title="Login" onPress={handleLogin} />
        <Text style={{ marginTop: 10 }}>or</Text>
        <Button title="Register" onPress={() => router.push("/register")} />
      </View>

      <View style={{ marginTop: "auto" }} >
        <Button title="set dev" color={"#ddd"} onPress={() => {
          setEmail(process.env.EXPO_PUBLIC_DEV_EMAIL || "Configure your .env file")
          setPassword(process.env.EXPO_PUBLIC_DEV_PWD || "")
        }} />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


export default Login;
