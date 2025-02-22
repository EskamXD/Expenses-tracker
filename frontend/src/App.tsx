import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalProvider } from "@/context/GlobalContext";
import Layout from "@/pages/layout";

import Home from "@/pages/home";
import Expenses from "@/pages/expenses";
import Income from "@/pages/income";
import Summary from "@/pages/summary";
import Charts from "@/pages/charts";
import Bills from "@/pages/billls";
import Balance from "@/pages/balance";
import Investments from "@/pages/investments";
import ImportExport from "@/pages/import-export";
import Settings from "@/pages/settings";
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
                                    element={<Expenses />}
                                />
                                <Route path="/income" element={<Income />} />
                                <Route path="/summary" element={<Summary />} />
                                <Route path="/charts" element={<Charts />} />
                                <Route path="/bills" element={<Bills />} />
                                {/* <Route path="/balance" element={<Balance />} /> */}
                                <Route
                                    path="/investments"
                                    element={<Investments />}
                                />
                                <Route
                                    path="/import-export"
                                    element={<ImportExport />}
                                />
                                <Route
                                    path="/settings"
                                    element={<Settings />}
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

