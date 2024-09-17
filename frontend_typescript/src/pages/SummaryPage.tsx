/**
 * @file SummaryPage.jsx
 * @brief A React component that displays a summary page with tabs for expenses, incomes, and charts.
 *
 * This component provides a summary interface with three tabs:
 * - "Wydatki" (Expenses): Displays a summary of expenses using the `SummaryTab` component.
 * - "Przychody" (Incomes): Displays a summary of incomes using the `SummaryTab` component.
 * - "Wykresy" (Charts): Displays charts using the `ChartTab` component.
 *
 * Users can switch between tabs to view either the expenses, incomes, or charts for the selected transaction type.
 */

import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import SummaryTab from "../components/SummaryTab";
import ChartTab from "../components/ChartTab";
import BalanceTab from "../components/BalanceTab";
import "../assets/styles/main.css";

/**
 * @brief A React component that renders the summary page with tabs for expenses, incomes, and charts.
 *
 * This component uses `Tabs` from react-bootstrap to allow the user to switch between viewing:
 * - Expenses (`SummaryTab` with transactionType "expense").
 * - Incomes (`SummaryTab` with transactionType "income").
 * - Charts (`ChartTab` to visualize expenses and incomes).
 *
 * @component
 * @returns {JSX.Element} The rendered SummaryPage component.
 *
 * @example
 * <SummaryPage />
 */
const SummaryPage = () => {
    return (
        <div>
            <h1>Podsumowanie</h1>
            <Tabs defaultActiveKey="expense" id="summary-tabs">
                <Tab eventKey="expense" title="Wydatki">
                    <SummaryTab transactionType="expense" />
                </Tab>
                <Tab eventKey="income" title="Przychody">
                    <SummaryTab transactionType="income" />
                </Tab>
                <Tab eventKey="charts" title="Wykresy">
                    <ChartTab />
                </Tab>
                <Tab eventKey="balance" title="Saldo">
                    <BalanceTab />
                </Tab>
            </Tabs>
        </div>
    );
};

export default SummaryPage;
