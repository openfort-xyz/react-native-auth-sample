import { useOpenfort } from "@openfort/react-native";

export interface UserService {
  user: any | null;
  isUserReady: boolean;
  userError: Error | null;
  linkedAccounts: any[];
  isAccountLinked: (provider: string) => boolean;
}

export const useOpenfortUser = (): UserService => {
  const { user, isUserReady, userError, isProviderLinked } = useOpenfort();
  
  const linkedAccounts = user?.linkedAccounts || [];

  return {
    user,
    isUserReady,
    userError,
    linkedAccounts,
    isAccountLinked: isProviderLinked,
  };
};