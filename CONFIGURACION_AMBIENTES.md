# Guía de Configuración de Ambientes

## Descripción General

Este proyecto utiliza una separación clara de ambientes basada en la variable `NODE_ENV`. La configuración se gestiona a través de variables de entorno definidas en el archivo `.env`.

## Variables de Entorno

### Variables Generales

- `SECRET_KEY`: Clave secreta para Flask (sesiones, cookies, etc.)
- `JWT_SECRET_KEY`: Clave secreta para firmar los tokens JWT
- `FLASK_APP`: Punto de entrada de la aplicación (wsgi.py)
- `NODE_ENV`: Ambiente de ejecución (`development`, `production`, `test`)

### Variables de Base de Datos - Desarrollo

- `DB_NAME_DEV`: Nombre de la base de datos de desarrollo
- `DB_USER_DEV`: Usuario de PostgreSQL para desarrollo
- `DB_PASSWORD_DEV`: Contraseña del usuario de desarrollo
- `DB_HOST_DEV`: Host de la base de datos de desarrollo (generalmente `localhost`)
- `DB_PORT_DEV`: Puerto de PostgreSQL de desarrollo (generalmente `5432`)

### Variables de Base de Datos - Producción

- `DB_NAME_PROD`: Nombre de la base de datos de producción
- `DB_USER_PROD`: Usuario de PostgreSQL para producción
- `DB_PASSWORD_PROD`: Contraseña del usuario de producción
- `DB_HOST_PROD`: Host de la base de datos de producción
- `DB_PORT_PROD`: Puerto de PostgreSQL de producción

### Variables de Seguridad

- `CORS_WHITELIST`: Lista separada por comas de orígenes permitidos para CORS
  - Ejemplo: `http://localhost:5173,http://localhost:3000,https://miapp.com`
- `RATE_LIMIT_WHITELIST`: Lista separada por comas de IPs que evitan el rate limiting
  - Ejemplo: `127.0.0.1,192.168.1.100`

## Configuración por Ambiente

### Desarrollo (`NODE_ENV=development`)

```env
NODE_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=jwt-secret-key-change-in-production

DB_NAME_DEV=flask_template_dev
DB_USER_DEV=postgres
DB_PASSWORD_DEV=postgres
DB_HOST_DEV=localhost
DB_PORT_DEV=5432

CORS_WHITELIST=http://localhost:5173,http://localhost:3000
```

**Características:**
- Debug mode activado
- SQLAlchemy echo activado (muestra las queries SQL)
- CORS permisivo
- No requiere HTTPS para cookies

### Producción (`NODE_ENV=production`)

```env
NODE_ENV=production
SECRET_KEY=tu-clave-super-secreta-y-larga-aqui
JWT_SECRET_KEY=tu-jwt-secret-super-segura-aqui

DB_NAME_PROD=flask_template_prod
DB_USER_PROD=usuario_produccion
DB_PASSWORD_PROD=contraseña_segura_produccion
DB_HOST_PROD=servidor-db.ejemplo.com
DB_PORT_PROD=5432

CORS_WHITELIST=https://miapp.com,https://www.miapp.com
RATE_LIMIT_WHITELIST=10.0.0.1
```

**Características:**
- Debug mode desactivado
- SQLAlchemy echo desactivado
- CORS restrictivo (solo dominios en whitelist)
- Cookies seguras (HTTPS only)
- Validación estricta de SECRET_KEY y JWT_SECRET_KEY

### Testing (`NODE_ENV=test`)

```env
NODE_ENV=test
SECRET_KEY=test-secret-key
JWT_SECRET_KEY=test-jwt-secret-key
```

**Características:**
- Usa SQLite en memoria (no requiere PostgreSQL)
- Tokens JWT con expiración corta (5 minutos)
- Configuración optimizada para tests rápidos

## Cómo Cambiar de Ambiente

### En desarrollo local:

**Windows (PowerShell):**
```powershell
$env:NODE_ENV="development"
python wsgi.py
```

**Linux/Mac:**
```bash
export NODE_ENV=development
python wsgi.py
```

### En producción:

**Con systemd (Linux):**
```ini
[Service]
Environment="NODE_ENV=production"
Environment="SECRET_KEY=tu-clave-secreta"
# ... otras variables
```

**Con Docker:**
```dockerfile
ENV NODE_ENV=production
ENV SECRET_KEY=tu-clave-secreta
```

## Generación de Claves Secretas

Para generar claves seguras en producción, usa:

```python
import secrets
print(secrets.token_hex(32))
```

O desde la terminal:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Configuración de PostgreSQL

### Crear bases de datos:

```sql
-- Base de datos de desarrollo
CREATE DATABASE flask_template_dev;

-- Base de datos de producción
CREATE DATABASE flask_template_prod;

-- Crear usuario (opcional)
CREATE USER tu_usuario WITH PASSWORD 'tu_contraseña';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE flask_template_dev TO tu_usuario;
GRANT ALL PRIVILEGES ON DATABASE flask_template_prod TO tu_usuario;
```

## Verificación de Configuración

Al iniciar la aplicación en modo desarrollo, verás en la consola:

```
🚀 Aplicación iniciada en modo: development
📊 Base de datos: postgresql+psycopg://usuario:***@localhost:5432/flask_template_dev
```

Esto confirma que la aplicación está usando la configuración correcta.

## Mejores Prácticas

1. **Nunca subas el archivo `.env` a git** - Ya está en `.gitignore`
2. **Usa el archivo `.env.example`** como referencia para otros desarrolladores
3. **En producción**, usa variables de entorno del sistema o un gestor de secretos
4. **Genera claves secretas únicas** para cada ambiente
5. **Usa contraseñas fuertes** para las bases de datos de producción
6. **Mantén separadas** las bases de datos de desarrollo y producción
7. **Documenta cualquier variable nueva** que agregues

## Troubleshooting

### Error: "SECRET_KEY y JWT_SECRET_KEY deben estar configuradas en producción"
**Solución:** Asegúrate de que `SECRET_KEY` y `JWT_SECRET_KEY` estén definidas en tu `.env` cuando `NODE_ENV=production`

### Error: "No module named 'psycopg'"
**Solución:** Instala psycopg: `pip install psycopg[binary]`

### Error de conexión a PostgreSQL
**Solución:** Verifica que:
1. PostgreSQL está corriendo
2. Las credenciales son correctas
3. El host y puerto son accesibles
4. La base de datos existe

### CORS errors en el frontend
**Solución:** Verifica que la URL del frontend esté en `CORS_WHITELIST`
