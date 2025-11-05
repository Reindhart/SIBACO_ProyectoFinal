# 🔒 Sistema de Manejo de Errores

## Descripción General

Se ha implementado un sistema robusto de manejo de errores que sigue las mejores prácticas de seguridad:

- **Frontend**: Recibe mensajes genéricos y amigables para el usuario
- **Backend**: Registra detalles completos en consola con trazas de error (tracebacks)

Esto previene la exposición de información sensible del sistema a los usuarios finales, mientras que proporciona información detallada a los desarrolladores para debugging.

---

## 📋 Cambios Implementados

### 1. Backend - Manejadores de Errores Globales (`backend/app/__init__.py`)

Se agregaron manejadores de errores para los códigos HTTP más comunes:

#### Errores HTTP Específicos

| Código | Descripción | Mensaje al Usuario |
|--------|-------------|-------------------|
| **400** | Bad Request | "Solicitud inválida. Por favor verifica los datos enviados." |
| **401** | Unauthorized | "No autorizado. Por favor inicia sesión nuevamente." |
| **403** | Forbidden | "No tienes permisos para realizar esta acción." |
| **404** | Not Found | "Recurso no encontrado." |
| **405** | Method Not Allowed | "Método no permitido para este recurso." |
| **422** | Unprocessable Entity | "No se pudo procesar la solicitud. Datos no válidos." |
| **500** | Internal Server Error | "Error interno del servidor. Por favor intenta más tarde." |

#### Manejador de Excepciones No Capturadas

- **Función**: `handle_exception(error)`
- **Comportamiento**:
  - Registra el traceback completo en consola con `app.logger.error()`
  - Detecta el código HTTP si está disponible
  - Devuelve mensaje genérico al frontend
  - Por defecto usa código 500 para excepciones desconocidas

**Ejemplo de log en consola:**
```
❌ Unhandled Exception: division by zero
Traceback (most recent call last):
  File "app/routes/example.py", line 42, in calculate
    result = 10 / 0
ZeroDivisionError: division by zero
```

**Respuesta al frontend:**
```json
{
  "status": "error",
  "message": "Ha ocurrido un error inesperado. Por favor intenta más tarde."
}
```

---

### 2. Configuración de Logging (`backend/app/config.py`)

Se agregaron configuraciones de logging diferenciadas por ambiente:

#### BaseConfig
```python
LOG_LEVEL = logging.INFO
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
```

#### DevConfig (Desarrollo)
```python
LOG_LEVEL = logging.DEBUG  # Logging muy detallado
SQLALCHEMY_ECHO = True     # Muestra todas las queries SQL
```

#### ProdConfig (Producción)
```python
LOG_LEVEL = logging.WARNING  # Solo advertencias y errores
SQLALCHEMY_ECHO = False      # No mostrar queries SQL
```

#### TestConfig (Pruebas)
- Hereda de `BaseConfig` con `LOG_LEVEL = logging.INFO`

---

### 3. Inicialización de Logger (`backend/app/__init__.py`)

Se configuró el logger de la aplicación en la función `create_app()`:

```python
# Configurar logging
logging.basicConfig(
    level=app.config.get('LOG_LEVEL', logging.INFO),
    format=app.config.get('LOG_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
)

# Configurar el logger de la aplicación
app.logger.setLevel(app.config.get('LOG_LEVEL', logging.INFO))

app.logger.info(f"🚀 Iniciando aplicación en modo: {os.getenv('NODE_ENV', 'development')}")
app.logger.info(f"📊 Base de datos: {app.config['SQLALCHEMY_DATABASE_URI']}")
```

**Salida en consola al iniciar:**
```
2025-11-05 03:24:13,956 - app - INFO - 🚀 Iniciando aplicación en modo: development
2025-11-05 03:24:13,956 - app - INFO - 📊 Base de datos: sqlite:///medical_diagnostic_dev.db
```

---

## 🎯 Flujo de Manejo de Errores

### Escenario 1: Error HTTP Estándar (404, 400, etc.)

```
Usuario solicita → Endpoint no existe → @app.errorhandler(404)
                                      ↓
                            Log en consola: ❌ Not Found (404): /api/xyz
                                      ↓
                            Response JSON genérico al frontend
```

### Escenario 2: Excepción No Capturada en el Código

```
Usuario solicita → Lógica de negocio → Excepción (ej: ZeroDivisionError)
                                      ↓
                            @app.errorhandler(Exception)
                                      ↓
                            Log COMPLETO con traceback en consola
                                      ↓
                            Response JSON genérico: "Ha ocurrido un error inesperado"
```

### Escenario 3: Error de Autenticación JWT

```
Usuario envía token → Token expirado/inválido → @jwt.expired_token_loader
                                               ↓
                            Response JSON: "Token expirado"
                                               ↓
                            Frontend redirige a login
```

---

## 🛡️ Ventajas de Seguridad

### ✅ Lo que SÍ ve el usuario (Frontend)
- Mensajes claros y accionables en español
- Sin detalles técnicos del servidor
- Sin rutas de archivos o nombres de funciones
- Sin información de base de datos

**Ejemplo:**
```json
{
  "status": "error",
  "message": "No tienes permisos para realizar esta acción."
}
```

### ✅ Lo que SÍ ve el desarrollador (Backend Console)
- Traceback completo de Python
- Línea exacta donde ocurrió el error
- Variables y contexto de ejecución
- Stack trace completo

