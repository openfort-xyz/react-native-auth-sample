import { Ionicons } from "@expo/vector-icons";
import { useOpenfort } from "@openfort/react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SignOutButton() {
  const { logout } = useOpenfort();

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out" size={18} color="#dc2626" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
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
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
});


