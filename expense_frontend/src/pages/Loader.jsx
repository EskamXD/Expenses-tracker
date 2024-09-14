import React, { useState } from "react";
import axios from "axios";
import ModalPerson from "../components/ModalPerson";

const Loader = () => {
    const [name, setName] = useState("");

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
        <ModalPerson
            showModal={true}
            setShowModal={true}
            name={name}
            setName={setName}
            handleSubmit={handleSubmit}
            canCloseModal={false}
        />
    );
};

export default Loader;
