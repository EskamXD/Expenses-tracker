export interface receiptInterface {
    id: number;
    payment_date: string;
    payer: number;
    shop: string;
    transaction_type: string;
    items: {
        id: number;
        category: string;
        value: number;
        description: string;
        quantity: number;
        owner: number;
    }[];
    }
}
