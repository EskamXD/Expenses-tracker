import React, { useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import PayerRadio from "./PayerRadio";
import ReceiptItem from "./ReceiptItem";
import moment from "moment";

const ExpenseForm = ({
    items,
    setItems,
    payer,
    setPayer,
    selectOptions,
    handleSubmit,
    resetForm,
    setResetForm,
}) => {
    useEffect(() => {
        // set today's date to date input
        const today = new Date().toISOString().split("T")[0];
        const calender = document.getElementById("expenses-calender");
        calender.value = today;

        // Ustaw datę w items
        setItems(
            items.map((item) => ({
                ...item,
                date: today,
            }))
        );
    }, [setItems]);

    useEffect(() => {
        if (resetForm) {
            setItems([
                {
                    id: 1,
                    value: "",
                    category: "food_drinks",
                    owner: "kamil",
                    date: new Date().toISOString().split("T")[0],
                },
            ]);
            setResetForm(false);
        }
    }, [resetForm, setItems, setResetForm]);

    const handleDateChange = (e) => {
        const newDate = moment(new Date(e.target.value)).format("YYYY-MM-DD");
        // console.log(newDate);
        setItems(
            items.map((item) => ({
                ...item,
                date: newDate,
            }))
        );
    };

    return (
        <form onSubmit={handleSubmit}>
            <Form.Control
                id="expenses-calender"
                type="date"
                className="mb-3 mt-1rem"
                onChange={handleDateChange}></Form.Control>
            <PayerRadio payer={payer} setPayer={setPayer} />
            <Button variant="outline-success" type="submit">
                Zapisz wydatek
            </Button>
            <div className="mt-3">
                {items.map((item) => (
                    <ReceiptItem
                        key={item.id}
                        item={item}
                        items={items}
                        setItems={setItems}
                        selectOptions={selectOptions}
                    />
                ))}
            </div>
        </form>
    );
};

export default ExpenseForm;
