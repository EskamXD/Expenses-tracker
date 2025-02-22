#!/bin/bash

# 0. Sprawdzenie, czy istnieje folder .venv. Jeśli nie, utworzenie wirtualnego środowiska.
venvFolderPath="./.venv"
venvPath="$venvFolderPath/bin/activate"

if [ ! -d "$venvFolderPath" ]; then
    echo "Folder .venv nie istnieje. Tworzenie wirtualnego środowiska..."
    python3 -m venv .venv

    if [ -d "$venvFolderPath" ]; then
        echo "Wirtualne środowisko zostało utworzone."
    else
        echo "Nie udało się utworzyć wirtualnego środowiska. Skrypt zostaje przerwany."
        exit 1
    fi
fi

# 1. Sprawdzenie, czy wirtualne środowisko jest aktywne
pipVersion=$(pip -V)

if [[ $pipVersion == *"$venvFolderPath"* ]]; then
    echo "Wirtualne środowisko jest aktywne."
else
    echo "Wirtualne środowisko nie jest aktywne. Aktywowanie..."
    if [ -f "$venvPath" ]; then
        source $venvPath
        echo "Wirtualne środowisko zostało aktywowane."
    else
        echo "Nie znaleziono pliku activate. Upewnij się, że ścieżka do wirtualnego środowiska jest poprawna."
        exit 1
    fi
fi

# 2. Zainstalowanie wymaganych pakietów
echo "Instalowanie wymaganych pakietów..."
pip install -r requirements.txt

# 3. Uruchomienie migracji Django
echo "Uruchamianie migracji Django..."
python manage.py makemigrations
python manage.py migrate

# 4. Uruchomienie serwera Django
echo "Uruchamianie serwera Django..."
python manage.py runserver

# 5. Uruchomienie przeglądarki z aplikacją
sleep 2  # Poczekaj chwilę, aby serwer mógł się uruchomić
# open "http://127.0.0.1:8000/"
echo "Aplikacja uruchomiona."
