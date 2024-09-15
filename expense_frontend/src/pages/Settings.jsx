import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import ModalPerson from "../components/ModalPerson";
import fetchPostPerson from "../api/fetchPostPerson";

const Settings = () => {
    const [personList, setPersonList] = useState([]);
    const [name, setName] = useState("");
    const [payer, setPayer] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [reload, setReload] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/person/"
                );
                setPersonList(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setReload(false);
            }
        };
        fetch();
    }, [reload]);

    useEffect(() => {
        setReload(true);
    }, []);

    // Obsługuje zdarzenie przesłania formularza
    const handleSubmit = async (e) => {
        fetchPostPerson(
            e,
            name,
            setName,
            payer,
            setPayer,
            500,
            setShowModal,
            setReload
        );
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

