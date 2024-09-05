/**
 * @file ExpenseRow.jsx
 * @brief A React component for rendering a row in a summary table of expenses.
 *
 * This file defines the TableRow component, which is used to render individual rows
 * in a table that displays expense data. Each row shows the category, value, payment date,
 * and an action button for more details.
 */

import React from "react";
import { Button } from "react-bootstrap";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { selectTranslationList } from "../config/selectOption";

/**
 * @brief Renders a table row for a given expense item.
 *
 * The TableRow component displays details of an individual expense item in a table format.
 * It includes the expense category, value, payment date, and an action button to trigger
 * a detailed view or additional information.
 *
 * @param {Object} listRow - The expense item to display. Contains details like category, value, and payment date.
 * @param {Function} handleShow - Function to handle showing detailed information about the expense item.
 *
 * @return {JSX.Element} A table row element displaying the expense item details.
 */
const TableRow = ({ listRow, handleShow, transactionType }) => {
    return listRow ? (
        <tr key={`${listRow.category}-${listRow.payment_date}-${listRow.id}`}>
            <td width={"30%"}>
                {selectTranslationList.find(
                    (option) => option.value === listRow.category
                )?.label || listRow.category}
            </td>
            <td width={"30%"}>{parseFloat(listRow.value).toFixed(2)}</td>
            <td width={"30%"}>{listRow.payment_date}</td>
            <td width={"1%"}>
                <Button
                    id={`info-button-${listRow.id}`}
                    variant="light"
                    onClick={() => handleShow(listRow.id)}>
                    {/* Optional: Icon or image to visually indicate more information */}
                    <InfoRoundedIcon />
                </Button>
            </td>
        </tr>
    ) : (
        <tr>
            <td colSpan={4}>Nie znaleziono żadnych wydatków</td>
        </tr>
    );
};

export default TableRow;
