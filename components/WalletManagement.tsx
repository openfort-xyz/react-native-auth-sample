import AppModal from "@/components/AppModal";
import { CHAIN_CONFIG } from "@/config/openfort";
import { Ionicons } from "@expo/vector-icons";
import { useOpenfort } from "@openfort/react-native";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WalletManagement() {
  const [chainId, setChainId] = useState("84532");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalMessage, setModalMessage] = useState<string | undefined>(undefined);
  const [modalVariant, setModalVariant] = useState<"success" | "error" | "info">("info");

  const { wallets, setActiveWallet, createWallet, activeWallet, isCreatingWallet, signMessage, switchChain, isSwitchingChain } = useOpenfort();
  const otherWallets = (wallets || []).filter((w) => w.address !== activeWallet?.address);

  const showModal = useCallback((opts: { title?: string; message?: string; variant?: "success" | "error" | "info" }) => {
    setModalTitle(opts.title);
    setModalMessage(opts.message);
    setModalVariant(opts.variant ?? "info");
    setModalVisible(true);
  }, []);

  const handleSignMessage = useCallback(
    async () => {
      try {
        if (!activeWallet) {
          showModal({ title: "No Active Wallet", message: "Please select a wallet before signing.", variant: "info" });
          return;
        }
        const messageToSign = `0x0${Date.now()}`;
        const signature = await signMessage(activeWallet, messageToSign);
        if (signature) {
          showModal({ title: "Message Signed", message: String(signature), variant: "success" });
        }
      } catch (e) {
        console.error(e);
      }
    },
    [activeWallet, showModal, signMessage]
  );

  const handleSwitchChain = useCallback(
    async (chainIdToSwitch: string) => {
      try {
        if (!activeWallet) return;
        await switchChain(activeWallet, chainIdToSwitch);
        showModal({ title: "Network Switched", message: `Chain switched to ${chainIdToSwitch} successfully`, variant: "success" });
      } catch (e) {
        console.error(e);
      }
    },
    [activeWallet, switchChain, showModal]
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name="wallet" size={18} color="#1e293b" />
        <Text style={styles.sectionTitle}>Wallet Management</Text>
      </View>

      {activeWallet?.address && (
        <View style={styles.currentWalletCard}>
          <View style={styles.currentWalletHeader}>
            <Ionicons name="lock-closed" size={24} color="#10b981" />
            <View>
              <Text style={styles.currentWalletLabel}>Active Wallet</Text>
              <Text style={styles.currentWalletAddress}>
                {activeWallet.address.slice(0, 6)}...{activeWallet.address.slice(-4)}
              </Text>
            </View>
          </View>
          <View style={styles.chainInfo}>
            <Ionicons name={CHAIN_CONFIG[chainId as keyof typeof CHAIN_CONFIG]?.icon} size={20} color="#16a34a" />
            <Text style={styles.chainText}>
              {isSwitchingChain ? "Switching..." : CHAIN_CONFIG[chainId as keyof typeof CHAIN_CONFIG]?.name}
            </Text>
          </View>
          <View style={styles.activeActionsRow}>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={async () => {
                const chainToSwitch = chainId === "11155111" ? "84532" : "11155111";
                await handleSwitchChain(chainToSwitch);
                setChainId(chainToSwitch);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal" size={16} color="#374151" />
              <Text style={styles.actionChipText}>
                Switch to {CHAIN_CONFIG[chainId === "11155111" ? "84532" : "11155111" as keyof typeof CHAIN_CONFIG]?.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionChip} onPress={handleSignMessage} activeOpacity={0.8}>
              <Ionicons name="create" size={16} color="#374151" />
              <Text style={styles.actionChipText}>Sign Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {otherWallets.length > 0 && (
        <Text style={styles.sectionSubtitle}>Other Wallets</Text>
      )}

      <View style={styles.walletsGrid}>
        {otherWallets.map((w, i) => (
          <TouchableOpacity
            key={w.address + i}
            style={[styles.walletCard, activeWallet?.address === w.address && styles.activeWalletCard]}
            onPress={() => setActiveWallet({
              address: w.address,
              chainId: Number(chainId),
              onSuccess: () => { console.log("Active wallet set to: " + w.address); },
              onError: (error) => { console.error("Error setting active wallet: " + error.message); }
            })}
            disabled={activeWallet?.address === w.address}
            activeOpacity={0.7}
          >
            <View style={styles.walletRow}>
              <Ionicons name="card" size={20} color="#374151" />
              <Text style={styles.walletAddress}>
                {w.address.slice(0, 6)}...{w.address.slice(-4)}
              </Text>
            </View>
            {w.isConnecting && (
              <Text style={styles.connectingText}>Connecting...</Text>
            )}
            {activeWallet?.address === w.address && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.createWalletButton, isCreatingWallet && styles.disabledButton]}
        onPress={() => createWallet({
          onError: (error) => {
            console.error("Error creating wallet: " + error.message);
            showModal({
              title: "Wallet Creation Failed",
              message: String(error?.message ?? "Unknown error while creating wallet."),
              variant: "error",
            });
          },
          onSuccess: (wallet) => { console.log("Wallet created successfully: " + wallet?.address); },
        })}
        disabled={isCreatingWallet}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={20} color="#3b82f6" />
        <Text style={styles.createWalletText}>
          {isCreatingWallet ? "Creating Wallet..." : "Create New Wallet"}
        </Text>
      </TouchableOpacity>

      <AppModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
        variant={modalVariant}
      />
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
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  currentWalletCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    borderRadius: 8,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  chainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  activeActionsRow: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 12,
  },
  actionChip: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignSelf: 'stretch',
    justifyContent: 'center',
    width: '100%',
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    flexShrink: 1,
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
    shadowOffset: { width: 0, height: 1 },
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  signMessageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
  },
  createWalletText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
});


