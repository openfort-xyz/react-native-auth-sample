import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  userId: string;
};

export default function UserIdCard({ userId }: Props) {
  return (
    <View style={styles.userIdContainer}>
      <Ionicons name="finger-print" size={16} color="#64748b" />
      <Text style={styles.userIdLabel}>User ID</Text>
      <Text style={styles.userIdValue}>{userId.slice(0, 8)}...{userId.slice(-4)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  userIdContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userIdLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  userIdValue: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});


