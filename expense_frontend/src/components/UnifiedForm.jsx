/**
 * @file UnifiedForm.jsx
 * @brief A React component for handling a unified form interface.
 *
 * This file defines the UnifiedForm component, which provides a form interface for handling
 * different types of transactions, such as adding items, setting payment dates, and selecting payers.
 */

import React, { useEffect } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import PayerDropdown from "./PayerDropdown";
import UnifiedItem from "./UnifiedItem";
import { addItem, removeItem } from "../utils/receiptItemsHandler";
import moment from "moment";

import "../assets/styles/main.css";

/**
 * @brief Renders a form for handling different types of transactions.
 *
 * The UnifiedForm component is a generic form that can handle various transaction inputs,
 * including setting payment dates, selecting a payer, and adding or removing items.
 * It utilizes child components for dropdowns and item handling.
 *
 * @param {Function} setPaymentDate - Function to set the payment date.
 * @param {string} shop - The shop name associated with the transaction.
 * @param {Function} setShop - Function to set the shop name.
 * @param {string} payer - The current payer for the transaction.
 * @param {Function} setPayer - Function to update the payer.
 * @param {Object[]} items - List of items to manage within the form.
 * @param {Function} setItems - Function to update the list of items.
 * @param {Function} handleSubmit - Function to handle form submission.
 * @param {boolean} resetForm - Flag to indicate if the form should be reset.
 * @param {Function} setResetForm - Function to reset the form state.
 * @param {string} formId - A unique identifier for the form.
 * @param {string} buttonLabel - The label text for the submit button.
 * @param {boolean} showQuantity - Whether to show the quantity input for each item.
 * @param {boolean} showAddItemButton - Whether to show a button to add more items.
 * @param {boolean} allowRemoveItem - Whether to allow items to be removed.
 * @param {Object[]} selectOptions - Options for selecting categories or types.
 *
 * @return {JSX.Element} A form component for managing transactions.
 */
const UnifiedForm = ({
    paymentDate,
    setPaymentDate,
    shop,
    setShop,
    payer,
    setPayer,
    items,
    setItems,
    handleSubmit,
    resetForm,
    setResetForm,
    formId,
    buttonLabel,
    showQuantity = false,
    showAddItemButton = false,
    allowRemoveItem = false,
    selectOptions,
}) => {
    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setPaymentDate(today);

        // Initialize items with the current date
        setItems((prevItems) =>
            prevItems.map((item) => ({ ...item, paymentDate: today }))
        );
    }, [formId, setItems, setPaymentDate]);

    useEffect(() => {
        if (resetForm) {
            setItems([
                {
                    id: 1,
                    category: "food_drinks",
                    value: "",
                    description: "",
                    quantity: "",
                    owner: 1,
                    paymentDate: new Date().toISOString().split("T")[0],
                },
            ]);
            setResetForm(false);
        }
    }, [resetForm, setItems, setResetForm]);

    const handleDateChange = (e) => {
        const newDate = moment(e.target.value).format("YYYY-MM-DD");
        setPaymentDate(newDate);
        setItems((prevItems) =>
            prevItems.map((item) => ({ ...item, paymentDate: newDate }))
        );
    };

    return (
        <form onSubmit={handleSubmit}>
            <Form.Control
                id={`${formId}-calendar`}
                type="date"
                className="mb-3 mt-1rem"
                value={paymentDate} // Ensuring form uses state for date
                onChange={handleDateChange}
            />
            {setShop && (
                <Form.Control
                    type="text"
                    placeholder="Sklep"
                    className="mb-3"
                    value={shop}
                    onChange={(e) => setShop(e.target.value)}
                />
            )}
            <Row className="d-flex gap-2 space-between">
                <Col xs={2}>
                    <PayerDropdown payer={payer} setPayer={setPayer} />
                </Col>
                {showAddItemButton && (
                    <Col xs="auto">
                        <Button
                            variant="primary"
                            type="button"
                            onClick={() => addItem(items, setItems)}>
                            Dodaj rzecz
                        </Button>
                    </Col>
                )}
                <Col xs="auto" align="end">
                    <Button variant="success" type="submit">
                        {buttonLabel}
                    </Button>
                </Col>
            </Row>
            <div className="mt-3">
                {items
                    .slice(0, !showAddItemButton ? 1 : items.length)
                    .map((item) => (
                        <UnifiedItem
                            key={item.id}
                            item={item}
                            items={items}
                            setItems={setItems}
                            removeItem={
                                allowRemoveItem ? removeItem : undefined
                            }
                            selectOptions={selectOptions}
                            showQuantity={showQuantity}
                        />
                    ))}
            </div>
        </form>
    );
};

export default UnifiedForm;

