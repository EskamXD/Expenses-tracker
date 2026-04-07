import React, { useMemo, useState } from "react";

import type { PivotCardProps, PivotSpec } from "@/pivot-types";
import {
    buildPeopleIndex,
    computePivot,
    distinctFromReceipts,
} from "@/lib/pivot-utils";

// dostosuj ścieżkę importu do miejsca, gdzie trzymasz ten plik
import { selectTranslationList } from "@/lib/select-option";

import { PivotPreviewTable } from "@/components/pivot-preview-table";
import { MultiSelect } from "@/components/multi-select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";

const defaultSpec: PivotSpec = {
    transactionType: "expense",
    timeGrain: "month",
    groupBy: ["category"],
    measure: { op: "sum", field: "value" },
    ownerAllocation: "split_even",
    sortBy: "value",
    sortDir: "asc",
    limit: 20,
};

const GROUP_BY_LABELS: Record<string, string> = {
    category: "Kategoria",
    shop: "Sklep",
    payer: "Płatnik",
    owner: "Właściciel",
};

const SORT_BY_LABELS: Record<string, string> = {
    value: "Wartość",
    count: "Liczba pozycji",
};

const SORT_DIR_LABELS: Record<string, string> = {
    asc: "Rosnąco",
    desc: "Malejąco",
};

const TIME_GRAIN_LABELS: Record<string, string> = {
    none: "Brak",
    day: "Dzień",
    week: "Tydzień",
    month: "Miesiąc",
    year: "Rok",
};

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
    all: "Wszystkie",
    expense: "Wydatki",
    income: "Przychody",
};

const OWNER_ALLOCATION_LABELS: Record<string, string> = {
    split_even: "Podział równy",
    full_value: "Pełna kwota dla każdego ownera",
};

const MEASURE_LABELS: Record<string, string> = {
    sum: "Suma wartości",
    count: "Liczba pozycji",
    avg: "Średnia wartości",
};

