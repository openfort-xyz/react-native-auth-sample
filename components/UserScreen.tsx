import LinkAccounts from "@/components/LinkAccounts";
import SignOutButton from "@/components/SignOutButton";
import UserIdCard from "@/components/UserIdCard";
import WalletManagement from "@/components/WalletManagement";
import { useOpenfort } from "@openfort/react-native";
import { useEffect } from "react";
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from "react-native";

// Link accounts, user id, and sign out UI extracted to dedicated components

// Wallet styles and logic have been extracted to `WalletManagement` component

export const UserScreen = () => {
  const { user, isUserReady, userError } = useOpenfort();

  useEffect(() => {
    if (isUserReady) {
      console.log('Openfort user service is ready');
    } else {
      console.warn('Openfort user service is not ready yet');
    }
  
    if (userError) {
      console.error('Error in Openfort user service:', userError);
    }
  }, [isUserReady, userError]);

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <UserIdCard userId={user.id} />
        </View>

        <LinkAccounts />

        <WalletManagement />

        <SignOutButton />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#ffffff',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  userIdText: { fontSize: 14, color: '#64748b', fontFamily: 'monospace' },
  sectionContainer: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  linkAccountsList: { gap: 12 },
  currentWalletCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  currentWalletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  currentWalletEmoji: {
    fontSize: 24,
  },
  currentWalletLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  currentWalletAddress: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: 'monospace',
  },
  chainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
  },
  chainEmoji: {
    fontSize: 20,
  },
  chainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  walletsGrid: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  walletCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  activeWalletCard: {
    borderColor: '#10b981',
    borderWidth: 2,
  },
  walletEmoji: {
    fontSize: 20,
    marginBottom: 8,
  },
  walletAddress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'monospace',
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  connectingText: {
    fontSize: 10,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  activeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  createWalletButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
  },
  createWalletEmoji: {
    fontSize: 20,
  },
  createWalletText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  walletActions: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  chainSwitchButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chainSwitchEmoji: {
    fontSize: 18,
  },
  chainSwitchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  signMessageButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  signMessageEmoji: {
    fontSize: 18,
  },
  signMessageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  logoutButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutEmoji: {
    fontSize: 18,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
});
