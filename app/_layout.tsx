import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TouchableOpacity } from "react-native";
import "react-native-reanimated";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<ThemeProvider
			value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<Stack>
				<Stack.Screen
					name="index"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="bill"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="modal"
					options={{
						presentation: "modal",
						title: "Hasil Split Bill",
						headerLeft: () => (
							<TouchableOpacity
								onPress={() => router.back()}
								style={{ marginLeft: -3, padding: 5 }}>
								<MaterialIcons
									name="arrow-back"
									size={24}
									color={Colors[colorScheme ?? "light"].text}
								/>
							</TouchableOpacity>
						),
					}}
				/>
			</Stack>
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
