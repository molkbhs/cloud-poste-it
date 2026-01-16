@echo off
REM Script de démarrage rapide pour l'application Post-it

echo.
echo ========================================
echo.    POST-IT APP - Démarrage Rapide
echo.
echo ========================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Erreur: Node.js n'est pas installé!
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js détecté
echo.

REM Installer les dépendances
echo 📦 Installation des dépendances...
echo.

if not exist "backend\node_modules" (
    echo Installation du backend...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installation du frontend...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ========================================
echo.    Démarrage de l'application
echo.
echo ========================================
echo.
echo 📝 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:3000
echo.

REM Créer deux terminaux pour démarrer le backend et frontend
echo Démarrage du backend...
start cmd /k "cd backend && npm start"

timeout /t 3 /nobreak

echo Démarrage du frontend...
start cmd /k "cd frontend && npm start"

echo.
echo ✅ Application lancée!
echo L'application frontend s'ouvrira automatiquement sur http://localhost:3000
echo.
pause
