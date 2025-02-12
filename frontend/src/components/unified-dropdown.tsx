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

    // Funkcja przyjmuje dodatkowy argument "checked", który mówi, czy dany element został zaznaczony
    const handleChange = (selectedId: number, checked: boolean) => {
        if (Array.isArray(personInDropdown)) {
            if (checked) {
                setPersonInDropdown((prev) => {
                    if (!prev.includes(selectedId)) {
                        return [...prev, selectedId];
                    }
                    return prev;
                });
            } else {
                setPersonInDropdown((prev) =>
                    prev.filter((id) => id !== selectedId)
                );
            }
        } else {
            // Dla single select po prostu ustawiamy wartość
            setPersonInDropdown(selectedId);
        }
    };

    const isMultiSelect = Array.isArray(personInDropdown); // Czy multi select czy single
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
                            // onCheckedChange przekazuje boolean – rzutujemy typ (checked as boolean)
                            onCheckedChange={(checked) =>
                                handleChange(person.id, checked as boolean)
                            }>
                            {person.name}
                        </DropdownMenuCheckboxItem>
                    ))
                ) : (
                    <DropdownMenuRadioGroup
                        value={String(personInDropdown)}
                        onValueChange={(value) =>
                            handleChange(Number(value), true)
                        }>
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
