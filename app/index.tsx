import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
	FlatList,
	Platform,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { BillHistoryCard } from "@/src/features/bill/components/BillHistoryCard";
import { DashboardStats } from "@/src/features/bill/components/DashboardStats";
import { useBillStore } from "@/src/store/billStore";

export default function HomeScreen() {
	const { bills, createBill, deleteBill, setActiveBill, cleanupEmptyBills } =
		useBillStore();
	const primaryColor = "#0a7ea4";
	const textColor = useThemeColor({}, "text");
	const placeholderColor = useThemeColor(
		{ light: "#999", dark: "#666" },
		"text"
	);

	// State untuk Search
	const [searchQuery, setSearchQuery] = useState("");

	useFocusEffect(
		useCallback(() => {
			cleanupEmptyBills();
			setActiveBill(null as any);
		}, [])
	);

	const handleCreateNew = () => {
		createBill();
		router.push("/bill/(tabs)");
	};

	const handleOpenBill = (id: string) => {
		setActiveBill(id);
		router.push("/bill/(tabs)");
	};

	// Filter Logic
	const filteredBills = bills.filter((bill) =>
		bill.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<SafeAreaView
			style={{ flex: 1 }}
			edges={["top", "left", "right"]}>
			<ThemedView style={styles.container}>
				<StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />

				<FlatList
					data={filteredBills}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContent}
					// --- HEADER  ---
					ListHeaderComponent={
						<View style={{ marginBottom: 20 }}>
							<DashboardStats bills={bills} />

							<View style={styles.searchContainer}>
								<IconSymbol
									name="magnifyingglass"
									size={20}
									color="#999"
								/>
								<TextInput
									placeholder="Cari riwayat makan..."
									placeholderTextColor={placeholderColor}
									value={searchQuery}
									onChangeText={setSearchQuery}
									style={{
										flex: 1,
										height: "100%",
										color: textColor,
										fontSize: 16,
										paddingVertical: 0,
									}}
								/>
							</View>

							<ThemedText
								type="defaultSemiBold"
								style={{ marginTop: 10, opacity: 0.5 }}>
								Riwayat Terakhir
							</ThemedText>
						</View>
					}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<IconSymbol
								name="doc.text.fill"
								size={48}
								color="#ccc"
							/>
							<ThemedText style={{ marginTop: 16, opacity: 0.5 }}>
								{searchQuery
									? "Tidak ditemukan."
									: "Belum ada riwayat."}
							</ThemedText>
						</View>
					}
					renderItem={({ item }) => (
						<BillHistoryCard
							bill={item}
							onPress={() => handleOpenBill(item.id)}
							onDelete={() => deleteBill(item.id)}
						/>
					)}
				/>

				{/* FAB */}
				<TouchableOpacity
					style={[styles.fab, { backgroundColor: primaryColor }]}
					onPress={handleCreateNew}
					activeOpacity={0.8}>
					<IconSymbol
						name="plus"
						size={32}
						color="white"
					/>
				</TouchableOpacity>
			</ThemedView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	listContent: {
		padding: 20,
		paddingBottom: 100,
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(150,150,150, 0.1)",
		paddingHorizontal: 12,
		borderRadius: 12,
		height: 48,
		overflow: "hidden",
	},
	emptyState: {
		alignItems: "center",
		justifyContent: "center",
		marginTop: 40,
	},
	fab: {
		position: "absolute",
		bottom: 30,
		right: 20,
		width: 64,
		height: 64,
		borderRadius: 32,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 8,
	},
});
