import { useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "../context/GlobalContext";
import { fetchGetReceipts } from "../api/apiService";
import SummaryTable from "./summary-table";
import { Skeleton } from "@/components/ui/skeleton"; // Shadcn Skeleton

interface SummaryTabProps {
    transactionType: "income" | "expense";
}

const SummaryTab: React.FC<SummaryTabProps> = ({ transactionType }) => {
    const { summaryFilters } = useGlobalContext();

    const {
        data: receipts,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["receipts", summaryFilters, transactionType],
        queryFn: () => fetchGetReceipts(summaryFilters),
        staleTime: 1000 * 60 * 5, // Cache na 5 minut
        placeholderData: (previousData) => previousData, // Zachowanie poprzednich danych przy zmianie filtrów
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-64">
                <Skeleton className="h-6 w-128 mb-2" />
                <Skeleton className="h-6 w-128 mb-2" />
                <Skeleton className="h-6 w-128" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center w-full h-64 text-red-500">
                <p>Wystąpił błąd podczas pobierania danych!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full pt-4">
            <div className="w-full">
                {receipts.length > 0 ? (
                    <SummaryTable
                        transactionType={transactionType}
                        receipts={receipts}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-64">
                        <p className="text-gray-500">
                            Nie znaleziono żadnych paragonów.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SummaryTab;
