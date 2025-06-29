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
    transaction_type?: string;
};

export type Shops = {
    id?: number;
    name: string;
};

export type Invest = {
    wallet: number;
    instrument: string;
    value: number;
    purchase_price: number;
    units: number;
    payment_date: string;
    transaction_type?: "buy" | "sell" | "dividend";
};
export type Wallet = {
    id: number;
    name: string;
    total_value: number;
    total_invest_income: number;
    last_update: string; // ISO date string z backendu
    parent_wallet: number | null; // lub Wallet | null jeśli API zwraca obiekt
};

