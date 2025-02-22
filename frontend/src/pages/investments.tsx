import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Interfejsy typów danych
interface PortfolioSummary {
    total_invested: number;
    total_value: number;
    profit_loss: number;
    profit_loss_percent: number;
}

interface Investment {
    id: number;
    name: string;
    invested: number;
    currentValue: number;
    profitLoss: number;
    lastUpdated: string;
}

// Dane przykładowe do wykresu – w praktyce możesz pobierać historyczne dane portfela
const chartData = [
    { date: "2023-01-01", value: 10000 },
    { date: "2023-02-01", value: 10500 },
    { date: "2023-03-01", value: 11000 },
    { date: "2023-04-01", value: 11500 },
    { date: "2023-05-01", value: 12000 },
];

// Funkcje formatujące
const formatCurrency = (value?: number) =>
    value != null
        ? value.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : "0.00";

const formatPercentage = (value?: number) =>
    value != null
        ? value.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : "0.00";

// Pobieranie danych
const fetchPortfolioSummary = async (): Promise<PortfolioSummary> => {
    const response = await apiClient.get("/wallet-snapshots/");
    return response.data;
};

const fetchInvestments = async (): Promise<Investment[]> => {
    const response = await apiClient.get("/invests/");
    let data = response.data;
    if (data.results && Array.isArray(data.results)) {
        data = data.results;
    } else if (data.invests && Array.isArray(data.invests)) {
        data = data.invests;
    }
    if (Array.isArray(data)) {
        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            invested: Number(item.invested),
            currentValue: Number(item.current_value),
            profitLoss: Number(item.profit_loss),
            lastUpdated: item.last_updated,
        }));
    }
    return [];
};

// Mutacja do aktualizacji wartości inwestycji (przykładowa)
const updateInvestmentValue = async ({
    id,
    newValue,
}: {
    id: number;
    newValue: number;
}) => {
    const response = await apiClient.patch(`/api/invests/${id}/`, {
        current_value: newValue,
    });
    return response.data;
};

// Komponent wykresu
const InvestmentChart: React.FC = () => {
    return (
        <div className="mb-6 p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Przyrosty portfela</h2>
            <LineChart width={800} height={300} data={chartData}>
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
            </LineChart>
        </div>
    );
};

// Komponent listy inwestycji
const InvestmentList: React.FC<{ investments: Investment[] }> = ({
    investments,
}) => {
    const queryClient = useQueryClient();
    const [selectedInvestment, setSelectedInvestment] =
        useState<Investment | null>(null);
    const [newValue, setNewValue] = useState("");

    const mutation = useMutation({
        mutationFn: updateInvestmentValue,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["investments"] });
            setSelectedInvestment(null);
        },
    });

    return (
        <div className="mb-6 p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Lista Inwestycji</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Nazwa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Wpłacone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Aktualna wartość
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Zysk/Strata
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Ostatnia aktualizacja
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Akcja
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {investments.map((inv) => (
                            <tr key={inv.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {inv.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {formatCurrency(inv.invested)} PLN
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {formatCurrency(inv.currentValue)} PLN
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={
                                            inv.profitLoss > 0
                                                ? "text-green-500"
                                                : inv.profitLoss < 0
                                                ? "text-red-500"
                                                : "text-gray-500"
                                        }>
                                        {formatCurrency(inv.profitLoss)} PLN
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(inv.lastUpdated).toLocaleString(
                                        "pl-PL"
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Dialog
                                        open={selectedInvestment?.id === inv.id}
                                        onOpenChange={(open) => {
                                            if (open) {
                                                setSelectedInvestment(inv);
                                                setNewValue(
                                                    String(inv.currentValue)
                                                );
                                            } else {
                                                setSelectedInvestment(null);
                                            }
                                        }}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                Edytuj
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Edycja wartości dla{" "}
                                                    {inv.name}
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="flex flex-col gap-4 mt-4">
                                                <input
                                                    type="number"
                                                    value={newValue}
                                                    onChange={(e) =>
                                                        setNewValue(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="p-2 border rounded"
                                                />
                                                <Button
                                                    onClick={() => {
                                                        mutation.mutate({
                                                            id: inv.id,
                                                            newValue:
                                                                Number(
                                                                    newValue
                                                                ),
                                                        });
                                                    }}>
                                                    Zapisz
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Investments: React.FC = () => {
    // Zapytanie o podsumowanie portfela
    const {
        data: portfolio,
        isLoading: loadingPortfolio,
        error: errorPortfolio,
    } = useQuery<PortfolioSummary>({
        queryKey: ["portfolio"],
        queryFn: fetchPortfolioSummary,
    });

    // Zapytanie o listę inwestycji
    const {
        data: investments,
        isLoading: loadingInvestments,
        error: errorInvestments,
    } = useQuery<Investment[]>({
        queryKey: ["investments"],
        queryFn: fetchInvestments,
    });

    if (loadingPortfolio || loadingInvestments) {
        return <div className="p-6">Ładowanie danych...</div>;
    }

    if (errorPortfolio || errorInvestments) {
        return <div className="p-6">Błąd ładowania danych</div>;
    }

    const investmentList = Array.isArray(investments) ? investments : [];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mt-4 mb-6">Inwestycje</h1>
            {/* Podsumowanie portfela */}
            <section className="mb-6 p-4 border rounded shadow">
                <h2 className="text-xl font-semibold mb-4">
                    Podsumowanie Portfela
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p>
                            <strong>Całkowita wpłata:</strong>{" "}
                            {formatCurrency(portfolio!.total_invested)} PLN
                        </p>
                        <p>
                            <strong>Aktualna wartość:</strong>{" "}
                            {formatCurrency(portfolio!.total_value)} PLN
                        </p>
                    </div>
                    <div>
                        <p>
                            <strong>Zysk/Strata:</strong>{" "}
                            <span
                                className={
                                    portfolio!.profit_loss > 0
                                        ? "text-green-500"
                                        : portfolio!.profit_loss < 0
                                        ? "text-red-500"
                                        : "text-gray-500"
                                }>
                                {formatCurrency(portfolio!.profit_loss)} PLN
                            </span>
                        </p>
                        <p>
                            <strong>Zysk/Strata (%):</strong>{" "}
                            <span
                                className={
                                    portfolio!.profit_loss_percent > 0
                                        ? "text-green-500"
                                        : portfolio!.profit_loss_percent < 0
                                        ? "text-red-500"
                                        : "text-gray-500"
                                }>
                                {formatPercentage(
                                    portfolio!.profit_loss_percent
                                )}
                                %
                            </span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Wykres inwestycji */}
            <InvestmentChart />

            {/* Lista inwestycji */}
            <InvestmentList investments={investmentList} />

            {/* Sekcja na wykresy dodatkowe */}
            <section className="p-4 border rounded shadow">
                <h2 className="text-xl font-semibold mb-4">
                    Dodatkowe wykresy
                </h2>
                <p>
                    Tutaj możesz umieścić wykresy ilustrujące zmiany wartości
                    poszczególnych inwestycji.
                </p>
            </section>
        </div>
    );
};

export default Investments;

