import { OAUTH_PROVIDERS, PROVIDER_CONFIG } from "@/config/openfort";
import { Ionicons } from "@expo/vector-icons";
import { useOpenfort } from "@openfort/react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LinkAccounts() {
  const { linkProvider, isAuthenticating, isProviderLoading, user, isProviderLinked } = useOpenfort();

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name="link" size={18} color="#1e293b" />
        <Text style={styles.sectionTitle}>Link Accounts</Text>
      </View>
      <View style={styles.linkAccountsList}>
        {OAUTH_PROVIDERS.map((provider) => {
          const config = PROVIDER_CONFIG[provider];
          const isThisLoading = isProviderLoading(provider);
          const isLinked = isProviderLinked(provider);
          return (
            <TouchableOpacity
              key={provider}
              style={[styles.linkAccountButton, (isThisLoading || isLinked) && styles.disabledButton]}
              onPress={async () => {
                if (isLinked || isAuthenticating || isThisLoading) return;
                try {
                  await linkProvider(provider);
                } catch (e) {
                  console.error("Error linking account:", e);
                }
              }}
              disabled={isLinked || isThisLoading || isAuthenticating}
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


