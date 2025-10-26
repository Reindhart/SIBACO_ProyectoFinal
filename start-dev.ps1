# Script para iniciar el proyecto completo (Frontend + Backend)
# Uso: .\start-dev.ps1

Write-Host "🚀 Iniciando React + Flask Template..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Python está instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python no encontrado. Por favor, instala Python 3.10 o superior." -ForegroundColor Red
    exit 1
}

# Verificar si Node está instalado
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js no encontrado. Por favor, instala Node.js 18 o superior." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow

# Backend
Write-Host "  → Verificando backend..." -ForegroundColor Gray
if (-not (Test-Path "backend\venv")) {
    Write-Host "  → Creando entorno virtual..." -ForegroundColor Gray
    Set-Location backend
    python -m venv venv
    Set-Location ..
}

# Activar entorno virtual e instalar dependencias
Write-Host "  → Instalando dependencias del backend..." -ForegroundColor Gray
Set-Location backend
& ".\venv\Scripts\Activate.ps1"
pip install -r requirements-dev.txt -q
Set-Location ..

# Frontend
Write-Host "  → Verificando frontend..." -ForegroundColor Gray
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "  → Instalando dependencias del frontend..." -ForegroundColor Gray
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "🔥 Iniciando servidores..." -ForegroundColor Cyan

# Iniciar Backend en una nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; Write-Host '🐍 Backend Flask iniciado' -ForegroundColor Green; python wsgi.py"

# Esperar un momento para que el backend inicie
Start-Sleep -Seconds 2

# Iniciar Frontend en una nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host '⚛️  Frontend React iniciado' -ForegroundColor Blue; npm run dev"

Write-Host ""
Write-Host "✨ ¡Proyecto iniciado!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs disponibles:" -ForegroundColor Yellow
Write-Host "  → Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  → Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "  → API:      http://localhost:5000/api/" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Los servidores se abrieron en ventanas separadas." -ForegroundColor Gray
Write-Host "   Cierra esas ventanas para detener los servidores." -ForegroundColor Gray
Write-Host ""