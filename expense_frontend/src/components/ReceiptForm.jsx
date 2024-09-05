/**
 * @file ReceiptForm.jsx
 * @brief A React component for managing and submitting receipt items.
 *
 * This file defines the ReceiptForm component, which wraps the UnifiedForm component
 * to handle receipt-specific logic, such as managing items, selecting the payer, and handling form submission.
 */

import React from "react";
import UnifiedForm from "./UnifiedForm";

/**
 * @brief Renders a form for managing receipt items.
 *
 * The ReceiptForm component utilizes the UnifiedForm component to render and manage a list of receipt items.
 * It handles user interactions such as adding, removing, and submitting receipt items, and selecting the payer.
 *
 * @param {Object[]} items - An array of receipt items.
 * @param {Function} setItems - A function to update the list of receipt items.
 * @param {string} payer - The current payer selected for the receipt.
 * @param {Function} setPayer - A function to update the selected payer.
 * @param {Function} handleSubmit - A function to handle form submission.
 * @param {boolean} resetForm - A flag to indicate if the form should be reset.
 * @param {Function} setResetForm - A function to reset the form state.
 *
 * @return {JSX.Element} A form component for managing receipt items.
 */
const ReceiptForm = ({
    items,
    setItems,
    payer,
    setPayer,
    handleSubmit,
    resetForm,
    setResetForm,
}) => {
    return (
        <UnifiedForm
            items={items}
            setItems={setItems}
            payer={payer}
            setPayer={setPayer}
            handleSubmit={handleSubmit}
            resetForm={resetForm}
            setResetForm={setResetForm}
            formId="receipt" /**< A unique identifier for the form. */
            buttonLabel="Zapisz paragon" /**< Label for the form's submit button. */
            showAddItemButton={
                true
            } /**< Determines if the "Add Item" button is shown. */
            allowRemoveItem={true} /**< Determines if items can be removed. */
        />
    );
};

export default ReceiptForm;
