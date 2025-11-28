export type Person = {
    id: number;
    name: string;
    payer: boolean;
    owner: boolean;
};

export type Item = {
    id: number;
    category: string;
    value: string;
    description: string;
    quantity: number;
    owners: number[];
};

export type Receipt = {
    id: number;
    payment_date: string;
    payer: number;
    shop: string;
    transaction_type: string;
    items: Item[];
};

export type Params = {
    id?: number;
    owners: number[];
    month?: number;
    year?: number;
    category?: string[];
    transactionType?: "" | "expense" | "income";
    period?: "monthly" | "yearly";
};

export type SummaryParams = Params & {
    transactionType: "" | "expense" | "income";
    period: "monthly" | "yearly";
};

export type Shops = {
    id?: number;
    name: string;
};

export type Wallet = {
    id: number;
    name: string;
};

export type TransactionType = "deposit" | "withdrawal" | "profit";
export interface InvestmentTransaction {
    id: number;
    investment: number; // ID inwestycji
    value: number;
    type: TransactionType;
    date: string;
    description?: string;
}

export type InvestmentType = "deposit" | "fund" | "stock" | "etf" | "bond";
export interface Investment {
    id: number;
    wallet: number; // ID portfela
    name: string;
    type: InvestmentType;
    symbol?: string;
    created_at?: string;
    interest_rate?: number | null;
    capitalization?: string | null;
    end_date?: string | null;
    capital?: number; // property z backendu
    current_value?: number; // property z backendu
    transactions?: InvestmentTransaction[]; // opcjonalnie, jeśli serializer zwraca transakcje
}
