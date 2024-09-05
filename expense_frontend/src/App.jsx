import React from "react";
import { Routes, Route } from "react-router-dom";
import ExpensesPage from "./pages/ExpensesPage";
import HomePage from "./pages/HomePage";
import IncomePage from "./pages/IncomePage";
import SummaryPage from "./pages/SummaryPage";

import SiteNavbar from "./components/SiteNavbar";
import Container from "react-bootstrap/Container";

import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
    return (
        <>
            <SiteNavbar />

            <Container data-bs-theme="dark">
                <Routes>
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/income" element={<IncomePage />} />
                    <Route path="/summary" element={<SummaryPage />} />
                    {/* Możesz również dodać stronę domyślną, np. */}
                    <Route path="/" element={<HomePage />} />
                </Routes>
            </Container>
        </>
    );
};

export default App;

