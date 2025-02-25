import React, { createContext, useContext, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGetPerson } from "@/api/apiService";
import { Params, Person, Receipt, Shops } from "@/types";

interface GlobalState {
    persons: Person[];

    receipts: Receipt[];
    setReceipts: (receipts: Receipt[]) => void;

    shops: Shops[];
    setShops: (shops: Shops[]) => void;

    summaryFilters: Params;
    setSummaryFilters: (
        params: Params | ((prevFilters: Params) => Params)
    ) => void;
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
    },
    setSummaryFilters: () => {},
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
    const [summaryFilters, setSummaryFilters] = useState<Params>({
        owners: [],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        category: [],
    });

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
            }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Hook do korzystania z GlobalContext
export const useGlobalContext = () => useContext(GlobalContext);
