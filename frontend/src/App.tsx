import { Routes, Route } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import HomePage from "@/pages/HomePage";
import ExpensesPage from "@/pages/ExpensesPage";
import IncomePage from "@/pages/IncomePage";
import SummaryPage from "@/pages/SummaryPage";
import FlatBills from "@/pages/FlatBills";
import ImportExportPage from "@/pages/ImportExportPage";
import Settings from "@/pages/Settings";
import Loader from "@/pages/Loader";

import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/pages/layout";

import { fetchGetPerson } from "@/api/apiService";

import "@/App.css";

import { Person } from "@/types";

const App: React.FC = () => {
    // Zapytanie o dane osób – spodziewamy się tablicy Person[]
    const {
        data: personsData,
        isLoading: personsLoading,
        error: personsError,
    } = useQuery<Person[]>({
        queryKey: ["persons"],
        queryFn: () => fetchGetPerson(),
    });

    // // Zapytanie o dane paragonów – spodziewamy się tablicy Receipt[]
    // const {
    //     data: receiptsData,
    //     isLoading: receiptsLoading,
    //     error: receiptsError,
    // } = useQuery<Receipt[]>({
    //     queryKey: ["receipts", currentMonth, currentYear],
    //     queryFn: () => {
    //         const params: Params = {
    //             month: currentMonth,
    //             year: currentYear,
    //         };
    //         return fetchGetReceipts(params);
    //     },
    //     enabled: !!personsData && personsData.length > 0, // zapytanie wykona się tylko, gdy dane osób są dostępne
    // });

    // Łączny status ładowania
    const isLoading = personsLoading;

    if (isLoading) {
        return <Skeleton />;
    }

    if (personsError) {
        return <div>Error loading persons data</div>;
    }

    // Jeśli pobrane dane osób są puste – wyświetlamy loader (dostosuj wg potrzeb)
    if (personsData && personsData.length === 0) {
        return <Loader />;
    }

    return (
        <Routes>
            {/* Layout zawiera pasek boczny i zawartość renderowaną przez Outlet */}
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="income" element={<IncomePage />} />
                <Route path="summary" element={<SummaryPage />} />
                <Route path="bills" element={<FlatBills />} />
                <Route path="import-export" element={<ImportExportPage />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    );
};

export default App;

