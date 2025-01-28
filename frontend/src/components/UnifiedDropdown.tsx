import Dropdown from "react-bootstrap/Dropdown";
import "../assets/styles/main.css";
import { Person } from "../types";
import { useGlobalContext } from "../context/GlobalContext";

interface UnifiedDropdownProps {
    type: "payer" | "owner";
    label: string | "";
    personInDropdown: number | number[];
    setPersonInDropdown: Function;
}

export const UnifiedDropdown: React.FC<UnifiedDropdownProps> = ({
    type,
    label = "Wybierz",
    personInDropdown,
    setPersonInDropdown,
}) => {
    const { persons } = useGlobalContext(); // Pobieranie danych z kontekstu

    const handleChange = (newPersonInDropdown: number) => {
        setPersonInDropdown(newPersonInDropdown);
    };

    return (
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-unified">
                {label}{" "}
                {type === "payer" &&
                    persons.find((p) => p.id === personInDropdown)?.name}
                {type === "owner" &&
                    Array.isArray(personInDropdown) &&
                    personInDropdown.length}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {!Array.isArray(personInDropdown) && (
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
                                            checked={
                                                personInDropdown === person.id
                                            }
                                            onChange={() =>
                                                handleChange(person.id)
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

                {Array.isArray(personInDropdown) && (
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
                                        checked={personInDropdown.includes(
                                            person.id
                                        )}
                                        onChange={() => handleChange(person.id)}
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

