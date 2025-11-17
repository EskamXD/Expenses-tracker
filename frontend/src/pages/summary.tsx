import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SummaryTab from "@/components/summary-tab";
import { useGlobalContext } from "@/context/GlobalContext";
import ResponsiveFilters from "@/components/responsive-filters";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ReceiptsPivotTable from "@/components/receipts-pivot-table";

const Summary = () => {
    const { summaryTab, setSummaryTab } = useGlobalContext();
    const [view, setView] = useState<"summary" | "table">("summary");

    return (
        <div className="pt-1rem" style={{ margin: "0", width: "100%" }}>
            {/* Zostaje — to jest wrapper RWD do SummaryFilters */}
            <ResponsiveFilters transactionType={summaryTab} />

            <div className="mb-2 flex items-center justify-between">
                <Tabs
                    value={summaryTab}
                    onValueChange={(v) =>
                        setSummaryTab(v as "expense" | "income")
                    }
                    className="w-full max-w-[420px]">
                    <TabsList>
                        <TabsTrigger value="expense">Wydatki</TabsTrigger>
                        <TabsTrigger value="income">Przychody</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                    <Label htmlFor="view" className="text-sm">
                        Widok:
                    </Label>
                    <Select
                        value={view}
                        onValueChange={(v: "summary" | "table") => setView(v)}>
                        <SelectTrigger id="view" className="w-[180px] h-8">
                            <SelectValue placeholder="Wybierz widok" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="summary">
                                Podsumowanie
                            </SelectItem>
                            <SelectItem value="table">
                                Tabela (Excel)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {view === "summary" ? (
                <Tabs value={summaryTab} className="w-full">
                    <TabsContent value="expense">
                        <SummaryTab transactionType="expense" />
                    </TabsContent>
                    <TabsContent value="income">
                        <SummaryTab transactionType="income" />
                    </TabsContent>
                </Tabs>
            ) : (
                <Tabs value={summaryTab} className="w-full">
                    <TabsContent value="expense">
                        <ReceiptsPivotTable transactionType="expense" />
                    </TabsContent>
                    <TabsContent value="income">
                        <ReceiptsPivotTable transactionType="income" />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};

export default Summary;
