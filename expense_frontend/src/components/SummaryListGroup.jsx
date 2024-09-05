/**
 * @file SummaryListGroup.jsx
 * @brief A React component that renders a list of dropdowns for selecting owner, year, and month.
 *
 * This component provides a summary of dropdowns that allow users to select the transaction owner, year, and month.
 * It leverages `SummaryDropdown`, `YearDropdown`, and `MonthDropdown` components to manage the state of the selected
 * owner, year, and month.
 */

import React from "react";
import { ListGroup } from "react-bootstrap";
import SummaryDropdown from "./SummaryDropdown";
import YearDropdown from "./YearDropdown";
import MonthDropdown from "./MonthDropdown";

/**
 * @brief A React component to display dropdowns for selecting owner, year, and month.
 *
 * This component renders three dropdowns in a horizontal list, allowing the user to select:
 * - Owner (e.g., "Kamil", "Ania")
 * - Year
 * - Month
 *
 * It uses the `SummaryDropdown`, `YearDropdown`, and `MonthDropdown` components to provide these dropdowns.
 *
 * @component
 * @param {Object} props - The props for the component.
 * @param {string} props.selectedOwner - The currently selected owner.
 * @param {function} props.setSelectedOwner - Function to set the selected owner.
 * @param {number} props.selectedYear - The currently selected year.
 * @param {function} props.setSelectedYear - Function to set the selected year.
 * @param {number} props.selectedMonth - The currently selected month.
 * @param {function} props.setSelectedMonth - Function to set the selected month.
 * @param {boolean} props.itemsLoaded - Boolean flag to indicate if items have been loaded, used to enable/disable dropdowns.
 * @returns {JSX.Element} A JSX element that renders a horizontal list of dropdowns for owner, year, and month selection.
 *
 * @example
 * <SummaryListGroup
 *   selectedOwner="Kamil"
 *   setSelectedOwner={setSelectedOwner}
 *   selectedYear={2023}
 *   setSelectedYear={setSelectedYear}
 *   selectedMonth={9}
 *   setSelectedMonth={setSelectedMonth}
 *   itemsLoaded={true}
 * />
 */
const SummaryListGroup = ({
    selectedOwner,
    setSelectedOwner,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    itemsLoaded,
}) => (
    <ListGroup horizontal>
        <ListGroup.Item>
            <SummaryDropdown
                selectedOwner={selectedOwner}
                setSelectedOwner={setSelectedOwner}
            />
        </ListGroup.Item>
        <ListGroup.Item>
            <YearDropdown
                selectedYear={selectedYear}
                onSelect={setSelectedYear}
                disabled={!itemsLoaded}
            />
        </ListGroup.Item>
        <ListGroup.Item>
            <MonthDropdown
                selectedMonth={selectedMonth}
                onSelect={setSelectedMonth}
                disabled={!itemsLoaded}
            />
        </ListGroup.Item>
    </ListGroup>
);

export default SummaryListGroup;
