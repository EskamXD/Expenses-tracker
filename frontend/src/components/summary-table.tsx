import React, { useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { selectTranslationList } from "@/lib/select-option";
import { Item, Receipt } from "@/types";

import { ReceiptRow } from "@/components/ui/receipt-row";
import { EditReceiptModal } from "@/components/edit-receipt-modal";

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
