from .main import main_bp
from .auth import auth_bp


def register_blueprints(app):
    """Registra todos los blueprints de la aplicación"""
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
