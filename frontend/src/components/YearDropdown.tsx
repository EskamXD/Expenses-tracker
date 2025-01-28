import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { useGlobalContext } from "../context/GlobalContext";
import { Params } from "../types";

const YearDropdown = () => {
    const { summaryFilters, setSummaryFilters } = useGlobalContext();

    const handleSelect = (eventKey: string | null) => {
        if (!eventKey) return;
        const newMonth = parseInt(eventKey, 10);
        setSummaryFilters((prevFilters: Params) => ({
            ...prevFilters,
            year: newMonth,
        }));
    };
    return (
        <DropdownButton
            id="dropdown-basic-button-year"
            title={`Wybierz rok: ${summaryFilters.year}`}
            onSelect={handleSelect}>
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

