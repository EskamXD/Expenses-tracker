import { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button"; // Shadcn Button
import { Input } from "@/components/ui/input"; // Shadcn Input
import { Label } from "@/components/ui/label"; // Shadcn Label
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import UnifiedDropdown from "@/components/unified-dropdown";
import {
    selectExpensesOptions,
    selectIncomeOptions,
} from "@/config/selectOption";
// import "../assets/styles/main.css";
import { Item } from "@/types";

interface UnifiedItemProps {
    index: number;
    formId: string;
    removeItem: (id: number) => void;
    showQuantity: boolean;
    initialData?: Item; // Dodajemy opcjonalny prop z danymi
}

export interface UnifiedItemRef {
    getItemData: () => Item | null;
}

const UnifiedItem = forwardRef<UnifiedItemRef, UnifiedItemProps>(
    ({ index, formId, removeItem, initialData }, ref) => {
        const categoriesToMap = () => {
            if (formId === "expense-form") {
                return selectExpensesOptions;
            } else if (formId === "income-form") {
                return selectIncomeOptions;
            } else {
                throw new Error("Invalid form index");
            }
        };

        // 🔹 Lokalny stan dla każdej wartości
        const [category, setCategory] = useState<string>("");
        const [value, setValue] = useState<string>("");
        const [description, setDescription] = useState<string>("");
        const [owners, setOwners] = useState<number[]>([]);
        const [quantity, setQuantity] = useState<number>(1); // 👈 Poprawione na `number`

        // 🔹 Udostępnianie danych do `UnifiedForm` przez ref
        useImperativeHandle(ref, () => ({
            getItemData: () => {
                if (
                    !category ||
                    !value ||
                    !description ||
                    owners.length === 0
                ) {
                    return null;
                }
                console.log(index, category, value, description, owners);
                return {
                    id: index,
                    category,
                    value,
                    description,
                    owners,
                    quantity: Number(quantity),
                };
            },
        }));

        return (
            <div className="flex flex-wrap justify-between gap-4 p-4 border rounded-lg shadow-md">
                {/* Kategoria */}
                <div className="flex flex-col w-1/5 min-w-[150px] gap-1">
                    <Label htmlFor={`category-${index}`}>Kategoria</Label>
                    <Select onValueChange={setCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Wybierz kategorię" />
                        </SelectTrigger>
                        <SelectContent>
                            {categoriesToMap().map(
                                (
                                    category: { value: string; label: string },
                                    index: number
                                ) => (
                                    <SelectItem
                                        key={index}
                                        value={category.value}>
                                        {category.label}
                                    </SelectItem>
                                )
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Kwota */}
                <div className="flex flex-col w-1/8 min-w-[50px] gap-1">
                    <Label htmlFor={`value-${index}`}>Kwota</Label>
                    <Input
                        type="text"
                        id={`value-${index}`}
                        placeholder="Kwota"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </div>

                {/* Opis */}
                <div className="flex flex-col w-1/5 min-w-[150px] gap-1">
                    <Label htmlFor={`description-${index}`}>Opis/Nazwa</Label>
                    <Input
                        type="text"
                        id={`description-${index}`}
                        placeholder="Opis/Nazwa"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Ilość */}
                <div className="flex flex-col w-1/10 min-w-[20px] gap-1">
                    <Label htmlFor={`quantity-${index}`}>Ilość</Label>
                    <Input
                        type="number"
                        id={`quantity-${index}`}
                        placeholder="Ilość"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </div>

                {/* Właściciele */}
                <div className="flex flex-col w-auto gap-1">
                    <Label>Właściciele</Label>
                    <UnifiedDropdown
                        label="Wybierz właścicieli"
                        personInDropdown={owners}
                        setPersonInDropdown={setOwners}
                    />
                </div>

                {/* Usuwanie itemu */}
                <div className="flex items-end">
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeItem(index)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        );
    }
);

export default UnifiedItem;
