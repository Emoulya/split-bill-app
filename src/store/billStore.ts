import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BillSummary, calculateBill } from "../features/bill/billCalculator";
import { Bill, BillItem, Participant } from "../types/Bill";

// --- Interfaces untuk State ---
interface BillState {
	// Data Bill yang sedang diedit (Draft)
	currentBill: Bill;

	// Hasil hitungan (otomatis di-update saat data berubah)
	billSummary: BillSummary | null;

	// --- Actions ---
	setBillInfo: (title: string, taxRate: number, serviceRate: number) => void;
	addParticipant: (name: string) => void;
	removeParticipant: (id: string) => void;
	addItem: (item: Omit<BillItem, "id" | "assignedToParticipantIds">) => void;
	updateItemAssignment: (itemId: string, participantId: string) => void;
	resetBill: () => void;
}

// --- Initial State ---
const initialBill: Bill = {
	id: "",
	title: "",
	createdAt: "",
	taxRate: 10,
	serviceRate: 0,
	discount: 0,
	participants: [], // Minimal 1 orang (Host)
	items: [],
	isClosed: false,
};

// --- Store Implementation ---
export const useBillStore = create<BillState>()(
	persist(
		(set, get) => ({
			currentBill: {
				...initialBill,
				id: Date.now().toString(),
				createdAt: new Date().toISOString(),
			},
			billSummary: null,

			setBillInfo: (title, taxRate, serviceRate) => {
				set((state) => {
					const updatedBill = {
						...state.currentBill,
						title,
						taxRate,
						serviceRate,
					};
					const summary = calculateBill(updatedBill);
					return { currentBill: updatedBill, billSummary: summary };
				});
			},

			addParticipant: (name) => {
				const newParticipant: Participant = {
					id: Date.now().toString(),
					name,
					isOwner: false,
				};

				set((state) => ({
					currentBill: {
						...state.currentBill,
						participants: [
							...state.currentBill.participants,
							newParticipant,
						],
					},
				}));
			},

			removeParticipant: (id) => {
				set((state) => {
					// Hapus orangnya
					const updatedParticipants =
						state.currentBill.participants.filter(
							(p) => p.id !== id
						);

					// Hapus juga assignment orang ini di semua item makanan
					const updatedItems = state.currentBill.items.map(
						(item) => ({
							...item,
							assignedToParticipantIds:
								item.assignedToParticipantIds.filter(
									(pid) => pid !== id
								),
						})
					);

					const updatedBill = {
						...state.currentBill,
						participants: updatedParticipants,
						items: updatedItems,
					};

					const summary = calculateBill(updatedBill);
					return { currentBill: updatedBill, billSummary: summary };
				});
			},

			addItem: (itemData) => {
				const newItem: BillItem = {
					id: Date.now().toString(),
					...itemData,
					assignedToParticipantIds: [],
				};

				set((state) => ({
					currentBill: {
						...state.currentBill,
						items: [...state.currentBill.items, newItem],
					},
				}));
			},

			updateItemAssignment: (itemId, participantId) => {
				set((state) => {
					const updatedItems = state.currentBill.items.map((item) => {
						if (item.id !== itemId) return item;

						const isAssigned =
							item.assignedToParticipantIds.includes(
								participantId
							);
						let newAssignments;

						if (isAssigned) {
							newAssignments =
								item.assignedToParticipantIds.filter(
									(id) => id !== participantId
								);
						} else {
							newAssignments = [
								...item.assignedToParticipantIds,
								participantId,
							];
						}

						return {
							...item,
							assignedToParticipantIds: newAssignments,
						};
					});

					const updatedBill = {
						...state.currentBill,
						items: updatedItems,
					};
					// Recalculate summary
					const summary = calculateBill(updatedBill);

					return { currentBill: updatedBill, billSummary: summary };
				});
			},

			// Fungsi Reset untuk menghapus data dari memori HP
			resetBill: () => {
				set({
					currentBill: {
						...initialBill,
						id: Date.now().toString(),
						createdAt: new Date().toISOString(),
					},
					billSummary: null,
				});
			},
		}),
		{
			name: "split-bill-storage",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
