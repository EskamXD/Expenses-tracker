import React from "react";
import SummaryFilters from "@/components/summary-filters";
import { useQuery } from "@tanstack/react-query";

// Import funkcji API
import {
    fetchBarPersons,
    fetchBarShops,
    fetchLineSums,
} from "@/api/apiService";

// Import komponentów Recharts
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from "recharts";
import { Tooltip, Legend } from "recharts";

import {
    ChartContainer,
    ChartTooltipContent,
    ChartLegendContent,
    ChartConfig,
} from "@/components/ui/chart";

import ChartBarPersons from "@/components/chart-bar-persons";

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

const Charts = () => {
    /* ============================
       Pobieranie danych przy użyciu API
  ============================== */

    // const {
    //     data: barShopsData,
    //     isLoading: isLoadingBarShops,
    //     error: errorBarShops,
    // } = useQuery({
    //     queryKey: ["barShops", month, year, owners],
    //     queryFn: async () => fetchBarShops({ month, year, owners }),
    // });

    // const {
    //     data: lineSumsData,
    //     isLoading: isLoadingLineSums,
    //     error: errorLineSums,
    // } = useQuery({
    //     queryKey: ["lineSums", month, year, owners],
    //     queryFn: async () => fetchLineSums({ month, year, owners }),
    // });

    /* ============================
        Przygotowanie danych do wykresu liniowego
  ============================== */

    // const lineChartData =
    //     lineSumsData && lineSumsData.linearExpenseSums
    //         ? lineSumsData.linearExpenseSums.map(
    //               (expense: number, index: number) => ({
    //                   day: index + 1,
    //                   expense,
    //                   income: lineSumsData.linearIncomeSums[index],
    //               })
    //           )
    //         : [];

    return (
        <div className="space-y-6 p-4">
            {/* Komponent filtrów, który może sterować parametrami wykresów */}
            <div className="mb-3">
                <SummaryFilters
                    defaultCategory="flat_bills"
                    transactionType="expense"
                />
            </div>

            <div className="flex flex-col">
                {/* Wykres słupkowy – Osoby */}
                <ChartBarPersons />

                {/* Wykres słupkowy – Sklepy */}
                {/* <ChartContainer config={chartConfig}>
                    <BarChart data={barShopsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="payer" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend content={<ChartLegendContent />} />
                        <Bar dataKey="expense_sum" fill="#82ca9d" />
                    </BarChart>
                </ChartContainer> */}

                {/* Wykres liniowy – Sums (wydatki vs przychody) */}
                {/* <ChartContainer config={chartConfig} className="lg:col-span-2">
                    <LineChart data={lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend content={<ChartLegendContent />} />
                        <Line
                            type="monotone"
                            dataKey="expense"
                            stroke="#8884d8"
                        />
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#82ca9d"
                        />
                    </LineChart>
                </ChartContainer> */}
            </div>
        </div>
    );
};

export default Charts;

