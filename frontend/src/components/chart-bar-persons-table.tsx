import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { ReceiptRow } from "@/components/ui/receipt-row";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Info } from "lucide-react";
import { useGlobalContext } from "@/context/GlobalContext";
import { fetchGetReceiptsByID } from "@/api/apiService";
import { Person, Receipt } from "@/types";
import { DialogDescription } from "@radix-ui/react-dialog";

export type TBarPersons = {
    shared_expenses: {
        payer: number;
        expense_sum: number;
        receipt_ids: number[];
        top_outlier_receipts: number[];
    }[];
    not_own_expenses: {
        payer: number;
        expense_sum: number;
        receipt_ids: number[];
        top_outlier_receipts: number[];
    }[];
};

/* 
  Komponent ReceiptDialog odpowiada za wyświetlanie dialogu z pobieraniem
  szczegółowych danych wydatków. Dzięki wewnętrznemu stanowi "open" 
  zapytanie uruchamia się tylko, gdy dialog jest otwarty.
*/
interface ReceiptDialogProps {
    receiptsIds: number[];
    title: string;
}

const ReceiptDialog: React.FC<ReceiptDialogProps> = ({
    receiptsIds,
    title,
}) => {
    const [open, setOpen] = useState(false);

    const { data: receipts, isFetching } = useQuery<Receipt[]>({
        queryKey: ["receipts", receiptsIds],
        queryFn: async () => {
            if (!receiptsIds || receiptsIds.length === 0) return [];
            return await fetchGetReceiptsByID({ id: receiptsIds });
        },
        enabled: open,
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Info className="w-4 h-4 ml-2 inline cursor-pointer text-gray-500" />
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                {isFetching ? (
                    <Skeleton className="h-12 w-full" />
                ) : (
                    receipts?.map((receipt) => (
                        <ReceiptRow
                            key={receipt.id}
                            receipt={receipt}
                            highlightOwners={true}
                        />
                    ))
                )}
                <DialogDescription>
                    Kliknij w paragon by dowiedzieć się więcej
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

/*
  Komponent BarPersonRow odpowiada za wyrenderowanie pojedynczego wiersza w tabeli,
  który zawiera informacje o wydatkach dla danego płatnika. Dzięki temu logika 
  wiersza jest oddzielona od głównego komponentu tabeli.
*/
interface BarPersonRowProps {
    payerName: string;
    sharedExpense: {
        payer: number;
        expense_sum: number;
        receipt_ids: number[];
        top_outlier_receipts: number[];
    };
    notOwnExpense?: {
        payer: number;
        expense_sum: number;
        receipt_ids: number[];
        top_outlier_receipts: number[];
    };
}

const BarPersonRow: React.FC<BarPersonRowProps> = ({
    payerName,
    sharedExpense,
    notOwnExpense,
}) => {
    const sharedSum = sharedExpense.expense_sum;
    const notOwnSum = notOwnExpense?.expense_sum || 0;

    return (
        <TableRow>
            <TableCell>{payerName}</TableCell>
            <TableCell className="text-right">
                {sharedSum.toFixed(2)} PLN
                <ReceiptDialog
                    receiptsIds={sharedExpense.top_outlier_receipts}
                    title={`Wydatki wspólne dla ${payerName}`}
                />
            </TableCell>
            <TableCell className="text-right">
                {notOwnExpense?.expense_sum?.toFixed(2) || "0.00"} PLN
                <ReceiptDialog
                    receiptsIds={notOwnExpense?.top_outlier_receipts || []}
                    title={`Wydatki na cudze rzeczy dla ${payerName}`}
                />
            </TableCell>
            <TableCell className="text-right text-red-400">
                {(sharedSum + notOwnSum).toFixed(2)} PLN
            </TableCell>
        </TableRow>
    );
};

/*
  Główny komponent ChartBarPersonsTable, który renderuje całą tabelę oraz
  korzysta z komponentu BarPersonRow, aby oddzielić logikę poszczególnych wierszy.
*/
interface ChartBarPersonsTableProps {
    barPersonsData: TBarPersons;
}

const ChartBarPersonsTable: React.FC<ChartBarPersonsTableProps> = ({
    barPersonsData,
}) => {
    const { persons } = useGlobalContext();

    return (
        <Table>
            <TableCaption>Podział kosztów między płatnikami</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableCell>Płatnik</TableCell>
                    <TableCell className="text-right">
                        Wydatki wspólne
                    </TableCell>
                    <TableCell className="text-right">
                        Wydatki na cudze rzeczy
                    </TableCell>
                    <TableCell className="text-right">
                        Łączna kwota do zwrotu
                    </TableCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {barPersonsData?.shared_expenses.map((sharedExpense, index) => {
                    const activePayer = persons.find(
                        (p) => p.id === sharedExpense.payer
                    ) || {
                        id: 0,
                        name: "Nieznany",
                        payer: false,
                        owner: false,
                    };
                    const payerName = activePayer.name;
                    const notOwnExpense =
                        barPersonsData?.not_own_expenses[index];

                    return (
                        <BarPersonRow
                            key={index}
                            payerName={payerName}
                            sharedExpense={sharedExpense}
                            notOwnExpense={notOwnExpense}
                        />
                    );
                })}
            </TableBody>
        </Table>
    );
};

export default ChartBarPersonsTable;

