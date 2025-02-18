import React, { useState } from "react";
import { useGlobalContext } from "../context/GlobalContext";
import { categoryOptions } from "../lib/select-option";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

const CategoriesDropdown: React.FC<{
    transactionType: "expense" | "income";
}> = ({ transactionType }) => {
    const { summaryFilters, setSummaryFilters } = useGlobalContext();
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        summaryFilters.category || []
    );

    const availableCategories = categoryOptions[transactionType] || [];

    const handleCategoryChange = (category: string) => {
        const newCategories = selectedCategories.includes(category)
            ? selectedCategories.filter((c) => c !== category)
            : [...selectedCategories, category];

        setSelectedCategories(newCategories);
        setSummaryFilters((prev) => ({
            ...prev,
            category: newCategories,
        }));
    };

    // Funkcja do zaznaczania / odznaczania wszystkich kategorii
    const handleToggleAll = () => {
        if (selectedCategories.length === 0) {
            const newCategories = availableCategories.map((cat) => cat.value);
            setSelectedCategories(newCategories);
            setSummaryFilters((prev) => ({
                ...prev,
                category: newCategories,
            }));
        } else {
            setSelectedCategories([]);
            setSummaryFilters((prev) => ({
                ...prev,
                category: [],
            }));
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-60 justify-between">
                    {selectedCategories.length > 0
                        ? `Wybrano ${selectedCategories.length}`
                        : "Wybierz kategorie"}
                    <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-2">
                {availableCategories.map((category) => (
                    <label
                        key={category.value}
                        className="flex items-center space-x-2 py-1">
                        <Checkbox
                            checked={selectedCategories.includes(
                                category.value
                            )}
                            onCheckedChange={() =>
                                handleCategoryChange(category.value)
                            }
                        />
                        <span>{category.label}</span>
                    </label>
                ))}
                {/* Separator */}
                <div className="border-t mt-2 pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleAll}
                        className="w-full">
                        {selectedCategories.length === 0
                            ? "Zaznacz wszystkie"
                            : "Odznacz wszystkie"}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default CategoriesDropdown;

