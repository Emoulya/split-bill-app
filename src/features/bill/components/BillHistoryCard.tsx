import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useMemo } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { calculateBill } from "@/src/features/bill/billCalculator";
import { Bill } from "@/src/types/Bill";
import { formatCurrency } from "@/src/utils/currency";

interface BillHistoryCardProps {
	bill: Bill;
	onPress: () => void;
	onDelete: () => void;
}

export function BillHistoryCard({
	bill,
	onPress,
	onDelete,
}: BillHistoryCardProps) {
	const theme = useColorScheme() ?? "light";

	// Hitung total hanya untuk display di kartu ini
	const summary = useMemo(() => calculateBill(bill), [bill]);

	const handleDelete = () => {
		Alert.alert(
			"Hapus Bill?",
			`Yakin mau menghapus "${bill.title || "Bill Tanpa Nama"}"?`,
			[
				{ text: "Batal", style: "cancel" },
				{
					text: "Hapus",
					style: "destructive",
					onPress: onDelete,
				},
			]
		);
	};

	const dateString = new Date(bill.createdAt).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			style={[
				styles.card,
				{
					backgroundColor: theme === "light" ? "#fff" : "#1E1E1E",
					borderColor: theme === "light" ? "#eee" : "#333",
				},
			]}>
			<View style={{ flex: 1 }}>
				{/* Judul & Tanggal */}
				<ThemedText
					type="defaultSemiBold"
					style={{ fontSize: 16 }}>
					{bill.title || "Bill Tanpa Nama"}
				</ThemedText>
				<ThemedText
					style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>
					{dateString}
				</ThemedText>

				{/* Info Singkat */}
				<View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: 4,
						}}>
						<IconSymbol
							name="person.2.fill"
							size={16}
							color="#0a7ea4"
						/>
						<ThemedText style={{ fontSize: 12, color: "#0a7ea4" }}>
							{bill.participants.length} Orang
						</ThemedText>
					</View>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: 4,
						}}>
						<IconSymbol
							name="menuSplit"
							size={12}
							color="#0a7ea4"
						/>
						<ThemedText style={{ fontSize: 12, color: "#0a7ea4" }}>
							{bill.items.length} Menu
						</ThemedText>
					</View>
				</View>
			</View>

			{/* Total & Delete */}
			<View
				style={{
					alignItems: "flex-end",
					justifyContent: "space-between",
				}}>
				<TouchableOpacity
					onPress={handleDelete}
					style={{ padding: 4 }}>
					<IconSymbol
						name="trash"
						size={20}
						color="#ff4444"
					/>
				</TouchableOpacity>

				<ThemedText
					type="defaultSemiBold"
					style={{ fontSize: 16, marginTop: 8 }}>
					{formatCurrency(summary.grandTotal)}
				</ThemedText>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		padding: 16,
		borderRadius: 16,
		borderWidth: 1,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
});
