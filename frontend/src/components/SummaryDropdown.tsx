import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { useGlobalContext } from "../context/GlobalContext";
import { Person } from "../types";

const SummaryDropdown = () => {
    const { persons, summaryFilters, setSummaryFilters } = useGlobalContext();

    const toggleOwner = (id: number) => {
        setSummaryFilters((prev) => ({
            ...prev,
            owners: prev.owners.includes(id)
                ? prev.owners.filter((owner: number) => owner !== id)
                : [...prev.owners, id],
        }));
    };

    return (
        <Dropdown id="dropdown-basic-button-summary">
            <Dropdown.Toggle>Wybierz osobę</Dropdown.Toggle>
            <Dropdown.Menu>
                {persons.map(({ id, name }: Person) => (
                    <Dropdown.Item
                        key={id}
                        as="label"
                        className="d-flex align-items-center gap-2"
                        onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            checked={summaryFilters.owners.includes(id)}
                            onChange={() => toggleOwner(id)}
                            style={{ marginRight: "8px" }}
                        />
                        {name}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default SummaryDropdown;

