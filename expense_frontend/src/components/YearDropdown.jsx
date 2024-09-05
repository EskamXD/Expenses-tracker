/**
 * @file YearDropdown.js
 * @brief A React component for selecting a year from a dropdown menu.
 *
 * This file defines the YearDropdown component, which allows users to select
 * a year from a dropdown menu. The dropdown includes the current year and the four previous years.
 */

import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

/**
 * @brief Renders a dropdown component for selecting a year.
 *
 * The YearDropdown component provides a dropdown menu that allows users to select a year.
 * It displays the current year and the four preceding years by default.
 *
 * @param {number} selectedYear - The currently selected year.
 * @param {Function} onSelect - A function to handle the year selection change.
 *
 * @return {JSX.Element} A dropdown component for selecting a year.
 */
const YearDropdown = ({ selectedYear, onSelect }) => {
    return (
        <DropdownButton
            id="dropdown-basic-button-year"
            title={`Wybierz rok: ${selectedYear}`}
            onSelect={onSelect}>
            {[...Array(5)].map((_, index) => (
                <Dropdown.Item
                    key={index}
                    eventKey={new Date().getFullYear() - index}>
                    {new Date().getFullYear() - index}
                </Dropdown.Item>
            ))}
        </DropdownButton>
    );
};

export default YearDropdown;
