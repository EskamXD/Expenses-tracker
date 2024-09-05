/**
 * @file SummaryDropdown.js
 * @brief A React component for selecting a summary option from a dropdown menu.
 *
 * This file defines the SummaryDropdown component, which allows users to select
 * a summary option. It manages state locally or updates the parent component's state
 * when selection changes, depending on whether the `setSelectedSummary` function is provided.
 */

import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { selectSummaryOptions } from "../config/selectOption";

/**
 * @brief A dropdown component for selecting a summary person.
 *
 * The SummaryDropdown component provides a dropdown menu to select a person or category
 * for the owner. It uses local state management if `setSelectedSummary` is not provided,
 * allowing it to function independently or within a larger form structure.
 *
 * @param {string} selectedOwner - The currently selected owner person or category.
 * @param {Function} setSelectedOwner - Function to update the selected owner in the parent component.
 *
 * @return {JSX.Element} A dropdown component for selecting a owner person.
 */
const SummaryDropdown = ({ selectedOwner, setSelectedOwner }) => {
    const [localOwner, setLocalOwner] = useState(
        selectedOwner || "kamil"
    ); /**< State to manage the local summary if `setSelectedSummary` is not provided. */
    const summaryHandler =
        selectedOwner ||
        localOwner; /**< The current summary, using local state or parent state. */

    /**
     * @brief Handles changing the selected summary.
     *
     * This function updates the summary selection. If `setSelectedSummary` is provided,
     * it updates the parent's state. Otherwise, it updates the local state.
     *
     * @param {string} newOwner - The new summary selected from the dropdown.
     */
    const handleSummaryChange = (newOwner) => {
        // console.log("handleSummaryChange", newSummary);
        if (setSelectedOwner) {
            // Update state in parent component
            setSelectedOwner(newOwner);
        } else {
            // Update local state
            setLocalOwner(newOwner);
        }
    };

    return (
        <Dropdown id="dropdown-basic-button-summary">
            <Dropdown.Toggle>
                Wybierz podsumowanie:{" "}
                {
                    selectSummaryOptions[
                        summaryHandler
                    ] /**< Display the current summary label from selectSummaryOptions. */
                }
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {Object.entries(selectSummaryOptions).map(([key, label]) => (
                    <Dropdown.Item
                        eventKey={key}
                        key={key}
                        onClick={() => handleSummaryChange(key)}>
                        {label}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default SummaryDropdown;
