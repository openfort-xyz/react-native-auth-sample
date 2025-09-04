import { useOpenfort, useUser } from "@openfort/react-native";

export interface UserService {
  user: any | null;
  isUserReady: boolean;
  userError: Error | null;
  linkedAccounts: any[];
  isAccountLinked: (provider: string) => boolean;
}

export const useOpenfortUser = (): UserService => {
  const { user } = useUser();
  const { isReady: isUserReady, error: userError } = useOpenfort();
  
  const linkedAccounts = user?.linkedAccounts || [];
  
  const isAccountLinked = (provider: string): boolean => {
    return linkedAccounts.some((acc: any) => acc.provider === provider);
  };

  return {
    user,
    isUserReady,
    userError,
    linkedAccounts,
    isAccountLinked,
  };
};