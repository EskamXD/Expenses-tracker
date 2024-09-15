import axios from "axios";

const fetchPostPerson = async (
    e,
    name,
    setName,
    payer,
    setPayer,
    timeoutTime,
    setShowModal,
    setReload
) => {
    e.preventDefault(); // Zapobiega domyślnemu działaniu formularza (przeładowanie strony)
    setShowModal(false);

    try {
        const response = await axios.post("http://localhost:8000/api/person/", {
            name: name,
            payer: payer,
        });
        // Opcjonalnie, możesz wyczyścić formularz lub zamknąć modal
        setName(""); // Wyczyść stan po udanym dodaniu
        setPayer(false);
        console.log(response);
        setTimeout(() => {}, timeoutTime);
        // Redirect to homepage
    } catch (error) {
        console.error(error);
        // alert("Wystąpił błąd podczas dodawania osoby.");
    } finally {
        setReload(true);
    }
};

export default fetchPostPerson;

