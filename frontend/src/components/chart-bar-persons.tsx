import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
    ChartContainer,
    ChartConfig,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { Info } from "lucide-react";

import { useGlobalContext } from "@/context/GlobalContext";
import { Params, Receipt } from "@/types";
import { fetchBarPersons, fetchGetReceiptsByID } from "@/api/apiService";
import { ReceiptRow } from "@/components/ui/receipt-row";

export type ChartBarPersonsResponse = {
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

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "#2563eb",
    },
    mobile: {
        label: "Mobile",
        color: "#60a5fa",
    },
} satisfies ChartConfig;

const ChartBarPersons = () => {
    const { persons, summaryFilters } = useGlobalContext();
    const [selectedOutlierReceipts, setSelectedOutlierReceipts] = useState<
        number[] | null
    >(null);

    const { data: barPersonsData, isLoading: isLoadingBarPersons } =
        useQuery<ChartBarPersonsResponse>({
            queryKey: ["barPersons", summaryFilters.month, summaryFilters.year],
            queryFn: async () => {
                const params: Params = {
                    month: summaryFilters.month,
                    year: summaryFilters.year,
                };
                return await fetchBarPersons(params);
            },
        });

    const debtData = barPersonsData
        ? barPersonsData.shared_expenses.map((shared) => {
              const notOwnExpense =
                  barPersonsData.not_own_expenses.find(
                      (n) => n.payer === shared.payer
                  )?.expense_sum || 0;
              const payer = persons.find((p) => p.id === shared.payer);
              const payerName = payer ? payer.name : "Nieznany";

              return {
                  payer: payerName,
                  shared_expense: shared.expense_sum, // Wyświetlamy dokładnie to, co zwraca backend
                  not_own_expense: notOwnExpense,
                  total_debt: shared.expense_sum + notOwnExpense,
                  receipt_ids: [...shared.receipt_ids],
              };
          })
        : [];

    const { data: outlierReceiptsData, isFetching: isFetchingReceipts } =
        useQuery<Receipt[]>({
            queryKey: ["outlierReceipts", selectedOutlierReceipts],
            queryFn: async () => {
                if (!selectedOutlierReceipts?.length) return [];
                return await fetchGetReceiptsByID({
                    id: selectedOutlierReceipts,
                });
            },
            enabled: !!selectedOutlierReceipts,
        });

    if (isLoadingBarPersons) return <Skeleton className="h-[300px] w-full" />;

    return (
        <div className="flex flex-col items-center">
            {/* Wykres */}
            <ChartContainer config={chartConfig} className="min-h-[300px]">
                <BarChart data={debtData} width={600} height={300}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="payer" />
                    <YAxis />
                    <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value: number, name: string) => {
                            return [`${name} `, `${value} zł`];
                        }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                        dataKey="shared_expense"
                        fill="#8884d8"
                        name="Wydatki wspólne"
                    />
                    <Bar
                        dataKey="not_own_expense"
                        fill="#82ca9d"
                        name="Wydatki na cudze rzeczy"
                    />
                </BarChart>
            </ChartContainer>
            {/* Tabela podsumowania */}
            <h3 className="text-lg font-bold mt-6">Podsumowanie długów</h3>
            <Table>
                <TableCaption>Podział kosztów między płatnikami</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Płatnik</TableHead>
                        <TableHead className="text-right">
                            Wydatki wspólne
                        </TableHead>
                        <TableHead className="text-right">
                            Wydatki na cudze rzeczy
                        </TableHead>
                        <TableHead className="text-right">
                            Łączna kwota do zwrotu
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {barPersonsData?.shared_expenses.map((row, index) => {
                        const payerName =
                            persons.find((p) => p.id === row.payer)?.name ||
                            "Nieznany";
                        return (
                            <TableRow key={index}>
                                <TableCell>{payerName}</TableCell>
                                <TableCell className="text-right">
                                    {row.expense_sum.toFixed(2)} PLN
                                    <Dialog>
                                        <DialogTrigger
                                            onClick={() =>
                                                setSelectedOutlierReceipts(
                                                    row.top_outlier_receipts
                                                )
                                            }>
                                            <Info className="w-4 h-4 ml-2 inline cursor-pointer text-gray-500" />
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogTitle>
                                                Wydatki wspólne dla {payerName}
                                            </DialogTitle>
                                            {isFetchingReceipts ? (
                                                <Skeleton className="h-12 w-full" />
                                            ) : (
                                                outlierReceiptsData?.map(
                                                    (receipt) => (
                                                        <ReceiptRow
                                                            key={receipt.id}
                                                            receipt={receipt}
                                                        />
                                                    )
                                                )
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                                <TableCell className="text-right">
                                    {barPersonsData?.not_own_expenses[
                                        index
                                    ]?.expense_sum.toFixed(2) || "0.00"}{" "}
                                    PLN
                                    <Dialog>
                                        <DialogTrigger
                                            onClick={() =>
                                                setSelectedOutlierReceipts(
                                                    barPersonsData
                                                        ?.not_own_expenses[
                                                        index
                                                    ]?.top_outlier_receipts ||
                                                        []
                                                )
                                            }>
                                            <Info className="w-4 h-4 ml-2 inline cursor-pointer text-gray-500" />
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogTitle>
                                                Wydatki na cudze rzeczy dla{" "}
                                                {payerName}
                                            </DialogTitle>
                                            {isFetchingReceipts ? (
                                                <Skeleton className="h-12 w-full" />
                                            ) : (
                                                outlierReceiptsData?.map(
                                                    (receipt) => (
                                                        <ReceiptRow
                                                            key={receipt.id}
                                                            receipt={receipt}
                                                        />
                                                    )
                                                )
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                                <TableCell className="text-right text-red-500">
                                    {(
                                        row.expense_sum +
                                        (barPersonsData?.not_own_expenses[index]
                                            ?.expense_sum || 0)
                                    ).toFixed(2)}{" "}
                                    PLN
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default ChartBarPersons;

