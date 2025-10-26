# Guía de Desarrollo

## 🎯 Flujo de Trabajo Recomendado

### 1. Inicio Rápido

**Windows:**
```powershell
.\start-dev.ps1
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### 2. Desarrollo Manual

**Backend:**
```bash
cd backend
source venv/bin/activate  # Linux/Mac
# o
.\venv\Scripts\Activate.ps1  # Windows

python wsgi.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 📝 Convenciones de Código

### Backend (Python)

- **PEP 8**: Seguir el estilo de código de Python
- **Type hints**: Usar cuando sea posible
- **Docstrings**: Documentar funciones y clases importantes
- **Nombres**:
  - Variables y funciones: `snake_case`
  - Clases: `PascalCase`
  - Constantes: `UPPER_SNAKE_CASE`

**Ejemplo:**
```python
from typing import Dict, Optional

def get_user_by_id(user_id: int) -> Optional[Dict]:
    """
    Obtiene un usuario por su ID.
    
    Args:
        user_id: El ID del usuario a buscar
        
    Returns:
        Un diccionario con los datos del usuario o None si no existe
    """
    # Implementación...
    pass
```

### Frontend (TypeScript/React)

- **ESLint**: El proyecto incluye configuración de ESLint
- **Nombres**:
  - Componentes: `PascalCase`
  - Variables y funciones: `camelCase`
  - Constantes: `UPPER_SNAKE_CASE`
  - Archivos de componentes: `PascalCase.tsx`
  - Archivos de utilidades: `camelCase.ts`

**Ejemplo:**
```typescript
interface UserProps {
  name: string
  email: string
}

export function UserCard({ name, email }: UserProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  return (
    <Card>
      {/* Contenido */}
    </Card>
  )
}
```

## 🏗️ Estructura de Archivos

### Backend

```
backend/app/
├── models/          # Modelos de base de datos
│   ├── __init__.py
│   └── user.py      # Ejemplo: modelo User
├── routes/          # Blueprints y endpoints
│   ├── __init__.py
│   ├── main.py      # Rutas generales
│   └── auth.py      # Rutas de autenticación
├── schemas/         # Schemas de validación (Marshmallow)
│   ├── __init__.py
│   └── user.py      # Ejemplo: schema de usuario
└── services/        # Lógica de negocio
    ├── __init__.py
    └── auth.py      # Ejemplo: servicio de autenticación
```

### Frontend

```
frontend/src/
├── components/      # Componentes reutilizables
│   ├── ui/          # Componentes base (shadcn)
│   └── shared/      # Componentes compartidos
├── features/        # Features específicas
│   └── auth/        # Ejemplo: feature de autenticación
│       ├── index.tsx
│       └── components/
├── routes/          # Rutas de TanStack Router
│   ├── __root.tsx   # Layout raíz
│   └── login.tsx    # Ejemplo: ruta de login
├── lib/             # Utilidades y helpers
│   ├── utils.ts
│   └── api.ts       # Cliente API
└── types/           # Tipos TypeScript compartidos
    └── index.ts
```

## 🔄 Agregar Nuevas Funcionalidades

### Crear un Nuevo Endpoint (Backend)

1. **Crear el modelo** (si necesitas guardar datos):
```python
# backend/app/models/product.py
from app.extensions import db

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price
        }
```

2. **Crear el schema** (validación):
```python
# backend/app/schemas/product.py
from marshmallow import Schema, fields

class ProductSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    price = fields.Float(required=True)
```

3. **Crear el blueprint**:
```python
# backend/app/routes/products.py
from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.product import Product
from app.schemas.product import ProductSchema

products_bp = Blueprint('products', __name__, url_prefix='/api/products')
product_schema = ProductSchema()
products_schema = ProductSchema(many=True)

@products_bp.route('/', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify({
        'status': 'success',
        'data': products_schema.dump(products)
    }), 200
```

4. **Registrar el blueprint**:
```python
# backend/app/routes/__init__.py
from .main import main_bp
from .auth import auth_bp
from .products import products_bp

def register_blueprints(app):
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
```

5. **Crear migración**:
```bash
flask db migrate -m "Add products table"
flask db upgrade
```

### Crear una Nueva Página (Frontend)

1. **Crear la ruta**:
```typescript
// frontend/src/routes/products.tsx
import { createFileRoute } from '@tanstack/react-router'
import { ProductList } from '@/features/products'

export const Route = createFileRoute('/products')({
  component: ProductList,
})
```

2. **Crear el feature**:
```typescript
// frontend/src/features/products/index.tsx
import { useEffect, useState } from 'react'

interface Product {
  id: number
  name: string
  price: number
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    fetch('/api/products/')
      .then(res => res.json())
      .then(data => setProducts(data.data))
  }, [])
  
  return (
    <div>
      <h1>Productos</h1>
      {products.map(product => (
        <div key={product.id}>
          {product.name} - ${product.price}
        </div>
      ))}
    </div>
  )
}
```

3. **Agregar al navbar** (opcional):
```typescript
// frontend/src/components/Navbar.tsx
// Agregar el link
<li>
  <Link to="/products">Productos</Link>
</li>
```

## 🧪 Testing

### Backend

Usar pytest para tests:

```python
# backend/tests/test_products.py
def test_get_products(client):
    response = client.get('/api/products/')
    assert response.status_code == 200
    assert 'data' in response.json
```

Ejecutar tests:
```bash
pytest
```

### Frontend

Configurar testing (ejemplo con Vitest):

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## 🔐 Autenticación

### Implementar Login (Backend)

```python
# backend/app/routes/auth.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Validar usuario (implementar tu lógica)
    if validate_user(username, password):
        access_token = create_access_token(identity=username)
        return jsonify({
            'status': 'success',
            'token': access_token
        }), 200
    
    return jsonify({
        'status': 'error',
        'message': 'Credenciales inválidas'
    }), 401
```

### Proteger Rutas

```python
from flask_jwt_extended import jwt_required, get_jwt_identity

@products_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    current_user = get_jwt_identity()
    # Crear producto...
```

## 📚 Recursos Adicionales

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [React Documentation](https://react.dev/)
- [TanStack Router](https://tanstack.com/router)
- [DaisyUI Components](https://daisyui.com/components/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💡 Tips

1. **Hot Reload**: Ambos servidores (Flask y Vite) tienen hot reload activado
2. **DevTools**: TanStack Router DevTools está disponible en desarrollo
3. **Logs**: El backend muestra logs de SQL en desarrollo
4. **Temas**: Usa el selector de temas para probar diferentes estilos
5. **Type Safety**: Aprovecha TypeScript para evitar errores en tiempo de compilación
6. **API Client**: Considera crear un cliente API centralizado en `frontend/src/lib/api.ts`

## 🐛 Debugging

### Backend
```python
# Usar breakpoints
import pdb; pdb.set_trace()

# O usar el debugger de VS Code
```

### Frontend
```typescript
// Console logs
console.log('Debug:', data)

// React DevTools (extensión de navegador)
// TanStack Router DevTools (incluido en el proyecto)
```

## 📦 Deployment

### Backend (con Gunicorn)

```bash
gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
```

### Frontend

```bash
npm run build
# Los archivos estarán en frontend/dist/
```

## 🤝 Contribuir

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crea un Pull Request
