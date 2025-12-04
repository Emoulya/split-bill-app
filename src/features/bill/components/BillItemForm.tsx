import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedInput } from "@/src/components/ui/ThemedInput";
import { BillItem } from "@/src/types/Bill";

interface BillItemFormProps {
	itemToEdit?: BillItem | null; // Data item jika sedang mode edit
	onSave: (name: string, price: number, qty: number) => void;
	onCancelEdit: () => void;
	primaryColor?: string;
}

export function BillItemForm({
	itemToEdit,
	onSave,
	onCancelEdit,
	primaryColor = "#0a7ea4",
}: BillItemFormProps) {
	const [name, setName] = useState("");
	const [price, setPrice] = useState("");
	const [qty, setQty] = useState("1");

	// Reset atau isi form saat mode edit berubah
	useEffect(() => {
		if (itemToEdit) {
			setName(itemToEdit.name);
			setPrice(itemToEdit.price.toString());
			setQty(itemToEdit.quantity.toString());
		} else {
			resetForm();
		}
	}, [itemToEdit]);

	const resetForm = () => {
		setName("");
		setPrice("");
		setQty("1");
	};

	const handleSave = () => {
		if (!name.trim()) {
			Alert.alert("Eits!", "Nama menu belum diisi.");
			return;
		}
		const numericPrice = parseFloat(price);
		if (!price || isNaN(numericPrice) || numericPrice <= 0) {
			Alert.alert("Eits!", "Harga harus diisi angka yang benar.");
			return;
		}
		const numericQty = parseInt(qty) || 1;

		onSave(name, numericPrice, numericQty);

		// Jika mode tambah baru, reset form setelah save
		if (!itemToEdit) {
			resetForm();
		}
	};

	const isEditing = !!itemToEdit;

	return (
		<View
			style={[
				styles.container,
				isEditing && {
					borderColor: primaryColor,
					borderWidth: 1,
					borderStyle: "dashed",
				},
			]}>
			{/* Header Form */}
			<View style={styles.header}>
				<ThemedText type="subtitle">
					<View style={styles.titleRow}>
						<IconSymbol
							name={isEditing ? "pencil" : "addMenu"}
							size={24}
							color={primaryColor}
						/>
						<ThemedText type="subtitle">
							{isEditing ? "Edit Menu" : "Tambah Menu"}
						</ThemedText>
					</View>
				</ThemedText>

				{isEditing && (
					<TouchableOpacity
						onPress={() => {
							resetForm();
							onCancelEdit();
						}}>
						<ThemedText style={{ color: "red" }}>Batal</ThemedText>
					</TouchableOpacity>
				)}
			</View>

			{/* Inputs */}
			<ThemedInput
				placeholder="Nama Menu"
				value={name}
				onChangeText={setName}
			/>
			<View style={styles.row}>
				<View style={{ flex: 2 }}>
					<ThemedInput
						placeholder="Harga"
						keyboardType="numeric"
						value={price}
						onChangeText={setPrice}
					/>
				</View>
				<View style={{ flex: 1 }}>
					<ThemedInput
						placeholder="Qty"
						keyboardType="numeric"
						value={qty}
						onChangeText={setQty}
					/>
				</View>

				<TouchableOpacity
					style={[
						styles.addButton,
						{
							backgroundColor: isEditing
								? "#4CAF50"
								: primaryColor,
						},
					]}
					onPress={handleSave}>
					<IconSymbol
						name={isEditing ? "checkmark" : "plus"}
						size={24}
						color="white"
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 15,
		padding: 0,
		borderRadius: 12,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	row: {
		flexDirection: "row",
		gap: 10,
	},
	addButton: {
		width: 48,
		height: 48,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
	},
});
