import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; // Shadcn Button
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-full">
                <Button variant="outline">
                    Wybierz osobę{" "}
                    {summaryFilters.owners.length > 0 &&
                        `(${summaryFilters.owners.length})`}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                <DropdownMenuLabel>Wybierz osobę</DropdownMenuLabel>
                {persons.map(({ id, name }: Person) => (
                    <DropdownMenuCheckboxItem
                        key={id}
                        checked={summaryFilters.owners.includes(id)}
                        onCheckedChange={() => toggleOwner(id)}>
                        {name}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default SummaryDropdown;
