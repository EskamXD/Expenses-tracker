import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SummaryTab from "../components/SummaryTab";
import ChartTab from "../components/ChartTab";
import BalanceTab from "../components/BalanceTab";
import SummaryFilters from "../components/SummaryFilters.tsx";

const SummaryPage = () => {
    const [tab, setTab] = useState("expense");

    return (
        <div className="pt-1rem" style={{ margin: "0", width: "100%" }}>
            <div className="mb-3">
                <SummaryFilters transactionType={tab} />
            </div>

            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="expense">Wydatki</TabsTrigger>
                    <TabsTrigger value="income">Przychody</TabsTrigger>
                    {/* <TabsTrigger value="charts">Wykresy</TabsTrigger> */}
                    {/* <TabsTrigger value="balance">Saldo</TabsTrigger> */}
                </TabsList>

                <TabsContent value="expense">
                    <SummaryTab transactionType="expense" />
                </TabsContent>
                <TabsContent value="income">
                    <SummaryTab transactionType="income" />
                </TabsContent>
                {/* <TabsContent value="charts">
                    <ChartTab tab={tab} />
                </TabsContent> */}
                {/* <TabsContent value="balance">
                    <BalanceTab 
                        selectedOwners={selectedOwner}
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                    />
                </TabsContent> */}
            </Tabs>
        </div>
    );
};

export default SummaryPage;

