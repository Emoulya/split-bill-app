import { IconSymbol } from "@/components/ui/icon-symbol";
import { Tabs } from "expo-router";
import React, { useState } from "react";
import {
	Alert,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";

// Components
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ThemedInput } from "@/src/components/ui/ThemedInput";

// Store
import { useBillStore } from "@/src/store/billStore";

export default function SetupScreen() {
	// Data & Action dari Store
	const {
		currentBill,
		setBillInfo,
		addParticipant,
		removeParticipant,
		resetBill,
	} = useBillStore();
	const [newParticipantName, setNewParticipantName] = useState("");

	// Handler untuk update info bill
	const handleInfoChange = (
		field: "title" | "tax" | "service",
		value: string
	) => {
		let title = currentBill.title;
		let tax = currentBill.taxRate;
		let service = currentBill.serviceRate;

		if (field === "title") title = value;
		if (field === "tax") tax = parseFloat(value) || 0;
		if (field === "service") service = parseFloat(value) || 0;

		setBillInfo(title, tax, service);
	};

	// Handler tambah orang
	const handleAddPerson = () => {
		if (newParticipantName.trim().length === 0) return;
		addParticipant(newParticipantName.trim());
		setNewParticipantName("");
	};

	// --- Reset dengan Konfirmasi ---
	const handleReset = () => {
		Alert.alert("Buat Bill Baru?", "Semua data saat ini akan dihapus.", [
			{ text: "Batal", style: "cancel" },
			{
				text: "Ya, Hapus",
				style: "destructive",
				onPress: () => resetBill(),
			},
		]);
	};

	return (
		<>
			<Tabs.Screen
				options={{
					title: "Setup Bill",
					headerRight: () => (
						<TouchableOpacity
							onPress={handleReset}
							style={{ marginRight: 10, padding: 5 }}>
							<IconSymbol
								name="trash"
								size={24}
								color="#ff4444"
							/>
						</TouchableOpacity>
					),
				}}
			/>

			<ThemedView style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={styles.scrollContent}>
					{/* --- INFO BILL --- */}
					<ThemedView style={styles.section}>
						<View style={styles.sectionHeader}>
							<IconSymbol
								name="doc.text.fill"
								size={24}
								color="#0a7ea4"
							/>
							<ThemedText
								type="subtitle"
								style={styles.sectionTitle}>
								Info Tagihan
							</ThemedText>
						</View>

						<ThemedInput
							label="Nama Tempat / Judul"
							placeholder="Contoh: Makan Siang Padang"
							value={currentBill.title}
							onChangeText={(text) =>
								handleInfoChange("title", text)
							}
						/>

						<View style={styles.row}>
							<View style={{ flex: 1, marginRight: 8 }}>
								<ThemedInput
									label="Pajak (Tax) %"
									placeholder="0"
									keyboardType="numeric"
									value={currentBill.taxRate.toString()}
									onChangeText={(text) =>
										handleInfoChange("tax", text)
									}
								/>
							</View>
							<View style={{ flex: 1, marginLeft: 8 }}>
								<ThemedInput
									label="Layanan (Service) %"
									placeholder="0"
									keyboardType="numeric"
									value={currentBill.serviceRate.toString()}
									onChangeText={(text) =>
										handleInfoChange("service", text)
									}
								/>
							</View>
						</View>
					</ThemedView>

					{/* --- PARTISIPAN --- */}
					<ThemedView style={styles.section}>
						<View style={styles.sectionHeader}>
							<IconSymbol
								name="person.2.fill"
								size={24}
								color="#0a7ea4"
							/>
							<ThemedText
								type="subtitle"
								style={styles.sectionTitle}>
								Siapa aja yang ikut?
							</ThemedText>
						</View>

						{/* List Orang yang sudah ada */}
						<View style={styles.participantList}>
							{currentBill.participants.map((person) => (
								<View
									key={person.id}
									style={styles.participantItem}>
									<View style={styles.avatar}>
										<ThemedText style={styles.avatarText}>
											{person.name
												.charAt(0)
												.toUpperCase()}
										</ThemedText>
									</View>
									<ThemedText style={styles.participantName}>
										{person.name}{" "}
										{person.isOwner ? "(Host)" : ""}
									</ThemedText>

									{!person.isOwner && (
										<TouchableOpacity
											onPress={() =>
												removeParticipant(person.id)
											}>
											<IconSymbol
												name="xmark.circle.fill"
												size={24}
												color="#ff4444"
											/>
										</TouchableOpacity>
									)}
								</View>
							))}
						</View>

						{/* Input Tambah Orang Baru */}
						<View style={styles.addParticipantRow}>
							<View style={{ flex: 1 }}>
								<ThemedInput
									placeholder="Nama teman..."
									value={newParticipantName}
									onChangeText={setNewParticipantName}
									onSubmitEditing={handleAddPerson}
								/>
							</View>
							<TouchableOpacity
								style={styles.addButton}
								onPress={handleAddPerson}>
								<IconSymbol
									name="plus"
									size={24}
									color="white"
								/>
							</TouchableOpacity>
						</View>
					</ThemedView>

					{/* --- NEXT STEP INSTRUCTION --- */}
					<ThemedText style={styles.hint}>
						Lanjut ke tab "Menu & Split" untuk input menu makanan.
					</ThemedText>
				</ScrollView>
			</ThemedView>
		</>
	);
}

const styles = StyleSheet.create({
	scrollContent: {
		padding: 16,
		paddingBottom: 100,
	},
	section: {
		marginBottom: 24,
		backgroundColor: "transparent",
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
		gap: 8,
	},
	sectionTitle: {
		marginBottom: 0,
	},
	row: {
		flexDirection: "row",
	},
	// Style untuk Partisipan
	participantList: {
		marginBottom: 12,
		gap: 8,
	},
	participantItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		backgroundColor: "rgba(150, 150, 150, 0.1)",
		borderRadius: 12,
	},
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#0a7ea4",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 10,
	},
	avatarText: {
		color: "white",
		fontWeight: "bold",
	},
	participantName: {
		flex: 1,
		fontSize: 16,
	},
	addParticipantRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 10,
	},
	addButton: {
		backgroundColor: "#0a7ea4",
		width: 48,
		height: 48,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 0,
	},
	hint: {
		textAlign: "center",
		opacity: 0.5,
		marginTop: 20,
	},
});
