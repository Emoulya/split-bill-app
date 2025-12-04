import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { StyleProp, TextStyle } from "react-native";

type IconLib = typeof MaterialIcons | typeof MaterialCommunityIcons | typeof Ionicons;

interface IconMappingConfig {
	lib: IconLib;
	iconName: string;
}

const MAPPING: Record<string, IconMappingConfig> = {
	// MaterialIcons
	"house.fill": { lib: MaterialIcons, iconName: "home" },
	"paperplane.fill": { lib: MaterialIcons, iconName: "send" },
	"chevron.left.forwardslash.chevron.right": {
		lib: MaterialIcons,
		iconName: "code",
	},
	"chevron.right": { lib: MaterialIcons, iconName: "chevron-right" },
	"xmark.circle.fill": { lib: MaterialIcons, iconName: "close" },
	plus: { lib: MaterialIcons, iconName: "add" },
	trash: { lib: MaterialIcons, iconName: "delete" },
	"doc.text.fill": { lib: MaterialIcons, iconName: "receipt" },
	"person.2.fill": { lib: MaterialIcons, iconName: "group" },
	pencil: { lib: MaterialIcons, iconName: "edit" },
	checkmark: { lib: MaterialIcons, iconName: "check" },
	"magnifyingglass": { lib: MaterialIcons, iconName: "search" },

	// MaterialCommunityIcons
	addMenu: { lib: MaterialCommunityIcons, iconName: "receipt-text-plus" },

	// Ionicons
	menuSplit: { lib: Ionicons, iconName: "receipt" },
	share: { lib: Ionicons, iconName: "share-social" },
};

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
	name,
	size = 24,
	color,
	style,
}: {
	name: IconSymbolName;
	size?: number;
	color: string;
	style?: StyleProp<TextStyle>;
	weight?: SymbolWeight;
}) {
	const config = MAPPING[name];

	if (!config) {
		return (
			<MaterialIcons
				name="help-outline"
				size={size}
				color={color}
				style={style}
			/>
		);
	}

	const IconComponent = config.lib;

	return (
		<IconComponent
			name={config.iconName as any}
			size={size}
			color={color}
			style={style}
		/>
	);
}
