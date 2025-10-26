import os
from flask import Flask
from .extensions import db, migrate, jwt, cors
from .routes import register_blueprints
from .config import get_config

def create_app(config_class=None):
    app = Flask(__name__)
    
    # Cargar configuración según el ambiente
    if config_class is None:
        config_class = get_config()
    
    app.config.from_object(config_class)

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configurar CORS
    cors_origins = app.config.get("CORS_ORIGINS", ["http://localhost:5173", "http://localhost:3000"])
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": cors_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    # Registrar blueprints
    register_blueprints(app)
    
    # Log de configuración en desarrollo
    if app.config.get("DEBUG"):
        print(f"🚀 Aplicación iniciada en modo: {os.getenv('NODE_ENV', 'development')}")
        print(f"📊 Base de datos: {app.config.get('SQLALCHEMY_DATABASE_URI')}")

    return app
