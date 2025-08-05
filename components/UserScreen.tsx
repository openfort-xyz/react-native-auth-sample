import React, { useState, useCallback } from "react";
import { Text, TextInput, View, Button, ScrollView } from "react-native";
import { OAuthProvider, useEmbeddedEthereumWallet, useLinkWithOAuth, useOpenfort, useRecoverEmbeddedWallet, ConnectedEmbeddedEthereumWallet } from "@openfort/react-native";


export const UserScreen = () => {
  const [chainId, setChainId] = useState("11155111");
  const [signedMessages, setSignedMessages] = useState<string[]>([]);

  const { logout, user, isReady, error } = useOpenfort();
  console.log('isReady',isReady)
  console.log('error',error)
  const oauth = useLinkWithOAuth();
  const { wallets, create, status, account } = useEmbeddedEthereumWallet({
     onCreateWalletError: (error) => {
      console.error("Error creating wallet:", error);
    },
    onCreateWalletSuccess: (wallet) => {
      console.log("Wallet created successfully:", wallet);
    },
  });
  const { recover } = useRecoverEmbeddedWallet();
  console.log("Embedded Wallets:", wallets, "Status:", status);

  const signMessage = useCallback(
    async (wallet: ConnectedEmbeddedEthereumWallet) => {
      try {
        console.log("Signing message with wallet:", wallet);
        const provider = await wallet.getProvider();
        console.log("Provider:", provider);
        const message = await provider.request({
          method: "personal_sign",
          params: [`0x0${Date.now()}`, account?.address],
        });
        console.log("Message signed:", message);
        if (message) {
          setSignedMessages((prev) => prev.concat(message));
        }
      } catch (e) {
        console.error(e);
      }
    },
    [account?.address]
  );

  const switchChain = useCallback(
    async (wallet: ConnectedEmbeddedEthereumWallet, id: string) => {
      try {
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
    },
    [account?.address]
  );

  if (!user) {
    return null;
  }

  return (
    <View>
      <View style={{ display: "flex", flexDirection: "column", margin: 10 }}>
        {(["twitter", "google", "discord", "apple"] as const).map((provider) => (
          <View key={provider}>
            <Button
              title={`Link ${provider}`}
              disabled={oauth.state.status === "loading"}
              onPress={async() => {
                try {
                await oauth.link({ provider: provider as OAuthProvider })
                } catch (e) {
                  console.error("Error linking account:", e);
                }
              }}
            ></Button>
          </View>
        ))}
      </View>

      <ScrollView style={{ borderColor: "rgba(0,0,0,0.1)", borderWidth: 1 }}>
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
          </View>
 */}
          <View>
            <Text style={{ fontWeight: "bold" }}>{`Embedded Wallet Status: ${status}`}</Text>
            {account?.address && (
              <>
                <Text style={{ fontWeight: "bold" }}>Embedded Wallet</Text>
                <Text>{account?.address}</Text>
              </>
            )}

            <Button title="Create Wallet" onPress={() => create()} />
            <Button title="Recover Wallet" onPress={() => recover({recoveryPassword:'caca'})} />


            <>
              <Text>Chain ID to set to:</Text>
              <TextInput
                value={chainId}
                onChangeText={setChainId}
                placeholder="Chain Id"
              />
              <Button
                title="Switch Chain"
                onPress={async () =>
                  switchChain(wallets[0], chainId)
                }
              />
            </>
          </View>

          <View style={{ display: "flex", flexDirection: "column" }}>
            <Button
              title="Sign Message"
              onPress={async () => signMessage(wallets[0])}
            />

            <Text>Messages signed:</Text>
            {signedMessages.map((m) => (
              <React.Fragment key={m}>
                <Text
                  style={{
                    color: "rgba(0,0,0,0.5)",
                    fontSize: 12,
                    fontStyle: "italic",
                  }}
                >
                  {m}
                </Text>
                <View
                  style={{
                    marginVertical: 5,
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(0,0,0,0.2)",
                  }}
                />
              </React.Fragment>
            ))}
          </View>
          <Button title="Logout" onPress={logout} />
        </View>
      </ScrollView>
    </View>
  );
};
