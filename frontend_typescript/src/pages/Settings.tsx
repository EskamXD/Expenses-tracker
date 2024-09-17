import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import ModalPerson from "../components/ModalPerson";
import { Person } from "../types";
import { fetchGetPerson, fetchPostPerson } from "../services/apiService";

const Settings = () => {
    const [personList, setPersonList] = useState<Person[]>([]);
    const [name, setName] = useState("");
    const [payer, setPayer] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [reload, setReload] = useState(false);

    useEffect(() => {
        fetchGetPerson()
            .then((response) => {
                setPersonList(response.data);
            })
            .finally(() => {
                setReload(false);
            });
    }, [reload]);

    useEffect(() => {
        setReload(true);
    }, []);

    // Obsługuje zdarzenie przesłania formularza
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const content = e.target;

        const person = {
            name: content.name,
            payer: content.payer,
        } as Person;
        fetchPostPerson(person);
    };

    return (
        <>
            <div className="mb-3">
                <h1>Ustawienia</h1>
                <h2>Lista osób zarejstrowanych do użytku</h2>
            </div>
            {personList.map((person) => (
                <div key={person.id}>
                    <p>{person.name}</p>
                    <hr></hr>
                </div>
            ))}

            <Button
                variant="primary"
                type="button"
                onClick={() => setShowModal(true)}>
                Dodaj osobę
            </Button>

            <ModalPerson
                showModal={showModal}
                setShowModal={setShowModal}
                name={name}
                setName={setName}
                payer={payer}
                setPayer={setPayer}
                handleSubmit={handleSubmit}
                canCloseModal={true}
            />
        </>
    );
};

export default Settings;
