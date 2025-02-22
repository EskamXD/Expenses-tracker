import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SummaryTab from "@/components/summary-tab";
import SummaryFilters from "@/components/summary-filters";

const Summary = () => {
    const [tab, setTab] = useState<"expense" | "income">("expense");

    return (
        <div className="pt-1rem" style={{ margin: "0", width: "100%" }}>
            <div className="mb-3">
                <SummaryFilters transactionType={tab} />
            </div>

            <Tabs
                value={tab}
                onValueChange={(value) => setTab(value as "expense" | "income")}
                className="w-full">
                <TabsList>
                    <TabsTrigger value="expense">Wydatki</TabsTrigger>
                    <TabsTrigger value="income">Przychody</TabsTrigger>
                </TabsList>

                <TabsContent value="expense">
                    <SummaryTab transactionType="expense" />
                </TabsContent>
                <TabsContent value="income">
                    <SummaryTab transactionType="income" />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Summary;

