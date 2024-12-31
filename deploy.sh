#!/bin/bash

# Załaduj zmienne z pliku .env
if [ -f "/root/.env" ]; then
    export $(grep -v '^#' /root/.env | xargs)
else
    echo "Błąd: Plik .env nie został znaleziony!"
    exit 1
fi

# Pobieranie repozytorium
echo ">>> Pobieram repozytorium z Gita..."
if [ ! -d "$CLONE_DIR" ]; then
    git clone --branch $BRANCH $REPO_URL $CLONE_DIR || { echo "Błąd: Nie można sklonować repozytorium"; exit 1; }
else
    cd $CLONE_DIR
    git fetch origin $BRANCH
    git reset --hard origin/$BRANCH || { echo "Błąd: Nie można pobrać zmian z repozytorium"; exit 1; }
fi

# Budowanie frontend
echo ">>> Buduję frontend..."
cd $FRONTEND_DIR
npm install || { echo "Błąd: Nie można zainstalować zależności frontendu"; exit 1; }
npm run build || { echo "Błąd: Nie można zbudować frontendu"; exit 1; }

# Sprawdzanie backendu
echo ">>> Sprawdzam backend..."
cd $BACKEND_DIR
source .venv/bin/activate || { echo "Błąd: Nie można aktywować wirtualnego środowiska"; exit 1; }
pip install -r requirements.txt || { echo "Błąd: Nie można zainstalować zależności backendu"; exit 1; }
python manage.py check || { echo "Błąd: Występują problemy w backendzie"; exit 1; }
deactivate

# Restart Nginx i Gunicorn
echo ">>> Restartuję Nginx i Gunicorn..."
systemctl restart nginx || { echo "Błąd: Nie można zrestartować Nginx'a"; exit 1; }
systemctl restart gunicorn || { echo "Błąd: Nie można zrestartować Gunicorn'a"; exit 1; }

# Sprawdzanie połączeń
echo ">>> Sprawdzam dostępność endpointów..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/)
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)

if [ "$API_RESPONSE" == "200" ]; then
    echo ">>> API działa poprawnie (kod 200)."
else
    echo ">>> Błąd: API zwróciło kod $API_RESPONSE."
    exit 1
fi

if [ "$FRONTEND_RESPONSE" == "200" ]; then
    echo ">>> Frontend działa poprawnie (kod 200)."
else
    echo ">>> Błąd: Frontend zwrócił kod $FRONTEND_RESPONSE."
    exit 1
fi

echo ">>> Deploy zakończony pomyślnie!"
