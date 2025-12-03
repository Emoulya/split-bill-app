import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { ThemedText } from "../../../components/themed-text";
import { ThemedView } from "../../../components/themed-view";

export type ThemedInputProps = TextInputProps & {
	label?: string;
	lightColor?: string;
	darkColor?: string;
};

export function ThemedInput({
	style,
	lightColor,
	darkColor,
	label,
	...rest
}: ThemedInputProps) {
	const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
	const borderColor = useThemeColor({ light: "#ccc", dark: "#444" }, "icon");
	const placeholderColor = useThemeColor(
		{ light: "#999", dark: "#666" },
		"text"
	);

	return (
		<ThemedView style={styles.container}>
			{label && <ThemedText style={styles.label}>{label}</ThemedText>}
			<TextInput
				style={[styles.input, { color, borderColor }, style]}
				placeholderTextColor={placeholderColor}
				{...rest}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 12,
		backgroundColor: "transparent",
	},
	label: {
		fontSize: 14,
		marginBottom: 6,
		opacity: 0.7,
	},
	input: {
		height: 48,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		fontSize: 16,
	},
});
