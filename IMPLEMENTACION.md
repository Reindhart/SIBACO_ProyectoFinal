# Resumen de Implementación - Motor de Inferencia Diagnóstico Médico

## 🎯 Objetivo
Desarrollar un sistema de diagnóstico médico con motor de inferencia usando React + Flask + SQLite.

## ✅ Cambios Realizados

### 1. Configuración de Base de Datos Multi-Engine

#### Archivo: `backend/app/config.py`
- ✅ Modificada la función `get_database_uri()` para soportar múltiples bases de datos:
  - **SQLite** (por defecto)
  - **PostgreSQL**
  - **MySQL/MariaDB**
  - **Oracle**
  - **SQL Server**

#### Cómo usar diferentes bases de datos:

**SQLite (Por defecto):**
```env
DB_TYPE_DEV=sqlite
DB_NAME_DEV=medical_diagnostic_dev.db
```

**PostgreSQL:**
```env
DB_TYPE_DEV=postgresql
DB_NAME_DEV=medical_db
DB_USER_DEV=postgres
DB_PASSWORD_DEV=password
DB_HOST_DEV=localhost
DB_PORT_DEV=5432
```

**MySQL:**
```env
DB_TYPE_DEV=mysql
DB_NAME_DEV=medical_db
DB_USER_DEV=root
DB_PASSWORD_DEV=password
DB_HOST_DEV=localhost
DB_PORT_DEV=3306
```

### 2. Modelos de Base de Datos Implementados

#### ✅ Modelo User (`backend/app/models/user.py`)
- Gestión de usuarios del sistema (Admin y Doctor)
- Campos: username, email, password_hash, role, first_name, last_name, phone
- Métodos: `set_password()`, `check_password()`, `to_dict()`

#### ✅ Modelo Patient (`backend/app/models/patient.py`)
- Información de pacientes
- Campos: datos personales, contacto, información médica básica
- Relación: Un paciente pertenece a un médico (doctor_id)

#### ✅ Modelos de Conocimiento Médico (`backend/app/models/medical_knowledge.py`)
- **Disease**: Enfermedades con código, nombre, descripción, tratamiento
- **Symptom**: Síntomas
- **Sign**: Signos clínicos
- **LabTest**: Pruebas de laboratorio
- **PostmortemTest**: Pruebas post-mortem
- **Tablas de asociación** (muchos a muchos) con campo `weight` para el motor de inferencia:
  - disease_symptoms
  - disease_signs
  - disease_lab_tests
  - disease_postmortem_tests

#### ✅ Modelo Diagnosis (`backend/app/models/diagnosis.py`)
- **Diagnosis**: Diagnósticos médicos
  - Síntomas y signos presentados
  - Resultados del motor de inferencia (confidence_score)
  - Diagnóstico diferencial (alternative_diseases)
  - Tratamiento y seguimiento
- **FollowUp**: Seguimientos del paciente
  - Evolución del paciente
  - Ajustes en el tratamiento
  - Próxima cita

### 3. Sistema de Autenticación

#### ✅ Schemas de Validación (`backend/app/schemas/auth.py`)
- `RegisterSchema`: Validación de registro
- `LoginSchema`: Validación de login
- `UserSchema`: Serialización de usuario
- `ChangePasswordSchema`: Cambio de contraseña
- `UpdateProfileSchema`: Actualización de perfil

#### ✅ Endpoints de Autenticación (`backend/app/routes/auth.py`)

| Endpoint | Método | Descripción | Auth |
|----------|--------|-------------|------|
| `/api/auth/register` | POST | Registro de nuevo usuario | No |
| `/api/auth/login` | POST | Inicio de sesión | No |
| `/api/auth/refresh` | POST | Refrescar token | JWT (refresh) |
| `/api/auth/me` | GET | Obtener usuario actual | JWT |
| `/api/auth/me` | PUT | Actualizar perfil | JWT |
| `/api/auth/change-password` | POST | Cambiar contraseña | JWT |

#### Ejemplo de uso:

**Registro:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "nuevo_doctor",
  "email": "doctor@example.com",
  "password": "password123",
  "first_name": "Juan",
  "last_name": "Pérez",
  "role": "doctor"
}
```

**Login:**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "doctor",
  "password": "doctor123"
}
```

### 4. Base de Datos

#### ✅ Migraciones Creadas
```bash
flask db init
flask db migrate -m "Initial migration: Medical Diagnostic System"
flask db upgrade
```

