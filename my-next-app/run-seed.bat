@echo off
echo ================================
echo Firebase Products Seeding Script
echo ================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: Please run this script from the my-next-app directory
    echo.
    echo Usage: 
    echo   cd my-next-app
    echo   .\run-seed.bat
    pause
    exit /b 1
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo Error: .env.local file not found!
    echo Please create .env.local with Firebase Admin credentials.
    echo See GET_FIREBASE_ADMIN_CREDENTIALS.md for instructions.
    pause
    exit /b 1
)

REM Check if dotenv is installed
echo Checking dependencies...
call npm list dotenv >nul 2>&1
if errorlevel 1 (
    echo Installing dotenv package...
    call npm install dotenv
    if errorlevel 1 (
        echo Failed to install dotenv
        pause
        exit /b 1
    )
)

echo.
echo Starting product seeding...
echo.

REM Run the seed script
call node scripts/seedProducts.js

echo.
echo ================================
echo Done!
echo ================================
pause
