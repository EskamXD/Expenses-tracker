import { useEffect, useMemo, useState } from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartStyle,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import { fetchPieCategories } from "@/api/apiService";
import "@/index.css";

interface PieCategoryResponse {
    category: string;
    expense_sum: number;
}

const chartConfig = {
    category: {
        label: "Kategoria",
    },
    fuel: { label: "Paliwo", color: "var(--chart-mono-1)" },
    car_expenses: {
        label: "Wydatki na samochód",
        color: "var(--chart-mono-2)",
    },
    fastfood: { label: "Fast Food", color: "var(--chart-mono-3)" },
    alcohol: { label: "Alkohol", color: "var(--chart-mono-4)" },
    food_drinks: { label: "Picie & jedzenie", color: "var(--chart-mono-5)" },
    chemistry: { label: "Chemia", color: "var(--chart-mono-6)" },
    clothes: { label: "Ubrania", color: "var(--chart-mono-7)" },
    electronics_games: {
        label: "Elektronika & gry",
        color: "var(--chart-mono-8)",
    },
    tickets_entrance: {
        label: "Bilety & wejściówki",
        color: "var(--chart-mono-9)",
    },
    delivery: { label: "Dostawa", color: "var(--chart-mono-10)" },
    other_shopping: { label: "Inne zakupy", color: "var(--chart-mono-11)" },
    flat_bills: {
        label: "Rachunki za mieszkanie",
        color: "var(--chart-mono-12)",
    },
    monthly_subscriptions: {
        label: "Miesięczne subskrypcje",
        color: "var(--chart-mono-13)",
    },
    other_cyclical_expenses: {
        label: "Inne cykliczne wydatki",
        color: "var(--chart-mono-14)",
    },
    investments_savings: {
        label: "Inwestycje & oszczędności",
        color: "var(--chart-mono-15)",
    },
    other: { label: "Inne", color: "var(--chart-mono-16)" },
    for_study: { label: "Na studia", color: "var(--chart-mono-1)" },
    work_income: { label: "Przychód praca", color: "var(--chart-mono-2)" },
    family_income: { label: "Przychód rodzina", color: "var(--chart-mono-3)" },
    investments_income: {
        label: "Inwestycje, lokaty & oszczędności",
        color: "var(--chart-mono-4)",
    },
    money_back: { label: "Zwrot", color: "var(--chart-mono-5)" },
    last_month_balance: {
        label: "Z poprzedniego miesiąca",
        color: "var(--chart-mono-6)",
    },
} satisfies ChartConfig;

