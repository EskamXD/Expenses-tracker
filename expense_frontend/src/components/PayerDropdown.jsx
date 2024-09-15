/**
 * @file PayerDropdown.jsx
 * @brief A React component for selecting a payer from a dropdown menu.
 *
 * This file defines the PayerDropdown component, which allows users to select
 * a payer for a transaction. It can manage state locally or use state management
 * functions provided as props to update the parent component's state.
 */

import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import "../assets/styles/main.css";
import { selectSummaryOptions } from "../config/selectOption";

/**
 * @brief A dropdown component for selecting a payer.
 *
 * The PayerDropdown component provides a dropdown menu to select the payer of a transaction.
 * It uses local state management if `setPayer` is not provided, allowing it to function
 * independently or within a larger form structure.
 *
 * @param {string} payer - The current payer selected for the transaction. Default is "kamil".
 * @param {Function} setPayer - Function to update the selected payer in the parent component.
 *
 * @return {JSX.Element} A dropdown component for selecting the payer of a transaction.
 */
export const PayerDropdown = ({ payer, setPayer }) => {
    const persons = localStorage.getItem("person");
    // console.log(persons);
    const [localPayer, setLocalPayer] = useState(
        payer || 1
    ); /**< State to manage the local payer if `setPayer` is not provided. */

    /**
     * @brief Handles changing the payer of a transaction.
     *
     * This function updates the payer. If `setPayer` is provided, it updates the parent's state.
     * Otherwise, it updates the local state.
     *
     * @param {string} newPayer - The new payer selected from the dropdown.
     */
    const handlePayerChange = (newPayer) => {
        console.log("handlePayerChange", newPayer);
        if (setPayer) {
            // Update state in parent component
            setPayer(newPayer);
            setLocalPayer(newPayer);
        } else {
            // Update local state
            setLocalPayer(newPayer);
        }
    };

    return (
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-payer">
                Payer:{" "}
                {
                    selectSummaryOptions[
                        localPayer
                    ] /**< Display the current payer label from selectSummaryOptions. */
                }
                {console.log(localPayer)}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {JSON.parse(persons)
                    .filter((person) => person.payer === true)
                    .map((person) => (
                        <Dropdown.Item
                            key={person.id}
                            onClick={() => handlePayerChange(person.id)}>
                            {person.name}
                        </Dropdown.Item>
                    ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default PayerDropdown;

