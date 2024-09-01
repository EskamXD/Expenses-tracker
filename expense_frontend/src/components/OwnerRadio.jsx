// src/components/OwnerRadio.jsx
import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import "../assets/styles/main.css";

export const OwnerRadio = ({ item = {}, items, setItems }) => {
    // Jeśli `item` nie ma pola owner, użyj lokalnego stanu
    const [localOwner, setLocalOwner] = useState(item.owner || "kamil");
    const id = item.id ? item.id : 0;
    const owner = item.owner || localOwner;

    const handleOwnerChange = (newOwner) => {
        console.log("handleOwnerChange", newOwner);
        if (items && setItems) {
            // Jeśli `items` i `setItems` są dostępne, zaktualizuj stan w rodzicu
            setItems(
                items.map((el) =>
                    el.id === id ? { ...el, owner: newOwner } : el
                )
            );
        } else {
            // W przeciwnym razie używaj lokalnego stanu
            setLocalOwner(newOwner);
        }
    };

    return (
        <div key="inline-radio-owner">
            <Form.Label className="mr-1rem">Czyje:</Form.Label>
            <Form.Check
                inline
                label="Kamil"
                name={`owner-group-${id}`}
                type="radio"
                value="kamil"
                checked={owner === "kamil"}
                onChange={() => handleOwnerChange("kamil")}
            />
            <Form.Check
                inline
                label="Ania"
                name={`owner-group-${id}`}
                type="radio"
                value="ania"
                checked={owner === "ania"}
                onChange={() => handleOwnerChange("ania")}
            />
            <Form.Check
                inline
                label="Wspólne"
                name={`owner-group-${id}`}
                type="radio"
                value="common"
                checked={owner === "common"}
                onChange={() => handleOwnerChange("common")}
            />
        </div>
    );
};

export default OwnerRadio;
