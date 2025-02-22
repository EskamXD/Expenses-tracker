import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import z shadcn
import { Button } from "@/components/ui/button"; // Shadcn Button
import { useGlobalContext } from "../context/GlobalContext";

interface PayerDropdownProps {
    payer: number;
    setPayer: React.Dispatch<React.SetStateAction<number>>;
}

const PayerDropdown: React.FC<PayerDropdownProps> = ({ payer, setPayer }) => {
    const { persons } = useGlobalContext();

    const handlePayerChange = (value: string) => {
        setPayer(Number(value));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    {persons.find((p) => p.id === payer)?.name ||
                        "Wybierz płatnika"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Płatnik</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                    value={String(payer)}
                    onValueChange={handlePayerChange}>
                    {persons.map((person) => (
                        <DropdownMenuRadioItem
                            key={person.id}
                            value={String(person.id)}>
                            {person.name}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default PayerDropdown;
