import React, { useEffect, useState } from "react";
import axios from "axios";
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

import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
    const [person, setPerson] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/person/"
                );
                setPerson(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetch();
    }, []);

    return (
        <>
            {person.length === 0 ? (
                /* Tutaj możesz dodać loader, np. */
                <Loader />
            ) : (
                // save Persons in local storage
                (localStorage.setItem("person", JSON.stringify(person)),
                (
                    <>
                        <SiteNavbar />

                        <Container data-bs-theme="dark">
                            <Routes>
                                <Route
                                    path="/expenses"
                                    element={<ExpensesPage />}
                                />
                                <Route
                                    path="/income"
                                    element={<IncomePage />}
                                />
                                <Route
                                    path="/summary"
                                    element={<SummaryPage />}
                                />
                                <Route path="/bills" element={<FlatBills />} />
                                <Route
                                    path="/import-export"
                                    element={<ImportExportPage />}
                                />
                                <Route
                                    path="/settings"
                                    element={<Settings />}
                                />
                                {/* Możesz również dodać stronę domyślną, np. */}
                                <Route path="/" element={<HomePage />} />
                            </Routes>
                        </Container>
                    </>
                ))
            )}
        </>
    );
};

export default App;
