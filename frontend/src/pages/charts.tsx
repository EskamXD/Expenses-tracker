import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { useGlobalContext } from "@/context/GlobalContext";
import ResponsiveFilters from "@/components/responsive-filters";

import ChartBarPersons from "@/components/chart-bar-persons";
import ChartLinesPerson from "@/components/chart-lines-persons";
import ChartBarShops from "@/components/chart-bar-shops";
import ChartPieCategories from "@/components/chart-pie-category";

const Charts = () => {
    const { chartsTab, setChartsTab } = useGlobalContext();

    const options = [
        { value: "barPersons", label: "Wydatki per osoba" },
        { value: "line", label: "Wydatki/przychody" },
        { value: "barShops", label: "Wydatki w sklepach" },
        { value: "pieCategories", label: "Wydatki według kategorii" },
    ] as const;

    return (
        <div className="space-y-6">
            <ResponsiveFilters
                showCategories
                showYearMonth
                transactionType=""
            />

            <Tabs
                value={chartsTab}
                onValueChange={setChartsTab}
                className="h-full">
                {/* mobile: shadcn Select */}
                <div className="sm:hidden mb-4">
                    <Select
                        onValueChange={(v) =>
                            setChartsTab(v as typeof chartsTab)
                        }
                        value={chartsTab}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wybierz wykres…" />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* desktop: TabsList */}
                <div className="hidden sm:block mb-4">
                    <TabsList>
                        {options.map((opt) => (
                            <TabsTrigger key={opt.value} value={opt.value}>
                                {opt.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* content panels */}
                <TabsContent value="barPersons">
                    <ChartBarPersons />
                </TabsContent>
                <TabsContent value="line">
                    <ChartLinesPerson />
                </TabsContent>
                <TabsContent value="barShops">
                    <ChartBarShops />
                </TabsContent>
                <TabsContent value="pieCategories" className="h-full lg:h-auto">
                    <ChartPieCategories />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Charts;
