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

export type ImportReceiptsResponse = {
    ok: boolean;
    inserted: number;
    errors: number;
    errorSamples?: Array<{ line: number; error: string }>;
};
