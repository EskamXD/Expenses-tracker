import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

/**
 * @file MonthDropdown.js
 * @brief A React component that provides a dropdown menu for selecting a month.
 *
 * This component displays a dropdown button with a list of months. It uses
 * React Bootstrap for styling and dropdown behavior. When a month is selected,
 * the selected month is passed to the parent component via the onSelect callback.
 *
 * @component MonthDropdown
 *
 * @param {Object} props - The properties object.
 * @param {number} props.selectedMonth - The currently selected month (1-12).
 * @param {function} props.onSelect - The callback function to handle month selection.
 *
 * @returns {JSX.Element} A dropdown component that allows users to select a month.
 */
const MonthDropdown = ({ selectedMonth, onSelect }) => {
    /**
     * @brief Gets the full month name from a month number.
     *
     * This function takes a month number (1-12) and returns the full name
     * of the month in the current locale.
     *
     * @param {number} month - The month number (1 for January, 12 for December).
     * @returns {string} The full name of the month.
     */
    const getMonthName = (month) => {
        return new Date(0, month - 1).toLocaleString("default", {
            month: "long",
        });
    };

    return (
        <DropdownButton
            id="dropdown-basic-button-month"
            title={`Wybierz miesiąc: ${getMonthName(selectedMonth)}`}
            className="mr-1rem"
            onSelect={onSelect}>
            {[...Array(12)].map((_, index) => (
                <Dropdown.Item key={index + 1} eventKey={index + 1}>
                    {new Date(0, index).toLocaleString("default", {
                        month: "long",
                    })}
                </Dropdown.Item>
            ))}
        </DropdownButton>
    );
};

export default MonthDropdown;
