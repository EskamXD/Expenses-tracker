import React, { useMemo, useState } from "react";

import type { PivotCardProps, PivotSpec } from "@/pivot-types";
import {
    buildPeopleIndex,
    computePivot,
    distinctFromReceipts,
} from "@/lib/pivot-utils";

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

export const PivotCard: React.FC<PivotCardProps> = ({
    receipts,
    people,
    isLoading,
}) => {
    const [spec, setSpec] = useState<PivotSpec>(defaultSpec);

    const peopleIndex = useMemo(
        () => (people?.length ? buildPeopleIndex(people) : undefined),
        [people]
    );

    const options = useMemo(() => distinctFromReceipts(receipts), [receipts]);

    const result = useMemo(
        () => computePivot(receipts, spec, peopleIndex),
        [receipts, spec, peopleIndex]
    );

    const setField = <K extends keyof PivotSpec>(
        key: K,
        value: PivotSpec[K]
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
        label: c,
    }));
    const shopOptions = options.shops.map((s) => ({ value: s, label: s }));

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
            {/* Builder */}
            <Card>
                <CardHeader>
                    <CardTitle>Pivot</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Okres */}
                    <div className="space-y-2">
                        <Label>Okres</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                type="date"
                                value={spec.dateFrom ?? ""}
                                onChange={(e) =>
                                    setField(
                                        "dateFrom",
                                        e.target.value || undefined
                                    )
                                }
                            />
                            <Input
                                type="date"
                                value={spec.dateTo ?? ""}
                                onChange={(e) =>
                                    setField(
                                        "dateTo",
                                        e.target.value || undefined
                                    )
                                }
                            />
                        </div>
                    </div>

                    {/* Typ */}
                    <div className="space-y-2">
                        <Label>Typ</Label>
                        <Select
                            value={spec.transactionType ?? "all"}
                            onValueChange={(v) =>
                                setField(
                                    "transactionType",
                                    v === "all"
                                        ? undefined
                                        : (v as "expense" | "income")
                                )
                            }>
                            <SelectTrigger>
                                <SelectValue placeholder="Wszystkie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Wszystkie</SelectItem>
                                <SelectItem value="expense">Wydatki</SelectItem>
                                <SelectItem value="income">
                                    Przychody
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* Filtry */}
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
                            <Label>Payer</Label>
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
                            <Label>Owner</Label>
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

                    {/* Grupuj po */}
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
                                category
                            </ToggleGroupItem>
                            <ToggleGroupItem value="shop">shop</ToggleGroupItem>
                            <ToggleGroupItem value="payer">
                                payer
                            </ToggleGroupItem>
                            <ToggleGroupItem value="owner">
                                owner
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    {/* Bucket czasu */}
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
                                <SelectItem value="none">Brak</SelectItem>
                                <SelectItem value="day">Dzień</SelectItem>
                                <SelectItem value="week">Tydzień</SelectItem>
                                <SelectItem value="month">Miesiąc</SelectItem>
                                <SelectItem value="year">Rok</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Miara */}
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
                                    Suma wartości
                                </SelectItem>
                                <SelectItem value="count">
                                    Liczba pozycji
                                </SelectItem>
                                <SelectItem value="avg">
                                    Średnia wartości
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Alokacja */}
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
                                    Podział równy
                                </SelectItem>
                                <SelectItem value="full_value">
                                    Pełna kwota dla każdego ownera
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort + Top */}
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
                                    <SelectItem value="value">value</SelectItem>
                                    <SelectItem value="count">count</SelectItem>
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
                                    <SelectItem value="asc">asc</SelectItem>
                                    <SelectItem value="desc">desc</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Top</Label>
                            <Input
                                type="number"
                                min={1}
                                max={500}
                                value={spec.limit}
                                onChange={(e) =>
                                    setField(
                                        "limit",
                                        Number(e.target.value || 20)
                                    )
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preview */}
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
