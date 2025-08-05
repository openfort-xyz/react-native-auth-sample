import { useOpenfort } from '@openfort/react-native';
import LoginScreen from '@/components/LoginScreen';
import { UserScreen } from '@/components/UserScreen';

export default function Index() {
  const { user } = useOpenfort();
  console.log('User:', user);

  return !user ? <LoginScreen /> : <UserScreen />;
}
