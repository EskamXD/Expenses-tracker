// src/components/pivot/pivotUtils.ts
import type { Receipt, Person } from "@/types";
import type {
    OwnerAllocation,
    PeopleIndex,
    PivotResult,
    PivotRow,
    PivotSpec,
} from "@/pivot-types";

type LineItem = {
    receipt_id: number;
    payment_date: string;
    payer: number;
    shop: string;
    transaction_type: string;

    item_id: number;
    category: string;
    value: number;
    owners: number[];
};

const parseNumberSafe = (v: unknown): number => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
        const n = Number(v.replace(",", "."));
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
};

const isoToDate = (iso: string): Date => new Date(`${iso}T00:00:00`);

const inDateRange = (iso: string, from?: string, to?: string) => {
    const d = isoToDate(iso).getTime();
    if (from) {
        const f = isoToDate(from).getTime();
        if (d < f) return false;
    }
    if (to) {
        const t = isoToDate(to).getTime();
        if (d > t) return false;
    }
    return true;
};

const formatTimeBucket = (
    isoDate: string,
    grain: PivotSpec["timeGrain"]
): string | null => {
    if (grain === "none") return null;
    const d = isoToDate(isoDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    if (grain === "day") return `${y}-${m}-${day}`;
    if (grain === "month") return `${y}-${m}`;
    if (grain === "year") return `${y}`;

    if (grain === "week") {
        // ISO-like week number (wystarcza do UI)
        const tmp = new Date(d);
        const dayNum = (tmp.getDay() + 6) % 7; // Mon=0..Sun=6
        tmp.setDate(tmp.getDate() - dayNum + 3); // Thu
        const firstThu = new Date(tmp.getFullYear(), 0, 4);
        const firstThuDayNum = (firstThu.getDay() + 6) % 7;
        firstThu.setDate(firstThu.getDate() - firstThuDayNum + 3);
        const week =
            1 +
            Math.round(
                (tmp.getTime() - firstThu.getTime()) / (7 * 24 * 3600 * 1000)
            );
        return `${tmp.getFullYear()}-W${String(week).padStart(2, "0")}`;
    }

    return null;
};

const allocatedValue = (
    value: number,
    owners: number[],
    allocation: OwnerAllocation
) => {
    if (!owners || owners.length === 0) return value;
    if (allocation === "full_value") return value;
    return value / owners.length; // split_even
};

export const buildPeopleIndex = (people: Person[]): PeopleIndex => {
    const byId: Record<number, Person> = {};
    const payers: Person[] = [];
    const owners: Person[] = [];
    for (const p of people) {
        byId[p.id] = p;
        if (p.payer) payers.push(p);
        if (p.owner) owners.push(p);
    }
    return { byId, payers, owners };
};

export const flattenReceiptsToLineItems = (receipts: Receipt[]): LineItem[] => {
    const out: LineItem[] = [];
    for (const r of receipts) {
        for (const it of r.items ?? []) {
            out.push({
                receipt_id: r.id,
                payment_date: r.payment_date,
                payer: r.payer,
                shop: r.shop,
                transaction_type: r.transaction_type,

                item_id: it.id,
                category: it.category,
                value: parseNumberSafe(it.value),
                owners: it.owners ?? [],
            });
        }
    }
    return out;
};

export const distinctFromReceipts = (receipts: Receipt[]) => {
    const shops = new Set<string>();
    const categories = new Set<string>();
    const payers = new Set<number>();
    const owners = new Set<number>();

    for (const r of receipts) {
        shops.add(r.shop);
        payers.add(r.payer);
        for (const it of r.items ?? []) {
            categories.add(it.category);
            for (const o of it.owners ?? []) owners.add(o);
        }
    }

    return {
        shops: Array.from(shops).sort(),
        categories: Array.from(categories).sort(),
        payers: Array.from(payers).sort((a, b) => a - b),
        owners: Array.from(owners).sort((a, b) => a - b),
    };
};

export const computePivot = (
    receipts: Receipt[],
    spec: PivotSpec,
    peopleIndex?: PeopleIndex
): PivotResult => {
    const lineItems = flattenReceiptsToLineItems(receipts);

    const filtered = lineItems.filter((li) => {
        if (!inDateRange(li.payment_date, spec.dateFrom, spec.dateTo))
            return false;

        if (spec.transactionType) {
            if (li.transaction_type !== spec.transactionType) return false;
        }
        if (spec.categories?.length && !spec.categories.includes(li.category))
            return false;
        if (spec.shops?.length && !spec.shops.includes(li.shop)) return false;
        if (spec.payers?.length && !spec.payers.includes(li.payer))
            return false;

        if (spec.owners?.length) {
            const owners = li.owners ?? [];
            if (!owners.some((o) => spec.owners!.includes(o))) return false;
        }

        return true;
    });

    const groupCols: string[] = [];
    if (spec.timeGrain !== "none") groupCols.push("time");
    for (const g of spec.groupBy) groupCols.push(g);

    type Agg = { sum: number; count: number };
    const map = new Map<string, { dims: PivotRow; agg: Agg }>();

    for (const li of filtered) {
        const needsOwner = spec.groupBy.includes("owner");
        const ownersToIterate = needsOwner
            ? li.owners?.length
                ? li.owners
                : [null]
            : [null];

        for (const ownerId of ownersToIterate) {
            const dims: PivotRow = {};

            const timeBucket = formatTimeBucket(
                li.payment_date,
                spec.timeGrain
            );
            if (spec.timeGrain !== "none") dims["time"] = timeBucket;

            for (const g of spec.groupBy) {
                if (g === "category") dims["category"] = li.category;
                if (g === "shop") dims["shop"] = li.shop;

                if (g === "payer")
                    dims["payer"] =
                        peopleIndex?.byId?.[li.payer]?.name ?? li.payer;

                if (g === "owner") {
                    if (ownerId === null) dims["owner"] = "—";
                    else
                        dims["owner"] =
                            peopleIndex?.byId?.[ownerId]?.name ?? ownerId;
                }
            }

            const key = groupCols.map((c) => String(dims[c] ?? "")).join("||");
            const entry = map.get(key) ?? { dims, agg: { sum: 0, count: 0 } };

            const baseValue = allocatedValue(
                li.value,
                li.owners ?? [],
                spec.ownerAllocation
            );

            entry.agg.count += 1;
            entry.agg.sum += baseValue;

            map.set(key, entry);
        }
    }

    const rows: PivotRow[] = Array.from(map.values()).map(({ dims, agg }) => {
        let value = 0;
        if (spec.measure.op === "count") value = agg.count;
        else if (spec.measure.op === "sum") value = agg.sum;
        else value = agg.count ? agg.sum / agg.count : 0;

        return { ...dims, value, count: agg.count };
    });

    rows.sort((a, b) => {
        const fa =
            spec.sortBy === "count"
                ? Number(a.count ?? 0)
                : Number(a.value ?? 0);
        const fb =
            spec.sortBy === "count"
                ? Number(b.count ?? 0)
                : Number(b.value ?? 0);
        const diff = fa - fb;
        return spec.sortDir === "asc" ? diff : -diff;
    });

    const limited = spec.limit > 0 ? rows.slice(0, spec.limit) : rows;
    const columns = [...groupCols, "value", "count"];

    return { columns, rows: limited };
};
