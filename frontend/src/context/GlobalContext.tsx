import React, { createContext, useContext, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGetPerson } from "@/api/apiService";
import { Person, Receipt, Shops, SummaryParams } from "@/types";

interface GlobalState {
    persons: Person[];

    receipts: Receipt[];
    setReceipts: (receipts: Receipt[]) => void;

    shops: Shops[];
    setShops: (shops: Shops[]) => void;

    summaryFilters: SummaryParams;
    setSummaryFilters: (
        params: SummaryParams | ((prevFilters: SummaryParams) => SummaryParams)
    ) => void;

    // last‐open tabs
    balanceTab: string;
    setBalanceTab: (tab: string) => void;

    chartsTab: string;
    setChartsTab: (tab: string) => void;

    summaryTab: "expense" | "income";
    setSummaryTab: (tab: "expense" | "income") => void;
}

// Domyślny stan
const defaultState: GlobalState = {
    persons: [],
    receipts: [],
    setReceipts: () => {},
    shops: [],
    setShops: () => {},
    summaryFilters: {
        owners: [],
        month: 0,
        year: 0,
        category: [],
        transactionType: "expense",
        period: "monthly",
    },
    setSummaryFilters: () => {},
    balanceTab: "bilans",
    setBalanceTab: () => {},
    chartsTab: "barPersons",
    setChartsTab: () => {},
    summaryTab: "expense",
    setSummaryTab: () => {},
};

// Tworzenie kontekstu
const GlobalContext = createContext<GlobalState>(defaultState);

// Provider dla aplikacji
export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    // const [persons, setPersons] = useState<Person[]>([]);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [shops, setShops] = useState<Shops[]>([]);
    const [summaryFilters, setSummaryFilters] = useState<SummaryParams>({
        owners: [],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        category: [],
        transactionType: "expense",
        period: "monthly",
    });
    const [balanceTab, setBalanceTab] = useState<string>("bilans");
    const [chartsTab, setChartsTab] = useState<string>("barPersons");
    const [summaryTab, setSummaryTab] = useState<"expense" | "income">(
        "expense"
    );

    const { data: persons = [] } = useQuery<Person[], Error>({
        queryKey: ["persons"],
        queryFn: () => fetchGetPerson(),
        staleTime: 1000 * 60 * 5,
        // initialData: [],
    });

    return (
        <GlobalContext.Provider
            value={{
                persons,
                receipts,
                setReceipts,
                shops,
                setShops,
                summaryFilters,
                setSummaryFilters,
                balanceTab,
                setBalanceTab,
                chartsTab,
                setChartsTab,
                summaryTab,
                setSummaryTab,
            }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Hook do korzystania z GlobalContext
export const useGlobalContext = () => useContext(GlobalContext);
