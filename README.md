# Proyecto Final: Sistemas Basados en Conocimiento

Este proyecto es acerca de un sistema de diagnóstico médico, el cuál usa un motor dei inferencia para detectar enfermedades y tratamientos a pacientes.

## 🚀 Tecnologías

### Frontend
- **React 19** - Librería UI
- **TypeScript** - Tipado estático
- **TanStack Router** - Enrutamiento
- **Tailwind CSS** - Framework de estilos
- **DaisyUI** - Componentes y temas (29 temas disponibles)
- **shadcn/ui** - Componentes reutilizables
- **Vite** - Build tool

### Backend
- **Flask 3** - Framework web
- **SQLAlchemy** - ORM
- **Flask-JWT-Extended** - Autenticación JWT
- **Flask-CORS** - Cross-Origin Resource Sharing
- **PostgreSQL** - Base de datos
- **Flask-Migrate** - Migraciones de base de datos
- **Python-dotenv** - Gestión de variables de entorno
- **Kanren** - Programación lógica para motor de inferencia

## 📦 Instalación

### Requisitos Previos
- Node.js 18+ y npm
- Python 3.10+
- PostgreSQL 12+

### Backend

1. Navega a la carpeta del backend:
```bash
cd backend
```

2. Crea un entorno virtual:
```bash
python -m venv venv
```

3. Activa el entorno virtual:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. Instala las dependencias:
```bash
pip install -r requirements.txt
```

5. Copia el archivo `.env.example` a `.env` y configura tus variables:
```bash
cp .env.example .env
```

6. Edita el archivo `.env` con tus credenciales de base de datos:
```env
# Configuración general
SECRET_KEY=tu-clave-secreta-aqui
JWT_SECRET_KEY=tu-jwt-secret-key-aqui
NODE_ENV=development

# Base de datos - Desarrollo
DB_NAME_DEV=flask_template_dev
DB_USER_DEV=tu_usuario
DB_PASSWORD_DEV=tu_contraseña
DB_HOST_DEV=localhost
DB_PORT_DEV=5432

# Base de datos - Producción (mantén los mismos valores para la plantilla)
DB_NAME_PROD=flask_template_prod
DB_USER_PROD=tu_usuario
DB_PASSWORD_PROD=tu_contraseña
DB_HOST_PROD=localhost
DB_PORT_PROD=5432
```

7. Crea la base de datos en PostgreSQL:
```bash
# Conéctate a PostgreSQL
psql -U postgres

# Crea la base de datos
CREATE DATABASE flask_template_dev;

# Sal de PostgreSQL
\q
```

8. Ejecuta las migraciones:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

9. Inicia el servidor de desarrollo:
```bash
python wsgi.py
```

El backend estará corriendo en `http://localhost:5000`

### Frontend

1. Navega a la carpeta del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará corriendo en `http://localhost:5173`

## 🎨 Características

### Frontend
- ✅ TypeScript para type safety
- ✅ Enrutamiento con TanStack Router (generación automática de rutas)
- ✅ Selector de temas con 29 temas de DaisyUI
- ✅ Componentes de shadcn/ui configurados
- ✅ Proxy configurado para el backend
- ✅ Estilos con Tailwind CSS v4 y DaisyUI
- ✅ Path aliases (`@/`) configurados
- ✅ Componente de inicio con llamada al API

### Backend
- ✅ Configuración por ambientes (Dev/Prod/Test)
- ✅ Separación de credenciales de BD por ambiente
- ✅ CORS configurado dinámicamente
- ✅ Estructura modular con blueprints
- ✅ JWT para autenticación (listo para usar)
- ✅ Migraciones de base de datos con Alembic
- ✅ Endpoints de validación y health check
- ✅ Gestión de variables de entorno con python-dotenv

## 📁 Estructura del Proyecto

```
React-Flask-Template/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Factory pattern con configuración dinámica
│   │   ├── config.py            # Configuraciones por ambiente
│   │   ├── extensions.py        # Extensiones Flask
│   │   ├── models/              # Modelos SQLAlchemy
│   │   ├── routes/              # Blueprints y rutas
│   │   │   ├── main.py          # Rutas principales
│   │   │   └── auth.py          # Rutas de autenticación
│   │   ├── schemas/             # Schemas de validación
│   │   └── services/            # Lógica de negocio
│   ├── migrations/              # Migraciones Alembic
│   ├── tests/                   # Tests
│   ├── .env                     # Variables de entorno (no subir a git)
│   ├── .env.example             # Ejemplo de variables de entorno
│   ├── requirements.txt         # Dependencias Python
│   └── wsgi.py                  # Punto de entrada
│
└── frontend/
    ├── src/
    │   ├── components/          # Componentes reutilizables
    │   │   ├── ui/              # Componentes shadcn (Button, Card, etc.)
    │   │   ├── Navbar.tsx       # Barra de navegación
    │   │   └── ThemeSelector.tsx # Selector de temas DaisyUI
    │   ├── features/            # Features de la aplicación
    │   │   └── index.tsx        # Página de inicio
    │   ├── routes/              # Rutas TanStack Router
    │   │   ├── __root.tsx       # Layout principal
    │   │   └── index.tsx        # Ruta raíz
    │   ├── lib/                 # Utilidades
    │   │   └── utils.ts         # Helper cn() para classnames
    │   ├── App.tsx              # Componente principal
    │   ├── main.tsx             # Punto de entrada
    │   └── index.css            # Estilos globales
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    └── tsconfig.node.json
```

## 🔌 API Endpoints

### Main Routes (`/api/`)
- `GET /api/` - Mensaje de bienvenida y validación
- `GET /api/health` - Health check del servidor

### Auth Routes (`/api/auth/`)
- Listo para implementar autenticación JWT

## ⚙️ Configuración de Ambientes

El proyecto usa `NODE_ENV` para determinar el ambiente de ejecución:

### Desarrollo
```env
NODE_ENV=development
```
- Activa modo debug
- Usa credenciales de `DB_*_DEV`
- CORS permisivo
- SQLAlchemy echo activado

### Producción
```env
NODE_ENV=production
```
- Desactiva modo debug
- Usa credenciales de `DB_*_PROD`
- CORS restrictivo (whitelist)
- Cookies seguras
- Requiere SECRET_KEY y JWT_SECRET_KEY configuradas

### Testing
```env
NODE_ENV=test
```
- Usa SQLite en memoria
- Configuración optimizada para tests

## 📝 Comandos Útiles

### Backend
```bash
# Crear migración
flask db migrate -m "descripción"

# Aplicar migraciones
flask db upgrade

# Revertir migración
flask db downgrade

# Ejecutar tests
pytest

# Cambiar a ambiente de producción
export NODE_ENV=production  # Linux/Mac
$env:NODE_ENV="production"  # Windows PowerShell
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🎨 Personalización de Temas

DaisyUI ofrece 29 temas preconstruidos. El selector de temas está disponible en la navbar.

Temas disponibles:
- light, dark, cupcake, bumblebee, emerald, corporate
- synthwave, retro, cyberpunk, valentine, halloween, garden
- forest, aqua, lofi, pastel, fantasy, wireframe, black
- luxury, dracula, cmyk, autumn, business, acid, lemonade
- night, coffee, winter

Para personalizar más, edita `tailwind.config.js`.

## 🔒 Seguridad

- ✅ CORS configurado con whitelist en producción
- ✅ Variables de entorno para secretos
- ✅ JWT para autenticación
- ✅ Cookies seguras en producción
- ✅ Rate limiting listo para configurar
- ✅ .env excluido de git

## 📄 Licencia

MIT
