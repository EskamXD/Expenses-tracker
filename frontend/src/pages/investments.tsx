import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import apiClient from "@/api/apiClient";

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

// Funkcja pobierająca podsumowanie portfela
const fetchPortfolioSummary = async (): Promise<PortfolioSummary> => {
    const response = await apiClient.get("/portfolio/");
    return response.data;
};

// Funkcja pobierająca inwestycje i mapująca dane do formatu camelCase
const fetchInvestments = async (): Promise<Investment[]> => {
    const response = await apiClient.get("/investments/");
    let data = response.data;
    console.log("data: ", data);
    // Jeśli API zwraca obiekt z polem "results" lub "investments", to pobieramy właściwą tablicę
    if (data.results && Array.isArray(data.results)) {
        data = data.results;
    } else if (data.investments && Array.isArray(data.investments)) {
        data = data.investments;
    }
    // Jeśli otrzymaliśmy tablicę, mapujemy dane
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

    // Jeśli investments nie jest tablicą, ustawiamy pustą tablicę
    const investmentList = Array.isArray(investments) ? investments : [];

    return (
        <>
            <h1 className="text-2xl font-bold mt-4">Inwestycje</h1>

            {/* Podsumowanie portfela */}
            <section className="mb-6 p-4 border rounded shadow">
                <h2 className="text-xl font-semibold mb-4">
                    Podsumowanie Portfela
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p>
                            <strong>Całkowita wpłata:</strong>{" "}
                            {portfolio?.total_invested} PLN
                        </p>
                        <p>
                            <strong>Aktualna wartość:</strong>{" "}
                            {portfolio?.total_value} PLN
                        </p>
                    </div>
                    <div>
                        <p>
                            <strong>Zysk/Strata:</strong>{" "}
                            {portfolio?.profit_loss} PLN
                        </p>
                        <p>
                            <strong>Zysk/Strata (%):</strong>{" "}
                            {portfolio?.profit_loss_percent?.toFixed(2) ??
                                "0.00"}
                            %
                        </p>
                    </div>
                </div>
            </section>

            {/* Lista inwestycji */}
            <section className="mb-6 p-4 border rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Lista Inwestycji</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
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
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {investmentList.map((inv) => (
                            <tr key={inv.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {inv.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {inv.invested} PLN
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {inv.currentValue} PLN
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {inv.profitLoss} PLN
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(inv.lastUpdated).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Sekcja na wykresy */}
            <section className="p-4 border rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Wykresy</h2>
                <p>
                    Tutaj możesz umieścić wykresy ilustrujące zmiany wartości
                    portfela oraz poszczególnych inwestycji.
                </p>
            </section>
        </>
    );
};

export default Investments;

