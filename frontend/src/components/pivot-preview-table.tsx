import React from "react";
import type { PivotResult } from "@/pivot-types";
import { selectTranslationList } from "@/lib/select-option";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
    result: PivotResult;
    isLoading?: boolean;
};

const fmt = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 });

const columnLabels: Record<string, string> = {
    category: "Kategoria",
    shop: "Sklep",
    payer: "Płatnik",
    owner: "Właściciel",
    value: "Wartość",
    count: "Liczba pozycji",
    period: "Okres",
    date: "Data",
    day: "Dzień",
    week: "Tydzień",
    month: "Miesiąc",
    year: "Rok",
};

const valueLabels = Object.fromEntries(
    selectTranslationList.map((item) => [item.value, item.label]),
);

const translate = (value: string) => {
    return columnLabels[value] ?? valueLabels[value] ?? value;
};

const formatHeader = (col: string) => translate(col);

const formatCell = (col: string, v: unknown) => {
    if (v === null || v === undefined) return "";

    if ((col === "value" || col === "count") && typeof v === "number") {
        return fmt.format(v);
    }

    if (typeof v === "string") {
        return translate(v);
    }

    return String(v);
};

export const PivotPreviewTable: React.FC<Props> = ({ result, isLoading }) => {
    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        );
    }

    if (!result.rows.length) {
        return (
            <div className="text-sm text-muted-foreground">
                Brak danych dla wybranych filtrów.
            </div>
        );
    }

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {result.columns.map((c) => (
                            <TableHead key={c} className="whitespace-nowrap">
                                {formatHeader(c)}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {result.rows.map((row, idx) => (
                        <TableRow key={idx}>
                            {result.columns.map((c) => (
                                <TableCell
                                    key={c}
                                    className="whitespace-nowrap">
                                    {formatCell(c, row[c])}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
