import React from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
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

interface OwnerData {
    expense: number[];
    income: number[];
}

export type PersonLinesResponse = Record<string, OwnerData>;

// Typ dla danych wykresu przy wielu właścicielach
interface DayData {
    day: number;
    [key: string]: number;
}

// Konfiguracja wykresu – z kluczami "expense" i "income"
const chartConfig = {
    expense: {
        label: "Wydatki",
        color: "#8884d8",
    },
    income: {
        label: "Przychody",
        color: "#82ca9d",
    },
} satisfies ChartConfig;

// Paleta kolorów – przydzielana kolejno właścicielom
const colorPalette = [
    "#8884d8",
    "#82ca9d",
    "#ff7300",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
];

const ChartLinesPerson: React.FC = () => {
    const { summaryFilters, persons } = useGlobalContext();

    if (!summaryFilters.owners || summaryFilters.owners.length === 0)
        return <div className="w-full text-center">Brak wybranych osób.</div>;

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
            enabled: summaryFilters.owners.length > 0,
        });

    if (isLoadingLineSums) return <Skeleton className="h-full w-full" />;
    if (!lineSumsData)
        return <div className="w-full text-center">Brak danych</div>;

    // Pobieramy listę ownerów z kluczy zwróconego obiektu
    const ownerIds = Object.keys(lineSumsData);
    // Zakładamy, że wszystkie tablice mają tę samą długość (np. liczbę dni w miesiącu)
    const numDays = lineSumsData[ownerIds[0]].expense.length;

    // Tworzymy dane wykresu – każdy obiekt reprezentuje jeden dzień
    const lineChartData: DayData[] = Array.from(
        { length: numDays },
        (_, i: number) => {
            const dayObj: DayData = { day: i + 1 };
            ownerIds.forEach((owner: string) => {
                dayObj[`expense_${owner}`] = lineSumsData[owner].expense[i];
                dayObj[`income_${owner}`] = lineSumsData[owner].income[i];
            });
            return dayObj;
        }
    );

    // Renderujemy linie dla każdego właściciela – etykiety zawierają imię właściciela
    const linesToRender: React.ReactNode[] = ownerIds.flatMap(
        (owner: string, index: number) => {
            // Znajdź obiekt osoby po id (konwertujemy klucz na liczbę)
            const ownerObj = persons.find(
                (person) => person.id === Number(owner)
            );
            const ownerName = ownerObj ? ownerObj.name : `Owner ${owner}`;
            const expenseColor =
                colorPalette[(index * 2) % colorPalette.length];
            const incomeColor =
                colorPalette[(index * 2 + 1) % colorPalette.length];
            return [
                <Line
                    key={`expense_${owner}`}
                    type="monotone"
                    dataKey={`expense_${owner}`}
                    stroke={expenseColor}
                    name={`Wydatki ${ownerName}`}
                    dot={false}
                />,
                <Line
                    key={`income_${owner}`}
                    type="monotone"
                    dataKey={`income_${owner}`}
                    stroke={incomeColor}
                    name={`Przychody ${ownerName}`}
                    dot={false}
                />,
            ];
        }
    );

    return (
        <div className="flex flex-col items-center">
            <ChartContainer
                config={chartConfig}
                className="min-h-[500px] h-full">
                <LineChart data={lineChartData} height={300}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value: number, name: string) => {
                            return [`${name} `, `${value} zł`];
                        }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    {linesToRender}
                </LineChart>
            </ChartContainer>
        </div>
    );
};

export default ChartLinesPerson;

