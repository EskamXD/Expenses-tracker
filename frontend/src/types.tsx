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

