import React, { useState, useRef } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import {
    fetchGetReceipts,
    fetchPutReceipt,
    fetchDeleteReceipt,
} from "@/api/apiService";
import UnifiedForm, { UnifiedFormRef } from "@/components/unified-form";
import { selectTranslationList } from "@/config/selectOption";
import { Item, Params, Receipt } from "@/types";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ReceiptRow } from "@/components/ui/receipt-row";

interface SummaryTableProps {
    transactionType: "income" | "expense";
    receipts: Receipt[];
}

interface ProcessedReceiptForAccordion {
    date: string;
    receipts: {
        id: number;
        shop: string;
        payment_date: string;
        transaction_type: "expense" | "income";
        totalValue: number;
        payer: number;
        categories: string[];
        keywords: string[];
        items: Item[];
    }[];
}

/**
 * Funkcja pomocnicza grupująca paragony według daty.
 */
const groupReceipts = (
    receipts: Receipt[],
    transactionType: "income" | "expense"
): ProcessedReceiptForAccordion[] => {
    const grouped: Record<string, ProcessedReceiptForAccordion["receipts"]> =
        {};

    receipts.forEach((receipt) => {
        if (receipt.transaction_type !== transactionType) return;

        const totalValue = receipt.items.reduce(
            (sum: number, item: Item) => sum + parseFloat(item.value),
            0
        );

        const uniqueCategories = Array.from(
            new Set(receipt.items.map((item: Item) => item.category))
        );

        const keywords = receipt.items
            .map((item: Item) => item.description.toLowerCase())
            .filter(Boolean);

        if (!grouped[receipt.payment_date]) {
            grouped[receipt.payment_date] = [];
        }

        grouped[receipt.payment_date].push({
            id: Number(receipt.id),
            shop: receipt.shop,
            payment_date: receipt.payment_date,
            transaction_type: receipt.transaction_type,
            totalValue,
            payer: receipt.payer,
            categories: uniqueCategories,
            keywords,
            items: receipt.items,
        });
    });

    return Object.entries(grouped).map(([date, receipts]) => ({
        date,
        receipts,
    }));
};

/** Komponent paska wyszukiwania */
const SearchBar: React.FC<{
    searchQuery: string;
    setSearchQuery: (q: string) => void;
}> = ({ searchQuery, setSearchQuery }) => (
    <div className="mb-4">
        <Label htmlFor="search">Wyszukaj</Label>
        <Input
            id="search"
            type="text"
            placeholder="Wyszukaj po sklepie, płacącym lub kategorii"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
    </div>
);

/** Komponent akordeonu wyświetlającego paragony pogrupowane według daty */
interface ReceiptsAccordionProps {
    groupedReceipts: ProcessedReceiptForAccordion[];
    onEditReceipt: (receiptId: number) => void;
}

