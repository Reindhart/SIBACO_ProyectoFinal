#!/bin/bash
# Script para iniciar el proyecto completo (Frontend + Backend)
# Uso: ./start-dev.sh

echo "🚀 Iniciando React + Flask Template..."
echo ""

# Verificar si Python está instalado
if command -v python3 &> /dev/null; then
    echo "✓ Python encontrado: $(python3 --version)"
else
    echo "✗ Python no encontrado. Por favor, instala Python 3.10 o superior."
    exit 1
fi

# Verificar si Node está instalado
if command -v node &> /dev/null; then
    echo "✓ Node.js encontrado: $(node --version)"
else
    echo "✗ Node.js no encontrado. Por favor, instala Node.js 18 o superior."
    exit 1
fi

echo ""
echo "📦 Verificando dependencias..."

# Backend
echo "  → Verificando backend..."
if [ ! -d "backend/venv" ]; then
    echo "  → Creando entorno virtual..."
    cd backend
    python3 -m venv venv
    cd ..
fi

echo "  → Instalando dependencias del backend..."
cd backend
source venv/bin/activate
pip install -r requirements-dev.txt -q
cd ..

# Frontend
echo "  → Verificando frontend..."
if [ ! -d "frontend/node_modules" ]; then
    echo "  → Instalando dependencias del frontend..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "🔥 Iniciando servidores..."

# Iniciar Backend en segundo plano
cd backend
source venv/bin/activate
python wsgi.py &
BACKEND_PID=$!
cd ..

# Esperar un momento
sleep 2

# Iniciar Frontend en segundo plano
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✨ ¡Proyecto iniciado!"
echo ""
echo "📍 URLs disponibles:"
echo "  → Frontend: http://localhost:5173"
echo "  → Backend:  http://localhost:5000"
echo "  → API:      http://localhost:5000/api/"
echo ""
echo "💡 Para detener los servidores, presiona Ctrl+C"
echo ""

# Esperar a que el usuario presione Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
