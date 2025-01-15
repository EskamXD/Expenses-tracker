import React, { useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import ModalPerson from "../components/ModalPerson";
import { fetchPostPerson } from "../api/apiService";
import { Person } from "../types";
import "../assets/styles/main.css";
import { useGlobalContext } from "../context/GlobalContext";

const Loader: React.FC = () => {
    const [showModal, setShowModal] = useState(true);
    const [name, setName] = useState("");
    const [payer, setPayer] = useState(false);
    const { setPersons } = useGlobalContext();

    // Obsługuje zdarzenie przesłania formularza
    const handleSubmit = async (e: any) => {
        e.preventDefault;

        const user = {
            name: name,
            payer: payer,
            owner: true,
        } as Person;

        fetchPostPerson(user).then((reponse) => {
            setPersons(reponse);
            setShowModal(false);
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
