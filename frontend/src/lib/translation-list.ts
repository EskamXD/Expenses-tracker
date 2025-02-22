// translation-list.ts

interface Translations {
    [language: string]: {
        [key: string]: string;
    };
}

const translationList: Translations = {
    en: {
        dashboard: "Dashboard",
        buildingYourApplication: "Building Your Application",
        dataFetching: "Data Fetching",
        toggleMode: "Toggle Mode",
        // Dodaj kolejne wyrażenia tutaj
    },
    pl: {
        dashboard: "Pulpit",
        buildingYourApplication: "Budowanie Twojej Aplikacji",
        dataFetching: "Pobieranie Danych",
        toggleMode: "Przełącz tryb",
        // Dodaj kolejne wyrażenia tutaj
    },
};

export default translationList;

