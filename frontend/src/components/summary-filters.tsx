import YearDropdown from "@/components/year-dropdown";
import MonthDropdown from "@/components/month-dropdown";
import SummaryDropdown from "@/components/summary-dropdown";
import CategoriesDropdown from "@/components/categories-dropdown";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGlobalContext } from "@/context/GlobalContext";
interface SummaryFiltersProps {
    showOwnersDropdown?: boolean;
    showYear?: boolean;
    showMonth?: boolean;
    showCategories?: boolean;
    showYearMonth?: boolean;
    transactionType: "expense" | "income" | "";
}

const SummaryFilters: React.FC<SummaryFiltersProps> = ({
    showOwnersDropdown = true,
    showYear = true,
    showMonth = true,
    showCategories = false,
    showYearMonth = false,
    transactionType,
}) => {
    const { summaryFilters, setSummaryFilters, setSummaryTab } =
        useGlobalContext();

    const handleTransactionTypeChange = (value: "" | "expense" | "income") => {
        setSummaryFilters((prev) => ({ ...prev, transactionType: value }));
        if (value === "expense" || value === "income") {
            setSummaryTab(value);
        }
    };

    const handlePeriodToggle = (checked: boolean) => {
        setSummaryFilters((prev) => ({
            ...prev,
            period: checked ? "yearly" : "monthly",
        }));
    };

    const effectiveType: "" | "expense" | "income" =
        transactionType === ""
            ? summaryFilters.transactionType
            : transactionType;

    return (
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg shadow-md">
            {showOwnersDropdown && (
                <div className="p-2">
                    <SummaryDropdown />
                </div>
            )}
            {showYear && (
                <div className="p-2">
                    <YearDropdown />
                </div>
            )}
            {showMonth && (
                <div className="p-2">
                    <MonthDropdown />
                </div>
            )}
            {showCategories && (
                <div className="p-2">
                    <CategoriesDropdown transactionType={effectiveType} />
                </div>
            )}
            {transactionType === "" && (
                <div className="p-2">
                    <Select
                        value={summaryFilters.transactionType}
                        onValueChange={(v) =>
                            handleTransactionTypeChange(
                                v as "" | "expense" | "income"
                            )
                        }>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Typ wydatku" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="expense">Wydatki</SelectItem>
                            <SelectItem value="income">Przychody</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            {showYearMonth && (
                <div className="p-2 flex items-center gap-2">
                    Miesięczne{" "}
                    <Switch
                        checked={summaryFilters.period === "yearly"}
                        onCheckedChange={handlePeriodToggle}
                    />{" "}
                    Roczne
                </div>
            )}
        </div>
    );
};

export default SummaryFilters;
