import { OAuthProvider, useOAuth, useOpenfort, UserWallet, useUser, useWallets } from "@openfort/react-native";
import { useCallback, useEffect, useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";


export const UserScreen = () => {
  const [chainId, setChainId] = useState("84532");
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);

  // const { signOut } = useSignOut();
  const { user } = useUser();
  const { isReady: isOpenfortUserReady, error: errorInOpenfortUser, logout: signOut } = useOpenfort();
  const { linkOauth, isLoading: isOAuthLoading } = useOAuth();

  const { wallets, setActiveWallet, createWallet, activeWallet, isCreating } = useWallets();

  const signMessage = useCallback(
    async () => {
      try {
        if (!activeWallet) {
          alert("No active wallet selected");
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
          alert("Message signed successfully: " + message);
        }
      } catch (e) {
        console.error(e);
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
        alert(`Chain switched to ${id} successfully`);
      } catch (e) {
        console.error(e);
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

  if (!user) {
    return null;
  }

  return (
    <ScrollView >
      <View style={{ display: "flex", flexDirection: "column", margin: 10 }}>
        {(["twitter", "google", "discord", "apple"] as const).map((provider) => (
          <View key={provider}>
            <Button
              title={`Link ${provider}`}
              disabled={isOAuthLoading}
              onPress={async () => {
                try {
                  await linkOauth({ provider: provider as OAuthProvider })
                } catch (e) {
                  console.error("Error linking account:", e);
                }
              }}
            ></Button>
          </View>
        ))}
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
                      disabled={activeWallet?.address === w.address}
                      onPress={() => setActiveWallet({
                        address: w.address,
                        chainId: Number(chainId),
                        recoveryPassword: "test-password",
                        onSuccess: () => {
                          alert("Active wallet set to: " + w.address);
                        },
                        onError: (error) => {
                          alert("Error setting active wallet: " + error.message);
                        }
                      })}
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
              onPress={() => createWallet({
                recoveryPassword: "test-password",
                onError: (error) => {
                  alert("Error creating wallet: " + error.message);
                },
                onSuccess: ({ wallet }) => {
                  alert("Wallet created successfully: " + wallet?.address);
                },
              })} />

            <>
              <Text>Chain ID: {isSwitchingChain ? "Switching..." : chainId}</Text>
              <Button
                title={`Switch to ${chainId === "11155111" ? "84532" : "11155111"}`}
                onPress={async () => {
                  const chainToSwitch = chainId === "11155111" ? "84532" : "11155111";
                  activeWallet && switchChain(activeWallet, chainToSwitch)
                  setChainId(chainToSwitch)
                }}
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
