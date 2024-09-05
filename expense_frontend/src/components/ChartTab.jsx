/**
 * @file ChartTab.jsx
 * @brief React component to display a line chart of monthly expenses and incomes.
 *
 * This component fetches the monthly transactions (expenses and incomes) for a selected owner, month, and year.
 * It displays a line chart summarizing the cumulative daily expenses and incomes over the selected time period.
 * The user can select the owner, month, and year from dropdowns, and the chart will update accordingly.
 */

import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Spinner, Col } from "react-bootstrap";
import SummaryListGroup from "./SummaryListGroup";
import fetchMonthlyTransactions from "../api/fetchMonthlyTransactions";
import previousMonthBalance from "../api/previousMonthBalance.jsx";

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
    const [previousMonthBalance, setPreviousMonthBalance] = useState(0);
    const [dates, setDates] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedOwner, setSelectedOwner] = useState("-");
    const [loading, setLoading] = useState(false);
    const [itemsLoaded, setItemsLoaded] = useState(false);

    // Pobieranie danych po zmianie wybranych opcji
    useEffect(() => {
        /**
         * @brief Fetches transaction data and updates the chart.
         *
         * This function fetches monthly transaction data for the selected owner, month, and year,
         * and updates the chart with daily cumulative sums of expenses and incomes.
         */
        const fetchBalance = async () => {
            try {
                const balance = await previousMonthBalance(
                    selectedOwner,
                    selectedMonth,
                    selectedYear
                );
                setPreviousMonthBalance(balance);
            } catch (error) {
                console.error(
                    "Error fetching previous month's balance:",
                    error
                );
            }
        };

        const fetchData = async () => {
            setLoading(true);
            const allDates = generateDatesForSelectedMonth(
                selectedYear,
                selectedMonth
            );

            try {
                const { linearExpenseSums, linearIncomeSums } =
                    await fetchMonthlyTransactions(
                        selectedOwner,
                        selectedMonth,
                        selectedYear,
                        allDates
                    );

                setDates(allDates);
                setDailyExpenseSums(linearExpenseSums);
                setDailyIncomeSums(linearIncomeSums);
                setItemsLoaded(true);
            } catch (error) {
                console.error("Error fetching monthly transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        if (selectedOwner !== "-") {
            fetchData();
        }
    }, [selectedOwner, selectedMonth, selectedYear]);

    const theme = createTheme({
        palette: { mode: "dark", scheme: "mangoFusionPalette" },
    });

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
                <div className="center-div">
                    {loading ? (
                        <Spinner animation="border" role="status">
                            <span className="sr-only"></span>
                        </Spinner>
                    ) : (
                        <ThemeProvider theme={theme}>
                            <LineChart
                                xAxis={[
                                    {
                                        scaleType: "point",
                                        data: dates,
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
                        </ThemeProvider>
                    )}
                </div>
            </Col>
        </div>
    );
};

export default ChartTab;
