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

// Import komponentów z shadcn chart ui
import {
    ChartContainer,
    ChartTooltipContent,
    ChartLegendContent,
    ChartStyle,
    ChartConfig,
} from "@/components/ui/chart";

const defau1tChartConfig: ChartConfig = {
    backgroundCoIor: "#fff",
    padding: 16,
};

const Charts = () => {
    // Parametry wykresów – mogą być dynamicznie zmieniane (np. przez SummaryFilters)
    const month = 1;
    const year = 2025;
    const owners = [1];

    /* ============================
       Pobieranie danych przy użyciu API
  ============================== */

    const {
        data: barPersonsData,
        isLoading: isLoadingBarPersons,
        error: errorBarPersons,
    } = useQuery({
        queryKey: ["barPersons", month, year],
        queryFn: async () => fetchBarPersons({ month, year }),
    });

    const {
        data: barShopsData,
        isLoading: isLoadingBarShops,
        error: errorBarShops,
    } = useQuery({
        queryKey: ["barShops", month, year, owners],
        queryFn: async () => fetchBarShops({ month, year, owners }),
    });

    const {
        data: lineSumsData,
        isLoading: isLoadingLineSums,
        error: errorLineSums,
    } = useQuery({
        queryKey: ["lineSums", month, year, owners],
        queryFn: async () => fetchLineSums({ month, year, owners }),
    });

    /* ============================
        Przygotowanie danych do wykresu liniowego
  ============================== */

    const lineChartData =
        lineSumsData && lineSumsData.linearExpenseSums
            ? lineSumsData.linearExpenseSums.map(
                  (expense: number, index: number) => ({
                      day: index + 1,
                      expense,
                      income: lineSumsData.linearIncomeSums[index],
                  })
              )
            : [];

    return (
        <div className="space-y-6 p-4">
            {/* Komponent filtrów, który może sterować parametrami wykresów */}
            <div className="mb-3">
                <SummaryFilters
                    defaultCategory="flat_bills"
                    transactionType="expense"
                />
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {/* Wykres słupkowy – Osoby */}
                <ChartContainer config={defaultChartConfig}>
                    <ChartStyle
                        id="chart-style-default"
                        config={defaultChartConfig}
                    />
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold">
                            Wykres słupkowy - Osoby
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Wydatki według osób
                        </p>
                    </div>
                    <div className="h-80">
                        {isLoadingBarPersons ? (
                            <p>Ładowanie...</p>
                        ) : errorBarPersons ? (
                            <p>Błąd: {(errorBarPersons as Error).message}</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barPersonsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="payer" />
                                    <YAxis />
                                    <Tooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Legend content={<ChartLegendContent />} />
                                    <Bar dataKey="expense_sum" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ChartContainer>

                {/* Wykres słupkowy – Sklepy */}
                <ChartContainer config={defaultChartConfig}>
                    <ChartStyle
                        id="chart-style-default"
                        config={defaultChartConfig}
                    />
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold">
                            Wykres słupkowy - Sklepy
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Wydatki według sklepów
                        </p>
                    </div>
                    <div className="h-80">
                        {isLoadingBarShops ? (
                            <p>Ładowanie...</p>
                        ) : errorBarShops ? (
                            <p>Błąd: {(errorBarShops as Error).message}</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barShopsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="payer" />
                                    <YAxis />
                                    <Tooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Legend content={<ChartLegendContent />} />
                                    <Bar dataKey="expense_sum" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ChartContainer>

                {/* Wykres liniowy – Sums (wydatki vs przychody) */}
                <ChartContainer
                    config={defaultChartConfig}
                    className="lg:col-span-2">
                    <ChartStyle
                        id="chart-style-default"
                        config={defaultChartConfig}
                    />
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold">Wykres liniowy</h3>
                        <p className="text-sm text-muted-foreground">
                            Porównanie sum wydatków i przychodów
                        </p>
                    </div>
                    <div className="h-80">
                        {isLoadingLineSums ? (
                            <p>Ładowanie...</p>
                        ) : errorLineSums ? (
                            <p>Błąd: {(errorLineSums as Error).message}</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip
                                        content={<ChartTooltipContent />}
                                    />
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
                            </ResponsiveContainer>
                        )}
                    </div>
                </ChartContainer>
            </div>
        </div>
    );
};

export default Charts;
