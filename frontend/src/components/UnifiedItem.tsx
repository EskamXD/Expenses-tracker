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
} from "@/components/ui/select"; // Shadcn Select
import { X } from "lucide-react"; // Ikona zamykania
import UnifiedDropdown from "./UnifiedDropdown";
import "../assets/styles/main.css";
import { Item } from "../types";

interface UnifiedItemProps {
    index: number;
    removeItem: (id: number) => void;
}

export interface UnifiedItemRef {
    getItemData: () => Item | null;
}

const UnifiedItem = forwardRef<UnifiedItemRef, UnifiedItemProps>(
    ({ index, removeItem }, ref) => {
        // 🔹 Lokalny stan dla każdej wartości
        const [category, setCategory] = useState<string>("");
        const [value, setValue] = useState<string>("");
        const [description, setDescription] = useState<string>("");
        const [owners, setOwners] = useState<number[]>([]);
        const [quantity, setQuantity] = useState<number>(1); // 👈 Poprawione na `number`

        // 🔹 Udostępnianie danych do `UnifiedForm` przez ref
        useImperativeHandle(ref, () => ({
            getItemData: () => {
                // Walidacja przed wysłaniem
                if (
                    !category ||
                    !value ||
                    !description ||
                    owners.length === 0
                ) {
                    return null; // Nie zwracaj niekompletnego itemu
                }
                return {
                    id: index,
                    category,
                    value,
                    description,
                    owners,
                    quantity: Number(quantity), // 👈 Konwersja do liczby
                };
            },
        }));

        return (
            <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-white shadow-md">
                {/* Kategoria */}
                <div className="flex flex-col w-1/5 min-w-[150px]">
                    <Label htmlFor={`category-${index}`}>Kategoria</Label>
                    <Select onValueChange={setCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Wybierz kategorię" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="food">Jedzenie</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Kwota */}
                <div className="flex flex-col w-1/5 min-w-[150px]">
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
                <div className="flex flex-col w-1/5 min-w-[150px]">
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
                <div className="flex flex-col w-1/5 min-w-[100px]">
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
                <div className="flex flex-col w-auto">
                    <Label>Właściciele</Label>
                    <UnifiedDropdown
                        label="Wybierz właścicieli"
                        personInDropdown={owners}
                        setPersonInDropdown={setOwners}
                    />
                </div>

                {/* Usuwanie itemu */}
                <div className="flex items-center">
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

