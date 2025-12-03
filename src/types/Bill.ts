export type ID = string;

// --- Entitas Dasar ---

export interface Participant {
	id: ID;
	name: string;
	isOwner?: boolean; // Default: true jika Host
}

export interface BillItem {
	id: ID;
	name: string;
	price: number;
	quantity: number;
	assignedToParticipantIds: ID[]; // ID partisipan yang makan item ini
}

// --- Entitas Utama ---

export interface Bill {
	id: ID;
	title: string;
	createdAt: string; // ISO String date

	// Settings
	taxRate: number; // Persen
	serviceRate: number; // Persen
	discount: number; // Nominal diskon (optional)

	// Relations
	participants: Participant[];
	items: BillItem[];

	isClosed: boolean;
}

// --- Derived Interfaces (Hasil Kalkulasi) ---

export interface ParticipantBillShare {
	participantId: ID;
	participantName: string;
	subtotal: number; // Harga makanan murni
	taxAmount: number; // Porsi pajak dia
	serviceAmount: number; // Porsi service dia
	totalDue: number; // Total akhir (Subtotal + Tax + Service)

	itemsConsumed: {
		// Rincian item untuk transparansi
		itemName: string;
		portionPrice: number;
		portionQuantity: number;
	}[];
}

export interface BillSummary {
	billId: ID;
	subtotal: number; // Total semua makanan
	totalTax: number;
	totalService: number;
	grandTotal: number; // Total yang harus dibayar ke kasir

	shares: ParticipantBillShare[]; // Breakdown per orang
}
