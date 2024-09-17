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

interface YearDropdownProps {
    selectedYear: number;
    setSelectedYear: any;
    disabled: boolean;
}

/**
 * @brief Renders a dropdown component for selecting a year.
 *
 * The YearDropdown component provides a dropdown menu that allows users to select a year.
 * It displays the current year and the four preceding years by default.
 *
 * @component YearDropdown
 *
 * @param {number} selectedYear - The currently selected year.
 * @param {Function} setSelectedYear - A function to handle the year selection change.
 * @param {boolean} disabled - A flag to indicate if the dropdown is disabled.
 *
 * @return {JSX.Element} A dropdown component for selecting a year.
 */
const YearDropdown: React.FC<YearDropdownProps> = ({
    selectedYear,
    setSelectedYear,
    disabled,
}) => {
    const handleSelect = (eventKey: any) => {
        setSelectedYear(eventKey);
    };
    return (
        <DropdownButton
            id="dropdown-basic-button-year"
            title={`Wybierz rok: ${selectedYear}`}
            onSelect={handleSelect}
            disabled={disabled}>
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
