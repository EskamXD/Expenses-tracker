import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalProvider } from "@/context/GlobalContext";
import Layout from "@/pages/layout";

// Komponent Home jest importowany statycznie
import Home from "@/pages/home";

// Pozostałe strony ładujemy dynamicznie
const Expenses = lazy(() => import("@/pages/expenses"));
const Income = lazy(() => import("@/pages/income"));
const Summary = lazy(() => import("@/pages/summary"));
const Charts = lazy(() => import("@/pages/charts"));
const Bills = lazy(() => import("@/pages/billls"));
const Investments = lazy(() => import("@/pages/investments"));
const ImportExport = lazy(() => import("@/pages/import-export"));
const Settings = lazy(() => import("@/pages/settings"));

function App() {
    const queryClient = new QueryClient();

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <QueryClientProvider client={queryClient}>
                <GlobalProvider>
                    <BrowserRouter>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route
                                    path="/expenses"
                                    element={
                                        <Suspense
                                            fallback={<div>Ładowanie...</div>}>
                                            <Expenses />
                                        </Suspense>
                                    }
                                />
                                <Route
                                    path="/income"
                                    element={
                                        <Suspense
                                            fallback={<div>Ładowanie...</div>}>
                                            <Income />
                                        </Suspense>
                                    }
                                />
                                <Route
                                    path="/summary"
                                    element={
                                        <Suspense
                                            fallback={<div>Ładowanie...</div>}>
                                            <Summary />
                                        </Suspense>
                                    }
                                />
                                <Route
                                    path="/charts"
                                    element={
                                        <Suspense
                                            fallback={<div>Ładowanie...</div>}>
                                            <Charts />
                                        </Suspense>
                                    }
                                />
                                <Route
                                    path="/bills"
                                    element={
                                        <Suspense
                                            fallback={<div>Ładowanie...</div>}>
                                            <Bills />
                                        </Suspense>
                                    }
                                />
                                <Route
                                    path="/investments"
                                    element={
                                        <Suspense
                                            fallback={<div>Ładowanie...</div>}>
                                            <Investments />
                                        </Suspense>
                                    }
                                />
                                <Route
                                    path="/import-export"
                                    element={
                                        <Suspense
                                            fallback={<div>Ładowanie...</div>}>
                                            <ImportExport />
                                        </Suspense>
                                    }
                                />
                                <Route
                                    path="/settings"
                                    element={
                                        <Suspense
                                            fallback={<div>Ładowanie...</div>}>
                                            <Settings />
                                        </Suspense>
                                    }
                                />
                            </Routes>
                        </Layout>
                    </BrowserRouter>
                </GlobalProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}

export default App;

