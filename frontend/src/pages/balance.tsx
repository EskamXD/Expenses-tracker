// src/components/Balance.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import {
    fetchBalance,
    fetchSpendingRatio,
    BalanceResponse,
    SpendingRatioResponse,
} from "@/api/apiService";

// shadcn/ui
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

// nasze filtry
import SummaryFilters from "@/components/summary-filters";
import { Params } from "@/types";

const Balance: React.FC = () => {
    const { summaryFilters } = useGlobalContext();
    const hasFilters =
        Number(summaryFilters.year) > 0 &&
        Number(summaryFilters.month) > 0 &&
        summaryFilters.owners.length > 0;

    const {
        isLoading: isBalanceLoading,
        error: balanceError,
        data: balanceData,
    } = useQuery<BalanceResponse>({
        queryKey: ["balance", summaryFilters],
        queryFn: () =>
            fetchBalance({
                year: summaryFilters.year,
                month: summaryFilters.month,
                owners: summaryFilters.owners,
            } as Params),
        enabled: hasFilters,
    });

    const {
        isLoading: isRatioLoading,
        error: ratioError,
        data: ratioData,
    } = useQuery<SpendingRatioResponse>({
        queryKey: ["spendingRatio", summaryFilters],
        queryFn: () =>
            fetchSpendingRatio({
                year: summaryFilters.year,
                month: summaryFilters.month,
                owners: summaryFilters.owners,
            } as Params),
        enabled: hasFilters,
    });

    if (!hasFilters) {
        return (
            <div className="space-y-6">
                <h1>Bilans</h1>
                <SummaryFilters
                    showOwnersDropdown
                    showYear
                    showMonth
                    transactionType="expense"
                />
                <p className="text-center text-muted-foreground">
                    Proszę wybrać rok, miesiąc i właściciela, żeby zobaczyć
                    dane.
                </p>
            </div>
        );
    }

    if (balanceError || ratioError || !balanceData || !ratioData) {
        return (
            <div className="space-y-6">
                <SummaryFilters
                    showOwnersDropdown
                    showYear
                    showMonth
                    transactionType="expense"
                />
                {!isBalanceLoading && <h1>Błąd przy ładowaniu danych</h1>}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1>Balance Dashboard</h1>

            {/* filtry */}
            <SummaryFilters
                showOwnersDropdown
                showYear
                showMonth
                transactionType="expense"
            />

            <Tabs defaultValue="bilans">
                <TabsList>
                    <TabsTrigger value="bilans">Bilans</TabsTrigger>
                    <TabsTrigger value="proporcje">Proporcje</TabsTrigger>
                    <TabsTrigger value="pozycje">ID pozycji</TabsTrigger>
                </TabsList>

                {/* --- Bilans --- */}
                <TabsContent value="bilans">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Bilans za {balanceData.month}/{balanceData.year}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-medium">
                                {balanceData.computed_balance} PLN
                            </p>
                            {balanceData.saved_balance != null && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    (ostatnie zapisane:{" "}
                                    {balanceData.saved_balance} PLN, różnica{" "}
                                    {balanceData.difference != null
                                        ? balanceData.difference
                                        : "--"}
                                    )
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Proporcje --- */}
                <TabsContent value="proporcje">
                    <Card>
                        <CardHeader>
                            <CardTitle>Proporcje wydatków</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p>Wydatki: {ratioData.spending} %</p>
                            <p>Inwestycje: {ratioData.invest} %</p>
                            <p>Relaks/Fun: {ratioData.fun} %</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- ID pozycji --- */}
                <TabsContent value="pozycje">
                    {!!ratioData.invest_ids && (
                        <Accordion type="single" collapsible>
                            <AccordionItem value="invest">
                                <AccordionTrigger>
                                    Inwestycje ({ratioData.invest_ids.length})
                                </AccordionTrigger>
                                <AccordionContent>
                                    <pre className="whitespace-pre-wrap">
                                        {ratioData.invest_ids.join(", ")}
                                    </pre>
                                </AccordionContent>
                            </AccordionItem>
                            <Separator className="my-2" />
                            <AccordionItem value="spending">
                                <AccordionTrigger>
                                    Wydatki ({ratioData.spending_ids.length})
                                </AccordionTrigger>
                                <AccordionContent>
                                    <pre className="whitespace-pre-wrap">
                                        {ratioData.spending_ids.join(", ")}
                                    </pre>
                                </AccordionContent>
                            </AccordionItem>
                            <Separator className="my-2" />
                            <AccordionItem value="fun">
                                <AccordionTrigger>
                                    Fun ({ratioData.fun_ids.length})
                                </AccordionTrigger>
                                <AccordionContent>
                                    <pre className="whitespace-pre-wrap">
                                        {ratioData.fun_ids.join(", ")}
                                    </pre>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Balance;
