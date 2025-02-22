import { useGlobalContext } from "../context/GlobalContext";
import { Params } from "../types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const MonthDropdown = () => {
    const { summaryFilters, setSummaryFilters } = useGlobalContext();

    const getMonthName = (month: number) =>
        new Date(0, month - 1).toLocaleString("default", { month: "long" });

    const handleSelect = (value: string) => {
        const newMonth = parseInt(value, 10);
        setSummaryFilters((prevFilters: Params) => ({
            ...prevFilters,
            month: newMonth,
        }));
    };

    return (
        <div className="w-40">
            <Select
                onValueChange={handleSelect}
                value={
                    summaryFilters.month ? String(summaryFilters.month) : ""
                }>
                <SelectTrigger>
                    <SelectValue placeholder="Wybierz miesiąc" />
                </SelectTrigger>
                <SelectContent>
                    {[...Array(12)].map((_, index) => {
                        const month = index + 1;
                        return (
                            <SelectItem key={month} value={String(month)}>
                                {getMonthName(month)}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    );
};

export default MonthDropdown;

