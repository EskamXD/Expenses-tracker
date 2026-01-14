import React from "react";
import type { PivotResult } from "@/pivot-types";

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

const formatCell = (col: string, v: unknown) => {
    if (v === null || v === undefined) return "";
    if ((col === "value" || col === "count") && typeof v === "number")
        return fmt.format(v);
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
                                {c}
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
