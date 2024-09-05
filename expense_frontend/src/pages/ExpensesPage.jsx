/**
 * @file ExpensesPage.jsx
 * @brief A React component for managing and adding expense transactions.
 *
 * This file defines the ExpensesPage component, which allows users to add expense items
 * and manage them through a unified form interface. It includes functionality for adding
 * single expense items as well as multiple transactions under a single receipt.
 */

import React, { useState } from "react";
import { Breadcrumb, Tab, Tabs } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import UnifiedForm from "../components/UnifiedForm";
import { selectExpensesOptions } from "../config/selectOption";

/**
 * @brief Manages expense-related forms and transactions.
 *
 * The ExpensesPage component provides tabs for adding individual expense items or
 * creating a receipt with multiple transactions. It includes form handling logic,
 * state management for form fields, and API communication for submitting transaction data.
 *
 * @return {JSX.Element} A component that renders the expense management interface.
 */
const ExpensesPage = () => {
    const [paymentDate, setPaymentDate] = useState(
        new Date().toISOString().split("T")[0]
    ); /**< State to manage the selected payment date. */
    const [payer, setPayer] =
        useState("kamil"); /**< State to manage the selected payer. */
    const [items, setItems] = useState([
        {
            id: 1,
            category: "food_drinks",
            value: "",
            description: "",
            quantity: "",
            owner: "kamil",
        },
    ]); /**< State to manage the list of items in the form. */
    const [shop, setShop] =
        useState(""); /**< State to manage the shop name input. */
    const [resetForm, setResetForm] =
        useState(false); /**< Flag to signal form reset. */

    /**
     * @brief Handles the form submission for expenses.
     *
     * This function collects form data, prepares it for the receipt API, and sends
     * the data to the server. It resets the form state upon successful submission.
     *
     * @param {Event} e - The form submission event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare receipt and transaction data
        const receiptData = {
            payment_date: paymentDate,
            payer: payer,
            shop: shop,
            transaction_type: "expense",
            transactions: items.map((item) => ({
                transaction_type: "expense",
                category: item.category,
                value: parseFloat(item.value.replace(",", ".")), // Replace comma with dot and convert to number
                description: item.description,
                quantity: item.quantity,
                owner: item.owner,
            })),
        };

        try {
            console.log("Receipt data:", JSON.stringify(receiptData));
            // Send receipt data to API
            const response = await axios.post(
                "http://localhost:8000/api/receipts/",
                receiptData
            );
            console.log("Receipt response:", response);

            // Reset form after successful submission
            setPayer("kamil");
            setItems([
                {
                    id: 1,
                    category: "food_drinks",
                    value: "",
                    description: "",
                    quantity: "",
                    owner: "kamil",
                },
            ]);

            setResetForm(true); // Signal to reset form
        } catch (error) {
            console.error("Error submitting data:", error);
            // Handle error appropriately
        }
    };

    return (
        <div>
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                    Strona główna
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Wydatki</Breadcrumb.Item>
            </Breadcrumb>

            <h1>Wydatki</h1>
            <p>Dodaj swoje wydatki.</p>

            <Tabs defaultActiveKey="addExpense" id="expenses-tabs">
                <Tab eventKey="addExpense" title="Dodaj wydatek">
                    <UnifiedForm
                        setPaymentDate={setPaymentDate}
                        shop={shop}
                        setShop={setShop}
                        payer={payer}
                        setPayer={setPayer}
                        items={items}
                        setItems={setItems}
                        handleSubmit={handleSubmit}
                        resetForm={resetForm}
                        setResetForm={setResetForm}
                        formId="addExpense"
                        buttonLabel="Zapisz wydatek"
                        showQuantity={true}
                        showAddItemButton={false}
                        allowRemoveItem={false}
                        selectOptions={selectExpensesOptions} // Pass expenses options
                    />
                </Tab>

                <Tab eventKey="addReceipt" title="Dodaj paragon">
                    <UnifiedForm
                        setPaymentDate={setPaymentDate}
                        shop={shop}
                        setShop={setShop}
                        payer={payer}
                        setPayer={setPayer}
                        items={items}
                        setItems={setItems}
                        handleSubmit={handleSubmit}
                        resetForm={resetForm}
                        setResetForm={setResetForm}
                        formId="addReceipt"
                        buttonLabel="Zapisz paragon"
                        showQuantity={true}
                        showAddItemButton={true}
                        allowRemoveItem={true}
                        selectOptions={selectExpensesOptions} // Pass expenses options
                    />
                </Tab>
            </Tabs>
        </div>
    );
};

export default ExpensesPage;
