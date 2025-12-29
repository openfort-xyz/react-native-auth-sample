import { useUser } from "@openfort/react-native";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
	const { user } = useUser();

	if (user) {
		return <Redirect href="/(app)" />;
	}

	return <Stack />;
}
