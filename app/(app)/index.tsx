import { useUser } from "@openfort/react-native";
import { Redirect } from "expo-router";
import { UserScreen } from "@/components/UserScreen";

export default function Index() {
	const { user } = useUser();

	// if (isLoading) return null;

	if (!user) {
		return <Redirect href="/(auth)/auth" />;
	}

	return <UserScreen />;
}
