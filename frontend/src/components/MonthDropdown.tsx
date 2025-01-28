import React, { useEffect } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { useGlobalContext } from "../context/GlobalContext";
import { Params } from "../types";

const MonthDropdown = () => {
    const { summaryFilters, setSummaryFilters } = useGlobalContext();

    const getMonthName = (month: number) =>
        new Date(0, month - 1).toLocaleString("default", { month: "long" });

    const handleSelect = (eventKey: string | null) => {
        if (!eventKey) return;
        const newMonth = parseInt(eventKey, 10);
        setSummaryFilters((prevFilters: Params) => ({
            ...prevFilters,
            month: newMonth,
        }));
    };

    return (
        <DropdownButton
            id="dropdown-basic-button-month"
            title={`Wybierz miesiąc: ${
                summaryFilters.month
                    ? getMonthName(summaryFilters.month)
                    : "Brak"
            }`}
            className="mr-1rem"
            onSelect={handleSelect}>
            {[...Array(12)].map((_, index) => (
                <Dropdown.Item key={index + 1} eventKey={`${index + 1}`}>
                    {getMonthName(index + 1)}
                </Dropdown.Item>
            ))}
        </DropdownButton>
    );
};

export default MonthDropdown;

