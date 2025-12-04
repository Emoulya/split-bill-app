import { IconSymbol } from "@/components/ui/icon-symbol";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
	Alert,
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
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemedInput } from "@/src/components/ui/ThemedInput";
import { useBillStore } from "@/src/store/billStore";
import { BillItem } from "@/src/types/Bill";
import { formatCurrency } from "@/src/utils/currency";

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
	const activeColor = Colors[theme].tint;

	// Form State
	const [itemName, setItemName] = useState("");
	const [itemPrice, setItemPrice] = useState("");
	const [itemQty, setItemQty] = useState("1");

	// UI State
	const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);

	const handleSaveItem = () => {
		if (!itemName.trim()) {
			Alert.alert("Eits!", "Nama menu belum diisi.");
			return;
		}
		const price = parseFloat(itemPrice);
		if (!itemPrice || isNaN(price) || price <= 0) {
			Alert.alert("Eits!", "Harga harus diisi angka yang benar.");
			return;
		}
		const qty = parseInt(itemQty) || 1;

		if (editingId) {
			updateItem(editingId, {
				name: itemName,
				price: price,
				quantity: qty,
			});
			setEditingId(null);
			Keyboard.dismiss();
		} else {
			addItem({ name: itemName, price: price, quantity: qty });
		}
		resetForm();
	};

	const resetForm = () => {
		setItemName("");
		setItemPrice("");
		setItemQty("1");
		setEditingId(null);
	};

	// --- MENU HANDLER ---

	const handleLongPress = (id: string) => {
		setMenuVisibleId(id);
		setExpandedItemId(null);
	};

	const onEditPress = (item: BillItem) => {
		setMenuVisibleId(null);
		setEditingId(item.id);
		setItemName(item.name);
		setItemPrice(item.price.toString());
		setItemQty(item.quantity.toString());
	};

	const onDeletePress = (id: string) => {
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

	return (
		<>
			<Stack.Screen options={{ title: "Menu & Split" }} />

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
				keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}>
				<ThemedView style={styles.container}>
					{/* --- FORM INPUT --- */}
					<View
						style={[
							styles.inputContainer,
							editingId
								? {
										borderColor: activeColor,
										borderWidth: 1,
										padding: 10,
										borderRadius: 12,
										borderStyle: "dashed",
								  }
								: {},
						]}>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								marginBottom: 10,
							}}>
							<ThemedText type="subtitle">
								<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
									<IconSymbol
										name={editingId ? "pencil" : "plus"}
										size={20}
										color={activeColor}
									/>
									<ThemedText type="subtitle">
										{editingId ? "Edit Menu" : "Tambah Menu"}
									</ThemedText>
								</View>
							</ThemedText>
							{editingId && (
								<TouchableOpacity onPress={resetForm}>
									<ThemedText style={{ color: "red" }}>
										Batal
									</ThemedText>
								</TouchableOpacity>
							)}
						</View>

						<ThemedInput
							placeholder="Nama Menu"
							value={itemName}
							onChangeText={setItemName}
						/>
						<View style={{ flexDirection: "row", gap: 10 }}>
							<View style={{ flex: 2 }}>
								<ThemedInput
									placeholder="Harga"
									keyboardType="numeric"
									value={itemPrice}
									onChangeText={setItemPrice}
								/>
							</View>
							<View style={{ flex: 1 }}>
								<ThemedInput
									placeholder="Qty"
									keyboardType="numeric"
									value={itemQty}
									onChangeText={setItemQty}
								/>
							</View>
							<TouchableOpacity
								style={[
									styles.addButton,
									{
										backgroundColor: editingId
											? "#4CAF50"
											: activeColor,
									},
								]}
								onPress={handleSaveItem}>
								<IconSymbol
									name={editingId ? "checkmark" : "plus"}
									size={24}
									color="white"
								/>
							</TouchableOpacity>
						</View>
					</View>

					{/* --- LIST ITEM --- */}
					<FlatList
						data={currentBill.items}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ paddingBottom: 100 }}
						renderItem={({ item }) => {
							const isExpanded = expandedItemId === item.id;
							const isEditing = editingId === item.id;
							const isMenuVisible = menuVisibleId === item.id;
							const assignedCount =
								item.assignedToParticipantIds.length;

							return (
								<View
									style={[
										styles.card,
										{
											borderColor:
												isEditing || isMenuVisible
													? activeColor
													: theme === "light"
													? "#eee"
													: "#333",
										},
										isEditing && {
											backgroundColor:
												"rgba(10, 126, 164, 0.05)",
										},
									]}>
									{/* LAYER MENU OVERLAY */}
									{isMenuVisible ? (
										<View
											style={[
												styles.menuOverlay,
												{
													backgroundColor:
														theme === "light"
															? "#f0f9ff"
															: "#2A2A2A",
												},
											]}>
											<View style={styles.menuContent}>
												<TouchableOpacity
													onPress={() =>
														onEditPress(item)
													}
													style={styles.menuButton}>
													<IconSymbol
														name="pencil"
														size={20}
														color={activeColor}
													/>
													<ThemedText
														style={{
															color: activeColor,
															fontWeight: "bold",
														}}>
														Edit
													</ThemedText>
												</TouchableOpacity>

												<View
													style={{
														width: 1,
														height: 20,
														backgroundColor: "#ccc",
													}}
												/>

												<TouchableOpacity
													onPress={() =>
														onDeletePress(item.id)
													}
													style={styles.menuButton}>
													<IconSymbol
														name="trash"
														size={20}
														color="#ff4444"
													/>
													<ThemedText
														style={{
															color: "#ff4444",
															fontWeight: "bold",
														}}>
														Hapus
													</ThemedText>
												</TouchableOpacity>
											</View>

											{/* Tombol Tutup X Kecil */}
											<TouchableOpacity
												onPress={() =>
													setMenuVisibleId(null)
												}
												style={styles.closeMenuButton}>
												<IconSymbol
													name="xmark.circle.fill"
													size={24}
													color="#999"
												/>
											</TouchableOpacity>
										</View>
									) : (
										<TouchableOpacity
											onPress={() =>
												toggleExpand(item.id)
											}
											onLongPress={() =>
												handleLongPress(item.id)
											}
											delayLongPress={400}
											activeOpacity={0.7}
											style={styles.cardHeader}>
											<View style={{ flex: 1 }}>
												<ThemedText type="defaultSemiBold">
													{item.name}
												</ThemedText>
												<ThemedText
													style={{
														fontSize: 12,
														opacity: 0.6,
													}}>
													{item.quantity}x @{" "}
													{formatCurrency(item.price)}
												</ThemedText>
											</View>

											<View
												style={{
													alignItems: "flex-end",
												}}>
												<ThemedText type="defaultSemiBold">
													{formatCurrency(
														item.price *
															item.quantity
													)}
												</ThemedText>
												<ThemedText
													style={{
														fontSize: 12,
														color:
															assignedCount === 0
																? "red"
																: activeColor,
													}}>
													{assignedCount === 0
														? "Belum ada yg makan"
														: `Dibagi ${assignedCount} orang`}
												</ThemedText>
											</View>
										</TouchableOpacity>
									)}

									{/* Body Expand */}
									{isExpanded &&
										!isEditing &&
										!isMenuVisible && (
											<View
												style={
													styles.assignmentContainer
												}>
												<ThemedText
													style={{
														marginBottom: 8,
														fontSize: 12,
													}}>
													Siapa yang makan ini?
												</ThemedText>
												<View
													style={
														styles.chipContainer
													}>
													{currentBill.participants.map(
														(person) => {
															const isSelected =
																item.assignedToParticipantIds.includes(
																	person.id
																);
															return (
																<TouchableOpacity
																	key={
																		person.id
																	}
																	onPress={() =>
																		updateItemAssignment(
																			item.id,
																			person.id
																		)
																	}
																	style={[
																		styles.chip,
																		isSelected
																			? {
																					backgroundColor:
																						activeColor,
																			  }
																			: {
																					backgroundColor:
																						"#ccc",
																			  },
																	]}>
																	<ThemedText
																		style={{
																			color: "white",
																			fontSize: 12,
																		}}>
																		{
																			person.name
																		}
																	</ThemedText>
																</TouchableOpacity>
															);
														}
													)}
												</View>
											</View>
										)}
								</View>
							);
						}}
					/>

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
									{ backgroundColor: activeColor },
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
	inputContainer: { marginBottom: 20 },
	addButton: {
		width: 48,
		height: 48,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
	},
	card: {
		borderWidth: 1,
		borderRadius: 12,
		marginBottom: 12,
		overflow: "hidden",
		minHeight: 70,
		justifyContent: "center",
	},
	cardHeader: {
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	assignmentContainer: {
		padding: 16,
		paddingTop: 0,
		backgroundColor: "rgba(150,150,150, 0.05)",
	},
	chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
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

	// Style Menu
	menuOverlay: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		height: "100%",
		position: "absolute",
		width: "100%",
		zIndex: 10,
	},
	menuContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 20,
		flex: 1,
	},
	menuButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingVertical: 10,
	},
	closeMenuButton: {
		padding: 5,
	},
});
