/**
 * @file ExpensesForm.jsx
 * @brief A React component for managing and submitting expense items.
 *
 * This file defines the ExpensesForm component, which wraps the UnifiedForm component
 * to handle expense-specific logic, such as setting items, payer, and managing form state.
 */

import React from "react";
import UnifiedForm from "./UnifiedForm";

/**
 * @brief Renders a form for managing expenses.
 *
 * The ExpensesForm component uses the UnifiedForm to render and manage a list of expense items.
 * It handles user interactions, such as adding, removing, and submitting expense items, as well as
 * selecting the payer for these expenses.
 *
 * @param {Object[]} items - An array of expense items.
 * @param {Function} setItems - A function to update the list of expense items.
 * @param {string} payer - The current payer selected for the expenses.
 * @param {Function} setPayer - A function to update the selected payer.
 * @param {Function} handleSubmit - A function to handle form submission.
 * @param {boolean} resetForm - A flag to indicate if the form should be reset.
 * @param {Function} setResetForm - A function to reset the form state.
 *
 * @return {JSX.Element} A form component for managing expense items.
 */
const ExpensesForm = ({
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
            formId="expenses" /**< A unique identifier for the form. */
            buttonLabel="Zapisz wydatek" /**< Label for the form's submit button. */
            showAddItemButton={
                false
            } /**< Determines if the "Add Item" button is shown. */
            allowRemoveItem={false} /**< Determines if items can be removed. */
        />
    );
};

export default ExpensesForm;
