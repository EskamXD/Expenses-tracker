import React from "react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import z shadcn
import { Button } from "@/components/ui/button"; // Shadcn Button
import { useGlobalContext } from "../context/GlobalContext";

interface OwnersDropdownProps {
    owners: number[];
    setOwners: Function;
}

const OwnersDropdown: React.FC<OwnersDropdownProps> = ({
    owners,
    setOwners,
}) => {
    const { persons } = useGlobalContext();

    const handleOwnerChange = (selectedId: number, checked: boolean) => {
        let newOwners: number[];
        if (checked) {
            newOwners = owners.includes(selectedId)
                ? owners
                : [...owners, selectedId];
        } else {
            newOwners = owners.filter((id) => id !== selectedId);
        }
        setOwners(newOwners);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Właściciele ({owners.length})</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Właściciele</DropdownMenuLabel>
                {persons.map((person) => (
                    <DropdownMenuCheckboxItem
                        key={person.id}
                        checked={owners.includes(person.id)}
                        onCheckedChange={(checked) =>
                            handleOwnerChange(person.id, checked as boolean)
                        }>
                        {person.name}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default OwnersDropdown;

