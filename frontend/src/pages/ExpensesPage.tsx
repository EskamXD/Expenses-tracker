/**
 * @file ExpensesPage.jsx
 * @brief A React component for managing and adding expense items.
 *
 * This file defines the ExpensesPage component, which allows users to add expense items
 * and manage them through a unified form interface. It includes functionality for adding
 * single expense items as well as multiple items under a single receipt.
 */

import { Breadcrumb } from "react-bootstrap";
import { Link } from "react-router-dom";
import UnifiedForm from "../components/UnifiedForm";

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

            <UnifiedForm
                formId="expense-form"
                buttonLabel="Zapisz paragon"
                showShop={true}
                showQuantity={true}
            />
        </>
    );
};

export default ExpensesPage;
