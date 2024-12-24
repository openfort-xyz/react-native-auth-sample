import { useState } from 'react';
import { Button, View } from 'react-native';
import { useConsole } from '../../hooks/useConsole';
import { useOpenfort } from '../../hooks/useOpenfort';

export default function Signatures() {
  const [loading, setLoading] = useState(false);
  const { signMessage } = useOpenfort();
  const { addLog } = useConsole();

  const handleSignMessage = () => {
    setLoading(true);

    const signAsync = async () => {
      try {
        const signature = await signMessage("Hello world!");
        addLog(JSON.stringify(signature));
      } catch (err) {
        console.error('Failed to sign message:', err);
        addLog('Failed to sign message. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    signAsync();
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button title={loading ? "Loading..." : "Sign message"} onPress={() => handleSignMessage()} />
    </View>
  )
}
