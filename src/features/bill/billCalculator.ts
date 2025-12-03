import { Bill, BillSummary, ParticipantBillShare } from "../../types/Bill";

export const calculateBill = (bill: Bill): BillSummary => {
	const { items, participants, taxRate, serviceRate } = bill;

	// Siapkan wadah untuk setiap peserta
	const sharesMap = new Map<string, ParticipantBillShare>();

	participants.forEach((p) => {
		sharesMap.set(p.id, {
			participantId: p.id,
			participantName: p.name,
			subtotal: 0,
			taxAmount: 0,
			serviceAmount: 0,
			totalDue: 0,
			itemsConsumed: [],
		});
	});

	// Loop setiap Item Makanan
	let billSubtotal = 0;

	items.forEach((item) => {
		const itemTotalPrice = item.price * item.quantity;
		billSubtotal += itemTotalPrice;

		const assignedCount = item.assignedToParticipantIds.length;

		if (assignedCount > 0) {
			// Split harga item dibagi jumlah orang yang makan
			const pricePerPerson = itemTotalPrice / assignedCount;
			const quantityPerPerson = item.quantity / assignedCount;

			item.assignedToParticipantIds.forEach((participantId) => {
				const participantShare = sharesMap.get(participantId);

				if (participantShare) {
					participantShare.subtotal += pricePerPerson;
					participantShare.itemsConsumed.push({
						itemName: item.name,
						portionPrice: pricePerPerson,
						portionQuantity: quantityPerPerson,
					});
				}
			});
		}
	});

	// Hitung Tax & Service
	const taxMultiplier = taxRate / 100;
	const serviceMultiplier = serviceRate / 100;

	let totalTax = 0;
	let totalService = 0;
	const finalShares: ParticipantBillShare[] = [];

	sharesMap.forEach((share) => {
		share.serviceAmount = share.subtotal * serviceMultiplier;
		share.taxAmount = share.subtotal * taxMultiplier;
		share.totalDue = share.subtotal + share.taxAmount + share.serviceAmount;

		totalTax += share.taxAmount;
		totalService += share.serviceAmount;

		finalShares.push(share);
	});

	const grandTotal = billSubtotal + totalTax + totalService;

	return {
		billId: bill.id,
		subtotal: billSubtotal,
		totalTax,
		totalService,
		grandTotal,
		shares: finalShares,
	};
};
export { BillSummary };

