import { useUser } from "@openfort/react-native";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
	const { user } = useUser();

	if (!user) {
		return <Redirect href="/(auth)/auth" />;
	}

	return (
		<Stack
			screenOptions={{
				headerTitle: "Openfort Embedded Wallet Sample",
			}}
		/>
	);
}
