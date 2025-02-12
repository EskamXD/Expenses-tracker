import { Button } from "@/components/ui/button"; // Shadcn Button
import YearDropdown from "@/components/YearDropdown";
import MonthDropdown from "@/components/MonthDropdown";
import SummaryDropdown from "@/components/summary-dropdown";
import { useGlobalContext } from "@/context/GlobalContext";

interface SummaryFiltersProps {
    showOwnersDropdown?: boolean;
    showYear?: boolean;
    showMonth?: boolean;
    showCategories?: boolean;
    defaultCategory?: string;
    transactionType: string;
}

const SummaryFilters: React.FC<SummaryFiltersProps> = ({
    showOwnersDropdown = true,
    showYear = true,
    showMonth = true,
    showCategories = false,
    defaultCategory = "",
    transactionType,
}) => {
    const { setSummaryFilters } = useGlobalContext();

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
                    {/* <CategoriesDropdown defaultCategory={defaultCategory} transactionType={transactionType} /> */}
                </div>
            )}
            <div className="p-2">
                <Button
                    onClick={() =>
                        setSummaryFilters((prev) => ({
                            ...prev,
                            transaction_type: transactionType,
                        }))
                    }>
                    Filtruj
                </Button>
            </div>
        </div>
    );
};

export default SummaryFilters;
