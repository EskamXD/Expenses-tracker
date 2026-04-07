import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGetReceipts } from "@/api/apiService";
import type { Receipt } from "@/types";
import { PivotCard } from "@/components/pivot-card";
import { useGlobalContext } from "@/context/GlobalContext"; // <- dostosuj ścieżkę jeśli inna

export default function Pivot() {
    const { summaryFilters, persons } = useGlobalContext();

    // stabilny queryKey (unikamy object reference)
    const key = useMemo(() => {
        return [
            "receipts",
            summaryFilters.period,
            summaryFilters.year,
            summaryFilters.month,
            summaryFilters.transactionType,
            (summaryFilters.owners ?? []).join(","),
            (summaryFilters.category ?? []).join(","),
        ];
    }, [summaryFilters]);

    const { data: receipts = [], isFetching } = useQuery<Receipt[]>({
        queryKey: key,
        queryFn: async () => {
            // summaryFilters jest SummaryParams -> pasuje do fetchGetReceipts(params)
            return await fetchGetReceipts();
        },
    });

    return (
        <div style={{ padding: 16 }}>
            <h2 style={{ margin: "0 0 12px" }}>Pivot / Analytics</h2>
            <PivotCard
                receipts={receipts}
                people={persons}
                isLoading={isFetching}
            />
        </div>
    );
}
