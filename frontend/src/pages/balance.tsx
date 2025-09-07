// src/components/Balance.tsx
import React, { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import {
    fetchGetBalance,
    fetchPostReceipt,
    fetchPatchBalance,
    fetchGetItemsByID,
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
import { Item, Params, Receipt } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ResponsiveFilters from "@/components/responsive-filters";

const Balance: React.FC = () => {
    const { summaryFilters, balanceTab, setBalanceTab } = useGlobalContext();
    const hasFilters =
        Number(summaryFilters.year) > 0 &&
        Number(summaryFilters.month) > 0 &&
        summaryFilters.owners.length > 0;

    const queryClient = useQueryClient();

    const {
        isLoading: isBalanceLoading,
        error: balanceError,
        data: balanceData,
    } = useQuery<BalanceResponse>({
        queryKey: ["balance", summaryFilters],
        queryFn: () =>
            fetchGetBalance({
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

    useEffect(() => {
        console.log(ratioData);
    }, [ratioData]);

    // after you have balanceTab and ratioData:
    const investItemsQuery = useQuery<Item[], Error>({
        queryFn: () => fetchGetItemsByID({ id: ratioData!.invest_ids }),
        queryKey: ["items", "invest", ratioData?.invest_ids],
        enabled:
            balanceTab === "pozycje" &&
            Array.isArray(ratioData?.invest_ids) &&
            ratioData!.invest_ids.length > 0,
    });

    const spendingItemsQuery = useQuery<Item[], Error>({
        queryFn: () => fetchGetItemsByID({ id: ratioData!.spending_ids }),
        queryKey: ["items", "spending", ratioData?.spending_ids],
        enabled:
            balanceTab === "pozycje" &&
            Array.isArray(ratioData?.spending_ids) &&
            ratioData!.spending_ids.length > 0,
    });

    const funItemsQuery = useQuery<Item[], Error>({
        queryFn: () => fetchGetItemsByID({ id: ratioData!.fun_ids }),
        queryKey: ["items", "fun", ratioData?.fun_ids],
        enabled:
            balanceTab === "pozycje" &&
            Array.isArray(ratioData?.fun_ids) &&
            ratioData!.fun_ids.length > 0,
    });

    const updateMutation = useMutation<BalanceResponse>({
        mutationFn: () => {
            if (!balanceData?.saved_item_id) {
                // should never happen if button is disabled correctly
                return Promise.reject(new Error("No item ID"));
            }
            return fetchPatchBalance(
                balanceData.saved_item_id,
                balanceData.computed_balance
            );
        },
        onSuccess: () => {
            // odświeżamy bilans po udanej aktualizacji
            queryClient.invalidateQueries({
                queryKey: ["balance", summaryFilters],
            });
        },
    });

    const createMutation = useMutation<BalanceResponse>({
        mutationFn: () => {
            if (
                !summaryFilters.month ||
                !summaryFilters.year ||
                !summaryFilters.owners ||
                balanceData?.computed_balance == null
            ) {
                return Promise.reject(new Error("Missing filters or balance"));
            }

            const month = Number(summaryFilters.month);
            const year = Number(summaryFilters.year);

            const nextMonth = month === 12 ? 1 : month + 1;
            const nextYear = month === 12 ? year + 1 : year;
            const payment_date = `${nextYear}-${String(nextMonth).padStart(
                2,
                "0"
            )}-01`;

            const newReceipt: Receipt = {
                id: 0, // backend will ignore or override
                payment_date,
                payer: summaryFilters.owners[0], // or whatever logic you need
                shop: "Saldo z poprzedniego miesiąca",
                transaction_type: "income",
                items: [
                    {
                        id: 0, // backend will ignore
                        category: "last_month_balance",
                        value: String(balanceData.computed_balance),
                        description: "Saldo z poprzedniego miesiąca",
                        quantity: 1,
                        owners: summaryFilters.owners,
                    },
                ],
            };

            // If your API wants an array:
            return fetchPostReceipt([newReceipt]);
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ["balance", summaryFilters],
            }),
    });

    return (
        <div className="space-y-6">
            {/* filters always visible */}
            <ResponsiveFilters
                showOwnersDropdown
                showYear
                showMonth
                transactionType="expense"
            />

            {/* error if filters set but query failed */}
            {hasFilters &&
                (balanceError || ratioError) &&
                !isBalanceLoading && (
                    <h2 className="text-red-600">Błąd przy ładowaniu danych</h2>
                )}

            {/* prompt if no filters */}
            {!hasFilters && (
                <p className="text-center text-muted-foreground">
                    Proszę wybrać rok, miesiąc i właściciela, żeby zobaczyć
                    dane.
                </p>
            )}

            {/* only show tabs when filters are set */}
            {hasFilters && (
                <Tabs value={balanceTab} onValueChange={setBalanceTab}>
                    <TabsList>
                        <TabsTrigger value="bilans">Bilans</TabsTrigger>
                        <TabsTrigger value="proporcje">Proporcje</TabsTrigger>
                        <TabsTrigger value="pozycje">ID pozycji</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bilans">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {isBalanceLoading ? (
                                        <Skeleton className="h-6 w-40" />
                                    ) : (
                                        `Bilans za ${balanceData!.month}/${
                                            balanceData!.year
                                        }`
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* main balance */}
                                {isBalanceLoading ? (
                                    <Skeleton className="h-10 w-24" />
                                ) : (
                                    <p className="text-2xl font-medium">
                                        {balanceData!.computed_balance} PLN
                                    </p>
                                )}

                                {/* saved_balance + difference */}
                                {!isBalanceLoading &&
                                    balanceData!.saved_balance != null && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            (ostatnie zapisane:{" "}
                                            {balanceData!.saved_balance} PLN,
                                            różnica {balanceData!.difference})
                                        </p>
                                    )}

                                {/* action button */}
                                <div className="my-2">
                                    {isBalanceLoading ? (
                                        <Skeleton className="h-8 w-32 mt-4" />
                                    ) : balanceData!.create ? (
                                        <Button
                                            onClick={() =>
                                                createMutation.mutate()
                                            }
                                            disabled={createMutation.isPending}>
                                            {createMutation.isPending
                                                ? "Tworzę…"
                                                : "Utwórz bilans"}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() =>
                                                updateMutation.mutate()
                                            }
                                            disabled={
                                                balanceData!.saved_item_id ==
                                                    null ||
                                                balanceData!.difference === 0 ||
                                                updateMutation.isPending
                                            }>
                                            {updateMutation.isPending
                                                ? "Aktualizuję…"
                                                : "Zaktualizować bilans?"}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="proporcje">
                        <Card>
                            <CardHeader>
                                <CardTitle>Proporcje wydatków</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {isRatioLoading ? (
                                    <>
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-24" />
                                    </>
                                ) : (
                                    <>
                                        <p>Wydatki: {ratioData!.spending} %</p>
                                        <p>Inwestycje: {ratioData!.invest} %</p>
                                        <p>Relaks/Fun: {ratioData!.fun} %</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pozycje">
                        {!isRatioLoading && ratioData!.available && (
                            <Accordion type="single" collapsible>
                                <AccordionItem value="invest">
                                    <AccordionTrigger>
                                        Inwestycje (
                                        {ratioData?.invest_ids.length})
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {investItemsQuery.isLoading ? (
                                            <Skeleton className="h-40 w-full" />
                                        ) : investItemsQuery.isError ? (
                                            <p className="text-red-600">
                                                Błąd ładowania pozycji
                                            </p>
                                        ) : Array.isArray(
                                              investItemsQuery.data
                                          ) &&
                                          investItemsQuery.data.length > 0 ? (
                                            <ul className="list-disc pl-5">
                                                {investItemsQuery.data.map(
                                                    (item) => (
                                                        <li key={item.id}>
                                                            {item.description}:{" "}
                                                            {item.value} PLN
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <p className="text-muted-foreground">
                                                Brak pozycji
                                            </p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                                <Separator className="my-2" />

                                {/* Wydatki */}
                                <AccordionItem value="spending">
                                    <AccordionTrigger>
                                        Wydatki (
                                        {ratioData?.spending_ids.length})
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {spendingItemsQuery.isLoading ? (
                                            <Skeleton className="h-40 w-full" />
                                        ) : spendingItemsQuery.isError ? (
                                            <p className="text-red-600">
                                                Błąd ładowania pozycji
                                            </p>
                                        ) : Array.isArray(
                                              spendingItemsQuery.data
                                          ) &&
                                          spendingItemsQuery.data.length > 0 ? (
                                            <ul className="list-disc pl-5">
                                                {spendingItemsQuery.data.map(
                                                    (item) => (
                                                        <li key={item.id}>
                                                            {item.description}:{" "}
                                                            {item.value} PLN
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <p className="text-muted-foreground">
                                                Brak pozycji
                                            </p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>

                                <Separator className="my-2" />

                                {/* Fun */}
                                <AccordionItem value="fun">
                                    <AccordionTrigger>
                                        Fun ({ratioData?.fun_ids.length})
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {funItemsQuery.isLoading ? (
                                            <Skeleton className="h-40 w-full" />
                                        ) : funItemsQuery.isError ? (
                                            <p className="text-red-600">
                                                Błąd ładowania pozycji
                                            </p>
                                        ) : Array.isArray(funItemsQuery.data) &&
                                          funItemsQuery.data.length > 0 ? (
                                            <ul className="list-disc pl-5">
                                                {funItemsQuery.data.map(
                                                    (item) => (
                                                        <li key={item.id}>
                                                            {item.description}:{" "}
                                                            {Number(
                                                                item.value
                                                            ) /
                                                                item.owners
                                                                    .length}{" "}
                                                            PLN
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <p className="text-muted-foreground">
                                                Brak pozycji
                                            </p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )}
                        {isRatioLoading && <Skeleton className="h-40 w-full" />}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};

export default Balance;

