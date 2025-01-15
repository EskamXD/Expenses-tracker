import { Button, Form, Modal } from "react-bootstrap";
import { FormEventHandler } from "react";

interface ModalPersonProps {
    showModal: boolean;
    setShowModal: Function;
    name: string;
    setName: Function;
    payer: boolean;
    setPayer: Function;
    handleSubmit: FormEventHandler<HTMLFormElement>;
    canCloseModal: boolean;
}

const ModalPerson: React.FC<ModalPersonProps> = ({
    showModal,
    setShowModal,
    name,
    setName,
    payer,
    setPayer,
    handleSubmit,
    canCloseModal,
}) => {
    const handleChange = (e: any) => {
        setPayer(e.target.checked);
    };
    return (
        <Modal show={showModal} centered>
            <Modal.Header
                closeButton={canCloseModal}
                onClick={() => setShowModal(false)}>
                <Modal.Title>Dodaj osobę</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicName">
                        <Form.Label>Imię</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Wpisz imię"
                            value={name} // Dodaj wartość stanu jako wartość kontrolowaną
                            onChange={(e) => setName(e.target.value)} // Aktualizuj stan na podstawie zmian w polu
                            className="mb-3"
                        />
                        <Form.Check>
                            <Form.Check.Input
                                type="checkbox"
                                onChange={(e) => handleChange(e)}
                                checked={payer} // Dodaj wartość stanu jako wartość kontrolowaną
                            />
                            <Form.Check.Label>
                                Zaznacz, jeśli chcesz dodać osobę jako płatnika
                                do wspólnych rachunków
                            </Form.Check.Label>
                        </Form.Check>
                    </Form.Group>
                    <Button variant="success" type="submit">
                        Dodaj
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ModalPerson;

