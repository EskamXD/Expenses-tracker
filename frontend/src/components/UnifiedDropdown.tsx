import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import z shadcn
import { Button } from "@/components/ui/button"; // Shadcn Button
import { useGlobalContext } from "../context/GlobalContext";
import React from "react";

interface UnifiedDropdownProps {
    label?: string;
    personInDropdown: number | number[];
    setPersonInDropdown:
        | React.Dispatch<React.SetStateAction<number>>
        | React.Dispatch<React.SetStateAction<number[]>>;
}

export const UnifiedDropdown: React.FC<UnifiedDropdownProps> = ({
    label = "Wybierz",
    personInDropdown,
    setPersonInDropdown,
}) => {
    const { persons } = useGlobalContext(); // Pobieranie listy osób

    const handleChange = (selectedId: number) => {
        if (Array.isArray(personInDropdown)) {
            (
                setPersonInDropdown as React.Dispatch<
                    React.SetStateAction<number[]>
                >
            )((prev) =>
                prev.includes(selectedId)
                    ? prev.filter((id) => id !== selectedId)
                    : [...prev, selectedId]
            );
        } else {
            (
                setPersonInDropdown as React.Dispatch<
                    React.SetStateAction<number>
                >
            )(selectedId);
        }
    };

    const isMultiSelect = Array.isArray(personInDropdown); // Czy checkboxy czy radio
    const dropdownHeader = isMultiSelect
        ? "Wybierz właścicieli"
        : "Wybierz płatnika";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    {label}{" "}
                    {isMultiSelect
                        ? `(${personInDropdown.length})`
                        : persons.find((p) => p.id === personInDropdown)
                              ?.name || "Wybierz"}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                <DropdownMenuLabel>{dropdownHeader}</DropdownMenuLabel>

                {isMultiSelect ? (
                    persons.map((person) => (
                        <DropdownMenuCheckboxItem
                            key={person.id}
                            checked={personInDropdown.includes(person.id)}
                            onCheckedChange={() => handleChange(person.id)}>
                            {person.name}
                        </DropdownMenuCheckboxItem>
                    ))
                ) : (
                    <DropdownMenuRadioGroup
                        value={String(personInDropdown)}
                        onValueChange={(value) => handleChange(Number(value))}>
                        {persons.map((person) => (
                            <DropdownMenuRadioItem
                                key={person.id}
                                value={String(person.id)}>
                                {person.name}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UnifiedDropdown;

