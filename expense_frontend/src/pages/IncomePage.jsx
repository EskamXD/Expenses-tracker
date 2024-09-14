/**
 * @file IncomePage.jsx
 * @brief A React component for managing and adding income transactions.
 *
 * This file defines the IncomePage component, which allows users to add income items
 * through a unified form interface. It includes functionality for adding individual income transactions.
 */

import React, { useState } from "react";
import { Breadcrumb, Tab, Tabs } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import UnifiedForm from "../components/UnifiedForm";
import { selectIncomeOptions } from "../config/selectOption";

/**
 * @brief Manages income-related forms and transactions.
 *
 * The IncomePage component provides a tab for adding individual income items.
 * It includes form handling logic, state management for form fields, and API communication
 * for submitting income transaction data.
 *
 * @return {JSX.Element} A component that renders the income management interface.
 */
const IncomePage = () => {
    const [paymentDate, setPaymentDate] = useState(
        new Date().toISOString().split("T")[0]
    ); /**< State to manage the selected payment date. */
    const [payer, setPayer] =
        useState("kamil"); /**< State to manage the selected payer. */
    const [items, setItems] = useState([
        {
            id: 1,
            category: "work_income",
            value: "",
            description: "",
            owner: "kamil",
        },
    ]); /**< State to manage the list of items in the form. */
    const [resetForm, setResetForm] =
        useState(false); /**< Flag to signal form reset. */

    /**
     * @brief Handles the form submission for income transactions.
     *
     * This function collects form data, prepares it for the receipt API, and sends
     * the data to the server. It resets the form state upon successful submission.
     *
     * @param {Event} e - The form submission event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare transaction data for income
        const receiptData = {
            payment_date: paymentDate,
            payer: payer,
            shop: "", // Not applicable for income
            transaction_type: "income",
            transactions: items.map((item) => ({
                transaction_type: "income",
                category: item.category,
                value: parseFloat(item.value.replace(",", ".")), // Replace comma with dot and convert to number
                description: item.description,
                quantity: 1,
                owner: item.owner,
            })),
        };

        try {
            console.log("Transaction data:", JSON.stringify(receiptData));

            const response = await axios.post(
                "http://localhost:8000/api/receipts/",
                receiptData
            );
            console.log("Transaction response:", response.data);

            // Reset form after successful submission
            setPayer("kamil");
            setItems([
                {
                    id: 1,
                    category: "work_income",
                    value: "",
                    description: "",
                    owner: "kamil",
                },
            ]);

            setResetForm(true); // Signal to reset form
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };

    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                    Strona główna
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Przychody</Breadcrumb.Item>
            </Breadcrumb>

            <h1>Przychody</h1>
            <p>Dodaj swoje przychody</p>

            <Tabs defaultActiveKey="addIncome" id="income-tabs">
                <Tab eventKey="addIncome" title="Dodaj przychód">
                    <UnifiedForm
                        paymentDate={paymentDate}
                        setPaymentDate={setPaymentDate}
                        setShop={null} // Not applicable for income
                        payer={payer}
                        setPayer={setPayer}
                        items={items}
                        setItems={setItems}
                        handleSubmit={handleSubmit}
                        resetForm={resetForm}
                        setResetForm={setResetForm}
                        formId="addIncome"
                        buttonLabel="Zapisz przychód"
                        showQuantity={false} // Quantity is not relevant for income
                        showAddItemButton={false} // Only one income at a time
                        allowRemoveItem={false} // Cannot remove the single item
                        selectOptions={selectIncomeOptions} // Pass income options
                    />
                </Tab>
            </Tabs>
        </>
    );
};

export default IncomePage;
