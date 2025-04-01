import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Button, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { useOpenfort } from '../hooks/useOpenfort';
import { commonStyles } from '../styles/styles';
import Constants from 'expo-constants'

const chainId = Number(process.env.EXPO_PUBLIC_CHAIN_ID);

const SetSigner = () => {
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { handleRecovery, updateState, logout, user } = useOpenfort();

  const handleAutomaticRecovery = async () => {
    setLoading(true);
    const { error } = await handleRecovery({ method: 'automatic', chainId });

    if (error)
      console.error(error);

    await updateState();
    setLoading(false);
  };

  const handleUserPassword = async () => {
    setLoading(true);
    const { error } = await handleRecovery({ method: 'password', password, chainId });

    if (error)
      console.error(error);

    await updateState();
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, marginTop: Constants.statusBarHeight, marginBottom: 20 }} >
      <View style={{ alignItems: "center", marginTop: 20 }} >
        <Text style={commonStyles.title}>
          Set the signer for the current session
        </Text>
        <Text style={{ fontSize: 12, marginBottom: 10 }}>
          {user?.id}
        </Text>
      </View>
      <View style={styles.container}>


        <Text style={styles.text}>With recovery password</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          title="Continue with user password"
          onPress={handleUserPassword}
        />

        <View style={styles.separator} />

        <Text style={styles.text}>With automatic recovery</Text>
        <Button
          title="Continue with automatic recovery"
          onPress={handleAutomaticRecovery}
        />
      </View>

      <View style={{ marginTop: "auto", alignItems: "center" }} >
        <View style={styles.disclaimerContainer}>
          <MaterialIcons name="info" size={20} color="#007acc" />
          <Text style={styles.disclaimerText}>
            Your end users will either use a recovery password or automatic recovery to set the signer for the current session.
          </Text>
        </View>

        <Button
          title="Sign out"
          onPress={() => logout()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    maxWidth: '80%',
    alignItems: 'center',
    backgroundColor: '#e0f7ff', // Light blue background
    borderColor: '#007acc', // Blue border
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    margin: 10,
  },
  disclaimerText: {
    color: '#007acc', // Blue text color
    fontSize: 14,
    marginLeft: 10,
  },
});


export default SetSigner;
