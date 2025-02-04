import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { Params, Person, Receipt, Shops } from "../types";
import { fetchGetReceipts } from "../api/apiService";

interface GlobalState {
    persons: Person[];
    setPersons: (users: Person[]) => void;

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
    setPersons: () => {},
    receipts: [],
    setReceipts: () => {},
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
            }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Hook do korzystania z GlobalContext
export const useGlobalContext = () => useContext(GlobalContext);

