import { useState } from "react";
import { useGlobalContext } from "@/context/GlobalContext";
import { Receipt } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReceiptPreviewDialogProps {
    receipt: Receipt;
    receiptPayerName: string;
    totalValue: string;
    highlightOwners?: boolean;
}

const ReceiptPreviewDialog: React.FC<ReceiptPreviewDialogProps> = ({
    receipt,
    receiptPayerName,
    totalValue,
    highlightOwners = false,
}) => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const { persons } = useGlobalContext();

    return (
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Podgląd paragonu</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <p>
                        <strong>Sklep:</strong> {receipt.shop}
                    </p>
                    <p>
                        <strong>Data:</strong> {receipt.payment_date}
                    </p>
                    <p>
                        <strong>Płatnik:</strong> {receiptPayerName}
                    </p>
                    <p>
                        <strong>Wartość:</strong> {totalValue} PLN
                    </p>
                    <div>
                        <strong className="mb-4 block">Właściciele:</strong>
                        <ScrollArea className="h-[300px]">
                            <ul className="list-disc pl-5">
                                {receipt.items.map((item) => (
                                    <li key={item.id} className="mb-2">
                                        {item.description} –{" "}
                                        {Number(item.value).toFixed(2)} zł{" "}
                                        <span className="text-xs">
                                            (
                                            {item.owners.map(
                                                (ownerId, index) => {
                                                    const owner = persons.find(
                                                        (p) => p.id === ownerId
                                                    );
                                                    const ownerClass =
                                                        highlightOwners &&
                                                        ownerId !==
                                                            receipt.payer
                                                            ? "text-red-500"
                                                            : "text-gray-500";
                                                    return (
                                                        <span
                                                            key={index}
                                                            className={`${ownerClass} mr-1`}>
                                                            {owner
                                                                ? owner.name
                                                                : "Nieznany"}
                                                            {index <
                                                            item.owners.length -
                                                                1
                                                                ? ","
                                                                : ""}
                                                        </span>
                                                    );
                                                }
                                            )}
                                            )
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export interface ReceiptRowProps {
    receipt: Receipt;
    highlightOwners?: boolean; // opcjonalnie, nie używamy już tej wartości
    onEdit?: (id: number) => void;
}

export const ReceiptRow: React.FC<ReceiptRowProps> = ({
    receipt,
    highlightOwners = false,
    onEdit,
}) => {
    const { persons } = useGlobalContext();

    // Znalezienie płatnika przypisanego do paragonu (może być inny niż activePayer)
    const receiptPayer = persons.find((p) => p.id === receipt.payer);
    const receiptPayerName = receiptPayer ? receiptPayer.name : "Nieznany";

    // Obliczenie całkowitej wartości paragonu
    const totalValue = receipt.items.reduce(
        (sum, item) => sum + Number(item.value),
        0
    );

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-7 lg:items-center gap-4 py-2 border-b">
            {/* 1) Shop — full width on mobile, spans 2 cols on lg */}
            <div className="truncate font-bold lg:col-span-2">
                {receipt.shop}
            </div>

            {/* 2) Total & Button row on mobile; on lg each into its own col */}
            <div className="flex justify-between items-center lg:block lg:col-span-1">
                <span className="truncate">{totalValue.toFixed(2)} PLN</span>
                <div className="flex-shrink-0 lg:hidden">
                    {onEdit ? (
                        <Button
                            variant="outline"
                            onClick={() => onEdit(receipt.id)}>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <ReceiptPreviewDialog
                            receipt={receipt}
                            receiptPayerName={receiptPayerName}
                            totalValue={totalValue.toFixed(2)}
                            highlightOwners={highlightOwners}
                        />
                    )}
                </div>
            </div>

            {/* 3) Payer — full width on mobile, spans 1 col on lg */}
            <div className="truncate lg:col-span-1">{receiptPayerName}</div>

            {/* 4) On lg, move the button into its own cell: */}
            <div className="hidden lg:flex lg:justify-end lg:col-span-1">
                {onEdit ? (
                    <Button
                        variant="outline"
                        onClick={() => onEdit(receipt.id)}>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <ReceiptPreviewDialog
                        receipt={receipt}
                        receiptPayerName={receiptPayerName}
                        totalValue={totalValue.toFixed(2)}
                        highlightOwners={highlightOwners}
                    />
                )}
            </div>
        </div>
    );
};
