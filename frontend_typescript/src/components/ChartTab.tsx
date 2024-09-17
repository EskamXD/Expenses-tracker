import { useState, useEffect, useCallback } from "react";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { mangoFusionPalette } from "@mui/x-charts/colorPalettes";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import SummaryListGroup from "./SummaryListGroup";
import {
    fetchBarPersons,
    fetchBarShops,
    fetchLineSums,
    fetchPieCategories,
} from "../services/apiService";

import {
    selectExpensesOptions,
    selectPersonOptions,
} from "../config/selectOption";
import LoadingChart from "./LoadingChart";
import { Params } from "../types";

interface SelectOptionsInterface {
    value: string;
    label: string;
}

interface PersonBarInterface {
    payer: number;
    expense_sum: number;
}

interface ShopBarInterface {
    shop: string;
    expense_sum: number;
}

const generateDatesForSelectedMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) =>
        new Date(year, month - 1, i + 1).toLocaleDateString("sv-SE")
    );
};

const trimShops = (
    shopBars: ShopBarInterface[]
): { trimmedShops: ShopBarInterface[]; otherShops: ShopBarInterface[] } => {
    /* Chceck lenght and if > 20 trim to 20, rest shops add to new "other" category */
    if (shopBars.length > 19) {
        const trimmedShops = shopBars.slice(0, 19);
        const otherShops = shopBars.slice(19);
        const otherSum = otherShops.reduce(
            (acc, shop) => acc + shop.expense_sum,
            0
        );
        trimmedShops.push({ shop: "Inne", expense_sum: otherSum });
        return { trimmedShops, otherShops };
    } else {
        // Jeśli długość jest <= 20, zwracamy oryginalną tablicę i pustą tablicę
        return { trimmedShops: shopBars, otherShops: [] };
    }
};

