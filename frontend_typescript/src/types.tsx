export type Person = {
    id?: number;
    name: string;
    payer: boolean;
    owner: boolean;
};

export type Item = {
    id?: number;
    category: string;
    value: number | string;
    description: string;
    quantity: number;
    owner: number;
};

export type Receipt = {
    id?: number;
    payment_date: string;
    payer: number;
    shop: string;
    transaction_type: string;
    items: Item[];
};

export type Params = {
    owner?: number;
    month?: number;
    year?: number;
    category?: string | string[];
    transaction_type?: string;
};

