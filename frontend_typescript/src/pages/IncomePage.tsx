/**
 * @file IncomePage.jsx
 * @brief A React component for managing and adding income items.
 *
 * This file defines the IncomePage component, which allows users to add income items
 * through a unified form interface. It includes functionality for adding individual income items.
 */

import { useState } from "react";
import { Breadcrumb, Tab, Tabs } from "react-bootstrap";
import { Link } from "react-router-dom";
import UnifiedForm from "../components/UnifiedForm";
import { selectIncomeOptions } from "../config/selectOption";
import { Item, Receipt } from "../types";
import { fetchPostReceipt } from "../services/apiService";

/**
 * @brief Manages income-related forms and items.
 *
 * The IncomePage component provides a tab for adding individual income items.
 * It includes form handling logic, state management for form fields, and API communication
 * for submitting income transaction data.
 *
 * @return {JSX.Element} A component that renders the income management interface.
 */
const IncomePage = () => {
    const [receipt, setReceipt] = useState<Receipt[]>(
        []
    ); /**< State to manage the receipt data. */
    const [paymentDate, setPaymentDate] = useState(
        new Date().toISOString().split("T")[0]
    ); /**< State to manage the selected payment date. */
    const [payer, setPayer] =
        useState(1); /**< State to manage the selected payer. */
    const [items, setItems] = useState<Item[]>([
        {
            id: 1,
            category: "work_income",
            value: NaN,
            description: "",
            quantity: NaN,
            owner: 1,
        },
    ]); /**< State to manage the list of items in the form. */
    const [resetForm, setResetForm] =
        useState(false); /**< Flag to signal form reset. */

    /**
     * @brief Handles the form submission for income items.
     *
     * This function collects form data, prepares it for the receipt API, and sends
     * the data to the server. It resets the form state upon successful submission.
     *
     * @param {Event} e - The form submission event.
     */
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const receiptData = [
            {
                payment_date: paymentDate,
                payer: payer,
                shop: "",
                transaction_type: "income",
                items: items,
            },
        ] as Receipt[];

        fetchPostReceipt(receiptData);

        // Reset form after successful submission
        setItems([
            {
                category: "work_income",
                value: NaN,
                description: "",
                quantity: NaN,
                owner: 1,
            },
        ]);

        setResetForm(true); // Signal to reset form
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
                        setShop={() => {}} // Not applicable for income
                        payer={payer}
                        setPayer={setPayer}
                        items={items}
                        setItems={setItems}
                        handleSubmit={handleSubmit}
                        resetForm={resetForm}
                        setResetForm={setResetForm}
                        formId="addIncome"
                        buttonLabel="Zapisz przychód"
                        showShop={false} // Shop is not applicable for income
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