const ReceiptsAccordion: React.FC<ReceiptsAccordionProps> = ({
    groupedReceipts,
    onEditReceipt,
}) => {
    return (
        <Accordion type="single" collapsible>
            {groupedReceipts.map((group) => (
                <AccordionItem key={group.date} value={group.date}>
                    <AccordionTrigger>{group.date}</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            {group.receipts.map((receipt) => (
                                <ReceiptRow
                                    key={receipt.id}
                                    receipt={receipt}
                                    onEdit={onEditReceipt}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};

/** Modal do edycji paragonu, wykorzystujący react-query do pobierania oraz mutacji danych */
interface EditReceiptModalProps {
    transactionType: "income" | "expense";
    receiptId: number;
    onClose: () => void;
}

const EditReceiptModal: React.FC<EditReceiptModalProps> = ({
    transactionType,
    receiptId,
    onClose,
}) => {
    console.log(transactionType, receiptId);

    const queryClient = useQueryClient();
    const formRef = useRef<UnifiedFormRef>(null);

    // Pobierz szczegóły paragonu; zakładamy, że API zwraca tablicę – wybieramy pierwszy element
    const {
        data: receipt,
        isLoading,
        isError,
    } = useQuery<Receipt>({
        queryKey: ["receipt", receiptId],
        queryFn: async () => {
            const receipts = await fetchGetReceipts({
                id: receiptId,
            } as Params);
            return receipts[0] as Receipt;
        },
        enabled: receiptId !== undefined,
    });

    // Mutacja aktualizacji paragonu – używamy Sonner do wyświetlania powiadomień
    const updateMutation = useMutation({
        mutationFn: (updatedReceipt: Receipt) =>
            fetchPutReceipt(updatedReceipt.id, updatedReceipt),
        onSuccess: () => {
            toast.success("Paragon został pomyślnie zaktualizowany.");
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            onClose();
        },
        onError: () => {
            toast.error("Nie udało się zapisać paragonu.");
        },
    });

    // Mutacja usuwania paragonu – potwierdzamy operację za pomocą AlertDialog
    const deleteMutation = useMutation({
        mutationFn: (receiptToDelete: Receipt) =>
            fetchDeleteReceipt(receiptToDelete),
        onSuccess: () => {
            toast.success("Paragon został pomyślnie usunięty.");
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            onClose();
        },
        onError: () => {
            toast.error("Nie udało się usunąć paragonu.");
        },
    });

    if (isLoading)
        return (
            <Dialog open onOpenChange={onClose}>
                <DialogContent className="w-screen h-screen !max-w-none rounded-none">
                    <DialogHeader>
                        <DialogTitle>Edytuj paragon</DialogTitle>
                    </DialogHeader>
                    Ładowanie szczegółów paragonu...
                </DialogContent>
            </Dialog>
        );
    if (isError || !receipt)
        return (
            <Dialog open onOpenChange={onClose}>
                <DialogContent className="w-screen h-screen !max-w-none rounded-none">
                    <DialogHeader>
                        <DialogTitle>Błąd</DialogTitle>
                    </DialogHeader>
                    Błąd ładowania paragonu.
                </DialogContent>
            </Dialog>
        );

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="w-screen h-screen !max-w-none rounded-none overflow-y-auto pb-0">
                <DialogHeader>
                    <DialogTitle>Edytuj paragon</DialogTitle>
                </DialogHeader>
                <UnifiedForm
                    ref={formRef}
                    formId={`${transactionType}-form`}
                    transactionType={transactionType}
                    buttonLabel="Zapisz zmiany"
                    showQuantity={true}
                    receipt={receipt}
                    onSubmitReceipt={(updatedReceipt: Receipt) =>
                        updateMutation.mutate(updatedReceipt)
                    }
                    footerActions={
                        <>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        Usuń paragon
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Potwierdź usunięcie
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Czy na pewno chcesz usunąć ten
                                            paragon? Ta operacja jest
                                            nieodwracalna.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Nie
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() =>
                                                deleteMutation.mutate(receipt)
                                            }>
                                            Tak, usuń
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <Button variant="secondary" onClick={onClose}>
                                Anuluj
                            </Button>
                        </>
                    }
                />
            </DialogContent>
        </Dialog>
    );
};

/** Główny komponent SummaryTable */
const SummaryTable: React.FC<SummaryTableProps> = ({
    transactionType,
    receipts,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [editReceiptId, setEditReceiptId] = useState<number | null>(null);

    // Grupowanie paragonów według daty
    const groupedReceipts = groupReceipts(receipts, transactionType);

    // Filtrowanie na podstawie wpisanego zapytania
    const filteredGroupedReceipts = groupedReceipts
        .map((group) => ({
            ...group,
            receipts: group.receipts.filter((receipt) => {
                const query = searchQuery.toLowerCase();
                const categoryLabels = receipt.categories
                    .map((category) => {
                        const translation = selectTranslationList.find(
                            (item) => item.value === category
                        );
                        return translation
                            ? translation.label.toLowerCase()
                            : null;
                    })
                    .filter(Boolean);
                return (
                    receipt.shop.toLowerCase().includes(query) ||
                    receipt.categories.some((category) =>
                        category.toLowerCase().includes(query)
                    ) ||
                    categoryLabels.some(
                        (label) => label && label.includes(query)
                    ) ||
                    receipt.keywords.some((keyword) => keyword.includes(query))
                );
            }),
        }))
        .filter((group) => group.receipts.length > 0);

    return (
        <div className="p-4 shadow rounded-lg">
            <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
            <ReceiptsAccordion
                groupedReceipts={filteredGroupedReceipts}
                onEditReceipt={(receiptId) => setEditReceiptId(receiptId)}
            />
            {editReceiptId !== null && (
                <EditReceiptModal
                    transactionType={transactionType}
                    receiptId={editReceiptId}
                    onClose={() => setEditReceiptId(null)}
                />
            )}
        </div>
    );
};

export default SummaryTable;

