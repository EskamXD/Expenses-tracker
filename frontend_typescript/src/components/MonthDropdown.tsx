/**
 * @file MonthDropdown.js
 * @brief A React component for selecting a month from a dropdown menu.
 *
 * This file defines the MonthDropdown component, which allows users to select
 * a month from a dropdown menu. The dropdown includes the current month and the four previous months.
 */

import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

interface MonthDropdownProps {
    selectedMonth: number;
    setSelectedMonth: any;
    disabled: boolean;
}

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
 * @param {number} selectedMonth - The currently selected month.
 * @param {Function} setSelectedMonth - A function to handle the month selection change.
 * @param {boolean} disabled - A flag to indicate if the dropdown is disabled.
 *
 * @returns {JSX.Element} A dropdown component that allows users to select a month.
 */
const MonthDropdown: React.FC<MonthDropdownProps> = ({
    selectedMonth,
    setSelectedMonth,
    disabled,
}) => {
    /**
     * @brief Gets the full month name from a month number.
     *
     * This function takes a month number (1-12) and returns the full name
     * of the month in the current locale.
     *
     * @param {number} month - The month number (1 for January, 12 for December).
     * @returns {string} The full name of the month.
     */
    const getMonthName = (month: number) => {
        return new Date(0, month - 1).toLocaleString("default", {
            month: "long",
        });
    };

    const handleSelect = (eventKey: any) => {
        setSelectedMonth(eventKey);
    };

    return (
        <DropdownButton
            id="dropdown-basic-button-month"
            title={`Wybierz miesiąc: ${getMonthName(selectedMonth)}`}
            className="mr-1rem"
            onSelect={handleSelect}
            disabled={disabled}>
            {[...Array(12)].map((_, index) => (
                <Dropdown.Item
                    key={index + 1}
                    eventKey={index + 1}
                    selected={index + 1 === selectedMonth}>
                    {new Date(0, index).toLocaleString("default", {
                        month: "long",
                    })}
                </Dropdown.Item>
            ))}
        </DropdownButton>
    );
};

export default MonthDropdown;
