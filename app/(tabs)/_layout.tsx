import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: true,
				tabBarButton: HapticTab,
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
