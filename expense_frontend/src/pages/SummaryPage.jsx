import React, { useState, useEffect } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Spinner from "react-bootstrap/Spinner";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SummaryTable from "../components/SummaryTable";
import axios from "axios";

const SummaryPage = () => {
    const [kamilExpenses, setKamilExpenses] = useState([]);
    const [aniaExpenses, setAniaExpenses] = useState([]);
    const [commonExpenses, setCommonExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null,
        tab: null,
    });
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    ); // Domyślnie bieżący miesiąc

    // Funkcja do pobierania wydatków z API
    const fetchExpenses = async (month) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8000/api/expenses/?month=${month}`
            );
            const expenses = response.data;

            // Filtracja wydatków
            const kamil = expenses.filter(
                (expense) => expense.owner === "kamil"
            );
            const ania = expenses.filter((expense) => expense.owner === "ania");
            const wspolne = expenses.filter(
                (expense) => expense.owner === "common"
            );

            // Ustawienie stanów dla wydatków
            setKamilExpenses(kamil);
            setAniaExpenses(ania);
            setCommonExpenses(wspolne);

            // Obliczanie sumy wszystkich wydatków
            const total = expenses.reduce(
                (sum, expense) => sum + parseFloat(expense.amount),
                0
            );
            setTotalExpenses(total);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching expenses:", error);
            setLoading(false);
        }
    };

    // UseEffect do pobierania danych przy montowaniu komponentu
    useEffect(() => {
        fetchExpenses(selectedMonth);
    }, []);

    const sortExpenses = (expenses, key, direction) => {
        return [...expenses].sort((a, b) => {
            let aValue = a[key];
            let bValue = b[key];

            // Sprawdzenie, czy wartości są liczbowe
            if (!isNaN(aValue) && !isNaN(bValue)) {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }

            if (aValue < bValue) {
                return direction === "ascending" ? -1 : 1;
            }
            if (aValue > bValue) {
                return direction === "ascending" ? 1 : -1;
            }
            return 0;
        });
    };

    const requestSort = (key, tab) => {
        let direction = "ascending";
        if (
            sortConfig.key === key &&
            sortConfig.direction === "ascending" &&
            sortConfig.tab === tab
        ) {
            direction = "descending";
        }
        setSortConfig({ key, direction, tab });

        console.log("przed setterrem", key, direction, tab);
        // Sortowanie na podstawie aktywnej zakładki i ustawienie stanu
        if (tab === "kamil-expenses") {
            const sorted = sortExpenses(kamilExpenses, key, direction);
            setKamilExpenses(sorted);
        } else if (tab === "ania-expenses") {
            const sorted = sortExpenses(aniaExpenses, key, direction);
            setAniaExpenses(sorted);
        } else if (tab === "common-expenses") {
            const sorted = sortExpenses(commonExpenses, key, direction);
            setCommonExpenses(sorted);
        }
        console.log("po setterze", sortConfig);
    };

    const getSortIndicator = (key, tab) => {
        if (sortConfig.key === key && sortConfig.tab === tab) {
            return sortConfig.direction === "ascending" ? " ▲" : " ▼";
        }
        return ""; // Brak strzałki, gdy nie sortowane
    };

    useEffect(() => {
        fetchExpenses(selectedMonth); // Pobierz dane dla bieżącego miesiąca na start
    }, []);

    // Funkcja pomocnicza do uzyskania nazwy miesiąca
    const getMonthName = (monthNumber) => {
        const date = new Date(0, monthNumber - 1); // Tworzenie daty na podstawie numeru miesiąca
        return date.toLocaleString("default", { month: "long" }); // Użycie toLocaleString do uzyskania nazwy miesiąca
    };

    return (
        <>
            <div>
                <h1>Podsumowanie</h1>
                <Tabs defaultActiveKey="expenses" id="summary-tabs">
                    <Tab eventKey="expenses" title="Wydatki">
                        <Tabs
                            defaultActiveKey="kamil-expenses"
                            id="expenses-tabs">
                            <Tab
                                eventKey="kamil-expenses"
                                title="Wydatki Kamil"
                                className="p-3">
                                <Row className="mb-3">
                                    <Col>
                                        <h3>Wydatki Kamila</h3>
                                    </Col>
                                    <Col className="content-left">
                                        <DropdownButton
                                            id="dropdown-basic-button"
                                            title={`Wybierz miesiąc: ${getMonthName(
                                                selectedMonth
                                            )}`}
                                            onSelect={(month) => {
                                                setSelectedMonth(month);
                                                fetchExpenses(month); // Pobierz dane dla wybranego miesiąca
                                            }}>
                                            {[...Array(12)].map((_, index) => (
                                                <Dropdown.Item
                                                    key={index + 1}
                                                    eventKey={index + 1}>
                                                    {new Date(
                                                        0,
                                                        index
                                                    ).toLocaleString(
                                                        "default",
                                                        { month: "long" }
                                                    )}
                                                </Dropdown.Item>
                                            ))}
                                        </DropdownButton>
                                    </Col>
                                </Row>
                                <SummaryTable
                                    expenses={kamilExpenses}
                                    requestSort={requestSort}
                                    getSortIndicator={getSortIndicator}
                                    tabKey="kamil-expenses"
                                />
                            </Tab>

                            <Tab
                                eventKey="ania-expenses"
                                title="Wydatki Ania"
                                className="p-3">
                                <h3>Wydatki Ani</h3>
                                <SummaryTable
                                    expenses={aniaExpenses}
                                    requestSort={requestSort}
                                    getSortIndicator={getSortIndicator}
                                    tabKey="ania-expenses"
                                />
                            </Tab>

                            <Tab
                                eventKey="common-expenses"
                                title="Wydatki wspólne"
                                className="p-3">
                                <h3>Wydatki wspólne</h3>
                                <SummaryTable
                                    expenses={commonExpenses}
                                    requestSort={requestSort}
                                    getSortIndicator={getSortIndicator}
                                    tabKey="common-expenses"
                                />
                            </Tab>

                            <Tab
                                eventKey="summary"
                                title="Podsumowanie wydatków">
                                <h3>Podsumowanie Wydatków</h3>
                                <p>Całkowite wydatki: {totalExpenses} PLN</p>
                            </Tab>
                        </Tabs>
                    </Tab>
                    {/* Możesz dodać obsługę przychodów w podobny sposób */}
                    {/* <Tab eventKey="income" title="Przychody" className="p-3">
                        <Tabs
                            defaultActiveKey="kamil-income"
                            id="receipts-tabs">
                            <Tab
                                eventKey="kamil-income"
                                title="Przychody Kamil">
                                <p>Kamil</p>
                            </Tab>
                            <Tab eventKey="ania-income" title="Przychody Ania">
                                <p>Ania</p>
                            </Tab>
                            <Tab
                                eventKey="common-income"
                                title="Przychody wspólne">
                                <p>Wspólne</p>
                            </Tab>
                            <Tab
                                eventKey="summary"
                                title="Podsumowanie przychodów">
                                <p>Podsumowanie</p>
                            </Tab>
                        </Tabs>
                    </Tab> */}
                </Tabs>
            </div>
        </>
    );
};

export default SummaryPage;
