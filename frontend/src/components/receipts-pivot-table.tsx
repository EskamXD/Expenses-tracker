"use client";

import * as React from "react";
import { Receipt, Item } from "@/types";
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

type TxType = "expense" | "income";

type Flat = {
    receiptId: number;
    dateKey: string; // YYYY-MM-DD
    dateDisplay: string; // "pl-PL"
    category: string;
    shop: string;
    amount: number;
};

// pomocnicze formatowanie PLN
const nfPLN = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
});

function parseNumberLoose(v: string | number | null | undefined): number {
    if (typeof v === "number") return v;
    const s = String(v ?? "").trim();
    if (!s) return 0;
    const norm = s.replace(/\s/g, "").replace(",", ".");
    const n = Number(norm);
    return Number.isFinite(n) ? n : 0;
}

function toDateKey(iso: string): string {
    // zakładam ISO; jeśli dostajesz inne formaty, zrób robust parse
    return iso?.slice(0, 10) ?? "";
}

function flattenReceipts(receipts: Receipt[]): Flat[] {
    const out: Flat[] = [];
    for (const r of receipts) {
        const dateKey = toDateKey(r.payment_date);
        const dateDisplay = new Date(r.payment_date).toLocaleDateString(
            "pl-PL"
        );
        for (const it of r.items as Item[]) {
            const amount = parseNumberLoose(it.value) * (it.quantity ?? 1);
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

type PivotMaps = {
    days: string[]; // posortowane klucze YYYY-MM-DD
    dayLabel: Record<string, string>; // YYYY-MM-DD -> "pl-PL"
    categories: string[]; // posortowane kategorie
    sumByDayCat: Record<string, Record<string, number>>;
    shopsByDayCat: Record<string, Record<string, Record<string, number>>>;
    receiptIdsByDayCat: Record<string, Record<string, number[]>>;
    amountByReceiptInCell: Record<
        string,
        Record<string, Record<number, number>>
    >;
    receiptShop: Record<number, string>;
};

function buildPivot(flats: Flat[]): PivotMaps {
    const daySet = new Set<string>();
    const catSet = new Set<string>();
    const dayLabel: Record<string, string> = {};
    const sumByDayCat: Record<string, Record<string, number>> = {};
    const shopsByDayCat: Record<
        string,
        Record<string, Record<string, number>>
    > = {};
    const receiptIdsByDayCat: Record<string, Record<string, number[]>> = {};
    const amountByReceiptInCell: Record<
        string,
        Record<string, Record<number, number>>
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

    const days = Array.from(daySet).sort((a, b) => a.localeCompare(b)); // rosnąco
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

export default function ReceiptsPivotTable({
    transactionType,
}: {
    transactionType: TxType;
}) {
    const { summaryFilters } = useGlobalContext();

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [flats, setFlats] = React.useState<Flat[]>([]);

    // UI state: lokalny filtr tekstowy po sklepach/opisie kategorii (opcjonalnie)
    const [q, setQ] = React.useState("");

    // Modale
    const [openReceiptId, setOpenReceiptId] = React.useState<number | null>(
        null
    );
    const [cellChooser, setCellChooser] = React.useState<{
        open: boolean;
        dayKey: string;
        category: string;
    }>({ open: false, dayKey: "", category: "" });

    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const params = {
                    owners: summaryFilters.owners ?? [],
                    month: summaryFilters.month,
                    year: summaryFilters.year,
                    category: summaryFilters.category,
                    period: summaryFilters.period,
                    transactionType,
                };
                const data = await fetchGetReceipts(params as any);
                if (cancelled) return;
                const flat = flattenReceipts((data || []) as Receipt[]);
                setFlats(flat);
            } catch (e: any) {
                if (!cancelled)
                    setError(e?.message ?? "Błąd pobierania danych");
            } finally {
                if (!cancelled) setLoading(false);
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

    // === tłumaczenia kategorii ===
    const fallbackMap = React.useMemo(() => {
        const m: Record<string, string> = {};
        for (const opt of selectTranslationList) m[opt.value] = opt.label;
        return m;
    }, []);

    const typeMap = React.useMemo(() => {
        const list = categoryOptions?.[transactionType] ?? [];
        const m: Record<string, string> = {};
        for (const opt of list) m[opt.value] = opt.label;
        return m;
    }, [transactionType]);

    const prettify = (k: string) =>
        k
            .replace(/_/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/^\p{L}/u, (c) => c.toUpperCase());

    const labelFor = React.useCallback(
        (key: string) => typeMap[key] ?? fallbackMap[key] ?? prettify(key),
        [typeMap, fallbackMap]
    );

    const filteredFlats = React.useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return flats;
        return flats.filter(
            (f) =>
                f.shop.toLowerCase().includes(term) ||
                f.category.toLowerCase().includes(term)
        );
    }, [flats, q]);

    const pivot = React.useMemo(
        () => buildPivot(filteredFlats),
        [filteredFlats]
    );

    const categoriesSorted = React.useMemo(
        () =>
            [...pivot.categories].sort((a, b) =>
                labelFor(a).localeCompare(labelFor(b), "pl")
            ),
        [pivot.categories, labelFor]
    );

    // kliknięcie w komórkę: jeśli 1 paragon -> otwórz od razu; jeśli więcej -> otwórz selektor
    function handleCellClick(dayKey: string, category: string) {
        const ids = pivot.receiptIdsByDayCat[dayKey]?.[category] ?? [];
        if (ids.length === 1) setOpenReceiptId(ids[0]);
        else if (ids.length > 1)
            setCellChooser({ open: true, dayKey, category });
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Pasek narzędzi */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">
                        {transactionType === "expense"
                            ? "Wydatki – pivot"
                            : "Przychody – pivot"}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                        Dni: {pivot.days.length} • Kategorie:{" "}
                        {pivot.categories.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Filtr (sklepy/kategorie)..."
                        className="h-8 w-[240px]"
                    />
                </div>
            </div>

            <div className="overflow-auto border rounded">
                <Table className="w-full text-sm">
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            <TableHead className="min-w-[140px] sticky left-0 bg-background z-10">
                                Data
                            </TableHead>
                            {categoriesSorted.map((catKey) => (
                                <TableHead
                                    key={catKey}
                                    className="text-right px-3 py-2">
                                    {labelFor(catKey)}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell
                                    colSpan={categoriesSorted.length + 1}
                                    className="px-3 py-6 text-center">
                                    Ładowanie…
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && error && (
                            <TableRow>
                                <TableCell
                                    colSpan={categoriesSorted.length + 1}
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

                                    {categoriesSorted.map((catKey) => {
                                        const val =
                                            pivot.sumByDayCat[dayKey]?.[
                                                catKey
                                            ] ?? 0;
                                        const shopsMap =
                                            pivot.shopsByDayCat[dayKey]?.[
                                                catKey
                                            ] ?? {};
                                        const shops = Object.entries(
                                            shopsMap
                                        ).sort((a, b) => b[1] - a[1]);
                                        const ids =
                                            pivot.receiptIdsByDayCat[dayKey]?.[
                                                catKey
                                            ] ?? [];
                                        const clickable = ids.length > 0;

                                        return (
                                            <TableCell
                                                key={`${dayKey}-${catKey}`}
                                                className="px-2 py-1">
                                                <TooltipProvider
                                                    delayDuration={200}>
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
                                                                    handleCellClick(
                                                                        dayKey,
                                                                        catKey
                                                                    )
                                                                }>
                                                                {val
                                                                    ? nfPLN.format(
                                                                          val
                                                                      )
                                                                    : "—"}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-[320px]">
                                                            <div className="text-xs font-medium mb-1">
                                                                {
                                                                    pivot
                                                                        .dayLabel[
                                                                        dayKey
                                                                    ]
                                                                }{" "}
                                                                •{" "}
                                                                {labelFor(
                                                                    catKey
                                                                )}
                                                            </div>
                                                            {shops.length ===
                                                            0 ? (
                                                                <div className="text-xs text-muted-foreground">
                                                                    Brak pozycji
                                                                </div>
                                                            ) : (
                                                                <ul className="text-xs space-y-1">
                                                                    {shops.map(
                                                                        ([
                                                                            shop,
                                                                            sum,
                                                                        ]) => (
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
                                                                    wybrać
                                                                    paragon (x
                                                                    {ids.length}
                                                                    )
                                                                </div>
                                                            )}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}

                        {!loading && !error && pivot.days.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={categoriesSorted.length + 1}
                                    className="px-3 py-8 text-center text-muted-foreground">
                                    Brak danych do wyświetlenia.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                    {/* (opcjonalnie) Suma kolumn po tłumaczeniach */}
                    <TableFooter>
                        <TableRow>
                            <TableCell className="sticky left-0 bg-background z-10 font-medium">
                                Suma
                            </TableCell>
                            {categoriesSorted.map((catKey) => {
                                const sum = pivot.days.reduce(
                                    (acc, d) =>
                                        acc +
                                        (pivot.sumByDayCat[d]?.[catKey] ?? 0),
                                    0
                                );
                                return (
                                    <TableCell
                                        key={catKey}
                                        className="text-right font-medium">
                                        {sum ? nfPLN.format(sum) : "—"}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            {/* Modal wyboru paragonu, gdy w komórce jest >1 */}
            <Dialog
                open={cellChooser.open}
                onOpenChange={(open) =>
                    setCellChooser((s) => ({ ...s, open }))
                }>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {pivot.dayLabel[cellChooser.dayKey]} •{" "}
                            {labelFor(cellChooser.category)}
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
                                {(
                                    pivot.receiptIdsByDayCat[
                                        cellChooser.dayKey
                                    ]?.[cellChooser.category] ?? []
                                ).map((rid) => {
                                    const amt =
                                        pivot.amountByReceiptInCell[
                                            cellChooser.dayKey
                                        ]?.[cellChooser.category]?.[rid] ?? 0;
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
                                                        setOpenReceiptId(rid)
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

            {/* Modal edycji pojedynczego paragonu */}
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
