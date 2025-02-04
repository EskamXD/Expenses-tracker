import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface ModalPersonProps {
    showModal: boolean;
    setShowModal: (open: boolean) => void; // 🔹 Poprawiony typ
    name: string;
    setName: (name: string) => void; // 🔹 Poprawiony typ
    payer: boolean;
    setPayer: (payer: boolean) => void; // 🔹 Poprawiony typ
    handleSubmit: (data: { name: string; payer: boolean }) => void;
    canCloseModal: boolean;
}

const ModalPerson: React.FC<ModalPersonProps> = ({
    showModal,
    setShowModal,
    name,
    setName,
    payer,
    setPayer,
    handleSubmit,
    canCloseModal,
}) => {
    const form = useForm({
        defaultValues: {
            name: name,
            payer: payer,
        },
    });

    const onSubmit = (data: { name: string; payer: boolean }) => {
        handleSubmit(data);
        setShowModal(false);
    };

    return (
        <Dialog
            open={showModal}
            onOpenChange={canCloseModal ? setShowModal : undefined}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Dodaj osobę</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4">
                        {/* Imię */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Imię</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Wpisz imię"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                setName(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Checkbox Płatnika */}
                        <FormField
                            control={form.control}
                            name="payer"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked);
                                                setPayer(!!checked);
                                            }}
                                        />
                                    </FormControl>
                                    <FormLabel>
                                        Zaznacz, jeśli chcesz dodać osobę jako
                                        płatnika do wspólnych rachunków
                                    </FormLabel>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">Dodaj</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default ModalPerson;

