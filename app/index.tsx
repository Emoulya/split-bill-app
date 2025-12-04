import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import {
	FlatList,
	Platform,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BillHistoryCard } from "@/src/features/bill/components/BillHistoryCard";
import { useBillStore } from "@/src/store/billStore";

export default function HomeScreen() {
	const { bills, createBill, deleteBill, setActiveBill, cleanupEmptyBills } =
		useBillStore();
	const primaryColor = "#0a7ea4";

    // Pembersihan otomatis
	useFocusEffect(
		useCallback(() => {
			cleanupEmptyBills();
			setActiveBill(null as any);
		}, [])
	);

	// Handler Buat Bill Baru
	const handleCreateNew = () => {
		createBill();
		router.push("/bill/(tabs)");
	};

	// Handler Buka Bill Lama
	const handleOpenBill = (id: string) => {
		setActiveBill(id);
		router.push("/bill/(tabs)");
	};

	return (
		<SafeAreaView
			style={{ flex: 1 }}
			edges={["top", "left", "right"]}>
			<ThemedView style={styles.container}>
				<StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />

				{/* HEADER */}
				<View style={styles.header}>
					<View>
						<ThemedText type="title">Split Bill</ThemedText>
						<ThemedText style={{ opacity: 0.6 }}>
							Kelola patungan makanmu
						</ThemedText>
					</View>
				</View>

				{/* LIST RIWAYAT */}
				<FlatList
					data={bills}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContent}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<IconSymbol
								name="doc.text.fill"
								size={64}
								color="#ccc"
							/>
							<ThemedText style={{ marginTop: 16, opacity: 0.5 }}>
								Belum ada riwayat bill.
							</ThemedText>
							<ThemedText style={{ opacity: 0.5 }}>
								Tekan tombol + untuk mulai.
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

				{/* FAB (Floating Action Button) - Tambah Baru */}
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
	header: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
        paddingBottom: 10,
	},
	listContent: {
		padding: 20,
		paddingBottom: 100,
	},
	emptyState: {
		alignItems: "center",
		justifyContent: "center",
		marginTop: 100,
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
