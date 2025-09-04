import { Ionicons } from "@expo/vector-icons";
import { OAuthProvider, useOAuth } from "@openfort/react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const providerConfig = {
  twitter: { icon: "logo-twitter" as const, name: "Twitter", color: "#1DA1F2" },
  google: { icon: "logo-google" as const, name: "Google", color: "#4285F4" },
  discord: { icon: "logo-discord" as const, name: "Discord", color: "#5865F2" },
  apple: { icon: "logo-apple" as const, name: "Apple", color: "#000000" },
};

export default function LinkAccounts() {
  const { linkOauth, isLoading: isOAuthLoading } = useOAuth();

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}><Ionicons name="link" size={18} color="#1e293b" /> Link Accounts</Text>
      <View style={styles.linkAccountsList}>
        {(["google", "apple", "twitter", "discord"] as const).map((provider) => {
          const config = providerConfig[provider];
          return (
            <TouchableOpacity
              key={provider}
              style={[styles.linkAccountButton, isOAuthLoading && styles.disabledButton]}
              onPress={async () => {
                if (isOAuthLoading) return;
                try {
                  await linkOauth({ provider: provider as OAuthProvider });
                } catch (e) {
                  console.error("Error linking account:", e);
                }
              }}
              disabled={isOAuthLoading}
              activeOpacity={0.7}
            >
              <Ionicons name={config.icon} size={20} color={config.color} />
              <Text style={styles.linkAccountText}>Link {config.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  linkAccountsList: {
    gap: 12,
  },
  linkAccountButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  disabledButton: {
    opacity: 0.6,
  },
  linkAccountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});


