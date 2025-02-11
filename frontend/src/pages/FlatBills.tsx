import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import { getPersonOption } from "@/utils/getPersonOption";
import { fetchGetReceipts } from "@/api/apiService";
import SummaryFilters from "@/components/SummaryFilters.tsx";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import { Receipt } from "@/types.tsx";
import UnifiedDropdown from "@/components/UnifiedDropdown.tsx";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

const FlatBills = () => {
    const { summaryFilters } = useGlobalContext();
    const [splitModalOpen, setSplitModalOpen] = useState(false);
    const [selectedSplitReceipt, setSelectedSplitReceipt] =
        useState<Receipt | null>(null);
    const [splitOwner, setSplitOwner] = useState<number[]>([]);

    // Pobranie rachunków
    const {
        data: receipts,
        isLoading,
        error,
    } = useQuery<Receipt[], Error>({
        queryKey: ["flat_bills_receipts", summaryFilters],
        queryFn: () => fetchGetReceipts(summaryFilters),
        staleTime: 1000 * 60 * 5,
        placeholderData: (previousData) => previousData,
    });

    if (isLoading) return <Skeleton className="h-40 w-full" />;
    if (error) return <p>Wystąpił błąd podczas pobierania danych!</p>;

    // Filtrowanie rachunków
    const filteredBills = (receipts ?? [])
        .map((receipt) => ({
            ...receipt,
            items: receipt.items.filter(
                (item) => item.category === "flat_bills"
            ),
        }))
        .filter((receipt) => receipt.items.length > 0);

    const handleShowSplitModal = (receipt: Receipt) => {
        const otherOwners = receipt.items[0].owners.filter(
            (owner) => owner !== receipt.payer
        );
        setSelectedSplitReceipt(receipt);
        setSplitOwner(otherOwners.length > 0 ? otherOwners : []);
        setSplitModalOpen(true);
    };

    const handleCloseSplitModal = () => {
        setSplitModalOpen(false);
        setSelectedSplitReceipt(null);
        setSplitOwner([]);
    };

    const handleSplitReceipt = async () => {
        if (!selectedSplitReceipt || splitOwner.length === 0) return;

        const halfValue = Number(selectedSplitReceipt.items[0].value) / 2;

        const newReceipts = [
            {
                ...selectedSplitReceipt,
                payer: selectedSplitReceipt.payer,
                owners: [selectedSplitReceipt.payer],
                items: [{ ...selectedSplitReceipt.items[0], value: halfValue }],
            },
            {
                ...selectedSplitReceipt,
                payer: splitOwner[0],
                owners: [splitOwner[0]],
                items: [{ ...selectedSplitReceipt.items[0], value: halfValue }],
            },
        ];

        console.log("Zapisuję nowe rachunki:", newReceipts);
        handleCloseSplitModal();
    };

    // Kolumny dla DataTable
    const columns: ColumnDef<Receipt>[] = [
        {
            accessorKey: "payment_date",
            header: "Data",
        },
        {
            accessorKey: "items.0.value",
            header: "Wartość",
            cell: ({ row }) => `${row.original.items[0].value} zł`,
        },
        {
            accessorKey: "payer",
            header: "Płacił",
            cell: ({ row }) => getPersonOption(row.original.payer),
        },
        {
            accessorKey: "items.0.description",
            header: "Opis",
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const billItem = row.original.items[0];
                return (
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={billItem.owners.length === 1}
                        onClick={() => handleShowSplitModal(row.original)}>
                        <CallSplitIcon />
                    </Button>
                );
            },
        },
    ];

    return (
        <div>
            <h1>Rachunki</h1>
            <SummaryFilters
                defaultCategory="flat_bills"
                transactionType="expense"
            />

            {filteredBills.length > 0 ? (
                <DataTable columns={columns} data={filteredBills} />
            ) : (
                <p>Brak rachunków</p>
            )}

            {/* Dialog do podziału rachunku */}
            <Dialog open={splitModalOpen} onOpenChange={handleCloseSplitModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Podziel Rachunek</DialogTitle>
                    </DialogHeader>
                    {selectedSplitReceipt && (
                        <div>
                            <p>
                                <strong>Oryginalna kwota:</strong>{" "}
                                {selectedSplitReceipt.items[0].value} zł
                            </p>
                            <p>
                                <strong>Kwota po podziale:</strong>{" "}
                                {(
                                    Number(
                                        selectedSplitReceipt.items[0].value
                                    ) / 2
                                ).toFixed(2)}{" "}
                                zł
                            </p>

                            <UnifiedDropdown
                                label="Wybierz drugiego właściciela"
                                personInDropdown={splitOwner}
                                setPersonInDropdown={setSplitOwner}
                            />

                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleCloseSplitModal}>
                                    Anuluj
                                </Button>
                                <Button onClick={handleSplitReceipt}>
                                    Zatwierdź podział
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FlatBills;

