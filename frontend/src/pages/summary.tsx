import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SummaryTab from "@/components/summary-tab";
import { useGlobalContext } from "@/context/GlobalContext";
import ResponsiveFilters from "@/components/responsive-filters";

const Summary = () => {
    const { summaryTab, setSummaryTab } = useGlobalContext();

    return (
        <div className="pt-1rem" style={{ margin: "0", width: "100%" }}>
            <ResponsiveFilters transactionType={summaryTab} />

            <Tabs
                value={summaryTab}
                onValueChange={(v) => setSummaryTab(v as "expense" | "income")}
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
