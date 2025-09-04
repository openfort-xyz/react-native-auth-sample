import { Ionicons } from "@expo/vector-icons";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useOpenfort } from "@openfort/react-native";
import { OAUTH_PROVIDERS, PROVIDER_CONFIG } from "@/config/openfort";

export default function LoginScreen() {
  const { signUpGuest, signInWithProvider, isAuthenticating, authError, isProviderLoading } = useOpenfort();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={32} color="#3b82f6" />
        </View>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Choose your preferred way to get started</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.guestButton]}
          onPress={() => signUpGuest()}
          activeOpacity={0.8}
        >
          <View style={styles.guestButtonContent}>
            <Ionicons name="person" size={20} color="#374151" />
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {OAUTH_PROVIDERS.map((provider) => {
          const config = PROVIDER_CONFIG[provider];
          const isThisProviderLoading = isProviderLoading(provider);
          return (
            <TouchableOpacity
              key={provider}
              style={[styles.providerButton]}
              onPress={async () => {
                try {
                  await signInWithProvider(provider)
                } catch (error) {
                  console.error("Error logging in with OAuth:", error);
                }
              }}
              activeOpacity={0.8}
              disabled={isAuthenticating || isThisProviderLoading}
            >
              <View style={styles.providerButtonContent}>
                <Ionicons name={config.icon} size={20} color={config.color} />
                <Text style={styles.providerText}>
                  {isThisProviderLoading ? "Loading..." : `Continue with ${config.name}`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {authError && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color="#dc2626" />
          <Text style={styles.errorText}>{authError.message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  guestButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
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
  guestButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  providerButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
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
  providerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  providerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  errorContainer: {
    marginTop: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    flex: 1,
  },
});
