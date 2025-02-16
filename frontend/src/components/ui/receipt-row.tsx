import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ArrowRight } from "lucide-react";
import { useGlobalContext } from "@/context/GlobalContext";
import { selectTranslationList } from "@/config/selectOption";
import { Receipt } from "@/types";

interface ReceiptRowProps {
    receipt: Receipt;
    onEdit?: (receiptId: number) => void;
}

export const ReceiptRow: React.FC<ReceiptRowProps> = ({ receipt, onEdit }) => {
    const { persons } = useGlobalContext();
    const [isDialogOpen, setDialogOpen] = useState(false);

    // Znajdź imię płatnika
    const payer = persons.find((p) => p.id === receipt.payer);
    const payerName = payer ? payer.name : "Nieznany";

    // Znajdź właścicieli przedmiotów
    const owners = receipt.items
        .flatMap((item) => item.owners)
        .map((ownerId) => persons.find((p) => p.id === ownerId)?.name)
        .filter((name): name is string => !!name); // Usuwamy undefined

    // Obliczanie wartości paragonu (suma wartości przedmiotów)
    const totalValue = receipt.items.reduce(
        (sum, item) => sum + Number(item.value),
        0
    );

    return (
        <div className="grid grid-cols-7 gap-4 items-center py-2 border-b">
            <div className="truncate font-bold col-span-2">{receipt.shop}</div>
            <div className="truncate">{totalValue.toFixed(2)} PLN</div>
            <div className="truncate">{payerName}</div>
            {/* <div className="truncate">
                {owners.length ? [...new Set(owners)].join(", ") : "Brak"}
            </div> */}
            <div className="truncate col-span-2">
                {[
                    ...new Set(
                        receipt.items.map(
                            (item) =>
                                selectTranslationList.find(
                                    (t) => t.value === item.category
                                )?.label || "Nieznane"
                        )
                    ),
                ].map((label, index) => (
                    <span key={index} className="text-sm text-gray-500 mr-2">
                        {label}
                    </span>
                ))}
            </div>

            <div className="flex justify-end">
                {onEdit ? (
                    <Button
                        variant="outline"
                        onClick={() => onEdit(receipt.id)}>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                ) : (
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
                                    <strong>Data:</strong>{" "}
                                    {receipt.payment_date}
                                </p>
                                <p>
                                    <strong>Płatnik:</strong> {payerName}
                                </p>
                                <p>
                                    <strong>Wartość:</strong>{" "}
                                    {totalValue.toFixed(2)} PLN
                                </p>
                                <div>
                                    <strong className="mb-4">Pozycje:</strong>
                                    <ScrollArea className="h-[300px]">
                                        <ul className="list-disc pl-5">
                                            {receipt.items.map((item) => {
                                                const ownersNames =
                                                    item.owners
                                                        .map(
                                                            (ownerId) =>
                                                                persons.find(
                                                                    (p) =>
                                                                        p.id ===
                                                                        ownerId
                                                                )?.name
                                                        )
                                                        .filter(
                                                            (
                                                                name
                                                            ): name is string =>
                                                                !!name
                                                        ) // Usuwa undefined
                                                        .join(", ") || "Brak";

                                                return (
                                                    <li
                                                        key={item.id}
                                                        className="grid grid-cols-3 border-b-2 mb-4">
                                                        <span>
                                                            {item.description}
                                                        </span>
                                                        <span>
                                                            {item.value} zł
                                                        </span>
                                                        <span>
                                                            {ownersNames}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </ScrollArea>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
};

