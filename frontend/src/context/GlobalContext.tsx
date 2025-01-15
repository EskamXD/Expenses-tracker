import React, { createContext, useContext, useState, ReactNode } from "react";
import { Person } from "../types";

interface GlobalState {
    persons: Person[];
    setPersons: (users: Person[]) => void;
}

// Domyślny stan
const defaultState: GlobalState = {
    persons: [],
    setPersons: () => {},
};

// Tworzenie kontekstu
const GlobalContext = createContext<GlobalState>(defaultState);

// Provider dla aplikacji
export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [persons, setPersons] = useState<Person[]>([]);

    return (
        <GlobalContext.Provider value={{ persons, setPersons }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Hook do korzystania z GlobalContext
export const useGlobalContext = () => useContext(GlobalContext);
