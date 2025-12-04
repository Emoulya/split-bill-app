import { IconSymbol } from "@/components/ui/icon-symbol";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
	Alert,
	FlatList,
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
import { formatCurrency } from "@/src/utils/currency";

export default function ItemsScreen() {
	const { currentBill, addItem, updateItemAssignment, billSummary } =
		useBillStore();
	const theme = useColorScheme() ?? "light";
	const activeColor = Colors[theme].tint;

	// State untuk form input item baru
	const [itemName, setItemName] = useState("");
	const [itemPrice, setItemPrice] = useState("");
	const [itemQty, setItemQty] = useState("1");
	const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

	const handleAddItem = () => {
		if (!itemName.trim()) {
			Alert.alert("Eits!", "Nama menu belum diisi.");
			return;
		}
		const price = parseFloat(itemPrice);
		if (!itemPrice || isNaN(price) || price <= 0) {
			Alert.alert("Eits!", "Harga harus diisi angka yang benar.");
			return;
		}

		addItem({
			name: itemName,
			price: price,
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

	return (
		<>
			<Stack.Screen options={{ title: "Menu & Split" }} />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
				keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}>
				<ThemedView style={styles.container}>
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
												theme === "light"
													? "#eee"
													: "#333",
										},
									]}>
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
												{formatCurrency(item.price)}
											</ThemedText>
										</View>

										<View
											style={{ alignItems: "flex-end" }}>
											<ThemedText type="defaultSemiBold">
												{formatCurrency(
													item.price * item.quantity
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

									{isExpanded && (
										<View
											style={styles.assignmentContainer}>
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
});
