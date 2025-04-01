import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useOpenfort } from '../hooks/useOpenfort';
import { commonStyles } from '../styles/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Auth } from '../components/Auth.native';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTraditionalLogin, setShowTraditionalLogin] = useState(false);
  const { logInWithEmailPassword } = useOpenfort();
  const router = useRouter();

  const validateFields = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return false;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Password cannot be empty');
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    if (!validateFields()) {
      return;
    }
    
    const result = await logInWithEmailPassword(email, password);
    if (!result.error) {
      router.replace("/main");
    }
  };

  const handleAuthCancellation = () => {
    setShowTraditionalLogin(true);
  };

  const handleDevLogin = () => {
    // Use AsyncStorage for React Native instead of localStorage
    try {
      setEmail(process.env.EXPO_PUBLIC_DEV_EMAIL || "Configure your .env file");
      setPassword(process.env.EXPO_PUBLIC_DEV_PWD || "");
    } catch (error) {
      console.error("Error setting dev credentials:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={commonStyles.title}>Login</Text>
        
        {!showTraditionalLogin ? (
          <View style={styles.nativeAuthContainer}>
            <Text style={styles.subtitle}>Sign in with:</Text>
            <Auth onDismiss={handleAuthCancellation} type="login" />
            <Button 
              title="Use email & password instead" 
              onPress={handleAuthCancellation} 
            />
          </View>
        ) : (
          <View style={styles.traditionalAuthContainer}>
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
            
            <View style={{ marginTop: 20 }}>
              <Button 
                title="Back to native login" 
                onPress={() => setShowTraditionalLogin(false)} 
              />
            </View>
          </View>
        )}

        {showTraditionalLogin && (
          <View style={{ marginTop: "auto" }}>
            <Button 
              title="set dev" 
              color={"#ddd"} 
              onPress={handleDevLogin} 
            />
          </View>
        )}
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

export default Login;