import LoginScreen from '@/components/LoginScreen';
import { UserScreen } from '@/components/UserScreen';
import { useOpenfortUser } from '@/lib/openfort';

export default function Index() {
  const { user } = useOpenfortUser();

  if (user === null) {
    console.warn('User not authenticated yet - showing login screen');
  } else {
    console.log('User authenticated successfully:', user);
  }

  return !user ? <LoginScreen /> : <UserScreen />;
}
