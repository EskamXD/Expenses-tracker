/**
 * @file ChartTab.jsx
 * @brief React component to display a line chart of monthly expenses and incomes.
 *
 * This component fetches the monthly transactions (expenses and incomes) for a selected owner, month, and year.
 * It displays a line chart summarizing the cumulative daily expenses and incomes over the selected time period.
 * The user can select the owner, month, and year from dropdowns, and the chart will update accordingly.
 */

import React, { useState, useEffect, useCallback } from "react";
import { BarChart, LineChart } from "@mui/x-charts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Spinner, Col, Form } from "react-bootstrap";
import SummaryListGroup from "./SummaryListGroup";
import fetchMonthlyTransactions from "../api/fetchMonthlyTransactions";
import fetchBarPesons from "../api/fetchBarPersons";
import { selectExpensesOptions } from "../config/selectOption";

/**
 * @brief Generates an array of dates for the selected month and year.
 *
 * This function returns an array of formatted dates (YYYY-MM-DD) for the entire selected month.
 *
 * @param {number} year - The selected year.
 * @param {number} month - The selected month (1-12).
 * @return {string[]} An array of formatted dates for the selected month.
 */
const generateDatesForSelectedMonth = (year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) =>
        new Date(year, month - 1, i + 1).toLocaleDateString("sv-SE")
    );
};

/**
 * @brief A React component that fetches and displays a line chart of monthly transactions.
 *
 * This component fetches the daily expenses and incomes for a selected owner, month, and year.
 * It uses the fetched data to render a cumulative line chart. Users can select the owner,
 * month, and year via dropdowns, and the chart will update accordingly.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.transactionType - Type of transaction ("expense" or "income") to filter data (not currently used).
 * @return {JSX.Element} The rendered chart component.
 */
const ChartTab = ({ transactionType }) => {
    const [dailyExpenseSums, setDailyExpenseSums] = useState([]);
    const [dailyIncomeSums, setDailyIncomeSums] = useState([]);
    const [dailyTrendLine, setDailyTrendLine] = useState([]);
    // const [previousMonthBalance, setPreviousMonthBalance] = useState(0);
    const [selectedOwner, setSelectedOwner] = useState("-");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loadingLineChart, setLoadingLineChart] = useState(false);
    const [loadingBarChart, setLoadingBarChart] = useState(false);

    const [itemsLoaded, setItemsLoaded] = useState(false);

    const [barPersons, setBarPersons] = useState([]);

    const trendLine = () => {
        const monthDaysCount = new Date(
            selectedYear,
            selectedMonth,
            0
        ).getDate();
        const trendLine = [];
        const calculateMaximumDailySpendings =
            Math.max(...dailyIncomeSums) / monthDaysCount;

        for (let i = 0; i < monthDaysCount; i++) {
            trendLine.push(
                parseFloat(calculateMaximumDailySpendings * (i + 1)).toFixed(2)
            );
        }

        return trendLine;
    };

    /**
     * @brief Fetches transaction data and updates the chart.
     *
     * This function fetches monthly transaction data for the selected owner, month, and year,
     * and updates the chart with daily cumulative sums of expenses and incomes.
     */
    const fetchData = useCallback(async () => {
        try {
            setLoadingLineChart(true);
            setLoadingBarChart(true);

            const { linearExpenseSums, linearIncomeSums } =
                await fetchMonthlyTransactions(
                    selectedOwner,
                    selectedMonth,
                    selectedYear
                );

            const fetchedBarPersons = await fetchBarPesons(
                selectedMonth,
                selectedYear,
                selectedCategory
            );
            console.log("asdasdasdasd", fetchedBarPersons);

            setDailyExpenseSums(linearExpenseSums);
            setDailyIncomeSums(linearIncomeSums);
            setBarPersons(fetchedBarPersons);
            setItemsLoaded(true);
        } catch (error) {
            console.error("Error fetching monthly transactions:", error);
        } finally {
            setLoadingBarChart(false);
        }
    }, [selectedOwner, selectedMonth, selectedYear]);

    // Pobieranie danych po zmianie wybranych opcji
    useEffect(() => {
        if (selectedOwner !== "-") {
            fetchData();
        }
    }, [selectedOwner, selectedMonth, selectedYear]);

    useEffect(() => {
        if (itemsLoaded) {
            setDailyTrendLine(trendLine());
        }
    }, [itemsLoaded, dailyIncomeSums]);

    useEffect(() => {
        if (itemsLoaded && dailyTrendLine.length > 0) {
            setLoadingLineChart(false);
        }
    }, [itemsLoaded, dailyTrendLine]);

    const theme = createTheme({
        palette: { mode: "dark", scheme: "mangoFusionPalette" },
    });

    const handleBarChartChange = (e) => {
        setSelectedCategory(e.target.value);
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
                            {loadingLineChart ? (
                                <Spinner animation="border" role="status">
                                    <span className="sr-only"></span>
                                </Spinner>
                            ) : (
                                <LineChart
                                    xAxis={[
                                        {
                                            scaleType: "point",
                                            data: generateDatesForSelectedMonth(
                                                selectedYear,
                                                selectedMonth
                                            ),
                                            label: "Date",
                                            color: "white",
                                        },
                                    ]}
                                    series={[
                                        {
                                            data: dailyExpenseSums,
                                            label: "Wydatki",
                                        },
                                        {
                                            data: dailyIncomeSums,
                                            label: "Przychody",
                                        },
                                        {
                                            data: dailyTrendLine,
                                            label: "Linia trendu",
                                        },
                                    ]}
                                    height={500}
                                    grid={{ vertical: true, horizontal: true }}
                                />
                            )}
                            <Form.Select
                                id={`category-select`}
                                className="mb-3"
                                value={selectedCategory}
                                onChange={(e) =>
                                    handleBarChartChange(e.target.value)
                                }>
                                {selectExpensesOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>
                            {loadingBarChart ? (
                                <Spinner animation="border" role="status">
                                    <span className="sr-only"></span>
                                </Spinner>
                            ) : (
                                <>
                                    {/* <BarChart
                                    xAxis={[
                                        {
                                            scaleType: "band",
                                            data: [
                                                barPersons.map(
                                                    (person) => person.name
                                                ),
                                            ],
                                            label: "Osoba",
                                        },
                                    ]}></BarChart> */}
                                </>
                            )}
                        </ThemeProvider>
                    )}
                </div>
            </Col>
        </div>
    );
};

export default ChartTab;

