import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts";
import { Spinner, Col, ListGroup, Row } from "react-bootstrap";
import SummaryDropdown from "./SummaryDropdown";
import YearDropdown from "./YearDropdown";
import MonthDropdown from "./MonthDropdown";
import fetchMonthlyTransactions from "../api/fetchMonthlyTransactions";

const ChartTab = ({ transactionType }) => {
    const [dailyExpenseSums, setDailyExpenseSums] = useState([]);
    const [dailyIncomeSums, setDailyIncomeSums] = useState([]);
    const [dates, setDates] = useState([]);

    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedOwner, setSelectedOwner] = useState("-");
    const [loading, setLoading] = useState(true);
    const [itemsLoaded, setItemsLoaded] = useState(false);

    useEffect(() => {
        const generateDatesForSelectedMonth = (year, month) => {
            const today = new Date();
            const firstDayOfMonth = new Date(year, month - 1, 1); // Miesiące są indeksowane od 0
            const lastDayOfMonth = today; // Do dnia dzisiejszego

            // Tablica do przechowywania dat
            const datesArray = [];

            // Pętla od pierwszego do ostatniego dnia miesiąca
            for (
                let day = firstDayOfMonth;
                day <= lastDayOfMonth;
                day.setDate(day.getDate() + 1)
            ) {
                // Używamy `.toISOString().split("T")[0]` aby uzyskać format 'YYYY-MM-DD'
                datesArray.push(new Date(day).toISOString().split("T")[0]);
            }

            return datesArray;
        };

        const datesForSelectedMonth = generateDatesForSelectedMonth(
            selectedYear,
            selectedMonth
        );
        setDates(datesForSelectedMonth);
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { dailyExpenseSums, dailyIncomeSums } =
                    await fetchMonthlyTransactions(
                        selectedOwner,
                        selectedMonth,
                        selectedYear
                    );

                console.log("Suma wydatków na każdy dzień:", dailyExpenseSums);
                console.log("Suma przychodów na każdy dzień:", dailyIncomeSums);
                setDailyExpenseSums(dailyExpenseSums);
                setDailyIncomeSums(dailyIncomeSums);
                setLoading(false);
                setItemsLoaded(true);
            } catch (error) {
                console.error("Error fetching monthly transactions:", error);
            }
        };

        if (selectedOwner) {
            fetchData();
        }
    }, [selectedOwner, selectedMonth, selectedYear]);

    return (
        <>
            <div className="center-div-top">
                {loading ? (
                    <Spinner animation="border" role="status">
                        <span className="sr-only"></span>
                    </Spinner>
                ) : (
                    <Col
                        className="pt-1rem"
                        style={{ margin: "0", width: "100%" }}>
                        {!itemsLoaded && (
                            <Row>
                                <SummaryDropdown
                                    selectedOwner={selectedOwner}
                                    setSelectedOwner={setSelectedOwner}
                                />
                            </Row>
                        )}

                        {itemsLoaded && (
                            <ListGroup horizontal>
                                <ListGroup.Item>
                                    <SummaryDropdown
                                        selectedOwner={selectedOwner}
                                        setSelectedOwner={setSelectedOwner}
                                    />
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <YearDropdown
                                        selectedYear={selectedYear}
                                        onSelect={(year) =>
                                            setSelectedYear(year)
                                        }
                                    />
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <MonthDropdown
                                        selectedMonth={selectedMonth}
                                        onSelect={(month) =>
                                            setSelectedMonth(month)
                                        }
                                    />
                                </ListGroup.Item>
                            </ListGroup>
                        )}
                    </Col>
                )}
            </div>
            <LineChart
                xAxis={[{ scaleType: "point", data: dates, label: "Date" }]}
                series={[
                    {
                        data: dailyExpenseSums,
                        label: "Expenses",
                        color: "orange", // You can set specific colors for clarity
                    },
                    {
                        data: dailyIncomeSums,
                        label: "Income",
                        color: "blue",
                    },
                ]}
                width={500}
                height={300}
            />
        </>
    );
};

export default ChartTab;
