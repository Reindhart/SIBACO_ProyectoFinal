from .main import main_bp
from .auth import auth_bp
from .users import users_bp
from .patients import patients_bp
from .diagnoses import diagnoses_bp
from .diseases import diseases_bp


def register_blueprints(app):
    """Registra todos los blueprints de la aplicación"""
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(diagnoses_bp)
    app.register_blueprint(diseases_bp)
