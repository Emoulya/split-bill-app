import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BillItem, Participant } from "@/src/types/Bill";
import { formatCurrency } from "@/src/utils/currency";

interface BillItemCardProps {
	item: BillItem;
	participants: Participant[];

	// UI States
	isExpanded: boolean;
	isMenuVisible: boolean;
	isEditing: boolean;

	// Actions
	onToggleExpand: (id: string) => void;
	onLongPress: (id: string) => void;
	onEdit: (item: BillItem) => void;
	onDelete: (id: string) => void;
	onCloseMenu: () => void;
	onUpdateAssignment: (itemId: string, participantId: string) => void;

	primaryColor?: string;

	onToggleAll: (itemId: string, selectAll: boolean) => void;
}

export function BillItemCard({
	item,
	participants,
	isExpanded,
	isMenuVisible,
	isEditing,
	onToggleExpand,
	onLongPress,
	onEdit,
	onDelete,
	onCloseMenu,
	onUpdateAssignment,
	primaryColor = "#0a7ea4",
	onToggleAll,
}: BillItemCardProps) {
	const theme = useColorScheme() ?? "light";
	const assignedCount = item.assignedToParticipantIds.length;
	const isAllSelected =
		item.assignedToParticipantIds.length === participants.length &&
		participants.length > 0;

	return (
		<View
			style={[
				styles.card,
				{
					borderColor:
						isEditing || isMenuVisible
							? primaryColor
							: theme === "light"
							? "#eee"
							: "#333",
				},
				isEditing && {
					backgroundColor: "rgba(10, 126, 164, 0.05)",
				},
			]}>
			{/* LAYER MENU OVERLAY (Edit/Hapus) */}
			{isMenuVisible ? (
				<View
					style={[
						styles.menuOverlay,
						{
							backgroundColor:
								theme === "light" ? "#f0f9ff" : "#2A2A2A",
						},
					]}>
					<View style={styles.menuContent}>
						<TouchableOpacity
							onPress={() => onEdit(item)}
							style={styles.menuButton}>
							<IconSymbol
								name="pencil"
								size={20}
								color={primaryColor}
							/>
							<ThemedText
								style={{
									color: primaryColor,
									fontWeight: "bold",
								}}>
								Edit
							</ThemedText>
						</TouchableOpacity>

						<View style={styles.menuDivider} />

						<TouchableOpacity
							onPress={() => onDelete(item.id)}
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

					<TouchableOpacity
						onPress={onCloseMenu}
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
					onPress={() => onToggleExpand(item.id)}
					onLongPress={() => onLongPress(item.id)}
					delayLongPress={400}
					activeOpacity={0.7}
					style={styles.cardHeader}>
					<View style={{ flex: 1 }}>
						<ThemedText type="defaultSemiBold">
							{item.name}
						</ThemedText>
						<ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
							{item.quantity}x @ {formatCurrency(item.price)}
						</ThemedText>
					</View>

					<View style={{ alignItems: "flex-end" }}>
						<ThemedText type="defaultSemiBold">
							{formatCurrency(item.price * item.quantity)}
						</ThemedText>
						<ThemedText
							style={{
								fontSize: 12,
								color:
									assignedCount === 0 ? "red" : primaryColor,
							}}>
							{assignedCount === 0
								? "Belum ada yg makan"
								: `Dibagi ${assignedCount} orang`}
						</ThemedText>
					</View>
				</TouchableOpacity>
			)}

			{/* AREA ASSIGNMENT (Muncul jika expanded) */}
			{isExpanded && !isEditing && !isMenuVisible && (
				<View style={styles.assignmentContainer}>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 10,
						}}>
						<ThemedText style={{ fontSize: 12 }}>
							Siapa yang makan?
						</ThemedText>

						{participants.length > 0 && (
							<TouchableOpacity
								onPress={() =>
									onToggleAll(item.id, !isAllSelected)
								}>
								<ThemedText
									style={{
										fontSize: 12,
										color: primaryColor,
										fontWeight: "bold",
									}}>
									{isAllSelected
										? "Batal Semua"
										: "Pilih Semua"}
								</ThemedText>
							</TouchableOpacity>
						)}
					</View>
					<View style={styles.chipContainer}>
						{participants.map((person) => {
							const isSelected =
								item.assignedToParticipantIds.includes(
									person.id
								);
							return (
								<TouchableOpacity
									key={person.id}
									onPress={() =>
										onUpdateAssignment(item.id, person.id)
									}
									style={[
										styles.chip,
										isSelected
											? { backgroundColor: primaryColor }
											: { backgroundColor: "#ccc" },
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
						})}
					</View>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
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
	// Menu
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
	menuDivider: {
		width: 1,
		height: 20,
		backgroundColor: "#ccc",
	},
	closeMenuButton: {
		padding: 5,
	},
	// Assignment
	assignmentContainer: {
		padding: 16,
		paddingTop: 0,
		backgroundColor: "rgba(150,150,150, 0.05)",
	},
	chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
});
