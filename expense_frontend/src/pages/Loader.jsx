import React, { useState } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import ModalPerson from "../components/ModalPerson";
import fetchPostPerson from "../api/fetchPostPerson";
import "../assets/styles/main.css";

const Loader = (setReload) => {
    const [showModal, setShowModal] = useState(true);
    const [name, setName] = useState("");
    const [payer, setPayer] = useState(false);

    // Obsługuje zdarzenie przesłania formularza
    const handleSubmit = async (e) => {
        fetchPostPerson(
            e,
            name,
            setName,
            payer,
            setPayer,
            2000,
            setShowModal,
            setReload
        );
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

