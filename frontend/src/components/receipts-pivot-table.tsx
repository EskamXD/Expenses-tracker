"use client";

import * as React from "react";
import { Receipt, Item, Params } from "@/types";
import { fetchGetReceipts } from "@/services/apiService";
import { useGlobalContext } from "@/context/GlobalContext";

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { EditReceiptModal } from "@/components/edit-receipt-modal";
import { categoryOptions, selectTranslationList } from "@/lib/select-option";

/* ========================
 * Typy
 * ====================== */

export type TxType = "expense" | "income";
type CategoryKey = string;

type Flat = {
    receiptId: number;
    dateKey: string; // YYYY-MM-DD
    dateDisplay: string; // pl-PL
    category: CategoryKey;
    shop: string;
    amount: number;
};

type LabelMap = Record<CategoryKey, string>;

type PivotMaps = {
    days: string[]; // YYYY-MM-DD (posortowane rosnąco)
    dayLabel: Record<string, string>;
    categories: CategoryKey[];
    sumByDayCat: Record<string, Record<CategoryKey, number>>;
    shopsByDayCat: Record<string, Record<CategoryKey, Record<string, number>>>;
    receiptIdsByDayCat: Record<string, Record<CategoryKey, number[]>>;
    amountByReceiptInCell: Record<
        string,
        Record<CategoryKey, Record<number, number>>
    >;
    receiptShop: Record<number, string>;
};

type CellMeta = {
    dayKey: string;
    category: CategoryKey;
    value: number;
    ids: number[];
    shops: Array<{ shop: string; sum: number }>;
};

// type SummaryFiltersSubset = {
//     owners?: number[];
//     month?: number;
//     year?: number;
//     category?: string[];
//     period?: "monthly" | "yearly";
// };

/* ========================
 * Formatery i utilsy
 * ====================== */

const nfPLN = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
});

function parseNumberLoose(v: unknown): number {
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const s = String(v ?? "").trim();
    if (!s) return 0;
    return Number(s.replace(/\s/g, "").replace(",", ".") || 0) || 0;
}

function toDateKey(iso?: string): string {
    return (iso ?? "").slice(0, 10);
}

function prettyFromKey(key: string): string {
    return key
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^\p{L}/u, (c) => c.toUpperCase());
}

/* ========================
 * Transformacje danych
 * ====================== */

function flattenReceipts(receipts: readonly Receipt[]): Flat[] {
    const out: Flat[] = [];
    for (const r of receipts) {
        const dateKey = toDateKey(r.payment_date);
        const dateDisplay = new Date(r.payment_date).toLocaleDateString(
            "pl-PL"
        );
        for (const it of r.items as Item[]) {
            // ILOŚĆ jest poglądowa – NIE mnożymy
            const amount = parseNumberLoose(it.value);
            out.push({
                receiptId: r.id,
                dateKey,
                dateDisplay,
                category: it.category || "—",
                shop: r.shop || "—",
                amount,
            });
        }
    }
    return out;
}

function buildPivot(flats: readonly Flat[]): PivotMaps {
    const daySet = new Set<string>();
    const catSet = new Set<CategoryKey>();
    const dayLabel: Record<string, string> = {};
    const sumByDayCat: Record<string, Record<CategoryKey, number>> = {};
    const shopsByDayCat: Record<
        string,
        Record<CategoryKey, Record<string, number>>
    > = {};
    const receiptIdsByDayCat: Record<
        string,
        Record<CategoryKey, number[]>
    > = {};
    const amountByReceiptInCell: Record<
        string,
        Record<CategoryKey, Record<number, number>>
    > = {};
    const receiptShop: Record<number, string> = {};

    for (const f of flats) {
        daySet.add(f.dateKey);
        catSet.add(f.category);
        dayLabel[f.dateKey] = f.dateDisplay;
        receiptShop[f.receiptId] = f.shop;

        sumByDayCat[f.dateKey] ??= {};
        sumByDayCat[f.dateKey][f.category] =
            (sumByDayCat[f.dateKey][f.category] ?? 0) + f.amount;

        shopsByDayCat[f.dateKey] ??= {};
        shopsByDayCat[f.dateKey][f.category] ??= {};
        shopsByDayCat[f.dateKey][f.category][f.shop] =
            (shopsByDayCat[f.dateKey][f.category][f.shop] ?? 0) + f.amount;

        receiptIdsByDayCat[f.dateKey] ??= {};
        receiptIdsByDayCat[f.dateKey][f.category] ??= [];
        if (!receiptIdsByDayCat[f.dateKey][f.category].includes(f.receiptId)) {
            receiptIdsByDayCat[f.dateKey][f.category].push(f.receiptId);
        }

        amountByReceiptInCell[f.dateKey] ??= {};
        amountByReceiptInCell[f.dateKey][f.category] ??= {};
        amountByReceiptInCell[f.dateKey][f.category][f.receiptId] =
            (amountByReceiptInCell[f.dateKey][f.category][f.receiptId] ?? 0) +
            f.amount;
    }

    const days = Array.from(daySet).sort((a, b) => a.localeCompare(b));
    const categories = Array.from(catSet).sort((a, b) =>
        a.localeCompare(b, "pl")
    );

    return {
        days,
        dayLabel,
        categories,
        sumByDayCat,
        shopsByDayCat,
        receiptIdsByDayCat,
        amountByReceiptInCell,
        receiptShop,
    };
}

