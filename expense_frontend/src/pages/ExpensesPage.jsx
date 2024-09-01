// src/pages/ExpensesPage.jsx
import React, { useState } from "react";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import ExpensesForm from "../components/ExpensesForm";
import ReceiptForm from "../components/ReceiptForm";
import { Link } from "react-router-dom";

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
        { id: 1, value: "", category: "fuel", owner: "kamil" },
    ]);
    const [payer, setPayer] = useState("kamil");

    const addItem = () => {
        const lastItemCategory = items[items.length - 1].category;
        setItems([
            ...items,
            {
                id: items.length + 1,
                value: "",
                category: lastItemCategory,
                owner: "kamil",
            },
        ]);
    };

    const removeItem = (id) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Dane dla paragonu, traktujemy wszystkie elementy jako jeden paragon
        const receiptData = items.map((item) => ({
            category: item.category,
            amount: item.value,
            owner: item.owner,
            payer: payer, // Zakładamy, że `payer` jest taki sam dla wszystkich elementów paragonu
        }));

        try {
            // Wysłanie paragonu
            const response = await axios.post("/api/expenses", receiptData);
            console.log("Receipt response:", response.data);

            // Resetowanie formularza po udanym wysłaniu
            setCategory("food");
            setAmount("");
            setOwner("kamil");
            setPayer("kamil");
            setItems([{ id: 1, value: "", category: "food", owner: "kamil" }]);

            alert("Data has been successfully submitted.");
        } catch (error) {
            console.error("Error submitting data:", error);
            alert("An error occurred while submitting the data.");
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
                    />
                </Tab>
            </Tabs>
        </div>
    );
};

export default ExpensesPage;
