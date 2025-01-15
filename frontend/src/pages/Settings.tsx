import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import ModalPerson from "../components/ModalPerson";
import { Person } from "../types";
import {
    fetchGetPerson,
    fetchPostPerson,
    fetchPutPerson,
} from "../api/apiService";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import "../assets/styles/main.css";

const Settings = () => {
    const [personList, setPersonList] = useState<Person[]>([]);
    const [personID, setPersonID] = useState(0);
    const [name, setName] = useState("");
    const [payer, setPayer] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [reload, setReload] = useState(false);
    const [modalMethod, setModalMethod] = useState("post");

    useEffect(() => {
        fetchGetPerson()
            .then((response) => {
                setPersonList(response);
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
        setReload(true);
    };

    const showModalToPost = () => {
        setName("");
        setPayer(false);
        setModalMethod("post");
        setShowModal(true);
    };

    const showModalToPut = (ID: number) => {
        // console.log(ID);
        fetchGetPerson(ID).then((response) => {
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
            {personList.map((person) => (
                <>
                    <div key={person.id} className="d-flex space-between">
                        <h5>{person.name}</h5>
                        <Button
                            variant="light"
                            onClick={() => showModalToPut(Number(person.id))}>
                            <EditRoundedIcon />
                        </Button>
                    </div>
                    <hr key={`hr-${person.id}`}></hr>
                </>
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
