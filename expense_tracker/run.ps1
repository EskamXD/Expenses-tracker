# 0. Sprawdzenie, czy istnieje folder .venv. Jeśli nie, utworzenie wirtualnego środowiska.
$venvFolderPath = ".\.venv"
$venvPath = "$venvFolderPath\Scripts\Activate.ps1"

if (-Not (Test-Path $venvFolderPath)) {
    Write-Host "Folder .venv nie istnieje. Tworzenie wirtualnego środowiska..."
    python -m venv .venv

    if (Test-Path $venvFolderPath) {
        Write-Host "Wirtualne środowisko zostało utworzone."
    } else {
        Write-Host "Nie udało się utworzyć wirtualnego środowiska. Skrypt zostaje przerwany."
        exit
    }
}

# 1. Sprawdzenie, czy wirtualne środowisko jest aktywne
$pipVersion = & pip -V

if ($pipVersion -like "*$venvFolderPath*") {
    Write-Host "Wirtualne środowisko jest aktywne."
} else {
    Write-Host "Wirtualne środowisko nie jest aktywne. Aktywowanie..."
    if (Test-Path $venvPath) {
        & $venvPath
        Write-Host "Wirtualne środowisko zostało aktywowane."
    } else {
        Write-Host "Nie znaleziono pliku Activate.ps1. Upewnij się, że ścieżka do wirtualnego środowiska jest poprawna."
        exit
    }
}

# 2. Zainstalowanie wymaganych pakietów
Write-Host "Instalowanie wymaganych pakietów..."
& pip install -r requirements.txt

# 3. Uruchomienie migracji Django
Write-Host "Uruchamianie migracji Django..."
& python manage.py makemigrations
& python manage.py migrate

# 4. Uruchomienie serwera Django
Write-Host "Uruchamianie serwera Django..."
& python manage.py runserver

# 5. Uruchomienie przeglądarki z aplikacją
Start-Process "http://127.0.0.1:8000/"
Write-Host "Aplikacja uruchomiona."
