import { useGlobalContext } from "../context/GlobalContext";
import { Params } from "../types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // Shadcn Select

const YearDropdown = () => {
    const { summaryFilters, setSummaryFilters } = useGlobalContext();

    const handleSelect = (value: string) => {
        console.log(value, summaryFilters);
        const newYear = parseInt(value, 10);
        setSummaryFilters((prevFilters: Params) => ({
            ...prevFilters,
            year: newYear,
        }));
    };

    return (
        <div className="w-40">
            <Select
                onValueChange={handleSelect}
                value={String(summaryFilters.year)}>
                <SelectTrigger>
                    <SelectValue placeholder="Wybierz rok" />
                </SelectTrigger>
                <SelectContent>
                    {[...Array(5)].map((_, index) => {
                        const year = new Date().getFullYear() - index;
                        return (
                            <SelectItem key={year} value={String(year)}>
                                {year}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    );
};

export default YearDropdown;
