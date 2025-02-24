import SummaryFilters from "@/components/summary-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartBarPersons from "@/components/chart-bar-persons";
import ChartLinesPerson from "@/components/chart-lines-persons";
import ChartBarShops from "@/components/chart-bar-shops";
import ChartPieCategories from "@/components/chart-pie-category";

const Charts = () => {
    return (
        <div className="space-y-6">
            {/* Komponent filtrów, który może sterować parametrami wykresów */}
            <div className="mb-3">
                <SummaryFilters
                    showCategories={true}
                    transactionType="expense"
                />
            </div>

            <Tabs defaultValue="barPersons">
                <TabsList>
                    <TabsTrigger value="barPersons">
                        Wykres wydatków per osoba
                    </TabsTrigger>
                    <TabsTrigger value="line">
                        Wykres wydatków/przychodów
                    </TabsTrigger>
                    <TabsTrigger value="barShops">
                        Wykres wydatków w sklepach
                    </TabsTrigger>
                    <TabsTrigger value="pieCategories">
                        Wykres wydatków w kategoriach
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="barPersons">
                    <ChartBarPersons />
                </TabsContent>
                <TabsContent value="line">
                    <ChartLinesPerson />
                </TabsContent>
                <TabsContent value="barShops">
                    <ChartBarShops />
                </TabsContent>
                <TabsContent value="pieCategories">
                    <ChartPieCategories />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Charts;