const ChartTab = () => {
    const [lineSumsExpenseXAxis, setLineSumsExpenseXAxis] = useState<number[]>([]); // prettier-ignore
    const [lineSumsIncomeXAxis, setLineSumsIncomeXAxis] = useState<number[]>([]); // prettier-ignore
    const [lineSumsTrendXAxis, setLineSumsTrendXAxis] = useState<number[]>([]); // prettier-ignore
    const [barPersonsNamesXAxis, setBarPersonsNamesXAxis] = useState<string[]>([]); // prettier-ignore
    const [barPersonsValueSeries, setBarPersonsValueSeries] = useState<number[]>([]); // prettier-ignore
    const [barShopsNamesXAxis, setBarShopsNamesXAxis] = useState<string[]>([]); // prettier-ignore
    const [barShopsValueSeries, setBarShopsValueSeries] = useState<number[]>([]); // prettier-ignore
    const [pieCategoriesValueSeries, setPieCategoriesValueSeries] = useState<number[]>([]); // prettier-ignore

    const [selectedOwner, setSelectedOwner] = useState(-1); // prettier-ignore
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // prettier-ignore
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // prettier-ignore
    const [selectedCategories, setSelectedCategories] = useState(["food_drinks",]); // prettier-ignore
    const [loading, setLoading] = useState({
        lineSumsChart: false,
        barPersonsChart: false,
        barShopsChart: false,
        pieCategoriesChart: false,
    });

    const [itemsLoaded, setItemsLoaded] = useState(false);

    const trendLine = () => {
        const monthDaysCount = new Date(
            selectedYear,
            selectedMonth,
            0
        ).getDate();
        const maxDailySpendings =
            Math.max(...lineSumsIncomeXAxis) / monthDaysCount;
        return Array.from(
            { length: monthDaysCount },
            (_, i) => maxDailySpendings * (i + 1)
        );
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading({
                lineSumsChart: true,
                barPersonsChart: true,
                barShopsChart: true,
                pieCategoriesChart: true,
            });

            const params = {
                owner: selectedOwner,
                month: selectedMonth,
                year: selectedYear,
                category: selectedCategories,
            } as Params;

            const { linearExpenseSums, linearIncomeSums } = await fetchLineSums(
                params
            );
            const fetchedBarPersons = await fetchBarPersons(params);
            const fetchedBarShops = await fetchBarShops(params);
            const { trimmedShops, otherShops } = trimShops(fetchedBarShops);
            // const fetchedPieCategories = await fetchPieCategories(
            //     params
            // );

            setLineSumsExpenseXAxis(linearExpenseSums);
            setLineSumsIncomeXAxis(linearIncomeSums);
            let tempArray = [] as number[];
            setLineSumsTrendXAxis(
                tempArray.fill(0, 0, linearExpenseSums.length)
            );
            setBarPersonsNamesXAxis(
                fetchedBarPersons.map(
                    (personBar: PersonBarInterface) =>
                        selectPersonOptions[personBar.payer]
                )
            );
            setBarPersonsValueSeries(
                fetchedBarPersons.map(
                    (personBar: PersonBarInterface) => personBar.expense_sum
                )
            );
            setBarShopsNamesXAxis(
                trimmedShops.map((shopBar: ShopBarInterface) => shopBar.shop)
            );
            setBarShopsValueSeries(
                trimmedShops.map(
                    (shopBar: ShopBarInterface) => shopBar.expense_sum
                )
            );

            // setPieCategoriesValueSeries(
            //     fetchedPieCategories.map((category, index) => ({
            //         id: index + 1,
            //         value: category.expense_sum,
            //         label:
            //             selectExpensesOptions[category.items__category] ||
            //             category.items__category,
            //     }))
            // );

            setLineSumsTrendXAxis(trendLine());

            setItemsLoaded(true);
        } catch (error) {
            console.error("Error fetching monthly :", error);
        } finally {
            setLoading({
                lineSumsChart: false,
                barPersonsChart: false,
                barShopsChart: false,
                pieCategoriesChart: false,
            });
        }
    }, [selectedOwner, selectedMonth, selectedYear, selectedCategories]);

    useEffect(() => {
        if (selectedOwner !== -1) {
            fetchData();
        }
    }, [selectedOwner, selectedMonth, selectedYear]);

    const theme = createTheme({
        palette: { mode: "dark" },
    });

    const lineSumsParams = {
        series: [
            {
                label: "Wydatki",
                data: lineSumsExpenseXAxis,
                showMark: false,
            },
            {
                label: "Przychody",
                data: lineSumsIncomeXAxis,
                showMark: false,
            },
            {
                label: "Linia trendu",
                data: lineSumsTrendXAxis,
                showMark: false,
            },
        ],
    };

    const barPersonsParams = {
        series: [
            {
                data: barPersonsValueSeries,
            },
        ],
    };

    const barShopsParams = {
        series: [
            {
                data: barShopsValueSeries,
            },
        ],
    };

    const currencyFormatter = new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency: "PLN",
    }).format;

    const handleBarChartCategoryChange = (category: string) => {
        setSelectedCategories((prevSelected) => {
            if (prevSelected.includes(category)) {
                return prevSelected.filter((c) => c !== category);
            } else {
                return [...prevSelected, category];
            }
        });
    };

    return (
        <div className="center-div-top">
            <Col className="pt-1rem" style={{ margin: "0", width: "100%" }}>
                <SummaryListGroup
                    selectedOwner={selectedOwner}
                    setSelectedOwner={setSelectedOwner}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    itemsLoaded={itemsLoaded}
                />
                <div className="center-div d-flex flex-column">
                    {selectedOwner !== -1 && (
                        <ThemeProvider theme={theme}>
                            <LoadingChart
                                isLoading={!itemsLoaded}
                                chartComponent={
                                    <LineChart
                                        xAxis={[
                                            {
                                                scaleType: "point",
                                                data: generateDatesForSelectedMonth(
                                                    selectedYear,
                                                    selectedMonth
                                                ),
                                                label: "Data",
                                            },
                                        ]}
                                        series={lineSumsParams.series.map(
                                            (series) => ({
                                                ...series,
                                                valueFormatter: (v) =>
                                                    v === null
                                                        ? ""
                                                        : currencyFormatter(v),
                                            })
                                        )}
                                        height={500}
                                        grid={{
                                            vertical: true,
                                            horizontal: true,
                                        }}
                                        colors={mangoFusionPalette}
                                    />
                                }
                            />
                            <div
                                className="d-flex full-w align-items-center mb-3"
                                style={{
                                    alignSelf: "flex-end",
                                    minHeight: "550px",
                                }}>
                                <LoadingChart
                                    isLoading={!itemsLoaded}
                                    chartComponent={
                                        <BarChart
                                            yAxis={[
                                                {
                                                    label: "Koszty (zł)",
                                                    labelStyle: {
                                                        fontSize: "1.2rem",
                                                    },
                                                },
                                            ]}
                                            sx={{
                                                [`.${axisClasses.left} .${axisClasses.label}`]:
                                                    {
                                                        // Move the y-axis label with CSS
                                                        transform:
                                                            "translateX(-15px)",
                                                    },
                                            }}
                                            xAxis={[
                                                {
                                                    scaleType: "band",
                                                    data: barShopsNamesXAxis,
                                                    tickLabelStyle: {
                                                        angle: -45,
                                                        textAnchor: "end",
                                                    },
                                                    label: "Sklepy",
                                                    labelStyle: {
                                                        transform:
                                                            "translateY(70px)",
                                                        fontSize: "1.2rem",
                                                    },
                                                },
                                            ]}
                                            series={barShopsParams.series.map(
                                                (series) => ({
                                                    ...series,
                                                    valueFormatter: (v) =>
                                                        v === null
                                                            ? ""
                                                            : currencyFormatter(
                                                                  v
                                                              ),
                                                })
                                            )}
                                            height={500}
                                            grid={{
                                                vertical: true,
                                                horizontal: true,
                                            }}
                                            colors={mangoFusionPalette}
                                            tooltip={{ trigger: "axis" }}
                                            margin={{ left: 100, bottom: 130 }}
                                        />
                                    }
                                />
                            </div>
                            <div className="d-flex full-w align-items-center">
                                <Col>
                                    <LoadingChart
                                        isLoading={!itemsLoaded}
                                        chartComponent={
                                            <BarChart
                                                xAxis={[
                                                    {
                                                        scaleType: "band",
                                                        data: barPersonsNamesXAxis,
                                                    },
                                                ]}
                                                series={barPersonsParams.series.map(
                                                    (series) => ({
                                                        ...series,
                                                        valueFormatter: (v) =>
                                                            v === null
                                                                ? ""
                                                                : currencyFormatter(
                                                                      v
                                                                  ),
                                                    })
                                                )}
                                                height={500}
                                                width={400}
                                                grid={{
                                                    vertical: true,
                                                    horizontal: true,
                                                }}
                                                colors={mangoFusionPalette}
                                            />
                                        }
                                    />
                                </Col>
                                <Col>
                                    <div
                                        className="mb-3"
                                        style={{ width: "fit-content" }}>
                                        {selectExpensesOptions.map(
                                            (type: SelectOptionsInterface) => (
                                                <Form.Check // prettier-ignore
                                                    type="checkbox"
                                                    key={type.value}
                                                    id={type.value}
                                                    label={type.label}
                                                    onChange={() =>
                                                        handleBarChartCategoryChange(
                                                            type.value
                                                        )
                                                    }
                                                    checked={selectedCategories.includes(
                                                        type.value
                                                    )}
                                                />
                                            )
                                        )}
                                    </div>
                                    <Button
                                        variant="primary"
                                        onClick={fetchData}
                                        style={{ width: "100%" }}>
                                        Aktualizuj wykres
                                    </Button>
                                </Col>
                            </div>
                            <div className="d-flex full-w align-items-center">
                                {/* <LoadingChart
                                    isLoading={!itemsLoaded}
                                    chartComponent={
                                        <PieChart
                                            series={[
                                                {
                                                    data: pieCategoriesValueSeries,
                                                },
                                            ]}
                                            height={500}
                                            grid={{
                                                vertical: true,
                                                horizontal: true,
                                            }}
                                            colors={mangoFusionPalette}
                                            highlightedItem={highlightedItem}
                                            onHighlightChange={setHighLightedItem}
                                        />
                                    }
                                /> */}
                            </div>
                        </ThemeProvider>
                    )}
                </div>
            </Col>
        </div>
    );
};

export default ChartTab;
