import { useEffect, useState } from "react";
// import { Button } from "react-bootstrap";
import { Button } from "@/components/ui/button";
import ModalPerson from "../components/ModalPerson";
import { Person } from "../types";
import {
    fetchGetPerson,
    fetchPostPerson,
    fetchPutPerson,
} from "../api/apiService";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import "../assets/styles/main.css";

import { useGlobalContext } from "../context/GlobalContext";

const Settings = () => {
    const { persons, setPersons } = useGlobalContext();
    const [personID, setPersonID] = useState(0);
    const [name, setName] = useState("");
    const [payer, setPayer] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMethod, setModalMethod] = useState("post");

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (modalMethod === "post") {
            const person = {
                name: name,
                payer: payer,
            } as Person;
            await fetchPostPerson(person);
        } else {
            const person = {
                id: personID,
                name: name,
                payer: payer,
            } as Person;
            await fetchPutPerson(person);
        }

        setShowModal(false);
        setName("");
        setPayer(false);

        // Pobierz nowe dane tylko jeśli coś się zmieniło
        fetchGetPerson().then((response) => {
            if (JSON.stringify(response) !== JSON.stringify(persons)) {
                setPersons(response);
            }
        });
    };

    const showModalToPost = () => {
        setName("");
        setPayer(false);
        setModalMethod("post");
        setShowModal(true);
    };

    const showModalToPut = (ID: number) => {
        console.log(ID);

        fetchGetPerson(ID).then((response) => {
            console.log(response);
            setPersonID(response.id);
            setName(response.name);
            setPayer(response.payer);
        });
        setModalMethod("put");
        setShowModal(true);
    };

    return (
        <>
            <div className="mb-3">
                <h1>Ustawienia</h1>
                <h2>Lista osób zarejstrowanych do użytku</h2>
            </div>
            {persons.map((person) => (
                <div key={person.id}>
                    <div className="d-flex space-between align-end">
                        <h5>{person.name}</h5>
                        <Button
                            variant="light"
                            onClick={() => showModalToPut(Number(person.id))}>
                            <EditRoundedIcon />
                        </Button>
                    </div>
                    <hr key={`hr-${person.id}`}></hr>
                </div>
            ))}

            <Button variant="primary" type="button" onClick={showModalToPost}>
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

