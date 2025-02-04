import { Link } from "react-router-dom";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Home,
    Wallet,
    TrendingUp,
    ClipboardList,
    Receipt,
    FileText,
    Settings,
} from "lucide-react"; // Ikony

const SiteSidebar = () => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="fixed top-4 left-4 z-50">
                    ☰ Menu
                </Button>
            </SheetTrigger>

            <SheetContent
                side="left"
                className="w-64 bg-gray-900 text-white flex flex-col p-4">
                <h2 className="text-xl font-bold mb-4">Nawigacja</h2>

                <nav className="space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-700">
                        <Home className="w-5 h-5" /> Strona główna
                    </Link>
                    <Link
                        to="/expenses"
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-700">
                        <Wallet className="w-5 h-5" /> Wydatki
                    </Link>
                    <Link
                        to="/income"
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-700">
                        <TrendingUp className="w-5 h-5" /> Przychody
                    </Link>
                    <Link
                        to="/summary"
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-700">
                        <ClipboardList className="w-5 h-5" /> Podsumowanie
                    </Link>
                    <Link
                        to="/bills"
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-700">
                        <Receipt className="w-5 h-5" /> Rachunki
                    </Link>
                    <Link
                        to="/import-export"
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-700">
                        <FileText className="w-5 h-5" /> Import/Export
                    </Link>
                    <Link
                        to="/settings"
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-700">
                        <Settings className="w-5 h-5" /> Ustawienia
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>
    );
};

export default SiteSidebar;

