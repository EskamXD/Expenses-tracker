import React, { useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import ModalPerson from "../components/ModalPerson";
import { fetchPostPerson } from "../services/apiService";
import { Person } from "../types";
import "../assets/styles/main.css";

interface LoaderProps {
    setReload: Function;
}

const Loader: React.FC<LoaderProps> = ({ setReload }) => {
    const [showModal, setShowModal] = useState(true);
    const [name, setName] = useState("");
    const [payer, setPayer] = useState(false);

    // Obsługuje zdarzenie przesłania formularza
    const handleSubmit = async (e: any) => {
        e.preventDefault;

        const person = {
            name: name,
            payer: payer,
        } as Person;

        fetchPostPerson(person).finally(() => {
            setReload(true);
        });
    };

    return (
        <div className="center-div">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
            <ModalPerson
                showModal={showModal}
                setShowModal={setShowModal}
                name={name}
                setName={setName}
                payer={payer}
                setPayer={setPayer}
                handleSubmit={handleSubmit}
                canCloseModal={false}
            />
        </div>
    );
};

export default Loader;