export default function ChartPieCategoriesComponent() {
    const { summaryFilters } = useGlobalContext();

    const {
        data: pieCategoryData,
        isLoading,
        isError,
    } = useQuery<PieCategoryResponse[]>({
        queryKey: [
            "pieCategoryData",
            summaryFilters.month,
            summaryFilters.year,
            summaryFilters.owners,
            summaryFilters.transactionType,
            summaryFilters.period,
        ],
        queryFn: async () =>
            await fetchPieCategories({
                month: summaryFilters.month,
                year: summaryFilters.year,
                owners: summaryFilters.owners,
                transactionType: summaryFilters.transactionType,
                period: summaryFilters.period,
            }),
        enabled: !!summaryFilters.owners && summaryFilters.owners.length > 0,
    });

    const [activeCategory, setActiveCategory] = useState<string>("");

    useEffect(() => {
        if (!pieCategoryData || pieCategoryData.length === 0) {
            setActiveCategory("");
            return;
        }

        const activeCategoryExists = pieCategoryData.some(
            (item) => item.category === activeCategory,
        );

        if (!activeCategoryExists) {
            setActiveCategory(pieCategoryData[0].category);
        }
    }, [pieCategoryData, activeCategory]);

    const activeIndex = useMemo(() => {
        if (!pieCategoryData) return -1;

        return pieCategoryData.findIndex(
            (item) => item.category === activeCategory,
        );
    }, [activeCategory, pieCategoryData]);

    const activeData = useMemo(() => {
        if (!pieCategoryData || activeIndex < 0) return null;

        return pieCategoryData[activeIndex];
    }, [pieCategoryData, activeIndex]);

    const categories = useMemo(() => {
        return pieCategoryData
            ? pieCategoryData.map((item) => item.category)
            : [];
    }, [pieCategoryData]);

    if (!summaryFilters.owners || summaryFilters.owners.length === 0) {
        return <div className="w-full text-center">Brak wybranych osób.</div>;
    }

    if (isLoading) {
        return <Skeleton className="h-full w-full" />;
    }

    if (isError) {
        return (
            <div className="w-full text-center text-red-500">
                Błąd pobierania danych.
            </div>
        );
    }

    if (!pieCategoryData || pieCategoryData.length === 0) {
        return <div className="w-full text-center">Brak danych</div>;
    }

    const id = "pie-interactive";

    const renderPieShape = (props: PieSectorDataItem) => {
        const { outerRadius = 0, payload } = props;

        const payloadCategory = (payload as PieCategoryResponse | undefined)
            ?.category;

        const isActive = payloadCategory === activeCategory;

        if (!isActive) {
            return <Sector {...props} outerRadius={outerRadius} />;
        }

        return (
            <g>
                <Sector {...props} outerRadius={outerRadius + 10} />
                <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                />
            </g>
        );
    };

    return (
        <Card data-chart={id} className="flex flex-col h-full lg:h-220">
            <ChartStyle id={id} config={chartConfig} />

            <CardHeader className="flex-row items-start space-y-0 pb-0">
                <Select
                    value={activeCategory}
                    onValueChange={setActiveCategory}>
                    <SelectTrigger
                        className="ml-auto h-7 min-w-[130px] max-w-fit rounded-lg pl-2.5"
                        aria-label="Wybierz kategorię">
                        <SelectValue placeholder="Wybierz kategorię" />
                    </SelectTrigger>

                    <SelectContent align="end" className="rounded-xl">
                        {categories.map((key) => {
                            const config =
                                chartConfig[key as keyof typeof chartConfig];

                            if (!config) return null;

                            return (
                                <SelectItem
                                    key={key}
                                    value={key}
                                    className="rounded-lg [&_span]:flex">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span
                                            className="flex h-3 w-3 shrink-0 rounded-sm"
                                            style={{
                                                backgroundColor: `var(--color-${key})`,
                                            }}
                                        />
                                        {config.label}
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent className="flex flex-1 justify-center pb-0">
                <ChartContainer
                    id={id}
                    config={chartConfig}
                    className="min-h-[100px] max-w-dvh w-full">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                            formatter={(value, name) => {
                                const key = name as keyof typeof chartConfig;

                                return [
                                    chartConfig[key]?.label || name,
                                    " ",
                                    <strong key="value">{value}</strong>,
                                    " zł",
                                ];
                            }}
                        />

                        <Pie
                            data={pieCategoryData}
                            dataKey="expense_sum"
                            nameKey="category"
                            innerRadius={120}
                            strokeWidth={5}
                            shape={renderPieShape}
                            onMouseEnter={(_, index) => {
                                const category =
                                    pieCategoryData[index]?.category;

                                if (category) {
                                    setActiveCategory(category);
                                }
                            }}
                            onClick={(_, index) => {
                                const category =
                                    pieCategoryData[index]?.category;

                                if (category) {
                                    setActiveCategory(category);
                                }
                            }}>
                            <Label
                                content={({ viewBox }) => {
                                    if (
                                        !viewBox ||
                                        !("cx" in viewBox) ||
                                        !("cy" in viewBox) ||
                                        !activeData
                                    ) {
                                        return null;
                                    }

                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle">
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className="fill-foreground text-3xl font-bold">
                                                {activeData.expense_sum.toLocaleString(
                                                    "pl-PL",
                                                )}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) + 24}
                                                className="fill-muted-foreground">
                                                zł
                                            </tspan>
                                        </text>
                                    );
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
