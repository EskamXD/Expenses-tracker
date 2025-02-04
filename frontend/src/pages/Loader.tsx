import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ModalPerson from "../components/ModalPerson";
import { fetchPostPerson } from "../api/apiService";
import { Person } from "../types";
import "../assets/styles/main.css";
import { useGlobalContext } from "../context/GlobalContext";

const Loader: React.FC = () => {
    const [showModal, setShowModal] = useState(true);
    const { setPersons } = useGlobalContext();

    // Obsługuje przesyłanie formularza z `ModalPerson`
    const handleSubmit = async (data: { name: string; payer: boolean }) => {
        const user: Person = {
            name: data.name,
            payer: data.payer,
            owner: true,
        };

        try {
            const response = await fetchPostPerson(user);
            setPersons(response);
            setShowModal(false);
        } catch (error) {
            console.error("Błąd podczas dodawania osoby:", error);
        }
    };

    return (
        <div className="center-div">
            <Skeleton className="w-16 h-16 rounded-full" />
            <ModalPerson
                showModal={showModal}
                setShowModal={setShowModal}
                name=""
                setName={() => {}}
                payer={false}
                setPayer={() => {}}
                handleSubmit={handleSubmit} // 🔹 Teraz pasuje do `ModalPerson`
                canCloseModal={false}
            />
        </div>
    );
};

export default Loader;

