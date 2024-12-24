import { Text, View, ScrollView } from "react-native";
import { useConsole } from "../hooks/useConsole";

export function Console() {
  const { logs } = useConsole();

  return (
    <>
      <Text style={{ fontWeight: "bold", fontSize: 16, marginLeft: 10 }} >Console</Text>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          borderWidth: 1,
          borderColor: "black",
          margin: 10,
          padding: 10,
        }}
      >
        <ScrollView>
          {logs.map((log, index) => (
            <Text key={index}>{`> ${log}`}</Text>
          ))}
        </ScrollView>
      </View>
    </>
  )
}