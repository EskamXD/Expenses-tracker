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

import { fetchGetPerson } from "./services/apiService";

import "bootstrap/dist/css/bootstrap.min.css";

const App: React.FC = () => {
    const [person, setPerson] = useState([]);
    const [reload, setReload] = useState(false);

    const fetchFunction = async () => {
        fetchGetPerson().then((response) => {
            setPerson(response);
            localStorage.setItem("person", JSON.stringify(response));
        });
    };

    useEffect(() => {
        fetchFunction();
        setReload(false);
    }, [reload]);

    return (
        <>
            {person.length === 0 ? (
                /* Tutaj możesz dodać loader, np. */
                (localStorage.clear(), (<Loader setReload={setReload} />))
            ) : (
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