#### ✅ Datos de Prueba
Script: `backend/scripts/seed_data.py`

**Usuarios creados:**
- **Admin**: username=`admin`, password=`admin123`
- **Doctor**: username=`doctor`, password=`doctor123`

**Datos de muestra:**
- 3 enfermedades (Resfriado común, Gastroenteritis, Hipertensión)
- 6 síntomas (Fiebre, Tos, Dolor de cabeza, Náuseas, Vómito, Diarrea)
- 3 signos vitales (Temperatura, Presión arterial, Frecuencia cardíaca)
- 2 pruebas de laboratorio (Hemograma, Glucosa)

Para ejecutar el script:
```bash
cd backend
python scripts/seed_data.py
```

### 5. Dependencias Actualizadas

#### `backend/requirements.txt`
- ✅ Agregados drivers para múltiples bases de datos:
  - `pymysql==1.1.1` (MySQL/MariaDB)
  - `cx-Oracle==8.3.0` (Oracle)
  - `pyodbc==5.2.0` (SQL Server)
- ✅ `python-dotenv==1.0.1` para gestión de variables de entorno

## 📊 Estructura de la Base de Datos

```
users (Usuarios/Médicos/Admin)
  ├── patients (Pacientes)
  │     └── diagnoses (Diagnósticos)
  │           └── follow_ups (Seguimientos)
  │
diseases (Enfermedades)
  ├── disease_symptoms (M:M)
  ├── disease_signs (M:M)
  ├── disease_lab_tests (M:M)
  └── disease_postmortem_tests (M:M)

symptoms (Síntomas)
signs (Signos)
lab_tests (Pruebas de laboratorio)
postmortem_tests (Pruebas post-mortem)
```

## 🚀 Cómo Ejecutar

### Backend
```bash
cd backend

# Activar entorno virtual (si ya existe)
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Linux/Mac

# Instalar dependencias (si es primera vez)
pip install -r requirements.txt

# Crear base de datos (si es primera vez)
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Crear datos de prueba (opcional)
python scripts/seed_data.py

# Iniciar servidor
python wsgi.py
```

El servidor estará en: `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

El frontend estará en: `http://localhost:5173`

## 📝 Próximos Pasos

### Pendiente por implementar:

1. **Frontend - Componentes de autenticación**
   - [ ] Página de Login
   - [ ] Página de Registro
   - [ ] Gestión de tokens JWT
   - [ ] Context API para autenticación

2. **CRUD Completo**
   - [ ] Pacientes (Create, Read, Update, Delete)
   - [ ] Enfermedades
   - [ ] Síntomas
   - [ ] Signos
   - [ ] Pruebas de laboratorio
   - [ ] Diagnósticos

3. **Motor de Inferencia**
   - [ ] Algoritmo de diagnóstico basado en síntomas/signos
   - [ ] Cálculo de confidence_score
   - [ ] Diagnóstico diferencial
   - [ ] Servicio de inferencia (`backend/app/services/inference.py`)

4. **Historial Médico**
   - [ ] Visualización de diagnósticos del paciente
   - [ ] Timeline de seguimientos
   - [ ] Exportación de historial (PDF)

5. **Gráficas de Seguimiento**
   - [ ] Evolución de signos vitales
   - [ ] Gráficas con Chart.js o Recharts
   - [ ] Dashboard del paciente

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con `werkzeug.security`
- ✅ JWT para autenticación
- ✅ Validación de datos con Marshmallow
- ✅ CORS configurado
- ✅ Variables de entorno para secretos

## 📚 Archivos Importantes

- `backend/app/config.py` - Configuración multi-database
- `backend/app/models/` - Modelos de datos
- `backend/app/routes/auth.py` - Endpoints de autenticación
- `backend/app/schemas/auth.py` - Validación de datos
- `backend/.env` - Variables de entorno
- `backend/scripts/seed_data.py` - Datos de prueba

## 🎓 Notas de Desarrollo

- El sistema está preparado para implementar un motor de inferencia basado en pesos
- Las tablas de asociación incluyen un campo `weight` para calcular probabilidades
- El campo `confidence_score` en `Diagnosis` almacenará el nivel de confianza del diagnóstico
- El campo `inference_details` puede almacenar JSON con el proceso de inferencia
- El campo `alternative_diseases` almacenará diagnósticos diferenciales con sus scores
