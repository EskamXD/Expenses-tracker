import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, XAxis, CartesianGrid } from "recharts";
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
import { fetchLineSums } from "@/api/apiService";
import "@/index.css";

export type PersonLinesResponse = {
    day: string;
    expense: number;
    income: number;
}[];

const chartConfig = {
    expense: {
        label: "Wydatki",
        color: "var(--chart-1)",
    },
    income: {
        label: "Przychody",
        color: "var(--chart-10)",
    },
} satisfies ChartConfig;

const ChartLinesPerson: React.FC = () => {
    const { summaryFilters } = useGlobalContext();
    console.log(summaryFilters, !!summaryFilters.owners);

    const { data: lineSumsData, isLoading: isLoadingLineSums } =
        useQuery<PersonLinesResponse>({
            queryKey: [
                "lineSums",
                summaryFilters.month,
                summaryFilters.year,
                summaryFilters.owners,
            ],
            queryFn: async () =>
                await fetchLineSums({
                    month: summaryFilters.month,
                    year: summaryFilters.year,
                    owners: summaryFilters.owners,
                }),
            enabled:
                !!summaryFilters.owners && summaryFilters.owners.length > 0,
        });

    if (!summaryFilters.owners || summaryFilters.owners.length === 0)
        return <div className="w-full text-center">Brak wybranych osób.</div>;
    if (isLoadingLineSums) return <Skeleton className="h-full w-full" />;
    if (!lineSumsData)
        return <div className="w-full text-center">Brak danych</div>;

    return (
        <div className="flex flex-col items-center w-full">
            <ChartContainer
                config={chartConfig}
                className="min-h-[100px] max-w-dvh w-full">
                <AreaChart
                    accessibilityLayer
                    data={lineSumsData}
                    margin={{
                        left: 12,
                        right: 12,
                    }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(5, 10)}
                    />
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

                    <ChartLegend content={<ChartLegendContent />} />
                    <defs>
                        <linearGradient
                            id="fillExpense"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--color-expense)"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--ccolor-expense)"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                        <linearGradient
                            id="fillIncome"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--chart-10)"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--chart-10)"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    </defs>
                    <Area
                        dataKey="income"
                        type="natural"
                        fill="url(#fillIncome)"
                        fillOpacity={0.4}
                        stroke="var(--chart-10)"
                        stackId="a"
                    />
                    <Area
                        dataKey="expense"
                        type="natural"
                        fill="url(#fillExpense)"
                        fillOpacity={0.4}
                        stroke="var(--color-expense)"
                        stackId="b"
                    />
                </AreaChart>
            </ChartContainer>
        </div>
    );
};

export default ChartLinesPerson;
