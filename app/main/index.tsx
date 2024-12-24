import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';
import { useConsole } from '../../hooks/useConsole';
import { useOpenfort } from '../../hooks/useOpenfort';

export default function Index() {
  const { logout, user } = useOpenfort();
  const router = useRouter();
  const { addLog } = useConsole();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Text style={{
        margin: 10,
        fontSize: 20,
        fontWeight: 'bold'
      }}>Main page</Text>
      <Button title="Get user" onPress={() => {
        addLog(JSON.stringify(user, null, 2))
      }} />
      <Button title="Logout" onPress={() => {
        logout()
      }} />
    </View>
  )
}
