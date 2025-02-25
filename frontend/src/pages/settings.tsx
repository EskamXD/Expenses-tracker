import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";

// Komponenty shadcn
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import {
    fetchGetPerson,
    fetchPostPerson,
    fetchPutPerson,
} from "@/api/apiService";
import { useGlobalContext } from "@/context/GlobalContext";
import { Person } from "@/types";

const Settings = () => {
    const { persons } = useGlobalContext();
    const queryClient = useQueryClient();

    // Jeden useState przechowujący dane dialogu oraz formularza
    const [dialogState, setDialogState] = useState<{
        open: boolean;
        method: "post" | "put";
        person: Person;
    }>({
        open: false,
        method: "post",
        person: { id: 0, name: "", payer: false, owner: true },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (dialogState.method === "post") {
            const newPerson = {
                id: 0,
                name: dialogState.person.name,
                payer: dialogState.person.payer,
                owner: true,
            };
            await fetchPostPerson(newPerson);
        } else {
            const updatedPerson = {
                id: dialogState.person.id,
                name: dialogState.person.name,
                payer: dialogState.person.payer,
                owner: true,
            };
            await fetchPutPerson(updatedPerson);
        }

        setDialogState((prev) => ({
            ...prev,
            open: false,
            person: { id: 0, name: "", payer: false, owner: true },
        }));

        queryClient.invalidateQueries({ queryKey: ["persons"] });
    };

    const showDialogToPost = () => {
        setDialogState({
            open: true,
            method: "post",
            person: { id: 0, name: "", payer: false, owner: true },
        });
    };

    const showDialogToPut = (ID: number) => {
        // Pobranie danych konkretnej osoby przed edycją
        fetchGetPerson(ID).then((response) => {
            setDialogState({
                open: true,
                method: "put",
                person: response,
            });
        });
    };

    // Funkcja pomocnicza do aktualizacji pól formularza
    const updatePersonField = (
        field: "name" | "payer",
        value: string | boolean
    ) => {
        setDialogState((prev) => ({
            ...prev,
            person: { ...prev.person, [field]: value },
        }));
    };

    return (
        <>
            <h1 className="text-2xl font-bold mt-4">Ustawienia</h1>
            <p className="text-muted-foreground">
                Lista osób zarejestrowanych do użytku
            </p>

            <div className="space-y-3">
                {persons.map((person) => (
                    <Card key={person.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">
                                {person.name}
                            </CardTitle>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    showDialogToPut(Number(person.id))
                                }>
                                <Pencil size={16} />
                            </Button>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Button onClick={showDialogToPost}>Dodaj osobę</Button>

            <PersonDialog
                open={dialogState.open}
                setOpen={(open) =>
                    setDialogState((prev) => ({ ...prev, open }))
                }
                person={dialogState.person}
                updatePersonField={updatePersonField}
                handleSubmit={handleSubmit}
            />
        </>
    );
};

export default Settings;

/**
 * Nowy komponent dialogowy oparty na shadcn UI.
 */
interface PersonDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    person: { id: number; name: string; payer: boolean };
    updatePersonField: (
        field: "name" | "payer",
        value: string | boolean
    ) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

function PersonDialog({
    open,
    setOpen,
    person,
    updatePersonField,
    handleSubmit,
}: PersonDialogProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {person.id ? "Edytuj osobę" : "Dodaj osobę"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="name" className="mb-1">
                            Nazwa
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={person.name}
                            onChange={(e) =>
                                updatePersonField("name", e.target.value)
                            }
                            className="border p-2 rounded"
                            required
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            id="payer"
                            type="checkbox"
                            checked={person.payer}
                            onChange={(e) =>
                                updatePersonField("payer", e.target.checked)
                            }
                            className="mr-2"
                        />
                        <label htmlFor="payer">Płatnik</label>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Zapisz</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
