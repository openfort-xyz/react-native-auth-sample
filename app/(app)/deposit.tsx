import { useUser } from "@openfort/react-native";
import { Redirect } from "expo-router";
import { DepositScreen } from "@/components/deposit/DepositScreen";

export default function Deposit() {
	const { user } = useUser();

	if (!user) {
		return <Redirect href="/(auth)/auth" />;
	}

	return <DepositScreen />;
}
