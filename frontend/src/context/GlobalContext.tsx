import React, { createContext, useContext, useState, ReactNode } from "react";
import { Params, Person, Receipt, Shops } from "../types";
import { fetchGetReceipts } from "../api/apiService";

interface GlobalState {
    persons: Person[];
    setPersons: (users: Person[]) => void;

    receipts: Receipt[];
    setReceipts: (receipts: Receipt[]) => void;

    filteredReceipts: Receipt[];
    filterReceipts: () => void;

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
    setPersons: () => {},
    receipts: [],
    setReceipts: () => {},
    filteredReceipts: [],
    filterReceipts: () => {},
    shops: [],
    setShops: () => {},
    summaryFilters: {
        owners: [],
        month: 0,
        year: 0,
    },
    setSummaryFilters: () => {},
};

// Tworzenie kontekstu
const GlobalContext = createContext<GlobalState>(defaultState);

// Provider dla aplikacji
export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [persons, setPersons] = useState<Person[]>([]);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [shops, setShops] = useState<Shops[]>([]);
    const [summaryFilters, setSummaryFilters] = useState<Params>({
        owners: [],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);

    const filterReceipts = async () => {
        console.log("Rozpoczynam filtrowanie...");

        const { owners, month, year, category, transaction_type } =
            summaryFilters;

        try {
            // Wywołanie API z wszystkimi filtrami
            const fetchedReceipts = await fetchGetReceipts({
                transaction_type,
                owners,
                month,
                year,
                category,
            });

            // Ustawienie przefiltrowanych paragonów w stanie
            setFilteredReceipts(fetchedReceipts);

            console.log(
                "Filtrowanie zakończone. Liczba wyników:",
                fetchedReceipts.length
            );
        } catch (error) {
            console.error("Błąd podczas pobierania danych z API:", error);
        }
    };

    return (
        <GlobalContext.Provider
            value={{
                persons,
                setPersons,
                receipts,
                setReceipts,
                shops,
                setShops,
                summaryFilters,
                setSummaryFilters,
                filteredReceipts,
                filterReceipts,
            }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Hook do korzystania z GlobalContext
export const useGlobalContext = () => useContext(GlobalContext);