**Ejemplo:**
```
❌ Internal Server Error (500): AttributeError: 'NoneType' object has no attribute 'id'
Traceback (most recent call last):
  File "app/routes/patients.py", line 87, in update_patient
    patient_id = patient.id
AttributeError: 'NoneType' object has no attribute 'id'
```

---

## 📝 Frontend - Manejo de Errores Existente

El frontend ya tiene hooks preparados para manejar errores:

### useFetch (Para GET requests)
```typescript
const { data, loading, error, refetch } = useFetch({ 
  url: '/api/patients' 
});

if (error) {
  // Mostrar mensaje de error al usuario
  console.error('Error fetching data:', error);
}
```

### usePost (Para POST/PUT/DELETE requests)
```typescript
const { execute, response, loading, error } = usePost();

const handleSubmit = async (formData) => {
  const result = await execute({
    url: '/api/patients',
    body: formData,
    method: 'post'
  });
  
  if (error) {
    // Mostrar notificación de error
    alert(error.message); // O usar un sistema de notificaciones
  }
};
```

**Nota**: Los hooks ya capturan los errores y los mensajes genéricos del backend se propagan automáticamente.

---

## 🧪 Cómo Probar el Sistema

### 1. Probar Error 404
```bash
curl http://localhost:5000/api/ruta-inexistente
```
**Respuesta esperada:**
```json
{
  "status": "error",
  "message": "Recurso no encontrado."
}
```
**Consola backend:**
```
❌ Not Found (404): 404 Not Found: The requested URL was not found on the server...
```

### 2. Probar Error 401 (Sin Token)
```bash
curl http://localhost:5000/api/patients
```
**Respuesta esperada:**
```json
{
  "status": "error",
  "message": "Token de autorización no encontrado"
}
```

### 3. Simular Error 500 (Agregar código con error)
Crear un endpoint de prueba en `routes/main.py`:
```python
@main_bp.route('/test-error', methods=['GET'])
def test_error():
    # Esto causará un error intencional
    result = 10 / 0
    return jsonify({'result': result})
```

```bash
curl http://localhost:5000/api/test-error
```
**Respuesta esperada:**
```json
{
  "status": "error",
  "message": "Ha ocurrido un error inesperado. Por favor intenta más tarde."
}
```
**Consola backend:**
```
❌ Unhandled Exception: division by zero
Traceback (most recent call last):
  File "app/routes/main.py", line 15, in test_error
    result = 10 / 0
ZeroDivisionError: division by zero
```

---

## 🚀 Variables de Entorno Relevantes

Asegúrate de tener configuradas estas variables en tu archivo `.env`:

```env
# Ambiente de ejecución
NODE_ENV=development  # Cambiar a "production" en producción

# Base de datos
DB_TYPE_DEV=sqlite
DB_NAME_DEV=medical_diagnostic_dev.db

# Seguridad (CAMBIAR EN PRODUCCIÓN)
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=jwt-secret-key-change-in-production
```

---

## 📊 Resumen de Archivos Modificados

| Archivo | Cambios Realizados |
|---------|-------------------|
| `backend/app/__init__.py` | ✅ Agregados 8 manejadores de error HTTP<br>✅ Manejador de excepciones globales<br>✅ Configuración de logging con emojis |
| `backend/app/config.py` | ✅ Import de módulo `logging`<br>✅ Agregadas propiedades `LOG_LEVEL` y `LOG_FORMAT`<br>✅ Configuraciones específicas por ambiente |

---

## 🎓 Mejores Prácticas Implementadas

1. ✅ **Separación de responsabilidades**: Los detalles técnicos quedan en backend
2. ✅ **Seguridad por diseño**: No exponer stack traces al público
3. ✅ **Experiencia de usuario**: Mensajes claros y en español
4. ✅ **Debugging eficiente**: Logs detallados para desarrolladores
5. ✅ **Configuración por ambiente**: Comportamiento diferente en dev/prod
6. ✅ **Manejo exhaustivo**: Captura todos los tipos de error posibles

---

## 🔄 Próximos Pasos Recomendados

1. **Agregar sistema de notificaciones en frontend** (toast/snackbar)
   - Usar una librería como `react-toastify` o `sonner`
   - Mostrar los mensajes de error de forma visual

2. **Implementar logging a archivo en producción**
   - Guardar logs en archivos rotativos
   - Usar librerías como `python-logging-handler`

3. **Agregar monitoreo de errores**
   - Integrar Sentry o similar para tracking de errores en producción
   - Enviar alertas cuando ocurran errores críticos

4. **Crear diccionario centralizado de mensajes**
   - Archivo `messages.py` con todos los mensajes de error
   - Facilita traducciones y mantenimiento

5. **Tests unitarios para manejadores de error**
   - Verificar que cada tipo de error devuelve el mensaje correcto
   - Asegurar que los logs se registran apropiadamente

---

## ✅ Checklist de Verificación

- [x] Manejadores de error HTTP (400, 401, 403, 404, 405, 422, 500)
- [x] Manejador de excepciones globales
- [x] Configuración de logging por ambiente
- [x] Mensajes genéricos en español para frontend
- [x] Logs detallados con tracebacks en backend
- [x] Logger inicializado en `create_app()`
- [x] Emojis para identificación visual en logs
- [x] Servidor Flask funcionando correctamente

**Estado**: ✅ Sistema de manejo de errores completamente implementado y funcionando.
