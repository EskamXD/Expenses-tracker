/**
 * @file ExpensesPage.jsx
 * @brief A React component for managing and adding expense items.
 *
 * This file defines the ExpensesPage component, which allows users to add expense items
 * and manage them through a unified form interface. It includes functionality for adding
 * single expense items as well as multiple items under a single receipt.
 */

import { useState } from "react";
import { Breadcrumb, Tab, Tabs } from "react-bootstrap";
import { Link } from "react-router-dom";
import UnifiedForm from "../components/UnifiedForm";
import { selectExpensesOptions } from "../config/selectOption";
import { Item, Receipt } from "../types";
import { fetchPostReceipt } from "../services/apiService";
import { validateAndEvaluate } from "../utils/valuesCheckExpression";

/**
 * @brief Manages expense-related forms and items.
 *
 * The ExpensesPage component provides tabs for adding individual expense items or
 * creating a receipt with multiple items. It includes form handling logic,
 * state management for form fields, and API communication for submitting transaction data.
 *
 * @return {JSX.Element} A component that renders the expense management interface.
 */
const ExpensesPage = () => {
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]); // prettier-ignore
    const [payer, setPayer] = useState(1); // prettier-ignore
    const [items, setItems] = useState<Item[]>([
        {
            id: 1,
            category: "food_drinks",
            value: "",
            description: "",
            quantity: 0,
            owner: 1,
        },
    ]);
    const [shop, setShop] = useState(""); // prettier-ignore

    /**
     * @brief Handles the form submission for expenses.
     *
     * This function collects form data, prepares it for the receipt API, and sends
     * the data to the server. It resets the form state upon successful submission.
     *
     * @param {Event} e - The form submission event.
     */
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            items.forEach((item: Item) => {
                // console.log("handleSbumit", item);
                const result = validateAndEvaluate(item) as {
                    status: boolean;
                    message: string;
                };
                if (!result) {
                    throw new Error("Niepoprawne dane w formularzu.");
                }
            });
        } catch (error) {
            console.error(error);

            return;
        }

        const receiptData = [
            {
                payment_date: paymentDate,
                payer: payer,
                shop: shop,
                transaction_type: "expense",
                items: items,
            },
        ] as Receipt[];

        fetchPostReceipt(receiptData)
            .then(() => {
                // Reset form after successful submission
                setItems([
                    {
                        id: 1,
                        category: "food_drinks",
                        value: "",
                        description: "",
                        quantity: 0,
                        owner: 1,
                    },
                ]);
                // setResetForm(true); // Signal to reset form
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <>
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
                        paymentDate={paymentDate}
                        setPaymentDate={setPaymentDate}
                        shop={shop}
                        setShop={setShop}
                        payer={payer}
                        setPayer={setPayer}
                        items={items}
                        setItems={setItems}
                        handleSubmit={handleSubmit}
                        formId="addExpense"
                        buttonLabel="Zapisz wydatek"
                        showShop={true}
                        showQuantity={true}
                        showAddItemButton={false}
                        allowRemoveItem={false}
                        selectOptions={selectExpensesOptions} // Pass expenses options
                    />
                </Tab>

                <Tab eventKey="addReceipt" title="Dodaj paragon">
                    <UnifiedForm
                        paymentDate={paymentDate}
                        setPaymentDate={setPaymentDate}
                        shop={shop}
                        setShop={setShop}
                        payer={payer}
                        setPayer={setPayer}
                        items={items}
                        setItems={setItems}
                        handleSubmit={handleSubmit}
                        formId="addReceipt"
                        buttonLabel="Zapisz paragon"
                        showShop={true}
                        showQuantity={true}
                        showAddItemButton={true}
                        allowRemoveItem={true}
                        selectOptions={selectExpensesOptions} // Pass expenses options
                    />
                </Tab>
            </Tabs>
        </>
    );
};

export default ExpensesPage;
