// src/components/ReceiptForm.jsx
import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import PayerRadio from "./PayerRadio";
import ReceiptItem from "./ReceiptItem";

const ReceiptForm = ({
    items,
    setItems,
    payer,
    setPayer,
    selectOptions,
    addItem,
    removeItem,
    handleSubmit,
}) => {
    return (
        <form onSubmit={handleSubmit}>
            <Form.Label htmlFor="category">Kategoria:</Form.Label>
            <PayerRadio payer={payer} setPayer={setPayer} />
            <Button
                variant="outline-primary"
                type="button"
                onClick={addItem}
                className="mr-1rem">
                Dodaj rzecz
            </Button>
            <Button variant="outline-success" type="submit">
                Dodaj paragon
            </Button>
            <div className="mt-3">
                {items.map((item) => (
                    <ReceiptItem
                        key={item.id}
                        item={item}
                        items={items}
                        setItems={setItems}
                        selectOptions={selectOptions}
                        removeItem={removeItem}
                    />
                ))}
            </div>
        </form>
    );
};

export default ReceiptForm;