export const PivotCard: React.FC<PivotCardProps> = ({
    receipts,
    people,
    isLoading,
}) => {
    const [spec, setSpec] = useState<PivotSpec>(defaultSpec);

    const peopleIndex = useMemo(
        () => (people?.length ? buildPeopleIndex(people) : undefined),
        [people],
    );

    const options = useMemo(() => distinctFromReceipts(receipts), [receipts]);

    const result = useMemo(
        () => computePivot(receipts, spec, peopleIndex),
        [receipts, spec, peopleIndex],
    );

    const translationMap = useMemo(
        () =>
            Object.fromEntries(
                selectTranslationList.map((item) => [item.value, item.label]),
            ),
        [],
    );

    const translateOptionLabel = (value: string) => {
        return translationMap[value] ?? value;
    };

    const setField = <K extends keyof PivotSpec>(
        key: K,
        value: PivotSpec[K],
    ) => {
        setSpec((s) => ({ ...s, [key]: value }));
    };

    const payerIds = peopleIndex?.payers?.length
        ? peopleIndex.payers.map((p) => p.id)
        : options.payers;

    const ownerIds = peopleIndex?.owners?.length
        ? peopleIndex.owners.map((p) => p.id)
        : options.owners;

    const categoryOptions = options.categories.map((c) => ({
        value: c,
        label: translateOptionLabel(c),
    }));

    const shopOptions = options.shops.map((s) => ({
        value: s,
        label: s,
    }));

    const payerOptions = payerIds.map((id) => ({
        value: String(id),
        label: peopleIndex?.byId?.[id]?.name ?? String(id),
    }));

    const ownerOptions = ownerIds.map((id) => ({
        value: String(id),
        label: peopleIndex?.byId?.[id]?.name ?? String(id),
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Pivot</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Okres</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                type="date"
                                value={spec.dateFrom ?? ""}
                                onChange={(e) =>
                                    setField(
                                        "dateFrom",
                                        e.target.value || undefined,
                                    )
                                }
                            />
                            <Input
                                type="date"
                                value={spec.dateTo ?? ""}
                                onChange={(e) =>
                                    setField(
                                        "dateTo",
                                        e.target.value || undefined,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Typ</Label>
                        <Select
                            value={spec.transactionType ?? "all"}
                            onValueChange={(v) =>
                                setField(
                                    "transactionType",
                                    v === "all"
                                        ? undefined
                                        : (v as "expense" | "income"),
                                )
                            }>
                            <SelectTrigger>
                                <SelectValue placeholder="Wszystkie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {TRANSACTION_TYPE_LABELS.all}
                                </SelectItem>
                                <SelectItem value="expense">
                                    {TRANSACTION_TYPE_LABELS.expense}
                                </SelectItem>
                                <SelectItem value="income">
                                    {TRANSACTION_TYPE_LABELS.income}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <div className="text-sm font-medium">Filtry</div>

                        <div className="space-y-2">
                            <Label>Kategoria</Label>
                            <MultiSelect
                                options={categoryOptions}
                                value={spec.categories ?? []}
                                onChange={(vals) =>
                                    setField("categories", vals)
                                }
                                placeholder="Wszystkie"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Sklep</Label>
                            <MultiSelect
                                options={shopOptions}
                                value={spec.shops ?? []}
                                onChange={(vals) => setField("shops", vals)}
                                placeholder="Wszystkie"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Płatnik</Label>
                            <MultiSelect
                                options={payerOptions}
                                value={(spec.payers ?? []).map(String)}
                                onChange={(vals) =>
                                    setField("payers", vals.map(Number))
                                }
                                placeholder="Wszyscy"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Właściciel</Label>
                            <MultiSelect
                                options={ownerOptions}
                                value={(spec.owners ?? []).map(String)}
                                onChange={(vals) =>
                                    setField("owners", vals.map(Number))
                                }
                                placeholder="Wszyscy"
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Grupuj po</Label>
                        <ToggleGroup
                            type="multiple"
                            value={spec.groupBy}
                            onValueChange={(vals) =>
                                setField("groupBy", vals as any)
                            }
                            className="justify-start flex-wrap">
                            <ToggleGroupItem value="category">
                                {GROUP_BY_LABELS.category}
                            </ToggleGroupItem>
                            <ToggleGroupItem value="shop">
                                {GROUP_BY_LABELS.shop}
                            </ToggleGroupItem>
                            <ToggleGroupItem value="payer">
                                {GROUP_BY_LABELS.payer}
                            </ToggleGroupItem>
                            <ToggleGroupItem value="owner">
                                {GROUP_BY_LABELS.owner}
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <div className="space-y-2">
                        <Label>Bucket czasu</Label>
                        <Select
                            value={spec.timeGrain}
                            onValueChange={(v) =>
                                setField("timeGrain", v as any)
                            }>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    {TIME_GRAIN_LABELS.none}
                                </SelectItem>
                                <SelectItem value="day">
                                    {TIME_GRAIN_LABELS.day}
                                </SelectItem>
                                <SelectItem value="week">
                                    {TIME_GRAIN_LABELS.week}
                                </SelectItem>
                                <SelectItem value="month">
                                    {TIME_GRAIN_LABELS.month}
                                </SelectItem>
                                <SelectItem value="year">
                                    {TIME_GRAIN_LABELS.year}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Miara</Label>
                        <Select
                            value={spec.measure.op}
                            onValueChange={(v) =>
                                setSpec((s) => ({
                                    ...s,
                                    measure: { ...s.measure, op: v as any },
                                }))
                            }>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sum">
                                    {MEASURE_LABELS.sum}
                                </SelectItem>
                                <SelectItem value="count">
                                    {MEASURE_LABELS.count}
                                </SelectItem>
                                <SelectItem value="avg">
                                    {MEASURE_LABELS.avg}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Alokacja ownerów</Label>
                        <Select
                            value={spec.ownerAllocation}
                            onValueChange={(v) =>
                                setField("ownerAllocation", v as any)
                            }>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="split_even">
                                    {OWNER_ALLOCATION_LABELS.split_even}
                                </SelectItem>
                                <SelectItem value="full_value">
                                    {OWNER_ALLOCATION_LABELS.full_value}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-2">
                            <Label>Sortuj po</Label>
                            <Select
                                value={spec.sortBy}
                                onValueChange={(v) =>
                                    setField("sortBy", v as any)
                                }>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="value">
                                        {SORT_BY_LABELS.value}
                                    </SelectItem>
                                    <SelectItem value="count">
                                        {SORT_BY_LABELS.count}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Kierunek</Label>
                            <Select
                                value={spec.sortDir}
                                onValueChange={(v) =>
                                    setField("sortDir", v as any)
                                }>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asc">
                                        {SORT_DIR_LABELS.asc}
                                    </SelectItem>
                                    <SelectItem value="desc">
                                        {SORT_DIR_LABELS.desc}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Limit</Label>
                            <Input
                                type="number"
                                min={1}
                                max={500}
                                value={spec.limit}
                                onChange={(e) =>
                                    setField(
                                        "limit",
                                        Number(e.target.value || 20),
                                    )
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-baseline justify-between">
                    <CardTitle>Podgląd</CardTitle>
                    <div className="text-xs text-muted-foreground">
                        Paragony: {receipts.length}{" "}
                        {isLoading ? "• ładowanie…" : ""}
                    </div>
                </CardHeader>
                <CardContent>
                    <PivotPreviewTable result={result} isLoading={isLoading} />
                </CardContent>
            </Card>
        </div>
    );
};
