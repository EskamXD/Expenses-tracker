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
        color: "#8884d8",
    },
} satisfies ChartConfig;

const ChartBarShops: React.FC = () => {
    const { summaryFilters } = useGlobalContext();

    // Upewnij się, że został wybrany owner (lub owners) – dla "dla danego ownera"
    if (!summaryFilters.owners || summaryFilters.owners.length === 0) {
        return <div className="w-full text-center">Brak wybranych osób.</div>;
    }

    console.log(summaryFilters.category);
    // Pobieramy dane dla sklepów
    const { data: shopData, isLoading } = useQuery<ShopExpense[]>({
        queryKey: [
            "barShops",
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
        enabled: summaryFilters.owners.length > 0,
    });

    if (isLoading) return <Skeleton className="h-full w-full" />;
    if (!shopData || shopData.length === 0)
        return <div className="w-full text-center">Brak danych</div>;

    // Jeśli liczba sklepów > 15, wyświetlamy top 15, a resztę agregujemy jako "Inne"
    let chartData: ShopExpense[];
    if (shopData.length > 15) {
        const top15 = shopData.slice(0, 15);
        const othersSum = shopData
            .slice(15)
            .reduce((acc, curr) => acc + curr.expense_sum, 0);
        chartData = [...top15, { shop: "Inne", expense_sum: othersSum }];
    } else {
        chartData = shopData;
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
                        content={<ChartTooltipContent />}
                        formatter={(value: number, name: string) => {
                            return [`${name} `, `${value} zł`];
                        }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                        dataKey="expense_sum"
                        fill={chartConfig.bar.color}
                        name={chartConfig.bar.label}
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