/* ========================
 * Etykiety kategorii
 * ====================== */

function buildLabelMaps(transactionType: TxType): {
    typeMap: LabelMap;
    fallbackMap: LabelMap;
} {
    const typeMap: LabelMap = {};
    for (const opt of categoryOptions?.[transactionType] ?? []) {
        typeMap[opt.value] = opt.label;
    }
    const fallbackMap: LabelMap = {};
    for (const opt of selectTranslationList) {
        fallbackMap[opt.value] = opt.label;
    }
    return { typeMap, fallbackMap };
}

function makeLabelFor(typeMap: LabelMap, fallbackMap: LabelMap) {
    return (key: CategoryKey): string =>
        typeMap[key] ?? fallbackMap[key] ?? prettyFromKey(key);
}

// function sortCategoriesByLabel(
//     categories: readonly CategoryKey[],
//     labelFor: (k: CategoryKey) => string
// ): CategoryKey[] {
//     return [...categories].sort((a, b) =>
//         labelFor(a).localeCompare(labelFor(b), "pl")
//     );
// }

function sortCategoriesByPreferredOrder(
    categories: readonly CategoryKey[],
    transactionType: TxType,
    labelFor: (k: CategoryKey) => string
): CategoryKey[] {
    const pref = categoryOptions?.[transactionType] ?? [];
    const idx: Record<string, number> = {};
    pref.forEach((o, i) => {
        idx[o.value] = i;
    });

    return [...categories].sort((a, b) => {
        const ia = idx[a];
        const ib = idx[b];
        const aIn = ia !== undefined;
        const bIn = ib !== undefined;

        if (aIn && bIn) return ia - ib; // obie w predefiniowanej liście
        if (aIn && !bIn) return -1; // a ma priorytet
        if (!aIn && bIn) return 1; // b ma priorytet
        // żadna nie jest w liście – sort po etykiecie, żeby było stabilnie
        return labelFor(a).localeCompare(labelFor(b), "pl");
    });
}

/* ========================
 * Selekcje / obliczenia
 * ====================== */

function filterFlats(flats: readonly Flat[], q: string): Flat[] {
    const term = q.trim().toLowerCase();
    if (!term) return [...flats];
    return flats.filter(
        (f) =>
            f.shop.toLowerCase().includes(term) ||
            f.category.toLowerCase().includes(term)
    );
}

function getCellMeta(
    pivot: PivotMaps,
    dayKey: string,
    category: CategoryKey
): CellMeta {
    const value = pivot.sumByDayCat[dayKey]?.[category] ?? 0;
    const ids = pivot.receiptIdsByDayCat[dayKey]?.[category] ?? [];
    const shopsRaw = pivot.shopsByDayCat[dayKey]?.[category] ?? {};
    const shops = Object.entries(shopsRaw)
        .map(([shop, sum]) => ({ shop, sum }))
        .sort((a, b) => b.sum - a.sum);
    return { dayKey, category, value, ids, shops };
}

function getColumnTotals(
    pivot: PivotMaps,
    categories: readonly CategoryKey[]
): number[] {
    return categories.map((cat) =>
        pivot.days.reduce(
            (acc, day) => acc + (pivot.sumByDayCat[day]?.[cat] ?? 0),
            0
        )
    );
}

/* ========================
 * Hook do danych
 * ====================== */

function useReceiptsFlats(transactionType: TxType) {
    const { summaryFilters } = useGlobalContext();
    const [state, setState] = React.useState<{
        loading: boolean;
        error: string | null;
        flats: Flat[];
    }>({
        loading: false,
        error: null,
        flats: [],
    });

    React.useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setState((s) => ({ ...s, loading: true, error: null }));
                const params: Partial<Params> & {
                    owners: number[];
                    transactionType: TxType;
                } = {
                    owners: summaryFilters.owners ?? [],
                    month: summaryFilters.month,
                    year: summaryFilters.year,
                    category: summaryFilters.category,
                    period: summaryFilters.period,
                    transactionType,
                };
                const data = await fetchGetReceipts(params as Params);
                if (cancelled) return;
                setState({
                    loading: false,
                    error: null,
                    flats: flattenReceipts((data || []) as Receipt[]),
                });
            } catch (e: any) {
                if (!cancelled)
                    setState({
                        loading: false,
                        error: e?.message ?? "Błąd pobierania danych",
                        flats: [],
                    });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        transactionType,
        summaryFilters.owners,
        summaryFilters.month,
        summaryFilters.year,
        summaryFilters.category,
        summaryFilters.period,
    ]);

    return state;
}

