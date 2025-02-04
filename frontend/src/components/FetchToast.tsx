import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function FetchToast() {
    const { toast } = useToast();

    const showToast = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");

        toast({
            title: "ShadCN Toast",
            description: `Hello, world! This is a toast message. • ${hours}:${minutes}`,
        });
    };

    return (
        <Button variant="outline" onClick={showToast}>
            Pokaż powiadomienie
        </Button>
    );
}

export default FetchToast;

