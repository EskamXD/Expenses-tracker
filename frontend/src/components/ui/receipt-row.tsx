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
        <div className="grid grid-cols-7 gap-4 items-center py-2 border-b">
            <div className="truncate font-bold col-span-2">{receipt.shop}</div>
            <div className="truncate">{totalValue.toFixed(2)} PLN</div>
            <div className="truncate">{receiptPayerName}</div>
            <div className="truncate col-span-2">
                {/* Usunięto ReceiptItemList */}
            </div>
            <div className="flex justify-end">
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

