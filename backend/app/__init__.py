import os
import logging
from flask import Flask, jsonify, request
from .extensions import db, migrate, jwt, cors
from .routes import register_blueprints
from .config import get_config

def create_app(config_class=None):
    app = Flask(__name__)
    
    # Cargar configuración según el ambiente
    if config_class is None:
        config_class = get_config()
    
    app.config.from_object(config_class)
    
    # Configurar logging
    logging.basicConfig(
        level=app.config.get('LOG_LEVEL', logging.INFO),
        format=app.config.get('LOG_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    )
    
    # Configurar el logger de la aplicación
    app.logger.setLevel(app.config.get('LOG_LEVEL', logging.INFO))
    
    app.logger.info(f"🚀 Iniciando aplicación en modo: {os.getenv('NODE_ENV', 'development')}")
    app.logger.info(f"📊 Base de datos: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configurar manejadores de errores JWT
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'status': 'error',
            'message': 'Token expirado'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'status': 'error',
            'message': 'Token inválido'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'status': 'error',
            'message': 'Token de autorización no encontrado'
        }), 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'status': 'error',
            'message': 'Token revocado'
        }), 401
    
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
    
    # ==================== MANEJADORES DE ERRORES GLOBALES ====================
    # Los detalles de error se registran en consola, pero el frontend recibe mensajes genéricos
    
    @app.errorhandler(400)
    def bad_request_error(error):
        app.logger.error(f"❌ Bad Request (400): {str(error)}")
        return jsonify({
            'status': 'error',
            'message': 'Solicitud inválida. Por favor verifica los datos enviados.'
        }), 400
    
    @app.errorhandler(401)
    def unauthorized_error(error):
        app.logger.error(f"❌ Unauthorized (401): {str(error)}")
        return jsonify({
            'status': 'error',
            'message': 'No autorizado. Por favor inicia sesión nuevamente.'
        }), 401
    
    @app.errorhandler(403)
    def forbidden_error(error):
        app.logger.error(f"❌ Forbidden (403): {str(error)}")
        return jsonify({
            'status': 'error',
            'message': 'No tienes permisos para realizar esta acción.'
        }), 403
    
    @app.errorhandler(404)
    def not_found_error(error):
        app.logger.error(f"❌ Not Found (404): {str(error)}")
        return jsonify({
            'status': 'error',
            'message': 'Recurso no encontrado.'
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed_error(error):
        app.logger.error(f"❌ Method Not Allowed (405): {str(error)}")
        return jsonify({
            'status': 'error',
            'message': 'Método no permitido para este recurso.'
        }), 405
    
    @app.errorhandler(422)
    def unprocessable_entity_error(error):
        app.logger.error(f"❌ Unprocessable Entity (422): {str(error)}")
        return jsonify({
            'status': 'error',
            'message': 'No se pudo procesar la solicitud. Datos no válidos.'
        }), 422
    
    @app.errorhandler(500)
    def internal_server_error(error):
        app.logger.error(f"❌ Internal Server Error (500): {str(error)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Error interno del servidor. Por favor intenta más tarde.'
        }), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        """
        Maneja todas las excepciones no capturadas.
        Registra el detalle completo en consola pero envía mensaje genérico al frontend.
        """
        app.logger.error(f"❌ Unhandled Exception: {str(error)}", exc_info=True)
        
        # Si es un error HTTP conocido, usar su código
        if hasattr(error, 'code') and error.code in [400, 401, 403, 404, 405, 422, 500]:
            return jsonify({
                'status': 'error',
                'message': 'Ha ocurrido un error. Por favor intenta nuevamente.'
            }), error.code
        
        # Para cualquier otra excepción, devolver 500
        return jsonify({
            'status': 'error',
            'message': 'Ha ocurrido un error inesperado. Por favor intenta más tarde.'
        }), 500
    
    # ========================================================================
    
    # Middleware para debug de headers (SIEMPRE activo durante desarrollo)
    @app.before_request
    def log_request_info():
        print(f"\n{'='*80}")
        print(f"🔍 REQUEST: {request.method} {request.path}")
        print(f"📋 Headers:")
        has_auth = False
        for key, value in request.headers:
            if key == 'Authorization':
                has_auth = True
                print(f"  ✅ {key}: {value[:60]}..." if len(value) > 60 else f"  ✅ {key}: {value}")
            elif key in ['Content-Type', 'Origin', 'Host']:
                print(f"  📄 {key}: {value}")
        if not has_auth:
            print(f"  ❌ No Authorization header found")
        print(f"{'='*80}\n")
    
    # Importar modelos para que Flask-Migrate los detecte
    with app.app_context():
        from . import models
    
    # Log de configuración en desarrollo
    if app.config.get("DEBUG"):
        print(f"🚀 Aplicación iniciada en modo: {os.getenv('NODE_ENV', 'development')}")
        print(f"📊 Base de datos: {app.config.get('SQLALCHEMY_DATABASE_URI')}")

    return app
