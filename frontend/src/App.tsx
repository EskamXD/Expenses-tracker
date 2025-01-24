import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import ExpensesPage from "./pages/ExpensesPage";
import HomePage from "./pages/HomePage";
import IncomePage from "./pages/IncomePage";
import SummaryPage from "./pages/SummaryPage";
import FlatBills from "./pages/FlatBills";
import ImportExportPage from "./pages/ImportExportPage";
import Settings from "./pages/Settings";
import Loader from "./pages/Loader";

import SiteNavbar from "./components/SiteNavbar";
import Container from "react-bootstrap/Container";

import { Params } from "./types.tsx";
import { fetchGetPerson, fetchGetReceipts } from "./api/apiService";

import { useGlobalContext } from "./context/GlobalContext";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Spinner } from "react-bootstrap";

const App: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const { persons, setPersons, setReceipts } = useGlobalContext();

    useEffect(() => {
        setLoading(true);

        fetchGetPerson()
            .then((response) => {
                response.length !== 0 ? setPersons(response) : setPersons([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setLoading(true);

        const params = {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
        } as Params;

        fetchGetReceipts(params)
            .then((response) => {
                response.length !== 0 ? setReceipts(response) : setReceipts([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [persons]);

    return (
        <>
            {persons.length === 0 && loading === true && <Spinner />}
            {persons.length === 0 && loading === false && (
                /* Tutaj możesz dodać loader, np. */
                <Loader />
            )}
            {persons.length > 0 && loading === false && (
                // save Persons in local storage
                <>
                    <SiteNavbar />

                    <Container data-bs-theme="dark">
                        <Routes>
                            <Route
                                path="/expenses/"
                                element={<ExpensesPage />}
                            />
                            <Route path="/income/" element={<IncomePage />} />
                            <Route path="/summary/" element={<SummaryPage />} />
                            <Route path="/bills/" element={<FlatBills />} />
                            <Route
                                path="/import-export/"
                                element={<ImportExportPage />}
                            />
                            <Route path="/settings/" element={<Settings />} />
                            {/* Możesz również dodać stronę domyślną, np. */}
                            <Route path="/" element={<HomePage />} />
                        </Routes>
                    </Container>
                </>
            )}
        </>
    );
};

export default App;
