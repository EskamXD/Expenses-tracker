import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertTriangle } from "lucide-react"; // Ikony zamiast MUI

interface ToasterProps {
    type: "success" | "danger";
    header: string;
    message: string;
}

const Toaster: React.FC<ToasterProps> = ({ type, header, message }) => {
    const { toast } = useToast();

    useEffect(() => {
        if (header && message) {
            toast({
                title: header,
                description: (
                    <div className="flex items-center gap-2">
                        {type === "danger" ? (
                            <AlertTriangle className="text-red-500 w-5 h-5" />
                        ) : (
                            <CheckCircle className="text-green-500 w-5 h-5" />
                        )}
                        <span>{message}</span>
                    </div>
                ),
                variant: type === "danger" ? "destructive" : "default",
            });
        }
    }, [type, header, message, toast]);

    return null; // Toaster nie renderuje niczego, bo toasty są obsługiwane przez `useToast`
};

export default Toaster;

