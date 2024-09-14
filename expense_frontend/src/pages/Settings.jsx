import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import ModalPerson from "../components/ModalPerson";

const Settings = () => {
    const [personList, setPersonList] = useState([]);
    const [name, setName] = useState("");
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/person/"
                );
                setPersonList(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetch();
    }, []);

    // Obsługuje zdarzenie przesłania formularza
    const handleSubmit = async (e) => {
        // e.preventDefault(); // Zapobiega domyślnemu działaniu formularza (przeładowanie strony)

        try {
            const response = await axios.post(
                "http://localhost:8000/api/person/",
                {
                    name: name,
                }
            );
            // Opcjonalnie, możesz wyczyścić formularz lub zamknąć modal
            setName(""); // Wyczyść stan po udanym dodaniu
        } catch (error) {
            console.error(error);
            alert("Wystąpił błąd podczas dodawania osoby.");
        }
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
                handleSubmit={handleSubmit}
                canCloseModal={true}
            />
        </>
    );
};

export default Settings;
