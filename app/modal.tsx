import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
	Platform,
	ScrollView,
	Share,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useActiveBillSummary, useActiveBill } from "@/src/store/billStore";
import { formatCurrency } from "@/src/utils/currency";

export default function ResultScreen() {
	const currentBill = useActiveBill();
	const billSummary = useActiveBillSummary();
	const theme = useColorScheme() ?? "light";
	const primaryColor = "#0a7ea4";

	const handleShare = async () => {
		if (!billSummary || !currentBill) return;

		let message = `🧾 *${currentBill.title || "Split Bill"}*\n`;
		message += `Total: ${formatCurrency(billSummary.grandTotal)}\n\n`;

		billSummary.shares.forEach((share) => {
			message += `👤 *${share.participantName}*: ${formatCurrency(
				share.totalDue
			)}\n`;
			share.itemsConsumed.forEach((item) => {
				message += `   - ${item.itemName} (${item.portionQuantity}x)\n`;
			});
			message += "\n";
		});

		try {
			await Share.share({ message });
		} catch (error) {
			alert(error instanceof Error ? error.message : "An error occurred");
		}
	};

	if (!billSummary) {
		return (
			<ThemedView style={styles.center}>
				<ThemedText>Belum ada data tagihan.</ThemedText>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />

			{/* HEADER RINGKASAN */}
			<View
				style={[
					styles.header,
					{ borderBottomColor: theme === "light" ? "#eee" : "#333" },
				]}>
				<ThemedText style={styles.label}>Grand Total</ThemedText>
				<ThemedText
					type="title"
					style={{ fontSize: 40, color: primaryColor }}>
					{formatCurrency(billSummary.grandTotal)}
				</ThemedText>
				<ThemedText style={styles.subDetail}>
					Subtotal: {formatCurrency(billSummary.subtotal)} | Tax:{" "}
					{formatCurrency(billSummary.totalTax)} | Service:{" "}
					{formatCurrency(billSummary.totalService)}
				</ThemedText>
			</View>

			{/* LIST PER ORANG */}
			<ScrollView contentContainerStyle={styles.listContent}>
				{billSummary.shares.map((share) => (
					<View
						key={share.participantId}
						style={[
							styles.card,
							{
								backgroundColor:
									theme === "light" ? "#f9f9f9" : "#1E1E1E",
							},
						]}>
						<View style={styles.cardHeader}>
							<ThemedText
								type="defaultSemiBold"
								style={{ fontSize: 18 }}>
								{share.participantName}
							</ThemedText>
							<ThemedText
								type="defaultSemiBold"
								style={{ fontSize: 18, color: primaryColor }}>
								{formatCurrency(share.totalDue)}
							</ThemedText>
						</View>

						<View style={styles.divider} />

						{/* Detail Item yg dimakan */}
						{share.itemsConsumed.map((item, idx) => (
							<View
								key={idx}
								style={styles.itemRow}>
								<ThemedText style={styles.itemName}>
									{item.portionQuantity < 1
										? `${item.portionQuantity}x `
										: ""}
									{item.itemName}
								</ThemedText>
								<ThemedText style={styles.itemPrice}>
									{formatCurrency(item.portionPrice)}
								</ThemedText>
							</View>
						))}

						{/* Detail Tax & Service per orang */}
						<View
							style={[
								styles.itemRow,
								{ marginTop: 8, opacity: 0.7 },
							]}>
							<ThemedText style={{ fontSize: 12 }}>
								Tax & Service
							</ThemedText>
							<ThemedText style={{ fontSize: 12 }}>
								{formatCurrency(
									share.taxAmount + share.serviceAmount
								)}
							</ThemedText>
						</View>
					</View>
				))}
			</ScrollView>

			{/* ACTION BUTTONS */}
			<View style={styles.footer}>
				<TouchableOpacity
					style={[styles.button, { backgroundColor: primaryColor }]}
					onPress={handleShare}>
					<IconSymbol
						name="share"
						size={20}
						color="white"
					/>
					<ThemedText style={styles.buttonText}>
						Bagikan ke WA
					</ThemedText>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.button, styles.closeButton]}
					onPress={() => router.back()}>
					<ThemedText
						style={{ color: theme === "light" ? "#333" : "#fff" }}>
						Tutup
					</ThemedText>
				</TouchableOpacity>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	header: { alignItems: "center", paddingVertical: 20, borderBottomWidth: 1 },
	label: {
		fontSize: 14,
		opacity: 0.6,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	subDetail: { fontSize: 12, opacity: 0.5, marginTop: 5 },
	listContent: { padding: 16, paddingBottom: 100 },
	card: { borderRadius: 12, padding: 16, marginBottom: 16 },
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	divider: {
		height: 1,
		backgroundColor: "rgba(150,150,150,0.2)",
		marginBottom: 8,
	},
	itemRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	itemName: { fontSize: 14, opacity: 0.8, flex: 1 },
	itemPrice: { fontSize: 14, opacity: 0.8, fontVariant: ["tabular-nums"] },
	footer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		padding: 16,
		paddingBottom: 30,
		flexDirection: "row",
		gap: 12,
	},
	button: {
		flex: 1,
		height: 50,
		borderRadius: 25,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
	closeButton: {
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: "#ccc",
	},
});
