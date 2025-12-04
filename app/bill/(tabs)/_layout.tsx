import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs, router } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const themeColors = Colors[colorScheme ?? "light"];

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: themeColors.tint,
				headerShown: true,
				tabBarButton: HapticTab,
				headerLeft: () => (
					<TouchableOpacity
						onPress={() => router.back()}
						style={{ marginLeft: 16, paddingRight: 5 }}>
						<MaterialIcons
							name="arrow-back"
							size={24}
							color={themeColors.text}
						/>
					</TouchableOpacity>
				),
			}}>
			<Tabs.Screen
				name="index"
				options={{
					title: "Setup Bill",
					tabBarIcon: ({ color }) => (
						<IconSymbol
							size={28}
							name="doc.text.fill"
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					title: "Menu & Split",
					tabBarIcon: ({ color }) => (
						<IconSymbol
							size={26}
							name="menuSplit"
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
