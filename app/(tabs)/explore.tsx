import { Stack, router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
	Alert,
	BackHandler,
	FlatList,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useBillStore } from "@/src/store/billStore";
import { BillItem } from "@/src/types/Bill";
import { formatCurrency } from "@/src/utils/currency";

// Import komponen baru
import { BillItemCard } from "@/src/features/bill/components/BillItemCard";
import { BillItemForm } from "@/src/features/bill/components/BillItemForm";

export default function ItemsScreen() {
	const {
		currentBill,
		addItem,
		updateItemAssignment,
		removeItem,
		updateItem,
		billSummary,
	} = useBillStore();

	const theme = useColorScheme() ?? "light";
	const primaryColor = "#0a7ea4";

	// UI State Orchestration
	const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);

	// Hitung data item yang sedang diedit untuk dilempar ke Form
	const itemToEdit = editingId
		? currentBill.items.find((i) => i.id === editingId)
		: null;

	// --- HANDLER BACK BUTTON ---
	useFocusEffect(
		useCallback(() => {
			const onBackPress = () => {
				if (menuVisibleId) {
					setMenuVisibleId(null);
					return true;
				}
				if (editingId) {
					setEditingId(null);
					Keyboard.dismiss();
					return true;
				}
				return false;
			};
			const subscription = BackHandler.addEventListener(
				"hardwareBackPress",
				onBackPress
			);
			return () => subscription.remove();
		}, [editingId, menuVisibleId])
	);

	// --- LOGIC ACTIONS ---

	const handleSaveItem = (name: string, price: number, quantity: number) => {
		if (editingId) {
			updateItem(editingId, { name, price, quantity });
			setEditingId(null);
			Keyboard.dismiss();
		} else {
			addItem({ name, price, quantity });
		}
	};

	const handleEditPress = (item: BillItem) => {
		setMenuVisibleId(null);
		setEditingId(item.id);
	};

	const handleDeletePress = (id: string) => {
		Alert.alert("Hapus Menu?", "Yakin mau menghapus menu ini?", [
			{ text: "Batal", style: "cancel" },
			{
				text: "Hapus",
				style: "destructive",
				onPress: () => {
					removeItem(id);
					setMenuVisibleId(null);
				},
			},
		]);
	};

	const toggleExpand = (id: string) => {
		if (menuVisibleId === id) {
			setMenuVisibleId(null);
			return;
		}
		setExpandedItemId(expandedItemId === id ? null : id);
	};

	const handleLongPress = (id: string) => {
		setMenuVisibleId(id);
		setExpandedItemId(null);
	};

	return (
		<>
			<Stack.Screen options={{ title: "Menu & Split" }} />

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
				keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}>
				<ThemedView style={styles.container}>
					{/* FORM INPUT */}
					<BillItemForm
						itemToEdit={itemToEdit}
						onSave={handleSaveItem}
						onCancelEdit={() => setEditingId(null)}
						primaryColor={primaryColor}
					/>

					{/* LIST ITEM */}
					<FlatList
						data={currentBill.items}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ paddingBottom: 100 }}
						renderItem={({ item }) => (
							<BillItemCard
								item={item}
								participants={currentBill.participants}
								isExpanded={expandedItemId === item.id}
								isMenuVisible={menuVisibleId === item.id}
								isEditing={editingId === item.id}
								onToggleExpand={toggleExpand}
								onLongPress={handleLongPress}
								onEdit={handleEditPress}
								onDelete={handleDeletePress}
								onCloseMenu={() => setMenuVisibleId(null)}
								onUpdateAssignment={updateItemAssignment}
								primaryColor={primaryColor}
							/>
						)}
					/>

					{/* FOOTER SUMMARY */}
					{billSummary && !editingId && (
						<View
							style={[
								styles.footer,
								{
									borderTopColor:
										theme === "light" ? "#eee" : "#333",
									backgroundColor:
										theme === "light" ? "#fff" : "#151718",
								},
							]}>
							<View>
								<ThemedText style={{ fontSize: 12 }}>
									Grand Total
								</ThemedText>
								<ThemedText type="title">
									{formatCurrency(billSummary.grandTotal)}
								</ThemedText>
							</View>
							<TouchableOpacity
								style={[
									styles.summaryButton,
									{ backgroundColor: primaryColor },
								]}
								onPress={() => router.push("/modal")}>
								<ThemedText
									style={{
										color: "white",
										fontWeight: "bold",
									}}>
									Lihat Hasil
								</ThemedText>
							</TouchableOpacity>
						</View>
					)}
				</ThemedView>
			</KeyboardAvoidingView>
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	footer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		borderTopWidth: 1,
		padding: 16,
		paddingBottom: 30,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		elevation: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	summaryButton: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 24,
	},
});
