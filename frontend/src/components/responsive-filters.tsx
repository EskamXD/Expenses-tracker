// src/components/responsive-filters.tsx
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import SummaryFilters from "@/components/summary-filters";

interface ResponsiveFiltersProps {
    // pass through whatever props SummaryFilters needs
    showOwnersDropdown?: boolean;
    showYear?: boolean;
    showMonth?: boolean;
    showCategories?: boolean;
    transactionType: "income" | "expense";
}

const ResponsiveFilters: React.FC<ResponsiveFiltersProps> = (props) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile: show a button */}
            <div className="sm:hidden mb-3">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                            Filtry
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-2/4 p-4">
                        <h2 className="text-lg font-semibold mb-2">Filtry</h2>
                        <SummaryFilters {...props} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop: inline filters */}
            <div className="hidden sm:block mb-3">
                <SummaryFilters {...props} />
            </div>
        </>
    );
};

export default ResponsiveFilters;
