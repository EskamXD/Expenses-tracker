import { fetchGetInvestmentCurrentValue } from "@/api/apiService";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Investment } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";

interface InvestmentCardProps {
    group: Investment;
}

export type InvestmentValue = {
    capital: number;
    current_value: number;
};

const InvestmentCard: React.FC<InvestmentCardProps> = ({ group }) => {
    const {
        data: investmentData,
        isLoading,
        isError,
    } = useQuery<InvestmentValue>({
        queryKey: ["investmentsValue", group.id],
        queryFn: async () => fetchGetInvestmentCurrentValue(group.id),
    });

    if (isLoading) {
        return <Skeleton className="w-full h-full" />;
    }

    if (!investmentData || isError) {
        return <></>;
    }
    // Wyliczenia: wartość, zysk, % zysku
    // const actualPrice = group.current_value ?? group.capitalization ?? 0;
    // const currentValue = actualPrice * (group. ?? 1) || group.value;
    const profit = investmentData?.current_value - investmentData?.capital;
    const profitPct =
        investmentData.capital > 0
            ? (profit / investmentData.capital) * 100
            : 0;

    // // Dodatkowe detale (opcjonalnie, mały font)
    // const detale: string[] = [];
    // if (group.units && group.units > 0) detale.push(`Ilość: ${group.units}`);
    // if (group.purchase_price && group.purchase_price > 0)
    //     detale.push(`Cena zakupu: ${group.purchase_price}`);
    // if (group.payment_date) detale.push(`Data zakupu: ${group.payment_date}`);
    // if ((group as any).interest_rate)
    //     detale.push(`Oprocentowanie: ${(group as any).interest_rate}%`);
    // if ((group as any).maturity_date)
    //     detale.push(`Koniec: ${(group as any).maturity_date}`);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                {group.symbol && (
                    <div className="text-xs text-muted-foreground">
                        {group.symbol}
                    </div>
                )}
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold">
                        {Number(investmentData?.capital).toFixed(2)} PLN
                    </span>
                    <span className="text-xs text-muted-foreground">
                        wpłata
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold">
                        {Number(investmentData?.current_value).toFixed(2)} PLN
                    </span>
                    <span className="text-xs text-muted-foreground">
                        aktualnie
                    </span>
                </div>
                <div>
                    <span
                        className={
                            "text-sm font-semibold px-2 py-1 rounded " +
                            (profitPct > 0
                                ? "bg-green-100 text-green-800"
                                : profitPct < 0
                                ? "bg-red-100 text-red-800"
                                : "bg-muted text-muted-foreground")
                        }>
                        {profitPct >= 0 ? "+" : ""}
                        {profitPct.toFixed(2)}%
                    </span>
                </div>
            </CardContent>
            {/* {detale.length > 0 && (
                <CardFooter className="pt-2">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        {detale.map((d, i) => (
                            <span key={i}>{d}</span>
                        ))}
                    </div>
                </CardFooter>
            )} */}
        </Card>
    );
};

export default InvestmentCard;

