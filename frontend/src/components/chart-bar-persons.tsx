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
import ChartBarPersonsTable from "@/components/chart-bar-persons-table";
import { useGlobalContext } from "@/context/GlobalContext";
import { fetchBarPersons } from "@/api/apiService";

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

const chartConfig = {
    shared_expense: {
        label: "Wydatki wspólne",
        color: "var(--chart-10)",
    },
    not_own_expense: {
        label: "Wydatki na cudze rzeczy",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

const ChartBarPersons = () => {
    const { persons, summaryFilters } = useGlobalContext();

    const { data: barPersonsData, isLoading } = useQuery<TBarPersons>({
        queryKey: ["barPersonsData", summaryFilters.month, summaryFilters.year],
        queryFn: async () => {
            return await fetchBarPersons({
                month: summaryFilters.month,
                year: summaryFilters.year,
                owners: summaryFilters.owners,
            });
        },
        enabled: !!summaryFilters.owners && summaryFilters.owners.length > 0,
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

    if (!summaryFilters.owners || summaryFilters.owners.length === 0) {
        return <div className="w-full text-center">Brak wybranych osób.</div>;
    }
    if (isLoading) return <Skeleton className="h-full w-full" />;
    if (
        !barPersonsData ||
        barPersonsData.shared_expenses.length === 0 ||
        barPersonsData.not_own_expenses.length === 0
    )
        return <div className="w-full text-center">Brak danych</div>;

    return (
        <div className="flex flex-col items-center">
            {/* Wykres */}
            <ChartContainer config={chartConfig} className="min-h-[300px]">
                <BarChart data={debtData} width={600} height={300}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="payer" />
                    <YAxis />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => {
                            const key = name as keyof typeof chartConfig;
                            return [
                                chartConfig[key]?.label || name,
                                <strong>{value}</strong>,
                                "zł",
                            ];
                        }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                        dataKey="shared_expense"
                        fill="var(--color-shared_expense)"
                        name={chartConfig.shared_expense.label}
                        radius={4}
                    />
                    <Bar
                        dataKey="not_own_expense"
                        fill="var(--color-not_own_expense)"
                        name={chartConfig.not_own_expense.label}
                        radius={4}
                    />
                </BarChart>
            </ChartContainer>
            {/* Tabela podsumowania */}
            <h3 className="text-lg font-bold mt-6">Podsumowanie długów</h3>
            <ChartBarPersonsTable barPersonsData={barPersonsData} />
        </div>
    );
};

export default ChartBarPersons;

