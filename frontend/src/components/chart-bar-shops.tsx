import React from "react";
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
import { useGlobalContext } from "@/context/GlobalContext";
import { fetchBarShops } from "@/api/apiService";
import { Info } from "lucide-react";

export type ShopExpense = {
    shop: string;
    expense_sum: number;
};

const chartConfig = {
    bar: {
        label: "Wydatki",
        color: "var(--chart-10)",
    },
} satisfies ChartConfig;

const ChartBarShops: React.FC = () => {
    const { summaryFilters } = useGlobalContext();

    const { data: barShopsData, isLoading } = useQuery<ShopExpense[]>({
        queryKey: [
            "barShopsData",
            summaryFilters.month,
            summaryFilters.year,
            summaryFilters.owners,
            summaryFilters.category,
        ],
        queryFn: async () =>
            await fetchBarShops({
                month: summaryFilters.month,
                year: summaryFilters.year,
                owners: summaryFilters.owners,
                category: summaryFilters.category,
            }),
        enabled: !!summaryFilters.owners && summaryFilters.owners.length > 0,
    });

    if (!summaryFilters.owners || summaryFilters.owners.length === 0) {
        return <div className="w-full text-center">Brak wybranych osób.</div>;
    }
    if (isLoading) return <Skeleton className="h-full w-full" />;
    if (!barShopsData)
        return <div className="w-full text-center">Brak danych</div>;

    // Jeśli liczba sklepów > 15, wyświetlamy top 15, a resztę agregujemy jako "Inne"
    let chartData: ShopExpense[];
    if (barShopsData.length > 15) {
        const top15 = barShopsData.slice(0, 15);
        const othersSum = barShopsData
            .slice(15)
            .reduce((acc, curr) => acc + curr.expense_sum, 0);
        chartData = [...top15, { shop: "Inne", expense_sum: othersSum }];
    } else {
        chartData = barShopsData;
    }

    return (
        <div className="flex flex-col items-center">
            <ChartContainer
                config={chartConfig}
                className="min-h-[500px] h-full">
                <BarChart data={chartData} height={300}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="shop"
                        tickFormatter={(value) =>
                            value.length > 7 ? value.slice(0, 5) + "..." : value
                        }
                    />
                    <YAxis />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => {
                            const key = name as keyof typeof chartConfig;
                            return [
                                chartConfig[key]?.label || name,
                                " ",
                                <strong>{value}</strong>,
                                " zł",
                            ];
                        }}
                    />
                    <Bar
                        dataKey="expense_sum"
                        fill="var(--color-bar)"
                        name={chartConfig.bar.label}
                        radius={6}
                    />
                </BarChart>
            </ChartContainer>
            {summaryFilters.category?.length === 0 && (
                <div className="flex items-center mb-2">
                    <Info className="w-5 h-5 mr-2 text-gray-500" />
                    <p className="text-sm text-gray-500">
                        Domyślnie zaznaczone kategorie przy braku wybranych to:
                        Paliwo, Wydatki Samochód, Fastfood, Alkohol, Picie &
                        Jedzenie, Chemia, Ubrania, Elektronika & Gry, Bilety &
                        Wejściówki, Inne zakupy.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ChartBarShops;

