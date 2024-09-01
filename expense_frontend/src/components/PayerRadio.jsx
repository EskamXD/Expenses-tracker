// src/components/PayerRadio.jsx
import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import "../assets/styles/main.css";

export const PayerRadio = ({ payer, setPayer }) => {
    // Jeśli `payer` nie jest przekazany jako props, używaj lokalnego stanu
    const [localPayer, setLocalPayer] = useState(payer || "kamil");
    const payerHandler = payer || localPayer;

    const handlePayerChange = (newPayer) => {
        console.log("handlePayerChange", newPayer);
        if (setPayer) {
            // Jeśli `setPayer` jest dostępny, zaktualizuj stan w rodzicu
            setPayer(newPayer);
        } else {
            // W przeciwnym razie używaj lokalnego stanu
            setLocalPayer(newPayer);
        }
    };

    return (
        <div key="inline-radio-payer" className="mb-3">
            <Form.Label className="mr-1rem">Płacący:</Form.Label>
            <Form.Check
                inline
                label="Kamil"
                name="payer-group"
                type="radio"
                value="kamil"
                checked={payerHandler === "kamil"}
                onChange={() => handlePayerChange("kamil")}
            />
            <Form.Check
                inline
                label="Ania"
                name="payer-group"
                type="radio"
                value="ania"
                checked={payerHandler === "ania"}
                onChange={() => handlePayerChange("ania")}
            />
        </div>
    );
};

export default PayerRadio;
