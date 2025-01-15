import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { GlobalProvider } from "./context/GlobalContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <GlobalProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </GlobalProvider>
    // </React.StrictMode>
);
