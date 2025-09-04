import { Ionicons } from "@expo/vector-icons";
import { OAuthProvider, useOAuth, useUser } from "@openfort/react-native";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const providerConfig = {
  twitter: { icon: "logo-twitter" as const, name: "Twitter", color: "#1DA1F2" },
  google: { icon: "logo-google" as const, name: "Google", color: "#4285F4" },
  discord: { icon: "logo-discord" as const, name: "Discord", color: "#5865F2" },
  apple: { icon: "logo-apple" as const, name: "Apple", color: "#000000" },
};

export default function LinkAccounts() {
  const { linkOauth, isLoading: isOAuthLoading } = useOAuth();
  const [linkingProvider, setLinkingProvider] = useState<OAuthProvider | null>(null);
  const { user } = useUser();
  const linkedProviders = new Set((user?.linkedAccounts || []).map((acc: any) => acc.provider));

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name="link" size={18} color="#1e293b" />
        <Text style={styles.sectionTitle}>Link Accounts</Text>
      </View>
      <View style={styles.linkAccountsList}>
        {(["google", "apple", "twitter", "discord"] as const).map((provider) => {
          const config = providerConfig[provider];
          const isThisLoading = linkingProvider === (provider as OAuthProvider);
          const isLinked = linkedProviders.has(provider);
          return (
            <TouchableOpacity
              key={provider}
              style={[styles.linkAccountButton, (isThisLoading || isLinked) && styles.disabledButton]}
              onPress={async () => {
                if (isLinked || isOAuthLoading || linkingProvider) return;
                try {
                  setLinkingProvider(provider as OAuthProvider);
                  await linkOauth({ provider: provider as OAuthProvider });
                } catch (e) {
                  console.error("Error linking account:", e);
                } finally {
                  setLinkingProvider(null);
                }
              }}
              disabled={isLinked || Boolean(linkingProvider) || isOAuthLoading}
              activeOpacity={0.7}
            >
              <Ionicons name={config.icon} size={20} color={config.color} />
              <Text style={styles.linkAccountText}>
                {isLinked ? `Linked with ${config.name}` : isThisLoading ? "Linking..." : `Link ${config.name}`}
              </Text>
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 0,
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


