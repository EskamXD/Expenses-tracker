import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChartCandlestick, TrendingDown, TrendingUp } from "lucide-react";

interface FormOperationProps {
    setFormType: (newFormType: string) => void;
}

const FormOperation: React.FC<FormOperationProps> = ({ setFormType }) => {
    return (
        <div className="flex flex-wrap gap-4">
            <Card
                onClick={() => setFormType("expense")}
                className="transition duration-150 ease-in-out w-40 hover:bg-secondary">
                {" "}
                <CardContent className="flex items-center justify-center pt-6">
                    <TrendingUp className="w-16 h-16 p-2" />
                </CardContent>
                <CardFooter className="text-justify">Wydatki</CardFooter>
            </Card>
            <Card
                onClick={() => setFormType("income")}
                className="transition duration-150 ease-in-out w-40 hover:bg-secondary">
                <CardContent className="flex items-center justify-center pt-6">
                    <TrendingDown className="w-16 h-16 p-2" />
                </CardContent>
                <CardFooter className="text-justify">Przychody</CardFooter>
            </Card>
            <Card
                onClick={() => setFormType("investment")}
                className="transition duration-150 ease-in-out w-40 hover:bg-secondary">
                <CardContent className="flex items-center justify-center pt-6">
                    <ChartCandlestick className="w-16 h-16 p-2" />
                </CardContent>
                <CardFooter className="text-justify">Inwestycje</CardFooter>
            </Card>
        </div>
    );
};

export default FormOperation;

