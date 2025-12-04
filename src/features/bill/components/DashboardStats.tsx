import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { calculateBill } from "@/src/features/bill/billCalculator";
import { Bill } from "@/src/types/Bill";
import { formatCurrency } from "@/src/utils/currency";

interface DashboardStatsProps {
	bills: Bill[];
}

export function DashboardStats({ bills }: DashboardStatsProps) {
	// Hitung total statistik
	const stats = useMemo(() => {
		let totalAmount = 0;
		bills.forEach((bill) => {
			const summary = calculateBill(bill);
			totalAmount += summary.grandTotal;
		});
		return {
			count: bills.length,
			total: totalAmount,
		};
	}, [bills]);

	// Get greeting berdasarkan jam
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Selamat Pagi";
		if (hour < 15) return "Selamat Siang";
		if (hour < 18) return "Selamat Sore";
		return "Selamat Malam";
	};

	const todayDate = new Date().toLocaleDateString("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	return (
		<View style={styles.container}>
			{/* Sapaan Header */}
			<View style={styles.headerText}>
				<ThemedText style={{ opacity: 0.6, fontSize: 14 }}>
					{todayDate}
				</ThemedText>
				<ThemedText
					type="subtitle"
					style={{ fontSize: 24 }}>
					{getGreeting()}! 👋
				</ThemedText>
			</View>

			{/* Kartu Statistik */}
			<View style={[styles.card, { backgroundColor: "#0a7ea4" }]}>
				<View>
					<ThemedText style={styles.cardLabel}>
						Total Uang Dimanage
					</ThemedText>
					<ThemedText style={styles.cardValue}>
						{formatCurrency(stats.total)}
					</ThemedText>
				</View>

				<View style={styles.divider} />

				<View style={styles.row}>
					<ThemedText style={styles.cardLabel}>
						Total Transaksi
					</ThemedText>
					<ThemedText style={styles.cardSubValue}>
						{stats.count} Bill
					</ThemedText>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 20,
	},
	headerText: {
		marginBottom: 16,
	},
	card: {
		borderRadius: 20,
		padding: 20,
		// Shadow
		shadowColor: "#0a7ea4",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	cardLabel: {
		color: "rgba(255,255,255,0.8)",
		fontSize: 12,
		marginBottom: 4,
		fontWeight: "600",
	},
	cardValue: {
		color: "white",
		fontSize: 28,
		fontWeight: "bold",
	},
	cardSubValue: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	divider: {
		height: 1,
		backgroundColor: "rgba(255,255,255,0.2)",
		marginVertical: 12,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
});
