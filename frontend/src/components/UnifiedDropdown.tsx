import { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import "../assets/styles/main.css";
import { Person } from "../types";
import { useGlobalContext } from "../context/GlobalContext";

interface UnifiedDropdownProps {
    label?: string;
    payer?: number;
    setPayer?: Function;
    owner?: number[];
    setOwner?: Function;
}

export const UnifiedDropdown: React.FC<UnifiedDropdownProps> = ({
    label = "Wybierz",
    payer,
    setPayer,
    owner = [],
    setOwner,
}) => {
    const { persons } = useGlobalContext(); // Pobieranie danych z kontekstu

    const [localPayer, setLocalPayer] = useState<number | undefined>(payer);
    const [localOwners, setLocalOwners] = useState<number[]>(owner);

    const handlePayerChange = (newPayer: number) => {
        setLocalPayer(newPayer);
        if (setPayer) setPayer(newPayer);
    };

    const handleOwnerChange = (ownerId: number) => {
        const updatedOwners = localOwners.includes(ownerId)
            ? localOwners.filter((id) => id !== ownerId)
            : [...localOwners, ownerId];
        setLocalOwners(updatedOwners);
        if (setOwner) setOwner(updatedOwners);
    };

    return (
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-unified">
                {label}{" "}
                {label === "Płatnik"
                    ? persons.find((p) => p.id === localPayer)?.name
                    : localOwners.length}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {setPayer && payer !== undefined && (
                    <>
                        {/* Payer Section */}
                        <Dropdown.Header>Wybierz płatnika</Dropdown.Header>
                        {persons
                            .filter((person: Person) => person.payer)
                            .map((person: Person) => (
                                <Dropdown.Item key={person.id} as="label">
                                    <p style={{ userSelect: "none" }}>
                                        <input
                                            type="radio"
                                            name="payer"
                                            value={person.id}
                                            checked={localPayer === person.id}
                                            onChange={() =>
                                                handlePayerChange(person.id)
                                            }
                                            style={{ marginRight: "8px" }}
                                        />
                                        {person.name}
                                    </p>
                                </Dropdown.Item>
                            ))}
                        <Dropdown.Divider />
                    </>
                )}

                {setOwner && owner !== undefined && (
                    <>
                        {/* Owners Section */}
                        <Dropdown.Header>Wybierz właścicieli</Dropdown.Header>
                        {persons.map((person: Person) => (
                            <Dropdown.Item
                                key={person.id}
                                as="label"
                                onClick={(e) => e.stopPropagation()}>
                                <p style={{ userSelect: "none" }}>
                                    <input
                                        type="checkbox"
                                        value={person.id}
                                        checked={localOwners.includes(
                                            person.id
                                        )}
                                        onChange={() =>
                                            handleOwnerChange(person.id)
                                        }
                                        style={{ marginRight: "8px" }}
                                    />
                                    {person.name}
                                </p>
                            </Dropdown.Item>
                        ))}
                    </>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default UnifiedDropdown;
