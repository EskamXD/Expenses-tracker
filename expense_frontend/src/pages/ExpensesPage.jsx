// src/pages/ExpensesPage.jsx
import React, { useState } from "react";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import ExpensesForm from "../components/ExpensesForm";
import ReceiptForm from "../components/ReceiptForm";
import { Link } from "react-router-dom";
import axios from "axios";

const ExpensesPage = () => {
    const selectOptions = [
        { value: "fuel", label: "Paliwo" },
        { value: "car_expenses", label: "Wydatki Samochód" },
        { value: "fastfood", label: "Fastfood" },
        { value: "alcohol", label: "Alkohol" },
        { value: "food_drinks", label: "Picie & Jedzenie" },
        { value: "chemistry", label: "Chemia" },
        { value: "clothes", label: "Ubrania" },
        { value: "electronics_games", label: "Elektronika & Gry" },
        { value: "tickets_entrance", label: "Bilety & Wejściówki" },
        { value: "other_shopping", label: "Inne Zakupy" },
        { value: "flat_bills", label: "Mieszkanie & rachunki" },
        { value: "monthly_subscriptions", label: "Miesięczne Subskrypcje" },
        { value: "other_cyclical_expenses", label: "Inne Cykliczne Wydatki" },
        {
            value: "investments_savings",
            label: "Inwestycje, Lokaty & Oszczędności",
        },
        { value: "other", label: "Inne" },
    ];

    const [items, setItems] = useState([
        {
            id: 1,
            value: "",
            category: "food_drinks",
            owner: "kamil",
            date: new Date().toISOString().split("T")[0],
        },
    ]);
    const [payer, setPayer] = useState("kamil");
    const [resetForm, setResetForm] = useState(false);

    const addItem = () => {
        const lastItemCategory = items[items.length - 1].category;
        setItems([
            ...items,
            {
                id: items.length + 1,
                value: "",
                category: lastItemCategory,
                owner: "kamil",
                date: new Date().toISOString().split("T")[0],
            },
        ]);
    };

    const removeItem = (id) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Dane dla paragonu, traktujemy wszystkie elementy jako jeden paragon
        const receiptData = {
            payment_date: items[0].date, // Użyj daty z pierwszego elementu jako daty paragonu
            expenses: items.map((item) => ({
                category: item.category,
                amount: item.value,
                owner: item.owner,
                payer: payer,
            })),
        };

        try {
            // Wysłanie paragonu
            console.log("Receipt data:", JSON.stringify(receiptData));
            // alert("Receipt data has been sent to the server.");

            const response = await axios.post(
                "http://localhost:8000/api/receipt/",
                receiptData
            );
            console.log("Receipt response:", response.data);

            // Resetowanie formularza po udanym wysłaniu
            setPayer("kamil");
            setItems([
                {
                    id: 1,
                    value: "",
                    category: "food_drinks",
                    owner: "kamil",
                    date: new Date().toISOString().split("T")[0],
                },
            ]);

            // alert("Data has been successfully submitted.");

            // Send signal to reset form
            setResetForm(true);
        } catch (error) {
            console.error("Error submitting data:", error);
            // alert("An error occurred while submitting the data.");
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
            <p>Tutaj możesz zarządzać swoimi wydatkami.</p>

            <Tabs defaultActiveKey="add" id="expenses-tabs">
                <Tab eventKey="add" title="Dodaj wydatek">
                    <ExpensesForm
                        items={items}
                        setItems={setItems}
                        payer={payer}
                        setPayer={setPayer}
                        selectOptions={selectOptions}
                        handleSubmit={handleSubmit}
                        resetForm={resetForm}
                        setResetForm={setResetForm}
                    />
                </Tab>

                <Tab eventKey="receipt" title="Dodaj paragon">
                    <ReceiptForm
                        items={items}
                        setItems={setItems}
                        payer={payer}
                        setPayer={setPayer}
                        selectOptions={selectOptions}
                        addItem={addItem}
                        removeItem={removeItem}
                        handleSubmit={handleSubmit}
                        resetForm={resetForm}
                        setResetForm={setResetForm}
                    />
                </Tab>
            </Tabs>
        </div>
    );
};

export default ExpensesPage;
