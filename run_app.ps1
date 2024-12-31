# Skrypt uruchamiający aplikację backendową (Django) i frontendową (PNPM) w różnych folderach

# Ścieżki do folderów
$backendFolder = "backend"
$frontendFolder = "frontend"

# Sekcja backendowa (Django)

# 0. Sprawdzenie, czy istnieje folder .venv. Jeśli nie, utworzenie wirtualnego środowiska w folderze backendowym
$venvFolderPath = "$backendFolder\.venv"
$venvPath = "$venvFolderPath\Scripts\Activate.ps1"

if (-Not (Test-Path $venvFolderPath)) {
    Write-Host "Folder .venv nie istnieje. Tworzenie wirtualnego środowiska w folderze backendowym..."
    Set-Location $backendFolder
    python -m venv .venv
    Set-Location ..

    if (Test-Path $venvFolderPath) {
        Write-Host "Wirtualne środowisko zostało utworzone."
    } else {
        Write-Host "Nie udało się utworzyć wirtualnego środowiska. Skrypt zostaje przerwany."
        exit
    }
}

# 1. Sprawdzenie, czy wirtualne środowisko jest aktywne
Set-Location $backendFolder
$pipVersion = & pip -V

if ($pipVersion -like "*$venvFolderPath*") {
    Write-Host "Wirtualne środowisko jest aktywne."
} else {
    Write-Host "Wirtualne środowisko nie jest aktywne. Aktywowanie..."
    if (Test-Path $venvPath) {
        & $venvPath
        Write-Host "Wirtualne środowisko zostało aktywowane."
    } else {
        Write-Host "Nie znaleziono pliku Activate.ps1. Upewnij się, że ścieżka do wirtualnego środowiska jest poprawna.: $venvPath"
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
Start-Job { & python manage.py runserver }
Write-Host "Serwer Django uruchomiony."
Set-Location ..

# Sekcja frontendowa (pnpm)

# 5. Sprawdzenie, czy pnpm jest zainstalowany
if (-Not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "PNPM nie jest zainstalowany. Zainstaluj PNPM przed uruchomieniem aplikacji frontendowej."
    exit
}

# 6. Przejście do folderu frontendowego i uruchomienie aplikacji frontendowej
Set-Location $frontendFolder
Write-Host "Uruchamianie aplikacji frontendowej..."
Start-Job { pnpm run dev }
Set-Location ..

# 7. Uruchomienie przeglądarki z aplikacją
Start-Sleep -Seconds 5  # Czekanie na uruchomienie serwera
Start-Process "http://127.0.0.1:5173/"
Write-Host "Aplikacja frontendowa uruchomiona pod adresem http://127.0.0.1:5173/"
