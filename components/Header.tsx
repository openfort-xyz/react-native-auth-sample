import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { commonStyles } from "../styles/styles";
import { useState } from "react";

type Props = {
  title: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
}

const Header = ({
  title,
  onBackPress,
  showBackButton = true,
}: Props) => {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <View
      style={{
        marginBottom: "auto",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      {showBackButton && (
        <Pressable
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={() => {
            onBackPress ? onBackPress() : router.back();
          }}
        >
          <Ionicons

            name="arrow-back"
            size={24}
            color={isPressed ? "#888" : "#000"}
          />
        </Pressable>
      )}
      <Text style={{ marginHorizontal: "auto", ...commonStyles.title }}>{title}</Text>
      {
        showBackButton && (
          <View style={{ width: 24 }} />
        )
      }
    </View>
  )
}

export default Header;
