/**
 * @file OwnerDropdown.jsx
 * @brief A React component for selecting the owner of an item from a dropdown menu.
 *
 * This file defines the OwnerDropdown component, which allows users to select an owner
 * for a particular item. It can either manage state locally or update the state in a parent component
 * if `items` and `setItems` are provided.
 */

import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import "../assets/styles/main.css";
import { selectSummaryOptions } from "../config/selectOption";

/**
 * @brief A dropdown component for selecting an item owner.
 *
 * The OwnerDropdown component provides a dropdown menu to select the owner of an item.
 * It uses local state management if `items` and `setItems` are not provided.
 * Otherwise, it updates the parent's state through `setItems`.
 *
 * @param {Object} item - The current item object that contains owner information.
 * @param {Object[]} items - The list of all items to update the owner.
 * @param {Function} setItems - Function to update the list of items.
 *
 * @return {JSX.Element} A dropdown component for selecting the owner of an item.
 */
export const OwnerDropdown = ({ item = {}, items, setItems }) => {
    const [localOwner, setLocalOwner] = useState(
        item.owner || "kamil"
    ); /**< State to manage the local owner if `setItems` is not provided. */
    const id = item.id
        ? item.id
        : 0; /**< Unique identifier for the item, default to 0 if not present. */
    const owner =
        item.owner ||
        localOwner; /**< The current owner, using local state or item state. */

    /**
     * @brief Handles changing the owner of an item.
     *
     * This function updates the owner of the item. If `items` and `setItems` are provided,
     * it will update the parent state. Otherwise, it will update the local state.
     *
     * @param {string} newOwner - The new owner selected from the dropdown.
     */
    const handleOwnerChange = (newOwner) => {
        console.log("handleOwnerChange", newOwner);
        if (items && setItems) {
            // Update state in parent component
            setItems(
                items.map((el) =>
                    el.id === id ? { ...el, owner: newOwner } : el
                )
            );
        } else {
            // Update local state
            setLocalOwner(newOwner);
        }
    };

    return (
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-basic">
                {
                    selectSummaryOptions[
                        owner
                    ] /* < Display the current owner label from selectSummaryOptions. */
                }
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {Object.entries(selectSummaryOptions).map(([key, label]) => (
                    <Dropdown.Item
                        eventKey={key}
                        key={key}
                        onClick={() => handleOwnerChange(key)}>
                        {label}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default OwnerDropdown;
