import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import {
    fetchGetReceipts,
    fetchPostReceipt,
    fetchPutReceipt,
} from "@/api/apiService";
import { Split } from "lucide-react";
import { Receipt } from "@/types.tsx";
import PayerDropdown from "@/components/payer-dropdown";
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
import ResponsiveFilters from "@/components/responsive-filters";

const Bills = () => {
    const { summaryFilters, persons } = useGlobalContext();
    const [splitModalOpen, setSplitModalOpen] = useState(false);
    const [selectedSplitReceipt, setSelectedSplitReceipt] =
        useState<Receipt | null>(null);
    const [splitPayer, setSplitPayer] = useState<number>(0);

    const {
        data: receipts,
        isLoading,
        error,
    } = useQuery<Receipt[]>({
        queryKey: ["flat_bills_receipts", summaryFilters],
        queryFn: async () => {
            return await fetchGetReceipts({
                ...summaryFilters,
                category: ["flat_bills"], // ✅ Ustawiamy kategorię już w zapytaniu
            });
        },
        staleTime: 1000 * 60 * 5,
        placeholderData: (previousData) => previousData,
        enabled: true,
    });

    const queryClient = useQueryClient();

    const putReceiptMutation = useMutation({
        mutationFn: ({ id, receipt }: { id: number; receipt: Receipt }) =>
            fetchPutReceipt(id, receipt),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["flat_bills_receipts", summaryFilters],
            });
        },
    });

    const postReceiptMutation = useMutation({
        mutationFn: (receipt: Receipt[]) => fetchPostReceipt(receipt),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["flat_bills_receipts", summaryFilters],
            });
        },
    });

    if (isLoading) return <Skeleton className="h-40 w-full" />;
    if (error) return <p>Wystąpił błąd podczas pobierania danych!</p>;

    const handleShowSplitModal = (receipt: Receipt) => {
        const otherOwners = receipt.items[0].owners.filter(
            (owner) => owner !== receipt.payer
        );
        setSelectedSplitReceipt(receipt);
        setSplitPayer(otherOwners.length > 0 ? otherOwners[0] : 0);
        setSplitModalOpen(true);
    };

    const handleCloseSplitModal = () => {
        setSplitModalOpen(false);
        setSelectedSplitReceipt(null);
        setSplitPayer(0);
    };

    const handleSplitReceipt = async () => {
        if (!selectedSplitReceipt || splitPayer === 0) return;

        const halfValue = Number(selectedSplitReceipt.items[0].value) / 2;

        // Nowa wersja oryginalnego rachunku (z połową kwoty)
        const updatedReceipt = {
            ...selectedSplitReceipt,
            items: [
                {
                    ...selectedSplitReceipt.items[0],
                    owners: [selectedSplitReceipt.payer],
                    value: String(halfValue.toFixed(2)),
                },
            ],
        };

        // Nowy rachunek dla drugiego właściciela
        const newReceipt = {
            ...selectedSplitReceipt,
            payer: splitPayer,
            items: [
                {
                    ...selectedSplitReceipt.items[0],
                    owners: [splitPayer],
                    value: String(halfValue.toFixed(2)),
                },
            ],
        };

        try {
            await putReceiptMutation.mutateAsync({
                id: selectedSplitReceipt.id,
                receipt: updatedReceipt,
            });

            await postReceiptMutation.mutateAsync([newReceipt]);

            handleCloseSplitModal();
        } catch (error) {
            console.error("Błąd podczas podziału rachunku:", error);
        }
    };

    // Kolumny dla DataTable
    const columns: ColumnDef<Receipt>[] = [
        {
            accessorKey: "payment_date",
            header: "Data",
        },
        {
            accessorKey: "value",
            header: "Wartość",
            cell: ({ row }) =>
                `${row.original.items
                    .reduce((sum, item) => sum + Number(item.value), 0)
                    .toFixed(2)} zł`,
        },
        {
            accessorKey: "payer",
            header: "Płacił",
            cell: ({ row }) =>
                persons.find((person) => person.id === row.original.payer)
                    ?.name,
        },
        {
            accessorKey: "items",
            header: "Opis",
            cell: ({ row }) =>
                row.original.items.map((item) => item.description).join(", "),
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
                        <Split />
                    </Button>
                );
            },
        },
    ];

    return (
        <div>
            <ResponsiveFilters
                showCategories={false}
                transactionType="expense"
            />

            {receipts && receipts.length > 0 ? (
                <DataTable columns={columns} data={receipts} />
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
                        <div className="flex flex-col gap-4">
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

                            <PayerDropdown
                                payer={splitPayer || 0}
                                setPayer={setSplitPayer}
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

export default Bills;

