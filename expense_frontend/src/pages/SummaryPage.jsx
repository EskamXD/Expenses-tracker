import React, { useState, useEffect } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Spinner from "react-bootstrap/Spinner";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SummaryTable from "../components/SummaryTable";
import "../assets/styles/main.css";
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
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    ); // Domyślnie bieżący miesiąc
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Domyślnie bieżący rok
    const [selectedSummary, setSelectedSummary] = useState("-");

    const divToChange = document.getElementById("main");

    // Funkcja do pobierania wydatków z API
    const fetchExpenses = async (owner, month, year) => {
        console.log("fetchExpenses", owner, month, year);
        try {
            const response = await axios.get(
                `http://localhost:8000/api/expenses/?owner=${owner}&?month=${month}&?year=${year}`
            );
            const expenses = response.data;
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    };

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

    // Funkcja pomocnicza do uzyskania nazwy miesiąca
    const getMonthName = (monthNumber) => {
        const date = new Date(0, monthNumber - 1); // Tworzenie daty na podstawie numeru miesiąca
        return date.toLocaleString("default", { month: "long" }); // Użycie toLocaleString do uzyskania nazwy miesiąca
    };

    const formatTitle = (summary) => {
        if (!summary) return "Wybierz podsumowanie"; // default title
        return `${summary[0].toUpperCase() + summary.slice(1)}`;
    };

    const firstFetching = () => {
        // clean divToChange
        while (divToChange.firstChild) {
            divToChange.removeChild(divToChange.firstChild);
        }
        setLoading(true);
        fetchExpenses(selectedSummary, selectedMonth, selectedYear); // Pobierz dane dla bieżącego miesiąca na start
    };

    return (
        <>
            <div>
                <h1>Podsumowanie</h1>
                <Tabs defaultActiveKey="expenses" id="summary-tabs">
                    <Tab eventKey="expenses" title="Wydatki">
                        {/* <Tabs
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
                                            id="dropdown-basic-button-month"
                                            title={`Wybierz miesiąc: ${getMonthName(
                                                selectedMonth
                                            )}`}
                                            className="mr-1rem"
                                            onSelect={(month) => {
                                                setSelectedMonth(month);
                                                fetchExpenses(
                                                    month,
                                                    selectedYear
                                                ); // Pobierz dane dla wybranego miesiąca
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
                                        <DropdownButton
                                            id="dropdown-basic-button-year"
                                            title={`Wybierz rok: ${selectedYear}`}
                                            onSelect={(year) => {
                                                setSelectedYear(year);
                                                fetchExpenses(
                                                    selectedMonth,
                                                    year
                                                ); // Pobierz dane dla wybranego roku
                                            }}>
                                            {[...Array(5)].map((_, index) => (
                                                <Dropdown.Item
                                                    key={index}
                                                    eventKey={
                                                        new Date().getFullYear() -
                                                        index
                                                    }>
                                                    {new Date().getFullYear() -
                                                        index}
                                                </Dropdown.Item>
                                            ))}
                                        </DropdownButton>
                                    </Col>
                                </Row>
                                {loading ? (
                                    <Spinner animation="border" role="status">
                                        <span className="sr-only">
                                            Ładowanie...
                                        </span>
                                    </Spinner>
                                ) : (
                                    <SummaryTable
                                        expenses={kamilExpenses}
                                        requestSort={requestSort}
                                        getSortIndicator={getSortIndicator}
                                        tabKey="kamil-expenses"
                                    />
                                )}
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
                            </Tabs> */}
                        <div className="center-div" id="main">
                            {loading ? (
                                <Spinner animation="border" role="status">
                                    <span className="sr-only"></span>
                                </Spinner>
                            ) : (
                                <Row>
                                    <DropdownButton
                                        id="dropdown-basic-button-summary"
                                        title={`Wybierz podsumowanie: ${formatTitle(
                                            selectedSummary
                                        )}`}
                                        onSelect={(summary) => {
                                            console.log(
                                                "selectedSummary",
                                                summary
                                            );
                                            setSelectedSummary(summary);
                                            firstFetching();
                                        }}>
                                        <Dropdown.Item eventKey="-" key="-">
                                            -
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            eventKey="kamil"
                                            key="kamil">
                                            Kamil
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            eventKey="ania"
                                            key="ania">
                                            Ania
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            eventKey="Wspólne"
                                            key="common">
                                            Wspólne
                                        </Dropdown.Item>
                                    </DropdownButton>
                                </Row>
                            )}
                        </div>
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

