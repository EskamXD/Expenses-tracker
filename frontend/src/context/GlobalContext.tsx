import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGetPerson, fetchGetWallets } from "@/api/apiService";
import { Params, Person, Receipt, Shops, Wallet } from "@/types";

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

    // last‐open tabs
    balanceTab: string;
    setBalanceTab: (tab: string) => void;

    chartsTab: string;
    setChartsTab: (tab: string) => void;

    summaryTab: "expense" | "income";
    setSummaryTab: (tab: "expense" | "income") => void;

    wallets: Wallet[];
    // setWallets: (wallets: Wallet[]) => void;

    selectedWalletId: number;
    setSelectedWalletId: (id: number) => void;
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
    balanceTab: "bilans",
    setBalanceTab: () => {},
    chartsTab: "barPersons",
    setChartsTab: () => {},
    summaryTab: "expense",
    setSummaryTab: () => {},
    wallets: [],
    // setWallets: () => {},
    selectedWalletId: 0,
    setSelectedWalletId: () => {},
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
    const [balanceTab, setBalanceTab] = useState<string>("bilans");
    const [chartsTab, setChartsTab] = useState<string>("barPersons");
    const [summaryTab, setSummaryTab] = useState<"expense" | "income">(
        "expense"
    );

    // const [wallets, setWallets] = useState<Wallet[]>([]);
    const [selectedWalletId, setSelectedWalletId] = useState<number>(0);

    const { data: persons = [] } = useQuery<Person[], Error>({
        queryKey: ["persons"],
        queryFn: () => fetchGetPerson(),
        staleTime: 1000 * 60 * 5,
        // initialData: [],
    });

    const { data: fetchedWallets = [] } = useQuery<Wallet[]>({
        queryKey: ["wallets"],
        queryFn: fetchGetWallets,
        staleTime: 1000 * 60 * 5,
        // onSuccess: (wallets) => {
        //     setWallets(wallets);
        //     // automatycznie ustaw pierwszy portfel jako domyślny, jeśli nie wybrano
        //     if (!selectedWalletId && wallets.length > 0) {
        //         setSelectedWalletId(wallets[0].id);
        //     }
        // },
    });

    // NIE używaj setWallets, po prostu zawsze korzystaj z fetchedWallets jako wallets
    const wallets = fetchedWallets;

    // A useEffect tylko do domyślnego portfela:
    useEffect(() => {
        if (
            (selectedWalletId === 0 ||
                !wallets.some((w) => w.id === selectedWalletId)) &&
            wallets.length > 0
        ) {
            setSelectedWalletId(wallets[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallets, selectedWalletId]);

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
                wallets,
                // setWallets,
                selectedWalletId,
                setSelectedWalletId,
            }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Hook do korzystania z GlobalContext
export const useGlobalContext = () => useContext(GlobalContext);

