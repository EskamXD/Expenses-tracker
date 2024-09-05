// src/components/SummaryPage.jsx

import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import SummaryTab from "../components/SummaryTab";
import ChartTab from "../components/ChartTab.jsx";
import "../assets/styles/main.css";

const SummaryPage = () => {
    const [selectedTransactiontype, setSelectedTransactiontype] =
        useState("expense");

    const handleTabsChange = (key) => {
        setSelectedTransactiontype(key);
    };

    return (
        <div>
            <h1>Podsumowanie</h1>
            <Tabs
                defaultActiveKey="expense"
                id="summary-tabs"
                onSelect={handleTabsChange}>
                <Tab eventKey="expense" title="Wydatki">
                    <SummaryTab transactionType="expense" />
                </Tab>
                <Tab eventKey="income" title="Przychody">
                    <SummaryTab transactionType="income" />
                </Tab>
                <Tab eventKey="charts" title="Wykresy">
                    <ChartTab />
                </Tab>
            </Tabs>
        </div>
    );
};

export default SummaryPage;
