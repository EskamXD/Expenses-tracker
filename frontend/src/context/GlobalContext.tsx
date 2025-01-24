import React, { createContext, useContext, useState, ReactNode } from "react";
import { Person, Receipt, Shops } from "../types";

interface GlobalState {
    persons: Person[];
    setPersons: (users: Person[]) => void;

    receipts: Receipt[];
    setReceipts: (receipts: Receipt[]) => void;

    shops: Shops[];
    setShops: (shops: Shops[]) => void;
}

// Domyślny stan
const defaultState: GlobalState = {
    persons: [],
    setPersons: () => {},
    receipts: [],
    setReceipts: () => {},
    shops: [],
    setShops: () => {},
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

    return (
        <GlobalContext.Provider
            value={{
                persons,
                setPersons,
                receipts,
                setReceipts,
                shops,
                setShops,
            }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Hook do korzystania z GlobalContext
export const useGlobalContext = () => useContext(GlobalContext);
