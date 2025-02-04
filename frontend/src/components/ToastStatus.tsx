import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastAction } from "@/components/ui/toast";

interface ToastStatusProps {
    show: boolean;
    setShow: (show: boolean) => void;
    type: "default" | "destructive"; // Typy dostępne w shadcn/ui
    headerStrong: string;
    body: string;
    icon?: JSX.Element;
}

const ToastStatus: React.FC<ToastStatusProps> = ({
    show,
    setShow,
    type,
    headerStrong,
    body,
    icon,
}) => {
    const { toast } = useToast();

    useEffect(() => {
        if (show) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");

            toast({
                title: headerStrong,
                description: `${body} • ${hours}:${minutes}`,
                variant: type, // "default" lub "destructive"
                action: (
                    <ToastAction
                        altText="Zamknij"
                        onClick={() => setShow(false)}>
                        Zamknij
                    </ToastAction>
                ),
            });

            // Ukryj toast po 5 sekundach
            setTimeout(() => setShow(false), 5000);
        }
    }, [show, toast, setShow, type, headerStrong, body]);

    return null; // Nie renderujemy bezpośrednio, bo toasty są obsługiwane przez hook
};

export default ToastStatus;

