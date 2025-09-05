import { OAuthProvider, useOAuth, useOpenfort, UserWallet, useUser, useWallets } from "@openfort/react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, ScrollView, Text, View } from "react-native";


export const UserScreen = () => {
  const [chainId, setChainId] = useState("84532");
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const [pendingWalletAddress, setPendingWalletAddress] = useState<UserWallet['address'] | null>(null);

  // const { signOut } = useSignOut();
  const { user } = useUser();
  const { isReady: isOpenfortUserReady, error: errorInOpenfortUser, logout: signOut } = useOpenfort();
  const { linkOauth, isLoading: isOAuthLoading } = useOAuth({ throwOnError: true });

  const { wallets, setActiveWallet, createWallet, activeWallet, isCreating } = useWallets({ throwOnError: true });

  // console.log("Embedded Wallets:", wallets, "Status:", status);

  const handlePressWallet = useCallback(async (walletAddress: UserWallet['address']) => {
    try {
      setPendingWalletAddress(walletAddress);
      await setActiveWallet({
        address: walletAddress,
        chainId: Number(chainId),
      });
      setPendingWalletAddress(null);
      Alert.alert("Active wallet set", walletAddress);
    } catch (error) {
      setPendingWalletAddress(null);
      console.error("Error setting active wallet", error);
    }
  }, [chainId, setActiveWallet]);

  const signMessage = useCallback(
    async () => {
      try {
        if (!activeWallet) {
          Alert.alert("No active wallet selected");
          return;
        }
        console.log("Signing message with wallet:", activeWallet);
        const provider = await activeWallet.getProvider();
        console.log("Provider:", provider);
        const message = await provider.request({
          method: "personal_sign",
          params: [`0x0${Date.now()}`, activeWallet?.address],
        });
        console.log("Message signed:", message);
        if (message) {
          Alert.alert("Message signed successfully", String(message));
        }
      } catch (e) {
        console.error("Error signing message", e);
      }
    },
    [activeWallet]
  );

  const switchChain = useCallback(
    async (wallet: UserWallet, id: string) => {
      try {
        setIsSwitchingChain(true);
        console.log("Signing message with wallet:", wallet);
        const provider = await wallet.getProvider();
        console.log("Provider:", provider);
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x" + Number(id).toString(16) }],
        });
        Alert.alert("Chain switched", `Switched to ${id} successfully`);
      } catch (e) {
        console.error("Error switching chain", e);
      }
      setIsSwitchingChain(false);
    },
    []
  );

  useEffect(() => {
    if (isOpenfortUserReady) {
      console.log('User fetched from Openfort is ready.');
    }
    else {
      console.warn('User fetched from Openfort is not ready.');
    }
  
    if (errorInOpenfortUser) {
      console.error('Error fetching user from Openfort:', errorInOpenfortUser);
    }
  }, [isOpenfortUserReady, errorInOpenfortUser]);

  const isLinked = (provider: 'twitter' | 'google' | 'discord' | 'apple') => {
    return !!user?.linkedAccounts?.some((a: { provider: string }) => a.provider === provider);
  };

  const handleLinkProvider = useCallback(async (provider: 'twitter' | 'google' | 'discord' | 'apple') => {
    if (isLinked(provider)) return;
    try {
      await linkOauth({ provider: provider as OAuthProvider });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert("Linking error", message);
    }
  }, [user, linkOauth]);

  const handleCreateWallet = useCallback(() => {
    createWallet({
      onError: (error) => {
        console.error("Error creating wallet", error);
      },
      onSuccess: ({ wallet }) => {
        Alert.alert("Wallet created", wallet?.address || "");
      },
    })
  }, [createWallet]);

  const handleSwitchChain = useCallback(async () => {
    const chainToSwitch = chainId === "11155111" ? "84532" : "11155111";
    if (activeWallet) {
      await switchChain(activeWallet, chainToSwitch);
    }
    setChainId(chainToSwitch)
  }, [chainId, activeWallet, switchChain]);

  if (!user) {
    return null;
  }

  return (
    <ScrollView >
      <View style={{ display: "flex", flexDirection: "column", margin: 10 }}>
        {(["twitter", "google", "discord", "apple"] as const).map((provider) => {
          return (
            <View key={provider}>
              <Button
                title={
                  isLinked(provider) ? `Linked with ${provider}` :
                  isOAuthLoading ? "Linking..." :
                  `Link ${provider}`
                }
                disabled={isLinked(provider) || isOAuthLoading}
                onPress={() => handleLinkProvider(provider)}
              ></Button>
            </View>
          );
        })}
      </View>

      <View style={{ borderColor: "rgba(0,0,0,0.1)", borderWidth: 1 }}>
        <View
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <View>
            <Text style={{ fontWeight: "bold" }}>User ID</Text>
            <Text>{user.id}</Text>
          </View>

          {/* <View>
            <Text style={{ fontWeight: "bold" }}>Linked accounts</Text>
            {user?.linkedAccounts.length ? (
              <View style={{ display: "flex", flexDirection: "column" }}>
                {user?.linkedAccounts?.map((m) => (
                  <Text
                    key={m.verified_at}
                    style={{
                      color: "rgba(0,0,0,0.5)",
                      fontSize: 12,
                      fontStyle: "italic",
                    }}
                  >
                    {m.type}: {toMainIdentifier(m)}
                  </Text>
                ))}
              </View>
            ) : null}
          </View> */}

          <View>
            {/* <Text style={{ fontWeight: "bold" }}>{`Embedded Wallet: ${activeWallet?.address || "disconnected"}`}</Text> */}
            {activeWallet?.address && (
              <>
                <Text style={{ fontWeight: "bold" }}>Current Wallet</Text>
                <Text>{activeWallet?.address || "disconnected"}</Text>
              </>
            )}

            <Text style={{ fontWeight: "bold", marginTop: 20, fontSize: 16 }}>Available Wallets</Text>
            {
              wallets
                .map((w, i) => (
                  <View key={w.address + i} style={{ display: "flex", flexDirection: "row", gap: 5, alignItems: "center" }}>
                    <Button
                      title={`${w.address.slice(0, 6)}...${w.address.slice(-4)}`}
                      disabled={activeWallet?.address === w.address || pendingWalletAddress === w.address}
                      onPress={() => handlePressWallet(w.address)}
                    />

                    {
                      w.isConnecting && (
                        <Text style={{ color: "rgba(0,0,0,0.5)", fontSize: 12, fontStyle: "italic" }}>
                          Connecting...
                        </Text>
                      )
                    }
                  </View>
                ))
            }
            <Button
              title={isCreating ? "Creating Wallet..." : "Create Wallet"}
              disabled={isCreating}
              onPress={handleCreateWallet} />

            <>
              <Text>Chain ID: {isSwitchingChain ? "Switching..." : chainId}</Text>
              <Button
                title={`Switch to ${chainId === "11155111" ? "84532" : "11155111"}`}
                onPress={handleSwitchChain}
              />
            </>
          </View>

          <View style={{ display: "flex", flexDirection: "column" }}>
            <Button
              title="Sign Message"
              onPress={async () => signMessage()}
            />
          </View>
          <Button title="Logout" onPress={signOut} />
        </View>
      </View >
    </ScrollView >
  );
};
