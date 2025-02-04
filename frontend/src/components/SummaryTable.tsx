import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGlobalContext } from "../context/GlobalContext";
import {
    fetchGetReceipts,
    fetchPutReceipt,
    fetchDeleteReceipt,
} from "../api/apiService";
import UnifiedForm from "../components/UnifiedForm";
import { selectTranslationList } from "../config/selectOption";
import { Item, Params, Receipt } from "../types";
import { ArrowRight } from "lucide-react";

interface SummaryTableProps {
    transactionType: "income" | "expense";
    receipts: Receipt[];
}

interface ProcessedReceiptForAccordion {
    date: string;
    receipts: {
        id: number;
        shop: string;
        totalValue: number;
        payer: string;
        categories: string[];
        keywords: string[];
    }[];
}

const SummaryTable: React.FC<SummaryTableProps> = ({
    transactionType,
    receipts,
}) => {
    const { persons } = useGlobalContext();
    const [groupedReceipts, setGroupedReceipts] = useState<
        ProcessedReceiptForAccordion[]
    >([]);

    const [searchQuery, setSearchQuery] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedGroup, setSelectedGroup] =
        useState<ProcessedReceiptForAccordion | null>(null);
    const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null); // Pełny obiekt paragonu
    const [editModalVisible, setEditModalVisible] = useState(false);

    const getPersonNameById = (id: number | string): string => {
        const person = persons.find((person) => person.id === Number(id));
        return person ? person.name : "Unknown";
    };

    useEffect(() => {
        const grouped: Record<
            string,
            ProcessedReceiptForAccordion["receipts"]
        > = {};

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
                totalValue,
                payer: getPersonNameById(receipt.payer),
                categories: uniqueCategories,
                keywords: keywords,
            });
        });

        const processedData: ProcessedReceiptForAccordion[] = Object.entries(
            grouped
        ).map(([date, receipts]) => ({
            date,
            receipts,
        }));

        setGroupedReceipts(processedData);
    }, [receipts, transactionType]);

    // Filtruj dane na podstawie frazy wyszukiwania
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
                    receipt.payer.toLowerCase().includes(query) ||
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

    const handleShowModal = (group: ProcessedReceiptForAccordion) => {
        setSelectedGroup(group);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedGroup(null);
        setShowModal(false);
    };

    const fetchReceiptDetails = async (receiptId: number) => {
        const params = {
            id: receiptId,
        } as Params;

        try {
            const response = await fetchGetReceipts(params);
            setEditingReceipt(response[0]); // Pobierz pierwszy wynik
            setEditModalVisible(true);
        } catch (error) {
            console.error("Nie udało się pobrać szczegółów paragonu", error);
        }
    };

    const handleSaveReceipt = async (receipt: Receipt) => {
        if (!receipt.id) return;
        try {
            await fetchPutReceipt(receipt.id, receipt);
            alert("Zapisano zmiany!");
            setEditModalVisible(false);
            setEditingReceipt(null);
        } catch (error) {
            console.error("Nie udało się zapisać paragonu", error);
        }
    };

    const handleDeleteReceipt = async (receipt: Receipt) => {
        if (!receipt.id) return;
        if (!window.confirm("Czy na pewno chcesz usunąć ten paragon?")) return;

        try {
            await fetchDeleteReceipt(receipt);
            alert("Paragon usunięty!");
            setEditModalVisible(false);
            setEditingReceipt(null);
        } catch (error) {
            console.error("Nie udało się usunąć paragonu", error);
        }
    };

    return (
        <div className="summary-table-container p-4 bg-white shadow rounded-lg">
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

            <Accordion type="single" collapsible>
                {groupedReceipts.map((group) => (
                    <AccordionItem key={group.date} value={group.date}>
                        <AccordionTrigger>{group.date}</AccordionTrigger>
                        <AccordionContent>
                            {group.receipts.map((receipt) => (
                                <div
                                    key={receipt.id}
                                    className="flex items-center justify-between py-2 border-b">
                                    <div className="flex flex-col">
                                        <span className="font-bold">
                                            {receipt.shop}
                                        </span>
                                        <span>
                                            {receipt.totalValue.toFixed(2)} PLN
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span>Płacący: {receipt.payer}</span>
                                        <span>
                                            {receipt.categories.map(
                                                (category) => {
                                                    const translation =
                                                        selectTranslationList.find(
                                                            (i) =>
                                                                i.value ===
                                                                category
                                                        );
                                                    return (
                                                        <span
                                                            key={category}
                                                            className="text-sm text-gray-500">
                                                            {translation
                                                                ? translation.label
                                                                : "Nieznane"}
                                                        </span>
                                                    );
                                                }
                                            )}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleShowModal(group)}>
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {/* Modal szczegółów paragonu */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Paragony z dnia {selectedGroup?.date}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedGroup?.receipts.map((receipt) => (
                            <div
                                key={receipt.id}
                                className="p-4 border rounded-md">
                                <p>
                                    <strong>Sklep:</strong> {receipt.shop}
                                </p>
                                <p>
                                    <strong>Płacący:</strong> {receipt.payer}
                                </p>
                                <p>
                                    <strong>Wartość:</strong>{" "}
                                    {receipt.totalValue.toFixed(2)} PLN
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-2"
                                    onClick={() => {}}>
                                    Edytuj
                                </Button>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCloseModal}>Zamknij</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal edycji paragonu */}
            {editingReceipt && (
                <Dialog
                    open={editModalVisible}
                    onOpenChange={setEditModalVisible}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Edytuj paragon</DialogTitle>
                        </DialogHeader>
                        <UnifiedForm
                            formId={
                                transactionType === "expense"
                                    ? "expense-form"
                                    : "income-form"
                            }
                            buttonLabel="Zapisz zmiany"
                            showQuantity={true}
                            receipt={editingReceipt}
                        />
                        <DialogFooter>
                            <Button
                                variant="destructive"
                                onClick={() =>
                                    fetchDeleteReceipt(editingReceipt)
                                }>
                                Usuń paragon
                            </Button>
                            <Button onClick={() => setEditModalVisible(false)}>
                                Anuluj
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default SummaryTable;

