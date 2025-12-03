import { IconSymbol } from "@/components/ui/icon-symbol";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemedInput } from "@/src/components/ui/ThemedInput";
import { useBillStore } from "@/src/store/billStore";

export default function ItemsScreen() {
	const { currentBill, addItem, updateItemAssignment, billSummary } =
		useBillStore();
	const theme = useColorScheme() ?? "light";

	// State untuk form input item baru
	const [itemName, setItemName] = useState("");
	const [itemPrice, setItemPrice] = useState("");
	const [itemQty, setItemQty] = useState("1");

	// State untuk accordion (item mana yang sedang dibuka untuk assign orang)
	const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

	const handleAddItem = () => {
		if (!itemName || !itemPrice) return;

		addItem({
			name: itemName,
			price: parseFloat(itemPrice) || 0,
			quantity: parseInt(itemQty) || 1,
		});

		// Reset form
		setItemName("");
		setItemPrice("");
		setItemQty("1");
	};

	const toggleExpand = (id: string) => {
		setExpandedItemId(expandedItemId === id ? null : id);
	};

	const activeColor = Colors[theme].tint;

	return (
		<>
			<Stack.Screen options={{ title: "Menu & Split" }} />
			<ThemedView style={styles.container}>
				{/* --- FORM INPUT ITEM BARU --- */}
				<View style={styles.inputContainer}>
					<ThemedText
						type="subtitle"
						style={{ marginBottom: 10 }}>
						Tambah Menu
					</ThemedText>
					<ThemedInput
						placeholder="Nama Menu (misal: Sate Ayam)"
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
								{ backgroundColor: activeColor },
							]}
							onPress={handleAddItem}>
							<IconSymbol
								name="plus"
								size={24}
								color="white"
							/>
						</TouchableOpacity>
					</View>
				</View>

				{/* --- DAFTAR ITEM (LIST) --- */}
				<FlatList
					data={currentBill.items}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ paddingBottom: 100 }}
					renderItem={({ item }) => {
						const isExpanded = expandedItemId === item.id;
						const assignedCount =
							item.assignedToParticipantIds.length;

						return (
							<View
								style={[
									styles.card,
									{
										borderColor:
											theme === "light" ? "#eee" : "#333",
									},
								]}>
								{/* Header Card */}
								<TouchableOpacity
									onPress={() => toggleExpand(item.id)}
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
											{item.price.toLocaleString()}
										</ThemedText>
									</View>

									<View style={{ alignItems: "flex-end" }}>
										<ThemedText type="defaultSemiBold">
											{(
												item.price * item.quantity
											).toLocaleString()}
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

								{/* Body Card (Daftar Orang - Muncul jika Expanded) */}
								{isExpanded && (
									<View style={styles.assignmentContainer}>
										<ThemedText
											style={{
												marginBottom: 8,
												fontSize: 12,
											}}>
											Siapa yang makan ini?
										</ThemedText>
										<View style={styles.chipContainer}>
											{currentBill.participants.map(
												(person) => {
													const isSelected =
														item.assignedToParticipantIds.includes(
															person.id
														);
													return (
														<TouchableOpacity
															key={person.id}
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
																{person.name}
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

				{/* --- STICKY FOOTER (TOTAL) --- */}
				{billSummary && (
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
								{Math.ceil(
									billSummary.grandTotal
								).toLocaleString()}
							</ThemedText>
						</View>
						<TouchableOpacity
							style={[
								styles.summaryButton,
								{ backgroundColor: activeColor },
							]}
							onPress={() => router.push("/modal")}
						>
							<ThemedText
								style={{ color: "white", fontWeight: "bold" }}>
								Lihat Hasil
							</ThemedText>
						</TouchableOpacity>
					</View>
				)}
			</ThemedView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	inputContainer: {
		marginBottom: 20,
	},
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
	chipContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	chip: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 20,
	},
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
