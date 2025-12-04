import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { calculateBill } from "../features/bill/billCalculator";
import { Bill, BillItem, Participant } from "../types/Bill";

interface BillState {
	// State Utama
	bills: Bill[];
	activeBillId: string | null;

	// --- Actions: Manajemen Global Bill ---
	createBill: () => void;
	deleteBill: (id: string) => void;
	setActiveBill: (id: string) => void;

	// --- Actions: Edit Active Bill ---
	setBillInfo: (title: string, taxRate: number, serviceRate: number) => void;
	addParticipant: (name: string) => void;
	removeParticipant: (id: string) => void;
	addItem: (item: Omit<BillItem, "id" | "assignedToParticipantIds">) => void;
	removeItem: (itemId: string) => void;
	updateItem: (
		itemId: string,
		data: Partial<Omit<BillItem, "id" | "assignedToParticipantIds">>
	) => void;
	updateItemAssignment: (itemId: string, participantId: string) => void;
	toggleAllAssignment: (itemId: string, selectAll: boolean) => void;

	cleanupEmptyBills: () => void;
}

// Helper untuk membuat object Bill baru yang bersih
const createNewBillData = (): Bill => ({
	id: Crypto.randomUUID(),
	title: "",
	createdAt: new Date().toISOString(),
	taxRate: 0,
	serviceRate: 0,
	discount: 0,
	participants: [],
	items: [],
	isClosed: false,
});

export const useBillStore = create<BillState>()(
	persist(
		(set, get) => ({
			bills: [],
			activeBillId: null,

			// --- MANAJEMEN BILL ---

			createBill: () => {
				const newBill = createNewBillData();
				set((state) => ({
					bills: [newBill, ...state.bills],
					activeBillId: newBill.id,
				}));
			},

			deleteBill: (id) => {
				set((state) => ({
					bills: state.bills.filter((b) => b.id !== id),
					activeBillId:
						state.activeBillId === id ? null : state.activeBillId,
				}));
			},

			setActiveBill: (id) => {
				set({ activeBillId: id });
			},
			setBillInfo: (title, taxRate, serviceRate) => {
				set((state) => ({
					bills: state.bills.map((b) =>
						b.id === state.activeBillId
							? { ...b, title, taxRate, serviceRate }
							: b
					),
				}));
			},

			addParticipant: (name) => {
				const newPerson: Participant = {
					id: Crypto.randomUUID(),
					name,
					isOwner: false,
				};
				set((state) => ({
					bills: state.bills.map((b) =>
						b.id === state.activeBillId
							? {
									...b,
									participants: [
										...b.participants,
										newPerson,
									],
							  }
							: b
					),
				}));
			},

			removeParticipant: (id) => {
				set((state) => ({
					bills: state.bills.map((b) => {
						if (b.id !== state.activeBillId) return b;

						// Hapus orangnya
						const updatedParticipants = b.participants.filter(
							(p) => p.id !== id
						);
						// Hapus assignment-nya di semua item
						const updatedItems = b.items.map((item) => ({
							...item,
							assignedToParticipantIds:
								item.assignedToParticipantIds.filter(
									(pid) => pid !== id
								),
						}));

						return {
							...b,
							participants: updatedParticipants,
							items: updatedItems,
						};
					}),
				}));
			},

			addItem: (itemData) => {
				const newItem: BillItem = {
					id: Crypto.randomUUID(),
					...itemData,
					assignedToParticipantIds: [],
				};
				set((state) => ({
					bills: state.bills.map((b) =>
						b.id === state.activeBillId
							? { ...b, items: [...b.items, newItem] }
							: b
					),
				}));
			},

			removeItem: (itemId) => {
				set((state) => ({
					bills: state.bills.map((b) =>
						b.id === state.activeBillId
							? {
									...b,
									items: b.items.filter(
										(i) => i.id !== itemId
									),
							  }
							: b
					),
				}));
			},

			updateItem: (itemId, data) => {
				set((state) => ({
					bills: state.bills.map((b) => {
						if (b.id !== state.activeBillId) return b;
						return {
							...b,
							items: b.items.map((item) =>
								item.id === itemId ? { ...item, ...data } : item
							),
						};
					}),
				}));
			},

			updateItemAssignment: (itemId, participantId) => {
				set((state) => ({
					bills: state.bills.map((b) => {
						if (b.id !== state.activeBillId) return b;
						return {
							...b,
							items: b.items.map((item) => {
								if (item.id !== itemId) return item;
								const isAssigned =
									item.assignedToParticipantIds.includes(
										participantId
									);
								const newAssignments = isAssigned
									? item.assignedToParticipantIds.filter(
											(id) => id !== participantId
									  )
									: [
											...item.assignedToParticipantIds,
											participantId,
									  ];
								return {
									...item,
									assignedToParticipantIds: newAssignments,
								};
							}),
						};
					}),
				}));
			},

			toggleAllAssignment: (itemId, selectAll) => {
				set((state) => ({
					bills: state.bills.map((b) => {
						if (b.id !== state.activeBillId) return b;
						const allIds = b.participants.map((p) => p.id);
						return {
							...b,
							items: b.items.map((item) =>
								item.id === itemId
									? {
											...item,
											assignedToParticipantIds: selectAll
												? allIds
												: [],
									  }
									: item
							),
						};
					}),
				}));
			},

			cleanupEmptyBills: () => {
				set((state) => {
					const filteredBills = state.bills.filter((bill) => {
						const isEmpty =
							bill.title.trim() === "" && bill.items.length === 0;
						return !isEmpty;
					});
					return { bills: filteredBills };
				});
			},
		}),
		{
			name: "split-bill-storage-v3",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);

// --- SELECTORS UTILS ---
export const useActiveBill = () => {
	const { bills, activeBillId } = useBillStore();
	const activeBill = bills.find((b) => b.id === activeBillId);
	return activeBill || null;
};

export const useActiveBillSummary = () => {
	const activeBill = useActiveBill();
	if (!activeBill) return null;
	return calculateBill(activeBill);
};