/* ========================
 * Pod-komponenty UI
 * ====================== */

type PivotToolbarProps = {
    transactionType: TxType;
    dayCount: number;
    catCount: number;
    q: string;
    onQueryChange: (v: string) => void;
};

const PivotToolbar: React.FC<PivotToolbarProps> = ({
    transactionType,
    dayCount,
    catCount,
    q,
    onQueryChange,
}) => (
    <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">
                {transactionType === "expense"
                    ? "Wydatki – pivot"
                    : "Przychody – pivot"}
            </h3>
            <span className="text-xs text-muted-foreground">
                Dni: {dayCount} • Kategorie: {catCount}
            </span>
        </div>
        <div className="flex items-center gap-2">
            <Input
                value={q}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Filtr (sklepy/kategorie)..."
                className="h-8 w-60"
            />
        </div>
    </div>
);

type PivotMatrixProps = {
    pivot: PivotMaps;
    categories: readonly CategoryKey[];
    labelFor: (k: CategoryKey) => string;
    onCellClick: (dayKey: string, category: CategoryKey) => void;
    loading: boolean;
    error: string | null;
    showFooterTotals?: boolean;
};

const PivotMatrix: React.FC<PivotMatrixProps> = ({
    pivot,
    categories,
    labelFor,
    onCellClick,
    loading,
    error,
    showFooterTotals = true,
}) => {
    const totals = React.useMemo(
        () => getColumnTotals(pivot, categories),
        [pivot, categories]
    );

    return (
        <div className="overflow-auto border rounded">
            <TooltipProvider delayDuration={200}>
                <Table className="w-full text-sm">
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            <TableHead className="min-w-[140px] sticky left-0 bg-background z-10">
                                Data
                            </TableHead>
                            {categories.map((cat) => (
                                <TableHead
                                    key={cat}
                                    className="text-right px-3 py-2">
                                    {labelFor(cat)}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell
                                    colSpan={categories.length + 1}
                                    className="px-3 py-6 text-center">
                                    Ładowanie…
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && error && (
                            <TableRow>
                                <TableCell
                                    colSpan={categories.length + 1}
                                    className="px-3 py-6 text-center text-red-600">
                                    {error}
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading &&
                            !error &&
                            pivot.days.map((dayKey) => (
                                <TableRow
                                    key={dayKey}
                                    className="hover:bg-muted/40">
                                    <TableCell className="sticky left-0 bg-background z-10 font-medium">
                                        {pivot.dayLabel[dayKey]}
                                    </TableCell>

                                    {categories.map((cat) => {
                                        const { value, ids, shops } =
                                            getCellMeta(pivot, dayKey, cat);
                                        const clickable = ids.length > 0;

                                        return (
                                            <TableCell
                                                key={`${dayKey}-${cat}`}
                                                className="px-2 py-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full justify-end"
                                                            disabled={
                                                                !clickable
                                                            }
                                                            onClick={() =>
                                                                onCellClick(
                                                                    dayKey,
                                                                    cat
                                                                )
                                                            }>
                                                            {value
                                                                ? nfPLN.format(
                                                                      value
                                                                  )
                                                                : "—"}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[320px]">
                                                        <div className="text-xs font-medium mb-1">
                                                            {
                                                                pivot.dayLabel[
                                                                    dayKey
                                                                ]
                                                            }{" "}
                                                            • {labelFor(cat)}
                                                        </div>
                                                        {shops.length === 0 ? (
                                                            <div className="text-xs text-muted-foreground">
                                                                Brak pozycji
                                                            </div>
                                                        ) : (
                                                            <ul className="text-xs space-y-1">
                                                                {shops.map(
                                                                    ({
                                                                        shop,
                                                                        sum,
                                                                    }) => (
                                                                        <li
                                                                            key={
                                                                                shop
                                                                            }
                                                                            className="flex justify-between gap-3">
                                                                            <span className="truncate">
                                                                                {
                                                                                    shop
                                                                                }
                                                                            </span>
                                                                            <span className="tabular-nums">
                                                                                {nfPLN.format(
                                                                                    sum
                                                                                )}
                                                                            </span>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        )}
                                                        {ids.length > 1 && (
                                                            <div className="mt-2 text-[10px] text-muted-foreground">
                                                                Kliknij, aby
                                                                wybrać paragon
                                                                (x{ids.length})
                                                            </div>
                                                        )}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}

                        {!loading && !error && pivot.days.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={categories.length + 1}
                                    className="px-3 py-8 text-center text-muted-foreground">
                                    Brak danych do wyświetlenia.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                    {showFooterTotals && (
                        <TableFooter>
                            <TableRow>
                                <TableCell className="sticky left-0 bg-background z-10 font-medium">
                                    Suma
                                </TableCell>
                                {categories.map((cat, i) => (
                                    <TableCell
                                        key={cat}
                                        className="text-right font-medium">
                                        {totals[i]
                                            ? nfPLN.format(totals[i])
                                            : "—"}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </TooltipProvider>
        </div>
    );
};

type ReceiptsChooserDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pivot: PivotMaps;
    dayKey: string;
    category: CategoryKey;
    labelFor: (k: CategoryKey) => string;
    onOpenReceipt: (id: number) => void;
};

const ReceiptsChooserDialog: React.FC<ReceiptsChooserDialogProps> = ({
    open,
    onOpenChange,
    pivot,
    dayKey,
    category,
    labelFor,
    onOpenReceipt,
}) => {
    const ids = pivot.receiptIdsByDayCat[dayKey]?.[category] ?? [];
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {pivot.dayLabel[dayKey]} • {labelFor(category)}
                    </DialogTitle>
                    <DialogDescription>
                        Wybierz paragon do edycji
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[50vh] overflow-auto">
                    <Table className="text-sm">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sklep</TableHead>
                                <TableHead className="text-right">
                                    Kwota
                                </TableHead>
                                <TableHead className="w-[1%]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ids.map((rid) => {
                                const amt =
                                    pivot.amountByReceiptInCell[dayKey]?.[
                                        category
                                    ]?.[rid] ?? 0;
                                const shop = pivot.receiptShop[rid] ?? "—";
                                return (
                                    <TableRow key={rid}>
                                        <TableCell>{shop}</TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {nfPLN.format(amt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    onOpenReceipt(rid)
                                                }>
                                                Otwórz
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
};

/* ========================
 * Główny komponent
 * ====================== */

export default function ReceiptsPivotTable({
    transactionType,
}: {
    transactionType: TxType;
}) {
    const { flats, loading, error } = useReceiptsFlats(transactionType);

    // lokalny filtr UI
    const [q, setQ] = React.useState<string>("");

    // tłumaczenia kategorii
    const { typeMap, fallbackMap } = React.useMemo(
        () => buildLabelMaps(transactionType),
        [transactionType]
    );
    const labelFor = React.useMemo(
        () => makeLabelFor(typeMap, fallbackMap),
        [typeMap, fallbackMap]
    );

    // pochodne
    const filteredFlats = React.useMemo(
        () => filterFlats(flats, q),
        [flats, q]
    );
    const pivot = React.useMemo(
        () => buildPivot(filteredFlats),
        [filteredFlats]
    );
    const categoriesSorted = React.useMemo(
        () =>
            sortCategoriesByPreferredOrder(
                pivot.categories,
                transactionType,
                labelFor
            ),
        [pivot.categories, transactionType, labelFor]
    );

    // modale
    const [openReceiptId, setOpenReceiptId] = React.useState<number | null>(
        null
    );
    const [chooser, setChooser] = React.useState<{
        open: boolean;
        dayKey: string;
        category: CategoryKey;
    }>({
        open: false,
        dayKey: "",
        category: "",
    });

    const handleCellClick = (dayKey: string, category: CategoryKey) => {
        const ids = pivot.receiptIdsByDayCat[dayKey]?.[category] ?? [];
        if (ids.length === 1) setOpenReceiptId(ids[0]);
        else if (ids.length > 1) setChooser({ open: true, dayKey, category });
    };

    return (
        <div className="flex flex-col gap-3">
            <PivotToolbar
                transactionType={transactionType}
                dayCount={pivot.days.length}
                catCount={pivot.categories.length}
                q={q}
                onQueryChange={setQ}
            />

            <PivotMatrix
                pivot={pivot}
                categories={categoriesSorted}
                labelFor={labelFor}
                onCellClick={handleCellClick}
                loading={loading}
                error={error}
                showFooterTotals
            />

            {/* Dialog wyboru, gdy w komórce jest >1 paragon */}
            <ReceiptsChooserDialog
                open={chooser.open}
                onOpenChange={(open) => setChooser((s) => ({ ...s, open }))}
                pivot={pivot}
                dayKey={chooser.dayKey}
                category={chooser.category}
                labelFor={labelFor}
                onOpenReceipt={(id) => setOpenReceiptId(id)}
            />

            {/* Modal pojedynczego paragonu */}
            {openReceiptId !== null && (
                <EditReceiptModal
                    transactionType={transactionType}
                    receiptId={openReceiptId}
                    onClose={() => setOpenReceiptId(null)}
                />
            )}
        </div>
    );
}
