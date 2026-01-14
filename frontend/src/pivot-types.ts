// src/components/pivot/pivotTypes.ts
import type { Person, Receipt } from "@/types";

export type OwnerAllocation = "split_even" | "full_value";
export type TimeGrain = "none" | "day" | "week" | "month" | "year";
export type MeasureOp = "sum" | "count" | "avg";

export type GroupByField = "category" | "shop" | "payer" | "owner";
export type SortBy = "value" | "count";
export type SortDir = "asc" | "desc";

export type PivotSpec = {
    dateFrom?: string; // yyyy-mm-dd
    dateTo?: string; // yyyy-mm-dd

    transactionType?: "expense" | "income";
    categories?: string[];
    shops?: string[];
    payers?: number[];
    owners?: number[];

    timeGrain: TimeGrain;
    groupBy: GroupByField[];

    measure: {
        op: MeasureOp;
        field: "value";
    };

    ownerAllocation: OwnerAllocation;

    sortBy: SortBy;
    sortDir: SortDir;
    limit: number;
};

export type PivotRow = Record<string, string | number | null>;

export type PivotResult = {
    columns: string[];
    rows: PivotRow[];
};

export type PeopleIndex = {
    byId: Record<number, Person>;
    payers: Person[];
    owners: Person[];
};

export type PivotCardProps = {
    receipts: Receipt[];
    people?: Person[];
    isLoading?: boolean;
};
