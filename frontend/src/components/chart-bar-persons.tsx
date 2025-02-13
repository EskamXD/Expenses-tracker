import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
    ChartContainer,
    ChartConfig,
    ChartTooltipContent,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

import { useGlobalContext } from "@/context/GlobalContext";
import { Params, Receipt } from "@/types";
import { fetchBarPersons, fetchGetReceiptsByID } from "@/api/apiService";
import { ReceiptRow } from "@/components/ui/receipt-row";

export type ChartBarPersonsResponse = {
    shared_expenses: {
        payer: number;
        expense_sum: number;
        receipt_ids: number[];
    }[];
    not_own_expenses: {
        payer: number;
        expense_sum: number;
        receipt_ids: number[];
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
    const [selectedReceipts, setSelectedReceipts] = useState<number[] | null>(
        null
    );

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

    const chartData = barPersonsData
        ? barPersonsData.shared_expenses.map((shared) => {
              const notOwnExpense = barPersonsData.not_own_expenses.find(
                  (n) => n.payer === shared.payer
              );
              const payer = persons.find(
                  (person) => person.id === shared.payer
              );
              const payerName = payer ? payer.name : "Nieznany";

              return {
                  payer: payerName,
                  shared_expense: shared.expense_sum,
                  not_own_expense: notOwnExpense
                      ? notOwnExpense.expense_sum
                      : 0,
                  receipt_ids: [
                      ...shared.receipt_ids,
                      ...(notOwnExpense?.receipt_ids || []),
                  ],
              };
          })
        : [];

    const { data: receiptsData } = useQuery<Receipt[]>({
        queryKey: ["receipts", selectedReceipts],
        queryFn: async () => {
            if (!selectedReceipts || selectedReceipts.length === 0) return [];
            return await fetchGetReceiptsByID({ id: selectedReceipts });
        },
        enabled: !!selectedReceipts && selectedReceipts.length > 0,
    });

    const groupedReceipts: Record<string, Receipt[]> = receiptsData
        ? receiptsData.reduce((acc, receipt) => {
              if (!acc[receipt.payment_date]) acc[receipt.payment_date] = [];
              acc[receipt.payment_date].push(receipt);
              return acc;
          }, {} as Record<string, Receipt[]>)
        : {};

    if (isLoadingBarPersons) return <Skeleton className="h-[300px] w-full" />;

    return (
        <div className="flex flex-col items-center">
            <ChartContainer config={chartConfig} className="min-h-[300px]">
                <BarChart data={chartData} width={600} height={300}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="payer" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend content={<ChartLegendContent />} />
                    <Bar
                        dataKey="shared_expense"
                        fill="#8884d8"
                        name="Wydatki wspólne"
                    />
                    <Bar
                        dataKey="not_own_expense"
                        fill="#82ca9d"
                        name="Wydatki nie moje"
                    />
                </BarChart>
            </ChartContainer>

            <Button
                className="mt-2"
                onClick={() =>
                    setSelectedReceipts(chartData.flatMap((d) => d.receipt_ids))
                }>
                Pokaż paragony
            </Button>

            {receiptsData && (
                <div className="mt-4 w-full p-4 border rounded">
                    <h3 className="text-lg font-bold">Paragony</h3>
                    <Accordion type="multiple">
                        {Object.entries(groupedReceipts).map(
                            ([date, receipts]) => (
                                <AccordionItem key={date} value={date}>
                                    <AccordionTrigger>{date}</AccordionTrigger>
                                    <AccordionContent>
                                        {receipts.map((receipt) => (
                                            <ReceiptRow
                                                key={receipt.id}
                                                receipt={receipt}
                                            />
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        )}
                    </Accordion>
                </div>
            )}
        </div>
    );
};

export default ChartBarPersons;

