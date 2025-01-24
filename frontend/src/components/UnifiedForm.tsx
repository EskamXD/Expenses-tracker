/**
 * @file UnifiedForm.jsx
 * @brief A React component for handling a unified form interface.
 *
 * This file defines the UnifiedForm component, which provides a form interface for handling
 * different types of items, such as adding items, setting payment dates, and selecting payers.
 */

import React, { FormEventHandler, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import UnifiedDropdown from "./UnifiedDropdown";
import UnifiedItem from "./UnifiedItem";
import { addItem, updateItem, removeItem } from "../utils/receiptItemsHandler";
import moment from "moment";
import { Item, Receipt } from "../types";
import { fetchPostReceipt } from "../api/apiService";
import { validateAndEvaluate } from "../utils/valuesCheckExpression";
// import { v4 as uuidv4 } from "uuid";

import "../assets/styles/main.css";

interface UnifiedFormProps {
    formId: string;
    buttonLabel: string;
    showShop: boolean;
    showQuantity: boolean;
}
/**
 * @brief Renders a form for handling different types of items.
 *
 * The UnifiedForm component is a generic form that can handle various transaction inputs,
 * including setting payment dates, selecting a payer, and adding or removing items.
 * It utilizes child components for dropdowns and item handling.
 *
 * @param {string} formId - A unique identifier for the form.
 * @param {string} buttonLabel - The label text for the submit button.
 * @param {boolean} showShop - Whether to show the shop input field.
 * @param {boolean} showQuantity - Whether to show the quantity input for each item.
 *
 * @return {JSX.Element} A form component for managing items.
 */
const UnifiedForm: React.FC<UnifiedFormProps> = ({
    formId,
    buttonLabel,
    showShop = false,
    showQuantity = false,
}) => {
    const [paymentDate, setPaymentDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [payer, setPayer] = useState(-1);
    const [shop, setShop] = useState("");

    // const [nextItemId, setNextItemId] = useState(2);
    const [items, setItems] = useState<Item[]>([
        {
            id: 1,
            category: "food_drinks",
            value: "",
            description: "",
            quantity: 1,
            owners: [],
        },
    ]);

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
                        quantity: 1,
                        owners: [],
                    },
                ]);
                // setResetForm(true); // Signal to reset form
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleDateChange = (e: any) => {
        const newDate = moment(e.target.value).format("YYYY-MM-DD");
        setPaymentDate(newDate);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Form.Control
                id={`${formId}-calendar`}
                type="date"
                className="mb-3 mt-1rem"
                value={paymentDate}
                onChange={handleDateChange}
            />
            {showShop && (
                <Form.Control
                    type="text"
                    placeholder="Sklep"
                    className="mb-3"
                    value={shop}
                    onChange={(e) => {
                        // console.log(e.target.value);
                        if (setShop) setShop(e.target.value);
                    }}
                />
            )}
            <Row className="d-flex gap-2 space-between margin-0">
                <Col xs={2} align="start" className="padding-0">
                    <UnifiedDropdown
                        type="payer"
                        label="Płatnik"
                        personInDropdown={payer}
                        setPersonInDropdown={setPayer}
                    />
                </Col>
                <Col xs="auto" className="padding-0">
                    <Button
                        variant="primary"
                        type="button"
                        onClick={() => addItem(items, setItems)}>
                        Dodaj rzecz
                    </Button>
                </Col>
                <Col xs="auto" align="end" className="padding-0">
                    <Button variant="success" type="submit">
                        {buttonLabel}
                    </Button>
                </Col>
            </Row>
            <div className="mt-3" key={"unified-form-main-div"}>
                {items.map((item) => (
                    <UnifiedItem
                        key={`item-${item.id}`}
                        formId={formId}
                        index={Number(item.id)}
                        items={items}
                        setItems={setItems}
                        updateItem={updateItem}
                        removeItem={removeItem}
                        showQuantity={showQuantity}
                    />
                ))}
            </div>
        </form>
    );
};

export default UnifiedForm;
