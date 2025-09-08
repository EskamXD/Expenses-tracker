import React, { useEffect, useState } from "react";
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
    transactionType: "expense" | "income" | "";
}> = ({ transactionType }) => {
    const { summaryFilters, setSummaryFilters } = useGlobalContext();
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        summaryFilters.category || []
    );

    const availableCategories =
        transactionType === "" ? [] : categoryOptions[transactionType];

    const handleCategoryChange = (category: string) => {
        const newCategories = selectedCategories.includes(category)
            ? selectedCategories.filter((c) => c !== category)
            : [...selectedCategories, category];

        setSelectedCategories(newCategories);
        setSummaryFilters((prev) => ({ ...prev, category: newCategories }));
    };

    const handleToggleAll = () => {
        if (selectedCategories.length === 0) {
            const newCategories = availableCategories.map((cat) => cat.value);
            setSelectedCategories(newCategories);
            setSummaryFilters((prev) => ({ ...prev, category: newCategories }));
        } else {
            setSelectedCategories([]);
            setSummaryFilters((prev) => ({ ...prev, category: [] }));
        }
    };

    useEffect(() => {
        console.log(transactionType);
        if (transactionType === "") {
            // brak kategorii – czyść
            if (selectedCategories.length > 0) {
                setSelectedCategories([]);
                setSummaryFilters((prev) => ({ ...prev, category: [] }));
            }
            return;
        }

        // mamy nowy typ -> pozostaw tylko kategorie dostępne w tym typie
        const valid = new Set(availableCategories.map((c) => c.value));
        const filtered = (summaryFilters.category || []).filter((c) =>
            valid.has(c)
        );

        // aktualizuj tylko gdy coś się zmieniło
        setSelectedCategories(filtered);
        if (filtered.length !== (summaryFilters.category || []).length) {
            setSummaryFilters((prev) => ({ ...prev, category: filtered }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionType]);

    useEffect(() => {
        setSelectedCategories(summaryFilters.category || []);
    }, [summaryFilters.category]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-60 justify-between"
                    disabled={availableCategories.length === 0}>
                    {selectedCategories.length > 0
                        ? `Wybrano ${selectedCategories.length}`
                        : "Wybierz kategorie"}
                    <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
            </PopoverTrigger>

            {/* renderuj listę TYLKO gdy są kategorie */}
            {availableCategories.length > 0 && (
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

                    <div className="border-t mt-2 pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleAll}
                            className="w-full"
                            disabled={availableCategories.length === 0}>
                            {selectedCategories.length === 0
                                ? "Zaznacz wszystkie"
                                : "Odznacz wszystkie"}
                        </Button>
                    </div>
                </PopoverContent>
            )}
        </Popover>
    );
};

export default CategoriesDropdown;
