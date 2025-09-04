import LoginScreen from '@/components/LoginScreen';
import { UserScreen } from '@/components/UserScreen';
import { useOpenfort } from '@openfort/react-native';

export default function Index() {
  const { user } = useOpenfort();

  if (user === null) {
    console.warn('User not authenticated yet - showing login screen');
  } else {
    console.log('User authenticated successfully:', user);
  }

  return !user ? <LoginScreen /> : <UserScreen />;
}
