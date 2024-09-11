import React, { useState, useEffect, useCallback } from "react";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Button, Col, Form, Spinner } from "react-bootstrap";
import SummaryListGroup from "./SummaryListGroup";
import {
    fetchLineSums,
    fetchBarPersons,
    fetchBarShops,
    fetchPieCategories,
} from "../api/fetchCharts";
import {
    selectExpensesOptions,
    selectSummaryOptions,
} from "../config/selectOption";
import LoadingChart from "./LoadingChart";

const generateDatesForSelectedMonth = (year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) =>
        new Date(year, month - 1, i + 1).toLocaleDateString("sv-SE")
    );
};

const ChartTab = ({ transactionType }) => {
    const [lineSumsExpenseXAxis, setLineSumsExpenseXAxis] = useState([]);
    const [lineSumsIncomeXAxis, setLineSumsIncomeXAxis] = useState([]);
    const [lineSumsTrendXAxis, setLineSumsTrendXAxis] = useState([]);
    const [barPersonsNamesXAxis, setBarPersonsNamesXAxis] = useState([]);
    const [barPersonsValueSeries, setBarPersonsValueSeries] = useState([]);
    const [barShopsNamesXAxis, setBarShopsNamesXAxis] = useState([]);
    const [barShopsValueSeries, setBarShopsValueSeries] = useState([]);
    const [pieCategoriesValueSeries, setPieCategoriesValueSeries] = useState(
        []
    );

    const [selectedOwner, setSelectedOwner] = useState("-");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedCategories, setSelectedCategories] = useState([
        "food_drinks",
    ]);
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
        return Array.from({ length: monthDaysCount }, (_, i) =>
            parseFloat(maxDailySpendings * (i + 1)).toFixed(2)
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

            const { linearExpenseSums, linearIncomeSums } = await fetchLineSums(
                selectedOwner,
                selectedMonth,
                selectedYear
            );
            const fetchedBarPersons = await fetchBarPersons(
                selectedMonth,
                selectedYear,
                selectedCategories
            );
            const fetchedBarShops = await fetchBarShops(
                selectedOwner,
                selectedMonth,
                selectedYear
            );
            const fetchedPieCategories = await fetchPieCategories(
                selectedOwner,
                selectedMonth,
                selectedYear
            );

            setLineSumsExpenseXAxis(linearExpenseSums);
            setLineSumsIncomeXAxis(linearIncomeSums);
            let tempArray = [];
            setLineSumsTrendXAxis(
                tempArray.fill(0, 0, linearExpenseSums.length)
            );
            setBarPersonsNamesXAxis(
                fetchedBarPersons.map(
                    (person) => selectSummaryOptions[person.payer]
                )
            );
            setBarPersonsValueSeries(
                fetchedBarPersons.map((person) =>
                    parseFloat(person.expense_sum).toFixed(2)
                )
            );
            setBarShopsNamesXAxis(fetchedBarShops.map((shop) => shop.shop));
            setBarShopsValueSeries(
                fetchedBarShops.map((shop) =>
                    parseFloat(shop.expense_sum).toFixed(2)
                )
            );

            setPieCategoriesValueSeries(
                fetchedPieCategories.map((category, index) => ({
                    id: index + 1,
                    value: category.expense_sum,
                    label:
                        selectExpensesOptions[
                            category.transactions__category
                        ] || category.transactions__category,
                }))
            );

            setItemsLoaded(true);
        } catch (error) {
            console.error("Error fetching monthly transactions:", error);
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
        if (selectedOwner !== "-") {
            fetchData();
        }
    }, [selectedOwner, selectedMonth, selectedYear]);

    useEffect(() => {
        if (itemsLoaded) {
            setLineSumsTrendXAxis(trendLine());
        }
    }, [itemsLoaded, lineSumsIncomeXAxis]);

    const theme = createTheme({
        palette: { mode: "dark", scheme: "mangoFusionPalette" },
    });

    const handleBarChartCategoryChange = (category) => {
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
                    {selectedOwner !== "-" && (
                        <ThemeProvider theme={theme}>
                            <LoadingChart
                                isLoading={loading.lineSumsChart}
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
                                                color: "white",
                                            },
                                        ]}
                                        series={[
                                            {
                                                data: lineSumsExpenseXAxis,
                                                label: "Wydatki",
                                            },
                                            {
                                                data: lineSumsIncomeXAxis,
                                                label: "Przychody",
                                            },
                                            {
                                                data: lineSumsTrendXAxis,
                                                label: "Linia trendu",
                                            },
                                        ]}
                                        height={500}
                                        grid={{
                                            vertical: true,
                                            horizontal: true,
                                        }}
                                    />
                                }
                            />
                            <div
                                className="d-flex full-w align-items-center"
                                style={{
                                    alignSelf: "flex-end",
                                    minHeight: "500px",
                                }}>
                                <LoadingChart
                                    isLoading={loading.barShopsChart}
                                    chartComponent={
                                        <BarChart
                                            xAxis={[
                                                {
                                                    scaleType: "band",
                                                    data: barShopsNamesXAxis,
                                                },
                                            ]}
                                            series={[
                                                { data: barShopsValueSeries },
                                            ]}
                                            height={500}
                                            grid={{
                                                vertical: true,
                                                horizontal: true,
                                            }}
                                        />
                                    }
                                />
                            </div>
                            <div className="d-flex full-w align-items-center">
                                <Col>
                                    <LoadingChart
                                        isLoading={loading.barPersonsChart}
                                        chartComponent={
                                            <BarChart
                                                xAxis={[
                                                    {
                                                        scaleType: "band",
                                                        data: barPersonsNamesXAxis,
                                                    },
                                                ]}
                                                series={[
                                                    {
                                                        data: barPersonsValueSeries,
                                                    },
                                                ]}
                                                height={500}
                                                width={400}
                                                grid={{
                                                    vertical: true,
                                                    horizontal: true,
                                                }}
                                            />
                                        }
                                    />
                                </Col>
                                <Col>
                                    {selectExpensesOptions.map((type) => (
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
                                    ))}
                                    <Button
                                        variant="primary"
                                        onClick={fetchData}>
                                        Aktualizuj wykres
                                    </Button>
                                </Col>
                            </div>
                            <div className="d-flex full-w align-items-center">
                                <LoadingChart
                                    isLoading={loading.pieCategoriesChart}
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
                                        />
                                    }
                                />
                            </div>
                        </ThemeProvider>
                    )}
                </div>
            </Col>
        </div>
    );
};

export default ChartTab;
